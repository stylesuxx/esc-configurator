import MSP from './Msp';
import FourWay from './FourWay';

/**
 * Abstraction layer for all serial communication
 */
class Serial {
  constructor(port) {
    this.port = port;
    this.msp = null;
    this.fourWay = null;
    this.writer = null;
    this.reader = null;

    this.write = this.write.bind(this);
    this.read = this.read.bind(this);
    this.logCallback = null;
  }

  setLogCallback(logCallback) {
    this.logCallback = logCallback;

    this.fourWay.setLogCallback(logCallback);
  }

  async getApiVersion() {
    return this.msp.getApiVersion();
  }

  async getFcVariant() {
    return this.msp.getFcVariant();
  }

  async getFcVersion() {
    return this.msp.getFcVersion();
  }

  async getBuildInfo() {
    return this.msp.getBuildInfo();
  }

  async getBoardInfo() {
    return this.msp.getBoardInfo();
  }

  async getUid() {
    return this.msp.getUid();
  }

  async enable4WayInterface() {
    return this.msp.set4WayIf();
  }

  async fourWayWriteSettings(index, esc, settings) {
    return this.fourWay.writeSettings(index, esc, settings);
  }

  async fourWayWriteHex(index, esc, hex, cbProgress) {
    return this.fourWay.writeHex(index, esc, hex, cbProgress);
  }

  async fourWayStart() {
    this.fourWay.start();
  }

  async fourWayExit() {
    return this.fourWay.exit();
  }

  async fourWayReset(esc) {
    return this.fourWay.reset(esc);
  }

  async fourWayTestAlive() {
    return this.fourWay.testAlive();
  }

  async fourWayReadEEprom(address, bytes) {
    return this.fourWay.readEEprom(
      address,
      bytes
    );
  }

  async fourWayInitFlash(esc) {
    return this.fourWay.initFlash(esc);
  }

  async fourWayGetInfo(esc) {
    return this.fourWay.getInfo(esc);
  }

  async write(buffer) {
    await this.writer.write(buffer);
  }

  async read() {
    const process = async(resolve, reject) => {
      try {
        if (this.port.readable) {
          const reader = await this.port.readable.getReader();
          const { value } = await reader.read();
          await reader.cancel();
          await reader.releaseLock();
          resolve(value);
        }
      } catch (e) {
        reject(e);
      }
    };

    return new Promise((resolve, reject) => process(resolve, reject));
  }

  async open(baudRate) {
    await this.port.open({ baudRate });

    try {
      this.writer = await this.port.writable.getWriter();
      //this.reader = await this.port.readable.getReader();
    } catch(e) {
      console.debug('Port not read or writable');
      throw new Error('Port not read or writable');
    }

    this.msp = new MSP(this.port, this.write, this.read);
    this.fourWay = new FourWay(this.port, this.write, this.read);
    // this.msp = new MSP(this.write, this.write, this.read);
    // this.fourWay = new FourWay(this.port, this.write, this.read);
  }

  async close() {
    if(this.fourWay) {
      await this.fourWay.exit();
    }

    if(this.port) {
      try {
        if(this.reader) {
          await this.reader.cancel();
          await this.reader.releaseLock();
        }

        if(this.writer) {
          await this.writer.releaseLock();
        }

        await this.port.close();
      } catch(e) {
        console.log(e);
      }
    }
  }
}

export default Serial;
