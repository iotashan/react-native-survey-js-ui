import * as React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressIndicator } from './ProgressIndicator';

describe('ProgressIndicator', () => {
  describe('Progress Calculation', () => {
    it('should calculate progress percentage correctly', () => {
      const { getByTestId } = render(
        <ProgressIndicator
          currentPage={1}
          totalPages={4}
          mode="bar"
          visible={true}
        />
      );

      const progressFill = getByTestId('progress-fill');
      expect(progressFill.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ width: '50%' })
        ])
      );
    });

    it('should calculate progress for first page correctly', () => {
      const { getByTestId } = render(
        <ProgressIndicator
          currentPage={0}
          totalPages={3}
          mode="bar"
          visible={true}
        />
      );

      const progressFill = getByTestId('progress-fill');
      expect(progressFill.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ width: '33.33%' })
        ])
      );
    });

    it('should calculate progress for last page correctly', () => {
      const { getByTestId } = render(
        <ProgressIndicator
          currentPage={2}
          totalPages={3}
          mode="bar"
          visible={true}
        />
      );

      const progressFill = getByTestId('progress-fill');
      expect(progressFill.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ width: '100%' })
        ])
      );
    });
  });

  describe('Display Modes', () => {
    it('should render bar mode correctly', () => {
      const { getByTestId, queryByTestId } = render(
        <ProgressIndicator
          currentPage={1}
          totalPages={3}
          mode="bar"
          visible={true}
        />
      );

      expect(getByTestId('progress-bar')).toBeTruthy();
      expect(getByTestId('progress-fill')).toBeTruthy();
      expect(queryByTestId('progress-text')).toBeFalsy();
    });

    it('should render text mode correctly', () => {
      const { getByTestId, getByText } = render(
        <ProgressIndicator
          currentPage={1}
          totalPages={3}
          mode="text"
          visible={true}
        />
      );

      expect(getByTestId('progress-text')).toBeTruthy();
      expect(getByText('Page 2 of 3')).toBeTruthy();
    });

    it('should render percentage mode correctly', () => {
      const { getByTestId, getByText } = render(
        <ProgressIndicator
          currentPage={1}
          totalPages={4}
          mode="percentage"
          visible={true}
        />
      );

      expect(getByTestId('progress-text')).toBeTruthy();
      expect(getByText('50%')).toBeTruthy();
    });

    it('should render both bar and text in combined mode', () => {
      const { getByTestId, getByText } = render(
        <ProgressIndicator
          currentPage={1}
          totalPages={3}
          mode="both"
          visible={true}
        />
      );

      expect(getByTestId('progress-bar')).toBeTruthy();
      expect(getByTestId('progress-fill')).toBeTruthy();
      expect(getByTestId('progress-text')).toBeTruthy();
      expect(getByText('Page 2 of 3')).toBeTruthy();
    });
  });

  describe('Visibility', () => {
    it('should not render when visible is false', () => {
      const { queryByTestId } = render(
        <ProgressIndicator
          currentPage={1}
          totalPages={3}
          mode="bar"
          visible={false}
        />
      );

      expect(queryByTestId('progress-indicator')).toBeFalsy();
    });

    it('should render when visible is true', () => {
      const { getByTestId } = render(
        <ProgressIndicator
          currentPage={1}
          totalPages={3}
          mode="bar"
          visible={true}
        />
      );

      expect(getByTestId('progress-indicator')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single page gracefully', () => {
      const { getByTestId } = render(
        <ProgressIndicator
          currentPage={0}
          totalPages={1}
          mode="both"
          visible={true}
        />
      );

      const progressFill = getByTestId('progress-fill');
      expect(progressFill.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ width: '100%' })
        ])
      );
      expect(getByTestId('progress-text')).toBeTruthy();
    });

    it('should handle zero pages gracefully', () => {
      const { getByTestId } = render(
        <ProgressIndicator
          currentPage={0}
          totalPages={0}
          mode="both"
          visible={true}
        />
      );

      const progressFill = getByTestId('progress-fill');
      expect(progressFill.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ width: '0%' })
        ])
      );
    });

    it('should handle negative values gracefully', () => {
      const { getByTestId } = render(
        <ProgressIndicator
          currentPage={-1}
          totalPages={3}
          mode="bar"
          visible={true}
        />
      );

      const progressFill = getByTestId('progress-fill');
      expect(progressFill.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ width: '0%' })
        ])
      );
    });

    it('should handle currentPage greater than totalPages', () => {
      const { getByTestId } = render(
        <ProgressIndicator
          currentPage={5}
          totalPages={3}
          mode="bar"
          visible={true}
        />
      );

      const progressFill = getByTestId('progress-fill');
      expect(progressFill.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ width: '100%' })
        ])
      );
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility role', () => {
      const { getByTestId } = render(
        <ProgressIndicator
          currentPage={1}
          totalPages={3}
          mode="bar"
          visible={true}
        />
      );

      const container = getByTestId('progress-indicator');
      expect(container.props.accessibilityRole).toBe('progressbar');
    });

    it('should have correct accessibility value', () => {
      const { getByTestId } = render(
        <ProgressIndicator
          currentPage={1}
          totalPages={4}
          mode="bar"
          visible={true}
        />
      );

      const container = getByTestId('progress-indicator');
      expect(container.props.accessibilityValue).toEqual({
        min: 0,
        max: 100,
        now: 50,
      });
    });

    it('should have meaningful accessibility label', () => {
      const { getByTestId } = render(
        <ProgressIndicator
          currentPage={1}
          totalPages={3}
          mode="bar"
          visible={true}
        />
      );

      const container = getByTestId('progress-indicator');
      expect(container.props.accessibilityLabel).toBe('Survey progress: Page 2 of 3, 67% complete');
    });

    it('should have custom accessibility label when provided', () => {
      const { getByTestId } = render(
        <ProgressIndicator
          currentPage={1}
          totalPages={3}
          mode="bar"
          visible={true}
          accessibilityLabel="Custom progress label"
        />
      );

      const container = getByTestId('progress-indicator');
      expect(container.props.accessibilityLabel).toBe('Custom progress label');
    });
  });

  describe('Styling', () => {
    it('should apply custom container style', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByTestId } = render(
        <ProgressIndicator
          currentPage={1}
          totalPages={3}
          mode="bar"
          visible={true}
          style={customStyle}
        />
      );

      const container = getByTestId('progress-indicator');
      expect(container.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining(customStyle)])
      );
    });

    it('should apply custom bar style', () => {
      const customBarStyle = { height: 12 };
      const { getByTestId } = render(
        <ProgressIndicator
          currentPage={1}
          totalPages={3}
          mode="bar"
          visible={true}
          barStyle={customBarStyle}
        />
      );

      const progressBar = getByTestId('progress-bar');
      expect(progressBar.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining(customBarStyle)])
      );
    });

    it('should apply custom fill style', () => {
      const customFillStyle = { backgroundColor: 'green' };
      const { getByTestId } = render(
        <ProgressIndicator
          currentPage={1}
          totalPages={3}
          mode="bar"
          visible={true}
          fillStyle={customFillStyle}
        />
      );

      const progressFill = getByTestId('progress-fill');
      expect(progressFill.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining(customFillStyle)])
      );
    });

    it('should apply custom text style', () => {
      const customTextStyle = { color: 'blue' };
      const { getByTestId } = render(
        <ProgressIndicator
          currentPage={1}
          totalPages={3}
          mode="text"
          visible={true}
          textStyle={customTextStyle}
        />
      );

      const progressText = getByTestId('progress-text');
      expect(progressText.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining(customTextStyle)])
      );
    });
  });

  describe('Performance', () => {
    it('should render without throwing errors', () => {
      expect(() => {
        render(
          <ProgressIndicator
            currentPage={1}
            totalPages={3}
            mode="bar"
            visible={true}
          />
        );
      }).not.toThrow();
    });
  });
});