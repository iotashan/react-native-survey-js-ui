import React from 'react';

export const createStackNavigator = () => ({
  Navigator: ({ children }: any) => <>{children}</>,
  Screen: ({ component: Component, initialParams, ...props }: any) => {
    const route = { params: initialParams };
    const navigation = {
      goBack: jest.fn(),
      navigate: jest.fn(),
      push: jest.fn(),
      pop: jest.fn(),
      popToTop: jest.fn(),
      setParams: jest.fn(),
      setOptions: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      isFocused: jest.fn(() => true),
      canGoBack: jest.fn(() => true),
    };
    return <Component {...props} route={route} navigation={navigation} />;
  },
});

export const CardStyleInterpolators = {
  forHorizontalIOS: jest.fn(),
  forVerticalIOS: jest.fn(),
  forModalPresentationIOS: jest.fn(),
  forFadeFromBottomAndroid: jest.fn(),
  forRevealFromBottomAndroid: jest.fn(),
};

export const HeaderStyleInterpolators = {
  forUIKit: jest.fn(),
  forFade: jest.fn(),
  forStatic: jest.fn(),
};

export const TransitionSpecs = {
  TransitionIOSSpec: jest.fn(),
  FadeInFromBottomAndroidSpec: jest.fn(),
  FadeOutToBottomAndroidSpec: jest.fn(),
  RevealFromBottomAndroidSpec: jest.fn(),
};

export const TransitionPresets = {
  SlideFromRightIOS: jest.fn(),
  ModalSlideFromBottomIOS: jest.fn(),
  ModalPresentationIOS: jest.fn(),
  FadeFromBottomAndroid: jest.fn(),
  RevealFromBottomAndroid: jest.fn(),
  ScaleFromCenterAndroid: jest.fn(),
  DefaultTransition: jest.fn(),
  ModalTransition: jest.fn(),
};