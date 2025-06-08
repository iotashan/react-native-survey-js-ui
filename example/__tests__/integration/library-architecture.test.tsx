import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  Survey,
  validateSurveyModel,
  BaseQuestion,
  TextQuestion,
  QuestionFactory,
} from 'react-native-survey-js-ui';
import App from '../../src/App';
import SurveyDemoScreen from '../../src/screens/SurveyDemoScreen';
// ExploreScreen is imported but not used in these tests
// import ExploreScreen from '../../src/screens/ExploreScreen';

// Mock the survey library
jest.mock('react-native-survey-js-ui');
