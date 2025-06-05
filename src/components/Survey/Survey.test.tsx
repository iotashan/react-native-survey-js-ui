import React from 'react';
import { render } from '@testing-library/react-native';
import { Survey } from './Survey';

describe('Survey Component', () => {
  it('should render without crashing', () => {
    const { getByTestId } = render(<Survey model={{}} />);
    expect(getByTestId('survey-container')).toBeTruthy();
  });

  it('should accept a survey model prop', () => {
    const mockModel = {
      title: 'Test Survey',
      pages: [],
    };
    const { getByText } = render(<Survey model={mockModel} />);
    expect(getByText('Test Survey')).toBeTruthy();
  });
});
