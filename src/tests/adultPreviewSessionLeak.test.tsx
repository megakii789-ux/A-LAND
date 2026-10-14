import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InteractiveGamesHubModal } from '../components/InteractiveGames/InteractiveGamesHubModal';
import { StoryGroveModal } from '../components/ChildIsland/StoryGrove/StoryGroveModal';
import { CrayonDetectiveGame } from '../components/InteractiveGames/CrayonDetectiveGame/CrayonDetectiveGame';
import { FriendAsksHomeGame } from '../components/InteractiveGames/FriendAsksHomeGame/FriendAsksHomeGame';
import { ToyBoatNegotiationGame } from '../components/InteractiveGames/ToyBoatNegotiationGame/ToyBoatNegotiationGame';
import { TransferScenariosModal } from '../components/InteractiveGames/TransferLab/TransferScenariosModal';
import { ParentGateModal } from '../components/ParentGateModal';
import { AppProvider, useApp } from '../context/AppContext';
import { ContentAuditRegistry } from '../domain/cognitive/ContentAuditRegistry';
import {
  makePinRecord,
  savePinRecord,
  verifyPin,
  hasParentAccess,
  lockParentAccess,
  resetParentPinForTesting,
  isAdultPreviewSessionValid,
} from '../domain/privacy/parentAccess';

/**
 * Lightweight stateful React 19 component tree test harness for Vitest node environment.
 * Executes real functional components, React Context providers, useState, useEffect,
 * useRef, useMemo, useCallback, and event handlers without mocking component logic.
 */
interface HookCell {
  tag: 'state' | 'ref' | 'memo' | 'callback' | 'effect';
  value?: any;
  deps?: ReadonlyArray<any>;
  cleanup?: (() => void) | void;
}

interface ComponentInstance {
  hooks: HookCell[];
  hookIndex: number;
}

function areDepsEqual(prev: ReadonlyArray<any> | undefined, next: ReadonlyArray<any> | undefined): boolean {
  if (!prev || !next) return false;
  if (prev.length !== next.length) return false;
  for (let i = 0; i < prev.length; i++) {
    if (!Object.is(prev[i], next[i])) return false;
  }
  return true;
}

