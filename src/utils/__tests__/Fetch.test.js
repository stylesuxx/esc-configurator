import fs from 'fs';
import {
  fetchHexCached,
  fetchJsonCached,
} from '../Fetch';

const hexFileUrl = 'https://github.com/mathiasvr/bluejay/releases/download/v0.16/S_H_50_24_v0.16.hex';
const hexContent = fs.readFileSync(`${__dirname}/../helpers/__tests__/valid.hex`).toString();
const jsonApiContent = [
  {
    name: 'name',
    tag_name: 'tag_name',
    prerelease: 'prerelease',
    published_at: 'published_at',
  },
];

const jsonApiUrl = 'https://api.github.com/repos/mathiasvr/bluejay/releases';
const jsonRawUrl = 'https://raw.githubusercontent.com/stylesuxx/esc-configurator/master/package.json';
const jsonInvalidUrl = 'https://raw.githubusercontent.com/stylesuxx/esc-configurator/master/crowdin.yml';
const json404Url = 'https://raw.githubusercontent.com/stylesuxx/esc-configurator/master/invalid.file';

const mockResponse = (type, content, status = 200) =>
  new window.Response(content, {
    status: 200,
    headers: {
      'Content-Type': type,
      'Time-Cached': Date.now().toString(),
    },
  });

const mockHexResponse = (content) => mockResponse('application/octet-stream', content);
const mockJsonResponse = (content) => mockResponse('application/json', content);
const mock404Response = () => mockResponse('application/json', '', 404);

describe('Fetch', () => {
  beforeEach(async() => {

    global.caches = {
      open: jest.fn().mockImplementationOnce(() =>
        new Promise((resolve) => {
          resolve({
            match: () => new Promise((resolve) => resolve(null)),
            put: (url, response) =>  new Promise((resolve) => resolve(null)),
          });
        })
      ),
    };
  });

  it('should fetch hex file from cache', async() => {
    global.caches = {
      open: jest.fn().mockImplementationOnce(() =>
        new Promise((resolve) => {
          resolve({ match: () => new Promise((resolve) => resolve(mockHexResponse(hexContent))) });
        })
      ),
    };

    const text = await fetchHexCached(hexFileUrl);

    expect(text).toEqual(hexContent);
  });

  it('should fetch hex file from url', async() => {
    global.fetch = jest.fn(() =>
      new Promise((resolve) => resolve(mockHexResponse(hexContent)))
    );

    const text = await fetchHexCached(hexFileUrl);

    expect(text).toEqual(hexContent);
  });

  it('should fetch JSON file from Cache', async() => {
    global.caches = {
      open: jest.fn().mockImplementationOnce(() =>
        new Promise((resolve) => {
          resolve({ match: () => new Promise((resolve) => resolve(mockJsonResponse('{}'))) });
        })
      ),
    };

    const json = await fetchJsonCached(jsonApiUrl);

    expect(json).toStrictEqual({});
  });

  it('should fetch JSON file via API', async() => {
    global.fetch = jest.fn(() =>
      new Promise((resolve) => resolve(mockJsonResponse(JSON.stringify(jsonApiContent))))
    );

    const json = await fetchJsonCached(jsonApiUrl);
    expect(json.length > 0).toBeTruthy();

    const object = json[0];
    expect(object).toHaveProperty('name', 'tag_name', 'prerelease', 'published_at');
  });

  it('should throw on unavailable JSON file', async() => {
    global.fetch = jest.fn(() =>
      new Promise((resolve) => resolve(mock404Response()))
    );

    await expect(() => fetchJsonCached(json404Url)).rejects.toThrow();
  });

  it('should throw if body is not json', async() => {
    global.fetch = jest.fn(() =>
      new Promise((resolve) => resolve(mockHexResponse(hexContent)))
    );

    await expect(() => fetchJsonCached(jsonInvalidUrl)).rejects.toThrow();
  });

  // This could only really be tested from within the browser
  /*
  it('should fetch JSON file via CORS Proxy', async() => {
    const json = await fetchJsonCached(jsonRawUrl);
    expect(json).toHaveProperty('name', 'version', 'license');
  });
  */
});
