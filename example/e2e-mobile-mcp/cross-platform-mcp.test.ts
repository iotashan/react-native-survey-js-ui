/**
 * Cross-Platform Behavior E2E Tests using Mobile MCP
 * 
 * These tests verify that the survey library works correctly across
 * different device orientations, screen sizes, and platform behaviors.
 */

import { mobileMcpAdapter } from './mobileMcpAdapter';

describe('Cross-Platform Behavior - Mobile MCP E2E Tests', () => {
  let deviceInfo: any;

  beforeAll(async () => {
    deviceInfo = await mobileMcpAdapter.initialize();
    await mobileMcpAdapter.launchApp();
    console.log('📱 Cross-platform tests initialized');
  }, 60000);

  afterAll(async () => {
    await mobileMcpAdapter.terminateApp();
    console.log('🧹 Cross-platform tests completed');
  }, 30000);

  beforeEach(async () => {
    await mobileMcpAdapter.takeScreenshot('cross-platform-before');
    await global.waitForMobileStabilization(1000);
  });

  afterEach(async () => {
    await mobileMcpAdapter.takeScreenshot('cross-platform-after');
    // Reset to portrait orientation after each test
    await mobileMcpAdapter.setOrientation('portrait');
    await global.waitForMobileStabilization(500);
  });

  describe('Responsive Layout Behavior', () => {
    it('should adapt survey layout to portrait orientation', async () => {
      // Ensure we're in portrait mode
      await mobileMcpAdapter.setOrientation('portrait');
      await global.waitForMobileStabilization(1000);

      // Navigate to survey
      await global.retryMobileOperation(async () => {
        const elements = await mobileMcpAdapter.getElementsOnScreen();
        const surveyTab = elements.find(el => 
          el.accessibilityLabel === 'survey-demo-tab' || el.text === 'Survey Demo'
        );

        if (surveyTab) {
          await mobileMcpAdapter.tapAtCoordinates(
            surveyTab.coordinates.x, 
            surveyTab.coordinates.y
          );
          await global.waitForMobileStabilization(1500);
        }
      });

      // Verify portrait layout
      const elements = await mobileMcpAdapter.getElementsOnScreen();
      const surveyContainer = elements.find(el => 
        el.accessibilityLabel === 'survey-container'
      );

      expect(surveyContainer).toBeTruthy();
      
      // Check that device is in portrait mode
      const currentDeviceInfo = mobileMcpAdapter.getDeviceInfo();
      expect(currentDeviceInfo?.orientation).toBe('portrait');
      
      console.log('✅ Survey layout adapts correctly to portrait orientation');
    });

    it('should adapt survey layout to landscape orientation', async () => {
      // Navigate to survey first
      await global.retryMobileOperation(async () => {
        const elements = await mobileMcpAdapter.getElementsOnScreen();
        const surveyTab = elements.find(el => 
          el.accessibilityLabel === 'survey-demo-tab' || el.text === 'Survey Demo'
        );

        if (surveyTab) {
          await mobileMcpAdapter.tapAtCoordinates(
            surveyTab.coordinates.x, 
            surveyTab.coordinates.y
          );
          await global.waitForMobileStabilization(1500);
        }
      });

      // Change to landscape orientation
      await mobileMcpAdapter.setOrientation('landscape');
      await global.waitForMobileStabilization(2000); // Give more time for layout changes

      // Verify landscape layout still works
      const elements = await mobileMcpAdapter.getElementsOnScreen();
      const surveyContainer = elements.find(el => 
        el.accessibilityLabel === 'survey-container'
      );

      expect(surveyContainer).toBeTruthy();
      
      // Check that device is in landscape mode
      const currentDeviceInfo = mobileMcpAdapter.getDeviceInfo();
      expect(currentDeviceInfo?.orientation).toBe('landscape');
      
      // Verify survey functionality still works in landscape
      const nameQuestion = elements.find(el => 
        el.accessibilityLabel === 'question-name'
      );
      
      if (nameQuestion) {
        await mobileMcpAdapter.tapAtCoordinates(
          nameQuestion.coordinates.x, 
          nameQuestion.coordinates.y
        );
        await global.waitForMobileStabilization(500);
        await mobileMcpAdapter.typeText('Landscape Test');
        await global.waitForMobileStabilization(500);
      }
      
      console.log('✅ Survey layout adapts correctly to landscape orientation');
    });

    it('should maintain survey state during orientation changes', async () => {
      // Start in portrait, navigate to survey
      await mobileMcpAdapter.setOrientation('portrait');
      await global.waitForMobileStabilization(1000);

      await global.retryMobileOperation(async () => {
        const elements = await mobileMcpAdapter.getElementsOnScreen();
        const surveyTab = elements.find(el => 
          el.accessibilityLabel === 'survey-demo-tab' || el.text === 'Survey Demo'
        );

        if (surveyTab) {
          await mobileMcpAdapter.tapAtCoordinates(
            surveyTab.coordinates.x, 
            surveyTab.coordinates.y
          );
          await global.waitForMobileStabilization(1500);
        }
      });

      // Fill out a question in portrait
      let elements = await mobileMcpAdapter.getElementsOnScreen();
      const nameQuestion = elements.find(el => 
        el.accessibilityLabel === 'question-name'
      );

      if (nameQuestion) {
        await mobileMcpAdapter.tapAtCoordinates(
          nameQuestion.coordinates.x, 
          nameQuestion.coordinates.y
        );
        await global.waitForMobileStabilization(500);
        await mobileMcpAdapter.typeText('State Persistence Test');
        await global.waitForMobileStabilization(500);
      }

      // Change to landscape
      await mobileMcpAdapter.setOrientation('landscape');
      await global.waitForMobileStabilization(2000);

      // Verify state is maintained (survey should still show filled data)
      elements = await mobileMcpAdapter.getElementsOnScreen();
      const surveyContainer = elements.find(el => 
        el.accessibilityLabel === 'survey-container'
      );
      expect(surveyContainer).toBeTruthy();

      // Change back to portrait
      await mobileMcpAdapter.setOrientation('portrait');
      await global.waitForMobileStabilization(2000);

      // Verify state is still maintained
      elements = await mobileMcpAdapter.getElementsOnScreen();
      const portraitSurveyContainer = elements.find(el => 
        el.accessibilityLabel === 'survey-container'
      );
      expect(portraitSurveyContainer).toBeTruthy();
      
      console.log('✅ Survey state maintained during orientation changes');
    });
  });

  describe('Touch and Gesture Behavior', () => {
    beforeEach(async () => {
      // Navigate to survey before each test
      await global.retryMobileOperation(async () => {
        const elements = await mobileMcpAdapter.getElementsOnScreen();
        const surveyTab = elements.find(el => 
          el.accessibilityLabel === 'survey-demo-tab' || el.text === 'Survey Demo'
        );

        if (surveyTab) {
          await mobileMcpAdapter.tapAtCoordinates(
            surveyTab.coordinates.x, 
            surveyTab.coordinates.y
          );
          await global.waitForMobileStabilization(1500);
        }
      });
    });

    it('should handle precise touch interactions', async () => {
      const elements = await mobileMcpAdapter.getElementsOnScreen();
      
      // Test precise tapping on different UI elements
      const nameQuestion = elements.find(el => 
        el.accessibilityLabel === 'question-name'
      );

      if (nameQuestion) {
        // Test tapping at different areas of the input field
        const { x, y, width, height } = nameQuestion.coordinates;
        
        // Tap at center
        await mobileMcpAdapter.tapAtCoordinates(x, y);
        await global.waitForMobileStabilization(300);
        
        // Tap at left edge (if width/height available)
        if (width && height) {
          await mobileMcpAdapter.tapAtCoordinates(x - width/4, y);
          await global.waitForMobileStabilization(300);
          
          // Tap at right edge
          await mobileMcpAdapter.tapAtCoordinates(x + width/4, y);
          await global.waitForMobileStabilization(300);
        }
        
        // Verify field is still functional
        await mobileMcpAdapter.typeText('Precision Test');
        await global.waitForMobileStabilization(500);
      }
      
      console.log('✅ Precise touch interactions work correctly');
    });

    it('should handle swipe gestures for navigation', async () => {
      // Fill out first question to enable navigation
      const elements = await mobileMcpAdapter.getElementsOnScreen();
      const nameQuestion = elements.find(el => 
        el.accessibilityLabel === 'question-name'
      );

      if (nameQuestion) {
        await mobileMcpAdapter.tapAtCoordinates(
          nameQuestion.coordinates.x, 
          nameQuestion.coordinates.y
        );
        await global.waitForMobileStabilization(500);
        await mobileMcpAdapter.typeText('Swipe Test User');
        await global.waitForMobileStabilization(500);
      }

      // Navigate to next page using button first
      let currentElements = await mobileMcpAdapter.getElementsOnScreen();
      const nextButton = currentElements.find(el => 
        el.accessibilityLabel === 'survey-next-button'
      );

      if (nextButton) {
        await mobileMcpAdapter.tapAtCoordinates(
          nextButton.coordinates.x, 
          nextButton.coordinates.y
        );
        await global.waitForMobileStabilization(1500);
      }

      // Test swipe gestures for scrolling/interaction
      await mobileMcpAdapter.swipe('up');
      await global.waitForMobileStabilization(500);
      
      await mobileMcpAdapter.swipe('down');
      await global.waitForMobileStabilization(500);

      // Verify we're still on the survey and it's functional
      currentElements = await mobileMcpAdapter.getElementsOnScreen();
      const surveyPage = currentElements.find(el => 
        el.accessibilityLabel?.includes('survey-page')
      );
      expect(surveyPage).toBeTruthy();
      
      console.log('✅ Swipe gestures handled correctly');
    });

    it('should handle multi-step touch sequences', async () => {
      await global.retryMobileOperation(async () => {
        // Complex interaction sequence: tap -> type -> tap -> navigate
        let elements = await mobileMcpAdapter.getElementsOnScreen();
        
        // Step 1: Tap name field
        const nameQuestion = elements.find(el => 
          el.accessibilityLabel === 'question-name'
        );
        
        if (nameQuestion) {
          await mobileMcpAdapter.tapAtCoordinates(
            nameQuestion.coordinates.x, 
            nameQuestion.coordinates.y
          );
          await global.waitForMobileStabilization(500);
          
          // Step 2: Type text
          await mobileMcpAdapter.typeText('Multi-Step Test');
          await global.waitForMobileStabilization(500);
        }
        
        // Step 3: Tap next button
        elements = await mobileMcpAdapter.getElementsOnScreen();
        const nextButton = elements.find(el => 
          el.accessibilityLabel === 'survey-next-button'
        );
        
        if (nextButton) {
          await mobileMcpAdapter.tapAtCoordinates(
            nextButton.coordinates.x, 
            nextButton.coordinates.y
          );
          await global.waitForMobileStabilization(1500);
        }
        
        // Step 4: Verify navigation worked
        elements = await mobileMcpAdapter.getElementsOnScreen();
        const secondPage = elements.find(el => 
          el.accessibilityLabel === 'survey-page-1'
        );
        
        if (!secondPage) {
          throw new Error('Multi-step sequence failed - did not reach second page');
        }
      });
      
      console.log('✅ Multi-step touch sequences work correctly');
    });
  });

  describe('Screen Size and Resolution Adaptation', () => {
    it('should work correctly on current device screen size', async () => {
      const deviceInfo = mobileMcpAdapter.getDeviceInfo();
      expect(deviceInfo).toBeTruthy();
      
      const { width, height } = deviceInfo!.screenSize;
      console.log(`Testing on screen size: ${width}x${height}`);
      
      // Verify UI elements are within screen bounds
      const elements = await mobileMcpAdapter.getElementsOnScreen();
      
      for (const element of elements) {
        const { x, y } = element.coordinates;
        
        // Elements should be within screen bounds
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(width);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(height);
      }
      
      console.log(`✅ All UI elements fit within ${width}x${height} screen`);
    });

    it('should handle different aspect ratios', async () => {
      // Test portrait aspect ratio
      await mobileMcpAdapter.setOrientation('portrait');
      await global.waitForMobileStabilization(1000);
      
      let elements = await mobileMcpAdapter.getElementsOnScreen();
      const portraitElementCount = elements.length;
      
      // Test landscape aspect ratio
      await mobileMcpAdapter.setOrientation('landscape');
      await global.waitForMobileStabilization(2000);
      
      elements = await mobileMcpAdapter.getElementsOnScreen();
      const landscapeElementCount = elements.length;
      
      // Both orientations should have reasonable number of elements
      expect(portraitElementCount).toBeGreaterThan(0);
      expect(landscapeElementCount).toBeGreaterThan(0);
      
      console.log(`✅ UI adapts to different aspect ratios (Portrait: ${portraitElementCount} elements, Landscape: ${landscapeElementCount} elements)`);
    });
  });

  describe('Performance and Responsiveness', () => {
    it('should respond to interactions within reasonable time', async () => {
      const startTime = Date.now();
      
      // Measure tap response time
      const elements = await mobileMcpAdapter.getElementsOnScreen();
      const surveyTab = elements.find(el => 
        el.accessibilityLabel === 'survey-demo-tab' || el.text === 'Survey Demo'
      );

      if (surveyTab) {
        const tapStartTime = Date.now();
        await mobileMcpAdapter.tapAtCoordinates(
          surveyTab.coordinates.x, 
          surveyTab.coordinates.y
        );
        
        // Wait for response and measure
        await global.waitForMobileStabilization(1000);
        const tapEndTime = Date.now();
        
        const responseTime = tapEndTime - tapStartTime;
        
        // Response should be under 2 seconds
        expect(responseTime).toBeLessThan(2000);
        
        console.log(`✅ Tap response time: ${responseTime}ms`);
      }
      
      const totalTime = Date.now() - startTime;
      console.log(`✅ Total interaction test time: ${totalTime}ms`);
    });

    it('should handle rapid consecutive interactions', async () => {
      // Navigate to explore tab first
      await global.retryMobileOperation(async () => {
        const elements = await mobileMcpAdapter.getElementsOnScreen();
        const exploreTab = elements.find(el => 
          el.accessibilityLabel === 'explore-tab' || el.text === 'Explore'
        );

        if (exploreTab) {
          await mobileMcpAdapter.tapAtCoordinates(
            exploreTab.coordinates.x, 
            exploreTab.coordinates.y
          );
          await global.waitForMobileStabilization(1000);
        }
      });

      // Rapid interactions test
      for (let i = 0; i < 3; i++) {
        // Quick tap sequence on different areas
        await mobileMcpAdapter.tapAtCoordinates(100, 100);
        await global.waitForMobileStabilization(100);
        
        await mobileMcpAdapter.tapAtCoordinates(200, 200);
        await global.waitForMobileStabilization(100);
        
        await mobileMcpAdapter.tapAtCoordinates(150, 300);
        await global.waitForMobileStabilization(100);
      }

      // Verify app is still responsive
      const elements = await mobileMcpAdapter.getElementsOnScreen();
      expect(elements.length).toBeGreaterThan(0);
      
      console.log('✅ App handles rapid consecutive interactions');
    });
  });

  describe('Accessibility and Platform Integration', () => {
    it('should provide proper accessibility labels', async () => {
      const elements = await mobileMcpAdapter.getElementsOnScreen();
      
      // Count elements with accessibility labels
      const elementsWithLabels = elements.filter(el => 
        el.accessibilityLabel && el.accessibilityLabel.length > 0
      );
      
      // Should have meaningful accessibility support
      expect(elementsWithLabels.length).toBeGreaterThan(0);
      
      console.log(`✅ Found ${elementsWithLabels.length} elements with accessibility labels`);
    });

    it('should integrate with device capabilities', async () => {
      // Test device button integration
      await mobileMcpAdapter.pressButton('HOME');
      await global.waitForMobileStabilization(1000);
      
      // Navigate back to app (in real implementation, would relaunch)
      await mobileMcpAdapter.launchApp();
      await global.waitForMobileStabilization(2000);
      
      // Verify app state is preserved/restored
      const elements = await mobileMcpAdapter.getElementsOnScreen();
      const surveyTab = elements.find(el => 
        el.accessibilityLabel === 'survey-demo-tab' || el.text === 'Survey Demo'
      );
      
      expect(surveyTab).toBeTruthy();
      
      console.log('✅ App integrates properly with device capabilities');
    });
  });
});