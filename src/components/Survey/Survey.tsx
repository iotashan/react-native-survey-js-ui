import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import type {
  SurveyModel,
  SurveyValueChangedHandler,
  SurveyCurrentPageChangedHandler,
} from '../../types';
import { useSurveyModel } from '../../hooks';
import { useSurveyState } from '../../hooks';
import { usePageNavigation } from '../../hooks';
import { usePageValidation } from '../../hooks';
import { PageNavigation } from '../PageNavigation';
import { ProgressIndicator } from '../ProgressIndicator';
import { SurveyPage } from './SurveyPage';

export interface SurveyProps {
  model: SurveyModel;
  onComplete?: (result: any) => void;
  onValueChanged?: SurveyValueChangedHandler;
  onCurrentPageChanged?: SurveyCurrentPageChangedHandler;
}

export const Survey: React.FC<SurveyProps> = ({
  model,
  onComplete,
  onValueChanged,
  onCurrentPageChanged,
}) => {
  const { model: surveyModel, isLoading, error } = useSurveyModel(model);
  const surveyState = useSurveyState(surveyModel);
  const { navigationState, goToNextPage, goToPreviousPage, completeSurvey } = usePageNavigation(surveyModel);
  const { validateCurrentPage } = usePageValidation(surveyModel);

  React.useEffect(() => {
    if (surveyModel && onComplete) {
      const handleComplete = (sender: any) => {
        onComplete({
          timestamp: new Date().toISOString(),
          surveyId: model['id'] || 'survey',
          data: sender.data,
        });
      };

      surveyModel.onComplete.add(handleComplete);
      return () => {
        surveyModel.onComplete.remove(handleComplete);
      };
    }
    return undefined;
  }, [surveyModel, onComplete, model]);

  // Handle value changed events
  React.useEffect(() => {
    if (surveyModel && onValueChanged) {
      const handleValueChanged = (sender: any, options: any) => {
        try {
          // survey-core passes the event data as the second parameter or directly on sender
          const eventData = options || sender;
          onValueChanged({
            name: eventData?.name || '',
            value: eventData?.value,
            oldValue: eventData?.oldValue,
            question: eventData?.question,
          });
        } catch (error) {
          console.error('Error in onValueChanged handler:', error);
        }
      };

      surveyModel.onValueChanged.add(handleValueChanged);
      return () => {
        surveyModel.onValueChanged.remove(handleValueChanged);
      };
    }
    return undefined;
  }, [surveyModel, onValueChanged]);

  // Handle page changed events
  React.useEffect(() => {
    if (surveyModel && onCurrentPageChanged) {
      const handleCurrentPageChanged = (sender: any, options: any) => {
        try {
          // survey-core passes the event data as the second parameter or directly on sender
          const eventData = options || sender;
          onCurrentPageChanged({
            oldCurrentPage: eventData?.oldCurrentPage,
            newCurrentPage: eventData?.newCurrentPage,
            isNextPage: eventData?.isNextPage,
            isPrevPage: eventData?.isPrevPage,
          });
        } catch (error) {
          console.error('Error in onCurrentPageChanged handler:', error);
        }
      };

      surveyModel.onCurrentPageChanged.add(handleCurrentPageChanged);
      return () => {
        surveyModel.onCurrentPageChanged.remove(handleCurrentPageChanged);
      };
    }
    return undefined;
  }, [surveyModel, onCurrentPageChanged]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading survey...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error loading survey:</Text>
        <Text style={styles.errorDetail}>{error.message}</Text>
      </View>
    );
  }

  // Navigation is now handled by the usePageNavigation hook

  const showProgressBar =
    Boolean(surveyModel?.showProgressBar && surveyModel.showProgressBar !== 'off');

  return (
    <View style={styles.container} testID="survey-container">
      <ProgressIndicator
        currentPage={surveyState.currentPageNo}
        totalPages={surveyState.pageCount}
        mode="both"
        visible={showProgressBar}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {model.title && <Text style={styles.title}>{model.title}</Text>}

        {/* Render current page using SurveyPage component */}
        {surveyModel && surveyModel.currentPage ? (
          <SurveyPage 
            page={surveyModel.currentPage} 
            surveyId={model['id'] || 'survey'}
            onQuestionValueChange={(name, value) => {
              surveyModel.setValue(name, value);
            }}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholder}>
              No page to display
            </Text>
          </View>
        )}
      </ScrollView>

      {!surveyState.isCompleted && (
        <PageNavigation
          navigationState={navigationState}
          onNext={() => goToNextPage(validateCurrentPage)}
          onPrevious={goToPreviousPage}
          onComplete={() => completeSurvey(validateCurrentPage)}
        />
      )}

      {surveyState.isCompleted && (
        <View style={styles.completedContainer}>
          <Text style={styles.completedText}>Survey Completed!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  placeholderContainer: {
    paddingVertical: 20,
  },
  placeholder: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  completedContainer: {
    alignItems: 'center',
    padding: 20,
  },
  completedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});
