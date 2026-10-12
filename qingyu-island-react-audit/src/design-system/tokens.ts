/**
 * 晴雨小岛 · 儿童优先设计系统 Tokens (Child-First Design Tokens)
 * 遵循 Phase C 指南与儿童 UI 规范：
 * - mobile reference viewport: 390px, supported minimum: 360px, tablet: 768px & 1024px
 * - Child minimum interactive touch target: >= 56x56px
 * - Child primary action button height: >= 64px
 * - Child typography: body >= 18px (text-lg), headings 22-28px (text-xl ~ text-2xl), no important text < 16px (text-base)
 * - Anti-AI slop: no naked pills for static metadata, consistent nested radius, warm soothing palette
 */

export const tokens = {
  // 视口与网格断点基准
  viewport: {
    minMobile: 360,
    referenceMobile: 390,
    largeMobile: 430,
    tabletPortrait: 768,
    tabletLandscape: 1024,
    desktop: 1440,
  },

  // 触摸与交互尺寸规范 (Strict Touch Targets)
  touchTarget: {
    // 6 岁儿童最小交互热区 (>= 56px)
    childMin: 'min-w-[56px] min-h-[56px]',
    // 儿童主行动按钮高度 (>= 64px)
    childPrimaryAction: 'min-h-[64px] px-6 py-4',
    // 顶部与次级图标按钮尺寸 (>= 56px)
    childIconButton: 'w-14 h-14 min-w-[56px] min-h-[56px]',
    // 家长端常规触摸区 (>= 44px)
    parentMin: 'min-w-[44px] min-h-[44px]',
    parentAction: 'min-h-[48px] px-4 py-2.5',
  },

  // 字体层级规范 (Strict Typography Hierarchy)
  typography: {
    child: {
      // 页面主标 (24-28px)
      h1: 'text-2xl sm:text-3xl font-black leading-tight tracking-tight text-stone-800',
      // 卡片标题与小标 (20-24px)
      h2: 'text-xl sm:text-2xl font-black leading-snug tracking-tight text-stone-800',
      // 模块小标题 (18-20px)
      h3: 'text-lg sm:text-xl font-extrabold leading-snug text-stone-800',
      // 儿童正文 (原则上 >= 18px)
      body: 'text-lg leading-relaxed text-stone-700 font-medium',
      // 关键辅助文字 (不低于 16px)
      bodySecondary: 'text-base leading-normal text-stone-600',
      // 提示注脚 (最低 16px，严禁 10-12px)
      caption: 'text-base leading-normal text-stone-500',
    },
    parent: {
      h1: 'text-2xl font-bold tracking-tight text-stone-900',
      h2: 'text-xl font-bold text-stone-800',
      h3: 'text-lg font-semibold text-stone-800',
      body: 'text-sm sm:text-base leading-relaxed text-stone-700',
      caption: 'text-xs sm:text-sm text-stone-500',
    },
  },

  // 间距与外边距系统 (Spacing Math)
  spacing: {
    // 页面外层容器在各断点的安全内边距
    container: 'px-3 sm:px-6 md:px-8',
    // 底部固定操作栏防遮挡安全留白 (至少预留 100px)
    bottomDockPadding: 'pb-28 sm:pb-32',
    // 卡片内边距 (Container padding >= inner padding)
    cardOuter: 'p-5 sm:p-6 md:p-8',
    cardInner: 'p-4 sm:p-5',
    // 卡片间距
    gridGap: 'gap-4 sm:gap-6',
  },

  // 圆角系统 (Nested Radius: r_inner = r_outer - padding)
  radius: {
    cardOuter: 'rounded-3xl',      // 24px
    cardInner: 'rounded-2xl',      // 16px
    button: 'rounded-2xl',         // 16px
    pillButton: 'rounded-full',    // 9999px (仅限可点击按钮，非静态元数据药丸)
  },

  // 温暖柔和的界面表面与色彩 (Surface & Palette)
  surface: {
    islandBackground: 'bg-linear-to-b from-sky-100 via-emerald-50/60 to-amber-50/70',
    cardLight: 'bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-sm',
    cardHover: 'hover:shadow-md hover:border-stone-300 transition-all duration-200',
    modalOverlay: 'bg-stone-950/45 backdrop-blur-sm',
    modalSurface: 'bg-white rounded-3xl border border-stone-200/80 shadow-2xl',
  },

  // 投影系统 (Shadows)
  shadow: {
    card: 'shadow-sm',
    cardElevated: 'shadow-md',
    buttonAction: 'shadow-md active:shadow-xs',
    modal: 'shadow-2xl',
  },

  // 运动与减弱动画原则 (Reduced Motion Compliant)
  motion: {
    interactive: 'transition-all duration-200 motion-reduce:transition-none',
    tapFeedback: 'active:scale-98 motion-reduce:active:scale-100',
    gentlePulse: 'animate-pulse motion-reduce:animate-none',
  },
} as const;

export type DesignTokens = typeof tokens;
