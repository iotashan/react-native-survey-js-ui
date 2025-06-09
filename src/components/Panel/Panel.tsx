import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PanelModel } from 'survey-core';
import { QuestionFactory } from '../Questions/QuestionFactory';
import { PanelHeader } from './PanelHeader';

export interface PanelProps {
  panel: PanelModel | null | undefined;
  collapsible?: boolean;
  initialExpanded?: boolean;
}

export const Panel: React.FC<PanelProps> = ({ 
  panel, 
  collapsible = false,
  initialExpanded = true 
}) => {
  const [expanded, setExpanded] = useState(initialExpanded);

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

  return (
    <View style={styles.container} testID={`panel-${panel.name}`}>
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
        <View style={styles.contentContainer}>
          {/* Render Questions */}
          {visibleQuestions.map((question) => (
            <View key={question.name} style={styles.questionContainer}>
              <QuestionFactory question={question} />
            </View>
          ))}

          {/* Render Nested Panels */}
          {visiblePanels.map((nestedPanel) => (
            <View key={nestedPanel.name} style={styles.nestedPanelContainer}>
              <Panel 
                panel={nestedPanel} 
                collapsible={collapsible}
                initialExpanded={initialExpanded}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  descriptionContainer: {
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  contentContainer: {
    marginTop: 12,
  },
  questionContainer: {
    marginBottom: 12,
  },
  nestedPanelContainer: {
    marginLeft: 16,
    marginTop: 8,
  },
});