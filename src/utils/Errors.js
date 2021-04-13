class TooManyParametersError extends Error {
  constructor(params) {
    super(`4way interface supports maximum of 256 params. ${params} passed`);
    this.params = params;
    this.name = 'TooManyParametersError';
  }
}

class UnknownPlatformError extends Error {
  constructor(platform) {
    super(`Unknown platform: ${platform}`);
    this.platform = platform;
    this.name = 'UnknownPlatformError';
  }
}

class BufferLengthMismatchError extends Error {
  constructor(buffer1, buffer2) {
    super(`byteLength of buffers do not match ${buffer1} vs. ${buffer2}`);
    this.buffer1 = buffer1;
    this.buffer2 = buffer2;
    this.name = 'BufferLengthMismatchError';
  }
}

class SettingsVerificationError extends Error {
  constructor(settingsWritten, settingsRead) {
    super('Failed to verify settings');
    this.settingsWritten = settingsWritten;
    this.settingsRead = settingsRead;
    this.name = 'SettingsVerificationError';
  }
}

class UnknownInterfaceError extends Error {
  constructor(interfaceMode) {
    super(`unknown interface: ${interfaceMode}`);
    this.interface = interfaceMode;
    this.name = 'UnknownInterfaceError';
  }
}

class InvalidHexFileError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidHexFileError';
  }
}

class EscInitError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EscInitError';
  }
}

export {
  BufferLengthMismatchError,
  EscInitError,
  InvalidHexFileError,
  SettingsVerificationError,
  TooManyParametersError,
  UnknownInterfaceError,
  UnknownPlatformError,
};
