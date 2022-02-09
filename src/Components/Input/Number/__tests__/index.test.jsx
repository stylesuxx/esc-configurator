import React from 'react';
import {
  render, screen, fireEvent,
} from '@testing-library/react';

import Number from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

describe('Number', () => {
  let onChange;

  beforeEach(() => {
    onChange = jest.fn();
  });

  it('should handle number input', () => {
    render(
      <Number
        label="Test Label"
        name="test"
        onChange={onChange}
      />
    );

    expect(screen.getByText(/Test Label/i)).toBeInTheDocument();

    fireEvent.change(screen.getByRole(/spinbutton/i), {
      target: {
        value: 1250,
        name: 'test',
      },
    });
    fireEvent.blur(screen.getByRole(/spinbutton/i));
    expect(screen.getByRole(/spinbutton/i).value).toEqual("255");

    fireEvent.change(screen.getByRole(/spinbutton/i), {
      target: {
        value: -10,
        name: 'test',
      },
    });
    fireEvent.blur(screen.getByRole(/spinbutton/i));
    expect(screen.getByRole(/spinbutton/i).value).toEqual("1");

    expect(onChange).toHaveBeenCalled();
  });

  it('should handle string input', () => {
    render(
      <Number
        label="Test Label"
        name="test"
        onChange={onChange}
      />
    );

    expect(screen.getByText(/Test Label/i)).toBeInTheDocument();

    fireEvent.change(screen.getByRole(/spinbutton/i), {
      target: {
        value: 'some string',
        name: 'test',
      },
    });
    fireEvent.blur(screen.getByRole(/spinbutton/i));
    expect(screen.getByRole(/spinbutton/i).value).toEqual("1");

    expect(onChange).toHaveBeenCalled();
  });

  it('should handle out of sync', () => {
    render(
      <Number
        inSync={false}
        label="Test Label"
        name="test"
        onChange={onChange}
      />
    );

    expect(screen.getByText(/Test Label/i)).toBeInTheDocument();

    fireEvent.change(screen.getByRole(/spinbutton/i), {
      target: {
        value: 1250,
        name: 'test',
      },
    });
    fireEvent.blur(screen.getByRole(/spinbutton/i));
    expect(screen.getByRole(/spinbutton/i).value).toEqual("0");

    fireEvent.change(screen.getByRole(/spinbutton/i), {
      target: {
        value: -10,
        name: 'test',
      },
    });
    fireEvent.blur(screen.getByRole(/spinbutton/i));
    expect(screen.getByRole(/spinbutton/i).value).toEqual("0");

    fireEvent.change(screen.getByRole(/spinbutton/i), {
      target: {
        value: 'Nan',
        name: 'test',
      },
    });
    fireEvent.blur(screen.getByRole(/spinbutton/i));
    expect(screen.getByRole(/spinbutton/i).value).toEqual("0");

    expect(onChange).toHaveBeenCalled();
  });
});
