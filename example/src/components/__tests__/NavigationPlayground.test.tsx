import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationPlayground } from '../NavigationPlayground';
import { Model } from 'survey-core';
import { basicMultiPageExample } from '../../data/multiPageExamples';

describe('NavigationPlayground', () => {
  let mockModel: Model;
  let mockOnConfigChange: jest.Mock;

  beforeEach(() => {
    mockModel = new Model(basicMultiPageExample.model);
    mockOnConfigChange = jest.fn();
  });

  it('should render navigation state display', () => {
    const { getByTestId } = render(
      <NavigationPlayground 
        survey={mockModel} 
        onConfigChange={mockOnConfigChange}
      />
    );

    expect(getByTestId('navigation-state-display')).toBeTruthy();
    expect(getByTestId('current-page-info')).toBeTruthy();
    expect(getByTestId('progress-info')).toBeTruthy();
  });

  it('should display current page information', () => {
    const { getByText } = render(
      <NavigationPlayground 
        survey={mockModel} 
        onConfigChange={mockOnConfigChange}
      />
    );

    expect(getByText(/Current Page: 1 of 3/)).toBeTruthy();
    expect(getByText(/Page Name: page1/)).toBeTruthy();
  });

  it('should show navigation control toggles', () => {
    const { getByTestId } = render(
      <NavigationPlayground 
        survey={mockModel} 
        onConfigChange={mockOnConfigChange}
      />
    );

    expect(getByTestId('show-progress-toggle')).toBeTruthy();
    expect(getByTestId('validation-mode-selector')).toBeTruthy();
    expect(getByTestId('navigation-buttons-position')).toBeTruthy();
  });

  it('should update config when toggles are changed', () => {
    const { getByTestId } = render(
      <NavigationPlayground 
        survey={mockModel} 
        onConfigChange={mockOnConfigChange}
      />
    );

    const progressToggle = getByTestId('progress-toggle-switch');
    fireEvent(progressToggle, 'onValueChange', true);

    expect(mockOnConfigChange).toHaveBeenCalledWith(expect.objectContaining({
      showProgressBar: 'top'
    }));
  });

  it('should display validation state', () => {
    const { getByTestId, getByText } = render(
      <NavigationPlayground 
        survey={mockModel} 
        onConfigChange={mockOnConfigChange}
      />
    );

    expect(getByTestId('validation-state')).toBeTruthy();
    expect(getByText(/Validation Errors: 0/)).toBeTruthy();
  });

  it('should show button states', () => {
    const { getByTestId } = render(
      <NavigationPlayground 
        survey={mockModel} 
        onConfigChange={mockOnConfigChange}
      />
    );

    expect(getByTestId('button-states')).toBeTruthy();
    expect(getByTestId('prev-button-state')).toBeTruthy();
    expect(getByTestId('next-button-state')).toBeTruthy();
  });

  it('should update when survey model changes', async () => {
    const { getByText, rerender } = render(
      <NavigationPlayground 
        survey={mockModel} 
        onConfigChange={mockOnConfigChange}
      />
    );

    // Navigate to next page
    mockModel.nextPage();

    rerender(
      <NavigationPlayground 
        survey={mockModel} 
        onConfigChange={mockOnConfigChange}
      />
    );

    await waitFor(() => {
      expect(getByText(/Current Page: 2 of 3/)).toBeTruthy();
    });
  });

  it('should display event history', () => {
    const { getByTestId } = render(
      <NavigationPlayground 
        survey={mockModel} 
        onConfigChange={mockOnConfigChange}
      />
    );

    expect(getByTestId('event-history')).toBeTruthy();
    expect(getByTestId('event-history-list')).toBeTruthy();
  });
});