/**
 * Mobile MCP Test Helpers
 * 
 * Utility functions for E2E testing using Mobile MCP simulator integration.
 * These helpers abstract common Mobile MCP operations for testing React Native apps.
 */

export interface DeviceInfo {
  name: string;
  type: 'simulator' | 'ios' | 'android';
  screenSize: { width: number; height: number };
  orientation: 'portrait' | 'landscape';
}

export interface ElementCoordinate {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface TestElement {
  text?: string;
  accessibilityLabel?: string;
  coordinates: ElementCoordinate;
  type?: string;
}

/**
 * Mobile MCP Test Helper class
 * Provides abstracted methods for common E2E testing operations
 */
export class MobileMcpTestHelper {
  private deviceInfo: DeviceInfo | null = null;
  private appPackageName: string;

  constructor(appPackageName: string = 'surveyjsui.example') {
    this.appPackageName = appPackageName;
  }

  /**
   * Initialize the test helper with device information
   */
  async initialize(): Promise<DeviceInfo> {
    // This would be called from test setup to initialize device info
    // For now, return mock data - will be implemented with actual MCP calls
    this.deviceInfo = {
      name: 'iPhone 16',
      type: 'simulator',
      screenSize: { width: 393, height: 852 },
      orientation: 'portrait'
    };
    return this.deviceInfo;
  }

  /**
   * Launch the app under test
   */
  async launchApp(): Promise<void> {
    // Implementation will use mcp__mobile__mobile_launch_app
    console.log(`Launching app: ${this.appPackageName}`);
  }

  /**
   * Terminate the app under test
   */
  async terminateApp(): Promise<void> {
    // Implementation will use mcp__mobile__mobile_terminate_app
    console.log(`Terminating app: ${this.appPackageName}`);
  }

  /**
   * Take a screenshot of the current screen
   */
  async takeScreenshot(name?: string): Promise<string> {
    // Implementation will use mcp__mobile__mobile_take_screenshot
    console.log(`Taking screenshot: ${name || 'unnamed'}`);
    return 'screenshot_path';
  }

  /**
   * Get all elements currently visible on screen
   */
  async getElementsOnScreen(): Promise<TestElement[]> {
    // Implementation will use mcp__mobile__mobile_list_elements_on_screen
    console.log('Getting elements on screen');
    return [];
  }

  /**
   * Find an element by its accessibility label or text
   */
  async findElement(query: { text?: string; accessibilityLabel?: string }): Promise<TestElement | null> {
    const elements = await this.getElementsOnScreen();
    
    return elements.find(element => {
      if (query.text && element.text === query.text) return true;
      if (query.accessibilityLabel && element.accessibilityLabel === query.accessibilityLabel) return true;
      return false;
    }) || null;
  }

  /**
   * Tap on an element at specific coordinates
   */
  async tapAtCoordinates(x: number, y: number): Promise<void> {
    // Implementation will use mcp__mobile__mobile_click_on_screen_at_coordinates
    console.log(`Tapping at coordinates: (${x}, ${y})`);
  }

  /**
   * Tap on an element found by query
   */
  async tapElement(query: { text?: string; accessibilityLabel?: string }): Promise<boolean> {
    const element = await this.findElement(query);
    if (!element) {
      console.warn(`Element not found for query:`, query);
      return false;
    }

    await this.tapAtCoordinates(element.coordinates.x, element.coordinates.y);
    return true;
  }

  /**
   * Type text into the currently focused element
   */
  async typeText(text: string, submit: boolean = false): Promise<void> {
    // Implementation will use mcp__mobile__mobile_type_keys
    console.log(`Typing text: "${text}", submit: ${submit}`);
  }

  /**
   * Swipe on the screen in a direction
   */
  async swipe(direction: 'up' | 'down'): Promise<void> {
    // Implementation will use mcp__mobile__swipe_on_screen
    console.log(`Swiping: ${direction}`);
  }

  /**
   * Change device orientation
   */
  async setOrientation(orientation: 'portrait' | 'landscape'): Promise<void> {
    // Implementation will use mcp__mobile__mobile_set_orientation
    console.log(`Setting orientation: ${orientation}`);
    if (this.deviceInfo) {
      this.deviceInfo.orientation = orientation;
    }
  }

