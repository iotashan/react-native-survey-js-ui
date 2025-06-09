import { Dimensions } from 'react-native';
import { 
  panelStyles, 
  getPanelContainerStyle, 
  getNestedPanelStyle,
  getContentContainerStyle,
  PanelStyleConfig,
  ResponsiveBreakpoints
} from '../panelStyles';

// Mock Dimensions API
jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
  StyleSheet: {
    create: (styles: any) => styles,
    flatten: (styles: any) => {
      if (Array.isArray(styles)) {
        return Object.assign({}, ...styles);
      }
      return styles;
    },
  },
  Platform: {
    OS: 'ios',
  },
}));

describe('panelStyles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Responsive Breakpoints', () => {
    it('should detect small screens correctly', () => {
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 320 });
      const breakpoints = new ResponsiveBreakpoints();
      expect(breakpoints.isSmall).toBe(true);
      expect(breakpoints.isMedium).toBe(false);
      expect(breakpoints.isLarge).toBe(false);
    });

    it('should detect medium screens correctly', () => {
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 400 });
      const breakpoints = new ResponsiveBreakpoints();
      expect(breakpoints.isSmall).toBe(false);
      expect(breakpoints.isMedium).toBe(true);
      expect(breakpoints.isLarge).toBe(false);
    });

    it('should detect large screens correctly', () => {
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 800 });
      const breakpoints = new ResponsiveBreakpoints();
      expect(breakpoints.isSmall).toBe(false);
      expect(breakpoints.isMedium).toBe(false);
      expect(breakpoints.isLarge).toBe(true);
    });

    it('should update on orientation change', () => {
      const breakpoints = new ResponsiveBreakpoints();
      const updateHandler = jest.fn();
      breakpoints.addListener(updateHandler);

      // Simulate orientation change
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 812 });
      breakpoints.update();

      expect(updateHandler).toHaveBeenCalled();
      expect(breakpoints.isLarge).toBe(true);
    });
  });

  describe('Base Panel Styles', () => {
    it('should have consistent base spacing', () => {
      expect(panelStyles.container.marginBottom).toBe(16);
      expect(panelStyles.contentContainer.paddingHorizontal).toBe(16);
      expect(panelStyles.questionSpacing.marginBottom).toBe(12);
    });

    it('should have proper border and background styles', () => {
      expect(panelStyles.container.borderWidth).toBe(1);
      expect(panelStyles.container.borderColor).toBe('#e0e0e0');
      expect(panelStyles.container.backgroundColor).toBe('#ffffff');
      expect(panelStyles.container.borderRadius).toBe(8);
    });

    it('should have shadow styles for elevation', () => {
      expect(panelStyles.container.shadowColor).toBe('#000');
      expect(panelStyles.container.shadowOffset).toEqual({ width: 0, height: 2 });
      expect(panelStyles.container.shadowOpacity).toBe(0.1);
      expect(panelStyles.container.shadowRadius).toBe(4);
      expect(panelStyles.container.elevation).toBe(3);
    });
  });

  describe('getPanelContainerStyle', () => {
    it('should return base styles for root panel', () => {
      const style = getPanelContainerStyle({ nestingLevel: 0 });
      expect(style).toContain(panelStyles.container);
      expect(style).not.toContain(panelStyles.nestedPanel);
    });

    it('should add nested styles for nested panels', () => {
      const style = getPanelContainerStyle({ nestingLevel: 1 });
      expect(style).toContain(panelStyles.container);
      expect(style).toContain(panelStyles.nestedPanel);
    });

    it('should apply custom styles when provided', () => {
      const customStyle = { backgroundColor: 'red' };
      const style = getPanelContainerStyle({ 
        nestingLevel: 0, 
        customStyle 
      });
      expect(style).toContain(customStyle);
    });

    it('should handle invisible panels', () => {
      const style = getPanelContainerStyle({ 
        nestingLevel: 0, 
        isVisible: false 
      });
      expect(style).toContainEqual({ display: 'none' });
    });
  });

  describe('getNestedPanelStyle', () => {
    it('should calculate proper indentation for nested levels', () => {
      const level1 = getNestedPanelStyle(1);
      const level2 = getNestedPanelStyle(2);
      const level3 = getNestedPanelStyle(3);

      expect(level1.marginLeft).toBe(16);
      expect(level2.marginLeft).toBe(32);
      expect(level3.marginLeft).toBe(48);
    });

    it('should add visual distinction for nested panels', () => {
      const nestedStyle = getNestedPanelStyle(1);
      expect(nestedStyle.borderLeftWidth).toBe(3);
      expect(nestedStyle.borderLeftColor).toBe('#e3f2fd');
    });

    it('should adjust spacing on small screens', () => {
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 320 });
      const nestedStyle = getNestedPanelStyle(1);
      expect(nestedStyle.marginLeft).toBe(8);
    });

    it('should cap maximum indentation', () => {
      const deepNested = getNestedPanelStyle(10);
      expect(deepNested.marginLeft).toBeLessThanOrEqual(64);
    });
  });

  describe('getContentContainerStyle', () => {
    it('should provide proper padding for content', () => {
      const style = getContentContainerStyle({ nestingLevel: 0 });
      expect(style.paddingHorizontal).toBe(16);
      expect(style.paddingVertical).toBe(12);
    });

    it('should reduce padding for nested panels', () => {
      const nestedStyle = getContentContainerStyle({ nestingLevel: 2 });
      expect(nestedStyle.paddingHorizontal).toBeLessThan(16);
    });

    it('should handle collapsed state', () => {
      const collapsedStyle = getContentContainerStyle({ 
        nestingLevel: 0, 
        isCollapsed: true 
      });
      expect(collapsedStyle).toEqual({ display: 'none' });
    });
  });

  describe('Panel Style Configuration', () => {
    it('should allow theme customization', () => {
      const config: PanelStyleConfig = {
        theme: {
          primaryColor: '#1976d2',
          backgroundColor: '#f5f5f5',
          borderColor: '#cccccc',
          textColor: '#333333',
        },
        spacing: {
          small: 8,
          medium: 16,
          large: 24,
        },
      };

      const themedStyles = panelStyles.withTheme(config);
      expect(themedStyles.container.backgroundColor).toBe('#f5f5f5');
      expect(themedStyles.container.borderColor).toBe('#cccccc');
    });

    it('should support RTL layouts', () => {
      // Set screen width to medium size to get consistent spacing
      (Dimensions.get as jest.Mock).mockReturnValue({ width: 400 });
      
      const rtlConfig: PanelStyleConfig = {
        isRTL: true,
      };

      const rtlStyles = panelStyles.withTheme(rtlConfig);
      const nestedStyle = getNestedPanelStyle(1, rtlConfig);
      expect(nestedStyle.marginRight).toBe(16);
      expect(nestedStyle.marginLeft).toBeUndefined();
    });
  });

  describe('Performance', () => {
    it('should memoize style calculations', () => {
      const config = { nestingLevel: 1 };
      const style1 = getPanelContainerStyle(config);
      const style2 = getPanelContainerStyle(config);
      
      // Should return the same reference for same input
      expect(style1).toBe(style2);
    });

    it('should handle many nested panels efficiently', () => {
      const startTime = Date.now();
      
      // Generate styles for 100 panels
      for (let i = 0; i < 100; i++) {
        getPanelContainerStyle({ nestingLevel: i % 5 });
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(50); // Should complete in under 50ms
    });
  });
});