import React, { useState, useEffect } from 'react';
import {
  FRIEND_ASKS_PATHWAYS,
  SAFETY_BYPASS_ACTIONS,
  ChoicePathway,
} from '../../../domain/games/friendAsksHomeLogic';
import { ResponseTarget, DisclosureDepth } from '../../../domain/games/types';
import { sounds } from '../../../utils/sound';
import { speechNarrator } from '../../../utils/speech';

interface Props {
  onExit: () => void;
}

export const FriendAsksHomeGame: React.FC<Props> = ({ onExit }) => {
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

  return (
    <div className="w-full max-w-4xl mx-auto bg-stone-50 rounded-3xl border-2 border-stone-200 shadow-xl overflow-hidden flex flex-col my-2">
      {/* 顶部敏感场景警示与退出栏 */}
      <div className="bg-rose-100/80 px-4 py-3 flex items-center justify-between border-b border-rose-200">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">💬</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-rose-950">
                朋友问起我的家
              </h2>
              <span className="text-xs bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full font-bold">
                成年人陪伴共玩场景
              </span>
            </div>
            <p className="text-xs text-rose-800">
              自主决定表达深度 · 隐私自主权 · 面对恶意坚决求助
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExit}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-sm font-bold transition-colors"
            aria-label="离开游戏"
          >
            离开小岛
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-5 space-y-4">
        {/* 情境背景卡片 */}
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-sky-100 border-2 border-sky-300 flex items-center justify-center text-3xl shrink-0">
            🎒
          </div>
          <div className="flex-1 text-center sm:text-left space-y-1">
            <span className="text-xs font-black text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full">
              放学时间的校门口
            </span>
            <p className="text-lg sm:text-xl font-black text-stone-800">
              同学小明好奇地问：“为什么今天是你妈妈接你？他们不一起接你吗？”
            </p>
            <p className="text-xs sm:text-sm text-stone-500">
              提示：怎么回答、跟谁说、说多少，完全由你说了算。没有固定的标准答案！
            </p>
          </div>
        </div>

        {/* 决策操作区 (三类自主表达路径) */}
        {!isSafetyModeActive ? (
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-black text-stone-800 flex items-center gap-2">
              <span>你想怎么应对这个提问？（点击不同卡片，看看有什么变化）</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 选项 1: 说明客观事实 */}
              <button
                type="button"
                onClick={() => handleSelectPathway('peer_clear_fact')}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                  selectedPathwayKey === 'peer_clear_fact'
                    ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-300'
                    : 'bg-white border-stone-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-2xl" aria-hidden="true">🌱</span>
                  <span className="font-black text-stone-900 text-base">路径 A：说明客观事实</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 mb-2">
                  “他们住在不同地方，轮流来接我，他们都非常爱我。”
                </p>
                <span className="text-xs text-emerald-800 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-md self-start">
                  预期反馈：同伴理解接纳
                </span>
              </button>

              {/* 选项 2: 只说一点点 */}
              <button
                type="button"
                onClick={() => handleSelectPathway('peer_minimal_touch')}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                  selectedPathwayKey === 'peer_minimal_touch'
                    ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-300'
                    : 'bg-white border-stone-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-2xl" aria-hidden="true">🍃</span>
                  <span className="font-black text-stone-900 text-base">路径 B：只说一点点</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 mb-2">
                  “他们今天有各自的工作，平时轮流来接。”
                </p>
                <span className="text-xs text-amber-800 font-bold bg-amber-100/70 px-2 py-0.5 rounded-md self-start">
                  预期反馈：同伴可能继续好奇
                </span>
              </button>

              {/* 选项 3: 暂时不回答，转移话题 */}
              <button
                type="button"
                onClick={() => handleSelectPathway('peer_no_answer_redirect')}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                  selectedPathwayKey === 'peer_no_answer_redirect'
                    ? 'bg-sky-50 border-sky-500 shadow-md ring-2 ring-sky-300'
                    : 'bg-white border-stone-200 hover:border-sky-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-2xl" aria-hidden="true">🎠</span>
                  <span className="font-black text-stone-900 text-base">路径 C：换个话题，不说细节</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 mb-2">
                  “我不想聊这个啦，你看那边的大滑梯，我们去玩吧！”
                </p>
                <span className="text-xs text-sky-800 font-bold bg-sky-100/70 px-2 py-0.5 rounded-md self-start">
                  预期反馈：转移注意力，保护私人空间
                </span>
              </button>

              {/* 选项 4: 悄悄告诉信任的大人 */}
              <button
                type="button"
                onClick={() => handleSelectPathway('adult_co_regulation')}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                  selectedPathwayKey === 'adult_co_regulation'
                    ? 'bg-purple-50 border-purple-500 shadow-md ring-2 ring-purple-300'
                    : 'bg-white border-stone-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-2xl" aria-hidden="true">🤝</span>
                  <span className="font-black text-stone-900 text-base">路径 D：放学私下告诉家长</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 mb-2">
                  先不对同学多说，放学牵着妈妈的手商量怎么回答。
                </p>
                <span className="text-xs text-purple-800 font-bold bg-purple-100/70 px-2 py-0.5 rounded-md self-start">
                  预期反馈：大人温暖拥抱支持
                </span>
              </button>
            </div>

            {/* 特殊场景演练触发按钮：如果遇到起哄嘲笑怎么办？ */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTriggerBullyingSimulation}
                className="w-full p-3 rounded-xl border border-rose-300 bg-rose-50/70 hover:bg-rose-100 text-rose-900 text-sm font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <span>⚠️ 如果遇到同伴起哄或嘲笑，该怎么办？（点击演练安全保护）</span>
              </button>
            </div>
          </div>
        ) : (
          /* 安全围栏触发演练模式 (Bypass to Protection) */
          <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl" aria-hidden="true">🛑</span>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-rose-950">
                  安全红线警报：遭遇恶意起哄与嘲笑
                </h3>
                <p className="text-xs sm:text-sm text-rose-800">
                  铁律：嘲笑他人家庭属于伤害边界行为。你绝对不需要忍受，更不需要原谅！
                </p>
              </div>
            </div>

            <div className="p-3 bg-white/90 rounded-xl border border-rose-200 text-sm text-stone-800">
              起哄者指手画脚：“哈哈你家真奇怪，我不跟你玩了！”
            </div>

            {/* 安全求助三动作 */}
            <div className="space-y-2">
              <p className="text-sm font-bold text-rose-950">
                请选择你的安全防护动作：
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {SAFETY_BYPASS_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => handleExecuteSafetyAction(action.id, action.spokenText)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      safetyActionTaken === action.id
                        ? 'bg-rose-600 text-white border-rose-700 shadow-md scale-102 font-bold'
                        : 'bg-white text-stone-800 border-rose-200 hover:border-rose-400'
                    }`}
                  >
                    <div className="text-2xl mb-1" aria-hidden="true">{action.icon}</div>
                    <div className="font-black text-sm">{action.label}</div>
                    <div className={`text-xs mt-1 line-clamp-2 ${safetyActionTaken === action.id ? 'text-rose-100' : 'text-stone-500'}`}>
                      {action.spokenText}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {safetyActionTaken && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-sm font-bold flex items-center gap-2">
                <span>🛡️ 你成功保护了自己！老师或安全同伴介入了支持，恶意声音被有效制止。</span>
              </div>
            )}
          </div>
        )}

        {/* 动态情节与反馈展示区 */}
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-4 sm:p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h4 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
              <span>{currentOutcome.expressionEmoji}</span>
              <span>情节后续发生：</span>
            </h4>
            <button
              type="button"
              onClick={handleResetDecision}
              className="text-xs px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition-colors"
            >
              🔄 换个决定试一试
            </button>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-stone-800 text-sm sm:text-base leading-relaxed">
            <p className="font-bold mb-1">{currentOutcome.peerSpokenText}</p>
            <p className="text-stone-600 text-xs sm:text-sm">{currentOutcome.peerActionDescription}</p>
          </div>

          <div className="text-xs sm:text-sm text-stone-700 font-medium bg-amber-50/80 p-2.5 rounded-lg border border-amber-200">
            {currentOutcome.nextOptionsPrompt}
          </div>
        </div>
      </div>
    </div>
  );
};
