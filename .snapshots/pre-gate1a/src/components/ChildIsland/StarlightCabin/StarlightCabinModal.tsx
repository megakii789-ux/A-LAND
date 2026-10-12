import React, { useState } from 'react';
import {
  Star,
  Puzzle,
  Award,
  Smile,
  X,
  Volume2,
  CheckCircle2,
  Sparkles,
  Plus
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { sounds } from '../../../utils/sound';
import { speechNarrator } from '../../../utils/speech';
import {
  LocationBadgeIllustration,
  StarlightPuzzleIllustration
} from '../StoryGrove/StoryIllustrations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const StarlightCabinModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { starlightTraits, addStarlightTrait } = useApp();
  const [tab, setTab] = useState<'puzzle' | 'strength' | 'funnyFailure'>('puzzle');
  const [newTraitInput, setNewTraitInput] = useState<string>('');

  if (!isOpen) return null;

  const handleSpeak = (text: string) => {
    speechNarrator.speak(text);
  };

  const handleAddTrait = () => {
    if (!newTraitInput.trim()) return;
    sounds.playBell();
    addStarlightTrait(newTraitInput.trim());
    setNewTraitInput('');
  };

  const PUZZLE_PIECES = [
    { id: 'p1', label: '我喜欢的事', example: '画画、看恐龙绘本', emoji: '🎨' },
    { id: 'p2', label: '我擅长的事', example: '搭高高积木、跑得很快', emoji: '🏃' },
    { id: 'p3', label: '对别人好的方式', example: '递纸巾、借玩具', emoji: '🤝' },
    { id: 'p4', label: '我被爱的方式', example: '晚安拥抱、听故事', emoji: '💛' },
    { id: 'p5', label: '我的家', example: '我有两个温暖的家', emoji: '🏡' },
    { id: 'p6', label: '我在学的新本领', example: '自己系鞋带、收拾书包', emoji: '🌱' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="bg-indigo-50/95 border-2 border-indigo-200 rounded-3xl p-5 sm:p-8 max-w-2xl w-full shadow-2xl relative my-auto animate-in zoom-in-95 duration-200 text-stone-800 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-2 rounded-full hover:bg-indigo-100 transition-colors z-20 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="离开星光小屋"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center p-1.5 shadow-inner shrink-0 border-2 border-indigo-200">
            <LocationBadgeIllustration type="starlight" className="w-full h-full" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl sm:text-3xl font-black text-stone-800">
                星光小屋 · 我是谁拼图
              </h3>
              <button
                onClick={() => handleSpeak("星光小屋：家庭形态只是拼图中的一块。你有很多特长，也在学新本领，完整的你很大很大！")}
                className="p-2 rounded-xl text-indigo-700 hover:bg-indigo-100 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="听一听星光小屋介绍"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm sm:text-base text-stone-600 font-medium">家庭形态只是身体上的一面小拼图，完整的你很大很大</p>
          </div>
        </div>

        {/* Storybook Hero Illustration */}
        <div className="mb-5 rounded-2xl overflow-hidden border-2 border-indigo-200 shadow-sm bg-indigo-950">
          <StarlightPuzzleIllustration className="w-full h-32 sm:h-40 object-cover" />
        </div>

        {/* Navigation - min-h-[52px] */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-indigo-100/70 rounded-2xl mb-6">
          <button
            onClick={() => {
              sounds.playClick();
              setTab('puzzle');
            }}
            className={`min-h-[52px] py-2.5 px-2 rounded-xl text-sm sm:text-base font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'puzzle'
                ? 'bg-white text-indigo-950 shadow-sm border border-indigo-200'
                : 'text-stone-700 hover:text-stone-900'
            }`}
            aria-label="打开我是谁拼图"
          >
            <Puzzle className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>“我是谁”拼图</span>
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setTab('strength');
            }}
            className={`min-h-[52px] py-2.5 px-2 rounded-xl text-sm sm:text-base font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'strength'
                ? 'bg-white text-indigo-950 shadow-sm border border-indigo-200'
                : 'text-stone-700 hover:text-stone-900'
            }`}
            aria-label="打开强项花园"
          >
            <Award className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>强项花园</span>
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setTab('funnyFailure');
            }}
            className={`min-h-[52px] py-2.5 px-2 rounded-xl text-sm sm:text-base font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'funnyFailure'
                ? 'bg-white text-indigo-950 shadow-sm border border-indigo-200'
                : 'text-stone-700 hover:text-stone-900'
            }`}
            aria-label="打开好玩的失败"
          >
            <Smile className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>好玩的失败</span>
          </button>
        </div>

        {/* ================= TAB 1: “我是谁”拼图 ================= */}
        {tab === 'puzzle' && (
          <div className="space-y-4">
            <div className="bg-white/95 p-4 rounded-3xl border border-indigo-200 shadow-xs">
              <h4 className="text-base sm:text-lg font-black text-stone-800">多维拼图：看见完整的自己</h4>
              <p className="text-sm sm:text-base text-stone-600 font-medium mt-1">
                点击每一块拼图听一听：家庭和其他每块拼图一样大小，没有哪一块能单独代表全部的你！
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PUZZLE_PIECES.map((piece) => (
                <button
                  key={piece.id}
                  onClick={() => {
                    sounds.playBell();
                    handleSpeak(`${piece.label}：比如${piece.example}`);
                  }}
                  className="min-h-[96px] p-4 bg-white rounded-3xl border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-md transition-all text-center flex flex-col justify-between items-center cursor-pointer active:scale-98"
                  aria-label={`${piece.label}：${piece.example}，点击朗读`}
                >
                  <span className="text-3xl mb-1">{piece.emoji}</span>
                  <span className="text-base font-black text-stone-800">{piece.label}</span>
                  <span className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">{piece.example}</span>
                </button>
              ))}
            </div>

            <p className="text-sm sm:text-base text-stone-600 text-center leading-relaxed font-medium bg-indigo-100/50 p-3 rounded-2xl border border-indigo-200">
              💡 你的身上有很多面闪光的拼图。无论何时，你都是世界上独一无二的可爱宝贝。
            </p>
          </div>
        )}

        {/* ================= TAB 2: 强项卡 ================= */}
        {tab === 'strength' && (
          <div className="space-y-4">
            <div className="bg-white/95 p-4 rounded-3xl border border-indigo-200 shadow-xs">
              <h4 className="text-base sm:text-lg font-black text-stone-800">我的强项卡小花园</h4>
              <p className="text-sm sm:text-base text-stone-600 font-medium mt-0.5">
                不说“你最棒”，而是记下你真真实实做到的具体小本领
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {starlightTraits.map((t, idx) => (
                <div
                  key={idx}
                  className="min-h-[48px] px-4 py-2.5 rounded-2xl bg-white border-2 border-indigo-200 text-sm sm:text-base font-black text-indigo-950 shadow-2xs flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>

            {/* Add new trait */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <input
                type="text"
                value={newTraitInput}
                onChange={(e) => setNewTraitInput(e.target.value)}
                placeholder="添加我的新强项（例如：学会了收拾书包、会安慰哭泣的小伙伴）"
                className="flex-1 min-h-[56px] text-base px-4 py-3 rounded-2xl border-2 border-stone-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-400 font-medium text-stone-800"
                aria-label="输入我的新强项"
              />
              <button
                onClick={handleAddTrait}
                disabled={!newTraitInput.trim()}
                className="min-h-[56px] px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-2xl text-base font-black shadow-md transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                aria-label="把新强项记下来"
              >
                <Plus className="w-5 h-5" />
                <span>记下来</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 3: 好玩的失败 ================= */}
        {tab === 'funnyFailure' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border-2 border-indigo-200 text-center space-y-4 shadow-sm">
              <div className="text-5xl">🧱 💥 😅</div>
              <h4 className="text-xl sm:text-2xl font-black text-stone-800">积木倒了？笑一笑继续搭！</h4>
              <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-md mx-auto font-medium">
                搭不好的积木也能继续玩，系不好的鞋带明天再试一次。做错或者失败不等于“我是坏孩子”，它只是说明“我正在认真学新东西呢！”
              </p>
              <div>
                <button
                  onClick={() => {
                    sounds.playBell();
                    handleSpeak("搭不好的积木也能继续玩，失败不等于我是坏孩子，它只是说明我正在学新东西！给勇敢尝试的自己鼓鼓掌！");
                  }}
                  className="min-h-[56px] px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-base sm:text-lg font-black shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                  aria-label="给勇敢尝试的自己鼓鼓掌"
                >
                  <Volume2 className="w-5 h-5" />
                  <span>给勇敢尝试的自己鼓鼓掌 👏</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
