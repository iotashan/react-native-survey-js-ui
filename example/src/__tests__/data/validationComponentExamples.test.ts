import { validationComponentExamples } from '../../data/validationComponentExamples';
import { QuestionCategory } from '../../data/types';

describe('Validation Component Examples', () => {
  describe('Required Field Example', () => {
    const component = validationComponentExamples.find(c => c.type === 'text-required');

    it('should have correct properties', () => {
      expect(component).toBeDefined();
      expect(component!.name).toBe('Required Text Input');
      expect(component!.category).toBe(QuestionCategory.TextInput);
    });

    it('should have isRequired set to true in example', () => {
      expect(component!.example.isRequired).toBe(true);
      expect(component!.example.requiredErrorText).toBe('Please enter your name');
    });
  });

  describe('Email Validation Example', () => {
    const component = validationComponentExamples.find(c => c.type === 'text-email');

    it('should have email input type and validators', () => {
      expect(component).toBeDefined();
      expect(component!.example.inputType).toBe('email');
      expect(component!.example.validators).toBeDefined();
      expect(component!.example.validators![0].type).toBe('email');
    });
  });

  describe('Numeric Range Example', () => {
    const component = validationComponentExamples.find(c => c.type === 'text-numeric');

    it('should have numeric validator with range', () => {
      expect(component).toBeDefined();
      expect(component!.example.inputType).toBe('number');
      expect(component!.example.validators![0].type).toBe('numeric');
      expect(component!.example.validators![0].minValue).toBe(18);
      expect(component!.example.validators![0].maxValue).toBe(120);
    });
  });

  describe('Text Length Example', () => {
    const component = validationComponentExamples.find(c => c.type === 'text-length');

    it('should have text length validator', () => {
      expect(component).toBeDefined();
      expect(component!.example.validators![0].type).toBe('text');
      expect(component!.example.validators![0].minLength).toBe(4);
      expect(component!.example.validators![0].maxLength).toBe(12);
      expect(component!.example.maxLength).toBe(12);
    });
  });

  describe('Pattern Validation Example', () => {
    const component = validationComponentExamples.find(c => c.type === 'text-pattern');

    it('should have regex validator', () => {
      expect(component).toBeDefined();
      expect(component!.example.validators![0].type).toBe('regex');
      expect(component!.example.validators![0].regex).toBe('^[0-9]{10}$');
      expect(component!.example.inputType).toBe('tel');
    });
  });

  describe('Checkbox Minimum Selection Example', () => {
    const component = validationComponentExamples.find(c => c.type === 'checkbox-min');

    it('should have answer count validator', () => {
      expect(component).toBeDefined();
      expect(component!.category).toBe(QuestionCategory.Selection);
      expect(component!.example.validators![0].type).toBe('answercount');
      expect(component!.example.validators![0].minCount).toBe(2);
    });

    it('should have multiple choices', () => {
      expect(component!.example.choices).toBeDefined();
      expect(component!.example.choices.length).toBeGreaterThan(2);
    });
  });

  describe('Expression Validation Example', () => {
    const component = validationComponentExamples.find(c => c.type === 'text-expression');

    it('should have expression validator', () => {
      expect(component).toBeDefined();
      expect(component!.category).toBe(QuestionCategory.Advanced);
      expect(component!.example.validators![0].type).toBe('expression');
      expect(component!.example.validators![0].expression).toContain('{password}');
    });
  });

  describe('Custom Error Messages Example', () => {
    const component = validationComponentExamples.find(c => c.type === 'text-custom-error');

    it('should have custom error messages with emojis', () => {
      expect(component).toBeDefined();
      expect(component!.example.requiredErrorText).toContain('⚠️');
      expect(component!.example.validators![0].text).toContain('❌');
    });
  });

  describe('Conditional Validation Example', () => {
    const component = validationComponentExamples.find(c => c.type === 'text-conditional');

    it('should have conditional properties', () => {
      expect(component).toBeDefined();
      expect(component!.example.visibleIf).toBe("{citizenship} = 'No'");
      expect(component!.example.requiredIf).toBe("{citizenship} = 'No'");
    });
  });

  describe('All Components', () => {
    it('should have unique types', () => {
      const types = validationComponentExamples.map(c => c.type);
      const uniqueTypes = new Set(types);
      expect(uniqueTypes.size).toBe(types.length);
    });

    it('should have required metadata', () => {
      validationComponentExamples.forEach(component => {
        expect(component.type).toBeTruthy();
        expect(component.name).toBeTruthy();
        expect(component.description).toBeTruthy();
        expect(component.category).toBeTruthy();
        expect(component.icon).toBeTruthy();
        expect(component.tags).toBeDefined();
        expect(component.tags.length).toBeGreaterThan(0);
        expect(component.example).toBeDefined();
      });
    });

    it('should have validation-related tags', () => {
      validationComponentExamples.forEach(component => {
        expect(component.tags.some(tag => tag.includes('validation'))).toBe(true);
      });
    });

    it('should have valid categories', () => {
      const validCategories = Object.values(QuestionCategory);
      validationComponentExamples.forEach(component => {
        expect(validCategories).toContain(component.category);
      });
    });
  });
});