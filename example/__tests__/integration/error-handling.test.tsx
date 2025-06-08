import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from '../../src/App';
import SurveyDemoScreen from '../../src/screens/SurveyDemoScreen';
// Survey examples are imported but commented out as they're not used in these tests
// import { surveyExamples } from '../../src/data/surveyExamples';

// Mock the survey library
jest.mock('react-native-survey-js-ui');


