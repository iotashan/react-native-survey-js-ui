import { Model } from 'survey-core';
import { applyPolyfills } from './polyfills';

/**
 * Initialize survey-core for React Native environment
 * Handles platform-specific configuration
 */
export function initializeSurveyCore(): { platform: string; error?: boolean } {
  // Apply polyfills before any survey-core usage
  applyPolyfills();

  // For now, we just return a configuration object
  return {
    platform: 'react-native',
  };
}

/**
 * Create a survey model from JSON
 * @param json - SurveyJS JSON model
 * @returns Survey model instance
 */
export function createSurveyModel(json: any): Model {
  if (!json || typeof json !== 'object') {
    throw new Error('Invalid survey JSON provided');
  }

  try {
    return new Model(json);
  } catch (error: any) {
    throw new Error(`Failed to create survey model: ${error.message}`);
  }
}

/**
 * Dispose a survey model and clean up resources
 * @param model - Survey model to dispose
 */
export function disposeSurveyModel(model: Model | null | undefined): void {
  if (!model) {
    return;
  }

  if (typeof model.dispose === 'function') {
    model.dispose();
  }
}

/**
 * Survey Model Manager for tracking and managing survey instances
 * Helps prevent memory leaks by ensuring proper disposal
 */
export class SurveyModelManager {
  private static instances: Map<string, Model> = new Map();

  /**
   * Create and track a survey model
   * @param id - Unique identifier for the model
   * @param json - SurveyJS JSON model
   * @returns Survey model instance
   */
  static create(id: string, json: any): Model {
    // Dispose existing model with same id
    if (this.instances.has(id)) {
      this.dispose(id);
    }

    const model = createSurveyModel(json);
    this.instances.set(id, model);
    return model;
  }

  /**
   * Get a survey model by id
   * @param id - Model identifier
   * @returns Survey model or undefined
   */
  static get(id: string): Model | undefined {
    return this.instances.get(id);
  }

  /**
   * Dispose a survey model by id
   * @param id - Model identifier
   */
  static dispose(id: string): void {
    const model = this.instances.get(id);
    if (model) {
      disposeSurveyModel(model);
      this.instances.delete(id);
    }
  }

  /**
   * Dispose all tracked survey models
   */
  static disposeAll(): void {
    this.instances.forEach((model) => {
      disposeSurveyModel(model);
    });
    this.instances.clear();
  }

  /**
   * Get all active model IDs
   * @returns Array of model IDs
   */
  static getAll(): string[] {
    return Array.from(this.instances.keys());
  }
}
