import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SurveyDemoScreen } from '../screens';
import ExploreStackNavigator from './ExploreStackNavigator';

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
        tabBarTestID: 'main-tab-bar',
      }}
    >
      <Tab.Screen
        name="SurveyDemo"
        component={SurveyDemoScreen}
        options={{
          title: 'Survey Demo',
          tabBarLabel: 'Survey Demo',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="clipboard-outline" size={size} color={color} />
          ),
          tabBarTestID: 'tab-survey-demo',
          tabBarAccessibilityLabel: 'Survey Demo Tab',
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreStackNavigator}
        options={{
          title: 'Explore',
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
          tabBarTestID: 'tab-explore',
          tabBarAccessibilityLabel: 'Explore Components Tab',
        }}
      />
    </Tab.Navigator>
  );
}
