/**
 * Abstract Base Class for Hardware manufacturer
 *
 * Hardware is supposed to only contain minimal infomration requried to interact
 * with this hardware and should be as firmware agnostic as possible. Firmware
 * relevant things should be handled in the source classes for the corresponding
 * firmware.
 *
 * One exception are settings that are handled the same way, for example if they
 * share the same bootloader and thus might have overlap in that regard.
 */
class Hardware {
  /**
   * Return a list of supported MCUs
   *
   * @returns {Array<Object>}
   */
  static getMcus() {
    return Object.values(this.mcus);
  }

  /**
   * Get an MCU by it's signature
   *
   * @param {number} signature
   * @returns {object}
   */
  static getMcu(signature) {
    const hexString = signature.toString(16).toUpperCase();
    return this.mcus[hexString];
  }
}

export default Hardware;
