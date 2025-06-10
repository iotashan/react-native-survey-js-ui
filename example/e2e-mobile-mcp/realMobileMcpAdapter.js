/**
 * Real Mobile MCP Adapter for E2E Tests
 * 
 * This adapter provides actual integration with Mobile MCP functions.
 * This file demonstrates how the adapter would be implemented with real MCP calls.
 * 
 * Note: This requires the test environment to have access to MCP functions.
 */

class RealMobileMcpAdapter {
  constructor() {
    this.deviceInfo = null;
    this.appPackageName = 'surveyjsui.example';
    this.isInitialized = false;
    this.mcpFunctions = null;
  }

  /**
   * Initialize the adapter with MCP functions
   * In a real implementation, MCP functions would be injected or imported
   */
  setMcpFunctions(mcpFunctions) {
    this.mcpFunctions = mcpFunctions;
  }

  /**
   * Initialize the adapter with device selection
   */
  async initialize() {
    if (this.isInitialized) {
      return this.deviceInfo;
    }

    if (!this.mcpFunctions) {
      throw new Error('MCP functions not available. Use setMcpFunctions() first.');
    }

    try {
      // Use actual MCP functions
      const devices = await this.mcpFunctions.mobile_list_available_devices();
      console.log('Available devices:', devices);

      // Select iPhone 16 simulator (or first available device)
      const targetDevice = devices.find(d => d.includes('iPhone 16')) || devices[0];
      if (!targetDevice) {
        throw new Error('No devices available');
      }

      await this.mcpFunctions.mobile_use_device(targetDevice, 'simulator');
      
      const screenSize = await this.mcpFunctions.mobile_get_screen_size();
      const orientation = await this.mcpFunctions.mobile_get_orientation();
      
      this.deviceInfo = {
        name: targetDevice,
        type: 'simulator',
        screenSize: {
          width: screenSize.width,
          height: screenSize.height
        },
        orientation: orientation
      };
      
      this.isInitialized = true;
      console.log('📱 Real Mobile MCP Adapter initialized:', this.deviceInfo);
      return this.deviceInfo;
      
    } catch (error) {
      console.error('Failed to initialize Real Mobile MCP Adapter:', error);
      throw error;
    }
  }

  /**
   * Launch the test app
   */
  async launchApp() {
    await this.ensureInitialized();
    
    try {
      await this.mcpFunctions.mobile_launch_app(this.appPackageName);
      console.log(`📱 Launched app: ${this.appPackageName}`);
      await this.waitForStabilization(2000); // Give app time to launch
      
    } catch (error) {
      console.error('Failed to launch app:', error);
      throw error;
    }
  }

  /**
   * Terminate the test app
   */
  async terminateApp() {
    try {
      if (this.mcpFunctions) {
        await this.mcpFunctions.mobile_terminate_app(this.appPackageName);
        console.log(`📱 Terminated app: ${this.appPackageName}`);
      }
    } catch (error) {
      console.error('Failed to terminate app:', error);
      // Don't throw in cleanup
    }
  }

  /**
   * Take a screenshot
   */
  async takeScreenshot(name = 'screenshot') {
    await this.ensureInitialized();
    
    try {
      const screenshotData = await this.mcpFunctions.mobile_take_screenshot();
      
      // In a real implementation, you might save the screenshot to a file
      const timestamp = Date.now();
      const screenshotPath = `/tmp/e2e-screenshots/screenshot_${name}_${timestamp}.png`;
      
      console.log(`📸 Screenshot taken: ${screenshotPath}`);
      return screenshotPath;
      
    } catch (error) {
      console.error('Failed to take screenshot:', error);
      throw error;
    }
  }

  /**
   * Get elements on screen
   */
  async getElementsOnScreen() {
    await this.ensureInitialized();
    
    try {
      const elements = await this.mcpFunctions.mobile_list_elements_on_screen();
      
      // Transform MCP element format to our test format
      const transformedElements = elements.map(element => ({
        text: element.text || element.label,
        accessibilityLabel: element.accessibilityLabel || element.id,
        coordinates: {
          x: element.x || element.bounds?.x || 0,
          y: element.y || element.bounds?.y || 0,
          width: element.width || element.bounds?.width,
          height: element.height || element.bounds?.height
        },
        type: element.type || element.className
      }));
      
      console.log(`📋 Found ${transformedElements.length} elements on screen`);
      return transformedElements;
      
    } catch (error) {
      console.error('Failed to get elements on screen:', error);
      throw error;
    }
  }

