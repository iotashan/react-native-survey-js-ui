import * as PanelExports from '../index';

describe('Panel index exports', () => {
  it('should export Panel component', () => {
    expect(PanelExports.Panel).toBeDefined();
  });

  it('should export PanelHeader component', () => {
    expect(PanelExports.PanelHeader).toBeDefined();
  });

  it('should export panel styling utilities', () => {
    expect(PanelExports.panelStyles).toBeDefined();
    expect(PanelExports.getPanelContainerStyle).toBeDefined();
    expect(PanelExports.getNestedPanelStyle).toBeDefined();
    expect(PanelExports.getContentContainerStyle).toBeDefined();
    expect(PanelExports.ResponsiveBreakpoints).toBeDefined();
    expect(PanelExports.setupOrientationListener).toBeDefined();
    expect(PanelExports.removeOrientationListener).toBeDefined();
  });
});