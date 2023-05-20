import React from 'react';
import {
  render, screen, fireEvent,
} from '@testing-library/react';

import Select from '../';

let onChange;

describe('FirmwareSelector', () => {
  beforeEach(() => {
    onChange = jest.fn();
  });

  it('should render without options', () => {
    const options = [];

    render(
      <Select
        label="Test Select Label"
        name="Test Select"
        onChange={onChange}
        options={options}
      />
    );

    expect(screen.getByRole(/combobox/i, { name: 'Test Select' })).toBeInTheDocument();
    expect(screen.getByText('Test Select Label')).toBeInTheDocument();
  });

  it('should render being out of sync', () => {
    const options = [];

    /* eslint-disable */
    const { container } = render(
      <Select
        label={'Test Select Label'}
        name={'Test Select'}
        onChange={onChange}
        options={options}
        inSync={false}
      />
    );

    const select = screen.getByRole(/combobox/i, { name: 'Test Select' });
    expect(select).toBeInTheDocument();
    expect(select.value).toEqual("-1");
    expect(screen.getByText('Test Select Label')).toBeInTheDocument();
    expect(container.querySelector('.not-in-sync')).toBeInTheDocument();
  });

  it('should render with options', () => {
    const options = [
      {
        label: 'Option 0',
        value: 0,
      },
      {
        label: 'Option 1',
        value: 1,
      }
    ];

    render(
      <Select
        label={'Test Select Label'}
        name={'Test Select'}
        onChange={onChange}
        options={options}
      />
    );

    expect(screen.getByRole(/combobox/i, { name: 'Test Select' })).toBeInTheDocument();
    expect(screen.getByText('Test Select Label')).toBeInTheDocument();
    expect(screen.getByText('Option 0')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('should handle option change', () => {
    const options = [
      {
        label: 'Option 0',
        value: 0,
      },
      {
        label: 'Option 1',
        value: 1,
      }
    ];

    render(
      <Select
        label={'Test Select Label'}
        name={'Test Select'}
        onChange={onChange}
        options={options}
      />
    );

    expect(screen.getByRole(/combobox/i, { name: 'Test Select' })).toBeInTheDocument();
    expect(screen.getByText('Test Select Label')).toBeInTheDocument();
    expect(screen.getByText('Option 0')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();

    fireEvent.change(screen.getByRole(/combobox/i, { name: 'Test Select' }), { target: {  value: '0' } });
    expect(onChange).toHaveBeenCalled();
  });
});