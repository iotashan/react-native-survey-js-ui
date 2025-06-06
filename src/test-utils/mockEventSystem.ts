/**
 * Mock event system that mirrors survey-core event patterns
 * Provides utilities for testing event-driven behavior
 */

export interface MockEvent<T = any> {
  name: string;
  handlers: Array<(sender: any, options: T) => void>;
  add: jest.Mock;
  remove: jest.Mock;
  fire: jest.Mock;
  hasHandlers: jest.Mock;
  clear: jest.Mock;
  isEmpty: boolean;
}

/**
 * Create a mock event that mimics survey-core event behavior
 */
export function createMockEvent<T = any>(name: string): MockEvent<T> {
  const handlers: Array<(sender: any, options: T) => void> = [];

  const event: MockEvent<T> = {
    name,
    handlers,
    add: jest.fn((handler: (sender: any, options: T) => void) => {
      if (!handlers.includes(handler)) {
        handlers.push(handler);
      }
    }),
    remove: jest.fn((handler: (sender: any, options: T) => void) => {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }),
    fire: jest.fn((sender: any, options: T) => {
      handlers.forEach((handler) => {
        try {
          handler(sender, options);
        } catch (error) {
          console.error(`Error in event handler for ${name}:`, error);
        }
      });
    }),
    hasHandlers: jest.fn(() => handlers.length > 0),
    clear: jest.fn(() => {
      handlers.length = 0;
    }),
    get isEmpty() {
      return handlers.length === 0;
    },
  };

  return event;
}

/**
 * Mock event emitter for testing components that use events
 */
export class MockEventEmitter {
  private events: Map<string, MockEvent> = new Map();

  /**
   * Get or create an event
   */
  public getEvent(name: string): MockEvent {
    if (!this.events.has(name)) {
      this.events.set(name, createMockEvent(name));
    }
    return this.events.get(name)!;
  }

  /**
   * Fire an event
   */
  public fireEvent(name: string, sender: any, options: any = {}): void {
    const event = this.getEvent(name);
    event.fire(sender, options);
  }

  /**
   * Add event handler
   */
  public on(name: string, handler: (sender: any, options: any) => void): void {
    const event = this.getEvent(name);
    event.add(handler);
  }

  /**
   * Remove event handler
   */
  public off(name: string, handler: (sender: any, options: any) => void): void {
    const event = this.getEvent(name);
    event.remove(handler);
  }

  /**
   * Clear all handlers for an event
   */
  public clearEvent(name: string): void {
    const event = this.events.get(name);
    if (event) {
      event.clear();
    }
  }

  /**
   * Clear all events
   */
  public clearAll(): void {
    this.events.forEach((event) => event.clear());
    this.events.clear();
  }

  /**
   * Get all registered event names
   */
  public getEventNames(): string[] {
    return Array.from(this.events.keys());
  }

  /**
   * Check if event has handlers
   */
  public hasHandlers(name: string): boolean {
    const event = this.events.get(name);
    return event ? event.hasHandlers() : false;
  }
}

/**
 * Create a spy for event handlers
 */
export function createEventSpy(name?: string): jest.Mock {
  const spy = jest.fn();
  spy.mockName(name || 'eventHandler');
  return spy;
}

/**
 * Wait for event to be fired (useful for async tests)
 */
export function waitForEvent(
  emitter: MockEventEmitter,
  eventName: string,
  timeout: number = 1000
): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for event: ${eventName}`));
    }, timeout);

    const handler = (sender: any, options: any) => {
      clearTimeout(timer);
      emitter.off(eventName, handler);
      resolve({ sender, options });
    };

    emitter.on(eventName, handler);
  });
}

/**
 * Create a mock survey model with event system
 */
export function createMockSurveyWithEvents() {
  const emitter = new MockEventEmitter();

  return {
    // Survey properties
    data: {},
    currentPageNo: 0,
    isCompleted: false,

    // Event properties
    onComplete: emitter.getEvent('complete'),
    onValueChanged: emitter.getEvent('valueChanged'),
    onCurrentPageChanged: emitter.getEvent('currentPageChanged'),
    onPageVisibleChanged: emitter.getEvent('pageVisibleChanged'),
    onQuestionVisibleChanged: emitter.getEvent('questionVisibleChanged'),
    onValidatedErrorsChanged: emitter.getEvent('validatedErrorsChanged'),
    onProcessHtml: emitter.getEvent('processHtml'),
    onTextMarkdown: emitter.getEvent('textMarkdown'),
    onSurveyLoad: emitter.getEvent('surveyLoad'),
    onAfterRenderSurvey: emitter.getEvent('afterRenderSurvey'),

    // Methods
    fireEvent: (name: string, options: any) =>
      emitter.fireEvent(name, this, options),
    dispose: () => emitter.clearAll(),

    // Test utilities
    _emitter: emitter,
  };
}

/**
 * Assert that an event was fired with specific options
 */
export function expectEventFired(
  event: MockEvent,
  expectedOptions?: Partial<any>
): void {
  expect(event.fire).toHaveBeenCalled();

  if (expectedOptions) {
    const lastCall = event.fire.mock.calls[event.fire.mock.calls.length - 1];
    const [, options] = lastCall;
    expect(options).toMatchObject(expectedOptions);
  }
}

/**
 * Assert that an event was not fired
 */
export function expectEventNotFired(event: MockEvent): void {
  expect(event.fire).not.toHaveBeenCalled();
}

/**
 * Get the last fired event options
 */
export function getLastEventOptions(event: MockEvent): any {
  const calls = event.fire.mock.calls;
  if (calls.length === 0) {
    return null;
  }
  return calls[calls.length - 1][1];
}
