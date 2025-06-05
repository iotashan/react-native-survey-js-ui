import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SurveyDemoScreen, ExploreScreen } from '../screens';

export type RootTabParamList = {
  SurveyDemo: undefined;
  Explore: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="SurveyDemo"
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="SurveyDemo"
        component={SurveyDemoScreen}
        options={{
          title: 'Survey Demo',
          tabBarLabel: 'Survey Demo',
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: 'Explore',
          tabBarLabel: 'Explore',
        }}
      />
    </Tab.Navigator>
  );
}
