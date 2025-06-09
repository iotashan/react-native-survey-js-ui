declare module 'survey-core' {
  export interface IEvent<T> {
    add(handler: (sender: any, options: T) => void): void;
    remove(handler: (sender: any, options: T) => void): void;
  }

  export interface Question {
    name: string;
    title?: string;
    type: string;
    visible: boolean;
    value: any;
    isRequired?: boolean;
  }

  export interface PanelModel {
    name: string;
    title?: string;
    description?: string;
    questions: Question[];
    panels: PanelModel[];
    visible: boolean;
  }

  export interface PageModel {
    name: string;
    title?: string;
    description?: string;
    questions: Question[];
    panels?: PanelModel[];
    getQuestionByName?(name: string): Question | undefined;
  }

  export class Model {
    constructor(json?: any);

    // Properties
    data: any;
    currentPageNo: number;
    pageCount: number;
    visiblePageCount: number;
    isFirstPage: boolean;
    isLastPage: boolean;
    isCompleted: boolean;
    currentPage?: PageModel;
    pages?: PageModel[];

    // Methods
    doComplete(): void;
    nextPage(): boolean;
    prevPage(): boolean;
    setValue(name: string, value: any): void;
    getValue(name: string): any;
    dispose(): void;
    getPropertyValue(name: string): any;
    getAllQuestions(): any[];

    // Events
    onComplete: IEvent<any>;
    onValueChanged: IEvent<{
      name: string;
      value: any;
      oldValue: any;
      question: any;
    }>;
    onCurrentPageChanged: IEvent<{
      oldCurrentPage: any;
      newCurrentPage: any;
      isNextPage: boolean;
      isPrevPage: boolean;
    }>;

    // Configuration
    showProgressBar?: boolean | 'off' | 'top' | 'bottom';
  }

  export const settings: {
    platform: string;
  };
}
