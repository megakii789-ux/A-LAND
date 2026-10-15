import React, { useState, useEffect } from 'react';
import {
  FRIEND_HOME_SCENARIOS,
  EXPRESSION_MODE_META,
  getFriendHomeScenarioById,
  FriendHomeScenario,
  DialogueTurnOption,
  ExpressionMode,
  PeerMoodState,
} from '../../../domain/games/friendAsksHomeLogic';
import { sounds } from '../../../utils/sound';
import { speechNarrator } from '../../../utils/speech';
import { ContentAuditRegistry } from '../../../domain/cognitive/ContentAuditRegistry';
import {
  issueAdultPreviewSession,
  isAdultPreviewSessionValid,
  revokeAdultPreviewSession,
  lockParentAccess,
  subscribeParentAccess,
  isInternalPlaytestEnabled,
} from '../../../domain/privacy/parentAccess';
import {
  getProductExperienceMetrics,
  recordFriendHomeSessionProgress,
  FriendHomeFramingMode,
  FriendHomeScenarioProgressSnapshot,
} from '../../../domain/cognitive/productExperienceMetrics';
import { useApp } from '../../../context/AppContext';
import { ParentGateModal } from '../../ParentGateModal';

const SCOPE_KEY = 'game_friend_asks_home';

interface Props {
  onExit: () => void;
  isAdultPreview?: boolean;
  previewSessionToken?: string | null;
}

/**
 * P1-C: 当孩子选择「练习适合我自己的表达 (OWN_EXPRESSION)」且未在应用中主动开启双家日程情境时，
 * 默认采用中性通用家庭文案，不预设当前玩家“住两个家”。
 */
function adaptTextForFraming(
  text: string,
  framingMode: FriendHomeFramingMode,
  hasTwoHomesContext: boolean
): string {
  if (framingMode === 'STORY_CHILD' || hasTwoHomesContext) {
    return text;
  }
  return text
    .replace(
      '因为爸爸妈妈住在两个不同的家里，轮流来接我放学呀。',
      '因为我们家每天接送的安排不一样，今天轮到妈妈来接我放学呀。'
    )
    .replace(
      '啊？住在两个家？那你的玩具和画笔放哪边呀？会不会弄丢呀？',
      '啊？每天接送不一样呀？那你的玩具和画笔放在家里哪里呀？会不会找不到呀？'
    )
    .replace(
      '两边都有我的小书架和画笔，爸爸妈妈都很爱我，不会丢的！',
      '家里有我专门的小书架和画笔角，爸爸妈妈都很爱我，不会丢的！'
    )
    .replace(
      '原来两边都有属于你的小天地呀！',
      '原来家里有属于你的温暖小天地呀！'
    )
    .replace(
      '自由画画时你画了两座漂亮的小房子，同桌豆豆凑过来不停追问你们家的隐私细节。',
      '自由画画时你画了家里的秘密基地，同桌豆豆凑过来不停追问你们家的隐私细节。'
    )
    .replace(
      '喂，别人都是画一座房子，你为什么画了两个家呀？你爸爸妈妈到底怎么回事呀？快告诉我嘛！',
      '喂，你画的房子跟别人不一样，你们家平时到底是怎么安排的呀？快告诉我嘛！'
    )
    .replace(
      '因为我两边都可以住呀，左边有小猫，右边有秋千。',
      '因为我喜欢画两个好玩的角落呀，左边有小猫，右边有秋千。'
    )
    .replace(
      '课间玩滑梯时，同学乐乐听说你爸爸妈妈不住在一起，脱口说出了一句错误的猜测。',
      '课间玩滑梯时，同学乐乐看到今天家里大人没一起来，脱口说出了一句错误的猜测。'
    )
    .replace(
      '啊？你爸爸妈妈不住在一起呀？那是不是因为你不听话，有一边不要你了呀？',
      '啊？今天你家里大人没一起来呀？那是不是因为你不听话，大人不想管你了呀？'
    )
    .replace(
      '老师，乐乐说我爸妈不住一起是因为不要我了，我听了很难过。',
      '老师，乐乐乱猜我家里大人的事，我听了很难过。'
    )
    .replace(
      '哈哈，大家快看，他爸爸妈妈不住在一起，他家跟别人不一样，真奇怪！',
      '哈哈，大家快看，他家里跟别人不一样，真奇怪！'
    )
    .replace(
      '我有两个温暖的家，一边有小猫咪，一边有大积木桌。',
      '我们家有很温暖的小角落，有我喜欢的绘本和大积木桌。'
    );
}

/**
 * P1-D: 为同伴当前反应提取可视化「表情 · 动作 · 语气」三维观察标签，降低纯文字阅读负担
 */
function getPeerVisualReactionCues(mood: PeerMoodState, roundNumber: number): {
  expressionTag: string;
  gestureTag: string;
  toneTag: string;
} {
  switch (mood) {
    case 'CURIOUS':
      return {
        expressionTag: '👀 表情：眨着眼睛好奇张望',
        gestureTag: '🎒 动作：背着小书包凑近',
        toneTag: '🎵 语气：随口好奇打听',
      };
    case 'PROBING':
      return {
        expressionTag: '🤨 表情：瞪大眼紧盯不放',
        gestureTag: roundNumber === 1 ? '🤚 动作：胳膊肘撑在画纸边' : '👉 动作：追着继续问细节',
        toneTag: '⚡ 语气：急切连环追问',
      };
    case 'CONFUSED':
      return {
        expressionTag: '😮 表情：愣住嘟嘴/挠头',
        gestureTag: '🤷 动作：停下追问往后退半步',
        toneTag: '💬 语气：小声嘀咕但不再逼问',
      };
    case 'MOCKING':
      return {
        expressionTag: '😝 表情：挤眉弄眼起哄',
        gestureTag: '🚧 动作：凑在一起故意大声笑',
        toneTag: '📢 语气：没礼貌地起哄嘲笑',
      };
    case 'DISTRACTED_PLAY':
      return {
        expressionTag: '😄 表情：眼睛发亮被新话题吸引',
        gestureTag: '🎨 动作：转头看玩具/画笔',
        toneTag: '🎶 语气：开心地聊起游戏',
      };
    case 'ADULT_SUPPORTED':
      return {
        expressionTag: '🤗 表情：温暖安心微笑',
        gestureTag: '🛡️ 动作：可靠大人蹲下守护你',
        toneTag: '💛 语气：温柔坚定地支持你',
      };
    case 'RESPECTFUL':
    default:
      return {
        expressionTag: '😊 表情：友善点头微笑',
        gestureTag: '👋 动作：尊重界限挥手约定',
        toneTag: '🌿 语气：平和尊重你的意愿',
      };
  }
}

