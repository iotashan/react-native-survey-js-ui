import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { Panel, PanelHeader } from 'react-native-survey-js-ui';
import { Model } from 'survey-core';

export const PanelHeaderDemo: React.FC = () => {
  // Create a survey model with panels
  const surveyJson = {
    elements: [
      {
        type: 'panel',
        name: 'personalInfo',
        title: 'Personal Information',
        description: 'Please provide your basic information',
        elements: [
          {
            type: 'text',
            name: 'firstName',
            title: 'First Name',
            isRequired: true,
          },
          {
            type: 'text',
            name: 'lastName',
            title: 'Last Name',
            isRequired: true,
          },
        ],
      },
      {
        type: 'panel',
        name: 'contactDetails',
        title: 'Contact Details',
        description: 'How can we reach you?',
        elements: [
          {
            type: 'text',
            name: 'email',
            title: 'Email Address',
            inputType: 'email',
          },
          {
            type: 'text',
            name: 'phone',
            title: 'Phone Number',
            inputType: 'tel',
          },
        ],
      },
      {
        type: 'panel',
        name: 'preferences',
        title: 'Preferences',
        elements: [
          {
            type: 'text',
            name: 'notifications',
            title: 'Notification Preferences',
          },
        ],
      },
    ],
  };

  const survey = new Model(surveyJson);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Panel Header Component Demo</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Panel Headers</Text>
        <PanelHeader 
          title="Non-Collapsible Panel" 
          description="This panel cannot be collapsed"
        />
        
        <View style={{ height: 16 }} />
        
        <PanelHeader 
          title="Collapsible Panel (Expanded)" 
          description="Click to collapse/expand"
          collapsible
        />
        
        <View style={{ height: 16 }} />
        
        <PanelHeader 
          title="Initially Collapsed Panel" 
          description="This panel starts collapsed"
          collapsible
          initialExpanded={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Survey Panels with Collapsible Feature</Text>
        {survey.pages?.[0]?.panels?.map((panel, index) => (
          <View key={panel.name} style={{ marginBottom: 16 }}>
            <Panel 
              panel={panel} 
              collapsible={true}
              initialExpanded={index === 0} // First panel expanded
            />
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Styled Headers</Text>
        <PanelHeader 
          title="Custom Styled Header" 
          description="With custom colors and styling"
          collapsible
          style={{ backgroundColor: '#e3f2fd', borderRadius: 12 }}
          titleStyle={{ color: '#1976d2', fontSize: 20 }}
          descriptionStyle={{ color: '#42a5f5' }}
        />
        
        <View style={{ height: 16 }} />
        
        <PanelHeader 
          title="Minimal Header" 
          collapsible
          showIcon={false}
          style={{ backgroundColor: 'transparent', paddingHorizontal: 0 }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nested Panels Example</Text>
        <View style={styles.nestedExample}>
          <PanelHeader 
            title="Parent Panel" 
            description="Contains nested panels"
            collapsible
          />
          <View style={styles.nestedContent}>
            <PanelHeader 
              title="Child Panel 1" 
              collapsible
              style={{ backgroundColor: '#f5f5f5' }}
            />
            <PanelHeader 
              title="Child Panel 2" 
              collapsible
              style={{ backgroundColor: '#f5f5f5' }}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    textAlign: 'center',
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  nestedExample: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  nestedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});