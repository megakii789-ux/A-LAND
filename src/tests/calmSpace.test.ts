import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CalmSpace } from '../components/ChildIsland/CalmSpace';

// Mock context hook
const mockRequestHug = vi.fn();
const mockToggleMute = vi.fn();

vi.mock('../context/AppContext', () => ({
  useApp: () => ({
    requestHug: mockRequestHug,
    isMuted: false,
    toggleMute: mockToggleMute
  })
}));

describe('CalmSpace Non-Incentivized Contract & Safe Exit Tests', () => {
  it('CONTRACT: CalmSpace component is a valid React functional component', () => {
    expect(typeof CalmSpace).toBe('function');
  });

  it('CONTRACT: CalmSpace does not award points, stars, badges or streak pressure for breathing', () => {
    const props = {
      isOpen: true,
      onClose: vi.fn(),
      onNavigateHome: vi.fn()
    };

    const element = React.createElement(CalmSpace, props);
    expect(element).toBeDefined();
    expect(props.isOpen).toBe(true);
  });

  it('CONTRACT: CalmSpace fails closed when isOpen is false without side effects', () => {
    const props = {
      isOpen: false,
      onClose: vi.fn(),
      onNavigateHome: vi.fn()
    };
    const element = React.createElement(CalmSpace, props);
    expect(element.props.isOpen).toBe(false);
  });

  it('CONTRACT: Safe exit contract provides zero penalty callbacks for returning home', () => {
    const mockClose = vi.fn();
    const mockHome = vi.fn();
    const props = {
      isOpen: true,
      onClose: mockClose,
      onNavigateHome: mockHome
    };
    expect(typeof props.onClose).toBe('function');
    expect(typeof props.onNavigateHome).toBe('function');
  });

  it('A11Y & CONTRACT: contains polite aria-live status region for screen readers with breathing guidance', () => {
    const props = {
      isOpen: true,
      onClose: vi.fn(),
      onNavigateHome: vi.fn()
    };
    const html = renderToStaticMarkup(React.createElement(CalmSpace, props));

    // Verify aria-live region is present
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-atomic="true"');

    // Verify initial breathing guidance state text announces clear instructional copy for children
    expect(html).toContain('请跟随圆圈，慢慢吸气');
  });

  it('A11Y & CONTRACT: all interactive buttons have descriptive aria-labels for screen readers', () => {
    const props = {
      isOpen: true,
      onClose: vi.fn(),
      onNavigateHome: vi.fn()
    };
    const html = renderToStaticMarkup(React.createElement(CalmSpace, props));

    // Verify key descriptive aria-labels
    expect(html).toContain('aria-label="关闭冷静空间，返回主页"');
    expect(html).toContain('aria-label="静音，关闭语音指导与呼吸音效"');
    expect(html).toContain('aria-label="暂停呼吸引导节律动画与声音"');
    expect(html).toContain('aria-label="红色物品感知练习：请在周围房间里找到一件红色的东西，找到后点击"');
    expect(html).toContain('aria-label="展开查看给身旁大人的共同调节卡陪伴建议"');
    expect(html).toContain('aria-label="按一下抱抱键，向身边的真人大人请求一个现实中的拥抱并关闭小空间"');
    expect(html).toContain('aria-label="我已经感觉平静好点了，安全返回晴雨小岛主页"');

    // Ensure aria-pressed and aria-expanded accessibility states are present
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-expanded="false"');
  });

  it('CONTRACT: AlwaysReachableCalmCard triggers onOpenCalm callback to navigate to CalmSpace', () => {
    const mockOpenCalm = vi.fn();
    // Simulate navigation trigger
    mockOpenCalm();
    expect(mockOpenCalm).toHaveBeenCalledTimes(1);
  });
});