  /**
   * Press a device button
   */
  async pressButton(button: 'BACK' | 'HOME' | 'VOLUME_UP' | 'VOLUME_DOWN' | 'ENTER'): Promise<void> {
    // Implementation will use mcp__mobile__mobile_press_button
    console.log(`Pressing button: ${button}`);
  }

  /**
   * Open a URL in the device browser
   */
  async openUrl(url: string): Promise<void> {
    // Implementation will use mcp__mobile__mobile_open_url
    console.log(`Opening URL: ${url}`);
  }

  /**
   * Wait for an element to appear on screen
   */
  async waitForElement(
    query: { text?: string; accessibilityLabel?: string },
    timeoutMs: number = 5000
  ): Promise<TestElement | null> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const element = await this.findElement(query);
      if (element) {
        return element;
      }
      
      // Wait 100ms before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return null;
  }

  /**
   * Assert that an element is visible on screen
   */
  async expectElementVisible(query: { text?: string; accessibilityLabel?: string }): Promise<void> {
    const element = await this.findElement(query);
    if (!element) {
      throw new Error(`Expected element to be visible: ${JSON.stringify(query)}`);
    }
  }

  /**
   * Assert that an element is NOT visible on screen
   */
  async expectElementNotVisible(query: { text?: string; accessibilityLabel?: string }): Promise<void> {
    const element = await this.findElement(query);
    if (element) {
      throw new Error(`Expected element to NOT be visible: ${JSON.stringify(query)}`);
    }
  }

  /**
   * Get current device info
   */
  getDeviceInfo(): DeviceInfo | null {
    return this.deviceInfo;
  }
}

/**
 * Create a new MobileMcpTestHelper instance
 */
export function createMobileMcpHelper(appPackageName?: string): MobileMcpTestHelper {
  return new MobileMcpTestHelper(appPackageName);
}

/**
 * Survey-specific test helpers
 */
export class SurveyMcpTestHelper extends MobileMcpTestHelper {
  /**
   * Navigate to the Survey Demo tab
   */
  async navigateToSurveyDemo(): Promise<void> {
    await this.tapElement({ accessibilityLabel: 'survey-demo-tab' });
    await this.waitForElement({ accessibilityLabel: 'survey-container' });
  }

  /**
   * Navigate to the Explore tab
   */
  async navigateToExplore(): Promise<void> {
    await this.tapElement({ accessibilityLabel: 'explore-tab' });
    await this.waitForElement({ accessibilityLabel: 'question-type-list' });
  }

  /**
   * Fill out a text question
   */
  async fillTextQuestion(questionId: string, text: string): Promise<void> {
    await this.tapElement({ accessibilityLabel: questionId });
    await this.typeText(text);
  }

  /**
   * Navigate to the next page of the survey
   */
  async goToNextPage(): Promise<void> {
    await this.tapElement({ accessibilityLabel: 'survey-next-button' });
  }

  /**
   * Navigate to the previous page of the survey
   */
  async goToPreviousPage(): Promise<void> {
    await this.tapElement({ accessibilityLabel: 'survey-prev-button' });
  }

  /**
   * Complete the survey
   */
  async completeSurvey(): Promise<void> {
    await this.tapElement({ accessibilityLabel: 'survey-complete-button' });
    await this.waitForElement({ text: 'Thank you for completing the survey!' });
  }

  /**
   * Select a radio button option
   */
  async selectRadioOption(optionText: string): Promise<void> {
    await this.tapElement({ text: optionText });
  }

  /**
   * Verify survey page is visible
   */
  async expectSurveyPage(pageIndex: number): Promise<void> {
    await this.expectElementVisible({ accessibilityLabel: `survey-page-${pageIndex}` });
  }

  /**
   * Verify validation error is shown
   */
  async expectValidationError(errorText?: string): Promise<void> {
    if (errorText) {
      await this.expectElementVisible({ text: errorText });
    } else {
      await this.expectElementVisible({ text: 'This field is required' });
    }
  }
}

/**
 * Create a survey-specific test helper
 */
export function createSurveyMcpHelper(appPackageName?: string): SurveyMcpTestHelper {
  return new SurveyMcpTestHelper(appPackageName);
}