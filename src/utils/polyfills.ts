/**
 * Browser API polyfills for React Native environment
 * Required for survey-core library compatibility
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// Use type assertions to avoid TypeScript errors with global polyfills
export function applyPolyfills() {
  const g = global as any;

  // Only apply polyfills if we're in a React Native environment
  if (typeof window === 'undefined') {
    // Mock navigator for survey-core
    g.navigator = {
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
      platform: 'iPhone',
      maxTouchPoints: 5,
      language: 'en-US',
      languages: ['en-US', 'en'],
    };

    // Mock window object
    g.window = {
      navigator: g.navigator,
      location: {
        href: 'http://localhost',
        protocol: 'http:',
        host: 'localhost',
        hostname: 'localhost',
        pathname: '/',
        search: '',
        hash: '',
      },
      localStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
      },
      sessionStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
      },
      addEventListener: () => {},
      removeEventListener: () => {},
      getComputedStyle: () => ({} as any),
      matchMedia: () => ({
        matches: false,
        addListener: () => {},
        removeListener: () => {},
      }),
      screen: {
        width: 375,
        height: 812,
        availWidth: 375,
        availHeight: 812,
      },
      innerWidth: 375,
      innerHeight: 812,
      setTimeout: g.setTimeout,
      clearTimeout: g.clearTimeout,
      requestAnimationFrame: (callback: any) => g.setTimeout(callback, 16),
      cancelAnimationFrame: (id: any) => g.clearTimeout(id),
    };

    // Mock document object
    g.document = {
      body: {},
      head: {},
      createElement: () => ({
        style: {},
        setAttribute: () => {},
        appendChild: () => {},
        removeChild: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
      createElementNS: () => ({
        style: {},
        setAttribute: () => {},
        appendChild: () => {},
        removeChild: () => {},
      }),
      getElementById: () => null,
      getElementsByTagName: () => [] as any,
      getElementsByClassName: () => [] as any,
      createTextNode: () => ({ nodeValue: '' } as any),
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      removeEventListener: () => {},
      location: g.window.location,
      documentElement: {
        style: {},
        clientWidth: 375,
        clientHeight: 812,
      },
      defaultView: g.window,
    };

    // Mock HTMLElement if it doesn't exist
    if (typeof HTMLElement === 'undefined') {
      g.HTMLElement = class HTMLElement {};
    }

    // Mock Element if it doesn't exist
    if (typeof Element === 'undefined') {
      g.Element = class Element {};
    }

    // Mock Node if it doesn't exist
    if (typeof Node === 'undefined') {
      g.Node = class Node {
        static ELEMENT_NODE = 1;
        static TEXT_NODE = 3;
        static COMMENT_NODE = 8;
        static DOCUMENT_NODE = 9;
        static DOCUMENT_FRAGMENT_NODE = 11;
      };
    }

    // Mock Event if it doesn't exist
    if (typeof Event === 'undefined') {
      g.Event = class Event {
        constructor(public type: string, public eventInitDict?: any) {}
      };
    }

    // Mock CustomEvent if it doesn't exist
    if (typeof CustomEvent === 'undefined') {
      g.CustomEvent = class CustomEvent extends g.Event {
        detail: any;
        constructor(type: string, eventInitDict?: any) {
          super(type, eventInitDict);
          this.detail = eventInitDict?.detail;
        }
      };
    }

    // Mock URL if it doesn't exist
    if (typeof URL === 'undefined') {
      g.URL = {
        createObjectURL: () => 'blob:mock-url',
        revokeObjectURL: () => {},
      } as any;
    }

    // Mock Blob if it doesn't exist
    if (typeof Blob === 'undefined') {
      g.Blob = class Blob {
        size: number;
        type: string;

        constructor() {
          this.size = 0;
          this.type = '';
        }
      };
    }
  }
}

// Apply polyfills when imported
if (typeof global !== 'undefined') {
  applyPolyfills();
}