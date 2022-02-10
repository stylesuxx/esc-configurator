import PropTypes from 'prop-types';
import React from 'react';
import { render } from '@testing-library/react';
import { useInterval } from '../React';

function TestComponent({
  callback,
  timeout,
}) {
  useInterval(() => {
    callback();
  }, timeout);

  return (
    <div>
      Test
    </div>
  );
}
TestComponent.defaultProps = { timeout: null };
TestComponent.propTypes = {
  callback: PropTypes.func.isRequired,
  timeout: PropTypes.number,
};

test('useInterval with proper delay', async () => {
  const callback = jest.fn();

  render(
    <TestComponent
      callback={callback}
      timeout={100}
    />
  );

  await new Promise((r) => {
    setTimeout(r, 150);
  });

  expect(callback).toHaveBeenCalled();
});

test('useInterval without delay', async () => {
  const callback = jest.fn();

  render(
    <TestComponent
      callback={callback}
      timeout={null}
    />
  );

  expect(callback).toHaveBeenCalled();
});
