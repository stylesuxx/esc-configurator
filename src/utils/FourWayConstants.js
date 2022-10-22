/**
 * This constants are being used during communication with the four way
 * interface.
 */

/**
 * Those commands are the commands that the booloader supoorts. This has to be
 * the same for every firmware, although the firmware might implement the
 * underlying functionality in whichever way it sees fit.
 */
const COMMANDS = {
  cmd_InterfaceTestAlive: 0x30,
  cmd_ProtocolGetVersion: 0x31,
  cmd_InterfaceGetName: 0x32,
  cmd_InterfaceGetVersion: 0x33,
  cmd_InterfaceExit: 0x34,
  cmd_DeviceReset: 0x35,
  cmd_DeviceInitFlash: 0x37,
  cmd_DeviceEraseAll: 0x38,
  cmd_DevicePageErase: 0x39,
  cmd_DeviceRead: 0x3a,
  cmd_DeviceWrite: 0x3b,
  cmd_DeviceC2CK_LOW: 0x3c,
  cmd_DeviceReadEEprom: 0x3d,
  cmd_DeviceWriteEEprom: 0x3e,
  cmd_InterfaceSetMode: 0x3f,
};

/**
 * Ack are confirmation messages returned by the bootloader after sending one of
 * the above commands.
 */
const ACK = {
  ACK_OK: 0x00,
  ACK_I_UNKNOWN_ERROR: 0x01,
  ACK_I_INVALID_CMD: 0x02,
  ACK_I_INVALID_CRC: 0x03,
  ACK_I_VERIFY_ERROR: 0x04,
  ACK_D_INVALID_COMMAND: 0x05,
  ACK_D_COMMAND_FAILED: 0x06,
  ACK_D_UNKNOWN_ERROR: 0x07,
  ACK_I_INVALID_CHANNEL: 0x08,
  ACK_I_INVALID_PARAM: 0x09,
  ACK_D_GENERAL_ERROR: 0x0f,
};

const MODES = {
  SiLC2: 0,
  SiLBLB: 1,
  AtmBLB: 2,
  AtmSK: 3,
  ARMBLB: 4,
};


const SILABS_MODES = [
  MODES.SiLC2,
  MODES.SiLBLB,
];

const ATMEL_MODES = [
  MODES.AtmBLB,
  MODES.AtmSK,
];

export {
  ACK,
  ATMEL_MODES,
  COMMANDS,
  MODES,
  SILABS_MODES,
};
