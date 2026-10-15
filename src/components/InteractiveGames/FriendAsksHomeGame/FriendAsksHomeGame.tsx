import React, { useState, useEffect } from 'react';
import {
  FRIEND_ASKS_PATHWAYS,
  SAFETY_BYPASS_ACTIONS,
  ChoicePathway,
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
} from '../../../domain/privacy/parentAccess';
import { ParentGateModal } from '../../ParentGateModal';

const SCOPE_KEY = 'game_friend_asks_home';

interface Props {
  onExit: () => void;
  isAdultPreview?: boolean;
  previewSessionToken?: string | null;
}

/**
 * 温暖心情与边界罗盘矢量组件 (Warm Visual Compass)
 */
const BoundaryCompassSvg: React.FC<{
  activePathwayKey: string;
  isSafetyMode: boolean;
  className?: string;
}> = ({ activePathwayKey, isSafetyMode, className = 'w-24 h-24' }) => {
  // 根据选中的路径计算指针角度
  let rotationDeg = 0;
  let activeColor = '#10B981'; // 默认路径 A 绿色

  if (isSafetyMode) {
    rotationDeg = 180;
    activeColor = '#E11D48';
  } else if (activePathwayKey === 'peer_clear_fact') {
    rotationDeg = 0; // 上方：客观坦诚
    activeColor = '#10B981';
  } else if (activePathwayKey === 'peer_minimal_touch') {
    rotationDeg = 90; // 右方：轻触微风
    activeColor = '#F59E0B';
  } else if (activePathwayKey === 'peer_no_answer_redirect') {
    rotationDeg = 180; // 下方：私人花园
    activeColor = '#0284C7';
  } else if (activePathwayKey === 'adult_co_regulation') {
    rotationDeg = 270; // 左方：温暖港湾
    activeColor = '#8B5CF6';
  }

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" fill="none">
      {/* 罗盘外圈 */}
      <circle cx="50" cy="50" r="46" fill="#FFFBEB" stroke="#D97706" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="41" stroke="#FDE68A" strokeWidth="1.5" strokeDasharray="3 3" />

      {/* 四个方向的温和彩色刻度扇区指示 */}
      {/* 上：阳光分享 (绿) */}
      <circle cx="50" cy="16" r="4.5" fill="#34D399" />
      {/* 右：轻触微风 (橙) */}
      <circle cx="84" cy="50" r="4.5" fill="#FBBF24" />
      {/* 下：私人空间 (蓝) */}
      <circle cx="50" cy="84" r="4.5" fill="#38BDF8" />
      {/* 左：家庭大人 (紫) */}
      <circle cx="16" cy="50" r="4.5" fill="#A78BFA" />

      {/* 旋转罗盘指针 */}
      <g transform={`rotate(${rotationDeg} 50 50)`} className="transition-transform duration-500 ease-out">
        {/* 指针箭头 */}
        <polygon points="50,20 55,50 45,50" fill={activeColor} stroke="#FFFFFF" strokeWidth="1" />
        <polygon points="50,78 54,50 46,50" fill="#9CA3AF" opacity="0.6" />
        <circle cx="50" cy="50" r="7" fill="#FFFFFF" stroke={activeColor} strokeWidth="2.5" />
        <circle cx="50" cy="50" r="3.5" fill={activeColor} />
      </g>
    </svg>
  );
};

/**
 * 绘本级原创矢量路径插画
 */
