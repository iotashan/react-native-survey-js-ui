import { SurveyValidator, JsonObject, Question, SurveyModel, ValidatorResult, CustomError } from 'survey-core';

/**
 * Custom validation error result interface
 */
export interface CustomValidationError {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Validation rule function type for synchronous validation
 */
export type ValidationRuleFunction = (
  value: any,
  fieldName: string | null,
  allValues?: any,
  properties?: any
) => boolean | CustomValidationError;

/**
 * Async validation rule function type
 */
export type AsyncValidationRule = (
  value: any,
  fieldName: string | null,
  allValues?: any,
  properties?: any
) => Promise<boolean | CustomValidationError>;

/**
 * Combined type for all validation rule functions
 */
export type ValidationFunction = ValidationRuleFunction | AsyncValidationRule;

/**
 * Custom validation rule configuration
 */
export interface CustomValidationRule {
  validationFunction: ValidationFunction;
  defaultErrorMessage?: string;
  isAsync?: boolean;
}

/**
 * Custom validator class that extends survey-core's SurveyValidator
 * Supports both synchronous and asynchronous validation
 */
export class CustomValidator extends SurveyValidator {
  public ruleName: string;
  public validationFunction: ValidationFunction;
  private cache: Map<string, ValidatorResult> = new Map();
  private lastValidationPromise: Promise<any> | null = null;
  
  // Properties from SurveyValidator that we need to override/implement
  public text: string = '';
  public errorOwner: any = null;
  public onAsyncCompleted: ((result: ValidatorResult) => void) | null = null;

  constructor(
    ruleName: string,
    validationFunction: ValidationFunction,
    errorMessage?: string
  ) {
    super();
    this.ruleName = ruleName;
    this.validationFunction = validationFunction;
    
    if (errorMessage) {
      this.text = errorMessage;
    }
  }

  /**
   * Check if this validator performs async validation
   */
  public get isAsync(): boolean {
    return this.isAsyncFunction(this.validationFunction);
  }

  /**
   * Check if validation is currently running (for async validators)
   */
  public get isRunning(): boolean {
    return this.lastValidationPromise !== null;
  }

  /**
   * Main validation method
   */
  public validate(
    value: any,
    name: string | null = null,
    values: any = null,
    properties: any = null
  ): ValidatorResult | null {
    const cacheKey = this.getCacheKey(value, name);
    
    // Check cache for performance optimization
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      if (this.isAsync) {
        // Handle async validation
        this.handleAsyncValidation(value, name, values, properties, cacheKey);
        return null; // Async validation returns null initially
      } else {
        // Handle sync validation
        const result = this.handleSyncValidation(value, name, values, properties);
        this.cache.set(cacheKey, result);
        return result;
      }
    } catch (error) {
      const errorResult = new ValidatorResult(
        value,
        new CustomError(this.text || 'Validation error', this.errorOwner)
      );
      this.cache.set(cacheKey, errorResult);
      return errorResult;
    }
  }

  /**
   * Handle synchronous validation
   */
  private handleSyncValidation(
    value: any,
    name: string | null,
    values: any,
    properties: any
  ): ValidatorResult | null {
    const syncValidationFunction = this.validationFunction as ValidationRuleFunction;
    const validationResult = syncValidationFunction(value, name, values, properties);
    
    if (this.isValidationPassed(validationResult)) {
      return null; // null means validation passed
    } else {
      const errorMessage = this.getErrorMessage(validationResult, name, value);
      const error = new CustomError(errorMessage, this.errorOwner);
      return new ValidatorResult(value, error);
    }
  }

  /**
   * Handle asynchronous validation
   */
  private async handleAsyncValidation(
    value: any,
    name: string | null,
    values: any,
    properties: any,
    cacheKey: string
  ): Promise<void> {
    const asyncFunction = this.validationFunction as AsyncValidationRule;
    
    this.lastValidationPromise = asyncFunction(value, name, values, properties)
      .then((validationResult) => {
        const result = this.isValidationPassed(validationResult)
          ? null
          : new ValidatorResult(
              value,
              new CustomError(this.getErrorMessage(validationResult, name, value), this.errorOwner)
            );
        
        this.cache.set(cacheKey, result);
        this.lastValidationPromise = null;
        
        if (this.onAsyncCompleted) {
          this.onAsyncCompleted(result);
        }
        
        return result;
      })
      .catch((error) => {
        const errorResult = new ValidatorResult(
          value,
          new CustomError(
            this.text || `Validation error: ${error.message}`,
            this.errorOwner
          )
        );
        
        this.cache.set(cacheKey, errorResult);
        this.lastValidationPromise = null;
        
        if (this.onAsyncCompleted) {
          this.onAsyncCompleted(errorResult);
        }
        
        return errorResult;
      });

    await this.lastValidationPromise;
  }

