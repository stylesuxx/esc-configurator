import FourWayHelper from '../FourWay';

describe('FourWayHelper', () => {
  it('should handle invalid command', async() => {
    const string = FourWayHelper.commandToString(0xDEADBEEF);
    expect(string).toBeNull();
  });

  it('should convert valid command', async() => {
    let string = FourWayHelper.commandToString(0x30);
    expect(string).toBe("cmd_InterfaceTestAlive");

    string = FourWayHelper.commandToString(0x3f);
    expect(string).toBe("cmd_InterfaceSetMode");
  });

  it('should handle invalid ack', async() => {
    const string = FourWayHelper.ackToString(0xDEADBEEF);
    expect(string).toBeNull();
  });

  it('should convert valid ack', async() => {
    let string = FourWayHelper.ackToString(0x00);
    expect(string).toBe("ACK_OK");

    string = FourWayHelper.ackToString(0x0f);
    expect(string).toBe("ACK_D_GENERAL_ERROR");
  });
});