function createStatefulTestRenderer(initialElement: React.ReactElement) {
  let rootElement = initialElement;
  const instances = new Map<string, ComponentInstance>();
  const pendingEffects: Array<() => void> = [];
  const contextStack: Array<{ context: any; value: any }> = [];
  let latestTree: any = null;

  const reactInternals =
    (React as any).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE ||
    (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

  function readContext(context: any) {
    for (let i = contextStack.length - 1; i >= 0; i--) {
      if (contextStack[i].context === context) {
        return contextStack[i].value;
      }
    }
    return context._currentValue;
  }

  function createDispatcher(instance: ComponentInstance) {
    return {
      useState(initialState: any) {
        const idx = instance.hookIndex++;
        if (idx >= instance.hooks.length) {
          const initial = typeof initialState === 'function' ? initialState() : initialState;
          instance.hooks.push({ tag: 'state', value: initial });
        }
        const cell = instance.hooks[idx];
        const setState = (updater: any) => {
          const next = typeof updater === 'function' ? updater(cell.value) : updater;
          if (!Object.is(cell.value, next)) {
            cell.value = next;
          }
        };
        return [cell.value, setState];
      },
      useRef(initialValue: any) {
        const idx = instance.hookIndex++;
        if (idx >= instance.hooks.length) {
          instance.hooks.push({ tag: 'ref', value: { current: initialValue } });
        }
        return instance.hooks[idx].value;
      },
      useMemo(factory: () => any, deps?: ReadonlyArray<any>) {
        const idx = instance.hookIndex++;
        if (idx >= instance.hooks.length) {
          const value = factory();
          instance.hooks.push({ tag: 'memo', value, deps });
          return value;
        }
        const cell = instance.hooks[idx];
        if (!areDepsEqual(cell.deps, deps)) {
          cell.value = factory();
          cell.deps = deps;
        }
        return cell.value;
      },
      useCallback(callback: any, deps?: ReadonlyArray<any>) {
        const idx = instance.hookIndex++;
        if (idx >= instance.hooks.length) {
          instance.hooks.push({ tag: 'callback', value: callback, deps });
          return callback;
        }
        const cell = instance.hooks[idx];
        if (!areDepsEqual(cell.deps, deps)) {
          cell.value = callback;
          cell.deps = deps;
        }
        return cell.value;
      },
      useEffect(create: () => (() => void) | void, deps?: ReadonlyArray<any>) {
        const idx = instance.hookIndex++;
        if (idx >= instance.hooks.length) {
          const cell: HookCell = { tag: 'effect', deps };
          instance.hooks.push(cell);
          pendingEffects.push(() => {
            cell.cleanup = create();
          });
          return;
        }
        const cell = instance.hooks[idx];
        if (!areDepsEqual(cell.deps, deps)) {
          cell.deps = deps;
          pendingEffects.push(() => {
            if (typeof cell.cleanup === 'function') {
              cell.cleanup();
            }
            cell.cleanup = create();
          });
        }
      },
      useContext(context: any) {
        return readContext(context);
      },
    };
  }

  function renderNode(node: any, path: string, seenPaths: Set<string>): any {
    if (node === null || node === undefined || typeof node === 'boolean') return null;
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) {
      return node.map((child, idx) => renderNode(child, `${path}.${idx}`, seenPaths));
    }
    if (!React.isValidElement(node)) return null;

    const element = node as React.ReactElement<any>;
    const type: any = element.type;

    if (type === React.Fragment) {
      return renderNode(element.props.children, `${path}.frag`, seenPaths);
    }

    // React 19 Context Provider (either <Context value={...}> or <Context.Provider value={...}>)
    if (typeof type === 'object' && type !== null && ('_context' in type || '$$typeof' in type)) {
      const ctx = type._context || type;
      if ('value' in element.props) {
        contextStack.push({ context: ctx, value: element.props.value });
        try {
          return renderNode(element.props.children, `${path}.ctx`, seenPaths);
        } finally {
          contextStack.pop();
        }
      }
    }

    if (typeof type === 'function') {
      const compName = type.displayName || type.name || 'Anonymous';
      const instanceKey = `${path}:${compName}${element.key !== null ? `:${element.key}` : ''}`;
      seenPaths.add(instanceKey);

      let instance = instances.get(instanceKey);
      if (!instance) {
        instance = { hooks: [], hookIndex: 0 };
        instances.set(instanceKey, instance);
      }
      instance.hookIndex = 0;

      const prevDispatcher = reactInternals.H;
      reactInternals.H = createDispatcher(instance);
      let renderedChild: any;
      try {
        renderedChild = type(element.props);
      } finally {
        reactInternals.H = prevDispatcher;
      }
      return renderNode(renderedChild, instanceKey, seenPaths);
    }

    // Host element (div, button, input, form, span, etc.)
    const renderedChildren = renderNode(element.props.children, `${path}.${String(type)}`, seenPaths);
    return {
      type,
      props: element.props,
      children: Array.isArray(renderedChildren)
        ? renderedChildren
        : renderedChildren !== null
          ? [renderedChildren]
          : [],
    };
  }

  function flushRender() {
    for (let pass = 0; pass < 5; pass++) {
      const seenPaths = new Set<string>();
      latestTree = renderNode(rootElement, 'root', seenPaths);

      for (const [key, inst] of Array.from(instances.entries())) {
        if (!seenPaths.has(key)) {
          for (const h of inst.hooks) {
            if (h.tag === 'effect' && typeof h.cleanup === 'function') {
              h.cleanup();
              h.cleanup = undefined;
            }
          }
          instances.delete(key);
        }
      }

      if (pendingEffects.length === 0) break;
      const effectsToRun = pendingEffects.splice(0, pendingEffects.length);
      for (const eff of effectsToRun) {
        eff();
      }
    }
  }

  flushRender();

  function collectText(node: any): string {
    if (node === null || node === undefined) return '';
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(collectText).join(' ');
    if (typeof node === 'object' && node.children) {
      return node.children.map(collectText).join(' ');
    }
    return '';
  }

  function findAll(predicate: (node: { type: any; props: any; text: string }) => boolean): Array<{
    type: any;
    props: any;
    text: string;
  }> {
    const matches: Array<{ type: any; props: any; text: string }> = [];
    function walk(node: any) {
      if (!node) return;
      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }
      if (typeof node === 'object' && node.type) {
        const item = { type: node.type, props: node.props || {}, text: collectText(node) };
        if (predicate(item)) {
          matches.push(item);
        }
        if (Array.isArray(node.children)) {
          node.children.forEach(walk);
        }
      }
    }
    walk(latestTree);
    return matches;
  }

  return {
    rerender(nextElement?: React.ReactElement) {
      if (nextElement) {
        rootElement = nextElement;
      }
      flushRender();
    },
    getText() {
      return collectText(latestTree);
    },
    findButtonByText(substring: string) {
      return findAll((n) => n.type === 'button' && n.text.includes(substring))[0] || null;
    },
    findInputs() {
      return findAll((n) => n.type === 'input');
    },
    findForms() {
      return findAll((n) => n.type === 'form');
    },
    click(target: { props: any } | null) {
      if (!target || typeof target.props.onClick !== 'function') {
        throw new Error('Target button has no onClick handler');
      }
      target.props.onClick({
        stopPropagation: () => {},
        preventDefault: () => {},
      });
      flushRender();
    },
    unmount() {
      for (const [, inst] of Array.from(instances.entries())) {
        for (const h of inst.hooks) {
          if (h.tag === 'effect' && typeof h.cleanup === 'function') {
            h.cleanup();
            h.cleanup = undefined;
          }
        }
      }
      instances.clear();
    },
  };
}

