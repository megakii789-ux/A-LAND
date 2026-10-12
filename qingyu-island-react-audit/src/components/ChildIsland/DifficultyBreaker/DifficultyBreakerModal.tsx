import React, { useState } from 'react';
import {
  Hammer,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Volume2,
  CheckCircle2,
  X,
  Eye,
  Scale,
  Footprints,
  Heart,
  ShieldCheck
} from 'lucide-react';
import { sounds } from '../../../utils/sound';
import { speechNarrator } from '../../../utils/speech';
import { useApp } from '../../../context/AppContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface DifficultyPreset {
  id: string;
  title: string;
  emoji: string;
  desc: string;
  // Step 1: 分 (3 pieces)
  fenItems: {
    fact: string;
    feeling: string;
    guess: string;
  };
  // Step 2: 通 (perspective shift)
  tongPerspective: {
    lensName: string;
    shiftContent: string;
    silverLining: string;
  };
  // Step 3: 择 (small action pool to drag/place into stepping stones)
  availableActions: Array<{
    id: string;
    icon: string;
    text: string;
    type: 'calm' | 'connect' | 'action';
  }>;
}

const PRESET_DIFFICULTIES: DifficultyPreset[] = [
  {
    id: 'diff-two-homes',
    title: '换家时有点害怕睡不着',
    emoji: '🎒',
    desc: '今天收拾书包要去另一个家了，心里七上八下，担心晚上翻来覆去。',
    fenItems: {
      fact: '今晚要在另一个房子的床上睡觉（真实发生的事实）。',
      feeling: '肚子里紧绷绷的，心跳有点快，鼻头酸酸的（我的身体感受）。',
      guess: '“我肯定会整夜睡不着，没人管我了”（大脑里吓唬自己的小猜测）。'
    },
    tongPerspective: {
      lensName: '大人的眼睛 & 天上的眼睛',
      shiftContent: '另一个家的爸爸/妈妈已经把小床单洗得香喷喷的，在期待抱抱我了。',
      silverLining: '虽然换地方需要适应，但我拥有两套玩具、两个爱我的港湾！'
    },
    availableActions: [
      { id: 'act-1', icon: '🧸', text: '把安心小熊放进小书包最显眼的位置', type: 'connect' },
      { id: 'act-2', icon: '💨', text: '摸着小肚子深吸两口气，像吹灭小蜡烛', type: 'calm' },
      { id: 'act-3', icon: '📖', text: '请大人晚上睡前陪我读一本最爱的恐龙故事', type: 'action' },
      { id: 'act-4', icon: '💬', text: '用“我感到……我需要……”告诉大人我有点想念', type: 'connect' }
    ]
  },
  {
    id: 'diff-blocks-broken',
    title: '辛辛苦苦搭的积木城堡塌了',
    emoji: '🧱',
    desc: '搭了一下午的高塔被小伙伴不小心撞塌了，气得想大喊大叫摔东西。',
    fenItems: {
      fact: '积木散在地板上了，塔倒了（看得见的事实）。',
      feeling: '脸热热的，双手握紧成小拳头，好气好气（身体感受）。',
      guess: '“他肯定是存心跟我过不去、想看我哭”（脑子里的怀疑猜测）。'
    },
    tongPerspective: {
      lensName: '小伙伴的眼睛',
      shiftContent: '他刚才在追滚远的小球，没看清脚下，现在吓得呆在原地不敢动。',
      silverLining: '城堡倒了，正好可以借这堆积木搭一艘更大更酷的宇宙飞船！'
    },
    availableActions: [
      { id: 'act-5', icon: '🛑', text: '按下暂停键：双手抱在胸前退后三步', type: 'calm' },
      { id: 'act-6', icon: '🗣️', text: '大声表达边界：“我不喜欢你撞倒我的积木！”', type: 'connect' },
      { id: 'act-7', icon: '🚀', text: '邀请小伙伴一起把倒下的积木搭成新飞船', type: 'action' },
      { id: 'act-8', icon: '💧', text: '喝一小口温水，等肚子里的火苗变小', type: 'calm' }
    ]
  },
  {
    id: 'diff-friend-ask',
    title: '同学好奇问：“你爸爸/妈妈怎么没来？”',
    emoji: '🏫',
    desc: '放学时别的小朋友随口问了一句，心里突然一阵慌张不知怎么回答。',
    fenItems: {
      fact: '同学问了一句话（听见的声音与事实）。',
      feeling: '胸口堵了一下，手心有点出汗（当下的身体感受）。',
      guess: '“他们肯定在笑话我、觉得我很奇怪”（脑海里的猜测）。'
    },
    tongPerspective: {
      lensName: '天上的眼睛',
      shiftContent: '同学多半只是随口好奇，就像问“你今天吃什么点心”一样，不是在审判我。',
      silverLining: '我家里的事情由我自己做主说多少，三句话工具箱在保护我！'
    },
    availableActions: [
      { id: 'act-9', icon: '🛡️', text: '用轻描淡写句：“他今天有事，今天是我妈妈来接我”', type: 'action' },
      { id: 'act-10', icon: '🚪', text: '用礼貌边界句：“这是我们家的事，我想先去玩滑梯”', type: 'action' },
      { id: 'act-11', icon: '🤝', text: '握紧接我的大人的手，把注意力带回好吃的晚餐', type: 'connect' },
      { id: 'act-12', icon: '🧑‍🏫', text: '如果有人起哄，直接转身告诉信任的老师', type: 'connect' }
    ]
  }
];

