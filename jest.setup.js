// Mock navigator for survey-core
global.navigator = {
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
  platform: 'iPhone',
  maxTouchPoints: 5,
};

// Mock window for survey-core
global.window = {
  navigator: global.navigator,
  location: {
    href: 'http://localhost',
  },
  setTimeout: global.setTimeout,
  clearTimeout: global.clearTimeout,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  document: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    createElement: jest.fn(() => ({
      style: {},
      setAttribute: jest.fn(),
      appendChild: jest.fn(),
    })),
    body: {
      appendChild: jest.fn(),
      removeChild: jest.fn(),
    },
  },
};