/**
 * 原创矢量同伴角色插画：根据同伴身份与当前情绪状态呈现不同神态与肢体语言
 */
const PeerCharacterSvg: React.FC<{
  avatarType: FriendHomeScenario['peerAvatarType'];
  mood: PeerMoodState;
  className?: string;
}> = ({ avatarType, mood, className = 'w-20 h-20' }) => {
  const isMocking = mood === 'MOCKING';
  const isProbing = mood === 'PROBING';
  const isRespectful = mood === 'RESPECTFUL' || mood === 'ADULT_SUPPORTED';

  const bgStroke = isMocking
    ? '#E11D48'
    : isProbing
      ? '#D97706'
      : isRespectful
        ? '#10B981'
        : '#0284C7';

  const shirtFill =
    avatarType === 'xiaoming'
      ? '#38BDF8'
      : avatarType === 'doudou'
        ? '#F59E0B'
        : avatarType === 'lele'
          ? '#A78BFA'
          : avatarType === 'crowd'
            ? '#FB7185'
            : '#34D399';

  return (
    <svg
      viewBox="0 0 88 88"
      data-peer-mood={mood}
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <circle cx="44" cy="44" r="40" fill="#FFFBEB" stroke={bgStroke} strokeWidth="3" />
      <circle cx="44" cy="44" r="35" stroke="#FDE68A" strokeWidth="1.5" strokeDasharray="3 3" />

      {avatarType === 'crowd' ? (
        /* 多名同学起哄剪影 */
        <g>
          <circle cx="31" cy="36" r="11" fill="#FDE68A" stroke="#B45309" strokeWidth="2" />
          <path d="M20 32C23 23 39 23 42 32" fill="#78350F" />
          <circle cx="28" cy="36" r="1.8" fill="#451A03" />
          <circle cx="35" cy="36" r="1.8" fill="#451A03" />
          <path d="M28 41Q31 44 35 41" stroke="#991B1B" strokeWidth="1.8" strokeLinecap="round" />

          <circle cx="57" cy="38" r="11" fill="#FED7AA" stroke="#9A3412" strokeWidth="2" />
          <path d="M46 34C49 25 65 25 68 34" fill="#431407" />
          <circle cx="54" cy="38" r="1.8" fill="#451A03" />
          <circle cx="61" cy="38" r="1.8" fill="#451A03" />
          <path d="M54 43Q57 46 61 43" stroke="#991B1B" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M18 68C20 55 40 55 42 68" fill="#FB7185" />
          <path d="M45 68C47 56 67 56 69 68" fill="#F97316" />
        </g>
      ) : (
        /* 单个同伴角色 */
        <g>
          {/* 头发 */}
          <path d="M24 36C24 20 64 20 64 36" fill="#451A03" />
          {/* 脸庞 */}
          <circle cx="44" cy="40" r="16" fill="#FDE68A" stroke="#B45309" strokeWidth="2" />
          {/* 眉毛与眼睛 */}
          {isProbing ? (
            <>
              <line x1="34" y1="33" x2="40" y2="35" stroke="#451A03" strokeWidth="2" strokeLinecap="round" />
              <line x1="48" y1="35" x2="54" y2="33" stroke="#451A03" strokeWidth="2" strokeLinecap="round" />
            </>
          ) : null}
          <circle cx="38" cy="39" r="2.3" fill="#451A03" />
          <circle cx="50" cy="39" r="2.3" fill="#451A03" />
          <circle cx="34" cy="43" r="3" fill="#FDA4AF" opacity="0.65" />
          <circle cx="54" cy="43" r="3" fill="#FDA4AF" opacity="0.65" />
          {/* 嘴巴随情绪变化 */}
          {isRespectful ? (
            <path d="M39 46Q44 51 49 46" stroke="#B45309" strokeWidth="2.2" strokeLinecap="round" />
          ) : mood === 'CONFUSED' ? (
            <circle cx="44" cy="47" r="2.8" stroke="#B45309" strokeWidth="2" />
          ) : (
            <path d="M40 47Q44 45 48 47" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
          )}
          {/* 上衣与肢体姿态反馈 */}
          <path d="M24 72C26 57 62 57 64 72" fill={shirtFill} stroke="#1E293B" strokeWidth="1.8" />
          {isProbing && (
            /* 追问时向前探出的小手 */
            <circle cx="66" cy="56" r="4.5" fill="#FDE68A" stroke="#B45309" strokeWidth="1.5" />
          )}
          {isRespectful && (
            /* 尊重边界时友善挥手 */
            <circle cx="22" cy="54" r="4.5" fill="#FDE68A" stroke="#059669" strokeWidth="1.5" />
          )}
        </g>
      )}
    </svg>
  );
};

/**
 * 个人空间与隐私边界花园泡泡矢量图 (Interactive Boundary Bubble SVG)
 */
const PrivacyBoundaryBubbleSvg: React.FC<{
  activeMode: ExpressionMode | null;
  isSafetyAlert: boolean;
  className?: string;
}> = ({ activeMode, isSafetyAlert, className = 'w-20 h-20' }) => {
  const shieldColor = isSafetyAlert
    ? '#E11D48'
    : activeMode === 'STATE_BOUNDARY' || activeMode === 'PAUSE_CONVERSATION'
      ? '#4F46E5'
      : activeMode === 'SEEK_ADULT_HELP'
        ? '#7C3AED'
        : activeMode === 'CHANGE_TOPIC' || activeMode === 'ASK_PEER'
          ? '#0284C7'
          : '#10B981';

  return (
    <svg viewBox="0 0 88 88" className={className} aria-hidden="true" fill="none">
      {/* 外层柔和边界光环 */}
      <circle
        cx="44"
        cy="44"
        r="39"
        fill="#FFF1F2"
        stroke={shieldColor}
        strokeWidth="3"
        strokeDasharray={activeMode === 'DIRECT_ANSWER' ? '6 4' : undefined}
      />
      <circle cx="44" cy="44" r="31" fill="#FFFFFF" stroke={shieldColor} strokeWidth="1.8" opacity="0.85" />
      {/* 中央安心小房子与心形护盾 */}
      <polygon points="44,24 28,38 60,38" fill={shieldColor} opacity="0.85" />
      <rect x="33" y="38" width="22" height="20" rx="3" fill="#FFFBEB" stroke={shieldColor} strokeWidth="2" />
      <path
        d="M44 44C42 41.5 38.5 42.5 38.5 45.5C38.5 49 44 53 44 53C44 53 49.5 49 49.5 45.5C49.5 42.5 46 41.5 44 44Z"
        fill="#F43F5E"
      />
    </svg>
  );
};

