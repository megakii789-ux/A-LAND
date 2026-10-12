import React, { useState, useEffect } from 'react';
import {
  Wind,
  X,
  Heart,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowLeft,
  Sun,
  ShieldCheck,
  Pause,
  Play,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/sound';
import { speechNarrator } from '../../utils/speech';
import { LocationBadgeIllustration } from './StoryGrove/StoryIllustrations';

interface CalmSpaceProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateHome?: () => void;
}

export const CalmSpace: React.FC<CalmSpaceProps> = ({
  isOpen,
  onClose,
  onNavigateHome
}) => {
  const { requestHug, isMuted, toggleMute } = useApp();

  // Breathing Rhythm State: 'inhale' (吸气) -> 'hold' (停一停) -> 'exhale' (呼气) -> 'rest' (休息)
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [theme, setTheme] = useState<'grass' | 'bear' | 'balloon'>('grass');
  const [showAdultTips, setShowAdultTips] = useState<boolean>(false);

  // Grounding sensory check state (3 Colors Grounding option)
  const [groundingColors, setGroundingColors] = useState<{ red: boolean; yellow: boolean; blue: boolean }>({
    red: false,
    yellow: false,
    blue: false
  });

  // Breathing Rhythm Timer Loop (Non-incentivized 4-2-4-2 rhythm)
  useEffect(() => {
    if (!isOpen || isPaused) return;

    let timer: NodeJS.Timeout;

    if (phase === 'inhale') {
      sounds.playBreathe(true);
      timer = setTimeout(() => setPhase('hold'), 4000);
    } else if (phase === 'hold') {
      timer = setTimeout(() => setPhase('exhale'), 2000);
    } else if (phase === 'exhale') {
      sounds.playBreathe(false);
      timer = setTimeout(() => setPhase('rest'), 4000);
    } else if (phase === 'rest') {
      timer = setTimeout(() => setPhase('inhale'), 2000);
    }

    return () => clearTimeout(timer);
  }, [isOpen, phase, isPaused]);

  if (!isOpen) return null;

  const handleSpeakGuidance = (text: string) => {
    speechNarrator.speak(text);
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return '深深吸气... 肚子鼓起来';
      case 'hold':
        return '轻轻停一停... 感觉好安静';
      case 'exhale':
        return '缓缓呼气... 把烦恼吹出去';
      case 'rest':
        return '轻松休息... 身体松松的';
    }
  };

  const getScreenReaderAnnouncement = () => {
    if (isPaused) {
      return '呼吸引导已暂停。你可以随时点击继续按钮，跟随圆圈继续呼吸。';
    }
    switch (phase) {
      case 'inhale':
        return '请跟随圆圈，慢慢吸气，肚子像气球一样鼓起来。';
      case 'hold':
        return '请跟随圆圈，轻轻停一停，保住呼吸，感觉好安静。';
      case 'exhale':
        return '请跟随圆圈，缓缓呼气，把心里的烦恼轻轻吹出去。';
      case 'rest':
        return '请跟随圆圈，轻松休息片刻，身体松松的。';
    }
  };

  const getThemeEmoji = () => {
    switch (theme) {
      case 'grass':
        return phase === 'inhale' ? '🌿' : phase === 'exhale' ? '🍃' : '🌱';
      case 'bear':
        return phase === 'inhale' ? '🐻' : phase === 'exhale' ? '😴' : '🧸';
      case 'balloon':
        return phase === 'inhale' ? '🎈' : phase === 'exhale' ? '💨' : '✨';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="冷静角落·减压空间"
      className="fixed inset-0 z-50 flex items-center justify-center bg-teal-950/60 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-300"
    >
      <div className="bg-linear-to-b from-teal-50 via-emerald-50 to-amber-50 border-2 border-teal-200/80 rounded-3xl p-5 sm:p-8 max-w-2xl w-full shadow-2xl relative my-auto text-stone-800 space-y-6">

        {/* Top Header & Controls */}
        <div className="flex items-center justify-between gap-3 border-b border-teal-200/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center p-1.5 shadow-inner shrink-0 border border-teal-200">
              <LocationBadgeIllustration type="calm" className="w-full h-full" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-teal-950 flex items-center gap-2">
                <span>绿草冷静空间</span>
                <span className="text-xs bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full font-bold">
                  非竞争 · 随时可离开
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-medium mt-0.5">
                给心里的波浪留一点时间，跟着呼吸节律慢慢松开
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-2.5 rounded-xl border border-teal-200 bg-white hover:bg-teal-50 text-teal-800 transition-colors"
              title={isMuted ? '取消静音，开启语音指导与呼吸音效' : '静音，关闭语音指导与呼吸音效'}
              aria-label={isMuted ? '取消静音，开启语音指导与呼吸音效' : '静音，关闭语音指导与呼吸音效'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-teal-100/60 transition-colors"
              aria-label="关闭冷静空间，返回主页"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 屏幕阅读器呼吸引导专属实时播报区 (Screen Reader Live Region) */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {getScreenReaderAnnouncement()}
        </div>

        {/* Theme Selector (Grass, Bear, Balloon) */}
        <div className="flex items-center justify-center gap-2 p-1.5 bg-teal-100/60 rounded-2xl">
          {[
            { id: 'grass' as const, label: '🌿 绿草清风', desc: '感受自然之风' },
            { id: 'bear' as const, label: '🐻 呼吸小熊', desc: '肚皮鼓鼓小熊' },
            { id: 'balloon' as const, label: '🎈 飞翔气球', desc: '慢慢膨胀缩放' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                sounds.playClick();
                setTheme(item.id);
              }}
              aria-pressed={theme === item.id}
              aria-label={`切换呼吸引导主题为：${item.label}，${item.desc}${theme === item.id ? '（当前正在使用）' : ''}`}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                theme === item.id
                  ? 'bg-white text-teal-900 shadow-sm border border-teal-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Central Animated Breathing Rhythm Display */}
        <div className="bg-white/80 border-2 border-teal-200/80 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-xs relative overflow-hidden">

          {/* Pause / Play Control */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsPaused(!isPaused);
            }}
            className="absolute top-4 right-4 px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-800 text-xs font-bold flex items-center gap-1.5 hover:bg-teal-100 transition-colors"
            aria-pressed={isPaused}
            aria-label={isPaused ? '继续呼吸引导节律动画与声音' : '暂停呼吸引导节律动画与声音'}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span>{isPaused ? '继续' : '暂停'}</span>
          </button>

          {/* Breathing Circle Scale Animation */}
          <div className="relative w-56 h-56 mx-auto flex items-center justify-center py-4" aria-hidden="true">
            {/* Soft Ripple Halo */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-[3500ms] ease-in-out opacity-25 ${
                phase === 'inhale'
                  ? 'scale-125 bg-teal-400'
                  : phase === 'exhale'
                  ? 'scale-90 bg-emerald-300'
                  : 'scale-100 bg-amber-200'
              }`}
            />

            {/* Main Interactive Breathing Core */}
            <div
              className={`w-44 h-44 rounded-full flex flex-col items-center justify-center transition-all duration-[3800ms] ease-in-out shadow-xl border-4 ${
                phase === 'inhale'
                  ? 'scale-115 bg-linear-to-tr from-teal-200 via-emerald-100 to-amber-100 border-teal-300 shadow-teal-200'
                  : phase === 'hold'
                  ? 'scale-115 bg-linear-to-tr from-amber-100 via-teal-100 to-emerald-100 border-amber-300 shadow-amber-100'
                  : phase === 'exhale'
                  ? 'scale-85 bg-linear-to-tr from-emerald-100 via-teal-50 to-stone-100 border-emerald-200 shadow-emerald-100'
                  : 'scale-90 bg-linear-to-tr from-teal-100 to-stone-50 border-teal-200 shadow-teal-100'
              }`}
            >
              <span className="text-4xl sm:text-5xl mb-1 animate-bounce duration-1000">
                {getThemeEmoji()}
              </span>
              <span className="text-base sm:text-lg font-black text-teal-900 mt-1">
                {phase === 'inhale' ? '吸气' : phase === 'hold' ? '保住' : phase === 'exhale' ? '呼气' : '松开'}
              </span>
            </div>
          </div>

          {/* Readable Phase Text Instruction with aria-live */}
          <div className="space-y-1.5">
            <h3 className="text-lg sm:text-xl font-black text-teal-950 flex items-center justify-center gap-2">
              <span aria-live="polite" aria-atomic="true">{getPhaseText()}</span>
              <button
                onClick={() => handleSpeakGuidance(getPhaseText())}
                className="p-1 text-teal-700 hover:text-teal-900"
                aria-label={`通过语音朗读当前呼吸引导提示：${getPhaseText()}`}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              不用跟别人比速度，跟着你舒服的节奏慢慢呼吸就好
            </p>
          </div>
        </div>

        {/* Sensory Grounding Task Option (3 Colors Grounding) */}
        <div className="bg-white/70 border border-teal-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
          <h4 className="text-sm font-bold text-teal-950 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>小妙招：找一找身边的颜色（接地辅助）</span>
          </h4>
          <p className="text-xs text-stone-600">
            当脑袋里的事情转个不停时，把眼睛看向你现在的房间：
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => {
                sounds.playBell();
                setGroundingColors(prev => ({ ...prev, red: !prev.red }));
              }}
              aria-pressed={groundingColors.red}
              aria-label={groundingColors.red ? '红色物品感知练习：已标记找到红色的东西，点击可取消' : '红色物品感知练习：请在周围房间里找到一件红色的东西，找到后点击'}
              className={`p-2.5 rounded-xl border font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                groundingColors.red
                  ? 'bg-rose-100 border-rose-400 text-rose-900 shadow-xs'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-rose-50/50'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span>{groundingColors.red ? '找到了红色 ✓' : '找红色'}</span>
            </button>

            <button
              onClick={() => {
                sounds.playBell();
                setGroundingColors(prev => ({ ...prev, yellow: !prev.yellow }));
              }}
              aria-pressed={groundingColors.yellow}
              aria-label={groundingColors.yellow ? '黄色物品感知练习：已标记找到黄色的东西，点击可取消' : '黄色物品感知练习：请在周围房间里找到一件黄色的东西，找到后点击'}
              className={`p-2.5 rounded-xl border font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                groundingColors.yellow
                  ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-xs'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-amber-50/50'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span>{groundingColors.yellow ? '找到了黄色 ✓' : '找黄色'}</span>
            </button>

            <button
              onClick={() => {
                sounds.playBell();
                setGroundingColors(prev => ({ ...prev, blue: !prev.blue }));
              }}
              aria-pressed={groundingColors.blue}
              aria-label={groundingColors.blue ? '蓝色物品感知练习：已标记找到蓝色的东西，点击可取消' : '蓝色物品感知练习：请在周围房间里找到一件蓝色的东西，找到后点击'}
              className={`p-2.5 rounded-xl border font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                groundingColors.blue
                  ? 'bg-sky-100 border-sky-400 text-sky-900 shadow-xs'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-sky-50/50'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-sky-500" />
              <span>{groundingColors.blue ? '找到了蓝色 ✓' : '找蓝色'}</span>
            </button>
          </div>
        </div>

        {/* Adult Co-Regulation / Co-Play Guidance Card (成人共同调节卡) */}
        <div className="bg-white/80 border border-teal-200/90 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-teal-950 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-700" />
              <span>给身旁大人的共同调节卡（陪伴在场）</span>
            </h4>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setShowAdultTips(!showAdultTips);
              }}
              className="text-xs text-teal-700 hover:text-teal-900 font-bold px-2 py-1 rounded-lg hover:bg-teal-100/50 transition-colors"
              aria-expanded={showAdultTips}
              aria-label={showAdultTips ? '收起给身旁大人的共同调节卡陪伴建议' : '展开查看给身旁大人的共同调节卡陪伴建议'}
            >
              {showAdultTips ? '收起提示 ▲' : '查看陪伴建议 ▼'}
            </button>
          </div>

          {showAdultTips && (
            <div className="space-y-2 pt-1 text-xs text-stone-700 leading-relaxed border-t border-teal-100">
              <div className="flex items-start gap-2">
                <span className="font-bold text-teal-700 shrink-0">• 触觉锚定：</span>
                <span>把温暖的手轻轻放在孩子的后背或肩膀上，感受规律的呼吸起伏，不催促。</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-teal-700 shrink-0">• 镜映肯定：</span>
                <span>温和地说：“妈妈/爸爸知道你现在不容易，我在这里陪着你，不用急着说话。”</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-teal-700 shrink-0">• 喝温水调节：</span>
                <span>递给孩子一小口温水，慢慢咽下，帮助启动副交感神经自主放松。</span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium italic pt-1">
                * 核心原则：不纠正、不评判、不抢答。允许孩子暂时不知道或沉默。
              </p>
            </div>
          )}
        </div>

        {/* Bottom Safety & Exit Action Buttons */}
        <div className="pt-2 border-t border-teal-200/60 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              requestHug();
              onClose();
            }}
            className="flex-1 py-3.5 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 min-h-[56px] cursor-pointer"
            aria-label="按一下抱抱键，向身边的真人大人请求一个现实中的拥抱并关闭小空间"
          >
            <Heart className="w-5 h-5 fill-white" />
            <span>按一下抱抱键，要一个现实拥抱</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              if (onNavigateHome) {
                onNavigateHome();
              }
              onClose();
            }}
            className="py-3.5 px-6 bg-white border-2 border-teal-200 text-teal-900 hover:bg-teal-100/60 font-black rounded-2xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 min-h-[56px] cursor-pointer shadow-xs"
            aria-label="我已经感觉平静好点了，安全返回晴雨小岛主页"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>我感觉好点了，回小岛</span>
          </button>
        </div>

      </div>
    </div>
  );
};
