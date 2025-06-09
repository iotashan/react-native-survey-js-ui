import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Survey, useSurveyModel } from 'react-native-survey-js-ui';
import {
  panelDemoComponents,
  panelCodeSnippets,
  createPanelDemoSurvey,
  performanceTestPanel,
  defaultPanelDemoConfig,
} from '../data/panelExamples';

interface Props {
  route: {
    params: {
      componentType: string;
    };
  };
  navigation: any;
}

export default function PanelDemoScreen({ route, navigation }: Props) {
  const { componentType } = route.params;
  const [showCode, setShowCode] = useState(defaultPanelDemoConfig.showCode);
  const [showPerformanceTest, setShowPerformanceTest] = useState(false);
  const [allExpanded, setAllExpanded] = useState(true);

  // Find the panel demo component
  const panelDemo = panelDemoComponents.find((c) => c.type === componentType);
  
  if (!panelDemo) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Panel demo not found</Text>
      </SafeAreaView>
    );
  }

  // Create survey model with the panel
  const surveyJson = showPerformanceTest
    ? createPanelDemoSurvey([performanceTestPanel])
    : createPanelDemoSurvey([panelDemo.example]);

  const { model, error } = useSurveyModel(surveyJson);

  const handleToggleAll = useCallback(() => {
    if (!model) return;
    
    // Toggle all panels in the survey
    const panels = model.getAllPanels();
    panels.forEach((panel) => {
      if (panel.state !== undefined) {
        panel.state = allExpanded ? 'collapsed' : 'expanded';
      }
    });
    
    setAllExpanded(!allExpanded);
  }, [model, allExpanded]);

  const handleComplete = useCallback((results: any) => {
    Alert.alert(
      'Survey Completed',
      `Results: ${JSON.stringify(results, null, 2)}`,
      [{ text: 'OK' }]
    );
  }, []);

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Error loading panel demo: {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{panelDemo.name}</Text>
          <Text style={styles.description}>{panelDemo.description}</Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Show Code</Text>
            <Switch value={showCode} onValueChange={setShowCode} />
          </View>

          {componentType !== 'panel-empty' && (
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Performance Test</Text>
              <Switch
                value={showPerformanceTest}
                onValueChange={setShowPerformanceTest}
              />
            </View>
          )}

          {(componentType === 'panel-collapsible' ||
            componentType === 'panel-nested' ||
            showPerformanceTest) && (
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={handleToggleAll}
            >
              <Text style={styles.toggleButtonText}>
                {allExpanded ? 'Collapse All' : 'Expand All'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Code Snippet */}
        {showCode && panelCodeSnippets[componentType] && (
          <View style={styles.codeContainer}>
            <Text style={styles.codeTitle}>Code Example:</Text>
            <ScrollView horizontal style={styles.codeScrollView}>
              <Text style={styles.codeText}>
                {panelCodeSnippets[componentType]}
              </Text>
            </ScrollView>
          </View>
        )}

        {/* Panel Demo */}
        <View style={styles.demoContainer}>
          <Text style={styles.demoTitle}>Live Demo:</Text>
          {model ? (
            <Survey model={model} onComplete={handleComplete} />
          ) : (
            <Text style={styles.loadingText}>Loading...</Text>
          )}
        </View>

        {/* Properties */}
        <View style={styles.propertiesContainer}>
          <Text style={styles.propertiesTitle}>Properties:</Text>
          {panelDemo.properties.map((prop) => (
            <View key={prop.name} style={styles.propertyItem}>
              <Text style={styles.propertyName}>
                {prop.name}
                {prop.required && ' *'}
              </Text>
              <Text style={styles.propertyType}>{prop.type}</Text>
              <Text style={styles.propertyDescription}>{prop.description}</Text>
              {prop.defaultValue !== undefined && (
                <Text style={styles.propertyDefault}>
                  Default: {String(prop.defaultValue)}
                </Text>
              )}
              {prop.options && (
                <Text style={styles.propertyOptions}>
                  Options: {prop.options.join(', ')}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Best Practices */}
        <View style={styles.bestPracticesContainer}>
          <Text style={styles.bestPracticesTitle}>Best Practices:</Text>
          <Text style={styles.bestPracticeItem}>
            • Use panels to group related questions together
          </Text>
          <Text style={styles.bestPracticeItem}>
            • Keep nesting levels reasonable (max 3-4 levels)
          </Text>
          <Text style={styles.bestPracticeItem}>
            • Provide clear titles and descriptions for panels
          </Text>
          <Text style={styles.bestPracticeItem}>
            • Use collapsible panels for optional or advanced sections
          </Text>
          <Text style={styles.bestPracticeItem}>
            • Consider mobile screen size when designing panel layouts
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
  },
  controls: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  controlLabel: {
    fontSize: 16,
    color: '#333',
  },
  toggleButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  codeContainer: {
    backgroundColor: '#1e1e1e',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  codeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  codeScrollView: {
    maxHeight: 200,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#d4d4d4',
    lineHeight: 20,
  },
  demoContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  propertiesContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  propertiesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  propertyItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  propertyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  propertyType: {
    fontSize: 14,
    color: '#007AFF',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  propertyDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  propertyDefault: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  propertyOptions: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  bestPracticesContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 8,
  },
  bestPracticesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  bestPracticeItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    margin: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    margin: 20,
  },
});