  /**
   * Check if validation function is async
   */
  private isAsyncFunction(fn: ValidationFunction): boolean {
    // Check if it's an async function
    if (fn.constructor.name === 'AsyncFunction') {
      return true;
    }
    
    // Check function string for async indicators
    const fnString = fn.toString();
    return fnString.includes('async ') || fnString.includes('Promise');
  }

  /**
   * Check if validation result indicates success
   */
  private isValidationPassed(result: boolean | CustomValidationError): boolean {
    if (typeof result === 'boolean') {
      return result;
    }
    return result.isValid;
  }

  /**
   * Get error message from validation result or use default
   */
  private getErrorMessage(
    result: boolean | CustomValidationError,
    fieldName: string,
    value: any
  ): string {
    let message = '';
    
    if (typeof result === 'object' && result.errorMessage) {
      message = result.errorMessage;
    } else {
      message = this.text || this.getDefaultErrorText(fieldName);
    }
    
    // Replace placeholders in error message
    return this.replacePlaceholders(message, fieldName, value);
  }

  /**
   * Replace placeholders in error messages
   */
  private replacePlaceholders(message: string, fieldName: string, value: any): string {
    return message
      .replace(/{fieldName}/g, fieldName || 'field')
      .replace(/{value}/g, String(value));
  }

  /**
   * Generate cache key for validation results
   */
  private getCacheKey(value: any, name: string | null): string {
    return `${this.ruleName}:${name || 'field'}:${JSON.stringify(value)}`;
  }

  /**
   * Get default error text for the field
   */
  protected getDefaultErrorText(name: string): string {
    return `Validation failed for field "${name}"`;
  }

  /**
   * Integration with usePageValidation hook
   * Validates a question using this custom validator and integrates with page validation
   */
  public static validateQuestionWithCustomValidator(
    question: Question,
    customValidator: CustomValidator,
    onValidationComplete?: (isValid: boolean, errors: string[]) => void
  ): boolean {
    try {
      const result = customValidator.validate(
        question.value,
        question.name,
        null,
        question
      );

      if (customValidator.isAsync) {
        // Handle async validation
        if (customValidator.onAsyncCompleted) {
          const originalCallback = customValidator.onAsyncCompleted;
          customValidator.onAsyncCompleted = (asyncResult) => {
            const isValid = !asyncResult || !asyncResult.error;
            const errors = isValid ? [] : [asyncResult?.error?.text || 'Validation failed'];
            
            if (onValidationComplete) {
              onValidationComplete(isValid, errors);
            }
            
            // Call original callback if it existed
            if (originalCallback) {
              originalCallback(asyncResult);
            }
          };
        }
        
        // Return true initially for async validation
        return true;
      } else {
        // Handle sync validation
        const isValid = !result || !result.error;
        const errors = isValid ? [] : [result?.error?.text || 'Validation failed'];
        
        if (onValidationComplete) {
          onValidationComplete(isValid, errors);
        }
        
        return isValid;
      }
    } catch (error) {
      const errors = [`Validation error: ${error.message || error}`];
      if (onValidationComplete) {
        onValidationComplete(false, errors);
      }
      return false;
    }
  }

