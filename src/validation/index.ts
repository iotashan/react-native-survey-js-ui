/**
 * Custom Validation Foundation
 * 
 * This module provides an extensible custom validation system that integrates
 * with survey-core's validator architecture while supporting React Native patterns.
 * 
 * Features:
 * - Custom validator registration and management
 * - Support for synchronous and asynchronous validation
 * - Integration with survey-core's validation system
 * - TypeScript support for custom validator creation
 * - Performance optimizations for mobile devices
 * - Error message templating with placeholders
 */

export {
  CustomValidator,
  ValidatorRegistry,
  type CustomValidationError,
  type ValidationRuleFunction,
  type AsyncValidationRule,
  type ValidationFunction,
  type CustomValidationRule,
} from './CustomValidator';

// Import for local use
import { ValidatorRegistry, CustomValidator } from './CustomValidator';

/**
 * Common validation rules that can be registered globally
 */
export const CommonValidationRules = {
  /**
   * Minimum length validation
   */
  minLength: (minLength: number) => (value: string) => {
    if (!value || typeof value !== 'string') return false;
    return value.length >= minLength;
  },

  /**
   * Maximum length validation
   */
  maxLength: (maxLength: number) => (value: string) => {
    if (!value || typeof value !== 'string') return true; // Empty is valid for maxLength
    return value.length <= maxLength;
  },

  /**
   * Email format validation
   */
  email: (value: string) => {
    if (!value) return true; // Empty is valid unless required
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  /**
   * Numeric value validation
   */
  numeric: (value: any) => {
    if (!value) return true; // Empty is valid unless required
    return !isNaN(Number(value));
  },

  /**
   * URL format validation
   */
  url: (value: string) => {
    if (!value) return true; // Empty is valid unless required
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Phone number validation (basic format)
   */
  phoneNumber: (value: string) => {
    if (!value) return true; // Empty is valid unless required
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
  },

  /**
   * Async validation example - simulates API call
   */
  uniqueUsername: async (value: string): Promise<boolean> => {
    if (!value) return true;
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock validation - consider usernames starting with 'admin' as taken
    return !value.toLowerCase().startsWith('admin');
  },
};

/**
 * Register common validation rules globally
 */
export function registerCommonValidationRules(): void {
  ValidatorRegistry.register(
    'minLength5',
    CommonValidationRules.minLength(5),
    'Value must be at least 5 characters long'
  );

  ValidatorRegistry.register(
    'maxLength50',
    CommonValidationRules.maxLength(50),
    'Value must not exceed 50 characters'
  );

  ValidatorRegistry.register(
    'email',
    CommonValidationRules.email,
    'Please enter a valid email address'
  );

  ValidatorRegistry.register(
    'numeric',
    CommonValidationRules.numeric,
    'Value must be a number'
  );

  ValidatorRegistry.register(
    'url',
    CommonValidationRules.url,
    'Please enter a valid URL'
  );

  ValidatorRegistry.register(
    'phoneNumber',
    CommonValidationRules.phoneNumber,
    'Please enter a valid phone number'
  );

  ValidatorRegistry.register(
    'uniqueUsername',
    CommonValidationRules.uniqueUsername,
    'Username is already taken'
  );
}

/**
 * Helper function to create custom validators with common patterns
 */
export function createCustomValidator(
  ruleName: string,
  validationFunction: any,
  errorMessage?: string
): any {
  return new CustomValidator(ruleName, validationFunction, errorMessage);
}

/**
 * Helper function to create regex-based validators
 */
export function createRegexValidator(
  ruleName: string,
  regex: RegExp,
  errorMessage: string,
  allowEmpty: boolean = true
): any {
  const validationFunction = (value: string) => {
    if (!value && allowEmpty) return true;
    if (!value && !allowEmpty) return false;
    return regex.test(value);
  };

  return new CustomValidator(ruleName, validationFunction, errorMessage);
}