import { by, device, element, expect } from 'detox';

describe('Survey Flow E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Survey Demo Tab', () => {
    it('should display survey demo tab', async () => {
      await expect(element(by.id('survey-demo-tab'))).toBeVisible();
      await element(by.id('survey-demo-tab')).tap();
    });

    it('should show survey container', async () => {
      await element(by.id('survey-demo-tab')).tap();
      await expect(element(by.id('survey-container'))).toBeVisible();
    });

    it('should display survey title', async () => {
      await element(by.id('survey-demo-tab')).tap();
      await expect(
        element(by.text('Customer Satisfaction Survey'))
      ).toBeVisible();
    });

    it('should navigate through survey pages', async () => {
      await element(by.id('survey-demo-tab')).tap();

      // First page should be visible
      await expect(element(by.id('survey-page-0'))).toBeVisible();

      // Navigate to next page
      await element(by.id('survey-next-button')).tap();

      // Second page should be visible
      await expect(element(by.id('survey-page-1'))).toBeVisible();
    });

    it('should complete survey', async () => {
      await element(by.id('survey-demo-tab')).tap();

      // Answer first question
      await element(by.id('question-name')).typeText('John Doe');

      // Go to next page
      await element(by.id('survey-next-button')).tap();

      // Answer second question
      await element(by.id('question-satisfaction')).tap();
      await element(by.text('Very Satisfied')).tap();

      // Complete survey
      await element(by.id('survey-complete-button')).tap();

      // Should show completion message
      await expect(
        element(by.text('Thank you for completing the survey!'))
      ).toBeVisible();
    });
  });

  describe('Explore Tab', () => {
    it('should display explore tab', async () => {
      await expect(element(by.id('explore-tab'))).toBeVisible();
      await element(by.id('explore-tab')).tap();
    });

    it('should show question type list', async () => {
      await element(by.id('explore-tab')).tap();
      await expect(element(by.id('question-type-list'))).toBeVisible();
    });

    it('should display all question types', async () => {
      await element(by.id('explore-tab')).tap();

      const questionTypes = [
        'Text Input',
        'Checkbox',
        'Radio Group',
        'Dropdown',
        'Rating',
        'Boolean',
        'Matrix',
        'Multiple Text',
      ];

      for (const type of questionTypes) {
        await expect(element(by.text(type))).toBeVisible();
      }
    });

    it('should open question type demo', async () => {
      await element(by.id('explore-tab')).tap();

      // Tap on Text Input
      await element(by.text('Text Input')).tap();

      // Should show demo of text input
      await expect(element(by.id('question-demo-text'))).toBeVisible();
    });
  });

  describe('Cross-Platform Behavior', () => {
    it('should handle orientation changes', async () => {
      await element(by.id('survey-demo-tab')).tap();

      // Rotate to landscape
      await device.setOrientation('landscape');
      await expect(element(by.id('survey-container'))).toBeVisible();

      // Rotate back to portrait
      await device.setOrientation('portrait');
      await expect(element(by.id('survey-container'))).toBeVisible();
    });

    it('should handle keyboard interactions', async () => {
      await element(by.id('survey-demo-tab')).tap();

      // Focus text input
      await element(by.id('question-name')).tap();

      // Keyboard should be visible (platform-specific check)
      if (device.getPlatform() === 'ios') {
        await expect(element(by.type('UIKeyboardImpl'))).toBeVisible();
      }

      // Type text
      await element(by.id('question-name')).typeText('Test User');

      // Dismiss keyboard
      await element(by.id('survey-container')).tap();
    });

    it('should handle navigation gestures', async () => {
      if (device.getPlatform() === 'android') {
        // Test Android back button
        await element(by.id('survey-demo-tab')).tap();
        await element(by.id('survey-next-button')).tap();

        // Press back
        await device.pressBack();

        // Should go to previous page
        await expect(element(by.id('survey-page-0'))).toBeVisible();
      }
    });
  });

  describe('Error Handling', () => {
    it('should show validation errors', async () => {
      await element(by.id('survey-demo-tab')).tap();

      // Try to proceed without answering required question
      await element(by.id('survey-next-button')).tap();

      // Should show validation error
      await expect(element(by.text('This field is required'))).toBeVisible();
    });

    it('should handle network errors gracefully', async () => {
      // Disable network (if supported by test environment)
      await device.disableSynchronization();
      await device.setURLBlacklist(['.*']);

      await element(by.id('survey-demo-tab')).tap();

      // Try to submit survey
      await element(by.id('survey-complete-button')).tap();

      // Should show error message
      await expect(
        element(by.text('Network error. Please try again.'))
      ).toBeVisible();

      // Re-enable network
      await device.setURLBlacklist([]);
      await device.enableSynchronization();
    });
  });
});
