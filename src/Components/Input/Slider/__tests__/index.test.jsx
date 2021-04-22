import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';

import Slider from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

describe('Slider', () => {
  it('should display the slider', () => {
    const onChange = jest.fn();

    render(
      <Slider
        label="test"
        name="test"
        onChange={onChange}
      />
    );

    expect(screen.getByText(/test/i)).toBeInTheDocument();
  });

  it('should display out of sync slider', () => {
    const onChange = jest.fn();

    render(
      <Slider
        inSync={false}
        label="test"
        name="test"
        onChange={onChange}
      />
    );

    expect(screen.getByText(/test/i)).toBeInTheDocument();
  });
});
