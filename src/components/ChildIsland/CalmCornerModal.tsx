import React, { useState, useEffect } from 'react';
import {
  Wind,
  Palette,
  Users,
  X,
  Heart,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { sounds } from '../../utils/sound';
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
  const [foundColors, setFoundColors] = useState<{ red: boolean; yellow: boolean; green: boolean }>({
    red: false,
    yellow: false,
    green: false
  });

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

  const foundCount =
    (foundColors.red ? 1 : 0) +
    (foundColors.yellow ? 1 : 0) +
    (foundColors.green ? 1 : 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="绿草平静角"
      data-testid={isV2Active ? 'v2-calm-corner-modal' : 'calm-corner-modal'}
      data-v2-pilot={isV2Active ? 'true' : 'false'}
      data-art-gate={isV2Active ? 'ART_DIRECTOR_QA_HOLD' : undefined}
      data-artwork-status={isV2Active ? 'ASSET_ARTWORK_BLOCKED' : undefined}
      data-tech-preview={isV2Active ? 'TECH_PREVIEW_NOT_ART_APPROVED' : undefined}
      className={`fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto ${
        isV2Active
          ? 'bg-linear-to-b from-[#071925]/80 via-[#0C2536]/85 to-[#081C29]/85 backdrop-blur-md'
          : 'bg-emerald-950/40 backdrop-blur-sm'
      }`}
    >
      <div
        className={
          isV2Active
            ? 'bg-linear-to-b from-[#0F293A] via-[#13384C] to-[#1B4652] border-4 border-[#D97706] rounded-[32px] p-4 sm:p-6 max-w-3xl w-full shadow-[0_24px_60px_rgba(4,24,36,0.65)] relative my-auto animate-in zoom-in-95 duration-200 text-stone-800 max-h-[92vh] overflow-y-auto space-y-4'
            : 'bg-emerald-50/95 border border-emerald-200 rounded-3xl p-5 sm:p-8 max-w-xl w-full shadow-2xl relative my-auto animate-in zoom-in-95 duration-200 text-stone-800 max-h-[92vh] overflow-y-auto'
        }
      >
        {/* Header */}
        {isV2Active ? (
          <div className="flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl bg-linear-to-r from-[#FFFDF7] via-[#FEF3C7] to-[#FFFDF7] border-3 border-[#D97706] shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/visual-v2/batch01r-art/cutouts/landmarks/calm_corner/idle_native.png"
                alt=""
                aria-hidden="true"
                className="w-12 h-10 object-contain drop-shadow-xs shrink-0"
              />
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-black text-[#451A03] flex items-center gap-2 flex-wrap">
                  <span>绿草平静角</span>
                  <span className="text-xs bg-emerald-100 text-emerald-900 border border-emerald-400 px-2.5 py-0.5 rounded-full font-extrabold">
                    无压力 · 随时可停
                  </span>
                </h3>
                <p className="text-xs text-[#92400E] font-bold">
                  深吸一口气，跟着暮光灯笼与呼吸光球让浪花慢慢平息
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-2xl bg-[#FFFDF7] border-2 border-[#9A6338] text-[#451A03] hover:bg-amber-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="离开平静角"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-2 rounded-full hover:bg-emerald-100/60 transition-colors"
              aria-label="离开平静角"
            >
              <X className="w-5 h-5" />
            </button>

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
          </>
        )}

        {/* Tabs */}
        <div
          className={
            isV2Active
              ? 'flex gap-2 p-1.5 bg-[#0C2231]/90 border-2 border-[#FDE68A]/70 rounded-2xl'
              : 'flex gap-2 p-1 bg-emerald-100/50 rounded-2xl mb-6'
          }
        >
          <button
            onClick={() => {
              sounds.playClick();
              setCalmTab('breathe');
            }}
            className={`flex-1 ${
              isV2Active ? 'min-h-[56px]' : 'py-2'
            } px-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isV2Active
                ? calmTab === 'breathe'
                  ? 'bg-linear-to-b from-[#FFFBEB] to-[#FDE68A] text-[#78350F] shadow-sm border-2 border-[#F59E0B]'
                  : 'text-teal-100 hover:bg-[#163C52]'
                : calmTab === 'breathe'
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
            } px-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isV2Active
                ? calmTab === 'colors'
                  ? 'bg-linear-to-b from-[#FFFBEB] to-[#FDE68A] text-[#78350F] shadow-sm border-2 border-[#F59E0B]'
                  : 'text-teal-100 hover:bg-[#163C52]'
                : calmTab === 'colors'
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
            } px-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isV2Active
                ? calmTab === 'adult'
                  ? 'bg-linear-to-b from-[#FFFBEB] to-[#FDE68A] text-[#78350F] shadow-sm border-2 border-[#F59E0B]'
                  : 'text-teal-100 hover:bg-[#163C52]'
                : calmTab === 'adult'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-stone-600 hover:text-stone-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            和大人一起做
          </button>
        </div>

        {/* V2.3 Single Unified Sanctuary Stage when V2 mode is active */}
        {isV2Active && (
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
        )}

        {/* TAB 1: 呼吸伙伴 */}
        {calmTab === 'breathe' && (
          <div className="text-center py-2 space-y-3">
            {!isV2Active && (
              <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
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

            <p
              className={
                isV2Active
                  ? 'text-xs sm:text-sm font-bold text-[#451A03] bg-[#FFFDF7] border-2 border-[#D97706] rounded-2xl p-3 shadow-xs'
                  : 'text-xs text-stone-600 max-w-xs mx-auto leading-relaxed'
              }
            >
              跟随暖光球慢慢呼吸。吸气时把大肚皮鼓起来，呼气时把心里的烦恼轻轻吹走。
            </p>
          </div>
        )}

        {/* TAB 2: 找三种颜色 (Grounding 接地技术) — In V2 mode, uses the single stage color gems without duplicate buttons */}
        {calmTab === 'colors' && (
          <div className="py-1 space-y-3">
            {isV2Active ? (
              <div className="bg-[#FFFDF7] p-4 rounded-2xl border-2 border-[#D97706] space-y-2 shadow-xs">
                <p className="text-xs sm:text-sm font-black text-[#451A03] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    请直接点击上方暮光舞台里的红、黄、绿三颗颜色石（已找到 {foundCount}/3）
                  </span>
                </p>
                {foundColors.red && foundColors.yellow && foundColors.green && (
                  <div className="p-2.5 bg-emerald-100 border border-emerald-400 rounded-xl text-center text-xs font-black text-emerald-900">
                    🌿 你把注意力带回身边的真实世界啦！身体感觉松一点了吗？
                  </div>
                )}
              </div>
            ) : (
              <>
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
                    className={`w-full p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
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
                    className={`w-full p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
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
                    className={`w-full p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
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
              </>
            )}
          </div>
        )}

        {/* TAB 3: 和大人一起做 */}
        {calmTab === 'adult' && (
          <div className="py-1 space-y-3">
            <div
              className={
                isV2Active
                  ? 'bg-[#FFFDF7] p-4 rounded-2xl border-2 border-[#D97706] space-y-2.5 shadow-xs'
                  : 'bg-white/80 p-4 rounded-2xl border border-emerald-100 space-y-3'
              }
            >
              <h4 className="text-sm font-black text-[#451A03] flex items-center gap-2">
                <span>给身旁大人的共同调节卡</span>
              </h4>
              <ul className="text-xs text-stone-700 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span><strong>触觉锚定：</strong>把一只温暖的手轻轻放在孩子的后背或肩膀上，感受规律的呼吸起伏。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span><strong>镜映肯定：</strong>温和地说：“妈妈/爸爸知道你现在不容易，我在这里陪着你，不用急着说话。”</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span><strong>喝一口温水：</strong>慢慢咽下一小口温水，启动副交感神经帮助放松。</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Bottom actions */}
        <div
          className={`pt-2 flex flex-col sm:flex-row gap-3 ${
            isV2Active ? '' : 'border-t border-emerald-200/60 pt-4'
          }`}
        >
          <button
            onClick={() => {
              onRequestHug();
              onClose();
            }}
            className={
              isV2Active
                ? 'flex-1 min-h-[58px] py-3.5 px-4 bg-linear-to-b from-[#FB7185] via-[#F43F5E] to-[#E11D48] hover:brightness-105 text-white font-black rounded-2xl border-2 border-[#FECDD3] shadow-[0_5px_0_#881337] text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer'
                : 'flex-1 py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer'
            }
          >
            <Heart className="w-4 h-4 fill-white" />
            去找一个你信任的大人抱一抱
          </button>
          <button
            onClick={onClose}
            className={
              isV2Active
                ? 'min-h-[58px] py-3.5 px-5 bg-linear-to-b from-[#FFFDF7] to-[#FEF3C7] border-2 border-[#D97706] text-[#451A03] hover:brightness-105 font-black rounded-2xl text-xs sm:text-sm transition-colors cursor-pointer shadow-md'
                : 'py-3 px-5 bg-white border border-emerald-200 text-stone-600 hover:bg-emerald-100/50 font-medium rounded-2xl text-xs transition-colors cursor-pointer'
            }
          >
            我准备好返回小岛了
          </button>
        </div>
      </div>
    </div>
  );
};
