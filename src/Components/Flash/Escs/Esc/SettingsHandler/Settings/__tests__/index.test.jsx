import React from 'react';
import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Settings from '../';

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

describe('Settings', () => {
  let handleCheckboxChange;
  let handleNumberChange;
  let handleSelectChange;

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
    {
      name: "BEEP_STRENGTH",
      type: "number",
      min: 1,
      max: 255,
      step: 1,
      label: "escBeepStrength",
    },
  ];
  const settings = {};

  beforeEach(() => {
    handleCheckboxChange = jest.fn();
    handleNumberChange = jest.fn();
    handleSelectChange = jest.fn();
  });

  it('should render', () => {
    render(
      <Settings
        descriptions={descriptions}
        directInput={false}
        disabled={false}
        handleCheckboxChange={handleCheckboxChange}
        handleNumberChange={handleNumberChange}
        handleSelectChange={handleSelectChange}
        settings={settings}
      />
    );

    expect(screen.getByText(/escMotorDirection/i)).toBeInTheDocument();
    expect(screen.getByText(/escStartupBeep/i)).toBeInTheDocument();
    expect(screen.getByText(/escBeepStrength/i)).toBeInTheDocument();
  });

  it('should handle Select', () => {
    render(
      <Settings
        descriptions={descriptions}
        directInput={false}
        disabled={false}
        handleCheckboxChange={handleCheckboxChange}
        handleNumberChange={handleNumberChange}
        handleSelectChange={handleSelectChange}
        settings={settings}
      />
    );

    const button = screen.getByRole('button', {});
    userEvent.click(button);

    const option = screen.getByRole('option', { name: 'Bidirectional' });
    userEvent.click(option);

    expect(handleSelectChange).toHaveBeenCalled();
  });

  it('should handle Checkbox', () => {
    render(
      <Settings
        descriptions={descriptions}
        directInput={false}
        disabled={false}
        handleCheckboxChange={handleCheckboxChange}
        handleNumberChange={handleNumberChange}
        handleSelectChange={handleSelectChange}
        settings={settings}
      />
    );

    const checkbox = screen.getByRole('checkbox', {});
    userEvent.click(checkbox);

    expect(handleCheckboxChange).toHaveBeenCalled();
  });

  it('should handle Slider', () => {
    render(
      <Settings
        descriptions={descriptions}
        directInput={false}
        disabled={false}
        handleCheckboxChange={handleCheckboxChange}
        handleNumberChange={handleNumberChange}
        handleSelectChange={handleSelectChange}
        settings={settings}
      />
    );

    expect(screen.getByRole('slider', {})).toBeInTheDocument();
  });

  it('should handle direct input', () => {
    render(
      <Settings
        descriptions={descriptions}
        directInput
        disabled={false}
        handleCheckboxChange={handleCheckboxChange}
        handleNumberChange={handleNumberChange}
        handleSelectChange={handleSelectChange}
        settings={settings}
      />
    );

    const spinbutton = screen.getByRole('spinbutton', {});
    fireEvent.change(screen.getByRole(/spinbutton/i), {
      target: {
        value: 100,
        name: 'test',
      },
    });
    fireEvent.blur(screen.getByRole(/spinbutton/i));
    expect(screen.getByRole(/spinbutton/i).value).toEqual("100");

    expect(handleNumberChange).toHaveBeenCalled();
  });
});
