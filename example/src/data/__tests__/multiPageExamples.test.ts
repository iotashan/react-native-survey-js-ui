import { multiPageNavigationExamples } from '../multiPageExamples';

describe('Multi-Page Navigation Examples', () => {
  it('should have all required example configurations', () => {
    expect(multiPageNavigationExamples).toHaveLength(7);
    
    const requiredExamples = [
      'basic-multipage',
      'validation-flow',
      'dynamic-page-count',
      'conditional-pages',
      'empty-page-handling',
      'complex-validation-navigation',
      'navigation-events'
    ];
    
    requiredExamples.forEach(id => {
      const example = multiPageNavigationExamples.find(e => e.id === id);
      expect(example).toBeDefined();
      expect(example?.title).toBeTruthy();
      expect(example?.description).toBeTruthy();
      expect(example?.model).toBeDefined();
    });
  });

  describe('Basic Multi-Page Navigation', () => {
    const example = multiPageNavigationExamples.find(e => e.id === 'basic-multipage');
    
    it('should have multiple pages with navigation', () => {
      expect(example?.model.pages).toHaveLength(3);
      expect(example?.model.showProgressBar).toBe('top');
      expect(example?.model.showNavigationButtons).toBe('bottom');
    });
    
    it('should have questions on each page', () => {
      example?.model.pages?.forEach(page => {
        expect(page.elements).toBeDefined();
        expect(page.elements!.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Validation Flow Example', () => {
    const example = multiPageNavigationExamples.find(e => e.id === 'validation-flow');
    
    it('should have required questions that block navigation', () => {
      expect(example?.model.pages).toBeDefined();
      const firstPage = example?.model.pages?.[0];
      const requiredQuestions = firstPage?.elements?.filter(q => q.isRequired);
      expect(requiredQuestions?.length).toBeGreaterThan(0);
    });
    
    it('should have validation rules', () => {
      const hasValidation = example?.model.pages?.some(page => 
        page.elements?.some(q => q.validators && q.validators.length > 0)
      );
      expect(hasValidation).toBe(true);
    });
  });

  describe('Dynamic Page Count Example', () => {
    const example = multiPageNavigationExamples.find(e => e.id === 'dynamic-page-count');
    
    it('should have visible expressions for dynamic pages', () => {
      const dynamicPages = example?.model.pages?.filter(page => page.visibleIf);
      expect(dynamicPages?.length).toBeGreaterThan(0);
    });
  });

  describe('Conditional Pages Example', () => {
    const example = multiPageNavigationExamples.find(e => e.id === 'conditional-pages');
    
    it('should have conditional logic for page visibility', () => {
      const conditionalPages = example?.model.pages?.filter(page => page.visibleIf);
      expect(conditionalPages?.length).toBeGreaterThan(0);
    });
  });

  describe('Complex Validation Example', () => {
    const example = multiPageNavigationExamples.find(e => e.id === 'complex-validation-navigation');
    
    it('should have cross-field validation', () => {
      const hasExpressionValidation = example?.model.pages?.some(page => 
        page.elements?.some(q => 
          q.validators?.some(v => v.type === 'expression')
        )
      );
      expect(hasExpressionValidation).toBe(true);
    });
  });

  describe('Navigation Events Example', () => {
    const example = multiPageNavigationExamples.find(e => e.id === 'navigation-events');
    
    it('should be configured for event tracking', () => {
      expect(example?.model.showProgressBar).toBeDefined();
      expect(example?.model.pages?.length).toBeGreaterThan(2);
    });
  });
});