  /**
   * Create validation helper for usePageValidation integration
   * Returns a function that can be used with usePageValidation's validateSingleQuestion
   */
  public static createPageValidationHelper(
    customValidators: CustomValidator[],
    setValidationState?: (updater: (prev: any) => any) => void
  ) {
    return (question: Question): string[] => {
      const errors: string[] = [];
      
      // Run all custom validators for this question
      customValidators.forEach(validator => {
        try {
          const result = validator.validate(
            question.value,
            question.name,
            null,
            question
          );
          
          if (validator.isAsync) {
            // For async validation, set up callback
            if (validator.onAsyncCompleted && setValidationState) {
              const originalCallback = validator.onAsyncCompleted;
              validator.onAsyncCompleted = (asyncResult) => {
                if (asyncResult && asyncResult.error) {
                  // Update validation state asynchronously
                  setValidationState((prev: any) => {
                    const newErrors = { ...prev.errors };
                    const questionErrors = newErrors[question.name] || [];
                    const errorText = asyncResult.error.text || 'Validation failed';
                    
                    if (!questionErrors.includes(errorText)) {
                      questionErrors.push(errorText);
                    }
                    
                    newErrors[question.name] = questionErrors;
                    
                    return {
                      ...prev,
                      errors: newErrors,
                      hasErrors: Object.keys(newErrors).length > 0,
                      validationMessages: Object.entries(newErrors).flatMap(([questionName, msgs]) =>
                        (msgs as string[]).map(message => ({ questionName, message }))
                      ),
                    };
                  });
                }
                
                // Call original callback
                if (originalCallback) {
                  originalCallback(asyncResult);
                }
              };
            }
          } else if (result && result.error) {
            // Add sync validation error
            errors.push(result.error.text || 'Validation failed');
          }
        } catch (error) {
          errors.push(`Validation error: ${error.message || error}`);
        }
      });
      
      return errors;
    };
  }

  /**
   * BaseQuestion validation flow integration
   * Validates a question and returns error string for BaseQuestion component
   */
  public static validateForBaseQuestion(
    question: Question,
    customValidators: CustomValidator[]
  ): string | null {
    const errors: string[] = [];
    
    // Run all custom validators for this question
    customValidators.forEach(validator => {
      try {
        const result = validator.validate(
          question.value,
          question.name,
          null,
          question
        );
        
        if (!validator.isAsync && result && result.error) {
          // Add sync validation error
          errors.push(result.error.text || 'Validation failed');
        }
        // Note: Async validation results would be handled separately via callbacks
      } catch (error) {
        errors.push(`Validation error: ${error.message || error}`);
      }
    });
    
    // Return first error message or null if no errors
    return errors.length > 0 ? errors[0] : null;
  }

  /**
   * Create BaseQuestion validation helper that manages async validation
   * Returns validation state and error handler for BaseQuestion integration
   */
  public static createBaseQuestionValidator(
    question: Question,
    customValidators: CustomValidator[],
    onErrorChange: (error: string | null) => void
  ) {
    let currentError: string | null = null;
    let pendingAsyncValidations = 0;
    
    const validateSync = (): string | null => {
      const errors: string[] = [];
      
      customValidators.forEach(validator => {
        if (!validator.isAsync) {
          try {
            const result = validator.validate(
              question.value,
              question.name,
              null,
              question
            );
            
            if (result && result.error) {
              errors.push(result.error.text || 'Validation failed');
            }
          } catch (error) {
            errors.push(`Validation error: ${error.message || error}`);
          }
        }
      });
      
      return errors.length > 0 ? errors[0] : null;
    };
    
    const validateAsync = (): void => {
      customValidators.forEach(validator => {
        if (validator.isAsync) {
          pendingAsyncValidations++;
          
          try {
            validator.validate(
              question.value,
              question.name,
              null,
              question
            );
            
            // Set up completion callback
            const originalCallback = validator.onAsyncCompleted;
            validator.onAsyncCompleted = (asyncResult) => {
              pendingAsyncValidations--;
              
              if (asyncResult && asyncResult.error) {
                const errorText = asyncResult.error.text || 'Validation failed';
                currentError = errorText;
                onErrorChange(errorText);
              } else if (pendingAsyncValidations === 0 && !currentError) {
                // All async validations completed without errors
                onErrorChange(null);
              }
              
              // Call original callback
              if (originalCallback) {
                originalCallback(asyncResult);
              }
            };
          } catch (error) {
            pendingAsyncValidations--;
            const errorText = `Validation error: ${error.message || error}`;
            currentError = errorText;
            onErrorChange(errorText);
          }
        }
      });
    };
    
    const validate = (): void => {
      // Reset current error
      currentError = null;
      
      // Run sync validation first
      const syncError = validateSync();
      if (syncError) {
        currentError = syncError;
        onErrorChange(syncError);
        return;
      }
      
      // Run async validation
      validateAsync();
    };
    
    return {
      validate,
      getCurrentError: () => currentError,
      isValidating: () => pendingAsyncValidations > 0,
    };
  }

