class MockedContext {
  constructor(contextClose, oscStart, oscStop, oscClose) {
    this.close = contextClose;

    this.createOscillator = () => new MockedOscillator(oscStart, oscStop, oscClose);
  }

  createGain() {
    return({
      gain: { value: 1 },
      connect: () => ({}),
      disconnect: () => ({}),
    });
  }
}

class MockedContextOnended extends MockedContext {
  constructor(contextClose, oscStart, oscStop, oscClose) {
    super();
    this.close = contextClose;

    this.createOscillator = () => new MockedOscillatorOnended(oscStart, oscStop, oscClose);
  }
}

class MockedOscillator {
  constructor(start, stop, close) {
    this.mockedStart = start;
    this.mockedStop = stop;
    this.mockedClose = close;

    this.frequency = { setValueAtTime: () => ({}) };
  }

  async close() {
    this.mockedClose();
  }

  connect() {}

  onended() {}

  start () {
    this.mockedStart();
  }

  stop() {
    this.mockedStop();
  }
}

class MockedOscillatorOnended extends MockedOscillator {
  stop() {
    this.onended();
    this.mockedStop();
  }
}

export {
  MockedContext,
  MockedContextOnended,
};
