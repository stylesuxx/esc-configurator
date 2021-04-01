import React from 'react';
import {
  render, screen, fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MotorControl from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

test('loads and displays MotorControl', () => {
  const onAllUpdate = jest.fn();
  const onSingleUpdate = jest.fn();

  render(
    <MotorControl
      onAllUpdate={onAllUpdate}
      onSingleUpdate={onSingleUpdate}
    />
  );

  expect(screen.getByText('motorControl')).toBeInTheDocument();
  expect(screen.getByText(/enableMotorControl/i)).toBeInTheDocument();
  expect(screen.getByText(/masterSpeed/i)).toBeInTheDocument();
});

test('with motorcount', () => {
  const onAllUpdate = jest.fn();
  const onSingleUpdate = jest.fn();

  render(
    <MotorControl
      motorCount={4}
      onAllUpdate={onAllUpdate}
      onSingleUpdate={onSingleUpdate}
    />
  );

  expect(screen.getByText('motorControl')).toBeInTheDocument();
  expect(screen.getByText(/enableMotorControl/i)).toBeInTheDocument();
  expect(screen.getByText(/masterSpeed/i)).toBeInTheDocument();
  expect(screen.getAllByText(/motorNr/i).length).toEqual(4);

  userEvent.click(screen.getByRole(/checkbox/i));
});
