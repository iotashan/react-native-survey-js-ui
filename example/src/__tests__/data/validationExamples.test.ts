import { validationExamples } from '../../data/validationExamples';
import { validateSurveyModel } from 'react-native-survey-js-ui';

describe('Validation Examples', () => {
  describe('Required Fields Example', () => {
    const example = validationExamples.find(e => e.id === 'required-fields');

    it('should have valid survey model', () => {
      expect(example).toBeDefined();
      expect(validateSurveyModel(example!.model)).toBe(true);
    });

    it('should have required field validators', () => {
      const firstNameElement = example!.model.pages![0]!.elements![0];
      expect(firstNameElement.isRequired).toBe(true);
      expect(firstNameElement.requiredErrorText).toBe('First name is required');
    });

    it('should have email validator', () => {
      const emailElement = example!.model.pages![1]!.elements![0];
      expect(emailElement.validators).toBeDefined();
      expect(emailElement.validators![0].type).toBe('email');
    });

    it('should have regex validator for phone', () => {
      const phoneElement = example!.model.pages![1]!.elements![1];
      expect(phoneElement.validators).toBeDefined();
      expect(phoneElement.validators![0].type).toBe('regex');
      expect(phoneElement.validators![0].regex).toBe('^[0-9]{10}$');
    });
  });

  describe('Validation Modes Example', () => {
    const example = validationExamples.find(e => e.id === 'validation-modes');

    it('should have real-time validation mode', () => {
      expect(example).toBeDefined();
      expect(example!.model.checkErrorsMode).toBe('onValueChanged');
    });

    it('should have text length validator', () => {
      const usernameElement = example!.model.pages![0]!.elements![0];
      expect(usernameElement.validators![0].type).toBe('text');
      expect(usernameElement.validators![0].minLength).toBe(4);
      expect(usernameElement.validators![0].maxLength).toBe(12);
    });

    it('should have expression validator for password match', () => {
      const confirmPasswordElement = example!.model.pages![0]!.elements![2];
      expect(confirmPasswordElement.validators![0].type).toBe('expression');
      expect(confirmPasswordElement.validators![0].expression).toBe('{password} = {confirmPassword}');
    });
  });

  describe('Custom Validation Example', () => {
    const example = validationExamples.find(e => e.id === 'custom-validation');

    it('should have numeric range validator', () => {
      const ageElement = example!.model.pages![0]!.elements![0];
      expect(ageElement.validators![0].type).toBe('numeric');
      expect(ageElement.validators![0].minValue).toBe(18);
      expect(ageElement.validators![0].maxValue).toBe(100);
    });

    it('should have expression validator for credit limit', () => {
      const creditLimitElement = example!.model.pages![0]!.elements![2];
      expect(creditLimitElement.validators![0].type).toBe('expression');
      expect(creditLimitElement.validators![0].expression).toBe('{creditLimit} <= {income} * 0.3');
    });

    it('should have conditional validators for country-specific formats', () => {
      const zipCodeElement = example!.model.pages![0]!.elements![4];
      expect(zipCodeElement.validators).toHaveLength(2);
      expect(zipCodeElement.validators![0].expression).toContain('USA');
      expect(zipCodeElement.validators![1].expression).toContain('Canada');
    });
  });

  describe('Complex Validation Example', () => {
    const example = validationExamples.find(e => e.id === 'complex-validation');

    it('should have conditional visibility and required rules', () => {
      const workPermitElement = example!.model.pages![0]!.elements![3];
      expect(workPermitElement.visibleIf).toBe("{citizenship} = 'No'");
      expect(workPermitElement.requiredIf).toBe("{citizenship} = 'No'");
    });

    it('should have graduation year range validator', () => {
      const graduationYearElement = example!.model.pages![1]!.elements![2];
      expect(graduationYearElement.validators![0].minValue).toBe(1950);
      expect(graduationYearElement.validators![0].maxValue).toBeLessThanOrEqual(new Date().getFullYear());
    });

    it('should have conditional field requirements based on previous answers', () => {
      const experienceDescElement = example!.model.pages![2]!.elements![2];
      expect(experienceDescElement.visibleIf).toBe("{hasExperience} = 'Yes'");
      expect(experienceDescElement.requiredIf).toBe("{hasExperience} = 'Yes'");
    });
  });

  describe('Error Customization Example', () => {
    const example = validationExamples.find(e => e.id === 'error-customization');

    it('should have custom error messages with emojis', () => {
      const productCodeElement = example!.model.pages![0]!.elements![0];
      expect(productCodeElement.requiredErrorText).toContain('⚠️');
      expect(productCodeElement.validators![0].text).toContain('❌');
    });

    it('should have optional field with validation', () => {
      const discountCodeElement = example!.model.pages![0]!.elements![2];
      expect(discountCodeElement.isRequired).toBeUndefined();
      expect(discountCodeElement.validators).toBeDefined();
      expect(discountCodeElement.validators![0].regex).toBe('^(SAVE[0-9]{2}|DISCOUNT[0-9]{2}|)$');
    });
  });

  describe('All Examples', () => {
    it('should have unique IDs', () => {
      const ids = validationExamples.map(e => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid models', () => {
      validationExamples.forEach(example => {
        expect(validateSurveyModel(example.model)).toBe(true);
      });
    });

    it('should have titles and descriptions', () => {
      validationExamples.forEach(example => {
        expect(example.title).toBeTruthy();
        expect(example.description).toBeTruthy();
        expect(example.model.title).toBeTruthy();
      });
    });

    it('should have at least one page with elements', () => {
      validationExamples.forEach(example => {
        expect(example.model.pages).toBeDefined();
        expect(example.model.pages!.length).toBeGreaterThan(0);
        expect(example.model.pages![0]!.elements).toBeDefined();
        expect(example.model.pages![0]!.elements!.length).toBeGreaterThan(0);
      });
    });
  });
});