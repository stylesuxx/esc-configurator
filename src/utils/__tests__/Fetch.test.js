import {
  fetchJson,
  fetchJsonCached,
} from '../Fetch';

const jsonUrl = 'https://raw.githubusercontent.com/stylesuxx/esc-configurator/master/src/sources/Bluejay/escs.json';
const invalidUrl = 'https://raw.githubusercontent.com/stylesuxx/esc-configurator/master/src/sources/Bluejay/escs.invalid.json';

describe('fetchJson', () => {
  it('should handle valid URL', async () => {
    const json = await fetchJson(jsonUrl);

    expect(json).toHaveProperty('layouts');
  });

  it('should throw with invalid URL', async () => {
    await expect(() => fetchJson(invalidUrl)).rejects.toThrow();
  });
});

describe('fetchJsonCached', () => {
  it('should handle non cached URL', async () => {
    window.caches =  {
      open: () => ({
        match: (request, options) => null,
        put: (request, options) => {},
      }),
    };

    const json = await fetchJsonCached(jsonUrl);

    expect(json).toHaveProperty('layouts');
  });

  it('should handle previously cached URL', async () => {
    window.caches =  {
      open: () => ({
        match: (request, options) => {
          const headers = new window.Headers();
          headers.set('Time-Cached', Date.now() - 100);

          const response = new window.Response('{"layouts":{}}');
          response.headers = headers;

          return response;
        },
        put: (request, options) => {},
      }),
    };

    const json = await fetchJsonCached(jsonUrl, { maxAge: 1 });

    expect(json).toHaveProperty('layouts');
  });
});
