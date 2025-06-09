import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ExploreScreen, ComponentDetailsScreen } from '../screens';

export type ExploreStackParamList = {
  ExploreList: undefined;
  ComponentDetails: { componentType: string };
};

const Stack = createStackNavigator<ExploreStackParamList>();

export default function ExploreStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="ExploreList"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="ExploreList"
        component={ExploreScreen}
        options={{
          title: 'Explore Components',
        }}
      />
      <Stack.Screen
        name="ComponentDetails"
        component={ComponentDetailsScreen}
        options={{
          title: 'Component Details',
        }}
      />
    </Stack.Navigator>
  );
}