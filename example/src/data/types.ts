import { QuestionModel } from 'react-native-survey-js-ui';

export enum QuestionCategory {
  TextInput = 'Text Input',
  Selection = 'Selection',
  Rating = 'Rating',
  Matrix = 'Matrix',
  Advanced = 'Advanced',
  Display = 'Display',
  Layout = 'Layout',
}

export interface ComponentProperty {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required?: boolean;
  defaultValue?: any;
  options?: any[];
}

export interface ComponentInfo {
  type: string;
  name: string;
  description: string;
  category: QuestionCategory;
  icon: string;
  tags: string[];
  properties: ComponentProperty[];
  example: QuestionModel;
}