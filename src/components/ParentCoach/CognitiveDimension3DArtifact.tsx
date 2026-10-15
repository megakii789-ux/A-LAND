import React, { useState } from 'react';
import { Sparkles, MoveHorizontal, Compass, ArrowRight, RotateCcw } from 'lucide-react';

export interface CognitiveDimension3DArtifactProps {
  dimension: 'fen' | 'tong' | 'ze';
}

/**
 * 3D Cognitive Dimension Physical Artifact Explorer
 * Visually and tangibly teaches parents the 3 core psychological postures:
 * - 分 (Separation): 3D isometric dual-blocks demonstrating separation of facts from feelings
 * - 通 (Connection): 3D empathy bridge connecting two independent floating islands
 * - 择 (Choice): 3D tactile agency compass for bounded micro-choices
 */
export const CognitiveDimension3DArtifact: React.FC<CognitiveDimension3DArtifactProps> = ({ dimension }) => {
  // State for "分" (Separation)
  const [separationDistance, setSeparationDistance] = useState<number>(35); // 0 (stuck) to 100 (clearly separated)

  // State for "通" (Connection)
  const [isResonating, setIsResonating] = useState<boolean>(false);

  // State for "择" (Choice)
  const [selectedChoice, setSelectedChoice] = useState<'a' | 'b' | null>('a');
  const [compassAngle, setCompassAngle] = useState<number>(-35);

  const handleSeparateToggle = () => {
    setSeparationDistance(prev => (prev > 50 ? 10 : 80));
  };

  const handleResonate = () => {
    setIsResonating(true);
    setTimeout(() => setIsResonating(false), 2400);
  };

  const handleSelectChoice = (choice: 'a' | 'b', angle: number) => {
    setSelectedChoice(choice);
    setCompassAngle(angle);
  };

  return (
    <div className="bg-stone-50/90 rounded-2xl p-4 sm:p-5 border border-stone-200 mt-4 overflow-hidden select-none">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full uppercase tracking-wider">
            3D 物理认知教具
          </span>
          <span className="text-xs font-bold text-stone-600">
            {dimension === 'fen' && '事实与情绪的物理分离模拟'}
            {dimension === 'tong' && '独立岛屿间的双向共情桥梁'}
            {dimension === 'ze' && '安全围栏内的微选择罗盘'}
          </span>
        </div>
      </div>

      {/* ARTIFACT 1: 分 (Separation) */}
      {dimension === 'fen' && (
        <div className="flex flex-col items-center">
          {/* 3D Isometric Stage */}
          <div className="relative w-full h-48 sm:h-56 bg-gradient-to-b from-sky-50/60 to-stone-100/80 rounded-xl border border-sky-100 flex items-center justify-center overflow-hidden perspective-[1000px]">
            {/* Ground grid plane */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#0284c7 1px, transparent 1px)',
                backgroundSize: '16px 16px'
              }}
            />

            {/* Container for dual blocks */}
            <div
              className="relative flex items-center justify-center transition-all duration-500 ease-out"
              style={{
                transformStyle: 'preserve-3d',
                transform: 'rotateX(25deg) rotateY(-20deg)'
              }}
            >
              {/* Block A: 事实方块 (Fact Block) */}
              <div
                className="w-24 sm:w-28 h-20 sm:h-24 bg-gradient-to-br from-sky-300 via-sky-400 to-sky-600 rounded-xl shadow-2xl border-2 border-sky-200 flex flex-col items-center justify-center text-white text-center p-2 transition-transform duration-500 will-change-transform"
                style={{
                  transform: `translateX(-${separationDistance * 0.9}px) translateZ(${separationDistance * 0.2}px)`
                }}
              >
                <span className="text-xl sm:text-2xl mb-0.5">📦</span>
                <span className="text-xs sm:text-sm font-black">客观事实</span>
                <span className="text-[10px] opacity-90 font-medium">“积木倒了”</span>
              </div>

              {/* Connecting Tension String (visualizing cognitive fusion vs detachment) */}
              <div
                className="h-1 bg-amber-400/80 transition-all duration-500 rounded-full"
                style={{
                  width: `${separationDistance * 1.5}px`,
                  opacity: separationDistance > 60 ? 0.2 : 0.85
                }}
              />

              {/* Block B: 情绪方块 (Emotion Block) */}
              <div
                className="w-24 sm:w-28 h-20 sm:h-24 bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 rounded-xl shadow-2xl border-2 border-amber-200 flex flex-col items-center justify-center text-white text-center p-2 transition-transform duration-500 will-change-transform"
                style={{
                  transform: `translateX(${separationDistance * 0.9}px) translateZ(${separationDistance * 0.2}px)`
                }}
              >
                <span className="text-xl sm:text-2xl mb-0.5">🔥</span>
                <span className="text-xs sm:text-sm font-black">当下感受</span>
                <span className="text-[10px] opacity-90 font-medium">“我很沮丧”</span>
              </div>
            </div>

            {/* Real-time status banner inside viewport */}
            <div className="absolute bottom-2.5 px-3 py-1 bg-white/90 backdrop-blur-xs rounded-full border border-stone-200 text-xs font-bold text-stone-700 shadow-2xs">
              {separationDistance > 50 ? (
                <span className="text-emerald-700">✅ 事实与情绪已分离：孩子看清客观事件，情绪被允许流动</span>
              ) : (
                <span className="text-amber-700">⚠️ 概念黏连：孩子容易觉得“我把积木弄倒是因为我很笨”</span>
              )}
            </div>
          </div>

          {/* Interactive controls */}
          <div className="w-full mt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSeparateToggle}
              className="flex-1 py-2 px-4 bg-sky-700 hover:bg-sky-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <MoveHorizontal className="w-4 h-4" />
              <span>{separationDistance > 50 ? '体验“黏连状态”' : '体验“退后一步·物理分离”'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ARTIFACT 2: 通 (Connection) */}
      {dimension === 'tong' && (
        <div className="flex flex-col items-center">
          <div className="relative w-full h-48 sm:h-56 bg-gradient-to-b from-emerald-50/70 to-teal-100/70 rounded-xl border border-emerald-100 flex items-center justify-center overflow-hidden perspective-[1000px]">
            {/* Water waves background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:20px_20px]" />

            {/* 3D Dual Islands & Empathy Bridge */}
            <div
              className="relative flex items-center justify-between w-full max-w-[360px] px-2 transition-transform duration-500"
              style={{
                transformStyle: 'preserve-3d',
                transform: 'rotateX(20deg) rotateY(-10deg)'
              }}
            >
              {/* Island A: Child's Boundary */}
              <div className="w-22 sm:w-28 h-24 sm:h-28 shrink-0 rounded-3xl bg-gradient-to-b from-emerald-300 to-emerald-600 shadow-2xl border-4 border-emerald-200 flex flex-col items-center justify-center text-white text-center p-1.5 sm:p-2 z-10">
                <span className="text-2xl sm:text-3xl mb-0.5">🌱</span>
                <span className="text-xs sm:text-sm font-black">孩子的小岛</span>
                <span className="text-[10px] opacity-90">有独立的边界</span>
              </div>

              {/* Interactive 3D Resonating Bridge */}
              <div className="relative flex-1 h-12 flex items-center justify-center px-1 min-w-[48px]">
                {/* Bridge arch */}
                <div
                  className={`w-full h-3 rounded-full transition-all duration-700 ${
                    isResonating
                      ? 'bg-gradient-to-r from-amber-300 via-rose-300 to-emerald-300 shadow-lg shadow-amber-300/50 scale-y-125'
                      : 'bg-stone-300 border border-stone-400'
                  }`}
                />
                {/* Wave resonance pulses */}
                {isResonating && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-xs font-black text-amber-900 bg-white/95 px-2.5 py-0.5 rounded-full border border-amber-300 shadow-md animate-pulse whitespace-nowrap">
                      “我听懂你了，我陪着你” 🤝
                    </span>
                  </div>
                )}
              </div>

              {/* Island B: Adult's Boundary */}
              <div className="w-22 sm:w-28 h-24 sm:h-28 shrink-0 rounded-3xl bg-gradient-to-b from-sky-400 to-blue-700 shadow-2xl border-4 border-sky-200 flex flex-col items-center justify-center text-white text-center p-1.5 sm:p-2 z-10">
                <span className="text-2xl sm:text-3xl mb-0.5">🏡</span>
                <span className="text-xs sm:text-sm font-black">大人的小岛</span>
                <span className="text-[10px] opacity-90">稳定的避风港</span>
              </div>
            </div>

            <div className="absolute bottom-2.5 px-3 py-1 bg-white/90 backdrop-blur-xs rounded-full border border-stone-200 text-xs font-bold text-stone-700 shadow-2xs max-w-[94%] text-center">
              {isResonating ? '✨ 共情桥梁共振中：不吞并彼此，但温暖流动' : '点击下方按钮体验共情波'}
            </div>
          </div>

          <div className="w-full mt-3">
            <button
              type="button"
              onClick={handleResonate}
              className="w-full py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>敲响“共情共振波”</span>
            </button>
          </div>
        </div>
      )}

      {/* ARTIFACT 3: 择 (Choice) */}
      {dimension === 'ze' && (
        <div className="flex flex-col items-center">
          <div className="relative w-full h-48 sm:h-56 bg-gradient-to-b from-amber-50/70 to-orange-100/70 rounded-xl border border-amber-100 flex items-center justify-center overflow-hidden perspective-[1000px]">
            {/* 3D Dial Stage */}
            <div
              className="relative w-40 sm:w-44 h-40 sm:h-44 rounded-full bg-gradient-to-br from-amber-100 via-white to-amber-200 border-4 border-amber-300 shadow-2xl flex items-center justify-center"
              style={{
                transformStyle: 'preserve-3d',
                transform: 'rotateX(30deg)'
              }}
            >
              {/* Dial tick marks */}
              <div className="absolute inset-2 rounded-full border border-dashed border-amber-300/70" />

              {/* Option A Sector */}
              <div className="absolute top-2 left-3 text-center">
                <span className="text-[10px] font-black text-amber-900 bg-amber-200/90 px-1.5 py-0.5 rounded-md">
                  A: 先穿睡衣
                </span>
              </div>

              {/* Option B Sector */}
              <div className="absolute top-2 right-3 text-center">
                <span className="text-[10px] font-black text-blue-900 bg-blue-200/90 px-1.5 py-0.5 rounded-md">
                  B: 先刷牙齿
                </span>
              </div>

              {/* Non-negotiable boundary at bottom */}
              <div className="absolute bottom-2 text-center w-full">
                <span className="text-[10px] font-bold text-stone-500 bg-stone-200/80 px-2 py-0.5 rounded-full">
                  围栏：今晚必须准备入睡
                </span>
              </div>

              {/* 3D Rotating Compass Needle */}
              <div
                className="w-1.5 h-20 bg-gradient-to-t from-stone-400 via-amber-600 to-rose-500 rounded-full shadow-lg transition-transform duration-500 ease-out origin-center"
                style={{
                  transform: `rotate(${compassAngle}deg)`,
                  transformOrigin: 'center center'
                }}
              />

              {/* Center Pivot Bevel */}
              <div className="absolute w-5 h-5 rounded-full bg-gradient-to-b from-white to-amber-400 border-2 border-amber-600 shadow-md" />
            </div>

            <div className="absolute bottom-2.5 px-3 py-1 bg-white/90 backdrop-blur-xs rounded-full border border-stone-200 text-xs font-bold text-stone-700 shadow-2xs">
              {selectedChoice === 'a' && '孩子选择 A：掌控感获得满足，自主配合完成入睡'}
              {selectedChoice === 'b' && '孩子选择 B：尊重孩子的掌控感，无需对抗与威逼'}
            </div>
          </div>

          <div className="w-full mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSelectChoice('a', -45)}
              className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedChoice === 'a'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              <span>转到选项 A</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectChoice('b', 45)}
              className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedChoice === 'b'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              <span>转到选项 B</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
