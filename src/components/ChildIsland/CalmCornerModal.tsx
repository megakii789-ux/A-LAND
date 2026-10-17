import React, { useState, useEffect } from 'react';
import {
  Wind,
  Palette,
  CloudRain,
  Users,
  X,
  Heart,
  Volume2,
  VolumeX,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { sounds } from '../../utils/sound';
import { speechNarrator } from '../../utils/speech';
import { isVisualV2ReviewRoute } from '../../App';
import { CalmCornerSceneArtV2 } from '../../visual-v2/batch01/CalmCornerSceneArtV2';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRequestHug: () => void;
  visualV2Pilot?: boolean;
}

export const CalmCornerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onRequestHug,
  visualV2Pilot,
}) => {
  const isV2Active = Boolean(visualV2Pilot) || isVisualV2ReviewRoute();
  const [calmTab, setCalmTab] = useState<'breathe' | 'colors' | 'rain' | 'adult'>('breathe');
  const [breathePhase, setBreathePhase] = useState<'inhale' | 'exhale'>('inhale');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [breatheCount, setBreatheCount] = useState<number>(4);
  const [foundColors, setFoundColors] = useState<{ red: boolean; yellow: boolean; green: boolean }>({
    red: false,
    yellow: false,
    green: false
  });
  const [isRainPlaying, setIsRainPlaying] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || calmTab !== 'breathe' || isPaused) return;

    const interval = setInterval(() => {
      setBreathePhase((prev) => {
        const next = prev === 'inhale' ? 'exhale' : 'inhale';
        sounds.playBreathe(next === 'inhale');
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, calmTab, isPaused]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="绿草平静角"
      data-testid={isV2Active ? 'v2-calm-corner-modal' : 'calm-corner-modal'}
      data-v2-pilot={isV2Active ? 'true' : 'false'}
      data-art-gate={isV2Active ? 'ART_DIRECTOR_QA_HOLD' : undefined}
      data-tech-preview={isV2Active ? 'TECH_PREVIEW_NOT_ART_APPROVED' : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto"
    >
      <div className="bg-emerald-50/95 border border-emerald-200 rounded-3xl p-5 sm:p-8 max-w-xl w-full shadow-2xl relative my-auto animate-in zoom-in-95 duration-200 text-stone-800 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-2 rounded-full hover:bg-emerald-100/60 transition-colors ${
            isV2Active ? 'min-w-[56px] min-h-[56px] flex items-center justify-center cursor-pointer' : ''
          }`}
          aria-label="离开平静角"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 pr-12">
          <div className="w-12 h-12 rounded-2xl bg-emerald-200/60 flex items-center justify-center text-emerald-800 shadow-inner shrink-0">
            <Wind className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2 flex-wrap">
              <span>绿草平静角</span>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                无压力 · 随时可停
              </span>
            </h3>
            <p className="text-xs text-stone-500">深吸一口气，让心里的浪花慢慢平息</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-emerald-100/50 rounded-2xl mb-6">
          <button
            onClick={() => {
              sounds.playClick();
              setCalmTab('breathe');
            }}
            className={`flex-1 ${
              isV2Active ? 'min-h-[56px]' : 'py-2'
            } px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              calmTab === 'breathe'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-stone-600 hover:text-stone-800'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            呼吸伙伴
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setCalmTab('colors');
            }}
            className={`flex-1 ${
              isV2Active ? 'min-h-[56px]' : 'py-2'
            } px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              calmTab === 'colors'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-stone-600 hover:text-stone-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            找三种颜色
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setCalmTab('adult');
            }}
            className={`flex-1 ${
              isV2Active ? 'min-h-[56px]' : 'py-2'
            } px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              calmTab === 'adult'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-stone-600 hover:text-stone-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            和大人一起做
          </button>
        </div>

        {/* V2.3 Layered Stage when V2 mode is active */}
        {isV2Active && (
          <div className="mb-5">
            <CalmCornerSceneArtV2
              phase={breathePhase}
              isPaused={isPaused}
              theme="bear"
              onTogglePause={() => {
                sounds.playClick();
                setIsPaused((prev) => !prev);
              }}
              groundingItems={[
                {
                  id: 'red',
                  shortLabel: '找红色',
                  active: foundColors.red,
                  fill: '#FFE4E6',
                  stroke: '#F43F5E',
                  onToggle: () => {
                    sounds.playBell();
                    setFoundColors((prev) => ({ ...prev, red: !prev.red }));
                  },
                },
                {
                  id: 'yellow',
                  shortLabel: '找黄色',
                  active: foundColors.yellow,
                  fill: '#FEF3C7',
                  stroke: '#F59E0B',
                  onToggle: () => {
                    sounds.playBell();
                    setFoundColors((prev) => ({ ...prev, yellow: !prev.yellow }));
                  },
                },
                {
                  id: 'green',
                  shortLabel: '找绿色',
                  active: foundColors.green,
                  fill: '#D1FAE5',
                  stroke: '#10B981',
                  onToggle: () => {
                    sounds.playBell();
                    setFoundColors((prev) => ({ ...prev, green: !prev.green }));
                  },
                },
              ]}
            />
          </div>
        )}

        {/* TAB 1: 呼吸伙伴 */}
        {calmTab === 'breathe' && (
          <div className="text-center py-4 space-y-6">
            {!isV2Active && (
              <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                {/* Expanding and contracting breathing circle */}
                <div
                  className={`w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-[4000ms] ease-in-out shadow-lg ${
                    breathePhase === 'inhale'
                      ? 'scale-125 bg-linear-to-tr from-emerald-200 to-teal-100 shadow-emerald-200'
                      : 'scale-90 bg-linear-to-tr from-emerald-100 to-green-50 shadow-emerald-100'
                  }`}
                >
                  <span className="text-3xl mb-1">{breathePhase === 'inhale' ? '🐻' : '😴'}</span>
                  <span className="text-sm font-bold text-emerald-800 tracking-wider">
                    {breathePhase === 'inhale' ? '慢慢吸气...' : '缓缓呼气...'}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-medium">肚子像气球</span>
                </div>
              </div>
            )}

            <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
              跟随小熊的肚子慢慢呼吸。吸气时把大肚皮鼓起来，呼气时把心里的烦恼轻轻吹走。
            </p>
          </div>
        )}

        {/* TAB 2: 找三种颜色 (Grounding 接地技术) */}
        {calmTab === 'colors' && (
          <div className="py-2 space-y-4">
            <div className="bg-white/80 p-4 rounded-2xl border border-emerald-100">
              <p className="text-xs sm:text-sm font-medium text-stone-700 leading-relaxed">
                “把眼睛从心里的烦恼拉回房间里。找一找你身边现在能看见的颜色：”
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  sounds.playBell();
                  setFoundColors(prev => ({ ...prev, red: !prev.red }));
                }}
                className={`w-full ${
                  isV2Active ? 'min-h-[56px]' : ''
                } p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                  foundColors.red
                    ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-xs'
                    : 'bg-white border-stone-200 text-stone-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-rose-500 inline-block" />
                  <span className="text-xs sm:text-sm font-bold">1. 找到一件红色的东西（点一下）</span>
                </div>
                {foundColors.red && <CheckCircle2 className="w-5 h-5 text-rose-500" />}
              </button>

              <button
                onClick={() => {
                  sounds.playBell();
                  setFoundColors(prev => ({ ...prev, yellow: !prev.yellow }));
                }}
                className={`w-full ${
                  isV2Active ? 'min-h-[56px]' : ''
                } p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                  foundColors.yellow
                    ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                    : 'bg-white border-stone-200 text-stone-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-400 inline-block" />
                  <span className="text-xs sm:text-sm font-bold">2. 找到一件黄色的东西（点一下）</span>
                </div>
                {foundColors.yellow && <CheckCircle2 className="w-5 h-5 text-amber-500" />}
              </button>

              <button
                onClick={() => {
                  sounds.playBell();
                  setFoundColors(prev => ({ ...prev, green: !prev.green }));
                }}
                className={`w-full ${
                  isV2Active ? 'min-h-[56px]' : ''
                } p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                  foundColors.green
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                    : 'bg-white border-stone-200 text-stone-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-xs sm:text-sm font-bold">3. 找到一件绿色的东西（点一下）</span>
                </div>
                {foundColors.green && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              </button>
            </div>

            {foundColors.red && foundColors.yellow && foundColors.green && (
              <div className="p-3 bg-emerald-100 rounded-2xl text-center text-xs font-bold text-emerald-800 animate-in fade-in">
                🌿 你把注意力带回身边的真实世界啦！身体感觉松一点了吗？
              </div>
            )}
          </div>
        )}

        {/* TAB 3: 和大人一起做 */}
        {calmTab === 'adult' && (
          <div className="py-2 space-y-4">
            <div className="bg-white/80 p-4 rounded-2xl border border-emerald-100 space-y-3">
              <h4 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                <span>给身旁大人的共同调节卡</span>
              </h4>
              <ul className="text-xs text-stone-600 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>触觉锚定：</strong>把一只温暖的手轻轻放在孩子的后背或肩膀上，感受规律的呼吸起伏。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>镜映肯定：</strong>温和地说：“妈妈/爸爸知道你现在不容易，我在这里陪着你，不用急着说话。”</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>喝一口温水：</strong>慢慢咽下一小口温水，启动副交感神经帮助放松。</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Bottom actions */}
        <div className="pt-4 border-t border-emerald-200/60 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              onRequestHug();
              onClose();
            }}
            className={`flex-1 ${
              isV2Active ? 'min-h-[56px]' : ''
            } py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer`}
          >
            <Heart className="w-4 h-4 fill-white" />
            去找一个你信任的大人抱一抱
          </button>
          <button
            onClick={onClose}
            className={`${
              isV2Active ? 'min-h-[56px]' : ''
            } py-3 px-5 bg-white border border-emerald-200 text-stone-600 hover:bg-emerald-100/50 font-medium rounded-2xl text-xs transition-colors cursor-pointer`}
          >
            我准备好返回小岛了
          </button>
        </div>
      </div>
    </div>
  );
};
