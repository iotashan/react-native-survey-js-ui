import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Survey, useSurveyModel } from 'react-native-survey-js-ui';
import { getComponentByType } from '../data/componentCatalog';
import { ComponentInfo } from '../data/types';

type ComponentDetailsStackParamList = {
  ComponentDetails: { componentType: string };
};

type ComponentDetailsScreenNavigationProp = StackNavigationProp<
  ComponentDetailsStackParamList,
  'ComponentDetails'
>;

type ComponentDetailsScreenRouteProp = RouteProp<
  ComponentDetailsStackParamList,
  'ComponentDetails'
>;

interface Props {
  navigation: ComponentDetailsScreenNavigationProp;
  route: ComponentDetailsScreenRouteProp;
}

// List of implemented components
const IMPLEMENTED_COMPONENTS = ['text', 'comment', 'panel'];

export default function ComponentDetailsScreen({ navigation, route }: Props) {
  const { componentType } = route.params;
  const [showCode, setShowCode] = useState(false);
  
  // Get component info
  const component = useMemo(() => {
    return getComponentByType(componentType);
  }, [componentType]);

  // Create survey model for live demo
  const surveyJson = useMemo(() => {
    if (!component?.example) return null;
    
    return {
      title: `${component.name} Demo`,
      showProgressBar: 'off' as const,
      pages: [
        {
          name: 'demo',
          elements: [component.example],
        },
      ],
    };
  }, [component]);

  const { model, loading, error } = useSurveyModel(surveyJson);

  // Check if component is implemented
  const isImplemented = component && IMPLEMENTED_COMPONENTS.includes(component.type);

  const handleBack = () => {
    navigation.goBack();
  };

  // Handle unknown component
  if (!component) {
    return (
      <SafeAreaView style={styles.container} testID="component-details-error">
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            testID="back-button"
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer} testID="error-container">
          <Text style={styles.errorTitle} testID="error-title">Component Not Found</Text>
          <Text style={styles.errorText} testID="error-message">
            The requested component type "{componentType}" was not found in the catalog.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderProperty = (property: any, index: number) => (
    <View key={property.name} style={styles.propertyItem} testID={`property-item-${property.name}`}>
      <View style={styles.propertyHeader} testID={`property-header-${property.name}`}>
        <Text style={styles.propertyName} testID={`property-name-${property.name}`}>{property.name}</Text>
        <Text style={styles.propertyType} testID={`property-type-${property.name}`}>{property.type}</Text>
        {property.required && (
          <View style={styles.requiredBadge} testID={`property-required-${property.name}`}>
            <Text style={styles.requiredText} testID={`property-required-text-${property.name}`}>required</Text>
          </View>
        )}
      </View>
      <Text style={styles.propertyDescription} testID={`property-desc-${property.name}`}>{property.description}</Text>
      {property.defaultValue !== undefined && (
        <Text style={styles.propertyDefault} testID={`property-default-${property.name}`}>
          Default: {JSON.stringify(property.defaultValue)}
        </Text>
      )}
      {property.options && (
        <Text style={styles.propertyOptions} testID={`property-options-${property.name}`}>
          Options: {property.options.join(', ')}
        </Text>
      )}
    </View>
  );

  const renderLiveDemo = () => {
    if (loading) {
      return (
        <View style={styles.demoContainer} testID="demo-loading">
          <Text style={styles.loadingText} testID="loading-text">Loading demo...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.demoContainer} testID="demo-error">
          <Text style={styles.errorText} testID="demo-error-text">Error loading demo: {error.message}</Text>
        </View>
      );
    }

    if (isImplemented && model) {
      return (
        <View style={styles.demoContainer} testID="live-demo-container">
          <Survey model={model} testID="survey-demo" />
        </View>
      );
    }

    return (
      <View style={styles.placeholderContainer} testID="placeholder-container">
        <View style={styles.placeholderBadge} testID="not-implemented-badge">
          <Text style={styles.placeholderBadgeText} testID="not-implemented-text">Not Implemented Yet</Text>
        </View>
        <Text style={styles.placeholderText} testID="placeholder-description">
          This component is not yet implemented in the React Native library.
          Below is the JSON configuration that will be supported:
        </Text>
        <View style={styles.jsonPreview} testID="json-preview">
          <Text style={styles.jsonText} testID="json-text">
            {JSON.stringify(component.example, null, 2)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} testID="component-details-screen">
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} testID="component-details-scroll">
        {/* Header */}
        <View style={styles.header} testID="header-section">
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            testID="back-button"
            accessibilityLabel="Go back to component list"
          >
            <Text style={styles.backButtonText} testID="back-button-text">← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Component Info */}
        <View style={styles.componentInfo} testID="component-info-section">
          <View style={styles.componentHeader} testID="component-header">
            <Text 
              style={styles.componentIcon}
              testID={`component-icon-${component.type}`}
              accessibilityLabel={`${component.name} icon`}
            >
              {component.icon}
            </Text>
            <View style={styles.componentTitleContainer} testID="component-title-container">
              <Text style={styles.componentName} testID="component-name">{component.name}</Text>
              <Text style={styles.componentType} testID="component-type">{component.type}</Text>
            </View>
          </View>
          
          <Text style={styles.componentDescription} testID="component-description">{component.description}</Text>
          
          {/* Tags */}
          <View style={styles.tagContainer} testID="tags-container">
            {component.tags.map((tag) => (
              <View key={tag} style={styles.tag} testID={`tag-${tag}`}>
                <Text style={styles.tagText} testID={`tag-text-${tag}`}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Live Demo / Placeholder */}
        <View style={styles.section} testID="demo-section">
          <Text style={styles.sectionTitle} testID="demo-section-title">
            {isImplemented ? 'Live Demo' : 'Preview'}
          </Text>
          {renderLiveDemo()}
        </View>

        {/* Properties */}
        {component.properties && component.properties.length > 0 && (
          <View style={styles.section} testID="properties-section">
            <Text style={styles.sectionTitle} testID="properties-section-title">Properties</Text>
            <View testID="properties-list">
              {component.properties.map((prop, index) => renderProperty(prop, index))}
            </View>
          </View>
        )}

        {/* Code Example */}
        <View style={styles.section} testID="code-section">
          <TouchableOpacity
            style={styles.codeToggle}
            onPress={() => setShowCode(!showCode)}
            testID="code-toggle-button"
            accessibilityLabel={showCode ? 'Hide code example' : 'Show code example'}
          >
            <Text style={styles.codeToggleText} testID="code-toggle-text">
              {showCode ? 'Hide Code' : 'Show Code'}
            </Text>
          </TouchableOpacity>
          
          {showCode && (
            <View style={styles.codeContainer} testID="code-snippet">
              <Text style={styles.codeTitle} testID="code-title">JSON Configuration:</Text>
              <View style={styles.codeBlock} testID="json-example">
                <Text style={styles.codeText} testID="json-code-text">
                  {JSON.stringify(component.example, null, 2)}
                </Text>
              </View>
            </View>
          )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  componentInfo: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 8,
  },
  componentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  componentIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  componentTitleContainer: {
    flex: 1,
  },
  componentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  componentType: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  componentDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  demoContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#fafafa',
  },
  placeholderContainer: {
    alignItems: 'center',
    padding: 20,
  },
  placeholderBadge: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  placeholderBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  jsonPreview: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    width: '100%',
  },
  jsonText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
  },
  propertyItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  propertyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  propertyType: {
    fontSize: 14,
    color: '#007AFF',
    fontStyle: 'italic',
    marginRight: 8,
  },
  requiredBadge: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requiredText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  propertyDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  propertyDefault: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  propertyOptions: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  codeToggle: {
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 16,
  },
  codeToggleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  codeContainer: {
    marginTop: 8,
  },
  codeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  codeBlock: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});