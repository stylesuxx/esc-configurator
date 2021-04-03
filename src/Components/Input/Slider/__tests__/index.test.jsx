import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';

import Slider from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

test('loads and displays Slider', () => {
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

test('loads and displays Slider out of sync', () => {
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
