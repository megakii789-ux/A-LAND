import React, { useState } from 'react';
import {
  Sun,
  CloudRain,
  Award,
  Sparkles,
  X,
  Volume2,
  CheckCircle2,
  Lock,
  Heart,
  Footprints,
  Compass
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { MedalRecord } from '../../../types';
import { sounds } from '../../../utils/sound';
import { speechNarrator } from '../../../utils/speech';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MedalsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { medals } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'sun' | 'rain'>('all');
  const [selectedMedal, setSelectedMedal] = useState<MedalRecord | null>(null);

  if (!isOpen) return null;

  const filteredMedals = medals.filter(m => {
    if (filterType === 'all') return true;
    return m.type === filterType;
  });

  const sunCount = medals.filter(m => m.type === 'sun' && m.unlocked).length;
  const rainCount = medals.filter(m => m.type === 'rain' && m.unlocked).length;

  const handleSpeakMedal = (medal: MedalRecord) => {
    const text = `你获得了${medal.type === 'sun' ? '阳光徽章' : '雨滴徽章'}：${medal.title}。${medal.description}。伴伴对你说：${medal.meaning}。离屏小任务：${medal.offscreenAction}`;
    speechNarrator.speak(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="bg-amber-50/95 border-2 border-amber-300 rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl relative my-auto animate-in zoom-in-95 duration-200 text-stone-800 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-2 rounded-full hover:bg-amber-100 transition-colors z-20"
          aria-label="关闭徽章馆"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-amber-300 to-yellow-200 text-amber-900 flex items-center justify-center shadow-inner text-2xl">
            🏅
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-stone-900">
                晴雨印记徽章馆
              </h3>
              <span className="text-xs bg-amber-200/80 text-amber-900 px-2.5 py-0.5 rounded-full font-bold">
                阳光与雨滴的脚印
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              没有竞争与排名。阳光记录你的思考行动，雨滴赞美你接纳情绪的真实勇气！
            </p>
          </div>
        </div>

        {/* Counter Summary Bar */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white p-3.5 rounded-2xl border-2 border-amber-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-xl">
                ☀️
              </div>
              <div>
                <span className="text-xs font-bold text-stone-800 block">阳光勋章</span>
                <span className="text-[10px] text-stone-500">照亮想法与行动</span>
              </div>
            </div>
            <span className="text-lg font-black text-amber-600">
              {sunCount} 枚
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border-2 border-blue-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-xl">
                💧
              </div>
              <div>
                <span className="text-xs font-bold text-stone-800 block">雨滴勋章</span>
                <span className="text-[10px] text-stone-500">诚实接纳与温柔陪伴</span>
              </div>
            </div>
            <span className="text-lg font-black text-blue-600">
              {rainCount} 枚
            </span>
          </div>
        </div>

        {/* Filter Tabs - min-h-[50px] */}
        <div className="flex gap-2 p-1.5 bg-amber-100/70 rounded-2xl mb-5 text-sm sm:text-base font-black">
          <button
            onClick={() => {
              sounds.playClick();
              setFilterType('all');
            }}
            className={`flex-1 min-h-[48px] py-2 rounded-xl transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            aria-label="查看全部徽章"
          >
            全部 ({medals.length})
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setFilterType('sun');
            }}
            className={`flex-1 min-h-[48px] py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              filterType === 'sun'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-800 hover:text-amber-900'
            }`}
            aria-label="查看阳光勋章"
          >
            <span>☀️ 阳光 ({sunCount})</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setFilterType('rain');
            }}
            className={`flex-1 min-h-[48px] py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              filterType === 'rain'
                ? 'bg-blue-500 text-white shadow-xs'
                : 'text-blue-800 hover:text-blue-900'
            }`}
            aria-label="查看雨滴勋章"
          >
            <span>💧 雨滴 ({rainCount})</span>
          </button>
        </div>

        {/* Medals Grid - >=56px/80px touch cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {filteredMedals.map((m) => {
            const isSun = m.type === 'sun';
            return (
              <button
                key={m.id}
                onClick={() => {
                  sounds.playClick();
                  if (m.unlocked) {
                    setSelectedMedal(m);
                  } else {
                    handleSpeakMedal(m);
                  }
                }}
                className={`min-h-[110px] p-4 rounded-3xl border-2 flex flex-col justify-between text-center transition-all cursor-pointer ${
                  m.unlocked
                    ? isSun
                      ? 'bg-white border-amber-300 hover:border-amber-500 shadow-xs hover:shadow-md active:scale-98'
                      : 'bg-white border-blue-300 hover:border-blue-500 shadow-xs hover:shadow-md active:scale-98'
                    : 'bg-stone-50/70 border-stone-200 opacity-60'
                }`}
                aria-label={`${m.title}：${m.unlocked ? '已点亮' : '待探索'}`}
              >
                <div>
                  <div className="text-4xl my-1">
                    {m.unlocked ? m.emoji : '🔒'}
                  </div>
                  <h4 className="text-base font-black text-stone-900 mt-1">
                    {m.title}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-snug font-medium">
                    {m.unlocked ? m.description : '在探索中发现它'}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-center text-xs font-bold">
                  {m.unlocked ? (
                    <span className={isSun ? 'text-amber-700' : 'text-blue-700'}>
                      ✓ 已点亮 · 点击看
                    </span>
                  ) : (
                    <span className="text-stone-400">待解锁</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Details Card Modal if a medal is clicked */}
        {selectedMedal && (
          <div className="mt-5 p-5 bg-white rounded-3xl border-2 border-amber-300 shadow-lg animate-in fade-in space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-5xl">{selectedMedal.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xl font-black text-stone-900">
                      {selectedMedal.title}
                    </h4>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      selectedMedal.type === 'sun'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedMedal.type === 'sun' ? '☀️ 阳光勋章' : '💧 雨滴勋章'}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-stone-700 mt-1 font-medium">
                    {selectedMedal.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleSpeakMedal(selectedMedal)}
                  className="p-2 rounded-xl text-amber-700 hover:bg-amber-100 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors cursor-pointer"
                  title="朗读伴伴的话"
                  aria-label="朗读伴伴的话"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedMedal(null)}
                  className="p-2 text-stone-400 hover:text-stone-600 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                  title="收起详情"
                  aria-label="收起详情"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-sm sm:text-base text-stone-800 space-y-1">
              <span className="font-black text-amber-950 block">🦉 伴伴悄悄话：</span>
              <p className="leading-relaxed font-medium">{selectedMedal.meaning}</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-sm sm:text-base text-emerald-950 flex items-start gap-2.5">
              <Footprints className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-black text-emerald-900">离屏生活小尝试：</strong>
                <p className="font-medium mt-0.5">{selectedMedal.offscreenAction}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-amber-200 text-center text-xs text-stone-500 font-medium">
          🌱 每一天你的感受都被温柔接纳，每一个小行动都是你在认真长大。
        </div>
      </div>
    </div>
  );
};
