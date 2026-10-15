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
} from '../../../domain/cognitive/productExperienceMetrics';
import { ParentGateModal } from '../../ParentGateModal';

const SCOPE_KEY = 'game_friend_asks_home';

interface Props {
  onExit: () => void;
  isAdultPreview?: boolean;
  previewSessionToken?: string | null;
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
    <svg viewBox="0 0 88 88" className={className} aria-hidden="true" fill="none">
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
          {/* 上衣 */}
          <path d="M24 72C26 57 62 57 64 72" fill={shirtFill} stroke="#1E293B" strokeWidth="1.8" />
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

  // 从端侧指标恢复上次退出时的会话状态（支持随时退出恢复 + 重新尝试）
  const initialSavedState = getProductExperienceMetrics().friendHomeSessionState;
  const initialScenario = getFriendHomeScenarioById(
    initialSavedState?.activeScenarioId || FRIEND_HOME_SCENARIOS[0].id
  );
  const initialNodeId =
    initialSavedState &&
    initialSavedState.activeScenarioId === initialScenario.id &&
    initialScenario.nodes[initialSavedState.currentNodeId]
      ? initialSavedState.currentNodeId
      : initialScenario.initialNodeId;

  const [activeScenarioId, setActiveScenarioId] = useState<string>(initialScenario.id);
  const [currentNodeId, setCurrentNodeId] = useState<string>(initialNodeId);
  const [historyNodeIds, setHistoryNodeIds] = useState<string[]>(
    initialSavedState && initialSavedState.activeScenarioId === initialScenario.id
      ? initialSavedState.historyNodeIds
      : [initialScenario.initialNodeId]
  );
  const [chosenExpressionModes, setChosenExpressionModes] = useState<ExpressionMode[]>(
    (initialSavedState?.chosenExpressionModes as ExpressionMode[]) || []
  );
  const [chosenChoiceLabels, setChosenChoiceLabels] = useState<string[]>(
    initialSavedState?.chosenChoiceLabels || []
  );
  const [endedEarlyVoluntarily, setEndedEarlyVoluntarily] = useState<boolean>(false);
  const [completedScenarioIds, setCompletedScenarioIds] = useState<string[]>(
    () => getProductExperienceMetrics().completedFriendHomeScenarioIds
  );

  const scenario = getFriendHomeScenarioById(activeScenarioId);
  const currentNode = scenario.nodes[currentNodeId] || scenario.nodes[scenario.initialNodeId];
  const lastChosenMode =
    chosenExpressionModes.length > 0
      ? chosenExpressionModes[chosenExpressionModes.length - 1]
      : null;

