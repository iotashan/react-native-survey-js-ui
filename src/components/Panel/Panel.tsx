import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PanelModel } from 'survey-core';
import { QuestionFactory } from '../Questions/QuestionFactory';

export interface PanelProps {
  panel: PanelModel | null | undefined;
}

export const Panel: React.FC<PanelProps> = ({ panel }) => {
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

  return (
    <View style={styles.container} testID={`panel-${panel.name}`}>
      {/* Panel Title */}
      {panel.title && (
        <View style={styles.titleContainer} testID={`panel-title-${panel.name}`}>
          <Text style={styles.title}>{panel.title}</Text>
        </View>
      )}

      {/* Panel Description */}
      {panel.description && (
        <View style={styles.descriptionContainer} testID={`panel-description-${panel.name}`}>
          <Text style={styles.description}>{panel.description}</Text>
        </View>
      )}

      {/* Render Questions */}
      {visibleQuestions.map((question) => (
        <View key={question.name} style={styles.questionContainer}>
          <QuestionFactory question={question} />
        </View>
      ))}

      {/* Render Nested Panels */}
      {visiblePanels.map((nestedPanel) => (
        <View key={nestedPanel.name} style={styles.nestedPanelContainer}>
          <Panel panel={nestedPanel} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  titleContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
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
  nestedPanelContainer: {
    marginLeft: 16,
    marginTop: 8,
  },
});