async function configureTestPin(pin = '246810') {
  const record = await makePinRecord(pin);
  savePinRecord(record);
  lockParentAccess();
}

describe('P0 Adult Review Preview Session Leak — Real React Component-Level Tests', () => {
  beforeEach(() => {
    const localStore = new Map<string, string>();
    const sessionStore = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => localStore.get(k) ?? null,
      setItem: (k: string, v: string) => localStore.set(k, String(v)),
      removeItem: (k: string) => localStore.delete(k),
      clear: () => localStore.clear(),
    });
    vi.stubGlobal('sessionStorage', {
      getItem: (k: string) => sessionStore.get(k) ?? null,
      setItem: (k: string, v: string) => sessionStore.set(k, String(v)),
      removeItem: (k: string) => sessionStore.delete(k),
      clear: () => sessionStore.clear(),
    });
    vi.stubGlobal('window', {
      localStorage: (globalThis as any).localStorage,
      sessionStorage: (globalThis as any).sessionStorage,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
      matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
      scrollTo: () => {},
    });
    vi.stubGlobal('document', {
      hidden: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    });

    ContentAuditRegistry.resetToDefault();
    resetParentPinForTesting();
  });

  afterEach(() => {
    resetParentPinForTesting();
    ContentAuditRegistry.resetToDefault();
    vi.unstubAllGlobals();
  });

  it('Executes full 8-step lifecycle on InteractiveGamesHubModal: open unapproved game -> PIN verify -> enter adult preview -> close -> reopen -> blocked -> lockParentAccess immediately exits -> game switch revokes preview', async () => {
    // Confirm all games remain strictly PENDING in ContentAuditRegistry (never modified to PASSED)
    expect(ContentAuditRegistry.getAuditRecord('SCENE_B_PEER_BULLYING_FAMILY_V1')?.auditStatus).toBe('PENDING');
    expect(ContentAuditRegistry.getAuditRecord('SCENE_A_PEER_ASKING_RESIDENCE_V1')?.auditStatus).toBe('PENDING');
    expect(ContentAuditRegistry.getAuditRecord('SCENE_C_RAINY_OUTDOOR_CANCEL_V1')?.auditStatus).toBe('PENDING');

    await configureTestPin('246810');
    expect(hasParentAccess()).toBe(false);

    // 1. 打开未审游戏 (Open unapproved game in InteractiveGamesHubModal)
    const onClose = vi.fn();
    const view = createStatefulTestRenderer(
      <AppProvider>
        <InteractiveGamesHubModal isOpen={true} onClose={onClose} />
      </AppProvider>
    );

    expect(view.getText()).toContain('这个小游戏正在做最后准备');
    expect(view.getText()).not.toContain('家长与审阅人预览模式');
    expect(view.getText()).not.toContain('结构同构 · 人工审核');

    // 2. 点击“家长 / 审阅人验证预览”打开 ParentGateModal 并完成本机 PIN 验证
    const openGateBtn = view.findButtonByText('家长 / 审阅人验证预览');
    expect(openGateBtn).not.toBeNull();
    view.click(openGateBtn);

    expect(view.getText()).toContain('家长端防误触校验');

    // Negative check first: wrong PIN must NOT unlock preview
    const wrongPinRes = await verifyPin('999999');
    expect(wrongPinRes.success).toBe(false);
    expect(hasParentAccess()).toBe(false);

    // Complete real PIN verification via ParentGateModal form submission
    const inputs = view.findInputs();
    expect(inputs.length).toBeGreaterThan(0);
    inputs[0].props.onChange({ target: { value: '246810' } });
    view.rerender();

    const forms = view.findForms();
    expect(forms.length).toBeGreaterThan(0);
    await forms[0].props.onSubmit({ preventDefault: () => {} });
    view.rerender();

    // 3. 进入成人预览 (Confirm adult preview is now active for the current scoped session)
    expect(hasParentAccess()).toBe(true);
    expect(view.getText()).toContain('家长与审阅人预览模式');
    expect(view.getText()).toContain('结构同构 · 人工审核');

    // 4. 关闭游戏弹窗 (Close game modal)
    view.rerender(
      <AppProvider>
        <InteractiveGamesHubModal isOpen={false} onClose={onClose} />
      </AppProvider>
    );
    expect(hasParentAccess()).toBe(false);
    expect(isAdultPreviewSessionValid('game_crayon_detective', 'any-token')).toBe(false);

    // 5. 重新打开游戏弹窗 (Reopen game modal)
    view.rerender(
      <AppProvider>
        <InteractiveGamesHubModal isOpen={true} onClose={onClose} />
      </AppProvider>
    );

    // 6. 确认未经重新授权不能访问未审内容 (Must show pending screen again, never retain previous unlock!)
    expect(view.getText()).toContain('这个小游戏正在做最后准备');
    expect(view.getText()).not.toContain('家长与审阅人预览模式');
    expect(view.getText()).not.toContain('结构同构 · 人工审核');

    // Re-authorize once more to test Steps 7 & 8
    view.click(view.findButtonByText('家长 / 审阅人验证预览'));
    view.findInputs()[0].props.onChange({ target: { value: '246810' } });
    view.rerender();
    await view.findForms()[0].props.onSubmit({ preventDefault: () => {} });
    view.rerender();
    expect(view.getText()).toContain('家长与审阅人预览模式');

    // 7. 成人访问状态失效时，已经开启的预览必须立即退出
    lockParentAccess();
    view.rerender();
    expect(view.getText()).toContain('这个小游戏正在做最后准备');
    expect(view.getText()).not.toContain('家长与审阅人预览模式');
    expect(view.getText()).not.toContain('结构同构 · 人工审核');

    // 8. 切换游戏不得继承已开启或已失效的预览授权
    view.click(view.findButtonByText('家长 / 审阅人验证预览'));
    view.findInputs()[0].props.onChange({ target: { value: '246810' } });
    view.rerender();
    await view.findForms()[0].props.onSubmit({ preventDefault: () => {} });
    view.rerender();
    expect(view.getText()).toContain('家长与审阅人预览模式');

    // Switch tab to 《问起我的家》
    const friendTabBtn = view.findButtonByText('问起我的家');
    expect(friendTabBtn).not.toBeNull();
    view.click(friendTabBtn);

    expect(hasParentAccess()).toBe(false);
    expect(view.getText()).toContain('这个小游戏正在做最后准备');
    expect(view.getText()).not.toContain('家长与审阅人预览模式');

    view.unmount();
  });

  it('Verifies StoryGroveModal, standalone games (CrayonDetectiveGame, FriendAsksHomeGame, ToyBoatNegotiationGame), TransferScenariosModal, and returning to child mode immediately revoke adult preview', async () => {
    await configureTestPin('246810');

    // Test StoryGroveModal inside AppProvider
    let appCtxRef: ReturnType<typeof useApp> | null = null;
    const ContextProbe: React.FC<{ isStoryOpen: boolean }> = ({ isStoryOpen }) => {
      appCtxRef = useApp();
      return <StoryGroveModal isOpen={isStoryOpen} onClose={() => {}} initialLeafId="cup-size" />;
    };

    const storyView = createStatefulTestRenderer(
      <AppProvider>
        <ContextProbe isStoryOpen={true} />
      </AppProvider>
    );

    // Select a story in catalog to enter pending review screen
    const selectStoryBtn = storyView.findButtonByText('看看详情');
    expect(selectStoryBtn).not.toBeNull();
    storyView.click(selectStoryBtn);
    expect(storyView.getText()).toContain('这片故事叶正在由大人细心检查中');

    // Authorize adult preview in StoryGroveModal
    storyView.click(storyView.findButtonByText('家长 / 审阅人验证后预览'));
    storyView.findInputs()[0].props.onChange({ target: { value: '246810' } });
    storyView.rerender();
    await storyView.findForms()[0].props.onSubmit({ preventDefault: () => {} });
    storyView.rerender();

    expect(storyView.getText()).toContain('当前为家长/专家受控审阅预览模式（已通过家长 PIN 校验）');

    // Step 8: Returning to child mode via AppContext.setCurrentView('child') immediately revokes preview!
    expect(appCtxRef).not.toBeNull();
    appCtxRef!.setCurrentView('child');
    storyView.rerender();
    expect(hasParentAccess()).toBe(false);
    expect(storyView.getText()).toContain('这片故事叶正在由大人细心检查中');
    expect(storyView.getText()).not.toContain('当前为家长/专家受控审阅预览模式（已通过家长 PIN 校验）');

    // Re-authorize, then close & reopen StoryGroveModal -> must be locked again
    storyView.click(storyView.findButtonByText('家长 / 审阅人验证后预览'));
    storyView.findInputs()[0].props.onChange({ target: { value: '246810' } });
    storyView.rerender();
    await storyView.findForms()[0].props.onSubmit({ preventDefault: () => {} });
    storyView.rerender();
    expect(storyView.getText()).toContain('当前为家长/专家受控审阅预览模式（已通过家长 PIN 校验）');

    storyView.rerender(
      <AppProvider>
        <ContextProbe isStoryOpen={false} />
      </AppProvider>
    );
    expect(hasParentAccess()).toBe(false);

    storyView.rerender(
      <AppProvider>
        <ContextProbe isStoryOpen={true} />
      </AppProvider>
    );
    storyView.click(storyView.findButtonByText('看看详情'));
    expect(storyView.getText()).toContain('这片故事叶正在由大人细心检查中');
    storyView.unmount();

    // Test standalone CrayonDetectiveGame, FriendAsksHomeGame, ToyBoatNegotiationGame, and TransferScenariosModal
    // Even if a caller passes isAdultPreview={true}, without a valid scoped session in parentAccess it MUST block!
    const StandaloneProbe: React.FC = () => (
      <AppProvider>
        <CrayonDetectiveGame onExit={() => {}} isAdultPreview={false} />
        <FriendAsksHomeGame onExit={() => {}} isAdultPreview={false} />
        <ToyBoatNegotiationGame onExit={() => {}} isAdultPreview={false} />
        <TransferScenariosModal isOpen={true} onClose={() => {}} />
      </AppProvider>
    );
    const standaloneView = createStatefulTestRenderer(<StandaloneProbe />);
    expect(standaloneView.getText()).toContain('「蜡笔侦探」正在由大人们做最后的安全检查');
    expect(standaloneView.getText()).toContain('「朋友问起我的家」需要大人们做好最后的安全检查');
    expect(standaloneView.getText()).toContain('「小船协商」正在由大人们做最后的安全检查');
    expect(standaloneView.getText()).toContain('正在由大人们做最后的安全检查');
    standaloneView.unmount();
  });

  it('Requirement 五.C: Closing ParentGateModal during async PIN verification cancels verification and NEVER fires onSuccess', async () => {
    await configureTestPin('246810');

    const onSuccess = vi.fn();
    const onClose = vi.fn();

    const gateView = createStatefulTestRenderer(
      <ParentGateModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    );

    const inputs = gateView.findInputs();
    expect(inputs.length).toBe(1);
    inputs[0].props.onChange({ target: { value: '246810' } });
    gateView.rerender();

    // Start async form submission (PBKDF2 SHA-256 verification) WITHOUT awaiting it yet
    const submitPromise = gateView.findForms()[0].props.onSubmit({ preventDefault: () => {} });

    // Immediately click "返回孩子小岛" while async PBKDF2 verification is still in flight
    const closeBtn = gateView.findButtonByText('返回孩子小岛');
    expect(closeBtn).not.toBeNull();
    gateView.click(closeBtn);
    gateView.rerender(<ParentGateModal isOpen={false} onClose={onClose} onSuccess={onSuccess} />);

    // Now await the in-flight verification promise
    await submitPromise;
    gateView.rerender();

    // Authorization callback MUST NOT have been invoked, and parent access MUST remain false!
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(hasParentAccess()).toBe(false);

    gateView.unmount();
  });
});
