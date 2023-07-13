import {
  BufferLengthMismatchError,
  EscInitError,
  EscLockedError,
  InvalidHexFileError,
  LayoutMismatchError,
  SettingsVerificationError,
  TooManyParametersError,
  UnknownInterfaceError,
  UnknownPlatformError,
} from '../Errors';

describe('Errors', () => {
  test('should be instance of Error', () => {
    let error = new BufferLengthMismatchError(10, 20);
    expect(error instanceof Error).toBeTruthy();
    expect(error.message).toEqual('byteLength of buffers do not match 10 vs. 20');

    error = new EscInitError();
    expect(error instanceof Error).toBeTruthy();
    expect(error.message).toEqual('');

    error = new InvalidHexFileError();
    expect(error instanceof Error).toBeTruthy();
    expect(error.message).toEqual('');

    error = new SettingsVerificationError();
    expect(error instanceof Error).toBeTruthy();
    expect(error.message).toEqual('Failed to verify settings');

    error = new TooManyParametersError(300);
    expect(error instanceof Error).toBeTruthy();
    expect(error.message).toEqual('4way interface supports maximum of 256 params. 300 passed');

    error = new UnknownInterfaceError('interface');
    expect(error instanceof Error).toBeTruthy();
    expect(error.message).toEqual('unknown interface: interface');

    error = new UnknownPlatformError('platform');
    expect(error instanceof Error).toBeTruthy();
    expect(error.message).toEqual('Unknown platform: platform');

    error = new EscLockedError(0xDEAD);
    expect(error instanceof Error).toBeTruthy();
    expect(error.message).toEqual('ESC is locked (57005)');

    error = new LayoutMismatchError('expected', 'received');
    expect(error instanceof Error).toBeTruthy();
    expect(error.message).toEqual('Expected layout: \'expected\', got: \'received\'');
  });
});
