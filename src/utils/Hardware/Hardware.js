/**
 * Abstract Base Class for Hardware manufacturer
 */
class Hardware {
  static getMcus() {
    return Object.values(this.mcus);
  }

  static getMcu(signature) {
    const hexString = signature.toString(16).toUpperCase();
    return this.mcus[hexString];
  }
}

export default Hardware;