const PathwayCardSvg: React.FC<{
  pathwayKey: string;
  className?: string;
}> = ({ pathwayKey, className = 'w-8 h-8' }) => {
  switch (pathwayKey) {
    case 'peer_clear_fact':
      // 两个家与彩虹连线
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
          <circle cx="16" cy="11" r="5" fill="#FDE047" stroke="#F59E0B" strokeWidth="1.2" />
          <path d="M4 18C10 13 22 13 28 18" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="4,22 8,18 12,22" fill="#FDA4AF" stroke="#E11D48" strokeWidth="1.2" />
          <rect x="5.5" y="22" width="5" height="5" fill="#FFF1F2" stroke="#E11D48" strokeWidth="1" />
          <polygon points="20,22 24,18 28,22" fill="#7DD3FC" stroke="#0284C7" strokeWidth="1.2" />
          <rect x="21.5" y="22" width="5" height="5" fill="#F0F9FF" stroke="#0284C7" strokeWidth="1" />
        </svg>
      );
    case 'peer_minimal_touch':
      // 随风轻拂的叶子与招手
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
          <path d="M7 25C13 18 22 18 27 12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2" />
          <path d="M12 21C9 18 10 14 14 13C17 14 16 19 12 21Z" fill="#FDE68A" stroke="#D97706" strokeWidth="1.4" />
          <circle cx="21" cy="12" r="3" fill="#FBBF24" />
          <path d="M24 10L27 7M25 13L28 13" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'peer_no_answer_redirect':
      // 快乐大滑梯与私人空间
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
          <line x1="6" y1="26" x2="6" y2="10" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
          <line x1="6" y1="13" x2="10" y2="13" stroke="#0284C7" strokeWidth="1.5" />
          <path d="M6 10C12 10 16 20 26 26" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
          <circle cx="23" cy="12" r="3.5" fill="#F43F5E" />
          <path d="M21 19C23 18 25 18 27 20" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'adult_co_regulation':
      // 温暖大手牵小手
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
          <path
            d="M16 8C13 5 9 6.5 9 10C9 14.5 16 19 16 19C16 19 23 14.5 23 10C23 6.5 19 5 16 8Z"
            fill="#DDD6FE"
            stroke="#7C3AED"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M12 22C12 20 14 19 16 19C18 19 20 20 20 22V27H12V22Z" fill="#C4B5FD" stroke="#6D28D9" strokeWidth="1.4" />
          <circle cx="16" cy="14" r="2" fill="#7C3AED" />
        </svg>
      );
    default:
      return null;
  }
};

/**
 * 安全动作专属图标
 */
