import Settings from '../settings.json';

const { corsProxy } = Settings;

const ONE_DAY = 24 * 60 * 60 * 1000;

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

async function fetchAndCacheJsonResponse(cache, url) {
  const response = await fetchResponse(url);

  // If the response does not contain JSON, the next statement will throw and
  // not be cached
  await response.clone().json();

  const newHeaders = new window.Headers(response.headers);
  newHeaders.set('Time-Cached', Date.now().toString());
  const newResponse = new window.Response(response.body, { headers: newHeaders });

  cache.put(url, newResponse.clone());

  return newResponse;
}

// Fetch content from cache or online if necessary
async function fetchJsonCached(url, opts = { maxAge: ONE_DAY }) {
  const cache = await window.caches.open('v1');
  let cachedResponse = await cache.match(url);

  const isOld = (r) => Date.now() - parseInt(r.headers.get('Time-Cached'), 10) > opts.maxAge;

  if (!cachedResponse || !cachedResponse.ok) {
    // Fetch response and cache it
    cachedResponse = await fetchAndCacheJsonResponse(cache, url);
  } else if (isOld(cachedResponse)) {
    // Fetch new version and cache it for next time,
    // but return old response now to save time
    fetchAndCacheJsonResponse(cache, url);
  }

  return cachedResponse.json();
}

export {
  fetchResponse,
  fetchJsonCached,
};
