import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Backpack,
  Heart,
  X,
  Volume2,
  CheckCircle2,
  Clock,
  Sparkles,
  Home,
  ShieldAlert,
  RotateCcw,
  PauseCircle,
  ChevronDown,
  ChevronUp,
  Star,
  HelpCircle,
  Compass,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { sounds } from '../../../utils/sound';
import {
  speechNarrator,
  KaraokeSyncState,
  CompanionVoiceId,
  VOICE_PROFILES,
  COMPANION_TO_VOICE_PROFILE,
} from '../../../utils/speech';
import { ANIMAL_COMPANIONS } from '../../../domain/personalization';
import { LocationBadgeIllustration } from '../StoryGrove/StoryIllustrations';
import { CompanionAvatarSvg, IslandUiIconSvg } from '../CompanionIcons';
import {
  TransitionSliceId,
  TransitionContextMode,
  TransitionFeelingId,
  SpecificFearReasonId,
  TransitionActionId,
  TransitionExperienceState,
  TRANSITION_FIXED_VOICE_LINES,
  TRANSITION_FEELING_OPTIONS,
  SPECIFIC_FEAR_REASONS,
  createInitialTransitionExperienceState,
  toggleTransitionFeeling,
  interactWithSliceAObject,
  interactWithSliceBObject,
  investigateSliceCFearReason,
  getAvailableActionsForState,
  executeTransitionAction,
  prepareRetryTransitionAttempt,
  pauseTransitionExperienceVoluntarily,
  getSliceEntrySpeech,
} from '../../../domain/transition/transitionExperienceEngine';
import {
  getProductExperienceMetrics,
  recordTransitionExperienceProgress,
} from '../../../domain/cognitive/productExperienceMetrics';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const WEEK_SCHEDULE = [
  { day: '周一', home: '妈妈家' as const },
  { day: '周二', home: '妈妈家' as const },
  { day: '周三', home: '妈妈家' as const },
  { day: '周四', home: '妈妈家' as const, isToday: true },
  { day: '周五', home: '爸爸家' as const },
  { day: '周六', home: '爸爸家' as const },
  { day: '周日', home: '爸爸家' as const },
];

const COMPANION_ORDER: CompanionVoiceId[] = [
  'guoguo_squirrel',
  'beibei_otter',
  'tiantian_raccoon',
  'qiqi_deer',
];

const SLICE_TABS: Array<{
  id: TransitionSliceId;
  shortTitle: string;
  subtitle: string;
  badge: string;
}> = [
  {
    id: 'SLICE_A_BIDIRECTIONAL_ATTACHMENT',
    shortTitle: '双向不舍',
    subtitle: '两边都想念 · 不用二选一',
    badge: 'Slice A',
  },
  {
    id: 'SLICE_B_LOYALTY_CONFLICT',
    shortTitle: '忠诚冲突',
    subtitle: '分清真事与猜测 · 不当传话筒',
    badge: 'Slice B',
  },
  {
    id: 'SLICE_C_SPECIFIC_FEAR_OR_CONCERN',
    shortTitle: '具体担忧',
    subtitle: '先查原因 · 安全护盾优先',
    badge: 'Slice C',
  },
  {
    id: 'ORDINARY_HAPPY_TRANSITION',
    shortTitle: '轻松过桥',
    subtitle: '平常开心出发 · 无需安抚',
    badge: '日常',
  },
];

function hasPriorSavedBridgeProgress(): boolean {
  const m = getProductExperienceMetrics();
  const hasSavedStates =
    m.transitionSliceStatesById && Object.keys(m.transitionSliceStatesById).length > 0;
  return Boolean(
    m.activeTransitionSliceId ||
      hasSavedStates ||
      (m.exploredTransitionSliceIds && m.exploredTransitionSliceIds.length > 0)
  );
}

const NEUTRAL_ENTRY_CHOICES = [
  {
    id: 'ordinary_happy' as const,
    testId: 'bridge-entry-ordinary-happy',
    title: '今天轻松开心',
    subtitle: '平平常常去另一边，带日常小物品出发',
    badge: '轻松日常',
  },
  {
    id: 'dual_attachment' as const,
    testId: 'bridge-entry-dual-attachment',
    title: '有点舍不得',
    subtitle: '舍不得这边，或者同时想念两边',
    badge: '双向不舍',
  },
  {
    id: 'loyalty_conflict' as const,
    testId: 'bridge-entry-loyalty-conflict',
    title: '担心别人的感受',
    subtitle: '在这边开心，但担心另一边大人难过',
    badge: '关系边界',
  },
  {
    id: 'specific_concern' as const,
    testId: 'bridge-entry-specific-concern',
    title: '有些害怕或说不清',
    subtitle: '看看具体原因，也可以先安静坐一会儿',
    badge: '具体担忧',
  },
  {
    id: 'story_mode' as const,
    testId: 'bridge-entry-story-mode',
    title: '想先体验一个小朋友的故事',
    subtitle: '不先说自己的事，看看小动物乐乐怎么过桥',
    badge: '故事模式',
  },
];

