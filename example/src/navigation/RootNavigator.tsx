import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import PanelDemoScreen from '../screens/PanelDemoScreen';

export type RootStackParamList = {
  Main: undefined;
  ComponentDetails: {
    componentType: string;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen
        name="ComponentDetails"
        component={PanelDemoScreen}
        options={{
          headerShown: true,
          headerTitle: 'Component Demo',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
}