  /**
   * JsonObject serialization support
   * Serializes the custom validator to a JsonObject format for survey-core
   */
  public toJsonObject(): any {
    return {
      type: 'custom',
      ruleName: this.ruleName,
      text: this.text,
      // Note: Validation functions cannot be serialized directly
      // They need to be registered in ValidatorRegistry and referenced by name
    };
  }

  /**
   * Create a CustomValidator from JsonObject format
   * This requires the validation function to be pre-registered in ValidatorRegistry
   */
  public static fromJsonObject(jsonObj: any): CustomValidator | null {
    try {
      if (jsonObj.type !== 'custom' || !jsonObj.ruleName) {
        return null;
      }

      if (!ValidatorRegistry.exists(jsonObj.ruleName)) {
        console.warn(`Custom validator rule "${jsonObj.ruleName}" not found in registry`);
        return null;
      }

      const rule = ValidatorRegistry.get(jsonObj.ruleName);
      if (!rule) {
        return null;
      }

      const validator = new CustomValidator(
        jsonObj.ruleName,
        rule.validationFunction,
        jsonObj.text || rule.defaultErrorMessage
      );

      return validator;
    } catch (error) {
      console.error('Error creating CustomValidator from JsonObject:', error);
      return null;
    }
  }

  /**
   * JsonObject property support for survey-core integration
   * Allows custom validators to be used in survey definitions
   */
  public getJsonObjectProperty(name: string): any {
    switch (name) {
      case 'type':
        return 'custom';
      case 'ruleName':
        return this.ruleName;
      case 'text':
        return this.text;
      case 'isAsync':
        return this.isAsync;
      default:
        return undefined;
    }
  }

  /**
   * Set JsonObject property for survey-core integration
   */
  public setJsonObjectProperty(name: string, value: any): void {
    switch (name) {
      case 'text':
        this.text = value;
        break;
      case 'ruleName':
        // Cannot change rule name after creation
        console.warn('Cannot change ruleName after CustomValidator creation');
        break;
      default:
        // Ignore unknown properties
        break;
    }
  }

  /**
   * Get serializable properties for JsonObject support
   */
  public getSerializableProperties(): string[] {
    return ['type', 'ruleName', 'text', 'isAsync'];
  }
}

/**
 * Global registry for custom validation rules
 */
export class ValidatorRegistry {
  private static rules: Map<string, CustomValidationRule> = new Map();

  /**
   * Register a custom validation rule globally
   */
  static register(
    ruleName: string,
    validationFunction: ValidationFunction,
    defaultErrorMessage?: string
  ): void {
    this.rules.set(ruleName, {
      validationFunction,
      defaultErrorMessage: defaultErrorMessage || '',
      isAsync: this.isAsyncFunction(validationFunction),
    });
  }

  /**
   * Get a registered validation rule
   */
  static get(ruleName: string): CustomValidationRule | undefined {
    return this.rules.get(ruleName);
  }

  /**
   * Check if a validation rule exists
   */
  static exists(ruleName: string): boolean {
    return this.rules.has(ruleName);
  }

  /**
   * Create a validator instance from a registered rule
   */
  static createValidator(ruleName: string, customErrorMessage?: string): CustomValidator {
    const rule = this.get(ruleName);
    if (!rule) {
      throw new Error(`Validation rule "${ruleName}" is not registered`);
    }

    const errorMessage = customErrorMessage || rule.defaultErrorMessage;
    return new CustomValidator(ruleName, rule.validationFunction, errorMessage);
  }

  /**
   * List all registered rule names
   */
  static listRegisteredRules(): string[] {
    return Array.from(this.rules.keys());
  }

  /**
   * Unregister a validation rule
   */
  static unregister(ruleName: string): boolean {
    return this.rules.delete(ruleName);
  }

  /**
   * Clear all registered rules (mainly for testing)
   */
  static clear(): void {
    this.rules.clear();
  }

  /**
   * Check if validation function is async
   */
  private static isAsyncFunction(fn: ValidationFunction): boolean {
    // Check if it's an async function
    if (fn.constructor.name === 'AsyncFunction') {
      return true;
    }
    
    // Check function string for async indicators
    const fnString = fn.toString();
    return fnString.includes('async ') || fnString.includes('Promise');
  }
}