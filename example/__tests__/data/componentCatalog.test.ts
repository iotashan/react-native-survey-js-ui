import {
  componentCatalog,
  QuestionCategory,
  getCategorizedComponents,
  searchComponents,
  getComponentByType,
} from '../../src/data/componentCatalog';

describe('Component Catalog', () => {
  describe('componentCatalog', () => {
    it('should contain all supported question types', () => {
      const expectedTypes = [
        'text',
        'radiogroup',
        'checkbox',
        'dropdown',
        'comment',
        'rating',
        'boolean',
        'matrix',
        'matrixdropdown',
        'matrixdynamic',
        'multipletext',
        'panel',
        'paneldynamic',
        'html',
        'expression',
        'file',
        'imagepicker',
      ];

      const catalogTypes = componentCatalog.map((component) => component.type);

      expectedTypes.forEach((type) => {
        expect(catalogTypes).toContain(type);
      });
    });

    it('should have proper structure for each component', () => {
      componentCatalog.forEach((component) => {
        expect(component).toHaveProperty('type');
        expect(component).toHaveProperty('name');
        expect(component).toHaveProperty('description');
        expect(component).toHaveProperty('category');
        expect(component).toHaveProperty('icon');
        expect(component).toHaveProperty('tags');
        expect(component).toHaveProperty('properties');
        expect(component).toHaveProperty('example');

        expect(typeof component.type).toBe('string');
        expect(typeof component.name).toBe('string');
        expect(typeof component.description).toBe('string');
        expect(Object.values(QuestionCategory)).toContain(component.category);
        expect(typeof component.icon).toBe('string');
        expect(Array.isArray(component.tags)).toBe(true);
        expect(Array.isArray(component.properties)).toBe(true);
        expect(typeof component.example).toBe('object');
      });
    });

    it('should have unique types', () => {
      const types = componentCatalog.map((c) => c.type);
      const uniqueTypes = new Set(types);
      expect(types.length).toBe(uniqueTypes.size);
    });
  });

  describe('getCategorizedComponents', () => {
    it('should return components grouped by category', () => {
      const categorized = getCategorizedComponents();

      expect(typeof categorized).toBe('object');

      Object.keys(categorized).forEach((category) => {
        expect(Object.values(QuestionCategory)).toContain(category);
        expect(Array.isArray(categorized[category])).toBe(true);
        expect(categorized[category].length).toBeGreaterThan(0);

        categorized[category].forEach((component) => {
          expect(component.category).toBe(category);
        });
      });
    });

    it('should include all components from catalog', () => {
      const categorized = getCategorizedComponents();
      const totalComponents = Object.values(categorized).reduce(
        (sum, components) => sum + components.length,
        0
      );

      expect(totalComponents).toBe(componentCatalog.length);
    });
  });

  describe('searchComponents', () => {
    it('should return all components when query is empty', () => {
      const results = searchComponents('');
      expect(results).toEqual(componentCatalog);
    });

    it('should search by component name (case insensitive)', () => {
      const results = searchComponents('text');

      results.forEach((component) => {
        const matchesName = component.name.toLowerCase().includes('text');
        const matchesType = component.type.toLowerCase().includes('text');
        const matchesDescription = component.description
          .toLowerCase()
          .includes('text');
        const matchesTags = component.tags.some((tag) =>
          tag.toLowerCase().includes('text')
        );

        expect(
          matchesName || matchesType || matchesDescription || matchesTags
        ).toBe(true);
      });
    });

    it('should search by tags', () => {
      const results = searchComponents('input');

      expect(results.length).toBeGreaterThan(0);
      results.forEach((component) => {
        const hasTag = component.tags.some((tag) =>
          tag.toLowerCase().includes('input')
        );
        const inDescription = component.description
          .toLowerCase()
          .includes('input');
        const inName = component.name.toLowerCase().includes('input');

        expect(hasTag || inDescription || inName).toBe(true);
      });
    });

    it('should return empty array for no matches', () => {
      const results = searchComponents('xyznonexistent123');
      expect(results).toEqual([]);
    });
  });

  describe('getComponentByType', () => {
    it('should return component for valid type', () => {
      const textComponent = getComponentByType('text');
      expect(textComponent).toBeDefined();
      expect(textComponent?.type).toBe('text');
    });

    it('should return undefined for invalid type', () => {
      const component = getComponentByType('invalidtype');
      expect(component).toBeUndefined();
    });
  });

  describe('Component properties', () => {
    it('should have appropriate properties for text input', () => {
      const textComponent = getComponentByType('text');
      const propNames = textComponent?.properties.map((p) => p.name) || [];

      expect(propNames).toContain('inputType');
      expect(propNames).toContain('placeholder');
      expect(propNames).toContain('maxLength');
    });

    it('should have appropriate properties for radiogroup', () => {
      const radioComponent = getComponentByType('radiogroup');
      const propNames = radioComponent?.properties.map((p) => p.name) || [];

      expect(propNames).toContain('choices');
      expect(propNames).toContain('hasOther');
      expect(propNames).toContain('otherText');
    });

    it('should have appropriate properties for rating', () => {
      const ratingComponent = getComponentByType('rating');
      const propNames = ratingComponent?.properties.map((p) => p.name) || [];

      expect(propNames).toContain('rateMin');
      expect(propNames).toContain('rateMax');
      expect(propNames).toContain('rateStep');
    });
  });

  describe('Component examples', () => {
    it('should have valid example for each component', () => {
      componentCatalog.forEach((component) => {
        expect(component.example).toHaveProperty('type', component.type);
        expect(component.example).toHaveProperty('name');

        // HTML and Expression components don't require title
        if (component.type !== 'html' && component.type !== 'expression') {
          expect(component.example).toHaveProperty('title');
        }
      });
    });
  });
});
