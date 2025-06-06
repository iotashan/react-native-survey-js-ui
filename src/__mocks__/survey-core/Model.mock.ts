/**
 * Mock implementation of survey-core Model class
 * Provides realistic behavior for testing React Native components
 */

interface MockEventHandler<T = any> {
  add: jest.Mock<void, [(handler: T) => void]>;
  remove: jest.Mock<void, [(handler: T) => void]>;
  fire: jest.Mock<void, any[]>;
  hasHandlers: jest.Mock<boolean, []>;
  _handlers: T[];
}

interface MockQuestion {
  name: string;
  value: any;
  type: string;
  title: string;
  description?: string;
  isRequired: boolean;
  visible: boolean;
  readOnly: boolean;
  getType: () => string;
}

export class MockSurveyModel {
  public data: Record<string, any> = {};
  public currentPageNo: number = 0;
  public isCompleted: boolean = false;
  public isFirstPage: boolean = true;
  public isLastPage: boolean = true;
  public pageCount: number = 1;
  public currentPage: any;

  private _json: any;
  private _questions: MockQuestion[] = [];

  // Event handlers
  public onComplete: MockEventHandler;
  public onValueChanged: MockEventHandler;
  public onCurrentPageChanged: MockEventHandler;
  public onPageVisibleChanged: MockEventHandler;
  public onQuestionVisibleChanged: MockEventHandler;

  constructor(json?: any) {
    this._json = json || {};
    this._initializeEventHandlers();
    this._parseQuestions();
    this._updatePageState();
  }

  private _initializeEventHandlers(): void {
    this.onComplete = this._createEventHandler();
    this.onValueChanged = this._createEventHandler();
    this.onCurrentPageChanged = this._createEventHandler();
    this.onPageVisibleChanged = this._createEventHandler();
    this.onQuestionVisibleChanged = this._createEventHandler();
  }

  private _createEventHandler<T = any>(): MockEventHandler<T> {
    const handlers: T[] = [];

    const handler: MockEventHandler<T> = {
      _handlers: handlers,
      add: jest.fn((fn: T) => {
        if (!handlers.includes(fn)) {
          handlers.push(fn);
        }
      }),
      remove: jest.fn((fn: T) => {
        const index = handlers.indexOf(fn);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }),
      fire: jest.fn((...args: any[]) => {
        handlers.forEach((fn: any) => fn(...args));
      }),
      hasHandlers: jest.fn(() => handlers.length > 0),
    };

    return handler;
  }

  private _parseQuestions(): void {
    if (!this._json.pages) return;

    this._questions = [];
    this._json.pages.forEach((page: any) => {
      if (!page.elements) return;

      page.elements.forEach((element: any) => {
        const question: MockQuestion = {
          name: element.name,
          value: this.data[element.name],
          type: element.type || 'text',
          title: element.title || element.name,
          description: element.description,
          isRequired: element.isRequired || false,
          visible: element.visible !== false,
          readOnly: element.readOnly || false,
          getType: () => element.type || 'text',
        };
        this._questions.push(question);
      });
    });

    // Update page count based on pages
    if (this._json.pages) {
      this.pageCount = this._json.pages.length;
    }
  }

  private _updatePageState(): void {
    this.isFirstPage = this.currentPageNo === 0;
    this.isLastPage = this.currentPageNo === this.pageCount - 1;

    if (this._json.pages && this._json.pages[this.currentPageNo]) {
      this.currentPage = this._json.pages[this.currentPageNo];
    }
  }

  // Public methods
  public getJSON(): any {
    return this._json;
  }

  public toJSON(): any {
    return this._json;
  }

  public getValue(name: string): any {
    return this.data[name];
  }

  public setValue(name: string, value: any): void {
    const oldValue = this.data[name];
    this.data[name] = value;

    // Update question value
    const question = this._questions.find((q) => q.name === name);
    if (question) {
      question.value = value;
    }

    this.onValueChanged.fire(this, { name, value, oldValue });
  }

  public getPropertyValue(name: string): any {
    if (name === 'isCompleted') {
      return this.isCompleted;
    }
    return this.getValue(name);
  }

  public getAllQuestions(): MockQuestion[] {
    return this._questions;
  }

  public getQuestionByName(name: string): MockQuestion | undefined {
    return this._questions.find((q) => q.name === name);
  }

  public nextPage(): boolean {
    const oldValue = this.currentPageNo;
    if (this.currentPageNo < this.pageCount - 1) {
      this.currentPageNo++;
      this._updatePageState();
      this.onCurrentPageChanged.fire(this, {
        oldValue,
        newValue: this.currentPageNo,
      });
      return true;
    }
    // Fire event even if can't navigate (to match survey-core behavior)
    this.onCurrentPageChanged.fire(this, {
      oldValue,
      newValue: this.currentPageNo,
    });
    return false;
  }

  public prevPage(): boolean {
    if (this.currentPageNo > 0) {
      const oldValue = this.currentPageNo;
      this.currentPageNo--;
      this._updatePageState();
      this.onCurrentPageChanged.fire(this, {
        oldValue,
        newValue: this.currentPageNo,
      });
      return true;
    }
    return false;
  }

  public completeLastPage(): void {
    this.isCompleted = true;
    this.onComplete.fire(this, {});
  }

  public doComplete(): void {
    this.completeLastPage();
  }

  public clear(): void {
    this.data = {};
    this._questions.forEach((q) => (q.value = undefined));
  }

  public dispose(): void {
    // Clear all event handlers by setting length to 0 (maintains reference)
    this.onComplete._handlers.length = 0;
    this.onValueChanged._handlers.length = 0;
    this.onCurrentPageChanged._handlers.length = 0;
    this.onPageVisibleChanged._handlers.length = 0;
    this.onQuestionVisibleChanged._handlers.length = 0;

    // Clear data
    this.data = {};
    this._questions = [];
  }

  // Additional utility methods for testing
  public simulateValueChange(name: string, value: any): void {
    this.setValue(name, value);
  }

  public simulatePageChange(pageNo: number): void {
    if (pageNo >= 0 && pageNo < this.pageCount) {
      const oldValue = this.currentPageNo;
      this.currentPageNo = pageNo;
      this._updatePageState();
      this.onCurrentPageChanged.fire(this, { oldValue, newValue: pageNo });
    }
  }

  public simulateComplete(): void {
    this.completeLastPage();
  }
}

// Export as Model to match survey-core interface
export const Model = MockSurveyModel;
