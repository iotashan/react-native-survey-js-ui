/**
 * Browser API polyfills for React Native environment
 * Required for survey-core library compatibility
 */

declare global {
  var window: any;
  var document: any;
  var navigator: any;
}

// Only apply polyfills if we're in a React Native environment
if (typeof window === 'undefined') {
  // Mock navigator for survey-core
  global.navigator = {
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    platform: 'iPhone',
    maxTouchPoints: 5,
    language: 'en-US',
    languages: ['en-US', 'en'],
  };

  // Mock window for survey-core
  global.window = {
    navigator: global.navigator,
    location: {
      href: 'file://localhost/',
      protocol: 'file:',
      host: 'localhost',
      hostname: 'localhost',
      pathname: '/',
      search: '',
      hash: '',
    },
    setTimeout: global.setTimeout,
    clearTimeout: global.clearTimeout,
    setInterval: global.setInterval,
    clearInterval: global.clearInterval,
    addEventListener: (type: string, listener: any, options?: any) => {
      // Safe no-op implementation for React Native
      // This prevents the "window.addEventListener is not a function" error
    },
    removeEventListener: (type: string, listener: any, options?: any) => {
      // Safe no-op implementation for React Native
    },
    dispatchEvent: () => true,
    getComputedStyle: () => ({}),
    innerWidth: 375,
    innerHeight: 812,
    outerWidth: 375,
    outerHeight: 812,
    screen: {
      width: 375,
      height: 812,
      availWidth: 375,
      availHeight: 812,
    },
    visualViewport: null,
    devicePixelRatio: 2,
    requestAnimationFrame:
      global.requestAnimationFrame ||
      ((callback: any) => setTimeout(callback, 16)),
    cancelAnimationFrame: global.cancelAnimationFrame || clearTimeout,
    document: {
      addEventListener: () => {},
      removeEventListener: () => {},
      createElement: () => ({
        style: {},
        setAttribute: () => {},
        appendChild: () => {},
        removeChild: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
      body: {
        appendChild: () => {},
        removeChild: () => {},
        style: {},
      },
      head: {
        appendChild: () => {},
        removeChild: () => {},
      },
      documentElement: {
        style: {},
      },
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: () => null,
      getElementsByTagName: () => [],
      getElementsByClassName: () => [],
      createTextNode: () => ({ nodeValue: '' }),
    },
  };

  // Mock document at global level
  global.document = global.window.document;

  // Mock other browser APIs that survey-core might use
  global.Image = function () {
    return {
      src: '',
      onload: null,
      onerror: null,
      width: 0,
      height: 0,
    };
  } as any;

  global.XMLHttpRequest = class XMLHttpRequest {
    open() {}
    send() {}
    setRequestHeader() {}
    addEventListener() {}
    removeEventListener() {}
    abort() {}
  } as any;

  global.FormData = class FormData {
    append() {}
    delete() {}
    get() {
      return null;
    }
    getAll() {
      return [];
    }
    has() {
      return false;
    }
    set() {}
  } as any;

  global.URL = {
    createObjectURL: () => 'blob:mock',
    revokeObjectURL: () => {},
  };

  global.Blob = class Blob {
    size: number;
    type: string;
    
    constructor() {
      this.size = 0;
      this.type = '';
    }
  };
}

export {};