export const DifficultyBreakerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { unlockMedal } = useApp();
  const [selectedPresetId, setSelectedPresetId] = useState<string>('diff-two-homes');
  const [currentStep, setCurrentStep] = useState<'pick' | 'fen' | 'tong' | 'ze' | 'complete'>('pick');

  // Step 1: 分 (revealed parts)
  const [fenRevealed, setFenRevealed] = useState<{ fact: boolean; feeling: boolean; guess: boolean }>({
    fact: false,
    feeling: false,
    guess: false
  });

  // Step 2: 通 (coin flipped)
  const [isCoinFlipped, setIsCoinFlipped] = useState<boolean>(false);

  // Step 3: 择 (3 stepping stones slots)
  const [steppingStones, setSteppingStones] = useState<Array<DifficultyPreset['availableActions'][0] | null>>([
    null,
    null,
    null
  ]);

  const activePreset = PRESET_DIFFICULTIES.find(p => p.id === selectedPresetId) || PRESET_DIFFICULTIES[0];

  if (!isOpen) return null;

  const handleSpeak = (text: string) => {
    speechNarrator.speak(text);
  };

  const handlePickPreset = (presetId: string) => {
    sounds.playClick();
    setSelectedPresetId(presetId);
    setFenRevealed({ fact: false, feeling: false, guess: false });
    setIsCoinFlipped(false);
    setSteppingStones([null, null, null]);
    setCurrentStep('fen');
  };

  // Place action into stepping stone slot
  const handlePlaceAction = (action: DifficultyPreset['availableActions'][0], slotIndex?: number) => {
    sounds.playScaleClink();

    // Find first empty slot or target slot
    setSteppingStones(prev => {
      const next = [...prev];
      if (typeof slotIndex === 'number') {
        next[slotIndex] = action;
      } else {
        const firstEmpty = next.findIndex(item => item === null);
        if (firstEmpty !== -1) {
          next[firstEmpty] = action;
        } else {
          next[2] = action; // replace last
        }
      }
      return next;
    });
  };

  const handleRemoveStone = (index: number) => {
    sounds.playClick();
    setSteppingStones(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const isStep3Ready = steppingStones.filter(Boolean).length >= 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="bg-amber-50/95 border-2 border-amber-300 rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl relative my-auto animate-in zoom-in-95 duration-200 text-stone-800 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-2 rounded-full hover:bg-amber-100 transition-colors z-20"
          aria-label="关闭拆解台"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center shadow-inner text-3xl shrink-0">
            🔨
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                大困难变小魔法拆解台
              </h3>
              <span className="text-xs bg-amber-200/90 text-amber-900 px-3 py-1 rounded-full font-extrabold">
                动手变小
              </span>
            </div>
            <p className="text-base text-stone-600 mt-1">
              再大的石头，只要轻轻敲一敲，都能变成可以迈步的小踏脚石
            </p>
          </div>
        </div>

        {/* Step Progress Tracker */}
        {currentStep !== 'pick' && (
          <div className="flex items-center justify-between mb-6 p-2 bg-amber-100/70 rounded-2xl border-2 border-amber-200 text-sm">
            <button
              onClick={() => setCurrentStep('fen')}
              className={`flex-1 min-h-[48px] py-2.5 rounded-xl font-black transition-all text-center cursor-pointer ${
                currentStep === 'fen' ? 'bg-sky-600 text-white shadow-xs' : 'text-stone-700 hover:text-stone-900'
              }`}
              aria-label="第一步：看清大石头"
            >
              1. 看清石头
            </button>
            <span className="text-stone-400 px-1 font-bold">→</span>
            <button
              onClick={() => setCurrentStep('tong')}
              className={`flex-1 min-h-[48px] py-2.5 rounded-xl font-black transition-all text-center cursor-pointer ${
                currentStep === 'tong' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-700 hover:text-stone-900'
              }`}
              aria-label="第二步：换个位置看"
            >
              2. 换位置看
            </button>
            <span className="text-stone-400 px-1 font-bold">→</span>
            <button
              onClick={() => setCurrentStep('ze')}
              className={`flex-1 min-h-[48px] py-2.5 rounded-xl font-black transition-all text-center cursor-pointer ${
                currentStep === 'ze' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-700 hover:text-stone-900'
              }`}
              aria-label="第三步：选踏脚石"
            >
              3. 选踏脚石
            </button>
          </div>
        )}

        {/* ================= STEP 0: 挑选大石头困难 (PICK) ================= */}
        {currentStep === 'pick' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-amber-200">
              <h4 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                <span>选一块生活中常遇到的大石头：</span>
                <button
                  onClick={() => handleSpeak("选一块生活里的大石头困难，我们一起用分、通、择把它敲成小石子！")}
                  className="p-1 rounded-md text-amber-700 hover:bg-amber-50"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </h4>
              <p className="text-xs text-stone-500 mt-1">
                生活中经常有些事情看起来像一座大山，压得我们心慌。点选一个你想变小的困难：
              </p>
            </div>

            <div className="grid gap-3">
              {PRESET_DIFFICULTIES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePickPreset(p.id)}
                  className="p-4 rounded-2xl bg-white border-2 border-amber-200/80 hover:border-amber-500 hover:bg-amber-50/50 text-left transition-all flex items-start gap-3.5 group cursor-pointer shadow-xs"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                    {p.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
                        {p.title}
                      </span>
                      <span className="text-xs text-amber-700 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        开始拆解 <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= STEP 1: 分 (把大石头敲成三块) ================= */}
        {currentStep === 'fen' && (
          <div className="space-y-5 animate-in fade-in">
            {/* Visual Big Rock */}
            <div className="text-center py-2">
              <div className="relative inline-block">
                <div className="w-24 h-20 sm:w-28 sm:h-24 bg-linear-to-b from-stone-400 to-stone-600 rounded-[40%] flex items-center justify-center text-4xl shadow-md mx-auto text-white border-4 border-stone-300">
                  🪨
                </div>
                <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                  大困难
                </div>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-stone-900 mt-2">
                “{activePreset.title}”
              </h4>
              <p className="text-xs text-sky-700 font-semibold mt-0.5">
                第 1 步 · 分：点一下，看清大石头里面的事实、感受与脑中猜测！
              </p>
            </div>

            {/* 3 pieces to click & reveal */}
            <div className="grid gap-2.5">
              {/* Fact piece */}
              <button
                onClick={() => {
                  sounds.playBell();
                  setFenRevealed(prev => ({ ...prev, fact: !prev.fact }));
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  fenRevealed.fact
                    ? 'bg-emerald-50 border-emerald-400 shadow-xs'
                    : 'bg-white border-stone-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">👀</span>
                    <span className="text-xs font-bold text-emerald-800">
                      1. 分出事实（真正发生的事）：
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400">
                    {fenRevealed.fact ? '已看清 ✓' : '点我敲开'}
                  </span>
                </div>
                {fenRevealed.fact && (
                  <p className="text-xs text-stone-700 mt-1.5 pl-6 font-medium animate-in fade-in leading-relaxed">
                    {activePreset.fenItems.fact}
                  </p>
                )}
              </button>

              {/* Feeling piece */}
              <button
                onClick={() => {
                  sounds.playBell();
                  setFenRevealed(prev => ({ ...prev, feeling: !prev.feeling }));
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  fenRevealed.feeling
                    ? 'bg-rose-50 border-rose-400 shadow-xs'
                    : 'bg-white border-stone-200 hover:border-rose-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💓</span>
                    <span className="text-xs font-bold text-rose-800">
                      2. 分出感受（身体上的感觉）：
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400">
                    {fenRevealed.feeling ? '已接纳 ✓' : '点我敲开'}
                  </span>
                </div>
                {fenRevealed.feeling && (
                  <p className="text-xs text-stone-700 mt-1.5 pl-6 font-medium animate-in fade-in leading-relaxed">
                    {activePreset.fenItems.feeling}
                  </p>
                )}
              </button>

              {/* Guess piece */}
              <button
                onClick={() => {
                  sounds.playBell();
                  setFenRevealed(prev => ({ ...prev, guess: !prev.guess }));
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  fenRevealed.guess
                    ? 'bg-amber-50 border-amber-400 shadow-xs'
                    : 'bg-white border-stone-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💭</span>
                    <span className="text-xs font-bold text-amber-800">
                      3. 分出脑中猜测（只是头脑里的声音）：
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400">
                    {fenRevealed.guess ? '已识别 ✓' : '点我敲开'}
                  </span>
                </div>
                {fenRevealed.guess && (
                  <p className="text-xs text-stone-700 mt-1.5 pl-6 font-medium animate-in fade-in leading-relaxed">
                    {activePreset.fenItems.guess}
                  </p>
                )}
              </button>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setCurrentStep('pick')}
                className="text-xs text-stone-500 hover:text-stone-700 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> 换个大石头
              </button>
              <button
                onClick={() => {
                  sounds.playBell();
                  setCurrentStep('tong');
                }}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                分清楚了，去换镜头（通） <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: 通 (换个镜头翻转看) ================= */}
        {currentStep === 'tong' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 text-center space-y-1">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                第 2 步 · 通：翻过双面币，换个眼睛看看
              </span>
              <p className="text-xs text-stone-600">
                同一件事换一个位置看，往往有完全不同的一面！点一下中间的双面硬币：
              </p>
            </div>

            {/* Interactive Coin flip */}
            <div className="flex flex-col items-center py-2">
              <button
                onClick={() => {
                  sounds.playCoinFlip();
                  setIsCoinFlipped(!isCoinFlipped);
                }}
                className="w-28 h-28 rounded-full bg-linear-to-tr from-amber-400 via-amber-200 to-yellow-300 border-4 border-amber-500 shadow-xl flex flex-col items-center justify-center p-2 text-center transform hover:scale-105 active:rotate-180 transition-all duration-300 cursor-pointer"
              >
                <span className="text-2xl mb-1">{isCoinFlipped ? '☀️' : '🌧️'}</span>
                <span className="text-[11px] font-extrabold text-amber-900">
                  {isCoinFlipped ? '反面·隐藏好处' : '正面·眼前困难'}
                </span>
                <span className="text-[9px] text-amber-700 mt-0.5">点我翻转 🪙</span>
              </button>

              <div className="w-full mt-4 p-4 bg-white rounded-2xl border-2 border-emerald-200 text-xs sm:text-sm space-y-2.5 shadow-xs">
                <div>
                  <strong className="text-emerald-800 flex items-center gap-1.5 mb-1">
                    <Eye className="w-4 h-4 text-emerald-600" />
                    换到【{activePreset.tongPerspective.lensName}】看：
                  </strong>
                  <p className="text-stone-700 pl-5 leading-relaxed font-medium">
                    “{activePreset.tongPerspective.shiftContent}”
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100">
                  <strong className="text-amber-800 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    翻转后发现的好事情：
                  </strong>
                  <p className="text-stone-700 pl-5 leading-relaxed font-medium">
                    {activePreset.tongPerspective.silverLining}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setCurrentStep('fen')}
                className="text-xs text-stone-500 hover:text-stone-700 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> 上一步：分一分
              </button>
              <button
                onClick={() => {
                  sounds.playBell();
                  setCurrentStep('ze');
                }}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                看到了另一面，去拆解成小动作（择） <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: 择 (拖放拆解成 3 个踏脚石小动作) ================= */}
        {currentStep === 'ze' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="bg-amber-100/70 p-3.5 rounded-2xl border border-amber-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">
                  第 3 步 · 择：把大石头粉碎成 3 颗可以迈步的小石子
                </span>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                  已铺设 {steppingStones.filter(Boolean).length} / 3 步
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-1">
                点击下方备选的小动作卡片，将它们铺进你的「踏脚石小路」！
              </p>
            </div>

            {/* Stepping Stones Target Path (踏脚石小路) */}
            <div>
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">
                👣 我的三步踏脚石小路（把困难变成小动作）：
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                {[0, 1, 2].map((slotIdx) => {
                  const stone = steppingStones[slotIdx];
                  return (
                    <div
                      key={slotIdx}
                      className={`min-h-24 p-3 rounded-2xl border-2 flex flex-col justify-between text-center transition-all ${
                        stone
                          ? 'bg-white border-amber-400 shadow-md scale-102'
                          : 'bg-white/50 border-dashed border-amber-300 hover:bg-white/80'
                      }`}
                    >
                      {stone ? (
                        <>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-amber-800">第 {slotIdx + 1} 步</span>
                            <button
                              onClick={() => handleRemoveStone(slotIdx)}
                              className="text-stone-300 hover:text-rose-500 font-bold"
                              title="移除此步骤"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="text-xl my-0.5">{stone.icon}</div>
                          <p className="text-[11px] font-bold text-stone-800 line-clamp-2 leading-snug">
                            {stone.text}
                          </p>
                        </>
                      ) : (
                        <div className="my-auto flex flex-col items-center justify-center text-stone-400">
                          <Footprints className="w-5 h-5 mb-1 opacity-50" />
                          <span className="text-[11px] font-bold">第 {slotIdx + 1} 个小动作</span>
                          <span className="text-[9px] text-stone-400">点下方卡片填入</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Available Action Pool to pick */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                💡 挑选几个你愿意试一试的微小动作（点一下自动填入）：
              </span>
              <div className="grid sm:grid-cols-2 gap-2">
                {activePreset.availableActions.map((act) => {
                  const isUsed = steppingStones.some(s => s?.id === act.id);
                  return (
                    <button
                      key={act.id}
                      onClick={() => handlePlaceAction(act)}
                      disabled={isUsed}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        isUsed
                          ? 'bg-stone-100 border-stone-200 text-stone-400 opacity-60'
                          : 'bg-white border-amber-200 hover:border-amber-400 hover:shadow-xs'
                      }`}
                    >
                      <span className="text-xl shrink-0">{act.icon}</span>
                      <div className="flex-1 overflow-hidden">
                        <span className="text-xs font-bold text-stone-800 block truncate">
                          {act.text}
                        </span>
                        <span className="text-[10px] text-stone-500">
                          {act.type === 'calm' ? '身体放松小技巧' : act.type === 'connect' ? '找人联结与表达' : '马上能动手做'}
                        </span>
                      </div>
                      <span className="text-xs text-amber-700 font-bold shrink-0">
                        {isUsed ? '✓ 已铺入' : '+ 放入'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stepping stone completed button */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setCurrentStep('tong')}
                className="text-xs text-stone-500 hover:text-stone-700 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> 上一步：通一通
              </button>

              <button
                disabled={!isStep3Ready}
                onClick={() => {
                  sounds.playBell();
                  unlockMedal('breaker-master');
                  unlockMedal('action-pioneer');
                  setCurrentStep('complete');
                  speechNarrator.speak(
                    "大石头被你完全拆解成小动作啦！走好脚下的这一小步，你已经拥有化解大困难的思考超能力了！"
                  );
                }}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                铺好踏脚石啦，大石头变小了！
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: 拆解成功与道别 (COMPLETE) ================= */}
        {currentStep === 'complete' && (
          <div className="text-center py-4 space-y-5 animate-in zoom-in-95">
            <div className="w-20 h-20 bg-linear-to-tr from-amber-300 to-yellow-200 rounded-full flex items-center justify-center text-4xl mx-auto shadow-lg border-4 border-white animate-bounce">
              ✨
            </div>

            <div>
              <h3 className="text-xl font-black text-stone-900">
                🎉 大石头被你成功粉碎啦！
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
                原本压在心头的大困难，现在变成了 3 个你立刻就能动身做的小动作：
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-emerald-300 text-left space-y-2 max-w-md mx-auto shadow-sm">
              {steppingStones.filter(Boolean).map((st, idx) => (
                <div key={st!.id} className="flex items-center gap-2.5 text-xs text-stone-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-base">{st!.icon}</span>
                  <span className="font-bold">{st!.text}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 max-w-md mx-auto">
              🦉 伴伴：“你看，遇到任何吓人的大困难，退后一步，分一分、换一换、选一选，办法总比困难多！”
            </div>

            <div className="flex gap-3 justify-center pt-2 max-w-sm mx-auto">
              <button
                onClick={() => {
                  sounds.playClick();
                  setCurrentStep('pick');
                }}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                拆解另一个困难
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                完成拆解，回小岛
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
