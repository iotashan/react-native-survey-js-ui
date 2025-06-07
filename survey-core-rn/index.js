// React Native compatibility wrapper for survey-core
// This file provides safe initialization for the survey-core library in React Native

// Set up minimal global polyfills before loading survey-core
if (typeof global !== 'undefined') {
  // Ensure window exists with minimal properties
  if (!global.window) {
    global.window = global;
  }
  
  // Add addEventListener stub if it doesn't exist
  if (!global.window.addEventListener) {
    global.window.addEventListener = function() {
      // No-op for React Native
      console.warn('window.addEventListener called in React Native environment');
    };
  }
  
  // Add removeEventListener stub if it doesn't exist
  if (!global.window.removeEventListener) {
    global.window.removeEventListener = function() {
      // No-op for React Native
    };
  }
  
  // Add document stub if it doesn't exist
  if (!global.document) {
    global.document = {
      head: null,
      body: null,
      addEventListener: function() {},
      removeEventListener: function() {},
      createElement: function() { return {}; },
      createTextNode: function() { return {}; },
      getElementById: function() { return null; },
      querySelector: function() { return null; },
      querySelectorAll: function() { return []; }
    };
  }
  
  // Add navigator stub if it doesn't exist
  if (!global.navigator) {
    global.navigator = {
      userAgent: 'ReactNative',
      platform: 'ReactNative',
      maxTouchPoints: 1,
      language: 'en-US',
      languages: ['en-US']
    };
  }
}

// Now it's safe to require survey-core
// Use a hardcoded relative path since React Native doesn't have the 'path' module
module.exports = require('../../survey-library-fork/packages/survey-core/build/survey.core.js');