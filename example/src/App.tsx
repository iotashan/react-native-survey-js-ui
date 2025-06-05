import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TabNavigator } from './navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container} testID="app-container">
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
