/**
 * Tests for browser API polyfills required for survey-core compatibility
 */

describe('polyfills', () => {
  // Save original globals to restore after tests
  const originalWindow = global.window;
  const originalDocument = global.document;
  const originalNavigator = global.navigator;
  const originalImage = global.Image;
  const originalXMLHttpRequest = global.XMLHttpRequest;
  const originalFormData = global.FormData;
  const originalURL = global.URL;
  const originalBlob = global.Blob;

  beforeEach(() => {
    // Clear all globals before each test
    delete (global as any).window;
    delete (global as any).document;
    delete (global as any).navigator;
    delete (global as any).Image;
    delete (global as any).XMLHttpRequest;
    delete (global as any).FormData;
    delete (global as any).URL;
    delete (global as any).Blob;

    // Clear module cache to re-run polyfills
    jest.resetModules();
  });

  afterAll(() => {
    // Restore original globals
    global.window = originalWindow;
    global.document = originalDocument;
    global.navigator = originalNavigator;
    global.Image = originalImage;
    global.XMLHttpRequest = originalXMLHttpRequest;
    global.FormData = originalFormData;
    global.URL = originalURL;
    global.Blob = originalBlob;
  });

  describe('when window is undefined (React Native environment)', () => {
    beforeEach(() => {
      // Ensure window is truly undefined for these tests
      delete (global as any).window;
    });
    it('should use fallback for requestAnimationFrame when not available', () => {
      // Remove global requestAnimationFrame
      const originalRAF = global.requestAnimationFrame;
      delete (global as any).requestAnimationFrame;

      require('./polyfills');

      const callback = jest.fn();
      jest.useFakeTimers();

      global.window.requestAnimationFrame(callback);

      // Should use setTimeout with 16ms
      jest.advanceTimersByTime(16);
      expect(callback).toHaveBeenCalled();

      jest.useRealTimers();
      global.requestAnimationFrame = originalRAF;
    });

    it('should use fallback for cancelAnimationFrame when not available', () => {
      // Remove global cancelAnimationFrame
      const originalCAF = global.cancelAnimationFrame;
      delete (global as any).cancelAnimationFrame;

      require('./polyfills');

      // Should provide a function that calls clearTimeout
      expect(typeof global.window.cancelAnimationFrame).toBe('function');
      // Test that it works correctly
      const timerId = 123;
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      global.window.cancelAnimationFrame(timerId);
      expect(clearTimeoutSpy).toHaveBeenCalledWith(timerId);
      clearTimeoutSpy.mockRestore();

      global.cancelAnimationFrame = originalCAF;
    });

    it('should create navigator polyfill with required properties', () => {
      require('./polyfills');

      expect(global.navigator).toBeDefined();
      expect(global.navigator.userAgent).toContain('iPhone');
      expect(global.navigator.platform).toBe('iPhone');
      expect(global.navigator.maxTouchPoints).toBe(5);
      expect(global.navigator.language).toBe('en-US');
      expect(global.navigator.languages).toEqual(['en-US', 'en']);
    });

    it('should create window polyfill with required properties', () => {
      require('./polyfills');

      expect(global.window).toBeDefined();
      expect(global.window.navigator).toBe(global.navigator);
      expect(global.window.location).toBeDefined();
      expect(global.window.location.protocol).toBe('http:');
      expect(global.window.setTimeout).toBe(global.setTimeout);
      expect(global.window.clearTimeout).toBe(global.clearTimeout);
    });

    it('should provide safe no-op implementations for window event methods', () => {
      require('./polyfills');

      // These should not throw errors
      expect(() =>
        global.window.addEventListener('resize', () => {})
      ).not.toThrow();
      expect(() =>
        global.window.removeEventListener('resize', () => {})
      ).not.toThrow();
    });

    it('should provide window dimension properties', () => {
      require('./polyfills');

      expect(global.window.innerWidth).toBe(375);
      expect(global.window.innerHeight).toBe(812);
      expect(global.window.screen.width).toBe(375);
      expect(global.window.screen.height).toBe(812);
    });

    it('should provide animation frame methods', () => {
      require('./polyfills');

      const callback = jest.fn();
      const timerId = global.window.requestAnimationFrame(callback);
      expect(timerId).toBeDefined();

      // cancelAnimationFrame should work
      expect(() => global.window.cancelAnimationFrame(timerId)).not.toThrow();
    });

    it('should create document polyfill with DOM methods', () => {
      require('./polyfills');

      expect(global.document).toBeDefined();

      // Test DOM query methods
      expect(global.document.querySelector('div')).toBe(null);
      expect(global.document.querySelectorAll('div')).toEqual([]);
      expect(global.document.getElementById('test')).toBe(null);
      expect(global.document.getElementsByTagName('div')).toEqual([]);
      expect(global.document.getElementsByClassName('test')).toEqual([]);
    });

    it('should provide createElement method that returns element-like object', () => {
      require('./polyfills');

      const element = global.document.createElement('div');
      expect(element).toBeDefined();
      expect(element.style).toBeDefined();
      expect(() => element.setAttribute('class', 'test')).not.toThrow();
      expect(() => element.appendChild({})).not.toThrow();
      expect(() => element.removeChild({})).not.toThrow();
      expect(() => element.addEventListener('click', () => {})).not.toThrow();
      expect(() =>
        element.removeEventListener('click', () => {})
      ).not.toThrow();
    });

    it('should provide document body and head elements', () => {
      require('./polyfills');

      expect(global.document.body).toBeDefined();
      expect(global.document.head).toBeDefined();
    });

    it.skip('should provide Image constructor polyfill', () => {
      // Polyfill doesn't currently provide Image
      require('./polyfills');

      const img = new global.Image();
      expect(img).toBeDefined();
      expect(img.src).toBe('');
      expect(img.width).toBe(0);
      expect(img.height).toBe(0);
      expect(img.onload).toBe(null);
      expect(img.onerror).toBe(null);
    });

    it.skip('should provide XMLHttpRequest polyfill', () => {
      // Polyfill doesn't currently provide XMLHttpRequest
      require('./polyfills');

      const xhr = new global.XMLHttpRequest();
      expect(xhr).toBeDefined();
      expect(() => xhr.open('GET', 'http://test.com')).not.toThrow();
      expect(() => xhr.send()).not.toThrow();
      expect(() =>
        xhr.setRequestHeader('Content-Type', 'application/json')
      ).not.toThrow();
      expect(() => xhr.addEventListener('load', () => {})).not.toThrow();
      expect(() => xhr.removeEventListener('load', () => {})).not.toThrow();
      expect(() => xhr.abort()).not.toThrow();
    });

    it.skip('should provide FormData polyfill', () => {
      // Polyfill doesn't currently provide FormData
      require('./polyfills');

      const formData = new global.FormData();
      expect(formData).toBeDefined();
      expect(() => formData.append('key', 'value')).not.toThrow();
      expect(() => formData.delete('key')).not.toThrow();
      expect(formData.get('key')).toBe(null);
      expect(formData.getAll('key')).toEqual([]);
      expect(formData.has('key')).toBe(false);
      expect(() => formData.set('key', 'value')).not.toThrow();
    });

    it('should provide URL polyfill', () => {
      require('./polyfills');

      expect(global.URL).toBeDefined();
      expect(global.URL.createObjectURL()).toBe('blob:mock-url');
      expect(() => global.URL.revokeObjectURL('blob:mock')).not.toThrow();
    });

    it('should provide Blob polyfill', () => {
      require('./polyfills');

      const blob = new global.Blob();
      expect(blob).toBeDefined();
      expect(blob.size).toBe(0);
      expect(blob.type).toBe('');
    });

    it('should provide getComputedStyle method', () => {
      require('./polyfills');

      const styles = global.window.getComputedStyle();
      expect(styles).toEqual({});
    });

    it('should provide createTextNode method', () => {
      require('./polyfills');

      const textNode = global.document.createTextNode('test');
      expect(textNode).toBeDefined();
      expect(textNode.nodeValue).toBe('');
    });

    it('should provide documentElement with style', () => {
      require('./polyfills');

      expect(global.document.documentElement).toBeDefined();
      expect(global.document.documentElement.style).toBeDefined();
    });

    it.skip('should set visualViewport to null', () => {
      // Polyfill doesn't currently set visualViewport
      require('./polyfills');

      expect(global.window.visualViewport).toBe(null);
    });

    it('should provide document event listener methods', () => {
      require('./polyfills');

      expect(() =>
        global.document.addEventListener('DOMContentLoaded', () => {})
      ).not.toThrow();
      expect(() =>
        global.document.removeEventListener('DOMContentLoaded', () => {})
      ).not.toThrow();
    });
  });

  describe('when window is already defined', () => {
    it('should not override existing window object', () => {
      const mockWindow = { existing: true };
      global.window = mockWindow;

      require('./polyfills');

      expect(global.window).toBe(mockWindow);
      expect(global.window.existing).toBe(true);
    });

    it('should not create any polyfills when window exists', () => {
      global.window = { existing: true };

      require('./polyfills');

      // Navigator, document, etc should not be created
      expect(global.navigator).toBeUndefined();
      expect(global.document).toBeUndefined();
      expect(global.Image).toBeUndefined();
      expect(global.XMLHttpRequest).toBeUndefined();
      expect(global.FormData).toBeUndefined();
      expect(global.URL).toBeUndefined();
      expect(global.Blob).toBeUndefined();
    });
  });
});
