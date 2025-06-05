import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

// Placeholder for future component catalog
const LIBRARY_VERSION = '0.1.0'; // This will be dynamic in future

export default function ExploreScreen() {
  return (
    <ScrollView style={styles.container} testID="explore-screen">
      <View style={styles.header}>
        <Text style={styles.title}>Explore Components</Text>
        <Text style={styles.subtitle}>
          Interactive catalog of survey components
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Library Version: {LIBRARY_VERSION}</Text>
        <Text style={styles.infoText}>
          This component catalog will showcase all available question types and
          features of the react-native-survey-js-ui library.
        </Text>
      </View>

      <View style={styles.placeholderSection}>
        <Text style={styles.sectionTitle}>Question Types</Text>
        <View style={styles.placeholderItem}>
          <Text style={styles.placeholderText}>• Text Input Questions</Text>
        </View>
        <View style={styles.placeholderItem}>
          <Text style={styles.placeholderText}>
            • Multiple Choice Questions
          </Text>
        </View>
        <View style={styles.placeholderItem}>
          <Text style={styles.placeholderText}>• Rating Questions</Text>
        </View>
        <View style={styles.placeholderItem}>
          <Text style={styles.placeholderText}>• Matrix Questions</Text>
        </View>
      </View>

      <View style={styles.placeholderSection}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.placeholderItem}>
          <Text style={styles.placeholderText}>• Validation Rules</Text>
        </View>
        <View style={styles.placeholderItem}>
          <Text style={styles.placeholderText}>• Conditional Logic</Text>
        </View>
        <View style={styles.placeholderItem}>
          <Text style={styles.placeholderText}>• Custom Theming</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  infoCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  placeholderSection: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  placeholderItem: {
    paddingVertical: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
  },
});
