// Set up global polyfills for survey-core before any imports
if (typeof global !== 'undefined') {
  // Ensure window exists with minimal properties
  if (!global.window) {
    global.window = global;
  }

  // Add addEventListener stub if it doesn't exist
  if (!global.window.addEventListener) {
    global.window.addEventListener = function () {
      // No-op for React Native
      console.warn(
        'window.addEventListener called in React Native environment'
      );
    };
  }

  // Add removeEventListener stub if it doesn't exist
  if (!global.window.removeEventListener) {
    global.window.removeEventListener = function () {
      // No-op for React Native
    };
  }

  // Add document stub if it doesn't exist
  if (!global.document) {
    global.document = {
      head: null,
      body: null,
      addEventListener: function () {},
      removeEventListener: function () {},
      createElement: function () {
        return {};
      },
      createTextNode: function () {
        return {};
      },
      getElementById: function () {
        return null;
      },
      querySelector: function () {
        return null;
      },
      querySelectorAll: function () {
        return [];
      },
    };
  }
}

import { registerRootComponent } from 'expo';

import App from './src/App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
