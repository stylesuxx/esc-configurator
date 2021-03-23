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

    this.timeout = null;
    this.quit = false;
  }

  appendBuffer(buffer1, buffer2) {
    const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);

    return tmp;
  }

  /**
   * New incoming data is added to the buffer and the command processor is
   * triggered.
   */
  addData(buffer) {
    this.buffer = this.appendBuffer(this.buffer, buffer.buffer);
    this.newData = true;

    this.processCommands();
  }

  /**
   * Timeout reached, reject the command, clear the buffer and reset states
   */
  resolveTimeout() {
    const command = this.commands.shift();
    this.buffer = new Uint8Array([]);
    this.newData = false;
    this.timeout = null;
    this.quit = false;

    const error = `Timed out after ${command.timeout}ms`;
    command.rejectCallback(new TimeoutError(error));
  }

  /**
   * Processes the command queue while new data and commands are present.
   */
  async processCommands() {
    while(this.newData && !this.processing && this.commands.length > 0) {
      this.processing = true;
      this.newData = false;

      // Empty the current buffer
      const currentBuffer = this.buffer;
      this.buffer = new Uint8Array();
      const command = this.commands[0];

      /**
       * If a timeout is not yet active, set it.
       */
      const timeout = command.timeout;
      if(!this.timeout) {
        this.timeout = setTimeout(() => {
          /*
           * If we are not currently processing, we can Immediately handle the
           * timeout. Ohterwise we mark the command to be quit and it will
           * timout after processing is done, in case not enough data was
           * available.
           */
          if(!this.processing) {
            this.resolveTimeout();
          }

          this.quit = true;
        }, timeout);
      }

      /**
       * Get the first command int he pipe and start processing it - this can
       * have three outcomes:
       * resolve: The resolve Callback is called and we are done.
       * reject:  - NotEnoughDataError: We neiter resolve nor reject,  just
       *            wait for more data to come in - the command is kept in
       *            the pipe for the next invokation.
       *          - Any other error: we reject passing on the error from the
       *            command.
       */
      const promise = new Promise((resolve, reject) => {
        command.command(currentBuffer, resolve, reject);
      });

      try {
        const result = await promise;

        /**
         * At this point we are done - the command can be removed from the
         * command can be remove from the queue and the promise can be
         * resolved.
         */
        clearTimeout(this.timeout);
        this.timeout = null;
        this.commands.shift();
        this.quit = false;
        this.processing = false;

        return command.resolveCallback(result);
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
          return;
        } else {
          /**
           * The command failed on its own terms - not for lack of data.
           * Remove it from the queue.
           */
          clearTimeout(this.timeout);
          this.timeout = null;
          this.commands.shift();
          this.quit = false;
          this.processing = false;
          this.buffer = new Uint8Array([]);
          this.newData = false;

          return command.rejectCallback(e);
        }
      }

      this.processing = false;
    }
  }

  /**
   * Add a command to the queue and return a promise.
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
   */
  addCommand(command, timeout = 1000) {
    return new Promise((resolve, reject) => {
      const resolveCallback = (result) => resolve(result);
      const rejectCallback = (error) => reject(error);

      const newCommand = {
        command,
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
