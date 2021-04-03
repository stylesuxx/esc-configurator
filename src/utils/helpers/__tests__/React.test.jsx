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
TestComponent.propTypes = {
  callback: PropTypes.func.isRequired,
  timeout: PropTypes.number.isRequired,
};

test('useInterval with proper delay', async () => {
  const callback = jest.fn();

  render(
    <TestComponent
      callback={callback}
      timeout={200}
    />
  );

  await new Promise((r) => {
    setTimeout(r, 500);
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

  await new Promise((r) => {
    setTimeout(r, 500);
  });

  expect(callback).toHaveBeenCalled();
});
