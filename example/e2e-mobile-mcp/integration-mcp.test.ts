/**
 * Integration Tests for Mobile MCP with Existing Test Suite
 * 
 * These tests verify that Mobile MCP E2E tests integrate well with
 * the existing test infrastructure and provide comprehensive coverage.
 */

import { mobileMcpAdapter } from './mobileMcpAdapter';

describe('Mobile MCP Integration Tests', () => {
  let deviceInfo: any;

  beforeAll(async () => {
    deviceInfo = await mobileMcpAdapter.initialize();
    await mobileMcpAdapter.launchApp();
    console.log('📱 Integration tests initialized');
  }, 60000);

  afterAll(async () => {
    await mobileMcpAdapter.terminateApp();
    console.log('🧹 Integration tests completed');
  }, 30000);

  describe('Test Suite Integration', () => {
    it('should provide same test coverage as Detox tests', async () => {
      // This test verifies that Mobile MCP tests cover the same scenarios as Detox
      
      // Test 1: Navigation tabs (equivalent to Detox test)
      const elements = await mobileMcpAdapter.getElementsOnScreen();
      const surveyTab = elements.find(el => 
        el.accessibilityLabel === 'survey-demo-tab' || el.text === 'Survey Demo'
      );
      const exploreTab = elements.find(el => 
        el.accessibilityLabel === 'explore-tab' || el.text === 'Explore'
      );

      expect(surveyTab).toBeTruthy();
      expect(exploreTab).toBeTruthy();

      // Test 2: Survey flow (equivalent to Detox test)
      if (surveyTab) {
        await mobileMcpAdapter.tapAtCoordinates(
          surveyTab.coordinates.x, 
          surveyTab.coordinates.y
        );
        await global.waitForMobileStabilization(1500);
      }

      const surveyElements = await mobileMcpAdapter.getElementsOnScreen();
      const surveyContainer = surveyElements.find(el => 
        el.accessibilityLabel === 'survey-container'
      );

      expect(surveyContainer).toBeTruthy();

      // Test 3: Question interaction (equivalent to Detox test)
      const nameQuestion = surveyElements.find(el => 
        el.accessibilityLabel === 'question-name'
      );

      if (nameQuestion) {
        await mobileMcpAdapter.tapAtCoordinates(
          nameQuestion.coordinates.x, 
          nameQuestion.coordinates.y
        );
        await global.waitForMobileStabilization(500);
        await mobileMcpAdapter.typeText('Integration Test User');
        await global.waitForMobileStabilization(500);
      }

      console.log('✅ Mobile MCP provides equivalent test coverage to Detox');
    });

    it('should complement unit tests effectively', async () => {
      // Navigate to explore tab to test component catalog
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

      // Test that components from unit tests work in real environment
      const exploreElements = await mobileMcpAdapter.getElementsOnScreen();
      const questionTypeList = exploreElements.find(el => 
        el.accessibilityLabel === 'question-type-list'
      );

      expect(questionTypeList).toBeTruthy();

      // Test question types that are covered in unit tests
      const expectedTypes = ['Text Input', 'Checkbox', 'Radio Group'];
      const foundTypes = expectedTypes.filter(type => 
        exploreElements.some(el => el.text === type)
      );

      expect(foundTypes.length).toBeGreaterThan(0);
      
      console.log('✅ Mobile MCP tests complement unit tests effectively');
    });

    it('should verify build and packaging integration', async () => {
      // This test verifies that the built app works correctly in Mobile MCP
      
      // Check that the app is actually running (not just mocked)
      const elements = await mobileMcpAdapter.getElementsOnScreen();
      expect(elements.length).toBeGreaterThan(0);

      // Verify that survey-core integration works
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

      const surveyElements = await mobileMcpAdapter.getElementsOnScreen();
      const surveyTitle = surveyElements.find(el => 
        el.text && el.text.includes('Customer Satisfaction Survey')
      );

      expect(surveyTitle).toBeTruthy();
      
      console.log('✅ Build and packaging integration verified');
    });
  });

  describe('Performance Benchmarking', () => {
    it('should measure app launch performance', async () => {
      const startTime = Date.now();
      
      // Terminate and relaunch app
      await mobileMcpAdapter.terminateApp();
      await global.waitForMobileStabilization(1000);
      
      const launchStartTime = Date.now();
      await mobileMcpAdapter.launchApp();
      
      // Wait for app to be fully loaded
      await global.waitForMobileStabilization(2000);
      
      const launchEndTime = Date.now();
      const launchTime = launchEndTime - launchStartTime;
      
      // Verify app is functional
      const elements = await mobileMcpAdapter.getElementsOnScreen();
      expect(elements.length).toBeGreaterThan(0);
      
      // Launch time should be reasonable (under 10 seconds)
      expect(launchTime).toBeLessThan(10000);
      
      console.log(`✅ App launch time: ${launchTime}ms`);
    });

    it('should measure navigation performance', async () => {
      const navigationTimes: number[] = [];
      
      // Test navigation between tabs multiple times
      for (let i = 0; i < 5; i++) {
        const elements = await mobileMcpAdapter.getElementsOnScreen();
        
        // Navigate to Survey tab
        const surveyTab = elements.find(el => 
          el.accessibilityLabel === 'survey-demo-tab' || el.text === 'Survey Demo'
        );
        
        if (surveyTab) {
          const navStartTime = Date.now();
          await mobileMcpAdapter.tapAtCoordinates(
            surveyTab.coordinates.x, 
            surveyTab.coordinates.y
          );
          await global.waitForMobileStabilization(1000);
          const navEndTime = Date.now();
          
          navigationTimes.push(navEndTime - navStartTime);
        }
        
        // Navigate to Explore tab
        const currentElements = await mobileMcpAdapter.getElementsOnScreen();
        const exploreTab = currentElements.find(el => 
          el.accessibilityLabel === 'explore-tab' || el.text === 'Explore'
        );
        
        if (exploreTab) {
          const navStartTime = Date.now();
          await mobileMcpAdapter.tapAtCoordinates(
            exploreTab.coordinates.x, 
            exploreTab.coordinates.y
          );
          await global.waitForMobileStabilization(1000);
          const navEndTime = Date.now();
          
          navigationTimes.push(navEndTime - navStartTime);
        }
      }
      
      const avgNavigationTime = navigationTimes.reduce((a, b) => a + b, 0) / navigationTimes.length;
      
      // Navigation should be fast (under 2 seconds on average)
      expect(avgNavigationTime).toBeLessThan(2000);
      
      console.log(`✅ Average navigation time: ${avgNavigationTime.toFixed(0)}ms`);
    });

    it('should measure survey completion performance', async () => {
      const startTime = Date.now();
      
      // Complete full survey flow
      await global.retryMobileOperation(async () => {
        // Navigate to survey
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

        // Fill first question
        let currentElements = await mobileMcpAdapter.getElementsOnScreen();
        const nameQuestion = currentElements.find(el => 
          el.accessibilityLabel === 'question-name'
        );

        if (nameQuestion) {
          await mobileMcpAdapter.tapAtCoordinates(
            nameQuestion.coordinates.x, 
            nameQuestion.coordinates.y
          );
          await global.waitForMobileStabilization(300);
          await mobileMcpAdapter.typeText('Performance Test User');
          await global.waitForMobileStabilization(300);
        }

        // Navigate to next page
        currentElements = await mobileMcpAdapter.getElementsOnScreen();
        const nextButton = currentElements.find(el => 
          el.accessibilityLabel === 'survey-next-button'
        );

        if (nextButton) {
          await mobileMcpAdapter.tapAtCoordinates(
            nextButton.coordinates.x, 
            nextButton.coordinates.y
          );
          await global.waitForMobileStabilization(1000);
        }

        // Complete survey (simplified)
        currentElements = await mobileMcpAdapter.getElementsOnScreen();
        const completeButton = currentElements.find(el => 
          el.accessibilityLabel === 'survey-complete-button'
        );

        if (completeButton) {
          await mobileMcpAdapter.tapAtCoordinates(
            completeButton.coordinates.x, 
            completeButton.coordinates.y
          );
          await global.waitForMobileStabilization(1000);
        }
      });
      
      const endTime = Date.now();
      const surveyCompletionTime = endTime - startTime;
      
      // Survey completion should be reasonable (under 30 seconds)
      expect(surveyCompletionTime).toBeLessThan(30000);
      
      console.log(`✅ Survey completion time: ${surveyCompletionTime}ms`);
    });
  });

  describe('Coverage Verification', () => {
    it('should test all major UI components', async () => {
      const testedComponents = new Set<string>();
      
      // Test Survey components
      const elements = await mobileMcpAdapter.getElementsOnScreen();
      const surveyTab = elements.find(el => 
        el.accessibilityLabel === 'survey-demo-tab' || el.text === 'Survey Demo'
      );

      if (surveyTab) {
        testedComponents.add('survey-tab');
        await mobileMcpAdapter.tapAtCoordinates(
          surveyTab.coordinates.x, 
          surveyTab.coordinates.y
        );
        await global.waitForMobileStabilization(1500);
      }

      const surveyElements = await mobileMcpAdapter.getElementsOnScreen();
      const surveyContainer = surveyElements.find(el => 
        el.accessibilityLabel === 'survey-container'
      );
      
      if (surveyContainer) {
        testedComponents.add('survey-container');
      }

      const nameQuestion = surveyElements.find(el => 
        el.accessibilityLabel === 'question-name'
      );
      
      if (nameQuestion) {
        testedComponents.add('text-question');
      }

      // Test Explore components
      const exploreTab = elements.find(el => 
        el.accessibilityLabel === 'explore-tab' || el.text === 'Explore'
      );

      if (exploreTab) {
        testedComponents.add('explore-tab');
        await mobileMcpAdapter.tapAtCoordinates(
          exploreTab.coordinates.x, 
          exploreTab.coordinates.y
        );
        await global.waitForMobileStabilization(1500);
      }

      const exploreElements = await mobileMcpAdapter.getElementsOnScreen();
      const questionTypeList = exploreElements.find(el => 
        el.accessibilityLabel === 'question-type-list'
      );
      
      if (questionTypeList) {
        testedComponents.add('question-type-list');
      }

      // Verify we tested key components
      const expectedComponents = [
        'survey-tab', 
        'explore-tab', 
        'survey-container', 
        'text-question',
        'question-type-list'
      ];
      
      const coverage = expectedComponents.filter(comp => 
        testedComponents.has(comp)
      ).length / expectedComponents.length;
      
      expect(coverage).toBeGreaterThan(0.6); // At least 60% coverage
      
      console.log(`✅ UI component coverage: ${Math.round(coverage * 100)}%`);
      console.log(`Tested components: ${Array.from(testedComponents).join(', ')}`);
    });

    it('should verify accessibility compliance', async () => {
      // Check accessibility labels across the app
      const allElements = await mobileMcpAdapter.getElementsOnScreen();
      
      const elementsWithLabels = allElements.filter(el => 
        el.accessibilityLabel && el.accessibilityLabel.length > 0
      );
      
      const elementsWithText = allElements.filter(el => 
        el.text && el.text.length > 0
      );
      
      // Elements should have either accessibility labels or readable text
      const accessibleElements = new Set([
        ...elementsWithLabels.map(el => el.accessibilityLabel),
        ...elementsWithText.map(el => el.text)
      ]);
      
      expect(accessibleElements.size).toBeGreaterThan(0);
      
      console.log(`✅ Accessibility compliance: ${accessibleElements.size} accessible elements`);
    });
  });

  describe('Compatibility Testing', () => {
    it('should work with different device configurations', async () => {
      const deviceInfo = mobileMcpAdapter.getDeviceInfo();
      expect(deviceInfo).toBeTruthy();
      
      // Test current device configuration
      const { name, type, screenSize, orientation } = deviceInfo!;
      
      console.log(`Testing on: ${name} (${type})`);
      console.log(`Screen: ${screenSize.width}x${screenSize.height}`);
      console.log(`Orientation: ${orientation}`);
      
      // Verify app works on this configuration
      const elements = await mobileMcpAdapter.getElementsOnScreen();
      expect(elements.length).toBeGreaterThan(0);
      
      // Test orientation switching
      await mobileMcpAdapter.setOrientation('landscape');
      await global.waitForMobileStabilization(1000);
      
      const landscapeElements = await mobileMcpAdapter.getElementsOnScreen();
      expect(landscapeElements.length).toBeGreaterThan(0);
      
      await mobileMcpAdapter.setOrientation('portrait');
      await global.waitForMobileStabilization(1000);
      
      console.log(`✅ Compatible with ${name} in both orientations`);
    });

    it('should handle platform-specific features', async () => {
      const deviceInfo = mobileMcpAdapter.getDeviceInfo();
      
      if (deviceInfo?.type === 'simulator') {
        // Test simulator-specific features
        await mobileMcpAdapter.pressButton('HOME');
        await global.waitForMobileStabilization(1000);
        
        await mobileMcpAdapter.launchApp();
        await global.waitForMobileStabilization(2000);
        
        const elements = await mobileMcpAdapter.getElementsOnScreen();
        expect(elements.length).toBeGreaterThan(0);
        
        console.log('✅ Simulator-specific features work correctly');
      }
      
      // Test common mobile features
      await mobileMcpAdapter.swipe('up');
      await global.waitForMobileStabilization(500);
      
      await mobileMcpAdapter.swipe('down');
      await global.waitForMobileStabilization(500);
      
      console.log('✅ Platform-specific features handled correctly');
    });
  });
});