  /**
   * Tap at coordinates
   */
  async tapAtCoordinates(x, y) {
    await this.ensureInitialized();
    
    try {
      await this.mcpFunctions.mobile_click_on_screen_at_coordinates(x, y);
      console.log(`👆 Tapped at coordinates: (${x}, ${y})`);
      await this.waitForStabilization(500); // Give UI time to respond
      
    } catch (error) {
      console.error(`Failed to tap at coordinates (${x}, ${y}):`, error);
      throw error;
    }
  }

  /**
   * Type text
   */
  async typeText(text, submit = false) {
    await this.ensureInitialized();
    
    try {
      await this.mcpFunctions.mobile_type_keys(text, submit);
      console.log(`⌨️ Typed text: "${text}", submit: ${submit}`);
      await this.waitForStabilization(300); // Give keyboard time to respond
      
    } catch (error) {
      console.error(`Failed to type text "${text}":`, error);
      throw error;
    }
  }

  /**
   * Swipe on screen
   */
  async swipe(direction) {
    await this.ensureInitialized();
    
    try {
      await this.mcpFunctions.swipe_on_screen(direction);
      console.log(`👉 Swiped: ${direction}`);
      await this.waitForStabilization(500);
      
    } catch (error) {
      console.error(`Failed to swipe ${direction}:`, error);
      throw error;
    }
  }

  /**
   * Set device orientation
   */
  async setOrientation(orientation) {
    await this.ensureInitialized();
    
    try {
      await this.mcpFunctions.mobile_set_orientation(orientation);
      console.log(`🔄 Set orientation: ${orientation}`);
      
      if (this.deviceInfo) {
        this.deviceInfo.orientation = orientation;
        
        // Update screen size after orientation change
        const newScreenSize = await this.mcpFunctions.mobile_get_screen_size();
        this.deviceInfo.screenSize = {
          width: newScreenSize.width,
          height: newScreenSize.height
        };
      }
      
      await this.waitForStabilization(1000); // Give time for orientation change
      
    } catch (error) {
      console.error(`Failed to set orientation to ${orientation}:`, error);
      throw error;
    }
  }

  /**
   * Press device button
   */
  async pressButton(button) {
    await this.ensureInitialized();
    
    try {
      await this.mcpFunctions.mobile_press_button(button);
      console.log(`🔘 Pressed button: ${button}`);
      await this.waitForStabilization(300);
      
    } catch (error) {
      console.error(`Failed to press button ${button}:`, error);
      throw error;
    }
  }

  /**
   * Open URL in device browser
   */
  async openUrl(url) {
    await this.ensureInitialized();
    
    try {
      await this.mcpFunctions.mobile_open_url(url);
      console.log(`🌐 Opened URL: ${url}`);
      await this.waitForStabilization(1000);
      
    } catch (error) {
      console.error(`Failed to open URL ${url}:`, error);
      throw error;
    }
  }

  /**
   * Find element by query
   */
  async findElement(query) {
    const elements = await this.getElementsOnScreen();
    
    return elements.find(element => {
      if (query.text && element.text === query.text) return true;
      if (query.accessibilityLabel && element.accessibilityLabel === query.accessibilityLabel) return true;
      if (query.type && element.type === query.type) return true;
      return false;
    }) || null;
  }

  /**
   * Tap element by query
   */
  async tapElement(query) {
    const element = await this.findElement(query);
    if (!element) {
      console.warn(`Element not found for query:`, query);
      return false;
    }

    await this.tapAtCoordinates(element.coordinates.x, element.coordinates.y);
    return true;
  }

  /**
   * Wait for element to appear
   */
  async waitForElement(query, timeoutMs = 5000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const element = await this.findElement(query);
      if (element) {
        return element;
      }
      
      await this.waitForStabilization(100);
    }
    
    return null;
  }

  /**
   * Helper methods
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  async waitForStabilization(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getDeviceInfo() {
    return this.deviceInfo;
  }

  /**
   * Health check - verify MCP connection is working
   */
  async healthCheck() {
    try {
      if (!this.mcpFunctions) {
        throw new Error('MCP functions not available');
      }

      // Test basic MCP connectivity
      const devices = await this.mcpFunctions.mobile_list_available_devices();
      const screenSize = await this.mcpFunctions.mobile_get_screen_size();
      
      console.log('✅ Mobile MCP health check passed');
      return {
        status: 'healthy',
        devices: devices.length,
        screenSize: screenSize
      };
      
    } catch (error) {
      console.error('❌ Mobile MCP health check failed:', error);
      return {
        status: 'error',
        error: error.message
      };
    }
  }
}

// Export singleton instance
const realMobileMcpAdapter = new RealMobileMcpAdapter();

module.exports = {
  RealMobileMcpAdapter,
  realMobileMcpAdapter
};