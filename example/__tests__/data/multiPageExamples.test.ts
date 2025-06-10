import { 
  multiPageNavigationExamples,
  basicMultiPageExample,
  validationFlowExample,
  dynamicPageCountExample,
  conditionalPagesExample,
  emptyPageHandlingExample,
  complexValidationExample,
  navigationEventsExample,
  getMultiPageExampleById,
} from '../../src/data/multiPageExamples';

describe('multiPageExamples', () => {
  describe('example structure', () => {
    it('should have all required examples', () => {
      expect(multiPageNavigationExamples).toHaveLength(7);
      
      const expectedIds = [
        'basic-multipage',
        'validation-flow',
        'dynamic-page-count',
        'conditional-pages',
        'empty-page-handling',
        'complex-validation-navigation',
        'navigation-events',
      ];
      
      const actualIds = multiPageNavigationExamples.map(e => e.id);
      expect(actualIds).toEqual(expectedIds);
    });

    it('should have valid structure for each example', () => {
      multiPageNavigationExamples.forEach(example => {
        expect(example).toHaveProperty('id');
        expect(example).toHaveProperty('title');
        expect(example).toHaveProperty('description');
        expect(example).toHaveProperty('model');
        expect(example.model).toHaveProperty('pages');
        expect(Array.isArray(example.model.pages)).toBe(true);
        expect(example.model.pages.length).toBeGreaterThan(0);
      });
    });
  });

  describe('basicMultiPageExample', () => {
    it('should have 3 pages with navigation', () => {
      expect(basicMultiPageExample.model.pages).toHaveLength(3);
      expect(basicMultiPageExample.model.showProgressBar).toBe('top');
      expect(basicMultiPageExample.model.title).toBe('Customer Satisfaction Survey');
    });

    it('should have proper page structure', () => {
      const pages = basicMultiPageExample.model.pages!;
      expect(pages[0].name).toBe('page1');
      expect(pages[0].title).toBe('Welcome');
      expect(pages[1].name).toBe('page2');
      expect(pages[1].title).toBe('Your Experience');
      expect(pages[2].name).toBe('page3');
      expect(pages[2].title).toBe('Thank You');
    });
  });

  describe('validationFlowExample', () => {
    it('should have validation on page change', () => {
      expect(validationFlowExample.model.checkErrorsMode).toBe('onNextPage');
      expect(validationFlowExample.model.showProgressBar).toBe('bottom');
    });

    it('should have required fields and validators', () => {
      const firstPage = validationFlowExample.model.pages![0];
      const elements = firstPage.elements!;
      
      // Check required fields
      expect(elements[0].isRequired).toBe(true);
      expect(elements[1].isRequired).toBe(true);
      expect(elements[2].isRequired).toBe(true);
      
      // Check validators
      expect(elements[2].validators).toBeDefined();
      expect(elements[2].validators![0].type).toBe('numeric');
    });
  });

  describe('dynamicPageCountExample', () => {
    it('should have conditional page visibility', () => {
      const pages = dynamicPageCountExample.model.pages!;
      
      // Check conditional visibility
      expect(pages[1].visibleIf).toBe('{productUser} = "Yes"');
      expect(pages[2].visibleIf).toBe('{userType} = "Business" or {userType} = "Enterprise"');
      expect(pages[3].visibleIf).toBe('{productUser} = "No"');
    });

    it('should show progress by questions', () => {
      expect(dynamicPageCountExample.model.progressBarType).toBe('questions');
    });
  });

  describe('conditionalPagesExample', () => {
    it('should have insurance-specific pages', () => {
      const pages = conditionalPagesExample.model.pages!;
      
      expect(pages[1].name).toBe('autoInsurance');
      expect(pages[1].visibleIf).toBe('{insuranceCategory} = "Auto"');
      
      expect(pages[2].name).toBe('homeInsurance');
      expect(pages[2].visibleIf).toBe('{insuranceCategory} = "Home"');
      
      expect(pages[3].name).toBe('lifeInsurance');
      expect(pages[3].visibleIf).toBe('{insuranceCategory} = "Life"');
    });
  });

  describe('emptyPageHandlingExample', () => {
    it('should have conditionally visible questions', () => {
      const page2 = emptyPageHandlingExample.model.pages![1];
      const elements = page2.elements!;
      
      elements.forEach(element => {
        expect(element.visibleIf).toBe('{showQuestions} = "Yes"');
      });
    });
  });

  describe('complexValidationExample', () => {
    it('should have multiple validation rules', () => {
      const pages = complexValidationExample.model.pages!;
      
      // Check password validation
      const securityPage = pages[2];
      const passwordField = securityPage.elements!.find(e => e.name === 'password');
      expect(passwordField?.validators![0].type).toBe('regex');
      
      // Check cross-field validation
      const confirmPasswordField = securityPage.elements!.find(e => e.name === 'confirmPassword');
      expect(confirmPasswordField?.validators![0].type).toBe('expression');
      expect(confirmPasswordField?.validators![0].expression).toBe('{password} = {confirmPassword}');
    });

    it('should validate on next page', () => {
      expect(complexValidationExample.model.checkErrorsMode).toBe('onNextPage');
      expect(complexValidationExample.model.showProgressBar).toBe('both');
    });
  });

  describe('navigationEventsExample', () => {
    it('should have timer panel', () => {
      expect(navigationEventsExample.model.showTimerPanel).toBe('top');
      expect(navigationEventsExample.model.maxTimeToFinish).toBe(300); // 5 minutes
    });

    it('should have HTML element for instructions', () => {
      const firstPage = navigationEventsExample.model.pages![0];
      const htmlElement = firstPage.elements!.find(e => e.type === 'html');
      expect(htmlElement).toBeDefined();
      expect(htmlElement?.name).toBe('introText');
    });
  });

  describe('getMultiPageExampleById', () => {
    it('should return correct example by ID', () => {
      const example = getMultiPageExampleById('basic-multipage');
      expect(example).toBe(basicMultiPageExample);
    });

    it('should return undefined for invalid ID', () => {
      const example = getMultiPageExampleById('non-existent');
      expect(example).toBeUndefined();
    });
  });
});