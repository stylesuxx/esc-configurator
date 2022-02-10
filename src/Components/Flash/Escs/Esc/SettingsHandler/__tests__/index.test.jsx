import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SettingsHandler from '../';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      exists: (name) => {
        if(name === 'hints:STARTUP_BEEP') {
          return false;
        }

        return true;
      },
    },
  }),
}));

let onUpdate;

describe('SettingsHandler', () => {
  beforeEach(() => {
    onUpdate = jest.fn();
  });

  it('should update settings', () => {
    const descriptions = [
      {
        name: 'COMMON_MOTOR_DIRECTION',
        type: 'enum',
        label: 'escMotorDirection',
        options: [
          {
            value: '1',
            label: 'Normal',
          },
          {
            value: '2',
            label: 'Reversed',
          },
          {
            value: '3',
            label: 'Bidirectional',
          },
          {
            value: '4',
            label: 'Bidirectional Reversed',
          },
        ],
      },
      {
        name: 'COMMON_STARTUP_BEEP',
        type: 'bool',
        label: 'escStartupBeep',
      },
    ];
    const settings = {};

    render(
      <SettingsHandler
        descriptions={descriptions}
        directInput={false}
        disabled={false}
        onUpdate={onUpdate}
        settings={settings}
      />
    );

    expect(screen.getByText(/escMotorDirection/i)).toBeInTheDocument();
    expect(screen.getByText(/escStartupBeep/i)).toBeInTheDocument();

    const button = screen.getByRole('button', {});
    userEvent.click(button);

    const option = screen.getByRole('option', { name: 'Bidirectional' });
    userEvent.click(option);

    expect(onUpdate).toHaveBeenCalled();
  });
});
