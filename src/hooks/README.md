# Enhanced Required Field Validation

The `usePageValidation` hook has been enhanced to provide comprehensive required field validation with the following features:

## Features Implemented

### 1. Enhanced Empty Value Detection
- Detects `null`, `undefined`, empty strings, and whitespace-only strings as invalid
- Handles array-based questions (checkboxes) - empty arrays are invalid
- Handles object-based questions (matrix) - empty objects or objects with all falsy values are invalid

### 2. Contextual Error Messages
- Generates question-type-specific error messages:
  - Text questions: \"This field is required\"
  - Radio/Dropdown: \"Please select an option\"
  - Checkbox: \"Please select at least one option\"
  - Matrix: \"Please answer all required rows\"
  - Rating: \"Please provide a rating\"
  - File: \"Please upload a file\"
  - etc.

### 3. Custom Required Error Messages
- Supports `requiredErrorText` property on questions for custom messages
- Falls back to contextual messages if no custom text provided

### 4. Custom Validators Support
- Supports `answercount` validator for minimum/maximum selection requirements
- Validates checkbox questions with `minCount` and `maxCount` requirements
- Extensible for other validator types

### 5. Integration with Question Components
- `QuestionFactory` automatically integrates enhanced validation
- `BaseQuestion` displays validation errors with proper styling
- Real-time validation on value changes

## Usage

### Basic Usage with usePageValidation

```typescript
import { usePageValidation } from '../hooks/usePageValidation';

function MyComponent({ surveyModel }) {
  const { validationState, validateCurrentPage, validateQuestion } = usePageValidation(surveyModel);
  
  // Check if page is valid
  const handleNext = () => {
    if (validateCurrentPage()) {
      // Proceed to next page
    } else {
      // Show validation errors
      console.log('Validation errors:', validationState.errors);
    }
  };
  
  return (
    <div>
      {validationState.hasErrors && (
        <div>Please fix the following errors:</div>
      )}
      {/* Render questions */}
    </div>
  );
}
```

### Integration with QuestionFactory

```typescript
import { QuestionFactory } from '../components/Questions/QuestionFactory';

function SurveyPage({ surveyModel, questions }) {
  return (
    <div>
      {questions.map(question => (
        <QuestionFactory
          key={question.name}
          question={question}
          model={surveyModel}
          onChange={(value) => {
            // Update question value in model
            surveyModel.setValue(question.name, value);
          }}
        />
      ))}
    </div>
  );
}
```

### Custom Required Error Messages

```typescript
const question = {
  name: 'email',
  type: 'text',
  title: 'Email Address',
  isRequired: true,
  requiredErrorText: 'Please provide your email address to continue'
};
```

### Custom Validators

```typescript
const question = {
  name: 'interests',
  type: 'checkbox',
  title: 'Select your interests',
  isRequired: true,
  choices: ['Sports', 'Music', 'Art', 'Travel'],
  validators: [{
    type: 'answercount',
    minCount: 2,
    text: 'Please select at least 2 interests'
  }]
};
```

## Validation Flow

1. **On Value Change**: When a question value changes, validation is triggered automatically
2. **On Page Validation**: When `validateCurrentPage()` is called, all questions on the current page are validated
3. **On Survey Completion**: When `validateAllPages()` is called, all questions in the survey are validated

## Error State Management

- Validation errors are stored in `validationState.errors` as a record of question names to error arrays
- Each question can have multiple validation errors
- Errors are displayed in the UI through the `BaseQuestion` component
- Errors persist across page navigation until resolved

## Performance Considerations

- Validation is debounced for real-time scenarios to avoid excessive re-renders
- Individual question validation is efficient and only updates state when errors change
- Batch validation is used for page-level and survey-level validation

## Testing

Comprehensive test suites are provided:
- `usePageValidation.enhanced.test.tsx` - Tests core validation logic
- `QuestionFactory.required.test.tsx` - Tests UI integration

Run tests with:
```bash
npm test -- --testPathPattern=\"usePageValidation.enhanced|QuestionFactory.required\"
```