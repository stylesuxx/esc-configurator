import {
  ACK,
  COMMANDS,
} from '../FourWayConstants';

class FourWayHelper {
  /**
   * Convert a command number to its string representation.
   *
   * @param {number} command
   * @returns {(string|null)}
   */
  static commandToString(command) {
    for (const field in COMMANDS) {
      if (COMMANDS[field] === command) {
        return field;
      }
    }

    return null;
  }

  /**
   * Convert an ack number to its string representation.
   *
   * @param {number} ack
   * @returns {(string|null)}
   */
  static ackToString(ack) {
    for (const field in ACK) {
      if (ACK[field] === ack) {
        return field;
      }
    }

    return null;
  }
}

export default FourWayHelper;