  // 语音播报开场
  useEffect(() => {
    if (!isApproved && !adultPreviewUnlocked) return;
    speechNarrator.speak(
      `${scenario.title}。${currentNode.speakerName}说：${currentNode.peerSpokenText} 你想怎么回应呢？怎么说、说多少或者停下对话，都由你决定。`
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
    latestMode?: ExpressionMode,
    latestSpokenText?: string
  ) => {
    const targetScenario = getFriendHomeScenarioById(nextScenarioId);
    const modeLabel = latestMode ? EXPRESSION_MODE_META[latestMode].label : '自主边界表达';
    const updated = recordFriendHomeSessionProgress(
      {
        activeScenarioId: nextScenarioId,
        currentNodeId: nextNodeId,
        historyNodeIds: nextHistory,
        chosenExpressionModes: nextModes,
        chosenChoiceLabels: nextLabels,
        isCompleted,
      },
      latestMode
        ? {
            gameId: 'friend_asks_home',
            scenarioTitle: targetScenario.title,
            childChoiceSummary: `在「${targetScenario.title}」选择了【${modeLabel}】`,
            companionReactionText: `我记得你在「${targetScenario.title}」里用了「${modeLabel}」(${latestSpokenText?.slice(0, 18) || ''}…)，守护让自己舒服的边界真棒！`,
            updatedAt: new Date().toISOString(),
          }
        : undefined
    );
    setCompletedScenarioIds(updated.completedFriendHomeScenarioIds);
  };

  // 选择切换五类同伴场景
  const handleSelectScenario = (nextScenarioId: string) => {
    sounds.playClick();
    const nextScenario = getFriendHomeScenarioById(nextScenarioId);
    const startNodeId = nextScenario.initialNodeId;
    setActiveScenarioId(nextScenario.id);
    setCurrentNodeId(startNodeId);
    setHistoryNodeIds([startNodeId]);
    setChosenExpressionModes([]);
    setChosenChoiceLabels([]);
    setEndedEarlyVoluntarily(false);

    syncSessionToStorage(nextScenario.id, startNodeId, [startNodeId], [], [], false);
  };

  // 选择某一轮的表达方式并推进多轮对话
  const handleSelectTurnOption = (option: DialogueTurnOption) => {
    sounds.playClick();
    setEndedEarlyVoluntarily(false);
    const nextNode = scenario.nodes[option.nextNodeId] || currentNode;
    const nextHistory = [...historyNodeIds, nextNode.nodeId];
    const nextModes = [...chosenExpressionModes, option.mode];
    const nextLabels = [
      ...chosenChoiceLabels,
      `${EXPRESSION_MODE_META[option.mode].label}：${option.childSpokenText}`,
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
      option.mode,
      option.childSpokenText
    );

    speechNarrator.speak(`${nextNode.peerSpokenText} ${nextNode.cognitiveReflectionNote}`);
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

    syncSessionToStorage(scenario.id, prevNodeId, nextHistory, nextModes, nextLabels, false);
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

    syncSessionToStorage(scenario.id, startNodeId, [startNodeId], [], [], false);
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

      {/* 顶部栏：与侦探工作台完全不同的温暖社交花园氛围 */}
      <div className="bg-linear-to-r from-rose-100 via-pink-100 to-amber-100 px-3 sm:px-4 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 border-b border-rose-200 min-w-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-rose-200/90 flex items-center justify-center shrink-0 shadow-xs text-rose-900">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className="text-base sm:text-2xl font-black text-rose-950">
                朋友问起我的家 · 多轮社交剧场
              </h2>
              <span className="text-[11px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full font-bold">
                成年人陪伴共玩场景
              </span>
              <span
                data-testid="friend-home-completed-count"
                className="text-[11px] bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full font-black"
              >
                已体验 {completedScenarioIds.length}/{FRIEND_HOME_SCENARIOS.length} 个情境
              </span>
            </div>
            <p className="text-xs text-rose-800 mt-0.5 font-medium">
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

      <div className="p-2.5 sm:p-5 space-y-3.5 sm:space-y-4 min-w-0">
        {/* 五类同伴互动场景切换栏 */}
        <div className="bg-white rounded-2xl border-2 border-rose-200/80 p-3 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-stone-700">
              选择不同同伴互动情境（共 5 类真实社交场景）：
            </span>
            <span className="text-[11px] text-rose-700 font-bold">
              可随时切换或退出恢复
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {FRIEND_HOME_SCENARIOS.map((sc) => {
              const isSelected = sc.id === scenario.id;
              const isDone = completedScenarioIds.includes(sc.id);
              return (
                <button
                  key={sc.id}
                  type="button"
                  data-testid={`friend-scenario-tab-${sc.id}`}
                  onClick={() => handleSelectScenario(sc.id)}
                  className={`min-h-[52px] px-3 py-2 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-rose-100 border-rose-500 text-rose-950 shadow-xs ring-2 ring-rose-300'
                      : 'bg-stone-50 border-stone-200 hover:border-rose-300 text-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-black leading-tight">{sc.categoryBadge}</span>
                    {isDone && (
                      <span className="text-[10px] bg-emerald-200 text-emerald-950 px-1.5 py-0.5 rounded-full font-black shrink-0">
                        已体验
                      </span>
                    )}
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
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-4 sm:p-5 space-y-4 shadow-sm">
          {/* 顶部场景信息与轮次进度条 */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-sky-900 bg-sky-100 px-3 py-1 rounded-full">
                {scenario.locationTag}
              </span>
              <span
                data-testid="friend-dialogue-round-badge"
                className="text-xs font-black text-rose-900 bg-rose-100 px-3 py-1 rounded-full"
              >
                第 {currentNode.roundNumber} 轮互动
              </span>
              {currentNode.isSafetyProtectionActive && (
                <span
                  data-testid="safety-protection-active-badge"
                  className="text-xs font-black text-white bg-rose-600 px-3 py-1 rounded-full"
                >
                  🛡️ 安全保护优先 · 无需说服或原谅
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {historyNodeIds.length > 1 && (
                <button
                  type="button"
                  data-testid="friend-step-back-btn"
                  onClick={handleStepBackTurn}
                  className="min-h-[44px] px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold cursor-pointer transition-colors"
                >
                  ← 返回上一句重选
                </button>
              )}
              <button
                type="button"
                data-testid="friend-restart-scenario-btn"
                onClick={handleRestartScenario}
                className="min-h-[44px] px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold cursor-pointer transition-colors"
              >
                换个表达重玩本场景
              </button>
            </div>
          </div>

          {/* 历史对话轨迹（当进入第 2 轮或第 3 轮时可见，体现多轮因果关系） */}
          {chosenChoiceLabels.length > 0 && (
            <div
              data-testid="friend-dialogue-history"
              className="bg-stone-50 rounded-xl border border-stone-200 p-3 space-y-1.5"
            >
              <div className="text-[11px] font-black text-stone-500">
                刚才你的表达轨迹：
              </div>
              {chosenChoiceLabels.map((lbl, idx) => (
                <div
                  key={`${idx}-${lbl}`}
                  className="text-xs font-bold text-stone-800 flex items-start gap-2"
                >
                  <span className="bg-rose-200 text-rose-950 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0">
                    第 {idx + 1} 轮你选了
                  </span>
                  <span>{lbl}</span>
                </div>
              ))}
            </div>
          )}

          {/* 同伴角色当前神态与对话气泡 + 孩子的边界护盾 */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-linear-to-r from-amber-50/70 via-white to-rose-50/70 p-4 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex flex-col items-center">
                <PeerCharacterSvg
                  avatarType={scenario.peerAvatarType}
                  mood={currentNode.peerMood}
                  className="w-18 h-18 sm:w-20 sm:h-20"
                />
                <span className="text-xs font-black text-stone-800 mt-1">
                  {currentNode.speakerName}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <PrivacyBoundaryBubbleSvg
                  activeMode={lastChosenMode}
                  isSafetyAlert={Boolean(currentNode.isSafetyProtectionActive)}
                  className="w-16 h-16 sm:w-18 sm:h-18"
                />
                <span className="text-[10px] font-bold text-rose-800 mt-1">
                  {lastChosenMode
                    ? EXPRESSION_MODE_META[lastChosenMode].label
                    : '我的边界花园'}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div
                data-testid="peer-current-speech"
                className="text-base sm:text-lg font-black text-stone-900 leading-snug bg-white p-3.5 rounded-2xl border-2 border-rose-200 shadow-2xs"
              >
                {currentNode.peerSpokenText}
              </div>
              <p className="text-xs sm:text-sm text-stone-600 font-bold">
                动作与神态：{currentNode.sceneActionNote}
              </p>
              <div
                data-testid="cognitive-reflection-banner"
                className="text-xs sm:text-sm text-amber-950 bg-amber-100/80 border border-amber-300 px-3 py-2 rounded-xl font-bold"
              >
                💡 思考小锦囊：{currentNode.cognitiveReflectionNote}
              </div>
            </div>
          </div>

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
            /* 当前轮次可选的不同表达方式卡片 */
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm sm:text-base font-black text-stone-900">
                  第 {currentNode.roundNumber} 轮：你想用哪种方式回应？（没有对错，选你觉得最舒服的）：
                </h3>
                <button
                  type="button"
                  data-testid="pause-conversation-anytime-btn"
                  onClick={handlePauseConversationAnytime}
                  className="min-h-[44px] px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 text-xs font-black cursor-pointer transition-colors"
                >
                  ✋ 我不想聊了，现在暂停对话
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(currentNode.options || []).map((opt) => {
                  const meta = EXPRESSION_MODE_META[opt.mode];
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      data-testid={`dialogue-option-${opt.id}`}
                      data-expression-mode={opt.mode}
                      onClick={() => handleSelectTurnOption(opt)}
                      className="min-h-[64px] p-4 rounded-2xl border-2 border-stone-200 bg-white hover:border-rose-400 hover:bg-rose-50/40 text-left transition-all cursor-pointer flex flex-col justify-between shadow-2xs"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${meta.badgeColor}`}
                          >
                            {meta.label} · {meta.shortTag}
                          </span>
                        </div>
                        <p className="text-sm sm:text-base font-black text-stone-900 leading-snug">
                          {opt.childSpokenText}
                        </p>
                      </div>
                      <p className="text-xs text-stone-600 font-medium mt-2 pt-1.5 border-t border-stone-100">
                        心里话：{opt.innerThoughtHint}
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
                  小岛伙伴已记住你的选择
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
