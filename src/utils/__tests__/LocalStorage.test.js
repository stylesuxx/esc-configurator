import {
  loadLanguage, loadSerialApi,
} from '../LocalStorage';

describe('LocalStorage', () => {

  it('should return default language', () => {
    const language = loadLanguage();

    expect(language).toEqual('en');
  });

  it('should return browser suggested language (from languages)', () => {
    jest.spyOn(navigator, 'languages', 'get').mockImplementation(() => ['it', 'en', 'de']);

    const language = loadLanguage();

    expect(language).toEqual('it');
  });

  it('should return browser suggested language (from language)', () => {
    jest.spyOn(navigator, 'language', 'get').mockImplementation(() => 'it');
    const language = loadLanguage();

    expect(language).toEqual('it');
  });

  it('should return default language (none stored)', () => {
    jest.spyOn(navigator, 'language', 'get').mockImplementation(() => null);
    jest.spyOn(navigator, 'languages', 'get').mockImplementation(() => null);

    const language = loadLanguage();

    expect(language).toEqual('en');
  });

  it('should return browser suggested language (prefixed)', () => {
    jest.spyOn(navigator, 'language', 'get').mockImplementation(() => 'it-it');

    const language = loadLanguage();

    expect(language).toEqual('it');
  });

  it('should return stored language', () => {
    Object.defineProperty(window, 'localStorage', { value: { getItem: () => 'de' } });

    const language = loadLanguage();

    expect(language).toEqual('de');
  });

  it('should load serial API', () => {
    navigator.serial = 'SERIAL_API';

    const api = loadSerialApi();

    expect(api).toEqual('SERIAL_API');
  });

  it('should load serial API (Polyfill)', () => {
    delete navigator.serial;
    navigator.usb = true;

    const api = loadSerialApi();

    expect(api).not.toBeNull();
  });

  it('should not load serial API on brave', () => {
    delete navigator.serial;
    navigator.usb = true;
    navigator.brave = true;

    const api = loadSerialApi();

    expect(api).toBeNull();
  });
});