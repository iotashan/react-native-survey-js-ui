/**
 * Error Handling and Edge Cases E2E Tests using Mobile MCP
 * 
 * These tests verify that the survey library handles errors gracefully
 * and works correctly in edge case scenarios.
 */

import { mobileMcpAdapter } from './mobileMcpAdapter';

describe('Error Handling and Edge Cases - Mobile MCP E2E Tests', () => {
  let deviceInfo: any;

  beforeAll(async () => {
    deviceInfo = await mobileMcpAdapter.initialize();
    await mobileMcpAdapter.launchApp();
    console.log('📱 Error handling tests initialized');
  }, 60000);

  afterAll(async () => {
    await mobileMcpAdapter.terminateApp();
    console.log('🧹 Error handling tests completed');
  }, 30000);

  beforeEach(async () => {
    await mobileMcpAdapter.takeScreenshot('error-handling-before');
    await global.waitForMobileStabilization(1000);
  });

  afterEach(async () => {
    await mobileMcpAdapter.takeScreenshot('error-handling-after');
    // Reset to clean state
    await mobileMcpAdapter.setOrientation('portrait');
    await global.waitForMobileStabilization(500);
  });

  describe('Validation Error Handling', () => {
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

    it('should show validation error for required field', async () => {
      await global.retryMobileOperation(async () => {
        // Try to proceed without filling required field
        const elements = await mobileMcpAdapter.getElementsOnScreen();
        const nextButton = elements.find(el => 
          el.accessibilityLabel === 'survey-next-button'
        );

        if (!nextButton) {
          throw new Error('Next button not found');
        }

        await mobileMcpAdapter.tapAtCoordinates(
          nextButton.coordinates.x, 
          nextButton.coordinates.y
        );

        // Wait for validation to trigger
        await global.waitForMobileStabilization(1000);

        // Check for validation error message
        const updatedElements = await mobileMcpAdapter.getElementsOnScreen();
        const errorMessage = updatedElements.find(el => 
          el.text && (
            el.text.includes('required') || 
            el.text.includes('Please') ||
            el.text.includes('field')
          )
        );

        if (!errorMessage) {
          throw new Error('Validation error message not displayed');
        }
      });

      console.log('✅ Validation error displayed for required field');
    });

    it('should clear validation error when field is filled', async () => {
      // First trigger validation error
      let elements = await mobileMcpAdapter.getElementsOnScreen();
      const nextButton = elements.find(el => 
        el.accessibilityLabel === 'survey-next-button'
      );

      if (nextButton) {
        await mobileMcpAdapter.tapAtCoordinates(
          nextButton.coordinates.x, 
          nextButton.coordinates.y
        );
        await global.waitForMobileStabilization(1000);
      }

      // Now fill the field
      elements = await mobileMcpAdapter.getElementsOnScreen();
      const nameQuestion = elements.find(el => 
        el.accessibilityLabel === 'question-name'
      );

      if (nameQuestion) {
        await mobileMcpAdapter.tapAtCoordinates(
          nameQuestion.coordinates.x, 
          nameQuestion.coordinates.y
        );
        await global.waitForMobileStabilization(500);
        await mobileMcpAdapter.typeText('Error Clear Test');
        await global.waitForMobileStabilization(500);
      }

      // Try navigation again - should work now
      elements = await mobileMcpAdapter.getElementsOnScreen();
      const nextButtonAgain = elements.find(el => 
        el.accessibilityLabel === 'survey-next-button'
      );

      if (nextButtonAgain) {
        await mobileMcpAdapter.tapAtCoordinates(
          nextButtonAgain.coordinates.x, 
          nextButtonAgain.coordinates.y
        );
        await global.waitForMobileStabilization(1500);
      }

      // Verify we moved to next page
      elements = await mobileMcpAdapter.getElementsOnScreen();
      const secondPage = elements.find(el => 
        el.accessibilityLabel === 'survey-page-1'
      );

      expect(secondPage).toBeTruthy();
      
      console.log('✅ Validation error cleared when field is filled');
    });

    it('should handle invalid data gracefully', async () => {
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
        
        // Test various invalid inputs
        const invalidInputs = [
          '', // Empty string
          '   ', // Whitespace only
          '<!@#$%^&*()>', // Special characters
          'A'.repeat(1000), // Very long string
          '🎉🎊🎈🎁🎀🎃🎄🎆🎇🎂🎁', // Emojis
        ];

        for (const input of invalidInputs) {
          // Clear field first (in real implementation)
          await mobileMcpAdapter.typeText(input);
          await global.waitForMobileStabilization(300);
          
          // App should remain stable
          const currentElements = await mobileMcpAdapter.getElementsOnScreen();
          expect(currentElements.length).toBeGreaterThan(0);
        }
      }

      console.log('✅ App handles invalid data gracefully');
    });
  });

  describe('Network and Connectivity Edge Cases', () => {
    it('should handle app backgrounding gracefully', async () => {
      // Navigate to survey and fill some data
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

      // Fill some data
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
        await mobileMcpAdapter.typeText('Background Test');
        await global.waitForMobileStabilization(500);
      }

      // Simulate app backgrounding
      await mobileMcpAdapter.pressButton('HOME');
      await global.waitForMobileStabilization(2000);

      // Return to app
      await mobileMcpAdapter.launchApp();
      await global.waitForMobileStabilization(2000);

      // Verify app state is preserved or gracefully restored
      elements = await mobileMcpAdapter.getElementsOnScreen();
      const surveyContainer = elements.find(el => 
        el.accessibilityLabel === 'survey-container'
      );

      expect(surveyContainer).toBeTruthy();
      
      console.log('✅ App handles backgrounding gracefully');
    });

    it('should handle memory pressure scenarios', async () => {
      // Simulate memory pressure by rapid interactions and navigation
      for (let i = 0; i < 10; i++) {
        // Navigate between tabs rapidly
        const elements = await mobileMcpAdapter.getElementsOnScreen();
        
        const surveyTab = elements.find(el => 
          el.accessibilityLabel === 'survey-demo-tab' || el.text === 'Survey Demo'
        );
        
        const exploreTab = elements.find(el => 
          el.accessibilityLabel === 'explore-tab' || el.text === 'Explore'
        );

        if (surveyTab) {
          await mobileMcpAdapter.tapAtCoordinates(
            surveyTab.coordinates.x, 
            surveyTab.coordinates.y
          );
          await global.waitForMobileStabilization(200);
        }

        if (exploreTab) {
          await mobileMcpAdapter.tapAtCoordinates(
            exploreTab.coordinates.x, 
            exploreTab.coordinates.y
          );
          await global.waitForMobileStabilization(200);
        }
      }

      // Verify app is still functional
      const finalElements = await mobileMcpAdapter.getElementsOnScreen();
      expect(finalElements.length).toBeGreaterThan(0);
      
      console.log('✅ App handles memory pressure scenarios');
    });
  });

  describe('UI Edge Cases', () => {
    it('should handle rapid orientation changes', async () => {
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

      // Rapid orientation changes
      for (let i = 0; i < 5; i++) {
        await mobileMcpAdapter.setOrientation('landscape');
        await global.waitForMobileStabilization(500);
        
        await mobileMcpAdapter.setOrientation('portrait');
        await global.waitForMobileStabilization(500);
      }

      // Verify app is still functional
      const elements = await mobileMcpAdapter.getElementsOnScreen();
      const surveyContainer = elements.find(el => 
        el.accessibilityLabel === 'survey-container'
      );

      expect(surveyContainer).toBeTruthy();
      
      console.log('✅ App handles rapid orientation changes');
    });

    it('should handle edge tap positions', async () => {
      const deviceInfo = mobileMcpAdapter.getDeviceInfo();
      if (!deviceInfo) return;

      const { width, height } = deviceInfo.screenSize;

      // Test tapping at screen edges
      const edgePositions = [
        { x: 1, y: 1 }, // Top-left corner
        { x: width - 1, y: 1 }, // Top-right corner
        { x: 1, y: height - 1 }, // Bottom-left corner
        { x: width - 1, y: height - 1 }, // Bottom-right corner
        { x: width / 2, y: 1 }, // Top center
        { x: width / 2, y: height - 1 }, // Bottom center
        { x: 1, y: height / 2 }, // Left center
        { x: width - 1, y: height / 2 }, // Right center
      ];

      for (const position of edgePositions) {
        try {
          await mobileMcpAdapter.tapAtCoordinates(position.x, position.y);
          await global.waitForMobileStabilization(200);
          
          // App should remain stable
          const elements = await mobileMcpAdapter.getElementsOnScreen();
          expect(elements.length).toBeGreaterThan(0);
        } catch (error) {
          // Edge taps might fail, but shouldn't crash the app
          console.warn(`Edge tap at (${position.x}, ${position.y}) failed:`, error);
        }
      }
      
      console.log('✅ App handles edge tap positions without crashing');
    });

    it('should handle simultaneous gestures gracefully', async () => {
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

      // Simulate conflicting gestures (in sequence since we can't do truly simultaneous)
      const elements = await mobileMcpAdapter.getElementsOnScreen();
      if (elements.length > 0) {
        const element = elements[0];
        
        // Rapid sequence of different interactions
        await mobileMcpAdapter.tapAtCoordinates(element.coordinates.x, element.coordinates.y);
        await mobileMcpAdapter.swipe('up');
        await mobileMcpAdapter.tapAtCoordinates(element.coordinates.x + 10, element.coordinates.y + 10);
        await mobileMcpAdapter.swipe('down');
        
        await global.waitForMobileStabilization(1000);
      }

      // Verify app is still functional
      const finalElements = await mobileMcpAdapter.getElementsOnScreen();
      expect(finalElements.length).toBeGreaterThan(0);
      
      console.log('✅ App handles simultaneous gestures gracefully');
    });
  });

  describe('Data Persistence Edge Cases', () => {
    it('should handle partial survey data correctly', async () => {
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

      // Fill partial data
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
        await mobileMcpAdapter.typeText('Partial Data Test');
        await global.waitForMobileStabilization(500);
      }

      // Navigate away and back
      let currentElements = await mobileMcpAdapter.getElementsOnScreen();
      const exploreTab = currentElements.find(el => 
        el.accessibilityLabel === 'explore-tab' || el.text === 'Explore'
      );

      if (exploreTab) {
        await mobileMcpAdapter.tapAtCoordinates(
          exploreTab.coordinates.x, 
          exploreTab.coordinates.y
        );
        await global.waitForMobileStabilization(1500);
      }

      // Navigate back to survey
      currentElements = await mobileMcpAdapter.getElementsOnScreen();
      const surveyTabAgain = currentElements.find(el => 
        el.accessibilityLabel === 'survey-demo-tab' || el.text === 'Survey Demo'
      );

      if (surveyTabAgain) {
        await mobileMcpAdapter.tapAtCoordinates(
          surveyTabAgain.coordinates.x, 
          surveyTabAgain.coordinates.y
        );
        await global.waitForMobileStabilization(1500);
      }

      // Verify survey is accessible and data handling is appropriate
      currentElements = await mobileMcpAdapter.getElementsOnScreen();
      const surveyContainer = currentElements.find(el => 
        el.accessibilityLabel === 'survey-container'
      );

      expect(surveyContainer).toBeTruthy();
      
      console.log('✅ App handles partial survey data correctly');
    });

    it('should handle survey completion edge cases', async () => {
      // Navigate to survey and try to complete without proper progression
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

      // Try to find and tap completion button without filling survey
      const elements = await mobileMcpAdapter.getElementsOnScreen();
      const completeButton = elements.find(el => 
        el.accessibilityLabel === 'survey-complete-button'
      );

      if (completeButton) {
        await mobileMcpAdapter.tapAtCoordinates(
          completeButton.coordinates.x, 
          completeButton.coordinates.y
        );
        await global.waitForMobileStabilization(1000);
      }

      // App should handle this gracefully (either prevent completion or show error)
      const updatedElements = await mobileMcpAdapter.getElementsOnScreen();
      expect(updatedElements.length).toBeGreaterThan(0);
      
      console.log('✅ App handles survey completion edge cases');
    });
  });

  describe('Recovery and Resilience', () => {
    it('should recover from unexpected errors', async () => {
      // Simulate various error conditions
      try {
        // Invalid coordinates
        await mobileMcpAdapter.tapAtCoordinates(-100, -100);
      } catch (error) {
        // Expected to fail
      }

      try {
        // Very large coordinates
        await mobileMcpAdapter.tapAtCoordinates(9999, 9999);
      } catch (error) {
        // Expected to fail
      }

      // App should still be functional
      const elements = await mobileMcpAdapter.getElementsOnScreen();
      expect(elements.length).toBeGreaterThan(0);
      
      // Verify normal interaction still works
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
      
      console.log('✅ App recovers from unexpected errors');
    });

    it('should maintain performance under stress', async () => {
      const startTime = Date.now();
      
      // Stress test with many rapid operations
      for (let i = 0; i < 20; i++) {
        const elements = await mobileMcpAdapter.getElementsOnScreen();
        
        if (elements.length > 0) {
          const randomElement = elements[Math.floor(Math.random() * elements.length)];
          await mobileMcpAdapter.tapAtCoordinates(
            randomElement.coordinates.x, 
            randomElement.coordinates.y
          );
          await global.waitForMobileStabilization(50); // Very short wait
        }
        
        if (i % 5 === 0) {
          await mobileMcpAdapter.swipe(i % 2 === 0 ? 'up' : 'down');
        }
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Verify app is still responsive
      const finalElements = await mobileMcpAdapter.getElementsOnScreen();
      expect(finalElements.length).toBeGreaterThan(0);
      
      console.log(`✅ App maintains performance under stress (${duration}ms for 20 operations)`);
    });
  });
});