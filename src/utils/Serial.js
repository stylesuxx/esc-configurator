import Msp from './Msp';
import FourWay from './FourWay';
import { QueueProcessor } from './helpers/QueueProcessor';
import { delay } from './helpers/General';
import { PortClosedError } from './Errors';
import {
  COMMANDS,
  MODES,
} from './FourWayConstants';

/**
 * Abstraction layer for all serial communication
 *
 * Serial commands are added to the QueueProcessor, meaning that this is our
 * only way for commands to be executed. They are executed in FIFO manner: the
 * first command in, is the first one to be processed.
 *
 * The queue Processor is agnostic of the current protocol, not matter if it is
 * a MSP, 4-Way interface or completyly custom command, they all go through
 * this queue.
 *
 * This ensures that no race conditions can happen during serial communication.
 * No command will be written until the previous one is finished processing.
 */
class Serial {
  /**
   * Wrapper for serial communication via MSP and Four Way interface.
   *
   * @param {SerialPort} port
   */
  constructor(port) {
    this.port = port;
    this.serial = port;
    this.baudRate = 115200;
    this.msp = null;
    this.fourWay = null;
    this.detectedESCs = null;
    this.isDirect4Way = false;
    this.writer = null;
    this.reader = null;

    this.executeCommand = this.executeCommand.bind(this);
    this.getUtilization = this.getUtilization.bind(this);

    this.logCallback = null;

    this.qp = new QueueProcessor();

    this.sent = 0;
    this.sentTotal = 0;
    this.received = 0;
    this.receivedTotal = 0;
  }

  /**
   * Setter for log callback - sets log callback on both, MSP and Four Way
   * interface
   *
   * @param {function} logCallback
   */
  setLogCallback(logCallback) {
    this.logCallback = logCallback;

    if (this.fourWay) {
      this.fourWay.setLogCallback(logCallback);
    }

    if (this.msp) {
      this.msp.setLogCallback(logCallback);
    }
  }

  /**
   * Send a buffer via serial and process response with the response handler
   *
   * @param {ArrayBuffer} buffer
   * @param {function} responseHandler
   * @returns {Promise}
   */
  async executeCommand(buffer, responseHandler) {
    const sendHandler = async function() {
      await this.writeBuffer(buffer);
    }.bind(this);

    return this.qp.addCommand(sendHandler, responseHandler);
  }

  /**
   * Write a buffer
   *
   * Throws a PortClosedError once the writer is gone, for example after the
   * device was unplugged.
   *
   * @param {ArrayBuffer} buffer
   */
  async writeBuffer(buffer) {
    if(!this.writer) {
      throw new PortClosedError('Serial port is closed');
    }

    this.sent += buffer.byteLength;
    await this.writer.write(buffer);
  }

  /**
   * Invoke the serial reader. As soon as data becomes available it is beeing
   * pushed to the queue processor which does the actual processing.
   */
  async startReader() {
    while(this.running) {
      try {
        const { value } = await this.reader.read();

        /* istanbul ignore next */
        if(value) {
          this.received += value.byteLength;
          this.qp.addData(value);
        }
      } catch(e) {
        console.debug('Reader failed', e);
        return;
      }
    }
  }

  /**
   * @typeof Utilization
   * @property {number} up
   * @property {number} down
   */

  /**
   * Get utilization of the serial port
   *
   * @returns {Utilization}
   */
  getUtilization() {
    const up = Math.round((this.sent * 10 / this.baudRate) * 100);
    const down = Math.round((this.received * 10 / this.baudRate) * 100);

    this.sentTotal += this.sent;
    this.receivedTotal += this.received;

    this.sent = 0;
    this.received = 0;

    return {
      up,
      down,
    };
  }

  /**
   * Attempt to open connection to the serial port and start reading as soon as
   * the connection is successful.
   *
   * @param {number} baudRate
   */
  async open(baudRate = 115200) {
    this.baudRate = baudRate;
    this.isDirect4Way = false;

    try {
      await this.port.open({ baudRate });
      this.writer = await this.port.writable.getWriter();
      this.reader = await this.port.readable.getReader();
    } catch(e) {
      console.debug('Could not open serial port');
      throw new Error('Could not open serial port');
    }

    this.msp = new Msp(this.executeCommand);
    this.fourWay = new FourWay(this.executeCommand);

    this.running = true;
    this.startReader();
  }

