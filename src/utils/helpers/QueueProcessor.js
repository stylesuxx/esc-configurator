class NotEnoughDataError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotEnoughDataError';
  }
}

class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TimeoutError';
  }
}

class QueueProcessor {
  constructor() {
    this.buffer = new Uint8Array([]);
    this.commands = [];
    this.newData = false;
    this.processing = false;
    this.quit = false;
    this.currentCommand = null;
  }

  /**
   * Append one buffer to another on
   *
   * @param {Uint8Array} buffer1
   * @param {Uint8Array} buffer2
   * @returns {Uint8Array}
   */
  appendBuffer(buffer1, buffer2) {
    const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);

    return tmp;
  }

  /**
   * Append new incoming data to the buffer and trigger the command processor
   *
   * @param {Uint8Array} buffer
   */
  addData(buffer) {
    this.buffer = this.appendBuffer(this.buffer, buffer.buffer);
    this.newData = true;

    this.processCommands();
  }

  /**
   * Reset instance to inital state
   */
  cleanUp() {
    this.buffer = new Uint8Array([]);
    this.newData = false;
    this.quit = false;
    this.processing = false;
    this.currentCommand = null;
  }

  /**
   * Resolve timeout by rejecting the command, clearing the buffer and
   * resetetting thestates
   */
  resolveTimeout() {
    const error = `Timed out after ${this.currentCommand.timeout}ms`;
    this.currentCommand.rejectCallback(new TimeoutError(error));

    this.cleanUp();
    this.processCommands();
  }

  /**
   * Start processing the commands
   */
  async startCommand() {
    this.cleanUp();
    const command = this.commands.shift();
    this.currentCommand = command;
    const timeout = command.timeout;

    /**
     * The timeout starts when the command is sent, transmission included: a
     * write that never completes (for example the flight controller no longer
     * reading) must not block this command, and the whole queue, forever.
     */
    command.timeoutFunct = setTimeout(() => {
      // The command has already been handled
      if(this.currentCommand !== command) {
        return;
      }

      /*
       * If we are not currently processing, we can Immediately handle the
       * timeout. Ohterwise we mark the command to be quit and it will
       * timout after processing is done, in case not enough data was
       * available.
       */
      if(!this.processing) {
        this.resolveTimeout();
      } else {
        this.quit = true;
      }
    }, timeout);

    try {
      await command.transmit();
    } catch(e) {
      clearTimeout(command.timeoutFunct);

      // Already timed out while transmitting
      if(this.currentCommand !== command) {
        return;
      }

      /**
       * Transmitting failed - this is not something we can recover from, so we
       * reject the command and carry on with the queue. Without this the
       * promise returned by addCommand would never settle and the caller would
       * wait forever.
       */
      this.cleanUp();
      command.rejectCallback(e);
      this.processCommands();

      return;
    }

    // if there is no receive handler, just return. There is only one case in
    // which no receive handler is needed and this is when no data is expected
    // to be sent back. The command might also already have resolved or timed
    // out.
    if(this.currentCommand === command && !command.receive) {
      clearTimeout(command.timeoutFunct);
      command.resolveCallback(true);
      this.cleanUp();
      this.processCommands();
    }
  }


  /**
   * Process the queue if it is not yet processing but new data is available
   */
  async processCommand() {
    while(!this.processing && this.newData) {
      this.processing = true;

      // this.currentCommand available or just set
      const currentBuffer = this.buffer;
      this.buffer = new Uint8Array();
      this.newData = false;

      const promise = new Promise((resolve, reject) => {
        this.currentCommand.receive(currentBuffer, resolve, reject);
      });

      try {
        const result = await promise;

        clearTimeout(this.currentCommand.timeoutFunct);
        this.currentCommand.resolveCallback(result);

        this.currentCommand = null;
        this.quit = false;
        this.processing = false;

        this.processCommands();
      } catch(e) {
        if(e instanceof NotEnoughDataError) {
          /**
           * We don't have enough data yet, we put it back on the buffer and
           * do nothing.
           */
          this.buffer = this.appendBuffer(currentBuffer, this.buffer);
          this.processing = false;

          // Timeout was triggered while we aere processing, in this case we
          // quit now.
          if(this.quit) {
            this.resolveTimeout();
          }
        } else {
          /**
           * The command failed on its own terms - not for lack of data.
           * Remove it from the queue.
           */
          clearTimeout(this.currentCommand.timeoutFunct);
          this.currentCommand.rejectCallback(e);

          this.cleanUp();
          this.processCommands();
        }
      }

      this.processing = false;
    }
  }

  /**
   * Processes the command queue while new data and commands are present.
   */
  async processCommands() {
    // If there is no current command, we are definetly not processing
    if(!this.currentCommand && this.commands.length > 0) {
      await this.startCommand();
    }

    // Process the current commannd
    if(this.currentCommand && this.currentCommand.receive) {
      await this.processCommand();
    }
  }

  /**
   * Add a command to the queue and return a promise
   *
   * The promise is resolved once all the data is available and could be
   * processed.
   *
   * It is rejected when a timeout is received or the actual command fails.
   *
   * the command is a function that takes three parameters:
   * buffer:  The buffer the function will run on
   * resolve: Should be triggered by the function once it internally resolves
   * reject:  Should be triggered by the function once it rejects. There is one
   *          special case of rejection - not enough data. In this case the
   *          accoring error should be thrown
   *
   * @param {function} transmit
   * @param {function} receive
   * @param {number} timeout
   * @returns {Promise}
   */
  addCommand(transmit, receive = null, timeout = 1000) {
    return new Promise((resolve, reject) => {
      const resolveCallback = (result) => resolve(result);
      const rejectCallback = (error) => reject(error);

      const newCommand = {
        transmit,
        receive,
        timeout,
        resolveCallback,
        rejectCallback,
      };

      this.commands.push(newCommand);
      this.processCommands();
    });
  }
}

export {
  NotEnoughDataError,
  TimeoutError,
  QueueProcessor,
};
