import Settings from '../settings.json';

const { corsProxy } = Settings;

const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_YEAR = ONE_DAY * 365;

/**
 * Fetch URL via CORS proxy
 *
 * @param {string} url
 * @returns {Promise}
 */
async function fetchProxy(url) {
  return fetch(`${corsProxy}${url}`);
}

/**
 * Github is blocked in some regions - like for example China.
 * We first attempt to fetch from from the public API, if the response is not
 * OK, we try to fetch again via CORS proxy.
 *
 * We can not fetch everything via CORS proxy by default because we might then
 * get rate limited.
 *
 * @param {string} url
 * @returns {Response}
 */
async function fetchResponse(url) {
  let response = await fetch(url);
  if(!response.ok) {
    response = await fetchProxy(url);

    if(!response.ok) {
      throw new Error(response.statusText);
    }
  }

  return response;
}

/**
 * Fetch JSON from URL and cache on success
 *
 * @param {Cache} cache
 * @param {string} url
 * @returns {Response}
 */
async function fetchAndCacheJsonResponse(cache, url) {
  const response = await fetchResponse(url);

  /**
   * If the response does not contain JSON, the next statement will throw and
   * not be cached
   */
  await response.clone().json();

  const clonedResponse = cloneResponse(response);
  cache.put(url, clonedResponse);

  return response;
}

/**
 * Clone a response
 *
 * @param {Response} response
 * @returns {Response}
 */
function cloneResponse(response) {
  const clonedResponse = response.clone();

  const newHeaders = new window.Headers(response.headers);
  newHeaders.set('Time-Cached', Date.now().toString());
  const newResponse = new window.Response(clonedResponse.body, { headers: newHeaders });

  return newResponse;
}

/**
 * Fetch a hex file and cache on success
 *
 * @param {Cache} cache
 * @param {string} url
 * @returns {Response}
 */
async function fetchAndCacheHexResponse(cache, url) {
  const response = await fetchProxy(url);

  if(!response.ok) {
    throw new Error(response.statusText);
  }

  const clonedResponse = cloneResponse(response);
  cache.put(url, clonedResponse);

  return response;
}

/**
 * Check if a response should be re-fetched based on max age
 *
 * @param {Response} response
 * @param {number} maxAge
 * @returns {boolean}
 */
function shouldFetch(response, maxAge) {
  const now = Date.now();
  const timeCached = parseInt(response.headers.get('Time-Cached'), 10);
  return (now - timeCached) > maxAge;
}

/**
 * Returns JSON and caches it if necessary
 *
 * If no cached version is available yet, a response is fetched and cached for
 * the future.
 *
 * If a cached version is available it will be returned and a new one will be
 * fetched in case the currently served one is already older than max age.
 *
 * @param {string} url
 * @param {number} maxAge
 * @returns {object}
 */
async function fetchJsonCached(url, skip = false, maxAge = ONE_DAY) {
  const cache = await window.caches.open('v1');
  let cachedResponse = await cache.match(url);

  if (!cachedResponse || !cachedResponse.ok || skip) {
    // Fetch response and cache it
    cachedResponse = await fetchAndCacheJsonResponse(cache, url);
  } else if (shouldFetch(cachedResponse, maxAge)) {
    // Fetch new version and cache it for next time,
    // but return old response now to save time
    fetchAndCacheJsonResponse(cache, url);
  }

  return cachedResponse.json();
}

/**
 * Returns Hex and caches it if necessary - Hex files do not change after
 * initial build, so they can be cached for a long time without side-effects.
 *
 * If no cached version is available yet, a response is fetched and cached for
 * the future.
 *
 * If a cached version is available it will be returned and a new one will be
 * fetched in case the currently served one is already older than max age.
 *
 * @param {string} url
 * @param {number} maxAge
 * @returns {object}
 */
async function fetchHexCached(url, maxAge = ONE_YEAR) {
  const cache = await window.caches.open('hex');
  let cachedResponse = await cache.match(url);

  if (!cachedResponse || !cachedResponse.ok) {
    // Fetch response and cache it
    cachedResponse = await fetchAndCacheHexResponse(cache, url);
  } else if (shouldFetch(cachedResponse, maxAge)) {
    // Fetch new version and cache it for next time,
    // but return old response now to save time
    fetchAndCacheHexResponse(cache, url);
  }

  return cachedResponse.text();
}

export {
  fetchJsonCached,
  fetchHexCached,
};
