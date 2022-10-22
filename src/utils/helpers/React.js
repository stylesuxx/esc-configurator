import {
  useEffect,
  useRef,
} from 'react';

/**
 * Invoke a callback in a given interval
 *
 * @param {function} callback
 * @param {number} interval
 */
const useInterval = (callback, interval) => {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (interval !== null) {
      let id = setInterval(tick, interval);
      return () => clearInterval(id);
    } else {
      savedCallback.current();
    }
  }, [interval]);
};

export {
  useInterval,
};
