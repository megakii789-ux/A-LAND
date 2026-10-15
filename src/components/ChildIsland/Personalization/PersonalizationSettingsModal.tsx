import React, { useState } from 'react';
import { X, Volume2, RotateCcw, Trash2, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  AnimalCompanionId,
  InterestActivityId,
  InteractionStyle,
  ANIMAL_COMPANIONS,
  INTEREST_ACTIVITIES,
  AGE_BAND_DEFINITIONS,
  getAgeTierAuditSummary,
  PersonalizationProfile
} from '../../../domain/personalization';
import { sounds } from '../../../utils/sound';
import { speechNarrator } from '../../../utils/speech';
import { CompanionAvatarSvg, InterestBadgeSvg } from '../CompanionIcons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PersonalizationSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    personalization,
    updatePersonalization,
    resetPersonalization,
    clearAllPersonalization,
    revokePersonalizationConsent
  } = useApp();

  const [activeTab, setActiveTab] = useState<'preferences' | 'accessibility' | 'privacy'>('preferences');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCompanion = ANIMAL_COMPANIONS[personalization.companionId] || ANIMAL_COMPANIONS.guoguo_squirrel;

  const handleCompanionSelect = (id: AnimalCompanionId) => {
    const companion = ANIMAL_COMPANIONS[id];
    speechNarrator.syncWithCompanion(id);
    updatePersonalization({ companionId: id });
    speechNarrator.speak(`你好呀！我是你的小岛伙伴${companion.name}。${companion.greetingText}`);
    showFeedback(`已选择伙伴：${companion.name}`);
  };

  const handleInterestSelect = (id: InterestActivityId) => {
    sounds.playCardSelect();
    const interest = INTEREST_ACTIVITIES[id];
    updatePersonalization({ primaryInterest: id });
    speechNarrator.speak(`太棒啦，接下来侦探小游戏会优先为你准备${interest.label}的主题场景！`);
    showFeedback(`已切换兴趣场景：${interest.label}`);
  };

  const handleStyleSelect = (style: InteractionStyle) => {
    sounds.playCardSelect();
    updatePersonalization({ interactionStyle: style });
    const text = style === 'hands_on' ? '喜欢直接动手操作' : '喜欢先听小故事';
    speechNarrator.speak(text);
    showFeedback(`已更新为：${text}`);
  };

  const handleToggleVoice = () => {
    sounds.playTap();
    const nextVal = !personalization.accessibility.voiceEnabled;
    speechNarrator.setVoiceEnabled(nextVal);
    updatePersonalization({
      accessibility: {
        ...personalization.accessibility,
        voiceEnabled: nextVal,
      },
    });
    if (nextVal) {
      speechNarrator.speak('语音提示已开启');
    }
    showFeedback(nextVal ? '已开启语音引导' : '已关闭语音引导');
  };

  const handleToggleReducedMotion = () => {
    sounds.playClick();
    const nextVal = !personalization.accessibility.reducedMotion;
    updatePersonalization({
      accessibility: {
        ...personalization.accessibility,
        reducedMotion: nextVal,
      },
    });
    showFeedback(nextVal ? '已开启减少动效模式' : '已恢复标准动效');
  };

  const handleToggleSimplifiedText = () => {
    sounds.playClick();
    const nextVal = !personalization.accessibility.simplifiedText;
    updatePersonalization({
      accessibility: {
        ...personalization.accessibility,
        simplifiedText: nextVal,
      },
    });
    showFeedback(nextVal ? '已开启超简短文字说明' : '已恢复常规文字说明');
  };

  const handleResetToDefault = () => {
    sounds.playClick();
    resetPersonalization();
    speechNarrator.speak('偏好已恢复为初始状态。');
    showFeedback('已恢复默认设置');
  };

  const handleClearAll = () => {
    sounds.playClick();
    clearAllPersonalization();
    setShowClearConfirm(false);
    speechNarrator.speak('已彻底清除本地保存的偏好，恢复无痕状态。');
    showFeedback('已彻底清除全部偏好数据');
  };

  const handleRevokeConsent = () => {
    sounds.playClick();
    revokePersonalizationConsent();
    showFeedback('已撤回本地存储许可，偏好仅在本次会话生效');
  };

  const showFeedback = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => {
      setFeedbackNotice(null);
    }, 2800);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="儿童受控个性化偏好设置"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-stone-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* 顶部标题栏 */}
        <div className="bg-amber-100/90 px-4 sm:px-6 py-4 flex items-center justify-between border-b border-amber-200">
          <div className="flex items-center gap-3">
            <CompanionAvatarSvg companionId={currentCompanion.id} className="w-10 h-10 shrink-0" />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-950">
                我的小岛偏好
              </h2>
              <p className="text-xs sm:text-sm text-amber-800 font-medium">
                选择喜欢的伙伴与探索方式 · 随时可改 · 仅保存在本机
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              speechNarrator.stop();
              onClose();
            }}
            className="w-14 h-14 rounded-2xl bg-white/80 hover:bg-white text-stone-700 flex items-center justify-center shadow-xs cursor-pointer border border-amber-200 shrink-0"
            aria-label="关闭设置面板"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 选项卡切换 */}
        <div
          role="tablist"
          aria-label="设置类别"
          className="flex border-b border-stone-200 bg-stone-50 px-2.5 sm:px-6 gap-1.5 sm:gap-2 pt-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'preferences'}
            onClick={() => setActiveTab('preferences')}
            className={`min-h-[56px] px-2.5 sm:px-4 py-2 text-xs sm:text-base font-bold rounded-t-2xl border-t-2 border-x-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'preferences'
                ? 'bg-white border-stone-200 text-stone-900 border-b-white z-10'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <CompanionAvatarSvg companionId={currentCompanion.id} className="w-5 h-5 shrink-0" />
            <span>伙伴与兴趣</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'accessibility'}
            onClick={() => setActiveTab('accessibility')}
            className={`min-h-[56px] px-2.5 sm:px-4 py-2 text-xs sm:text-base font-bold rounded-t-2xl border-t-2 border-x-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'accessibility'
                ? 'bg-white border-stone-200 text-stone-900 border-b-white z-10'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Volume2 className="w-4 h-4 text-amber-700 shrink-0" />
            <span>语音与操作</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'privacy'}
            onClick={() => setActiveTab('privacy')}
            className={`min-h-[56px] px-2.5 sm:px-4 py-2 text-xs sm:text-base font-bold rounded-t-2xl border-t-2 border-x-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'bg-white border-stone-200 text-stone-900 border-b-white z-10'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>隐私与重置</span>
          </button>
        </div>

        {/* 提示消息浮条 */}
        {feedbackNotice && (
          <div className="bg-emerald-100 text-emerald-900 px-4 py-2 text-sm font-bold flex items-center justify-between border-b border-emerald-200 animate-fade-in">
            <span>✨ {feedbackNotice}</span>
            <button
              type="button"
              onClick={() => setFeedbackNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 p-1"
              aria-label="关闭提示"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 内容滚动区 */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-stone-800">
          {/* TAB 1: 伙伴与兴趣 */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              {/* 1. 选择喜欢的动物伙伴 */}
              <section aria-labelledby="heading-companion">
                <div className="flex items-center justify-between mb-3">
                  <h3 id="heading-companion" className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
                    <span>1. 选择你的中性小岛伙伴</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => speechNarrator.speak('选择你喜欢的动物伙伴，它们会陪你一起在小岛上探索。')}
                    className="p-1 text-stone-500 hover:text-stone-800"
                    aria-label="朗读伙伴选择说明"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(Object.keys(ANIMAL_COMPANIONS) as AnimalCompanionId[]).map((cId) => {
                    const comp = ANIMAL_COMPANIONS[cId];
                    const isSelected = personalization.companionId === cId;
                    return (
                      <button
                        key={cId}
                        type="button"
                        onClick={() => handleCompanionSelect(cId)}
                        className={`min-h-[100px] p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative ${
                          isSelected
                            ? `${comp.themeColorBg} ${comp.themeColorBorder} shadow-md scale-[1.02]`
                            : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                        }`}
                        aria-pressed={isSelected}
                        aria-label={`选择伙伴：${comp.name} ${comp.animal}，特点：${comp.traitDescription}`}
                      >
                        {isSelected && (
                          <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                            <Check className="w-4 h-4" />
                          </span>
                        )}
                        <CompanionAvatarSvg companionId={cId} className="w-12 h-12 mb-1.5 drop-shadow-xs" />
                        <span className="text-base font-black text-stone-900">{comp.name}</span>
                        <span className="text-xs text-stone-600 font-medium">{comp.animal}</span>
                        <span className="text-[11px] text-stone-500 mt-1 line-clamp-1">{comp.traitDescription}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 当前伙伴招呼 */}
                <div className="mt-3 p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <CompanionAvatarSvg companionId={currentCompanion.id} className="w-9 h-9 shrink-0" />
                    <p className="text-sm text-amber-900 font-bold">
                      {currentCompanion.name}：“{currentCompanion.greetingText}”
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => speechNarrator.speak(currentCompanion.greetingText)}
                    className="p-2 text-amber-700 hover:text-amber-900 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label={`听${currentCompanion.name}说话`}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              </section>

              {/* 2. 选择喜欢的兴趣活动（决定场景皮肤） */}
              <section aria-labelledby="heading-interest">
                <div className="flex items-center justify-between mb-3">
                  <h3 id="heading-interest" className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
                    <span>2. 选择喜欢的活动（场景皮肤）</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => speechNarrator.speak('选择你喜欢的活动，例如画画、足球、小动物或者拼图。')}
                    className="p-1 text-stone-500 hover:text-stone-800"
                    aria-label="朗读兴趣选择说明"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(Object.keys(INTEREST_ACTIVITIES) as InterestActivityId[]).map((actId) => {
                    const act = INTEREST_ACTIVITIES[actId];
                    const isSelected = personalization.primaryInterest === actId;
                    return (
                      <button
                        key={actId}
                        type="button"
                        onClick={() => handleInterestSelect(actId)}
                        className={`min-h-[96px] p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-sky-50 border-sky-400 shadow-md scale-[1.02]'
                            : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                        }`}
                        aria-pressed={isSelected}
                        aria-label={`选择活动：${act.label}，对应侦探场景：${act.sceneTitle}`}
                      >
                        {isSelected && (
                          <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs">
                            <Check className="w-4 h-4" />
                          </span>
                        )}
                        <InterestBadgeSvg interestId={actId} className="w-10 h-10 mb-1.5 drop-shadow-xs" />
                        <span className="text-base font-black text-stone-900">{act.label}</span>
                        <span className="text-[11px] text-stone-500 mt-1">{act.sceneTitle}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* 3. 喜欢听故事还是动手操作 */}
              <section aria-labelledby="heading-style">
                <h3 id="heading-style" className="text-base sm:text-lg font-black text-stone-900 mb-3">
                  3. 你更喜欢哪种探索方式？
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleStyleSelect('hands_on')}
                    className={`min-h-[64px] p-4 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer ${
                      personalization.interactionStyle === 'hands_on'
                        ? 'bg-emerald-50 border-emerald-400 shadow-xs'
                        : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                    }`}
                    aria-pressed={personalization.interactionStyle === 'hands_on'}
                    aria-label="喜欢直接动手操作：大按钮、自己点一点拖一拖"
                  >
                    <span className="text-3xl" aria-hidden="true">🖐️</span>
                    <div className="text-left">
                      <div className="font-black text-stone-900 text-base">喜欢直接动手操作</div>
                      <div className="text-xs text-stone-500">点一点、拖一拖、直接找线索</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStyleSelect('story_first')}
                    className={`min-h-[64px] p-4 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer ${
                      personalization.interactionStyle === 'story_first'
                        ? 'bg-amber-50 border-amber-400 shadow-xs'
                        : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                    }`}
                    aria-pressed={personalization.interactionStyle === 'story_first'}
                    aria-label="喜欢先听小故事：伴伴先讲故事前因后果"
                  >
                    <span className="text-3xl" aria-hidden="true">📖</span>
                    <div className="text-left">
                      <div className="font-black text-stone-900 text-base">喜欢先听小故事</div>
                      <div className="text-xs text-stone-500">伴伴讲清前因后果再开始行动</div>
                    </div>
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: 语音与操作辅助开关 */}
          {activeTab === 'accessibility' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" aria-hidden="true">🔊</span>
                    <h4 className="font-black text-stone-900 text-base sm:text-lg">语音朗读与播报</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600">
                    伴伴会用语音读出所有线索和提示，不识字也能轻松探索。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`min-h-[56px] min-w-[80px] px-4 py-2 rounded-2xl font-black text-sm sm:text-base transition-colors cursor-pointer border-2 ${
                    personalization.accessibility.voiceEnabled
                      ? 'bg-emerald-500 text-white border-emerald-600'
                      : 'bg-stone-200 text-stone-700 border-stone-300'
                  }`}
                  aria-pressed={personalization.accessibility.voiceEnabled}
                  aria-label={`语音播报当前：${personalization.accessibility.voiceEnabled ? '开启' : '关闭'}`}
                >
                  {personalization.accessibility.voiceEnabled ? '已开启' : '已关闭'}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" aria-hidden="true">🍃</span>
                    <h4 className="font-black text-stone-900 text-base sm:text-lg">减少动效模式 (Reduced Motion)</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600">
                    关闭镜头摇晃、微小浮动与强烈过渡，界面更平稳护眼。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleReducedMotion}
                  className={`min-h-[56px] min-w-[80px] px-4 py-2 rounded-2xl font-black text-sm sm:text-base transition-colors cursor-pointer border-2 ${
                    personalization.accessibility.reducedMotion
                      ? 'bg-emerald-500 text-white border-emerald-600'
                      : 'bg-stone-200 text-stone-700 border-stone-300'
                  }`}
                  aria-pressed={personalization.accessibility.reducedMotion}
                  aria-label={`减少动效当前：${personalization.accessibility.reducedMotion ? '开启' : '关闭'}`}
                >
                  {personalization.accessibility.reducedMotion ? '已开启' : '已关闭'}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" aria-hidden="true">🔤</span>
                    <h4 className="font-black text-stone-900 text-base sm:text-lg">使用更简单的文字说明</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600">
                    将卡片说明精简至最核心词汇，配合大图标，降低阅读压力。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleSimplifiedText}
                  className={`min-h-[56px] min-w-[80px] px-4 py-2 rounded-2xl font-black text-sm sm:text-base transition-colors cursor-pointer border-2 ${
                    personalization.accessibility.simplifiedText
                      ? 'bg-emerald-500 text-white border-emerald-600'
                      : 'bg-stone-200 text-stone-700 border-stone-300'
                  }`}
                  aria-pressed={personalization.accessibility.simplifiedText}
                  aria-label={`更简单文字说明当前：${personalization.accessibility.simplifiedText ? '开启' : '关闭'}`}
                >
                  {personalization.accessibility.simplifiedText ? '已开启' : '已关闭'}
                </button>
              </div>

              {/* 年龄分层架构透明信息 */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <span>👶 当前运行年龄适配层：</span>
                  <span className="bg-amber-200 px-2.5 py-0.5 rounded-full text-xs">
                    {AGE_BAND_DEFINITIONS.EARLY_CHILDHOOD_5_7.ageRangeDisplay} · {AGE_BAND_DEFINITIONS.EARLY_CHILDHOOD_5_7.label}
                  </span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  本版本针对 6 岁左右儿童认知发展进行了全面适配（触控目标 &gt;= 56px、语音先行、不设倒计时）。其他年龄段已预留架构接口，未经严格验证前不开放运行。
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: 隐私与重置 */}
          {activeTab === 'privacy' && (
            <div className="space-y-5">
              {/* 隐私承诺卡片 */}
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-black text-base">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>儿童隐私与安全铁律</span>
                </div>
                <ul className="text-xs sm:text-sm text-emerald-800 space-y-1 list-disc list-inside">
                  <li><strong>默认本机运行：</strong>所有偏好仅保存在你的浏览器本地，不上传云端；</li>
                  <li><strong>不做心理画像：</strong>严禁根据兴趣或游玩记录推测心理疾病或性格；</li>
                  <li><strong>个人隐私保护：</strong>不收集真实姓名、家庭经历、学校、住址或声纹；</li>
                  <li><strong>无 AI 自由聊天：</strong>不在儿童端直接开放不受控的生成式 AI 回应。</li>
                </ul>
              </div>

              {/* 本地存储许可状态与撤回 */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-stone-900 text-base">保存在本设备存储</h4>
                    <p className="text-xs text-stone-500">
                      {personalization.consentForLocalStorage
                        ? '当前已许可保存在本机 localStorage，刷新后依然有效。'
                        : '当前已撤回本地保存许可，所有偏好仅在本次会话内存中生效。'}
                    </p>
                  </div>
                  {personalization.consentForLocalStorage ? (
                    <button
                      type="button"
                      onClick={handleRevokeConsent}
                      className="min-h-[48px] px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs sm:text-sm font-bold rounded-xl cursor-pointer"
                      aria-label="撤回本地保存许可"
                    >
                      撤回本地许可
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        updatePersonalization({ consentForLocalStorage: true });
                        showFeedback('已重新启用本地存储');
                      }}
                      className="min-h-[48px] px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer"
                      aria-label="重新启用本地存储"
                    >
                      允许保存在本机
                    </button>
                  )}
                </div>
              </div>

              {/* 操作区：重置为默认 / 彻底清除 */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="min-h-[56px] px-4 py-3 rounded-2xl border-2 border-stone-300 bg-white hover:bg-stone-100 text-stone-800 font-black text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  aria-label="恢复所有偏好为默认设置"
                >
                  <RotateCcw className="w-5 h-5 text-stone-600" />
                  <span>恢复默认设置</span>
                </button>

                {!showClearConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    className="min-h-[56px] px-4 py-3 rounded-2xl border-2 border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    aria-label="彻底清除所有偏好数据"
                  >
                    <Trash2 className="w-5 h-5 text-rose-600" />
                    <span>彻底清除数据</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="min-h-[56px] px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm sm:text-base flex items-center justify-center gap-1 cursor-pointer"
                      aria-label="确认清除所有偏好"
                    >
                      <span>确认彻底清除</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(false)}
                      className="min-h-[56px] px-3 py-2 rounded-2xl bg-stone-200 text-stone-700 font-bold text-sm cursor-pointer"
                      aria-label="取消清除"
                    >
                      取消
                    </button>
                  </div>
                )}
              </div>

              {/* 审计日志与当前匿名 ID 摘要 */}
              <div className="p-3 bg-stone-100 rounded-xl text-xs text-stone-500 font-mono space-y-1">
                <div>匿名设备标识: {personalization.pseudonymousId}</div>
                <div>当前偏好更新时间: {new Date(personalization.updatedAt).toLocaleString()}</div>
                <div>云端上传状态: 物理阻断 (Blocked / Zero Transmission)</div>
              </div>
            </div>
          )}
        </div>

        {/* 底部关闭按钮（>= 64px 核心高度） */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              speechNarrator.stop();
              onClose();
            }}
            className="w-full sm:w-auto min-h-[64px] px-8 rounded-2xl bg-amber-400 hover:bg-amber-500 text-stone-900 font-black text-lg shadow-md cursor-pointer flex items-center justify-center gap-2"
            aria-label="完成偏好设置并返回小岛"
          >
            <span>好啦，回小岛！</span>
          </button>
        </div>
      </div>
    </div>
  );
};
