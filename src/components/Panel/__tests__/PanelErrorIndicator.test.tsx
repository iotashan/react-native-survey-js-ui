import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PanelErrorIndicator } from '../PanelErrorIndicator';
import { Animated } from 'react-native';

describe('PanelErrorIndicator', () => {
  beforeEach(() => {
    // Reset Animated timing mock
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render error indicator with error count', () => {
      render(<PanelErrorIndicator errorCount={3} />);

      expect(screen.getByTestId('panel-error-indicator')).toBeTruthy();
      expect(screen.getByText('3')).toBeTruthy();
    });

    it('should not render when error count is zero', () => {
      render(<PanelErrorIndicator errorCount={0} />);

      expect(screen.queryByTestId('panel-error-indicator')).toBeNull();
    });

    it('should apply custom testID when provided', () => {
      render(<PanelErrorIndicator errorCount={2} testID="custom-error-indicator" />);

      expect(screen.getByTestId('custom-error-indicator')).toBeTruthy();
    });
  });

  describe('Styling', () => {
    it('should apply default error styles', () => {
      render(<PanelErrorIndicator errorCount={1} />);

      const indicator = screen.getByTestId('panel-error-indicator');
      expect(indicator).toHaveStyle({
        backgroundColor: '#d32f2f',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
      });
    });

    it('should apply custom styles when provided', () => {
      const customStyle = {
        backgroundColor: '#ff0000',
        borderRadius: 16,
      };

      render(<PanelErrorIndicator errorCount={1} style={customStyle} />);

      const indicator = screen.getByTestId('panel-error-indicator');
      expect(indicator).toHaveStyle(customStyle);
    });

    it('should style error count text appropriately', () => {
      render(<PanelErrorIndicator errorCount={5} />);

      const text = screen.getByText('5');
      expect(text).toHaveStyle({
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
      });
    });
  });

  describe('Animation', () => {
    it('should animate appearance when animated prop is true', () => {
      const mockTiming = jest.spyOn(Animated, 'timing');

      render(<PanelErrorIndicator errorCount={1} animated />);

      expect(mockTiming).toHaveBeenCalledWith(
        expect.any(Animated.Value),
        expect.objectContaining({
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      );
    });

    it('should not animate when animated prop is false', () => {
      const mockTiming = jest.spyOn(Animated, 'timing');

      render(<PanelErrorIndicator errorCount={1} animated={false} />);

      expect(mockTiming).not.toHaveBeenCalled();
    });

    it('should animate scale on error count change', () => {
      const mockSequence = jest.spyOn(Animated, 'sequence');
      
      const { rerender } = render(<PanelErrorIndicator errorCount={1} animated />);
      
      // Change error count
      rerender(<PanelErrorIndicator errorCount={2} animated />);

      expect(mockSequence).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility label', () => {
      render(<PanelErrorIndicator errorCount={1} />);

      const indicator = screen.getByTestId('panel-error-indicator');
      expect(indicator).toHaveAccessibilityLabel('1 validation error');
    });

    it('should use plural form for multiple errors', () => {
      render(<PanelErrorIndicator errorCount={3} />);

      const indicator = screen.getByTestId('panel-error-indicator');
      expect(indicator).toHaveAccessibilityLabel('3 validation errors');
    });

    it('should have alert role', () => {
      render(<PanelErrorIndicator errorCount={1} />);

      const indicator = screen.getByTestId('panel-error-indicator');
      expect(indicator).toHaveAccessibilityRole('alert');
    });

    it('should support custom accessibility label', () => {
      render(
        <PanelErrorIndicator 
          errorCount={2} 
          accessibilityLabel="Custom error message"
        />
      );

      const indicator = screen.getByTestId('panel-error-indicator');
      expect(indicator).toHaveAccessibilityLabel('Custom error message');
    });
  });

  describe('Live Region', () => {
    it('should have polite live region for announcements', () => {
      render(<PanelErrorIndicator errorCount={1} />);

      const indicator = screen.getByTestId('panel-error-indicator');
      expect(indicator).toHaveAccessibilityLiveRegion('polite');
    });

    it('should support assertive live region when specified', () => {
      render(<PanelErrorIndicator errorCount={1} liveRegion="assertive" />);

      const indicator = screen.getByTestId('panel-error-indicator');
      expect(indicator).toHaveAccessibilityLiveRegion('assertive');
    });
  });

  describe('Error Count Display', () => {
    it('should display single digit counts', () => {
      render(<PanelErrorIndicator errorCount={9} />);
      expect(screen.getByText('9')).toBeTruthy();
    });

    it('should display double digit counts', () => {
      render(<PanelErrorIndicator errorCount={15} />);
      expect(screen.getByText('15')).toBeTruthy();
    });

    it('should display 99+ for counts over 99', () => {
      render(<PanelErrorIndicator errorCount={100} />);
      expect(screen.getByText('99+')).toBeTruthy();
    });

    it('should handle negative counts as zero', () => {
      render(<PanelErrorIndicator errorCount={-5} />);
      expect(screen.queryByTestId('panel-error-indicator')).toBeNull();
    });
  });

  describe('Theme Support', () => {
    it('should apply theme colors when provided', () => {
      const theme = {
        errorColor: '#ff5722',
        errorTextColor: '#000000',
      };

      render(<PanelErrorIndicator errorCount={1} theme={theme} />);

      const indicator = screen.getByTestId('panel-error-indicator');
      expect(indicator).toHaveStyle({
        backgroundColor: '#ff5722',
      });

      const text = screen.getByText('1');
      expect(text).toHaveStyle({
        color: '#000000',
      });
    });
  });
});