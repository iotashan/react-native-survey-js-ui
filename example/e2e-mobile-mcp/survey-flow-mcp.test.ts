/**
 * Survey Flow E2E Tests using Mobile MCP
 * 
 * These tests use the Mobile MCP simulator integration to test
 * the survey functionality in a real mobile environment.
 */

import { mobileMcpAdapter } from './mobileMcpAdapter';

describe('Survey Flow - Mobile MCP E2E Tests', () => {
  let deviceInfo: any;

  beforeAll(async () => {
    // Initialize the Mobile MCP adapter
    deviceInfo = await mobileMcpAdapter.initialize();
    console.log('📱 Mobile MCP initialized with device:', deviceInfo);
    
    // Launch the app
    await mobileMcpAdapter.launchApp();
    console.log('🚀 App launched successfully');
  }, 60000);

  afterAll(async () => {
    // Clean up after tests
    await mobileMcpAdapter.terminateApp();
    console.log('🧹 App terminated');
  }, 30000);

  beforeEach(async () => {
    // Take a screenshot before each test for debugging
    await mobileMcpAdapter.takeScreenshot('before-test');
    
    // Wait for UI to stabilize
    await global.waitForMobileStabilization(1000);
  });

  afterEach(async () => {
    // Take a screenshot after each test for debugging
    await mobileMcpAdapter.takeScreenshot('after-test');
  });

  describe('Basic Navigation', () => {
    it('should display the main navigation tabs', async () => {
      const elements = await mobileMcpAdapter.getElementsOnScreen();
      
      // Find navigation tabs
      const surveyTab = elements.find(el => 
        el.accessibilityLabel === 'survey-demo-tab' || el.text === 'Survey Demo'
      );
      const exploreTab = elements.find(el => 
        el.accessibilityLabel === 'explore-tab' || el.text === 'Explore'
      );

      expect(surveyTab).toBeTruthy();
      expect(exploreTab).toBeTruthy();
      
      console.log('✅ Navigation tabs are visible');
    });

    it('should navigate to Survey Demo tab', async () => {
      await global.retryMobileOperation(async () => {
        const elements = await mobileMcpAdapter.getElementsOnScreen();
        const surveyTab = elements.find(el => 
          el.accessibilityLabel === 'survey-demo-tab' || el.text === 'Survey Demo'
        );

        if (!surveyTab) {
          throw new Error('Survey Demo tab not found');
        }

        await mobileMcpAdapter.tapAtCoordinates(
          surveyTab.coordinates.x, 
          surveyTab.coordinates.y
        );

        // Wait for navigation to complete
        await global.waitForMobileStabilization(1500);

        // Verify survey container is visible
        const updatedElements = await mobileMcpAdapter.getElementsOnScreen();
        const surveyContainer = updatedElements.find(el => 
          el.accessibilityLabel === 'survey-container'
        );

        if (!surveyContainer) {
          throw new Error('Survey container not visible after navigation');
        }
      });

      console.log('✅ Successfully navigated to Survey Demo tab');
    });

    it('should navigate to Explore tab', async () => {
      await global.retryMobileOperation(async () => {
        const elements = await mobileMcpAdapter.getElementsOnScreen();
        const exploreTab = elements.find(el => 
          el.accessibilityLabel === 'explore-tab' || el.text === 'Explore'
        );

        if (!exploreTab) {
          throw new Error('Explore tab not found');
        }

        await mobileMcpAdapter.tapAtCoordinates(
          exploreTab.coordinates.x, 
          exploreTab.coordinates.y
        );

        // Wait for navigation to complete
        await global.waitForMobileStabilization(1500);

        // Verify question type list is visible
        const updatedElements = await mobileMcpAdapter.getElementsOnScreen();
        const questionTypeList = updatedElements.find(el => 
          el.accessibilityLabel === 'question-type-list'
        );

        if (!questionTypeList) {
          throw new Error('Question type list not visible after navigation');
        }
      });

      console.log('✅ Successfully navigated to Explore tab');
    });
  });

  describe('Survey Completion Flow', () => {
    beforeEach(async () => {
      // Navigate to Survey Demo tab before each test
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

    it('should display survey title', async () => {
      const elements = await mobileMcpAdapter.getElementsOnScreen();
      const surveyTitle = elements.find(el => 
        el.text && el.text.includes('Customer Satisfaction Survey')
      );

      expect(surveyTitle).toBeTruthy();
      console.log('✅ Survey title is visible');
    });

    it('should show first survey page', async () => {
      const elements = await mobileMcpAdapter.getElementsOnScreen();
      const surveyPage = elements.find(el => 
        el.accessibilityLabel === 'survey-page-0'
      );

      expect(surveyPage).toBeTruthy();
      console.log('✅ First survey page is visible');
    });

    it('should fill out text question and navigate', async () => {
      await global.retryMobileOperation(async () => {
        // Find the name question input
        const elements = await mobileMcpAdapter.getElementsOnScreen();
        const nameQuestion = elements.find(el => 
          el.accessibilityLabel === 'question-name'
        );

        if (!nameQuestion) {
          throw new Error('Name question input not found');
        }

        // Tap on the input field
        await mobileMcpAdapter.tapAtCoordinates(
          nameQuestion.coordinates.x, 
          nameQuestion.coordinates.y
        );

        // Wait for keyboard to appear
        await global.waitForMobileStabilization(1000);

        // Type the name
        await mobileMcpAdapter.typeText('John Doe Mobile Test');

        // Wait for text to be entered
        await global.waitForMobileStabilization(500);

        // Find and tap the next button
        const updatedElements = await mobileMcpAdapter.getElementsOnScreen();
        const nextButton = updatedElements.find(el => 
          el.accessibilityLabel === 'survey-next-button'
        );

        if (!nextButton) {
          throw new Error('Next button not found');
        }

        await mobileMcpAdapter.tapAtCoordinates(
          nextButton.coordinates.x, 
          nextButton.coordinates.y
        );

        // Wait for navigation to next page
        await global.waitForMobileStabilization(1500);

        // Verify we're on page 1
        const finalElements = await mobileMcpAdapter.getElementsOnScreen();
        const secondPage = finalElements.find(el => 
          el.accessibilityLabel === 'survey-page-1'
        );

        if (!secondPage) {
          throw new Error('Second survey page not visible');
        }
      });

      console.log('✅ Successfully filled text question and navigated to next page');
    });

    it('should complete survey flow', async () => {
      await global.retryMobileOperation(async () => {
        // Fill out the first question (name)
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
          await mobileMcpAdapter.typeText('Complete Survey Test User');
          await global.waitForMobileStabilization(500);
        }

        // Navigate to next page
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

        // Answer satisfaction question
        currentElements = await mobileMcpAdapter.getElementsOnScreen();
        const satisfactionOption = currentElements.find(el => 
          el.text === 'Very Satisfied'
        );

        if (satisfactionOption) {
          await mobileMcpAdapter.tapAtCoordinates(
            satisfactionOption.coordinates.x, 
            satisfactionOption.coordinates.y
          );
          await global.waitForMobileStabilization(500);
        }

        // Complete the survey
        currentElements = await mobileMcpAdapter.getElementsOnScreen();
        const completeButton = currentElements.find(el => 
          el.accessibilityLabel === 'survey-complete-button'
        );

        if (completeButton) {
          await mobileMcpAdapter.tapAtCoordinates(
            completeButton.coordinates.x, 
            completeButton.coordinates.y
          );
          await global.waitForMobileStabilization(2000);
        }

        // Verify completion message
        const finalElements = await mobileMcpAdapter.getElementsOnScreen();
        const completionMessage = finalElements.find(el => 
          el.text && el.text.includes('Thank you for completing the survey!')
        );

        if (!completionMessage) {
          throw new Error('Survey completion message not found');
        }
      });

      console.log('✅ Successfully completed entire survey flow');
    });
  });

  describe('Question Type Exploration', () => {
    beforeEach(async () => {
      // Navigate to Explore tab before each test
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
          await global.waitForMobileStabilization(1500);
        }
      });
    });

    it('should display question type categories', async () => {
      const elements = await mobileMcpAdapter.getElementsOnScreen();
      
      const expectedQuestionTypes = [
        'Text Input',
        'Checkbox',
        'Radio Group',
        'Dropdown',
        'Rating',
        'Boolean',
        'Matrix',
        'Multiple Text'
      ];

      const foundTypes = expectedQuestionTypes.filter(type => 
        elements.some(el => el.text === type)
      );

      // We expect to find at least some of the question types
      expect(foundTypes.length).toBeGreaterThan(0);
      console.log(`✅ Found ${foundTypes.length} question types: ${foundTypes.join(', ')}`);
    });

    it('should open question type demo', async () => {
      await global.retryMobileOperation(async () => {
        const elements = await mobileMcpAdapter.getElementsOnScreen();
        const textInputType = elements.find(el => 
          el.text === 'Text Input'
        );

        if (!textInputType) {
          throw new Error('Text Input question type not found');
        }

        await mobileMcpAdapter.tapAtCoordinates(
          textInputType.coordinates.x, 
          textInputType.coordinates.y
        );

        // Wait for demo to load
        await global.waitForMobileStabilization(1500);

        // Verify demo is visible
        const updatedElements = await mobileMcpAdapter.getElementsOnScreen();
        const questionDemo = updatedElements.find(el => 
          el.accessibilityLabel === 'question-demo-text'
        );

        if (!questionDemo) {
          throw new Error('Question demo not visible');
        }
      });

      console.log('✅ Successfully opened question type demo');
    });
  });

  describe('Device Integration', () => {
    it('should handle orientation changes', async () => {
      // Test landscape orientation
      await mobileMcpAdapter.setOrientation('landscape');
      
      // Verify UI still works in landscape
      const elements = await mobileMcpAdapter.getElementsOnScreen();
      const surveyTab = elements.find(el => 
        el.accessibilityLabel === 'survey-demo-tab' || el.text === 'Survey Demo'
      );

      expect(surveyTab).toBeTruthy();

      // Return to portrait
      await mobileMcpAdapter.setOrientation('portrait');
      
      // Verify UI still works in portrait
      const portraitElements = await mobileMcpAdapter.getElementsOnScreen();
      const portraitSurveyTab = portraitElements.find(el => 
        el.accessibilityLabel === 'survey-demo-tab' || el.text === 'Survey Demo'
      );

      expect(portraitSurveyTab).toBeTruthy();
      
      console.log('✅ Orientation changes handled correctly');
    });

    it('should handle swipe gestures', async () => {
      // Navigate to survey first
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

      // Test swipe gestures
      await mobileMcpAdapter.swipe('up');
      await global.waitForMobileStabilization(500);
      
      await mobileMcpAdapter.swipe('down');
      await global.waitForMobileStabilization(500);

      // Verify app is still responsive
      const postSwipeElements = await mobileMcpAdapter.getElementsOnScreen();
      expect(postSwipeElements.length).toBeGreaterThan(0);
      
      console.log('✅ Swipe gestures handled correctly');
    });

    it('should capture device info correctly', async () => {
      const info = mobileMcpAdapter.getDeviceInfo();
      
      expect(info).toBeTruthy();
      expect(info.name).toBe('iPhone 16');
      expect(info.type).toBe('simulator');
      expect(info.screenSize).toBeTruthy();
      expect(info.screenSize.width).toBeGreaterThan(0);
      expect(info.screenSize.height).toBeGreaterThan(0);
      
      console.log('✅ Device info captured correctly:', info);
    });
  });
});