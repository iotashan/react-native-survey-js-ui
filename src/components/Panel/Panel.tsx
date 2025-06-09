import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle, Dimensions } from 'react-native';
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

export interface PanelProps {
  panel: PanelModel | null | undefined;
  collapsible?: boolean;
  initialExpanded?: boolean;
  nestingLevel?: number;
  style?: ViewStyle;
  theme?: PanelTheme;
  isRTL?: boolean;
}

export const Panel: React.FC<PanelProps> = ({ 
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
    nestingLevel,
    customStyle: style,
    isVisible: panel.visible,
    config: styleConfig,
  });

  const contentStyles = getContentContainerStyle({
    nestingLevel,
    isCollapsed: !showContent,
    config: styleConfig,
  });

  return (
    <View style={containerStyles} testID={`panel-${panel.name}`}>
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
          {visiblePanels.map((nestedPanel) => (
            <View key={nestedPanel.name} style={getNestedPanelStyle(nestingLevel + 1, styleConfig)}>
              <Panel 
                panel={nestedPanel} 
                collapsible={collapsible}
                initialExpanded={initialExpanded}
                nestingLevel={nestingLevel + 1}
                theme={theme}
                isRTL={isRTL}
              />
            </View>
          ))}
        </View>
      )}
    </View>
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