export const TwoHomesBridgeModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    tonightAt,
    daysToNextSwitch,
    packedItems,
    togglePackedItem,
    missNotes,
    addMissNote,
    personalization,
    updatePersonalization,
  } = useApp();

  const [showNeutralEntryGate, setShowNeutralEntryGate] = useState<boolean>(
    () => !hasPriorSavedBridgeProgress()
  );

  // 按 Slice 独立保存状态快照，支持返回、重试与跨情境切换不丢状态（验收反例 #9 & Section IV 中性首次入口）
  const [sliceStatesById, setSliceStatesById] = useState<
    Record<TransitionSliceId, TransitionExperienceState>
  >(() => {
    const hasSaved = hasPriorSavedBridgeProgress();
    const saved = getProductExperienceMetrics().transitionSliceStatesById || {};
    return {
      SLICE_A_BIDIRECTIONAL_ATTACHMENT:
        (saved.SLICE_A_BIDIRECTIONAL_ATTACHMENT as TransitionExperienceState) ||
        createInitialTransitionExperienceState(
          'SLICE_A_BIDIRECTIONAL_ATTACHMENT',
          'own_life_practice',
          !hasSaved
        ),
      SLICE_B_LOYALTY_CONFLICT:
        (saved.SLICE_B_LOYALTY_CONFLICT as TransitionExperienceState) ||
        createInitialTransitionExperienceState('SLICE_B_LOYALTY_CONFLICT'),
      SLICE_C_SPECIFIC_FEAR_OR_CONCERN:
        (saved.SLICE_C_SPECIFIC_FEAR_OR_CONCERN as TransitionExperienceState) ||
        createInitialTransitionExperienceState('SLICE_C_SPECIFIC_FEAR_OR_CONCERN'),
      ORDINARY_HAPPY_TRANSITION:
        (saved.ORDINARY_HAPPY_TRANSITION as TransitionExperienceState) ||
        createInitialTransitionExperienceState('ORDINARY_HAPPY_TRANSITION'),
    };
  });

  const [activeSliceId, setActiveSliceId] = useState<TransitionSliceId>(() => {
    const savedActive = getProductExperienceMetrics().activeTransitionSliceId;
    return savedActive || 'SLICE_A_BIDIRECTIONAL_ATTACHMENT';
  });

  const [showOptionalTools, setShowOptionalTools] = useState<boolean>(false);
  const [optionalToolTab, setOptionalToolTab] = useState<'calendar' | 'ritual' | 'missBox'>(
    'calendar'
  );
  const [calendarViewMode, setCalendarViewMode] = useState<'strip' | 'list'>('strip');
  const [newMissText, setNewMissText] = useState<string>('');
  const [showParentCoRead, setShowParentCoRead] = useState<boolean>(false);

  const [isSpeaking, setIsSpeaking] = useState<boolean>(speechNarrator.getSpeaking());
  const [karaoke, setKaraoke] = useState<KaraokeSyncState>(speechNarrator.getKaraokeState());

  const activeCompanion =
    ANIMAL_COMPANIONS[personalization.companionId] || ANIMAL_COMPANIONS.guoguo_squirrel;
  const activeVoiceProfileId =
    COMPANION_TO_VOICE_PROFILE[activeCompanion.id as CompanionVoiceId] || 'playful-buddy';
  const activeVoiceCfg = VOICE_PROFILES[activeVoiceProfileId];

  const currentState =
    sliceStatesById[activeSliceId] ||
    createInitialTransitionExperienceState(activeSliceId);

  useEffect(() => {
    const unsubscribe = speechNarrator.subscribe(() => {
      setIsSpeaking(speechNarrator.getSpeaking());
      setKaraoke(speechNarrator.getKaraokeState());
    });
    return unsubscribe;
  }, []);

  // 打开弹窗时：若有既有进度则恢复之前记录（不覆盖孩子此前选择）；若首次打开则播报中性引导语
  useEffect(() => {
    if (!isOpen) return;
    const metrics = getProductExperienceMetrics();
    const hasSaved = hasPriorSavedBridgeProgress();
    let targetSlice = activeSliceId;
    let targetState = currentState;

    if (hasSaved && metrics.transitionSliceStatesById) {
      const savedStates = metrics.transitionSliceStatesById as Partial<
        Record<TransitionSliceId, TransitionExperienceState>
      >;
      const restoredSliceId = metrics.activeTransitionSliceId || activeSliceId;
      const restoredState = savedStates[restoredSliceId];
      if (restoredState) {
        targetSlice = restoredSliceId;
        targetState = restoredState;
        setActiveSliceId(restoredSliceId);
        setSliceStatesById((prev) => ({
          ...prev,
          ...(savedStates as Record<TransitionSliceId, TransitionExperienceState>),
        }));
      }
      setShowNeutralEntryGate(false);
    } else if (!hasSaved) {
      setShowNeutralEntryGate(true);
    }

    speechNarrator.syncWithCompanion(activeCompanion.id);
    speechNarrator.speak(targetState.currentCompanionSpeech, undefined, undefined, {
      speakerId: activeCompanion.id,
      sceneId: `transition_${targetSlice}`,
      emotionTone: targetState.emotionProsodyTone,
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const speakWithCurrentCompanion = (
    text: string,
    sliceOverride?: TransitionSliceId,
    toneOverride?: TransitionExperienceState['emotionProsodyTone']
  ) => {
    const targetSlice = sliceOverride || activeSliceId;
    const targetTone = toneOverride || currentState.emotionProsodyTone;
    speechNarrator.speak(text, undefined, undefined, {
      speakerId: activeCompanion.id,
      sceneId: `transition_${targetSlice}`,
      emotionTone: targetTone,
    });
  };

  const commitSliceState = (nextState: TransitionExperienceState, speakText?: string) => {
    const targetSlice = nextState.activeSliceId;
    setShowNeutralEntryGate(false);
    setSliceStatesById((prev) => ({
      ...prev,
      [targetSlice]: nextState,
    }));
    if (targetSlice !== activeSliceId) {
      setActiveSliceId(targetSlice);
    }

    const memorySummary = nextState.observedOutcome
      ? `在双向小桥体验了「${SLICE_TABS.find((s) => s.id === targetSlice)?.shortTitle || '换家探索'}」`
      : `正在双向小桥探索「${SLICE_TABS.find((s) => s.id === targetSlice)?.shortTitle || '换家心情'}」`;

    recordTransitionExperienceProgress(nextState, {
      gameId: 'two_homes_bridge',
      scenarioTitle: SLICE_TABS.find((s) => s.id === targetSlice)?.shortTitle || '双向小桥',
      eventStage: nextState.observedOutcome ? 'COMPLETED_OBSERVED' : 'ARRANGED_OR_STARTED',
      childChoiceSummary: memorySummary,
      companionReactionText: nextState.currentCompanionSpeech,
      updatedAt: new Date().toISOString(),
    });

    const lineToSpeak = speakText ?? nextState.currentCompanionSpeech;
    if (lineToSpeak) {
      speakWithCurrentCompanion(lineToSpeak, targetSlice, nextState.emotionProsodyTone);
    }
  };

  const handlePickNeutralEntryChoice = (
    choiceId: (typeof NEUTRAL_ENTRY_CHOICES)[number]['id']
  ) => {
    sounds.playClick();
    setShowNeutralEntryGate(false);

    if (choiceId === 'ordinary_happy') {
      const base =
        sliceStatesById.ORDINARY_HAPPY_TRANSITION ||
        createInitialTransitionExperienceState('ORDINARY_HAPPY_TRANSITION');
      const nextState: TransitionExperienceState = {
        ...base,
        context: 'own_life_practice',
        activeSliceId: 'ORDINARY_HAPPY_TRANSITION',
        feelingSet: ['happy_relaxed_to_go'],
        isAnxietySoothingTriggered: false,
        emotionProsodyTone: 'light-everyday',
        currentCompanionSpeech: TRANSITION_FIXED_VOICE_LINES.ORDINARY_ENTRY,
      };
      commitSliceState(nextState, TRANSITION_FIXED_VOICE_LINES.ORDINARY_ENTRY);
      return;
    }

    if (choiceId === 'dual_attachment') {
      const base =
        sliceStatesById.SLICE_A_BIDIRECTIONAL_ATTACHMENT ||
        createInitialTransitionExperienceState('SLICE_A_BIDIRECTIONAL_ATTACHMENT');
      const nextState: TransitionExperienceState = {
        ...base,
        context: 'own_life_practice',
        activeSliceId: 'SLICE_A_BIDIRECTIONAL_ATTACHMENT',
        feelingSet:
          base.feelingSet.length > 0
            ? base.feelingSet
            : ['miss_current_place', 'look_forward_other_place'],
        relationshipConcern: 'bidirectional_attachment',
        emotionProsodyTone: 'warm-dual-empathy',
        currentCompanionSpeech: TRANSITION_FIXED_VOICE_LINES.SLICE_A_ENTRY,
      };
      commitSliceState(nextState, TRANSITION_FIXED_VOICE_LINES.SLICE_A_ENTRY);
      return;
    }

    if (choiceId === 'loyalty_conflict') {
      const base =
        sliceStatesById.SLICE_B_LOYALTY_CONFLICT ||
        createInitialTransitionExperienceState('SLICE_B_LOYALTY_CONFLICT');
      const nextState: TransitionExperienceState = {
        ...base,
        context: 'own_life_practice',
        activeSliceId: 'SLICE_B_LOYALTY_CONFLICT',
        feelingSet: ['happy_here_worry_other_adult'],
        relationshipConcern: 'worry_other_adult_sad',
        emotionProsodyTone: 'calm-fact-clarity',
        currentCompanionSpeech: TRANSITION_FIXED_VOICE_LINES.SLICE_B_ENTRY,
      };
      commitSliceState(nextState, TRANSITION_FIXED_VOICE_LINES.SLICE_B_ENTRY);
      return;
    }

    if (choiceId === 'specific_concern') {
      const base =
        sliceStatesById.SLICE_C_SPECIFIC_FEAR_OR_CONCERN ||
        createInitialTransitionExperienceState('SLICE_C_SPECIFIC_FEAR_OR_CONCERN');
      const nextState: TransitionExperienceState = {
        ...base,
        context: 'own_life_practice',
        activeSliceId: 'SLICE_C_SPECIFIC_FEAR_OR_CONCERN',
        feelingSet: ['scared_or_uneasy'],
        practicalConcern: 'schedule_uncertainty',
        emotionProsodyTone: 'gentle-inquiry',
        currentCompanionSpeech: TRANSITION_FIXED_VOICE_LINES.SLICE_C_ENTRY,
      };
      commitSliceState(nextState, TRANSITION_FIXED_VOICE_LINES.SLICE_C_ENTRY);
      return;
    }

    if (choiceId === 'story_mode') {
      const nextState: TransitionExperienceState = {
        ...currentState,
        context: 'story_experience',
        emotionProsodyTone: 'light-everyday',
        currentCompanionSpeech: TRANSITION_FIXED_VOICE_LINES.STORY_MODE_ENTRY,
      };
      commitSliceState(nextState, TRANSITION_FIXED_VOICE_LINES.STORY_MODE_ENTRY);
    }
  };

  // 切换伙伴：遵循 V1.1 NarrationSession 规则（朗读中从句首重读，暂停/空闲时不无故自动播报）
  const handleSwitchCompanionInline = (nextCompanionId: CompanionVoiceId) => {
    updatePersonalization({ companionId: nextCompanionId });
    speechNarrator.switchCompanion(nextCompanionId);
  };

  // 切换情境标签（保留各情境独立进度，不串状态 — 满足反例 #9）
  const handleSelectSliceTab = (nextSliceId: TransitionSliceId) => {
    sounds.playClick();
    setShowNeutralEntryGate(false);
    setActiveSliceId(nextSliceId);
    const targetState =
      sliceStatesById[nextSliceId] || createInitialTransitionExperienceState(nextSliceId);
    const speechToPlay =
      targetState.observedOutcome?.companionFeedbackSpeech ||
      (targetState.currentCompanionSpeech === TRANSITION_FIXED_VOICE_LINES.NEUTRAL_FIRST_ENTRY
        ? getSliceEntrySpeech(nextSliceId)
        : targetState.currentCompanionSpeech) ||
      getSliceEntrySpeech(nextSliceId);
    const updatedTarget: TransitionExperienceState = {
      ...targetState,
      currentCompanionSpeech: speechToPlay,
      emotionProsodyTone:
        nextSliceId === 'SLICE_A_BIDIRECTIONAL_ATTACHMENT'
          ? 'warm-dual-empathy'
          : targetState.emotionProsodyTone,
    };
    setSliceStatesById((prev) => ({
      ...prev,
      [nextSliceId]: updatedTarget,
    }));
    recordTransitionExperienceProgress(updatedTarget);
    speakWithCurrentCompanion(speechToPlay, nextSliceId, updatedTarget.emotionProsodyTone);
  };

  const handleToggleContextMode = (mode: TransitionContextMode) => {
    sounds.playClick();
    const updated: TransitionExperienceState = {
      ...currentState,
      context: mode,
    };
    commitSliceState(updated, currentState.currentCompanionSpeech);
  };

  const handleToggleFeeling = (feelingId: TransitionFeelingId) => {
    sounds.playClick();
    const nextState = toggleTransitionFeeling(currentState, feelingId);
    // 若感受组合触发了跨情境路由（例如仅选开心去另一边 -> ORDINARY_HAPPY_TRANSITION），合并到目标 Slice
    if (nextState.activeSliceId !== activeSliceId) {
      const baseTarget =
        sliceStatesById[nextState.activeSliceId] ||
        createInitialTransitionExperienceState(nextState.activeSliceId);
      const mergedTarget: TransitionExperienceState = {
        ...baseTarget,
        feelingSet: nextState.feelingSet,
        interactiveObjects: {
          ...baseTarget.interactiveObjects,
          ...nextState.interactiveObjects,
        },
        isAnxietySoothingTriggered: false,
        currentCompanionSpeech: nextState.currentCompanionSpeech,
      };
      commitSliceState(mergedTarget, mergedTarget.currentCompanionSpeech);
    } else {
      commitSliceState(nextState, nextState.currentCompanionSpeech);
    }
  };

  const availableActions = getAvailableActionsForState(currentState);

  const isScheduleConfigured = tonightAt !== '尚未设置' && daysToNextSwitch !== null;
  const spokenTonightSchedule = isScheduleConfigured
    ? `今晚睡在${tonightAt}。还有${daysToNextSwitch}个晚上换到${tonightAt === '妈妈家' ? '爸爸家' : '妈妈家'}。`
    : '大人还没有设置今晚住哪个地方，需要时可以请大人在家长区填写日程。';

  const PACKING_CANDIDATES = [
    { text: '熟悉的小熊玩偶', emoji: '🧸' },
    { text: '常读的故事绘本', emoji: '📖' },
    { text: '彩色水彩画笔', emoji: '🎨' },
    { text: '自己的小水杯', emoji: '🥛' },
    { text: '睡前小毯子或小夜灯', emoji: '🛌' },
  ];

  const handleSendMiss = () => {
    if (!newMissText.trim()) return;
    sounds.playBell();
    addMissNote(newMissText.trim());
    setNewMissText('');
  };

  const activeSubtitleText =
    isSpeaking && karaoke.fullText
      ? karaoke.fullText
      : currentState.currentCompanionSpeech;

  return (
    <div
      data-testid="two-homes-bridge-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/55 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto"
    >
      <div className="bg-amber-50/95 border-2 border-amber-200 rounded-3xl p-3 sm:p-6 max-w-3xl w-full shadow-2xl relative my-auto transition-all duration-200 text-stone-800 max-h-[94dvh] overflow-y-auto space-y-3.5">
        {/* 关闭按钮 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 text-stone-500 hover:text-stone-800 p-2 rounded-full hover:bg-amber-100 transition-colors z-20 cursor-pointer min-w-[48px] min-h-[48px] flex items-center justify-center"
          aria-label="离开双向桥小驿"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 顶部标题与伙伴同步伴读条（390px 首屏紧凑设计） */}
        <div className="flex items-start gap-2.5 pr-12">
          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center p-1 shadow-inner shrink-0 border-2 border-teal-200">
            <LocationBadgeIllustration type="bridge" className="w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-lg sm:text-2xl font-black text-stone-800">
                双向桥小驿 · 换家心意探索
              </h3>
              <button
                type="button"
                data-testid="transition-speak-entry-btn"
                onClick={() =>
                  speakWithCurrentCompanion(TRANSITION_FIXED_VOICE_LINES.ENTRY_GREETING)
                }
                className="px-2.5 py-1 rounded-xl bg-teal-100 hover:bg-teal-200 text-teal-900 text-xs font-black min-h-[36px] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                aria-label="听一听双向桥小驿介绍"
              >
                <Volume2 className="w-4 h-4" />
                <span>听引导</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 font-medium mt-0.5">
              换地方住不一定都会害怕：可以同时想念两边、分清事实与猜测、调查具体担忧，也可以轻松过桥。
            </p>
          </div>
        </div>

        {/* 四伙伴全域声音与字幕同步栏 (Section 6) */}
        <div
          data-testid="transition-companion-bar"
          data-companion-id={activeCompanion.id}
          data-voice-profile={activeVoiceProfileId}
          className={`p-2.5 sm:p-3 rounded-2xl border-2 bg-white/95 shadow-2xs space-y-2 ${activeCompanion.themeColorBorder}`}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${activeCompanion.themeColorBg} ${activeCompanion.themeColorBorder}`}
              >
                <CompanionAvatarSvg companionId={activeCompanion.id} className="w-8 h-8" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    data-testid="transition-companion-name"
                    className="text-xs sm:text-sm font-black text-stone-900"
                  >
                    {activeCompanion.name}陪你过桥
                  </span>
                  <span
                    data-testid="transition-voice-badge"
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300"
                  >
                    {activeVoiceCfg.companionName} · {activeVoiceCfg.neuralVoiceId}
                  </span>
                </div>
              </div>
            </div>

            {/* 场景内一键切换四伙伴（用于验证朗读中切换角色时头像、语音、字幕同步更新） */}
            <div className="flex items-center gap-1 flex-wrap" aria-label="切换陪伴角色">
              {COMPANION_ORDER.map((compId) => {
                const comp = ANIMAL_COMPANIONS[compId];
                const isSelected = compId === activeCompanion.id;
                return (
                  <button
                    key={compId}
                    type="button"
                    data-testid={`transition-companion-switch-${compId}`}
                    onClick={() => handleSwitchCompanionInline(compId)}
                    className={`min-h-[36px] px-2.5 py-1 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-700 text-white border-teal-800 shadow-2xs'
                        : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    {comp.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 实时同步字幕栏 */}
          <div
            data-testid="transition-companion-subtitle"
            className="px-3 py-2 rounded-xl bg-amber-50/90 border border-amber-200/80 text-xs sm:text-sm font-bold text-stone-800 leading-snug flex items-center justify-between gap-2"
          >
            <span className="flex-1">{activeSubtitleText}</span>
            <button
              type="button"
              data-testid="transition-replay-current-speech"
              onClick={() => speakWithCurrentCompanion(currentState.currentCompanionSpeech)}
              className="min-w-[36px] min-h-[36px] px-2 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black shrink-0 flex items-center gap-1 cursor-pointer"
              aria-label="重听当前伙伴语音"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>重听</span>
            </button>
          </div>
        </div>

        {/* V1.1 Section IV: 双向小桥中性首次入口（进入时不直接默认“同时舍不得这边并期待那边”） */}
        {showNeutralEntryGate ? (
          <div
            data-testid="bridge-neutral-entry-gate"
            className="bg-linear-to-r from-teal-50/95 via-white to-amber-50/95 p-3 sm:p-4 rounded-2xl border-2 border-teal-300 shadow-xs space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <span className="text-xs sm:text-sm font-black text-teal-950">
                  🌈 今天来到双向小桥，你想从哪里开始？（不预设任何感受）
                </span>
                <p className="text-[11px] sm:text-xs text-stone-600 font-medium mt-0.5">
                  你可以轻松过桥、聊聊不舍、分清大人感受、看看具体担心，或者先听一个小朋友的故事。
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {NEUTRAL_ENTRY_CHOICES.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  data-testid={choice.testId}
                  onClick={() => handlePickNeutralEntryChoice(choice.id)}
                  className="min-h-[56px] p-2.5 rounded-xl border-2 border-teal-200 bg-white hover:bg-teal-50 hover:border-teal-500 text-left transition-all cursor-pointer flex flex-col justify-between shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs sm:text-sm font-black text-stone-900">
                      {choice.title}
                    </span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-900 shrink-0">
                      {choice.badge}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-600 font-medium leading-tight mt-1">
                    {choice.subtitle}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div
            data-testid="bridge-restored-progress-banner"
            className="px-3 py-2 rounded-xl bg-teal-50/80 border border-teal-200 flex items-center justify-between gap-2 flex-wrap text-xs"
          >
            <span className="font-bold text-teal-950">
              ✨ 已为你保留当前探索状态：{SLICE_TABS.find((t) => t.id === activeSliceId)?.shortTitle}
              {currentState.context === 'story_experience' ? '（故事体验模式）' : ''}
            </span>
            <button
              type="button"
              data-testid="bridge-reopen-neutral-entry-btn"
              onClick={() => {
                sounds.playClick();
                setShowNeutralEntryGate(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-teal-100 text-teal-900 border border-teal-300 font-black text-[11px] cursor-pointer min-h-[32px]"
            >
              切换首次入口选项
            </button>
          </div>
        )}

        {/* Step 1: 多维感受共存选择条（支持同时选多个，绝不强制单选 — 反例 #1 & #2） */}
        <div
          data-testid="transition-feeling-bar"
          className="bg-white/95 p-2.5 sm:p-3.5 rounded-2xl border border-stone-200 shadow-2xs space-y-2"
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-black text-stone-800">
              ① 现在有什么感觉？（可多选共存，也可以不选）
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                data-testid="transition-context-own_life_practice"
                onClick={() => handleToggleContextMode('own_life_practice')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                  currentState.context === 'own_life_practice'
                    ? 'bg-sky-700 text-white border-sky-800'
                    : 'bg-stone-100 text-stone-600 border-stone-200'
                }`}
              >
                我的生活练习
              </button>
              <button
                type="button"
                data-testid="transition-context-story_experience"
                onClick={() => handleToggleContextMode('story_experience')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                  currentState.context === 'story_experience'
                    ? 'bg-sky-700 text-white border-sky-800'
                    : 'bg-stone-100 text-stone-600 border-stone-200'
                }`}
              >
                小动物故事体验
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {TRANSITION_FEELING_OPTIONS.map((opt) => {
              const active = currentState.feelingSet.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  data-testid={`feeling-chip-${opt.id}`}
                  aria-pressed={active}
                  onClick={() => handleToggleFeeling(opt.id)}
                  className={`min-h-[40px] px-2.5 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-1 ${
                    active
                      ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-amber-300'
                  }`}
                >
                  <span>{active ? '✓' : '+'}</span>
                  <span>{opt.shortTag}</span>
                </button>
              );
            })}
          </div>

          {currentState.feelingSet.includes('miss_current_place') &&
            currentState.feelingSet.includes('look_forward_other_place') && (
              <div
                data-testid="dual-feelings-coexist-badge"
                className="px-2.5 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 text-xs font-bold"
              >
                🌟 已同时保留「不舍得这边」与「也期待那边」两种感受，不需要二选一！
              </div>
            )}
        </div>

        {/* 情境分支切换栏 (3 个完整 Vertical Slices + 轻松日常过桥) */}
        <div
          role="tablist"
          aria-label="换家情境体验分支"
          className="grid grid-cols-2 sm:grid-cols-4 gap-1.5"
        >
          {SLICE_TABS.map((item) => {
            const isSelected = activeSliceId === item.id;
            const sliceState = sliceStatesById[item.id];
            const hasDone = Boolean(sliceState?.observedOutcome);
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                data-testid={`transition-slice-tab-${item.id}`}
                onClick={() => handleSelectSliceTab(item.id)}
                className={`min-h-[52px] p-2 rounded-2xl border-2 text-left cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-teal-100 text-teal-950 border-teal-600 shadow-xs'
                    : 'bg-white text-stone-800 border-stone-200 hover:border-teal-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs sm:text-sm font-black">{item.shortTitle}</span>
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-teal-700 text-white'
                        : hasDone
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {hasDone ? '已体验' : item.badge}
                  </span>
                </div>
                <span
                  className={`text-[11px] leading-tight line-clamp-1 ${
                    isSelected ? 'text-teal-900 font-bold' : 'text-stone-500'
                  }`}
                >
                  {item.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* ================= 核心交互舞台：可触控 SVG 场景与道具 (Section 4 & Section 7) ================= */}
        <div
          data-testid="transition-interactive-svg-stage"
          className="bg-white rounded-3xl border-2 border-teal-200 shadow-sm overflow-hidden p-3 sm:p-4 space-y-3"
        >
          {/* SVG 视觉画布：桥、左岸住处、右岸住处、双星、小背包、分界镜、路标与安全护盾 */}
          <div className="relative rounded-2xl overflow-hidden bg-linear-to-b from-sky-100 via-teal-50 to-amber-50 border border-teal-200/80">
            <svg
              viewBox="0 0 680 230"
              className="w-full h-44 sm:h-52 block select-none"
              role="img"
              aria-label="双向桥与两个生活地点互动场景"
            >
              {/* 远山与云朵 */}
              <path
                d="M0 170 Q120 115 250 165 T520 155 T680 170 L680 230 L0 230 Z"
                fill="#D1FAE5"
                opacity="0.7"
              />
              {/* 溪流 */}
              <path
                d="M210 175 Q340 160 470 175 L510 230 L170 230 Z"
                fill="#7DD3FC"
                opacity="0.75"
              />

              {/* 左岸生活地点（现在住的地方） */}
              <g
                onClick={() => {
                  if (activeSliceId === 'SLICE_A_BIDIRECTIONAL_ATTACHMENT') {
                    commitSliceState(
                      interactWithSliceAObject(currentState, { type: 'TOGGLE_WEST_STAR' })
                    );
                  }
                }}
                className="cursor-pointer"
              >
                <rect x="28" y="96" width="112" height="76" rx="12" fill="#FEF3C7" stroke="#D97706" strokeWidth="3" />
                <polygon points="18,98 84,52 150,98" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
                <rect x="68" y="128" width="32" height="44" rx="6" fill="#B45309" />
                <text x="84" y="118" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#78350F">
                  这边住处
                </text>
              </g>

              {/* 右岸生活地点（另一边住处） */}
              <g
                onClick={() => {
                  if (activeSliceId === 'SLICE_A_BIDIRECTIONAL_ATTACHMENT') {
                    commitSliceState(
                      interactWithSliceAObject(currentState, { type: 'TOGGLE_EAST_STAR' })
                    );
                  }
                }}
                className="cursor-pointer"
              >
                <rect
                  x="540"
                  y="96"
                  width="112"
                  height="76"
                  rx="12"
                  fill={
                    currentState.interactiveObjects.placeAttitude ===
                    'dislike_or_unadapted_to_one_place'
                      ? '#E2E8F0'
                      : '#E0F2FE'
                  }
                  stroke="#0284C7"
                  strokeWidth="3"
                />
                <polygon points="530,98 596,52 662,98" fill="#38BDF8" stroke="#0369A1" strokeWidth="3" />
                <rect
                  x="580"
                  y="128"
                  width="32"
                  height="44"
                  rx="6"
                  fill={
                    currentState.interactiveObjects.tappedNightlight ? '#FDE047' : '#0369A1'
                  }
                />
                <text x="596" y="118" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0C4A6E">
                  另一边住处
                </text>
              </g>

              {/* 中央木拱桥 */}
              <path
                d="M150 172 Q340 96 530 172"
                fill="none"
                stroke="#92400E"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M162 152 Q340 80 518 152"
                fill="none"
                stroke="#D97706"
                strokeWidth="5"
                strokeDasharray="10 6"
              />

              {/* 桥面慢步石 */}
              <circle
                cx="265"
                cy="142"
                r="11"
                fill={
                  currentState.interactiveObjects.bridgePaceMode === 'slow_pause'
                    ? '#FBBF24'
                    : '#FDE68A'
                }
                stroke="#92400E"
                strokeWidth="2"
              />
              <circle
                cx="340"
                cy="132"
                r="12"
                fill={
                  currentState.interactiveObjects.bridgePaceMode
                    ? '#34D399'
                    : '#FDE68A'
                }
                stroke="#065F46"
                strokeWidth="2"
              />
              <circle
                cx="415"
                cy="142"
                r="11"
                fill={
                  currentState.interactiveObjects.bridgePaceMode === 'steady_walk'
                    ? '#38BDF8'
                    : '#FDE68A'
                }
                stroke="#92400E"
                strokeWidth="2"
              />

              {/* 左岸想念星 (Slice A) */}
              <g
                onClick={() =>
                  commitSliceState(
                    interactWithSliceAObject(currentState, { type: 'TOGGLE_WEST_STAR' })
                  )
                }
                className="cursor-pointer"
              >
                <rect
                  x="181"
                  y="35"
                  width="88"
                  height="36"
                  rx="18"
                  fill={currentState.interactiveObjects.westStarLit ? '#FDE047' : '#FFFFFF'}
                  stroke="#D97706"
                  strokeWidth="3"
                />
                <text x="225" y="58" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#78350F">
                  {currentState.interactiveObjects.westStarLit ? '★ 念这边' : '☆ 念这边'}
                </text>
              </g>

              {/* 右岸期待星 (Slice A) */}
              <g
                onClick={() =>
                  commitSliceState(
                    interactWithSliceAObject(currentState, { type: 'TOGGLE_EAST_STAR' })
                  )
                }
                className="cursor-pointer"
              >
                <rect
                  x="411"
                  y="35"
                  width="88"
                  height="36"
                  rx="18"
                  fill={currentState.interactiveObjects.eastStarLit ? '#7DD3FC' : '#FFFFFF'}
                  stroke="#0284C7"
                  strokeWidth="3"
                />
                <text x="455" y="58" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0C4A6E">
                  {currentState.interactiveObjects.eastStarLit ? '★ 盼那边' : '☆ 盼那边'}
                </text>
              </g>

              {/* 双星同时亮起连线 */}
              {currentState.interactiveObjects.westStarLit &&
                currentState.interactiveObjects.eastStarLit && (
                  <g>
                    <line
                      x1="249"
                      y1="54"
                      x2="431"
                      y2="54"
                      stroke="#F59E0B"
                      strokeWidth="3"
                      strokeDasharray="6 4"
                    />
                    <rect
                      x="282"
                      y="36"
                      width="116"
                      height="26"
                      rx="13"
                      fill="#FEF3C7"
                      stroke="#F59E0B"
                      strokeWidth="2"
                    />
                    <text
                      x="340"
                      y="53"
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill="#92400E"
                    >
                      双星同亮·免二选一
                    </text>
                  </g>
                )}

              {/* Slice B 责任小围栏或分界镜指示 */}
              {activeSliceId === 'SLICE_B_LOYALTY_CONFLICT' && (
                <g>
                  <rect
                    x="250"
                    y="72"
                    width="180"
                    height="36"
                    rx="10"
                    fill={
                      currentState.interactiveObjects.responsibilityFenceRaised
                        ? '#DCFCE7'
                        : '#FEF9C3'
                    }
                    stroke="#0D9488"
                    strokeWidth="2.5"
                  />
                  <text
                    x="340"
                    y="95"
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill="#134E4A"
                  >
                    {currentState.interactiveObjects.responsibilityFenceRaised
                      ? '🛡️ 责任围栏已立：大人的事归大人'
                      : '🔍 分界镜：区分已知事实 vs 心里猜测'}
                  </text>
                </g>
              )}

              {/* Slice C 安全护盾或原因调查路标 */}
              {activeSliceId === 'SLICE_C_SPECIFIC_FEAR_OR_CONCERN' && (
                <g>
                  <rect
                    x="220"
                    y="70"
                    width="240"
                    height="38"
                    rx="12"
                    fill={
                      currentState.safetyConcern === 'specific_person_or_harm_behavior'
                        ? '#FFE4E6'
                        : '#E0F2FE'
                    }
                    stroke={
                      currentState.safetyConcern === 'specific_person_or_harm_behavior'
                        ? '#E11D48'
                        : '#0284C7'
                    }
                    strokeWidth="2.5"
                  />
                  <text
                    x="340"
                    y="94"
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill={
                      currentState.safetyConcern === 'specific_person_or_harm_behavior'
                        ? '#881337'
                        : '#0C4A6E'
                    }
                  >
                    {currentState.safetyConcern === 'specific_person_or_harm_behavior'
                      ? '🛡️ 安全保护护盾开启：停用普通换家仪式'
                      : '🧭 先点下方路标查清具体原因（或暂不回答）'}
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* ================= SLICE A 专属触控交互区：双向不舍 ================= */}
          {activeSliceId === 'SLICE_A_BIDIRECTIONAL_ATTACHMENT' && (
            <div data-testid="slice-a-interactive-panel" className="space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-1.5">
                <span className="text-xs sm:text-sm font-black text-teal-950">
                  ② 点点星星、桥面和小背包，试试同时安放两边的想念：
                </span>
                <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  不需要二选一 · 允许不抱抱不写信
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  data-testid="slice-a-west-star"
                  aria-pressed={currentState.interactiveObjects.westStarLit}
                  onClick={() => {
                    sounds.playClick();
                    commitSliceState(
                      interactWithSliceAObject(currentState, { type: 'TOGGLE_WEST_STAR' })
                    );
                  }}
                  className={`min-h-[48px] p-2.5 rounded-2xl border-2 text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    currentState.interactiveObjects.westStarLit
                      ? 'bg-amber-400 text-stone-950 border-amber-600 shadow-xs'
                      : 'bg-amber-50/70 text-stone-700 border-amber-200 hover:border-amber-400'
                  }`}
                >
                  <Star className="w-4 h-4 shrink-0" />
                  <span>点亮左岸想念星</span>
                </button>

                <button
                  type="button"
                  data-testid="slice-a-east-star"
                  aria-pressed={currentState.interactiveObjects.eastStarLit}
                  onClick={() => {
                    sounds.playClick();
                    commitSliceState(
                      interactWithSliceAObject(currentState, { type: 'TOGGLE_EAST_STAR' })
                    );
                  }}
                  className={`min-h-[48px] p-2.5 rounded-2xl border-2 text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    currentState.interactiveObjects.eastStarLit
                      ? 'bg-sky-400 text-stone-950 border-sky-600 shadow-xs'
                      : 'bg-sky-50/70 text-stone-700 border-sky-200 hover:border-sky-400'
                  }`}
                >
                  <Star className="w-4 h-4 shrink-0" />
                  <span>点亮右岸期待星</span>
                </button>

                <button
                  type="button"
                  data-testid="slice-a-light-both-stars"
                  onClick={() => {
                    sounds.playClick();
                    commitSliceState(
                      interactWithSliceAObject(currentState, { type: 'LIGHT_BOTH_STARS' })
                    );
                  }}
                  className="col-span-2 sm:col-span-1 min-h-[48px] p-2.5 rounded-2xl border-2 bg-teal-50 hover:bg-teal-100 text-teal-950 border-teal-300 text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>两颗星同时亮起</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  data-testid="slice-a-stepping-stones"
                  onClick={() => {
                    sounds.playClick();
                    commitSliceState(
                      interactWithSliceAObject(currentState, {
                        type: 'SET_BRIDGE_PACE',
                        pace:
                          currentState.interactiveObjects.bridgePaceMode === 'slow_pause'
                            ? 'steady_walk'
                            : 'slow_pause',
                      })
                    );
                  }}
                  className={`min-h-[44px] px-2.5 py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                    currentState.interactiveObjects.bridgePaceMode
                      ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
                      : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  🪨 踩慢步石过桥
                </button>

                <button
                  type="button"
                  data-testid="slice-a-backpack"
                  onClick={() => {
                    sounds.playClick();
                    commitSliceState(
                      interactWithSliceAObject(currentState, {
                        type: 'SET_BACKPACK_MODE',
                        mode:
                          currentState.interactiveObjects.backpackMode === 'empty_light_pack'
                            ? 'dual_star_badge'
                            : 'empty_light_pack',
                      })
                    );
                  }}
                  className={`min-h-[44px] px-2.5 py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                    currentState.interactiveObjects.backpackMode
                      ? 'bg-amber-100 text-amber-950 border-amber-400'
                      : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  🎒 切换轻装/双星包
                </button>

                <button
                  type="button"
                  data-testid="slice-a-decline-hug-toggle"
                  aria-pressed={currentState.interactiveObjects.declineHug}
                  onClick={() => {
                    sounds.playClick();
                    commitSliceState(
                      interactWithSliceAObject(currentState, {
                        type: 'SET_DECLINE_HUG_OR_LETTER',
                        declineHug: !currentState.interactiveObjects.declineHug,
                      }),
                      TRANSITION_FIXED_VOICE_LINES.SLICE_A_OUTCOME_NO_HUG_NO_LETTER
                    );
                  }}
                  className={`min-h-[44px] px-2.5 py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                    currentState.interactiveObjects.declineHug
                      ? 'bg-rose-100 text-rose-950 border-rose-400'
                      : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  {currentState.interactiveObjects.declineHug ? '✓ 已选不抱抱' : '✋ 今天不想抱抱'}
                </button>

                <button
                  type="button"
                  data-testid="slice-a-decline-letter-toggle"
                  aria-pressed={currentState.interactiveObjects.declineLetter}
                  onClick={() => {
                    sounds.playClick();
                    commitSliceState(
                      interactWithSliceAObject(currentState, {
                        type: 'SET_DECLINE_HUG_OR_LETTER',
                        declineLetter: !currentState.interactiveObjects.declineLetter,
                      }),
                      TRANSITION_FIXED_VOICE_LINES.SLICE_A_OUTCOME_NO_HUG_NO_LETTER
                    );
                  }}
                  className={`min-h-[44px] px-2.5 py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                    currentState.interactiveObjects.declineLetter
                      ? 'bg-rose-100 text-rose-950 border-rose-400'
                      : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  {currentState.interactiveObjects.declineLetter ? '✓ 已选不写信' : '✋ 今天不想写信'}
                </button>
              </div>
            </div>
          )}

          {/* ================= SLICE B 专属触控交互区：忠诚冲突 ================= */}
          {activeSliceId === 'SLICE_B_LOYALTY_CONFLICT' && (
            <div data-testid="slice-b-interactive-panel" className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-1.5">
                <span className="text-xs sm:text-sm font-black text-teal-950">
                  ② 用分界镜把「真实经历」和「对大人心情的猜测」分开：
                </span>
                <span className="text-[11px] font-bold text-indigo-900 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  大人的情绪不由小孩负责
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 泡泡 1：真实经历 */}
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="text-xs font-black text-emerald-950">
                    🧩 想法一：“我今天在这边搭积木、玩拼图笑了”
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      data-testid="slice-b-classify-fact"
                      onClick={() => {
                        sounds.playClick();
                        commitSliceState(
                          interactWithSliceBObject(currentState, {
                            type: 'CLASSIFY_BUBBLE',
                            bubbleId: 'fact_happy_here',
                            targetBucket: 'known_fact',
                          })
                        );
                      }}
                      className={`min-h-[42px] px-3 py-1.5 rounded-xl text-xs font-black border cursor-pointer ${
                        currentState.interactiveObjects.classifiedFactBubble === 'known_fact'
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                      }`}
                    >
                      ✓ 放进【已知事实盘】
                    </button>
                  </div>
                </div>

                {/* 泡泡 2：对大人感受的猜测 (反例 #3) */}
                <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
                  <div className="text-xs font-black text-amber-950">
                    💭 想法二：“另一边的大人现在一定在家里伤心、怪我不乖”
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      data-testid="slice-b-classify-guess"
                      onClick={() => {
                        sounds.playClick();
                        commitSliceState(
                          interactWithSliceBObject(currentState, {
                            type: 'CLASSIFY_BUBBLE',
                            bubbleId: 'guess_other_adult_sad',
                            targetBucket: 'guess_about_adult_or_future',
                          })
                        );
                      }}
                      className={`min-h-[42px] px-3 py-1.5 rounded-xl text-xs font-black border cursor-pointer ${
                        currentState.interactiveObjects.classifiedGuessBubble ===
                        'guess_about_adult_or_future'
                          ? 'bg-amber-600 text-white border-amber-700'
                          : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      ☁️ 放进【未证实的猜测云】
                    </button>

                    <button
                      type="button"
                      data-testid="slice-b-try-claim-guess-as-fact"
                      onClick={() => {
                        sounds.playClick();
                        commitSliceState(
                          interactWithSliceBObject(currentState, {
                            type: 'CLASSIFY_BUBBLE',
                            bubbleId: 'guess_other_adult_sad',
                            targetBucket: 'known_fact',
                          })
                        );
                      }}
                      className="min-h-[42px] px-2.5 py-1.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 cursor-pointer"
                    >
                      能当成确定事实吗？
                    </button>
                  </div>
                </div>
              </div>

              {currentState.interactiveObjects.guessDirectlyClaimedAsFactBlocked && (
                <div
                  data-testid="slice-b-guess-not-fact-guard"
                  className="p-2.5 rounded-xl bg-amber-100 border border-amber-400 text-xs font-bold text-amber-950"
                >
                  🔍 侦探分界提示：另一边的大人现在是不是难过，只是我们心里的担心和猜测，绝对不能直接当成已经确定的事实哦！已帮你归入【未证实的猜测云】。
                </div>
              )}

              {/* 责任小围栏 + 对两个地方的真实喜好（允许不喜欢其中一个地方 — 反例 #4） */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  data-testid="slice-b-raise-fence"
                  onClick={() => {
                    sounds.playClick();
                    commitSliceState(
                      interactWithSliceBObject(currentState, {
                        type: 'RAISE_RESPONSIBILITY_FENCE',
                      })
                    );
                  }}
                  className={`min-h-[46px] p-2.5 rounded-xl border text-xs font-black cursor-pointer ${
                    currentState.interactiveObjects.responsibilityFenceRaised
                      ? 'bg-teal-700 text-white border-teal-800'
                      : 'bg-teal-50 text-teal-950 border-teal-300 hover:bg-teal-100'
                  }`}
                >
                  🛡️ 立起责任围栏（不当传话筒）
                </button>

                <button
                  type="button"
                  data-testid="slice-b-attitude-like-both"
                  onClick={() => {
                    sounds.playClick();
                    commitSliceState(
                      interactWithSliceBObject(currentState, {
                        type: 'SET_PLACE_ATTITUDE',
                        attitude: 'like_both_places',
                      })
                    );
                  }}
                  className={`min-h-[46px] p-2.5 rounded-xl border text-xs font-black cursor-pointer ${
                    currentState.interactiveObjects.placeAttitude === 'like_both_places'
                      ? 'bg-sky-700 text-white border-sky-800'
                      : 'bg-sky-50 text-sky-950 border-sky-200 hover:bg-sky-100'
                  }`}
                >
                  💛 我同时喜欢两个地方
                </button>

                <button
                  type="button"
                  data-testid="slice-b-attitude-dislike-one"
                  onClick={() => {
                    sounds.playClick();
                    commitSliceState(
                      interactWithSliceBObject(currentState, {
                        type: 'SET_PLACE_ATTITUDE',
                        attitude: 'dislike_or_unadapted_to_one_place',
                      })
                    );
                  }}
                  className={`min-h-[46px] p-2.5 rounded-xl border text-xs font-black cursor-pointer ${
                    currentState.interactiveObjects.placeAttitude ===
                    'dislike_or_unadapted_to_one_place'
                      ? 'bg-stone-800 text-white border-stone-900'
                      : 'bg-stone-100 text-stone-800 border-stone-300 hover:bg-stone-200'
                  }`}
                >
                  💬 我对其中一个地方不太喜欢/不习惯
                </button>
              </div>

              {currentState.interactiveObjects.placeAttitude ===
                'dislike_or_unadapted_to_one_place' && (
                <div
                  data-testid="slice-b-honest-dislike-accepted"
                  className="p-2.5 rounded-xl bg-stone-100 border border-stone-300 text-xs font-bold text-stone-800"
                >
                  ✓ 真实感受被接纳：对其中一个地方不太喜欢或还不习惯，是很真实的感受。没有人规定你必须说“两个地方一样好”。
                </div>
              )}
            </div>
          )}

          {/* ================= SLICE C 专属触控交互区：具体害怕与担忧 ================= */}
          {activeSliceId === 'SLICE_C_SPECIFIC_FEAR_OR_CONCERN' && (
            <div data-testid="slice-c-interactive-panel" className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-1.5">
                <span className="text-xs sm:text-sm font-black text-teal-950">
                  ② 先点路标调查具体原因（也可以选“暂时说不清楚”）：
                </span>
                <span className="text-[11px] font-bold text-sky-900 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                  先查原因，再选办法
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.keys(SPECIFIC_FEAR_REASONS) as SpecificFearReasonId[]).map((reasonKey) => {
                  const meta = SPECIFIC_FEAR_REASONS[reasonKey];
                  const isSelected =
                    currentState.interactiveObjects.investigatedFearReason === reasonKey;
                  const isSafetyReason =
                    reasonKey === 'reason_specific_person_or_behavior';

                  return (
                    <button
                      key={reasonKey}
                      type="button"
                      data-testid={`slice-c-reason-${reasonKey}`}
                      aria-pressed={isSelected}
                      onClick={() => {
                        sounds.playClick();
                        commitSliceState(investigateSliceCFearReason(currentState, reasonKey));
                      }}
                      className={`min-h-[54px] p-2.5 rounded-2xl border-2 text-left cursor-pointer flex flex-col justify-center ${
                        isSelected
                          ? isSafetyReason
                            ? 'bg-rose-100 text-rose-950 border-rose-600 shadow-xs'
                            : 'bg-sky-100 text-sky-950 border-sky-600 shadow-xs'
                          : isSafetyReason
                            ? 'bg-rose-50/90 text-rose-950 border-rose-300 hover:border-rose-500'
                            : 'bg-stone-50 text-stone-800 border-stone-200 hover:border-sky-300'
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-black flex items-center justify-between gap-1">
                        <span>{meta.title}</span>
                        {isSelected && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-white/90 font-black">
                            ✓ 已选
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-[11px] mt-0.5 leading-snug font-medium ${
                          isSelected
                            ? isSafetyReason
                              ? 'text-rose-900'
                              : 'text-sky-900'
                            : 'text-stone-600'
                        }`}
                      >
                        {meta.childPrompt}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 反例 #7：当涉及具体伤害时，展示醒目安全护盾并明确禁用普通换家安抚仪式 */}
              {currentState.safetyConcern === 'specific_person_or_harm_behavior' && (
                <div
                  data-testid="slice-c-safety-shield-banner"
                  className="p-3.5 rounded-2xl bg-rose-100 border-2 border-rose-400 text-rose-950 space-y-1.5"
                >
                  <div className="flex items-center gap-2 font-black text-xs sm:text-sm">
                    <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0" />
                    <span>安全保护优先：已停用普通换家书包、放松与拥抱仪式</span>
                  </div>
                  <p
                    data-testid="slice-c-ordinary-rituals-blocked"
                    className="text-xs font-bold leading-relaxed"
                  >
                    当涉及具体的人凶你、打人或伤害行为时，绝不能靠装玩偶、深呼吸或勉强拥抱来解决。请立即选择下方的现实安全求助行动！
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ================= ORDINARY 轻松日常过桥交互区 (反例 #2) ================= */}
          {activeSliceId === 'ORDINARY_HAPPY_TRANSITION' && (
            <div data-testid="ordinary-happy-interactive-panel" className="space-y-2.5">
              <div
                data-testid="ordinary-no-anxiety-soothing"
                className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm font-bold text-emerald-950"
              >
                ☀️ 今天去另一边心情轻松愉快！系统不会启动焦虑安抚或担心测试，直接带好日常爱玩的小物品出发吧。
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  data-testid="ordinary-item-sketchbook"
                  onClick={() => {
                    sounds.playClick();
                    commitSliceState({
                      ...currentState,
                      interactiveObjects: {
                        ...currentState.interactiveObjects,
                        everydayItemPicked: 'sketchbook',
                      },
                    });
                  }}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-black cursor-pointer ${
                    currentState.interactiveObjects.everydayItemPicked === 'sketchbook'
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-white text-stone-800 border-stone-200'
                  }`}
                >
                  🎨 带上日常画画本
                </button>
                <button
                  type="button"
                  data-testid="ordinary-item-soccer_ball"
                  onClick={() => {
                    sounds.playClick();
                    commitSliceState({
                      ...currentState,
                      interactiveObjects: {
                        ...currentState.interactiveObjects,
                        everydayItemPicked: 'soccer_ball',
                      },
                    });
                  }}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-black cursor-pointer ${
                    currentState.interactiveObjects.everydayItemPicked === 'soccer_ball'
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-white text-stone-800 border-stone-200'
                  }`}
                >
                  ⚽ 带上日常小足球
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= 已知事实、愿望与可尝试行动面板 (Section 5: 六步引导链路) ================= */}
        <div
          data-testid="transition-actions-panel"
          className="bg-white/95 rounded-3xl border-2 border-amber-200 p-3.5 sm:p-4 space-y-3 shadow-2xs"
        >
          {/* ③ 哪些是已经知道的 & ④ 你希望发生什么 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div
              data-testid="transition-known-facts-box"
              className="p-2.5 rounded-2xl bg-sky-50/80 border border-sky-200 space-y-1"
            >
              <span className="font-black text-sky-950 block">③ 哪些是已经知道的事实：</span>
              {currentState.thoughtSet.map((t) => (
                <p key={t.id} className="text-stone-700 font-medium leading-snug">
                  • [{t.category === 'known_fact' ? '已知事实' : t.category === 'guess_about_adult_or_future' ? '未证实猜测' : '真实想法'}] {t.text}
                </p>
              ))}
            </div>

            <div
              data-testid="transition-wish-goal-box"
              className="p-2.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1"
            >
              <span className="font-black text-amber-950 block">④ 你希望发生什么：</span>
              <p className="text-stone-700 font-medium leading-snug">
                {currentState.wishGoal ||
                  (activeSliceId === 'SLICE_A_BIDIRECTIONAL_ATTACHMENT'
                    ? '希望同时留住对两边的想念，按自己舒服的方式过桥。'
                    : activeSliceId === 'SLICE_B_LOYALTY_CONFLICT'
                      ? '希望安心玩耍、诚实表达感受，不当大人的传话筒。'
                      : activeSliceId === 'ORDINARY_HAPPY_TRANSITION'
                        ? '希望轻轻松松走过小桥，开启平常的一天。'
                        : '希望先弄清让自己担心的原因，或先安静休息。')}
              </p>
            </div>
          </div>

          {/* ⑤ 可以尝试什么（自主选择行动） */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-stone-800">
                ⑤ 你可以尝试什么行动？（点选一个试试看）：
              </span>
              <button
                type="button"
                data-testid="transition-pause-btn"
                onClick={() => {
                  sounds.playClick();
                  commitSliceState(pauseTransitionExperienceVoluntarily(currentState));
                }}
                className="min-h-[38px] px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 text-xs font-black flex items-center gap-1 cursor-pointer"
              >
                <PauseCircle className="w-4 h-4" />
                <span>先停下休息/暂不选</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {availableActions.map((act) => {
                const isChosen = currentState.chosenAction === act.id;
                return (
                  <button
                    key={act.id}
                    type="button"
                    data-testid={`transition-action-${act.id}`}
                    aria-pressed={isChosen}
                    onClick={() => {
                      sounds.playClick();
                      commitSliceState(executeTransitionAction(currentState, act.id));
                    }}
                    className={`min-h-[54px] p-3 rounded-2xl border-2 text-left cursor-pointer flex items-center justify-between gap-2 ${
                      isChosen
                        ? act.isSafetyAction
                          ? 'bg-rose-100 text-rose-950 border-rose-600 shadow-xs'
                          : 'bg-teal-100 text-teal-950 border-teal-600 shadow-xs'
                        : act.isSafetyAction
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-950 border-rose-300'
                          : 'bg-stone-50 hover:bg-amber-50/70 text-stone-800 border-stone-200'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs sm:text-sm font-black">{act.label}</div>
                      <div
                        className={`text-[11px] leading-snug font-medium ${
                          isChosen
                            ? act.isSafetyAction
                              ? 'text-rose-900'
                              : 'text-teal-900'
                            : 'text-stone-600'
                        }`}
                      >
                        {act.subtitle}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-xl shrink-0 ${
                        isChosen
                          ? act.isSafetyAction
                            ? 'bg-rose-700 text-white'
                            : 'bg-teal-700 text-white'
                          : 'bg-white text-stone-700 border border-stone-200'
                      }`}
                    >
                      {isChosen ? '✓ 已尝试' : '试试这个'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 主动暂停状态提示 */}
          {currentState.pausedVoluntarily && (
            <div
              data-testid="transition-paused-banner"
              className="p-3 rounded-2xl bg-stone-100 border border-stone-300 text-xs sm:text-sm font-bold text-stone-800 flex items-center justify-between gap-2"
            >
              <span>🌿 你选择了先停下来休息。不用勉强做决定，随时可以继续或离开小桥。</span>
            </div>
          )}

          {/* ⑥ 结果怎样（真实可观察结果 + 现实世界可能反馈 + 换个做法再试一次） */}
          {currentState.observedOutcome && (
            <div
              data-testid="transition-observed-outcome"
              data-action-id={currentState.observedOutcome.actionId}
              data-safety-route={String(currentState.observedOutcome.isSafetyProtectionRoute)}
              className={`p-3.5 rounded-2xl border-2 space-y-2 ${
                currentState.observedOutcome.isSafetyProtectionRoute
                  ? 'bg-rose-50 border-rose-400 text-rose-950'
                  : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
              }`}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-black">
                  ⑥ 尝试结果与场景变化（已尝试 {currentState.attemptCount} 次
                  {currentState.revisionCount > 0
                    ? ` · 调整做法 ${currentState.revisionCount} 次`
                    : ''}
                  ）：
                </span>
                <button
                  type="button"
                  data-testid="transition-retry-btn"
                  onClick={() => {
                    sounds.playClick();
                    commitSliceState(prepareRetryTransitionAttempt(currentState));
                  }}
                  className="min-h-[38px] px-3 py-1 rounded-xl bg-white hover:bg-amber-50 text-stone-800 border border-stone-300 text-xs font-black flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>换个做法再试一次</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm font-bold leading-relaxed">
                🎬 场景变化：{currentState.observedOutcome.sceneVisualChangeSummary}
              </p>
              <p className="text-xs leading-relaxed text-stone-700 bg-white/80 p-2.5 rounded-xl border border-stone-200/80">
                🌍 {currentState.observedOutcome.realisticPossibleWorldNote}
              </p>
              <div className="text-[11px] font-bold text-teal-900">
                🧠 本次练习能力：{currentState.observedOutcome.trainedCognitiveSkill}
              </div>
            </div>
          )}
        </div>

        {/* ================= 可选日常工具抽屉：保留日历、小书包、想念盒子（不再作为强制默认解决方案） ================= */}
        {!currentState.ordinaryRitualsBlockedBySafety && (
          <div
            data-testid="transition-optional-tools-drawer"
            className="bg-white/90 rounded-2xl border border-amber-200 overflow-hidden"
          >
            <button
              type="button"
              data-testid="toggle-optional-tools-btn"
              onClick={() => {
                sounds.playClick();
                const nextOpen = !showOptionalTools;
                setShowOptionalTools(nextOpen);
                if (nextOpen) {
                  speakWithCurrentCompanion(TRANSITION_FIXED_VOICE_LINES.OPTIONAL_TOOLS_NOTE);
                }
              }}
              className="w-full min-h-[48px] px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-black text-stone-800 hover:bg-amber-50/60 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Backpack className="w-4 h-4 text-amber-700" />
                <span>可选生活小工具：图画日历 / 小书包清单 / 想念盒（按需选用）</span>
              </span>
              {showOptionalTools ? (
                <ChevronUp className="w-4 h-4 text-stone-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-stone-500" />
              )}
            </button>

            {showOptionalTools && (
              <div className="p-3.5 border-t border-amber-100 space-y-3">
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-amber-100/60 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setOptionalToolTab('calendar')}
                    className={`min-h-[42px] rounded-lg text-xs font-black cursor-pointer ${
                      optionalToolTab === 'calendar'
                        ? 'bg-white text-amber-950 shadow-2xs'
                        : 'text-stone-700'
                    }`}
                  >
                    📅 图画日历
                  </button>
                  <button
                    type="button"
                    onClick={() => setOptionalToolTab('ritual')}
                    className={`min-h-[42px] rounded-lg text-xs font-black cursor-pointer ${
                      optionalToolTab === 'ritual'
                        ? 'bg-white text-amber-950 shadow-2xs'
                        : 'text-stone-700'
                    }`}
                  >
                    🎒 小书包清单
                  </button>
                  <button
                    type="button"
                    onClick={() => setOptionalToolTab('missBox')}
                    className={`min-h-[42px] rounded-lg text-xs font-black cursor-pointer ${
                      optionalToolTab === 'missBox'
                        ? 'bg-white text-amber-950 shadow-2xs'
                        : 'text-stone-700'
                    }`}
                  >
                    💌 想念盒子
                  </button>
                </div>

                {optionalToolTab === 'calendar' && (
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between flex-wrap gap-2">
                      <div className="text-xs sm:text-sm font-black text-stone-800 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-700" />
                        <span>
                          {isScheduleConfigured
                            ? `今晚住处：${tonightAt}（还有 ${daysToNextSwitch} 晚转换）`
                            : '等待大人设置日程'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakWithCurrentCompanion(spokenTonightSchedule)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-xs font-bold text-amber-900 cursor-pointer"
                      >
                        播报日程
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {WEEK_SCHEDULE.map(({ day, home, isToday }) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => speakWithCurrentCompanion(`${day}，住在${home}`)}
                          className={`p-1.5 rounded-xl border text-center cursor-pointer ${
                            isToday
                              ? 'bg-amber-500 text-white border-amber-600 font-black'
                              : 'bg-stone-50 text-stone-700 border-stone-200'
                          }`}
                        >
                          <div className="text-[10px] font-bold">{day}</div>
                          <div className="text-[10px] mt-0.5">{home}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {optionalToolTab === 'ritual' && (
                  <div className="space-y-2">
                    <p className="text-xs text-stone-600 font-medium">
                      如果有想带的日常物品可以勾选；不想带特别信物也可以空手轻松出发。
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {PACKING_CANDIDATES.map((item) => {
                        const isPacked = packedItems.includes(item.text);
                        return (
                          <button
                            key={item.text}
                            type="button"
                            onClick={() => {
                              sounds.playClick();
                              togglePackedItem(item.text);
                            }}
                            className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-black flex items-center justify-between cursor-pointer ${
                              isPacked
                                ? 'bg-amber-100 border-amber-400 text-amber-950'
                                : 'bg-white border-stone-200 text-stone-700'
                            }`}
                          >
                            <span>
                              {item.emoji} {item.text}
                            </span>
                            <span>{isPacked ? '✓ 已勾选' : '+ 勾选'}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {optionalToolTab === 'missBox' && (
                  <div className="space-y-2">
                    <p className="text-xs text-stone-600 font-medium">
                      想写画时可以存进盒子里；现在不想写也完全没关系。
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMissText}
                        onChange={(e) => setNewMissText(e.target.value)}
                        placeholder="想记下的一句话（可选）……"
                        className="flex-1 min-h-[42px] text-xs px-3 py-2 rounded-xl border border-stone-200 bg-white"
                        aria-label="写下你的小思念"
                      />
                      <button
                        type="button"
                        onClick={handleSendMiss}
                        disabled={!newMissText.trim()}
                        className="min-h-[42px] px-4 py-2 bg-amber-600 disabled:opacity-40 text-white rounded-xl text-xs font-black cursor-pointer"
                      >
                        收进盒子
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= 折叠式家长共读与认知目标说明区 (Section 7: 长段解释收纳到家长共读区) ================= */}
        <div
          data-testid="transition-parent-coread-drawer"
          className="bg-stone-100/90 rounded-2xl border border-stone-200 overflow-hidden"
        >
          <button
            type="button"
            data-testid="toggle-parent-coread-btn"
            onClick={() => setShowParentCoRead((prev) => !prev)}
            className="w-full min-h-[44px] px-4 py-2 flex items-center justify-between text-xs font-bold text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <span>📖 家长共读与认知训练说明（点击展开大人引导提示）</span>
            {showParentCoRead ? (
              <ChevronUp className="w-4 h-4 text-stone-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-500" />
            )}
          </button>
          {showParentCoRead && (
            <div className="p-3.5 border-t border-stone-200 text-xs text-stone-600 space-y-1.5 leading-relaxed">
              <p>
                <strong>• 为什么不再默认“两个家一样温暖 / 换家必然焦虑”：</strong>
                6岁儿童在换家时的真实体验可能是双向不舍、忠诚冲突、对某一边环境不习惯、具体日程不明，或者平平常常开心地出发。强行要求孩子相信“两个地方一模一样”或要求必须拥抱，反而会压抑真实感受。
              </p>
              <p>
                <strong>• 三条核心认知训练链路：</strong>
                Slice A 练习容纳双向依恋并自主决定过渡方式（允许不抱抱、不写信）；Slice B 练习区分“亲身经历的事实”与“对成人感受的猜测”，把成人情绪归还成人责任圈；Slice C 练习先核实具体原因（日程、习惯、分离或暂不想说），并在遇到具体伤害风险时立即转入现实安全保护。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
