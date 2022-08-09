import {
  clearLog,
  loadCookie,
  loadLanguage,
  loadLog,
  loadMelodies,
  loadSerialApi,
} from '../LocalStorage';

jest.mock('i18next', () => ({ changeLanguage: jest.fn() }));

describe('LocalStorage', () => {
  it('should allow to clear log', () => {
    localStorage.setItem('log', 'foobar');
    expect(localStorage.getItem('log')).toEqual('foobar');

    clearLog();
    expect(localStorage.getItem('log')).toEqual('[]');
  });

  it('should return empty log if it has not been set', () => {
    expect(loadLog().length).toEqual(0);
  });

  it('should return saved log', () => {
    const log = [
      'item1',
      'item2',
      'item3',
    ];
    localStorage.setItem('log', JSON.stringify(log));
    expect(loadLog().length).toEqual(3);
  });

  it('should handle cookie flag', () => {
    expect(loadCookie()).toBeFalsy();
  });

  it('should handle loading melodies', () => {
    expect(loadMelodies().length).toEqual(0);

    const melodies = [
      'item1',
      'item2',
      'item3',
    ];

    localStorage.setItem('melodies', JSON.stringify(melodies));
    expect(loadMelodies().length).toEqual(3);
  });

  it('should handle default language', () => {
    expect(loadLanguage()).toEqual('en');
  });

  it('should handle stored language', () => {
    localStorage.setItem('language', 'de');
    expect(loadLanguage()).toEqual('de');

    localStorage.removeItem('language');
  });

  it('should handle loading language', () => {
    expect(loadLanguage()).toEqual('en');

    Object.defineProperty(navigator, 'languages', {
      configurable: true,
      get: () => ['en'],
    });

    expect(loadLanguage()).toEqual('en');
  });

  it('should handle no language', () => {
    Object.defineProperty(navigator, 'languages', {
      configurable: true,
      get: () => [],
    });

    delete navigator.language;
    Object.defineProperty(navigator, 'language', {
      configurable: true,
      get: () => null,
    });

    Object.defineProperty(navigator, 'userLanguage', {
      configurable: true,
      get: () => null,
    });

    delete navigator.userLanguage;

    expect(loadLanguage()).toEqual('en');
  });

  it('should return null if no serial API is found', () => {
    expect(loadSerialApi()).toEqual(null);
  });

  it('should return serial API if available in navigator object', () => {
    Object.defineProperty(navigator, 'serial', {
      configurable: true,
      get: () => 'serial',
    });
    expect(loadSerialApi()).toEqual('serial');

    delete navigator.serial;
  });

  it('should return serial API polyfill', () => {
    Object.defineProperty(navigator, 'usb', {
      configurable: true,
      get: () => 'usb',
    });
    expect(loadSerialApi()).toEqual({});

    delete navigator.usb;
  });

  it('should return handle Brave Browser', () => {
    Object.defineProperty(navigator, 'usb', {
      configurable: true,
      get: () => 'usb',
    });
    Object.defineProperty(navigator, 'brave', {
      configurable: true,
      get: () => true,
    });
    expect(loadSerialApi()).toEqual(null);

    delete navigator.usb;
    delete navigator.brave;
  });
});