  /**
   * Open a direct 4-way interface connection to an Arduino bridge (no FC).
   * Baud rate is locked to 38400 per BLHeli Suite 4w-if spec.
   * Interface mode is locked to SiLBLB.
   */
  async openDirect() {
    const baudRate = 38400;
    this.baudRate = baudRate;

    try {
      await this.port.open({ baudRate });
      this.writer = await this.port.writable.getWriter();
      this.reader = await this.port.readable.getReader();
    } catch (e) {
      console.debug('[4WAY-DEBUG] Could not open serial port');
      throw new Error('Could not open serial port');
    }

    this.fourWay = new FourWay(this.executeCommand);

    this.running = true;
    this.startReader();

    // Arduino auto-resets when the serial port opens - wait for it to boot
    // before sending any 4w-if commands.
    await delay(1500);

    // Step 1: Send 4 x 0xFF handshake (per BLHeli Suite 4w-if spec)
    await this.sendHandshake();

    // Step 2: cmd_InterfaceTestAlive (0x30) - per BLHeli Suite startup sequence
    try {
      await this.fourWay.sendMessagePromised(COMMANDS.cmd_InterfaceTestAlive);
    } catch (e) {
      console.debug('[4WAY-DEBUG] cmd_InterfaceTestAlive failed:', e.message);
    }

    // Step 3: cmd_InterfaceGetProtocolVersion (0x31) - per BLHeli Suite startup sequence
    try {
      await this.fourWay.sendMessagePromised(COMMANDS.cmd_ProtocolGetVersion);
    } catch (e) {
      console.debug('[4WAY-DEBUG] cmd_InterfaceGetProtocolVersion failed:', e.message);
    }

    // Step 4: cmd_InterfaceGetName (0x32) - per BLHeli Suite startup sequence
    try {
      await this.fourWay.sendMessagePromised(COMMANDS.cmd_InterfaceGetName);
    } catch (e) {
      console.debug('[4WAY-DEBUG] cmd_InterfaceGetName failed:', e.message);
    }

    // Step 5: cmd_InterfaceGetVersion (0x33) - per BLHeli Suite startup sequence
    try {
      await this.fourWay.sendMessagePromised(COMMANDS.cmd_InterfaceGetVersion);
    } catch (e) {
      console.debug('[4WAY-DEBUG] cmd_InterfaceGetVersion failed:', e.message);
    }

    // Step 6: Set interface mode to SiLBLB - per BLHeli Suite startup sequence
    try {
      await this.fourWay.sendMessagePromised(COMMANDS.cmd_InterfaceSetMode, [
        MODES.SiLBLB,
      ]);
    } catch (e) {
      console.debug('[4WAY-DEBUG] cmd_InterfaceSetMode failed:', e.message);
    }

    // Step 7: Do NOT auto-scan ESC channels here - the Arduino 4w-if firmware
    // responds to cmd_DeviceInitFlash on all channels even without ESCs connected.
    // ESC detection is done in handleReadEscs() by reading settings per channel.
    this.detectedESCs = null;
  }

  /**
   * Send the 4w-if startup handshake (4 x 0xFF bytes) to detect connection
   * type and set the interface to listen state.
   */
  async sendHandshake() {
    const handshake = new Uint8Array([0xff, 0xff, 0xff, 0xff]);
    await this.writeBuffer(handshake.buffer);
  }

  /**
   * Stop reader and writer, attempt closing four way connection should it be
   * available. Never throws - all errors are swallowed so cleanup always
   * completes.
   */
  async disconnect() {
    this.running = false;
    this.reader = null;
    this.writer = null;

    if(this.fourWay) {
      try {
        await this.fourWay.exit();
      } catch (e) {
        console.debug('Four way exit failed during disconnect:', e.message);
      }
    }
  }

  /**
   * Force-release the serial port without throwing. Use this before opening
   * a new connection to make sure nothing is left locked.
   */
  async forceRelease() {
    this.running = false;

    if(this.reader) {
      try { this.reader.cancel(); } catch(e) { console.debug(e); }
      try { await this.reader.releaseLock(); } catch(e) { console.debug(e); }
      this.reader = null;
    }

    if(this.writer) {
      try { await this.writer.releaseLock(); } catch(e) { console.debug(e); }
      this.writer = null;
    }

    if(this.port) {
      try { await this.port.close(); } catch(e) { console.debug(e); }
    }

    this.fourWay = null;
    this.msp = null;
  }

  /**
   * Attmept to cleanly close the serial connection
   */
  async close() {
    this.running = false;

    // Attempt to stop motors
    if(this.msp) {
      try {
        await this.stopAllMotors();
      } catch(e) {
        console.debug(e);
      }
    }

    await this.disconnect();

    try {
      await this.port.close();
    } catch(e) {
      // we tried...
    }
  }

  /**
   * MSP commands - see the respective class for in depth documentation of the
   * functions.
   */
  enable4WayInterface = () => this.msp.set4WayIf();
  getApiVersion = () => this.msp.getApiVersion();
  getBatteryState = () => this.msp.getBatteryState();
  getBoardInfo = () => this.msp.getBoardInfo();
  getBuildInfo = () => this.msp.getBuildInfo();
  getFcVariant = () => this.msp.getFcVariant();
  getFcVersion = () => this.msp.getFcVersion();
  getFeatures = () => this.msp.getFeatures();
  getMotorData = () => this.msp.getMotorData();
  getStatus = () => this.msp.getStatus();
  getUid = () => this.msp.getUid();
  spinAllMotors = (speed) => this.msp.spinAllMotors(speed);
  spinMotor = (index, speed) => this.msp.spinMotor(index, speed);
  stopAllMotors = () => this.msp.stopAllMotors();

  /**
   * Four Way interface - see the respective class for in depth documentation of
   * the functions.
   */
  exitFourWayInterface = () => this.fourWay.exit();
  flashPreflight = (esc, hex, force, i) => this.fourWay.flashPreflight(esc, hex, force, i);
  getFourWayInterfaceInfo = (esc) => this.fourWay.getInfo(esc);
  resetFourWayInterface = (esc) => this.fourWay.reset(esc);
  startFourWayInterface = () => this.fourWay.start();
  writeHex = (index, esc, hex, force, migration, cbProgress) => this.fourWay.writeHex(index, esc, hex, force, migration, cbProgress);
  readAddress = (address, bytes, retries = 3) => this.fourWay.read(address, bytes, retries);
  readFirmware = (index, esc, cbProgress) => this.fourWay.readFirmware(index, esc, cbProgress);
  writeSettings = (index, esc, settings) => this.fourWay.writeSettings(index, esc, settings);
}

export default Serial;
