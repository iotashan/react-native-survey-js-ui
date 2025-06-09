import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { 
  PanelNestingContext, 
  PanelNestingProvider, 
  usePanelNesting,
  PanelNestingContextValue 
} from '../PanelNestingContext';

describe('PanelNestingContext', () => {
  describe('usePanelNesting hook', () => {
    it('should provide default context values', () => {
      let contextValue: PanelNestingContextValue | null = null;

      const TestComponent = () => {
        contextValue = usePanelNesting();
        return <Text>Test</Text>;
      };

      render(<TestComponent />);

      expect(contextValue).toEqual({
        nestingLevel: 0,
        panelPath: [],
        panelNamesInPath: expect.any(Set),
        maxNestingDepth: 10,
      });
    });

    it('should provide custom context values from provider', () => {
      let contextValue: PanelNestingContextValue | null = null;
      const customNamesInPath = new Set(['root', 'parent']);

      const TestComponent = () => {
        contextValue = usePanelNesting();
        return <Text>Test</Text>;
      };

      render(
        <PanelNestingProvider
          nestingLevel={3}
          panelPath={['root', 'parent', 'child']}
          panelNamesInPath={customNamesInPath}
          maxNestingDepth={15}
        >
          <TestComponent />
        </PanelNestingProvider>
      );

      expect(contextValue).toEqual({
        nestingLevel: 3,
        panelPath: ['root', 'parent', 'child'],
        panelNamesInPath: customNamesInPath,
        maxNestingDepth: 15,
      });
    });
  });

  describe('PanelNestingProvider', () => {
    it('should render children', () => {
      render(
        <PanelNestingProvider
          nestingLevel={0}
          panelPath={[]}
          panelNamesInPath={new Set()}
        >
          <Text testID="child">Child Content</Text>
        </PanelNestingProvider>
      );

      expect(screen.getByTestId('child')).toBeTruthy();
    });

    it('should allow nested providers', () => {
      let outerContext: PanelNestingContextValue | null = null;
      let innerContext: PanelNestingContextValue | null = null;

      const OuterComponent = () => {
        outerContext = usePanelNesting();
        return null;
      };

      const InnerComponent = () => {
        innerContext = usePanelNesting();
        return null;
      };

      const outerNamesInPath = new Set(['outer']);
      const innerNamesInPath = new Set(['outer', 'inner']);

      render(
        <PanelNestingProvider
          nestingLevel={0}
          panelPath={['outer']}
          panelNamesInPath={outerNamesInPath}
          maxNestingDepth={10}
        >
          <OuterComponent />
          <PanelNestingProvider
            nestingLevel={1}
            panelPath={['outer', 'inner']}
            panelNamesInPath={innerNamesInPath}
            maxNestingDepth={10}
          >
            <InnerComponent />
          </PanelNestingProvider>
        </PanelNestingProvider>
      );

      expect(outerContext).toEqual({
        nestingLevel: 0,
        panelPath: ['outer'],
        panelNamesInPath: outerNamesInPath,
        maxNestingDepth: 10,
      });

      expect(innerContext).toEqual({
        nestingLevel: 1,
        panelPath: ['outer', 'inner'],
        panelNamesInPath: innerNamesInPath,
        maxNestingDepth: 10,
      });
    });

    it('should use default maxNestingDepth when not provided', () => {
      let contextValue: PanelNestingContextValue | null = null;

      const TestComponent = () => {
        contextValue = usePanelNesting();
        return null;
      };

      render(
        <PanelNestingProvider
          nestingLevel={0}
          panelPath={[]}
          panelNamesInPath={new Set()}
        >
          <TestComponent />
        </PanelNestingProvider>
      );

      expect(contextValue?.maxNestingDepth).toBe(10);
    });
  });

  describe('Set behavior for circular reference detection', () => {
    it('should properly track panel names in path', () => {
      const namesInPath = new Set<string>();

      expect(namesInPath.has('panel1')).toBe(false);
      expect(namesInPath.has('panel2')).toBe(false);

      namesInPath.add('panel1');
      expect(namesInPath.has('panel1')).toBe(true);
      expect(namesInPath.has('panel2')).toBe(false);

      namesInPath.add('panel2');
      expect(namesInPath.has('panel1')).toBe(true);
      expect(namesInPath.has('panel2')).toBe(true);
    });

    it('should detect circular references', () => {
      const namesInPath = new Set(['root', 'parent', 'child']);

      // Should detect if trying to add 'parent' again (circular reference)
      expect(namesInPath.has('parent')).toBe(true);
      expect(namesInPath.has('grandchild')).toBe(false);
    });
  });
});