export const FriendAsksHomeGame: React.FC<Props> = ({
  onExit,
  previewSessionToken = null,
}) => {
  let hasTwoHomesContext = false;
  try {
    const app = useApp();
    hasTwoHomesContext =
      Boolean(app.familyContent) || app.tonightAt === '妈妈家' || app.tonightAt === '爸爸家';
  } catch {
    hasTwoHomesContext = false;
  }

  const [localSessionToken, setLocalSessionToken] = useState<string | null>(null);
  const [isParentGateOpen, setIsParentGateOpen] = useState(false);
  const [, setAccessVersion] = useState(0);

  useEffect(() => {
    return subscribeParentAccess(() => {
      setAccessVersion((v) => v + 1);
    });
  }, []);

  useEffect(() => {
    return () => {
      revokeAdultPreviewSession(SCOPE_KEY);
    };
  }, []);

  const effectiveToken = previewSessionToken ?? localSessionToken;
  const adultPreviewUnlocked =
    isAdultPreviewSessionValid(SCOPE_KEY, effectiveToken) || isInternalPlaytestEnabled();
  const isApproved = ContentAuditRegistry.canRenderContent('game_friend_asks_home');

  // 从端侧指标恢复上次退出时的会话状态（含每个场景的独立进度映射 scenarioStatesById）
  const initialSavedState = getProductExperienceMetrics().friendHomeSessionState;
  const initialScenario = getFriendHomeScenarioById(
    initialSavedState?.activeScenarioId || FRIEND_HOME_SCENARIOS[0].id
  );
  const initialSavedScenarioMap: Record<string, FriendHomeScenarioProgressSnapshot> = {
    ...(initialSavedState?.scenarioStatesById || {}),
  };
  if (
    initialSavedState &&
    initialSavedState.activeScenarioId === initialScenario.id &&
    !initialSavedScenarioMap[initialScenario.id]
  ) {
    initialSavedScenarioMap[initialScenario.id] = {
      scenarioId: initialScenario.id,
      currentNodeId: initialSavedState.currentNodeId,
      historyNodeIds: initialSavedState.historyNodeIds,
      chosenExpressionModes: initialSavedState.chosenExpressionModes,
      chosenChoiceLabels: initialSavedState.chosenChoiceLabels,
      endedEarlyVoluntarily: false,
      isCompleted: initialSavedState.isCompleted,
    };
  }

  const initialScenarioProgress = initialSavedScenarioMap[initialScenario.id];
  const initialNodeId =
    initialScenarioProgress && initialScenario.nodes[initialScenarioProgress.currentNodeId]
      ? initialScenarioProgress.currentNodeId
      : initialScenario.initialNodeId;

  const [framingMode, setFramingMode] = useState<FriendHomeFramingMode>(
    initialSavedState?.framingMode || 'STORY_CHILD'
  );
  const [scenarioStatesById, setScenarioStatesById] = useState<
    Record<string, FriendHomeScenarioProgressSnapshot>
  >(initialSavedScenarioMap);
  const [activeScenarioId, setActiveScenarioId] = useState<string>(initialScenario.id);
  const [currentNodeId, setCurrentNodeId] = useState<string>(initialNodeId);
  const [historyNodeIds, setHistoryNodeIds] = useState<string[]>(
    initialScenarioProgress?.historyNodeIds?.length
      ? initialScenarioProgress.historyNodeIds
      : [initialScenario.initialNodeId]
  );
  const [chosenExpressionModes, setChosenExpressionModes] = useState<ExpressionMode[]>(
    (initialScenarioProgress?.chosenExpressionModes as ExpressionMode[]) || []
  );
  const [chosenChoiceLabels, setChosenChoiceLabels] = useState<string[]>(
    initialScenarioProgress?.chosenChoiceLabels || []
  );
  const [endedEarlyVoluntarily, setEndedEarlyVoluntarily] = useState<boolean>(
    Boolean(initialScenarioProgress?.endedEarlyVoluntarily)
  );
  const [completedScenarioIds, setCompletedScenarioIds] = useState<string[]>(
    () => getProductExperienceMetrics().completedFriendHomeScenarioIds
  );

  // P1-D: 场景一（好奇询问）互动表达组合器状态（说多少 × 语气 × 话题/求助）
  const [composerAmount, setComposerAmount] = useState<'DIRECT' | 'PARTIAL' | 'HOLD'>('PARTIAL');
  const [composerTone, setComposerTone] = useState<'GENTLE' | 'ASK_BACK' | 'FIRM'>('GENTLE');
  const [composerTopic, setComposerTopic] = useState<'PICKUP' | 'PLAY_TOPIC' | 'ADULT'>('PICKUP');

  const scenario = getFriendHomeScenarioById(activeScenarioId);
  const currentNode = scenario.nodes[currentNodeId] || scenario.nodes[scenario.initialNodeId];
  const lastChosenMode =
    chosenExpressionModes.length > 0
      ? chosenExpressionModes[chosenExpressionModes.length - 1]
      : null;

  const adaptedPeerSpeech = adaptTextForFraming(
    currentNode.peerSpokenText,
    framingMode,
    hasTwoHomesContext
  );
  const adaptedContextSummary = adaptTextForFraming(
    scenario.contextSummary,
    framingMode,
    hasTwoHomesContext
  );
  const visualCues = getPeerVisualReactionCues(currentNode.peerMood, currentNode.roundNumber);

  // 语音播报开场
  useEffect(() => {
    if (!isApproved && !adultPreviewUnlocked) return;
    speechNarrator.speak(
      `${scenario.title}。${currentNode.speakerName}说：${adaptedPeerSpeech} 你想怎么回应呢？怎么说、说多少或者停下对话，都由你决定。`
    );
    return () => {
      speechNarrator.stop();
    };
  }, [activeScenarioId]);

  const syncSessionToStorage = (
    nextScenarioId: string,
    nextNodeId: string,
    nextHistory: string[],
    nextModes: ExpressionMode[],
    nextLabels: string[],
    isCompleted: boolean,
    nextEndedEarly: boolean,
    nextFramingMode: FriendHomeFramingMode,
    baseScenarioMap: Record<string, FriendHomeScenarioProgressSnapshot>,
    latestMode?: ExpressionMode,
    latestSpokenText?: string
  ) => {
    const targetScenario = getFriendHomeScenarioById(nextScenarioId);
    const modeLabel = latestMode ? EXPRESSION_MODE_META[latestMode].label : '自主边界表达';
    const updatedMap: Record<string, FriendHomeScenarioProgressSnapshot> = {
      ...baseScenarioMap,
      [nextScenarioId]: {
        scenarioId: nextScenarioId,
        currentNodeId: nextNodeId,
        historyNodeIds: nextHistory,
        chosenExpressionModes: nextModes,
        chosenChoiceLabels: nextLabels,
        endedEarlyVoluntarily: nextEndedEarly,
        isCompleted,
      },
    };
    setScenarioStatesById(updatedMap);

    const updated = recordFriendHomeSessionProgress(
      {
        activeScenarioId: nextScenarioId,
        currentNodeId: nextNodeId,
        historyNodeIds: nextHistory,
        chosenExpressionModes: nextModes,
        chosenChoiceLabels: nextLabels,
        isCompleted,
        framingMode: nextFramingMode,
        scenarioStatesById: updatedMap,
      },
      latestMode
        ? {
            gameId: 'friend_asks_home',
            scenarioTitle: targetScenario.title,
            eventStage: isCompleted ? 'COMPLETED_OBSERVED' : 'ARRANGED_OR_STARTED',
            childChoiceSummary: isCompleted
              ? `在「${targetScenario.title}」完成了【${modeLabel}】`
              : `正在「${targetScenario.title}」尝试【${modeLabel}】`,
            companionReactionText: isCompleted
              ? `我记得你在「${targetScenario.title}」里用了「${modeLabel}」(${latestSpokenText?.slice(0, 16) || ''}…)，守护让自己舒服的边界真棒！`
              : `你刚刚在「${targetScenario.title}」尝试了「${modeLabel}」，正在观察同伴接下来的反应呢！`,
            updatedAt: new Date().toISOString(),
          }
        : undefined
    );
    setCompletedScenarioIds(updated.completedFriendHomeScenarioIds);
  };

  // P1-C: 切换视角模式（体验故事里小朋友 vs 练习适合我自己的表达）
  const handleSelectFramingMode = (nextMode: FriendHomeFramingMode) => {
    sounds.playClick();
    setFramingMode(nextMode);
    syncSessionToStorage(
      scenario.id,
      currentNodeId,
      historyNodeIds,
      chosenExpressionModes,
      chosenChoiceLabels,
      Boolean(currentNode.isTerminal) || endedEarlyVoluntarily,
      endedEarlyVoluntarily,
      nextMode,
      scenarioStatesById
    );
  };

  // P1-C: 选择切换五类同伴场景 —— 保留并恢复每个场景各自的进度，绝不一换场景就清空！
  const handleSelectScenario = (nextScenarioId: string) => {
    sounds.playClick();
    // 先把当前场景进度固定进 map
    const currentSnapshot: FriendHomeScenarioProgressSnapshot = {
      scenarioId: scenario.id,
      currentNodeId,
      historyNodeIds,
      chosenExpressionModes,
      chosenChoiceLabels,
      endedEarlyVoluntarily,
      isCompleted: Boolean(currentNode.isTerminal) || endedEarlyVoluntarily,
    };
    const mergedMap: Record<string, FriendHomeScenarioProgressSnapshot> = {
      ...scenarioStatesById,
      [scenario.id]: currentSnapshot,
    };

    const nextScenario = getFriendHomeScenarioById(nextScenarioId);
    const savedNext = mergedMap[nextScenario.id];
    const validSavedNodeId =
      savedNext && nextScenario.nodes[savedNext.currentNodeId]
        ? savedNext.currentNodeId
        : nextScenario.initialNodeId;
    const restoredHistory =
      savedNext && savedNext.historyNodeIds.length > 0
        ? savedNext.historyNodeIds
        : [nextScenario.initialNodeId];
    const restoredModes = (savedNext?.chosenExpressionModes as ExpressionMode[]) || [];
    const restoredLabels = savedNext?.chosenChoiceLabels || [];
    const restoredEndedEarly = Boolean(savedNext?.endedEarlyVoluntarily);
    const restoredCompleted =
      Boolean(savedNext?.isCompleted) ||
      Boolean(nextScenario.nodes[validSavedNodeId]?.isTerminal) ||
      restoredEndedEarly;

    setActiveScenarioId(nextScenario.id);
    setCurrentNodeId(validSavedNodeId);
    setHistoryNodeIds(restoredHistory);
    setChosenExpressionModes(restoredModes);
    setChosenChoiceLabels(restoredLabels);
    setEndedEarlyVoluntarily(restoredEndedEarly);

    syncSessionToStorage(
      nextScenario.id,
      validSavedNodeId,
      restoredHistory,
      restoredModes,
      restoredLabels,
      restoredCompleted,
      restoredEndedEarly,
      framingMode,
      mergedMap
    );
  };

  // 选择某一轮的表达方式并推进多轮对话
  const handleSelectTurnOption = (option: DialogueTurnOption) => {
    sounds.playClick();
    setEndedEarlyVoluntarily(false);
    const nextNode = scenario.nodes[option.nextNodeId] || currentNode;
    const nextHistory = [...historyNodeIds, nextNode.nodeId];
    const nextModes = [...chosenExpressionModes, option.mode];
    const adaptedSpoken = adaptTextForFraming(
      option.childSpokenText,
      framingMode,
      hasTwoHomesContext
    );
    const nextLabels = [
      ...chosenChoiceLabels,
      `${EXPRESSION_MODE_META[option.mode].label}：${adaptedSpoken}`,
    ];

    setCurrentNodeId(nextNode.nodeId);
    setHistoryNodeIds(nextHistory);
    setChosenExpressionModes(nextModes);
    setChosenChoiceLabels(nextLabels);

    const isDone = Boolean(nextNode.isTerminal);
    if (isDone) {
      sounds.playKalimbaBloom();
    }

    syncSessionToStorage(
      scenario.id,
      nextNode.nodeId,
      nextHistory,
      nextModes,
      nextLabels,
      isDone,
      false,
      framingMode,
      scenarioStatesById,
      option.mode,
      adaptedSpoken
    );

    const nextAdaptedPeer = adaptTextForFraming(
      nextNode.peerSpokenText,
      framingMode,
      hasTwoHomesContext
    );
    speechNarrator.speak(`${nextAdaptedPeer} ${nextNode.cognitiveReflectionNote}`);
  };

  // P1-D: 场景一组合器匹配当前轮次最契合的回应选项
  const getComposedOptionForCurrentRound = (): DialogueTurnOption | null => {
    const opts = currentNode.options || [];
    if (opts.length === 0) return null;
    if (composerTopic === 'ADULT') {
      return (
        opts.find((o) => o.mode === 'SEEK_ADULT_HELP' || o.mode === 'PAUSE_CONVERSATION') ||
        opts[opts.length - 1]
      );
    }
    if (composerTopic === 'PLAY_TOPIC') {
      return (
        opts.find((o) => o.mode === 'CHANGE_TOPIC' || o.mode === 'ASK_PEER') || opts[0]
      );
    }
    if (composerTone === 'ASK_BACK') {
      return opts.find((o) => o.mode === 'ASK_PEER') || opts[0];
    }
    if (composerTone === 'FIRM' || composerAmount === 'HOLD') {
      return (
        opts.find((o) => o.mode === 'STATE_BOUNDARY' || o.mode === 'PAUSE_CONVERSATION') ||
        opts[opts.length - 1]
      );
    }
    if (composerAmount === 'DIRECT') {
      return opts.find((o) => o.mode === 'DIRECT_ANSWER') || opts[0];
    }
    return opts.find((o) => o.mode === 'PARTIAL_ANSWER') || opts[0];
  };

  // 返回上一轮对话重新尝试
  const handleStepBackTurn = () => {
    if (historyNodeIds.length <= 1) return;
    sounds.playClick();
    setEndedEarlyVoluntarily(false);
    const nextHistory = historyNodeIds.slice(0, -1);
    const prevNodeId = nextHistory[nextHistory.length - 1];
    const nextModes = chosenExpressionModes.slice(0, -1);
    const nextLabels = chosenChoiceLabels.slice(0, -1);

    setCurrentNodeId(prevNodeId);
    setHistoryNodeIds(nextHistory);
    setChosenExpressionModes(nextModes);
    setChosenChoiceLabels(nextLabels);

    syncSessionToStorage(
      scenario.id,
      prevNodeId,
      nextHistory,
      nextModes,
      nextLabels,
      false,
      false,
      framingMode,
      scenarioStatesById
    );
    const prevNode = scenario.nodes[prevNodeId];
    if (prevNode) {
      speechNarrator.speak(`我们回到第 ${prevNode.roundNumber} 轮，换一种你喜欢的表达方式试试吧！`);
    }
  };

  // 重新开始当前场景
  const handleRestartScenario = () => {
    sounds.playClick();
    const startNodeId = scenario.initialNodeId;
    setCurrentNodeId(startNodeId);
    setHistoryNodeIds([startNodeId]);
    setChosenExpressionModes([]);
    setChosenChoiceLabels([]);
    setEndedEarlyVoluntarily(false);

    syncSessionToStorage(
      scenario.id,
      startNodeId,
      [startNodeId],
      [],
      [],
      false,
      false,
      framingMode,
      scenarioStatesById
    );
    speechNarrator.speak('我们重新开始这个情境，你可以尝试不同的回答、转移话题或者直接划定边界！');
  };

  // 随时自主暂停/结束当前对话（绝不判为失败，给予正向尊重反馈）
  const handlePauseConversationAnytime = () => {
    sounds.playClick();
    setEndedEarlyVoluntarily(true);
    const nextModes: ExpressionMode[] = [...chosenExpressionModes, 'PAUSE_CONVERSATION'];
    const nextLabels = [
      ...chosenChoiceLabels,
      '暂停对话：“我现在不想继续聊这个话题了，我先去玩别的啦。”',
    ];
    setChosenExpressionModes(nextModes);
    setChosenChoiceLabels(nextLabels);

    syncSessionToStorage(
      scenario.id,
      currentNode.nodeId,
      historyNodeIds,
      nextModes,
      nextLabels,
      true,
      true,
      framingMode,
      scenarioStatesById,
      'PAUSE_CONVERSATION',
      '我现在不想继续聊这个话题了'
    );
    speechNarrator.speak(
      '你随时都有权利喊停对话！不想回答或停下聊天完全不是失败，而是很好地照顾了自己的感受。'
    );
  };

  const handleExitGame = () => {
    speechNarrator.stop();
    setLocalSessionToken(null);
    setIsParentGateOpen(false);
    revokeAdultPreviewSession();
    lockParentAccess();
    onExit();
  };

  const handleRequestAdultPreview = () => {
    sounds.playClick();
    setLocalSessionToken(null);
    revokeAdultPreviewSession();
    lockParentAccess();
    setIsParentGateOpen(true);
  };

  if (!isApproved && !adultPreviewUnlocked) {
    return (
      <div
        data-testid="audit-gate-blocked"
        className="p-6 sm:p-8 bg-amber-50 rounded-3xl border-2 border-amber-200 text-stone-800 text-center space-y-4 my-4 max-w-xl mx-auto"
      >
        <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <svg viewBox="0 0 32 32" className="w-9 h-9" aria-hidden="true" fill="none">
            <path d="M16 27V12" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M16 14C12 11 8 13 8 18C13 18 15 16 16 14Z" fill="#34D399" stroke="#059669" strokeWidth="1.5" />
            <path d="M16 17C20 14 24 16 24 21C19 21 17 19 16 17Z" fill="#10B981" stroke="#047857" strokeWidth="1.5" />
          </svg>
        </div>
        <h3 className="text-lg sm:text-xl font-black text-amber-950">这个小游戏正在做最后准备</h3>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
          「朋友问起我的家」需要大人们做好最后的安全检查，并在爸爸妈妈陪伴下一起玩。现在可以先回小岛去呼吸角、晴雨气象台或做一件找回勇气的小事哦！
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExitGame}
            className="min-h-[56px] px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm transition-colors cursor-pointer shadow-sm flex items-center justify-center"
          >
            回小岛玩其他活动
          </button>
          <button
            type="button"
            onClick={handleRequestAdultPreview}
            className="min-h-[48px] px-5 py-2.5 bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 font-bold rounded-2xl text-xs transition-colors cursor-pointer flex items-center justify-center"
          >
            家长 / 审阅人验证预览
          </button>
        </div>
        <ParentGateModal
          isOpen={isParentGateOpen}
          onClose={() => setIsParentGateOpen(false)}
          onSuccess={() => {
            setIsParentGateOpen(false);
            const token = issueAdultPreviewSession(SCOPE_KEY);
            setLocalSessionToken(token || null);
          }}
        />
      </div>
    );
  }

  const composedOption = getComposedOptionForCurrentRound();

  return (
    <div
      data-testid="friend-asks-home-game"
      className="w-full min-w-0 max-w-4xl mx-auto bg-rose-50/40 rounded-3xl border-2 border-rose-200 shadow-xl overflow-hidden flex flex-col my-2"
    >
      {adultPreviewUnlocked && !isApproved && (
        <div className="bg-amber-500 text-white text-xs font-black px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current shrink-0" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="break-words">⚠️ 家长与审阅人预览模式 · 请在成年人陪伴下审阅，尚未面向儿童正式开放</span>
          </div>
          <span className="bg-amber-700 px-2 py-0.5 rounded-full text-[10px] shrink-0">大人陪伴审阅</span>
        </div>
      )}

      {/* 顶部栏：温暖社交花园氛围 */}
      <div className="bg-linear-to-r from-rose-100 via-pink-100 to-amber-100 px-3 sm:px-4 py-2.5 sm:py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 border-b border-rose-200 min-w-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-rose-200/90 flex items-center justify-center shrink-0 shadow-xs text-rose-900">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className="text-base sm:text-xl font-black text-rose-950">
                朋友问起我的家 · 多轮社交剧场
              </h2>
              <span
                data-testid="friend-home-completed-count"
                className="text-[11px] bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full font-black"
              >
                已体验 {completedScenarioIds.length}/{FRIEND_HOME_SCENARIOS.length} 个情境
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-rose-800 mt-0.5 font-medium">
              怎么说、说多少、换话题、划边界或找大人，每一轮都由你做主
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExitGame}
          className="min-h-[44px] sm:min-h-[48px] px-3 sm:px-4 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-rose-200 text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center justify-center shrink-0"
          aria-label="离开游戏"
        >
          离开小岛
        </button>
      </div>

      <div className="p-2.5 sm:p-5 space-y-3 sm:space-y-4 min-w-0">
        {/* P1-C: 轻量视角选择器（不默认把当前玩家假定为“住两个家”） */}
        <div
          data-testid="friend-home-framing-selector"
          className="bg-white rounded-2xl border-2 border-amber-200/90 p-2.5 sm:p-3 shadow-2xs space-y-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <span className="text-xs font-black text-stone-800">
              🌱 选择你的体验视角（不预设你的家庭结构）：
            </span>
            <span
              data-testid="active-framing-status"
              data-framing-mode={framingMode}
              data-two-homes-configured={hasTwoHomesContext ? 'true' : 'false'}
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300"
            >
              {framingMode === 'STORY_CHILD'
                ? '故事视角：体验故事里小朋友的经历'
                : hasTwoHomesContext
                  ? '自身表达视角：已关联双家情境'
                  : '自身表达视角：默认通用家庭设定（不预设住两个家）'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              data-testid="framing-mode-STORY_CHILD"
              onClick={() => handleSelectFramingMode('STORY_CHILD')}
              className={`min-h-[44px] px-3 py-2 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                framingMode === 'STORY_CHILD'
                  ? 'bg-amber-100 border-amber-500 text-amber-950 font-black shadow-2xs'
                  : 'bg-stone-50 border-stone-200 text-stone-700 font-bold hover:border-amber-300'
              }`}
            >
              <span className="text-xs">📖 体验一个小朋友的故事</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/90 text-stone-700 shrink-0">
                故事角色
              </span>
            </button>
            <button
              type="button"
              data-testid="framing-mode-OWN_EXPRESSION"
              onClick={() => handleSelectFramingMode('OWN_EXPRESSION')}
              className={`min-h-[44px] px-3 py-2 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                framingMode === 'OWN_EXPRESSION'
                  ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-black shadow-2xs'
                  : 'bg-stone-50 border-stone-200 text-stone-700 font-bold hover:border-emerald-300'
              }`}
            >
              <span className="text-xs">🌱 练习适合我自己的表达</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/90 text-stone-700 shrink-0">
                {hasTwoHomesContext ? '双家设定' : '通用家庭设定'}
              </span>
            </button>
          </div>
        </div>

        {/* 五类同伴互动场景切换栏（切换场景保留各自进度） */}
        <div className="bg-white rounded-2xl border-2 border-rose-200/80 p-2.5 sm:p-3 shadow-xs">
          <div className="flex items-center justify-between mb-2 gap-1 flex-wrap">
            <span className="text-xs font-black text-stone-700">
              选择同伴互动情境（切换自动保留各场景进度）：
            </span>
            <span className="text-[11px] text-rose-700 font-bold">
              5 类真实社交场景
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {FRIEND_HOME_SCENARIOS.map((sc) => {
              const isSelected = sc.id === scenario.id;
              const isDone = completedScenarioIds.includes(sc.id);
              const savedProgress = scenarioStatesById[sc.id];
              const savedRound =
                savedProgress && sc.nodes[savedProgress.currentNodeId]
                  ? sc.nodes[savedProgress.currentNodeId].roundNumber
                  : 1;
              return (
                <button
                  key={sc.id}
                  type="button"
                  data-testid={`friend-scenario-tab-${sc.id}`}
                  onClick={() => handleSelectScenario(sc.id)}
                  className={`min-h-[52px] px-2.5 py-2 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-rose-100 border-rose-500 text-rose-950 shadow-xs ring-2 ring-rose-300'
                      : 'bg-stone-50 border-stone-200 hover:border-rose-300 text-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-black leading-tight">{sc.categoryBadge}</span>
                    {isDone ? (
                      <span className="text-[10px] bg-emerald-200 text-emerald-950 px-1.5 py-0.5 rounded-full font-black shrink-0">
                        已体验
                      </span>
                    ) : savedRound > 1 ? (
                      <span className="text-[10px] bg-amber-200 text-amber-950 px-1.5 py-0.5 rounded-full font-black shrink-0">
                        第{savedRound}轮
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[11px] text-stone-600 font-bold truncate mt-0.5">
                    {sc.peerName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 核心多轮对话剧场舞台 */}
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-3 sm:p-5 space-y-3.5 shadow-sm">
          {/* 顶部场景信息与轮次进度条 */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-100">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-xs font-black text-sky-900 bg-sky-100 px-2.5 py-1 rounded-full">
                {scenario.locationTag}
              </span>
              <span
                data-testid="friend-dialogue-round-badge"
                className="text-xs font-black text-rose-900 bg-rose-100 px-2.5 py-1 rounded-full"
              >
                第 {currentNode.roundNumber} 轮互动
              </span>
              {currentNode.isSafetyProtectionActive && (
                <span
                  data-testid="safety-protection-active-badge"
                  className="text-xs font-black text-white bg-rose-600 px-2.5 py-1 rounded-full"
                >
                  🛡️ 安全保护优先 · 无需说服或原谅
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {historyNodeIds.length > 1 && (
                <button
                  type="button"
                  data-testid="friend-step-back-btn"
                  onClick={handleStepBackTurn}
                  className="min-h-[42px] px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold cursor-pointer transition-colors"
                >
                  ← 返回上一句
                </button>
              )}
              <button
                type="button"
                data-testid="friend-restart-scenario-btn"
                onClick={handleRestartScenario}
                className="min-h-[42px] px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold cursor-pointer transition-colors"
              >
                重玩本场景
              </button>
            </div>
          </div>

          <p className="text-xs text-stone-600 font-medium">{adaptedContextSummary}</p>

          {/* 历史对话轨迹（当进入第 2 轮或第 3 轮时可见，体现多轮因果关系） */}
          {chosenChoiceLabels.length > 0 && (
            <div
              data-testid="friend-dialogue-history"
              className="bg-stone-50 rounded-xl border border-stone-200 p-2.5 space-y-1"
            >
              <div className="text-[11px] font-black text-stone-500">
                刚才你的表达轨迹：
              </div>
              {chosenChoiceLabels.map((lbl, idx) => (
                <div
                  key={`${idx}-${lbl}`}
                  className="text-xs font-bold text-stone-800 flex items-start gap-1.5"
                >
                  <span className="bg-rose-200 text-rose-950 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0">
                    第 {idx + 1} 轮
                  </span>
                  <span className="min-w-0 break-words">{lbl}</span>
                </div>
              ))}
            </div>
          )}

          {/* 同伴角色当前神态与对话气泡 + 孩子的边界护盾 */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 bg-linear-to-r from-amber-50/70 via-white to-rose-50/70 p-3.5 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex flex-col items-center">
                <PeerCharacterSvg
                  avatarType={scenario.peerAvatarType}
                  mood={currentNode.peerMood}
                  className="w-16 h-16 sm:w-20 sm:h-20"
                />
                <span className="text-xs font-black text-stone-800 mt-1">
                  {currentNode.speakerName}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <PrivacyBoundaryBubbleSvg
                  activeMode={lastChosenMode}
                  isSafetyAlert={Boolean(currentNode.isSafetyProtectionActive)}
                  className="w-15 h-15 sm:w-18 sm:h-18"
                />
                <span className="text-[10px] font-bold text-rose-800 mt-1">
                  {lastChosenMode
                    ? EXPRESSION_MODE_META[lastChosenMode].label
                    : '我的边界花园'}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left min-w-0 w-full">
              <div
                data-testid="peer-current-speech"
                className="text-sm sm:text-lg font-black text-stone-900 leading-snug bg-white p-3 rounded-2xl border-2 border-rose-200 shadow-2xs"
              >
                {adaptedPeerSpeech}
              </div>

              {/* P1-D: 直观同伴表情/动作/语气三维视觉观察标签 */}
              <div
                data-testid="peer-reaction-visual-cue"
                className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5"
              >
                <span className="text-[11px] font-bold bg-amber-100 text-amber-950 px-2 py-0.5 rounded-lg border border-amber-300">
                  {visualCues.expressionTag}
                </span>
                <span className="text-[11px] font-bold bg-sky-100 text-sky-950 px-2 py-0.5 rounded-lg border border-sky-300">
                  {visualCues.gestureTag}
                </span>
                <span className="text-[11px] font-bold bg-rose-100 text-rose-950 px-2 py-0.5 rounded-lg border border-rose-300">
                  {visualCues.toneTag}
                </span>
              </div>

              {/* P1-F: 390px 手机端减负——思考提示改为可折叠或语音点读，避免长段说教文字挤压首屏 */}
              <details
                data-testid="cognitive-reflection-banner"
                className="group bg-amber-50/90 border border-amber-300 rounded-xl px-3 py-1.5 text-left"
              >
                <summary className="text-xs font-black text-amber-950 cursor-pointer flex items-center justify-between gap-2 list-none">
                  <span>💡 点开看思考小锦囊（或点右侧听语音）</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      sounds.playClick();
                      speechNarrator.speak(currentNode.cognitiveReflectionNote);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 text-[11px] font-black cursor-pointer shrink-0"
                  >
                    🔊 听锦囊
                  </button>
                </summary>
                <p className="text-xs text-amber-950 font-bold mt-1.5 pt-1.5 border-t border-amber-200/80 leading-relaxed">
                  {currentNode.cognitiveReflectionNote}
                </p>
              </details>
            </div>
          </div>

          {/* P1-D 互动强化一：场景一（朋友好奇询问）专属「表达方式拼装台」 */}
          {scenario.id === 'scenario_curious_friend_pickup' &&
            !currentNode.isTerminal &&
            !endedEarlyVoluntarily && (
              <div
                data-testid="scenario1-expression-composer"
                className="bg-rose-50/80 border-2 border-rose-300 rounded-2xl p-3 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-black text-rose-950">
                    🎛️ 动手组合你的回答方式（想说多少 × 语气 × 话题/求助）：
                  </span>
                  <span className="text-[11px] font-bold text-rose-800 bg-white px-2 py-0.5 rounded-full border border-rose-200">
                    点选下方积木拼出你的回应
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* 维度 1：我想说多少 */}
                  <div className="bg-white rounded-xl p-2 border border-rose-200 space-y-1.5">
                    <div className="text-[11px] font-black text-stone-700">① 我想说多少：</div>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { id: 'DIRECT' as const, label: '💬 坦诚多说点' },
                        { id: 'PARTIAL' as const, label: '🌱 只说一点点' },
                        { id: 'HOLD' as const, label: '🛡️ 保密不聊' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          data-testid={`composer-amount-${item.id}`}
                          onClick={() => {
                            sounds.playClick();
                            setComposerAmount(item.id);
                          }}
                          className={`min-h-[36px] px-2 py-1 rounded-lg text-[11px] font-black border cursor-pointer ${
                            composerAmount === item.id
                              ? 'bg-rose-600 text-white border-rose-700'
                              : 'bg-stone-50 text-stone-700 border-stone-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 维度 2：我想用什么语气 */}
                  <div className="bg-white rounded-xl p-2 border border-rose-200 space-y-1.5">
                    <div className="text-[11px] font-black text-stone-700">② 我想用什么语气：</div>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { id: 'GENTLE' as const, label: '😊 轻松平静' },
                        { id: 'ASK_BACK' as const, label: '🤔 反问对方' },
                        { id: 'FIRM' as const, label: '🌿 温和坚定' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          data-testid={`composer-tone-${item.id}`}
                          onClick={() => {
                            sounds.playClick();
                            setComposerTone(item.id);
                          }}
                          className={`min-h-[36px] px-2 py-1 rounded-lg text-[11px] font-black border cursor-pointer ${
                            composerTone === item.id
                              ? 'bg-amber-500 text-stone-950 border-amber-600'
                              : 'bg-stone-50 text-stone-700 border-stone-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 维度 3：我想换什么话题 / 向谁求助 */}
                  <div className="bg-white rounded-xl p-2 border border-rose-200 space-y-1.5">
                    <div className="text-[11px] font-black text-stone-700">③ 话题或向谁求助：</div>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { id: 'PICKUP' as const, label: '🎒 回应接送' },
                        { id: 'PLAY_TOPIC' as const, label: '🐱 换聊橘猫/积木' },
                        { id: 'ADULT' as const, label: '🤱 找妈妈/停下' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          data-testid={`composer-topic-${item.id}`}
                          onClick={() => {
                            sounds.playClick();
                            setComposerTopic(item.id);
                          }}
                          className={`min-h-[36px] px-2 py-1 rounded-lg text-[11px] font-black border cursor-pointer ${
                            composerTopic === item.id
                              ? 'bg-sky-600 text-white border-sky-700'
                              : 'bg-stone-50 text-stone-700 border-stone-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {composedOption && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-rose-200">
                    <div className="text-xs font-bold text-stone-800 min-w-0">
                      <span className="text-rose-700 font-black">拼出的回应：</span>
                      {adaptTextForFraming(
                        composedOption.childSpokenText,
                        framingMode,
                        hasTwoHomesContext
                      )}
                    </div>
                    <button
                      type="button"
                      data-testid="apply-composed-expression-btn"
                      onClick={() => handleSelectTurnOption(composedOption)}
                      className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shrink-0 cursor-pointer shadow-2xs"
                    >
                      ✨ 用这句回应小明
                    </button>
                  </div>
                )}
              </div>
            )}

          {/* P1-D 互动强化二：场景二（同学反复追问隐私）专属「表达边界 → 观察同伴反应 → 决定是否继续」三步台 */}
          {scenario.id === 'scenario_probing_classmate_drawing' &&
            !currentNode.isTerminal &&
            !endedEarlyVoluntarily && (
              <div
                data-testid="scenario2-boundary-loop-panel"
                className="bg-indigo-50/80 border-2 border-indigo-300 rounded-2xl p-3 space-y-2"
              >
                <div className="text-xs sm:text-sm font-black text-indigo-950">
                  🛡️ 边界守护三步法（观察豆豆反应，决定要不要继续聊）：
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div
                    className={`p-2 rounded-xl border text-[11px] font-black ${
                      currentNode.roundNumber === 1
                        ? 'bg-indigo-600 text-white border-indigo-700'
                        : 'bg-white text-indigo-900 border-indigo-200'
                    }`}
                  >
                    ① 表达我的边界
                  </div>
                  <div
                    className={`p-2 rounded-xl border text-[11px] font-black ${
                      currentNode.roundNumber >= 2
                        ? 'bg-amber-500 text-stone-950 border-amber-600'
                        : 'bg-white text-stone-700 border-indigo-200'
                    }`}
                  >
                    ② 观察豆豆表情语气
                  </div>
                  <div
                    className={`p-2 rounded-xl border text-[11px] font-black ${
                      currentNode.roundNumber >= 2
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-white text-stone-700 border-indigo-200'
                    }`}
                  >
                    ③ 决定继续/换座/找老师
                  </div>
                </div>
              </div>
            )}

          {/* 如果孩子主动点击了“随时停下对话”，展示正向肯定 */}
          {endedEarlyVoluntarily ? (
            <div
              data-testid="voluntary-pause-affirmation"
              className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 space-y-3"
            >
              <h3 className="text-base sm:text-lg font-black text-emerald-950">
                🌟 你成功使用了「暂停对话」的权利！
              </h3>
              <p className="text-xs sm:text-sm text-emerald-900 font-bold leading-relaxed">
                在任何时候，只要你觉得不想继续回答或者想安静待一会儿，都可以停下对话。这不是逃避，也不是失败，而是你懂得保护自己的心！
              </p>
              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleRestartScenario}
                  className="min-h-[48px] px-4 py-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-950 border border-emerald-400 text-xs sm:text-sm font-black cursor-pointer"
                >
                  试试这个情境的其他回应方式
                </button>
              </div>
            </div>
          ) : !currentNode.isTerminal ? (
            /* 当前轮次可选的不同表达方式卡片（精简文字密度，突出4大核心动作） */
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-black text-stone-900">
                  第 {currentNode.roundNumber} 轮回应选择（选你觉得最舒服的方式）：
                </h3>
                <button
                  type="button"
                  data-testid="pause-conversation-anytime-btn"
                  onClick={handlePauseConversationAnytime}
                  className="min-h-[42px] px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 text-xs font-black cursor-pointer transition-colors"
                >
                  ✋ 我不想聊了，现在暂停对话
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(currentNode.options || []).map((opt) => {
                  const meta = EXPRESSION_MODE_META[opt.mode];
                  const isHighlightedByComposer =
                    scenario.id === 'scenario_curious_friend_pickup' &&
                    composedOption?.id === opt.id;
                  const adaptedOptionSpoken = adaptTextForFraming(
                    opt.childSpokenText,
                    framingMode,
                    hasTwoHomesContext
                  );
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      data-testid={`dialogue-option-${opt.id}`}
                      data-expression-mode={opt.mode}
                      onClick={() => handleSelectTurnOption(opt)}
                      className={`min-h-[60px] p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between shadow-2xs ${
                        isHighlightedByComposer
                          ? 'border-rose-500 bg-rose-50/70 ring-2 ring-rose-300'
                          : 'border-stone-200 bg-white hover:border-rose-400 hover:bg-rose-50/40'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${meta.badgeColor}`}
                          >
                            {meta.label} · {meta.shortTag}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-black text-stone-900 leading-snug">
                          {adaptedOptionSpoken}
                        </p>
                      </div>
                      <p className="text-[11px] text-stone-500 font-medium mt-1.5 pt-1 border-t border-stone-100">
                        💡 {opt.innerThoughtHint}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* 当前场景多轮对话结束总结与切换入口 */
            <div
              data-testid="friend-scenario-terminal-card"
              className="bg-emerald-50/90 border-2 border-emerald-400 rounded-2xl p-4 sm:p-5 space-y-3"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-base sm:text-lg font-black text-emerald-950">
                  ✨ 本轮社交情境体验完成！
                </h3>
                <span className="text-xs bg-emerald-200 text-emerald-950 px-3 py-1 rounded-full font-black">
                  小岛伙伴已记住你的真实完成
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-900 font-bold leading-relaxed">
                {currentNode.cognitiveReflectionNote}
              </p>
              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  type="button"
                  data-testid="retry-different-expression-btn"
                  onClick={handleRestartScenario}
                  className="min-h-[48px] px-4 py-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-950 border border-emerald-400 text-xs sm:text-sm font-black cursor-pointer"
                >
                  换一种表达方式再试一次
                </button>
                {FRIEND_HOME_SCENARIOS.map((sc) =>
                  sc.id !== scenario.id ? (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => handleSelectScenario(sc.id)}
                      className="min-h-[48px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black cursor-pointer"
                    >
                      去体验：{sc.categoryBadge}
                    </button>
                  ) : null
                ).slice(0, 2)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
