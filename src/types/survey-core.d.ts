declare module 'survey-core' {
  export interface IEvent<T> {
    add(handler: (sender: any, options: T) => void): void;
    remove(handler: (sender: any, options: T) => void): void;
  }

  export class Model {
    constructor(json?: any);
    
    // Properties
    data: any;
    currentPageNo: number;
    pageCount: number;
    visiblePageCount: number;
    
    // Methods
    doComplete(): void;
    nextPage(): boolean;
    prevPage(): boolean;
    setValue(name: string, value: any): void;
    getValue(name: string): any;
    
    // Events
    onComplete: IEvent<any>;
    onValueChanged: IEvent<{ name: string; value: any; oldValue: any; question: any }>;
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