const SafetyActionSvg: React.FC<{
  actionId: string;
  className?: string;
}> = ({ actionId, className = 'w-7 h-7' }) => {
  switch (actionId) {
    case 'say_stop_firmly':
      // 坚决制止手势
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
          <circle cx="16" cy="16" r="13" fill="#FEE2E2" stroke="#EF4444" strokeWidth="2" />
          <rect x="13.5" y="8" width="5" height="11" rx="2" fill="#DC2626" />
          <circle cx="16" cy="23" r="2.2" fill="#DC2626" />
        </svg>
      );
    case 'report_to_teacher':
      // 信任老师 / 求助哨声
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
          <circle cx="16" cy="16" r="13" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
          <path d="M12 18V13C12 10.8 13.8 9 16 9C18.2 9 20 10.8 20 13V18" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
          <path d="M10 18H22L20 21H12L10 18Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.2" />
          <circle cx="16" cy="23.5" r="1.5" fill="#B45309" />
        </svg>
      );
    case 'walk_away_to_safety':
    default:
      // 迈开步子走向安全区域
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
          <circle cx="16" cy="16" r="13" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
          <path d="M10 24L14 17L18 19L22 12" stroke="#0284C7" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="21" cy="9" r="2.5" fill="#0369A1" />
        </svg>
      );
  }
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
  const adultPreviewUnlocked = isAdultPreviewSessionValid(SCOPE_KEY, effectiveToken);
  const isApproved = ContentAuditRegistry.canRenderContent('game_friend_asks_home');

  // 当前选择的路径 Key
  const [selectedPathwayKey, setSelectedPathwayKey] = useState<string>('peer_clear_fact');
  // 模拟演练的同伴反应反馈展示
  const [currentOutcome, setCurrentOutcome] = useState<ChoicePathway['outcome']>(
    FRIEND_ASKS_PATHWAYS['peer_clear_fact'].outcome
  );

  // 安全模式状态 (遭遇嘲笑时激活)
  const [isSafetyModeActive, setIsSafetyModeActive] = useState<boolean>(false);
  const [safetyActionTaken, setSafetyActionTaken] = useState<string | null>(null);

  // 初始化与清理
  useEffect(() => {
    speechNarrator.speak(
      '校门口放学时，同学好奇地问：“为什么你爸爸妈妈不一起接你呀？”别着急，怎么说、跟谁说，完全由你决定。'
    );
    return () => {
      speechNarrator.stop();
    };
  }, []);

  const handleSelectPathway = (pathwayKey: string) => {
    sounds.playClick();
    setSelectedPathwayKey(pathwayKey);
    const pw = FRIEND_ASKS_PATHWAYS[pathwayKey];
    if (pw) {
      setCurrentOutcome(pw.outcome);
      if (pw.outcome.isBoundaryTriggered) {
        setIsSafetyModeActive(true);
        setSafetyActionTaken(null);
        speechNarrator.speak(
          '注意：遇到起哄和嘲笑时，我们绝对不需要忍受。请立刻使用安全保护行动！'
        );
      } else {
        setIsSafetyModeActive(false);
        speechNarrator.speak(pw.outcome.peerSpokenText);
      }
    }
  };

  const handleTriggerBullyingSimulation = () => {
    handleSelectPathway('peer_bullying_encounter');
  };

  const handleExecuteSafetyAction = (actionId: string, spokenText: string) => {
    sounds.playClick();
    setSafetyActionTaken(actionId);
    speechNarrator.speak(spokenText);
  };

  const handleResetDecision = () => {
    sounds.playClick();
    setSelectedPathwayKey('peer_clear_fact');
    setCurrentOutcome(FRIEND_ASKS_PATHWAYS['peer_clear_fact'].outcome);
    setIsSafetyModeActive(false);
    setSafetyActionTaken(null);
    speechNarrator.speak('我们重新想一想，换一种你觉得最舒服的方式回答。');
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
      <div data-testid="audit-gate-blocked" className="p-6 sm:p-8 bg-amber-50 rounded-3xl border-2 border-amber-200 text-stone-800 text-center space-y-4 my-4 max-w-xl mx-auto">
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
    <div className="w-full max-w-4xl mx-auto bg-stone-50 rounded-3xl border-2 border-stone-200 shadow-xl overflow-hidden flex flex-col my-2">
      {adultPreviewUnlocked && !isApproved && (
        <div className="bg-amber-500 text-white text-xs font-black px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current shrink-0" aria-hidden="true">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>⚠️ 家长与审阅人预览模式 · 请在成年人陪伴下审阅，尚未面向儿童正式开放</span>
          </div>
          <span className="bg-amber-700 px-2 py-0.5 rounded-full text-[10px]">大人陪伴审阅</span>
        </div>
      )}

      {/* 顶部敏感场景警示与退出栏 */}
      <div className="bg-rose-100/90 px-4 py-3 flex items-center justify-between border-b border-rose-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-200/90 flex items-center justify-center shrink-0 shadow-xs text-rose-900">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-rose-950">
                朋友问起我的家
              </h2>
              <span className="text-xs bg-rose-200 text-rose-900 px-2.5 py-0.5 rounded-full font-bold">
                成年人陪伴共玩场景
              </span>
            </div>
            <p className="text-xs text-rose-800 mt-0.5 font-medium">
              自主决定表达深度 · 隐私自主权 · 面对恶意坚决求助
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExitGame}
          className="min-h-[48px] px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center justify-center"
          aria-label="离开游戏"
        >
          离开小岛
        </button>
      </div>

      <div className="p-3 sm:p-5 space-y-4">
        {/* 情境背景卡片 + 温暖心情罗盘 */}
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
          <div className="shrink-0 flex flex-col items-center">
            <BoundaryCompassSvg
              activePathwayKey={selectedPathwayKey}
              isSafetyMode={isSafetyModeActive}
              className="w-20 h-20 sm:w-24 sm:h-24"
            />
            <span className="text-[11px] font-bold text-stone-600 mt-1">心情与边界罗盘</span>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <span className="text-xs font-black text-sky-800 bg-sky-100 px-3 py-1 rounded-full inline-block">
              放学时间的校门口
            </span>
            <p className="text-base sm:text-lg font-black text-stone-800 leading-snug">
              同学小明好奇地问：“为什么今天是你妈妈接你？他们不一起接你吗？”
            </p>
            <p className="text-xs sm:text-sm text-stone-500 font-medium">
              小秘密：怎么回答、跟谁说、说多少，完全由你说了算！
            </p>
          </div>
        </div>

        {/* 视觉边界跳跳石 (Visual Boundary Stepping Stones) */}
        <div className="bg-amber-50/80 rounded-2xl border border-amber-200 p-3 sm:p-4">
          <div className="text-xs font-black text-stone-700 mb-2.5 flex items-center justify-between">
            <span>我的回答跳跳石：</span>
            <span className="text-stone-500 font-normal">点击步子感受不同的安全边界</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { key: 'peer_clear_fact', label: '1. 阳光如实说', desc: '客观事实' },
              { key: 'peer_minimal_touch', label: '2. 轻轻说一点', desc: '简要说明' },
              { key: 'peer_no_answer_redirect', label: '3. 换个大话题', desc: '私人空间' },
              { key: 'adult_co_regulation', label: '4. 放学问大人', desc: '温暖港湾' },
            ].map((st) => {
              const isSelected = selectedPathwayKey === st.key && !isSafetyModeActive;
              return (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => handleSelectPathway(st.key)}
                  className={`min-h-[56px] p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-center ${
                    isSelected
                      ? 'bg-amber-200 border-amber-500 shadow-sm scale-102 ring-2 ring-amber-300'
                      : 'bg-white border-stone-200 hover:border-amber-300 text-stone-700'
                  }`}
                >
                  <span className="text-xs font-black text-stone-900">{st.label}</span>
                  <span className="text-[10px] text-stone-500 font-medium">{st.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 决策操作区 (三类自主表达路径) */}
        {!isSafetyModeActive ? (
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-black text-stone-800 flex items-center justify-between">
              <span>你想怎么回应同学？（点击卡片体验不同选择）：</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 选项 1: 说明客观事实 */}
              <button
                type="button"
                onClick={() => handleSelectPathway('peer_clear_fact')}
                className={`min-h-[56px] p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${
                  selectedPathwayKey === 'peer_clear_fact'
                    ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-300'
                    : 'bg-white border-stone-200 hover:border-emerald-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <PathwayCardSvg pathwayKey="peer_clear_fact" className="w-7 h-7 shrink-0" />
                    <span className="font-black text-stone-900 text-base">路径 A · 说明客观事实</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 font-bold mb-2 leading-relaxed">
                    “他们住在不同地方，轮流来接我，他们都非常爱我。”
                  </p>
                </div>
                <span className="text-xs text-emerald-800 font-bold bg-emerald-100/80 px-2.5 py-1 rounded-lg self-start">
                  同伴反馈：理解接纳
                </span>
              </button>

              {/* 选项 2: 只说一点点 */}
              <button
                type="button"
                onClick={() => handleSelectPathway('peer_minimal_touch')}
                className={`min-h-[56px] p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${
                  selectedPathwayKey === 'peer_minimal_touch'
                    ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-300'
                    : 'bg-white border-stone-200 hover:border-amber-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <PathwayCardSvg pathwayKey="peer_minimal_touch" className="w-7 h-7 shrink-0" />
                    <span className="font-black text-stone-900 text-base">路径 B · 只说一点点</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 font-bold mb-2 leading-relaxed">
                    “他们今天有各自的工作，平时轮流来接我。”
                  </p>
                </div>
                <span className="text-xs text-amber-800 font-bold bg-amber-100/80 px-2.5 py-1 rounded-lg self-start">
                  同伴反馈：继续好奇
                </span>
              </button>

              {/* 选项 3: 暂时不回答，转移话题 */}
              <button
                type="button"
                onClick={() => handleSelectPathway('peer_no_answer_redirect')}
                className={`min-h-[56px] p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${
                  selectedPathwayKey === 'peer_no_answer_redirect'
                    ? 'bg-sky-50 border-sky-500 shadow-md ring-2 ring-sky-300'
                    : 'bg-white border-stone-200 hover:border-sky-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <PathwayCardSvg pathwayKey="peer_no_answer_redirect" className="w-7 h-7 shrink-0" />
                    <span className="font-black text-stone-900 text-base">路径 C · 换个话题玩耍</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 font-bold mb-2 leading-relaxed">
                    “我不想聊这个啦，你看那边的大滑梯，我们去玩吧！”
                  </p>
                </div>
                <span className="text-xs text-sky-800 font-bold bg-sky-100/80 px-2.5 py-1 rounded-lg self-start">
                  同伴反馈：转移注意 · 保护私密
                </span>
              </button>

              {/* 选项 4: 悄悄告诉信任的大人 */}
              <button
                type="button"
                onClick={() => handleSelectPathway('adult_co_regulation')}
                className={`min-h-[56px] p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${
                  selectedPathwayKey === 'adult_co_regulation'
                    ? 'bg-purple-50 border-purple-500 shadow-md ring-2 ring-purple-300'
                    : 'bg-white border-stone-200 hover:border-purple-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <PathwayCardSvg pathwayKey="adult_co_regulation" className="w-7 h-7 shrink-0" />
                    <span className="font-black text-stone-900 text-base">路径 D · 放学告诉家长</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 font-bold mb-2 leading-relaxed">
                    先不对同学多说，放学牵着妈妈的手商量怎么回答。
                  </p>
                </div>
                <span className="text-xs text-purple-800 font-bold bg-purple-100/80 px-2.5 py-1 rounded-lg self-start">
                  同伴反馈：大人温暖拥抱支持
                </span>
              </button>
            </div>

            {/* 特殊场景演练触发按钮：如果遇到起哄嘲笑怎么办？ */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleTriggerBullyingSimulation}
                className="w-full min-h-[56px] p-3 rounded-2xl border-2 border-rose-300 bg-rose-50/80 hover:bg-rose-100 text-rose-900 text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <SafetyActionSvg actionId="say_stop_firmly" className="w-5 h-5 shrink-0" />
                <span>如果遇到同伴起哄或嘲笑，该怎么办？（点击演练安全保护）</span>
              </button>
            </div>
          </div>
        ) : (
          /* 安全围栏触发演练模式 (Bypass to Protection) */
          <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-200 flex items-center justify-center shrink-0">
                <SafetyActionSvg actionId="say_stop_firmly" className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-rose-950">
                  安全红线警报：遭遇恶意起哄与嘲笑
                </h3>
                <p className="text-xs sm:text-sm text-rose-800 font-medium">
                  铁律：嘲笑他人家庭属于伤害边界行为。你绝对不需要忍受，更不需要原谅！
                </p>
              </div>
            </div>

            <div className="p-3 bg-white/95 rounded-xl border border-rose-200 text-xs sm:text-sm text-stone-800 font-bold">
              起哄者指手画脚：“哈哈你家真奇怪，我不跟你玩了！”
            </div>

            {/* 安全求助三动作 */}
            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-black text-rose-950">
                请选择你的安全防护动作：
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {SAFETY_BYPASS_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => handleExecuteSafetyAction(action.id, action.spokenText)}
                    className={`min-h-[56px] p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      safetyActionTaken === action.id
                        ? 'bg-rose-600 text-white border-rose-700 shadow-md font-bold'
                        : 'bg-white text-stone-800 border-rose-200 hover:border-rose-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <SafetyActionSvg actionId={action.id} className="w-6 h-6 shrink-0" />
                      <div className="font-black text-sm">{action.label}</div>
                    </div>
                    <div className={`text-[11px] leading-snug ${safetyActionTaken === action.id ? 'text-rose-100' : 'text-stone-600'}`}>
                      {action.spokenText}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {safetyActionTaken && (
              <div className="p-3.5 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-950 text-xs sm:text-sm font-black flex items-center gap-2">
                <svg viewBox="0 0 20 20" className="w-5 h-5 fill-emerald-600 shrink-0" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>你成功保护了自己！老师或安全同伴介入了支持，恶意声音被有效制止。</span>
              </div>
            )}
          </div>
        )}

        {/* 动态情节与反馈展示区 */}
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-4 sm:p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h4 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>后续的情节发展：</span>
            </h4>
            <button
              type="button"
              onClick={handleResetDecision}
              className="min-h-[48px] text-xs px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-currentColor strokeWidth-2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <span>换个决定试一试</span>
            </button>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-stone-800 text-sm leading-relaxed">
            <p className="font-black text-stone-900 mb-1">{currentOutcome.peerSpokenText}</p>
            <p className="text-stone-600 text-xs sm:text-sm font-medium">{currentOutcome.peerActionDescription}</p>
          </div>

          <div className="text-xs sm:text-sm text-stone-700 font-bold bg-amber-50/90 p-3 rounded-xl border border-amber-200">
            {currentOutcome.nextOptionsPrompt}
          </div>
        </div>
      </div>
    </div>
  );
};
