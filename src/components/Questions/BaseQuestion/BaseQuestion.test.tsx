import React from 'react';
import { render } from '@testing-library/react-native';
import { BaseQuestion } from './BaseQuestion';

describe('BaseQuestion Component', () => {
  it('should render without crashing', () => {
    const { getByTestId } = render(
      <BaseQuestion 
        question={{
          name: 'q1',
          type: 'text',
          title: 'Test Question'
        }} 
      />
    );
    expect(getByTestId('base-question-container')).toBeTruthy();
  });

  it('should display question title', () => {
    const { getByText } = render(
      <BaseQuestion 
        question={{
          name: 'q1',
          type: 'text',
          title: 'What is your name?'
        }} 
      />
    );
    expect(getByText('What is your name?')).toBeTruthy();
  });
});