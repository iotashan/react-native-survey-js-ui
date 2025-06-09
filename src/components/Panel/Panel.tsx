import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { PanelModel } from 'survey-core';
import { QuestionFactory } from '../Questions/QuestionFactory';
import { PanelHeader } from './PanelHeader';
import { 
  getPanelContainerStyle, 
  getNestedPanelStyle, 
  getContentContainerStyle,
  setupOrientationListener,
  removeOrientationListener,
  PanelTheme,
  PanelStyleConfig
} from './panelStyles';
import { PanelNestingContext, PanelNestingProvider, usePanelNesting } from './PanelNestingContext';

export interface PanelProps {
  panel: PanelModel | null | undefined;
  collapsible?: boolean;
  initialExpanded?: boolean;
  nestingLevel?: number;
  style?: ViewStyle;
  theme?: PanelTheme;
  isRTL?: boolean;
}

const PanelContent: React.FC<PanelProps> = ({ 
  panel, 
  collapsible = false,
  initialExpanded = true,
  nestingLevel = 0,
  style,
  theme,
  isRTL = false
}) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [, forceUpdate] = useState({});
  const nestingContext = usePanelNesting();

  // Use context nesting level if available, otherwise use prop
  const effectiveNestingLevel = nestingContext ? nestingContext.nestingLevel : nestingLevel;
  const panelPath = nestingContext ? nestingContext.panelPath : [];
  const panelNamesInPath = nestingContext ? nestingContext.panelNamesInPath : new Set<string>();
  const maxNestingDepth = nestingContext ? nestingContext.maxNestingDepth : 10;

  // Create new context values for child panels (must be before any early returns for hooks consistency)
  const newPanelNamesInPath = useMemo(() => {
    if (!panel) return new Set<string>();
    const names = new Set(panelNamesInPath);
    names.add(panel.name);
    return names;
  }, [panelNamesInPath, panel?.name]);

  const newPanelPath = useMemo(() => {
    if (!panel) return panelPath;
    return [...panelPath, panel.name];
  }, [panelPath, panel?.name]);

  // Generate unique key for panel based on path
  const panelKey = useMemo(() => {
    if (!panel) return '';
    return `panel-${newPanelPath.join('-')}-${panel.name}`;
  }, [newPanelPath, panel?.name]);

  // Setup orientation change listener
  useEffect(() => {
    const handleOrientationChange = () => {
      forceUpdate({});
    };

    setupOrientationListener(handleOrientationChange);
    
    return () => {
      removeOrientationListener();
    };
  }, []);

  // Handle null/undefined panel
  if (!panel) {
    return null;
  }

  // Handle invisible panel
  if (!panel.visible) {
    return null;
  }

  // Check for maximum nesting depth
  if (effectiveNestingLevel >= maxNestingDepth) {
    console.warn(`Maximum nesting depth (${maxNestingDepth}) exceeded for panel: ${panel.name}`);
    return null;
  }

  // Check for circular reference
  if (panelNamesInPath.has(panel.name)) {
    console.warn(`Circular reference detected for panel: ${panel.name} in path: ${panelPath.join(' -> ')}`);
    return null;
  }

  // Filter visible questions
  const visibleQuestions = (panel.questions || []).filter(
    (q) => q && q.visible
  );

  // Filter visible nested panels
  const visiblePanels = (panel.panels || []).filter(
    (p) => p && p.visible
  );

  const hasContent = visibleQuestions.length > 0 || visiblePanels.length > 0;
  const showContent = !collapsible || expanded;

  // Create style configuration
  const styleConfig: PanelStyleConfig = {
    theme,
    isRTL,
  };

  // Get dynamic styles based on nesting level and configuration
  const containerStyles = getPanelContainerStyle({
    nestingLevel: effectiveNestingLevel,
    customStyle: style,
    isVisible: panel.visible,
    config: styleConfig,
  });

  const contentStyles = getContentContainerStyle({
    nestingLevel: effectiveNestingLevel,
    isCollapsed: !showContent,
    config: styleConfig,
  });

  return (
    <View 
      style={containerStyles} 
      testID={`panel-${panel.name}`}
    >
      {/* Panel Header with collapsible functionality */}
      {panel.title && (
        <PanelHeader
          title={panel.title}
          description={panel.description}
          collapsible={collapsible}
          expanded={expanded}
          onToggle={setExpanded}
          testID={`panel-header-${panel.name}`}
        />
      )}

      {/* Legacy title/description display for panels without collapsible */}
      {!panel.title && panel.description && (
        <View style={styles.descriptionContainer} testID={`panel-description-${panel.name}`}>
          <Text style={styles.description}>{panel.description}</Text>
        </View>
      )}

      {/* Panel Content */}
      {showContent && hasContent && (
        <View style={contentStyles}>
          {/* Render Questions */}
          {visibleQuestions.map((question) => (
            <View key={question.name} style={styles.questionContainer}>
              <QuestionFactory question={question} />
            </View>
          ))}

          {/* Render Nested Panels */}
          {visiblePanels.map((nestedPanel, index) => (
            <PanelNestingProvider
              key={`${panelKey}-${nestedPanel.name}-${index}`}
              nestingLevel={effectiveNestingLevel + 1}
              panelPath={newPanelPath}
              panelNamesInPath={newPanelNamesInPath}
              maxNestingDepth={maxNestingDepth}
            >
              <View style={getNestedPanelStyle(effectiveNestingLevel + 1, styleConfig)}>
                <PanelContent 
                  panel={nestedPanel} 
                  collapsible={collapsible}
                  initialExpanded={initialExpanded}
                  nestingLevel={effectiveNestingLevel + 1}
                  theme={theme}
                  isRTL={isRTL}
                />
              </View>
            </PanelNestingProvider>
          ))}
        </View>
      )}
    </View>
  );
};

/**
 * Main Panel component that provides initial context
 */
export const Panel: React.FC<PanelProps> = (props) => {
  
  // If already within a context, use PanelContent directly
  const existingContext = React.useContext(PanelNestingContext);
  if (existingContext && existingContext.nestingLevel > 0) {
    return <PanelContent {...props} />;
  }
  
  // Otherwise, provide initial context
  const initialNamesInPath = useMemo(() => new Set<string>(), []);
  const initialPath: string[] = useMemo(() => [], []);
  
  return (
    <PanelNestingProvider
      nestingLevel={0}
      panelPath={initialPath}
      panelNamesInPath={initialNamesInPath}
      maxNestingDepth={10}
    >
      <PanelContent {...props} />
    </PanelNestingProvider>
  );
};

const styles = StyleSheet.create({
  descriptionContainer: {
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  questionContainer: {
    marginBottom: 12,
  },
});