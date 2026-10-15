import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Play,
  Square,
  Sliders,
  Activity,
  Waves,
  X
} from 'lucide-react';
import {
  speechNarrator,
  VOICE_PROFILES,
  VoiceProfileType,
  DetectedVoice
} from '../../utils/speech';
import {
  sounds,
  TEMPLATE_ACOUSTIC_PROFILES
} from '../../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const EQ_BAND_LABELS = ['60Hz', '125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz'];

export const VoiceSystemAuditionModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [currentProfile, setCurrentProfile] = useState<VoiceProfileType>(speechNarrator.getProfile());
  const [isSpeaking, setIsSpeaking] = useState<boolean>(speechNarrator.getSpeaking());
  const [detectedVoices, setDetectedVoices] = useState<DetectedVoice[]>(speechNarrator.getDetectedVoices());
  const [activeVoice, setActiveVoice] = useState<DetectedVoice | null>(speechNarrator.getActiveVoice());
  const [customText, setCustomText] = useState<string>('你好呀，今天我们一起做深呼吸，慢慢退后一步看一看。');
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getMuted());
  const [playingSound, setPlayingSound] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = speechNarrator.subscribe(() => {
      setIsSpeaking(speechNarrator.getSpeaking());
      setCurrentProfile(speechNarrator.getProfile());
      setDetectedVoices(speechNarrator.getDetectedVoices());
      setActiveVoice(speechNarrator.getActiveVoice());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!isOpen) return null;

  const activeAcousticProfile = TEMPLATE_ACOUSTIC_PROFILES[currentProfile] || TEMPLATE_ACOUSTIC_PROFILES['warm-sister'];

  const handleSelectProfile = (profileKey: VoiceProfileType) => {
    speechNarrator.setProfile(profileKey);
    setCurrentProfile(profileKey);
    // Play the template's distinct 4-note Web Audio signature motif through its custom DSP filter chain
    sounds.playTemplateSignature(profileKey);
  };

  const handleAudition = (text: string) => {
    sounds.playClick();
    speechNarrator.speak(text);
  };

  const handleStop = () => {
    sounds.playClick();
    speechNarrator.stop();
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    sounds.setMuted(nextMuted);
    setIsMuted(nextMuted);
    if (!nextMuted) {
      sounds.playTemplateSignature(currentProfile);
    }
  };

  const handlePlaySoundSample = (type: 'marimba' | 'bell' | 'hug' | 'kalimba' | 'signature') => {
    setPlayingSound(type);
    if (type === 'marimba') sounds.playClick();
    else if (type === 'bell') sounds.playBell();
    else if (type === 'hug') sounds.playWarmHug();
    else if (type === 'kalimba') sounds.playWarmBloom();
    else if (type === 'signature') sounds.playTemplateSignature(currentProfile);

    setTimeout(() => {
      setPlayingSound(null);
    }, 650);
  };

  const PRESET_AUDITIONS = [
    {
      label: '绘本日常问候',
      icon: '🌸',
      text: '你好呀，今天我们一起做深呼吸，慢慢退后一步看一看。',
      desc: '轻缓温润，建立安全信任感'
    },
    {
      label: '情绪共情接纳',
      icon: '🧸',
      text: '我看到你的积木倒了，心里有点难过对吗？这很正常，大人也会这样。',
      desc: '情绪优先，不讲大道理'
    },
    {
      label: '事实分离（核心契约）',
      icon: '🛡️',
      text: '大人不住在一个房子里，是大人的决定。这件事百分之百不是因为你。',
      desc: '去除自责，坚守已知事实'
    },
    {
      label: '现实安全求助',
      icon: '🤝',
      text: '身边有老师或者家人时，可以直接走到他们面前拉拉衣角。',
      desc: '现实世界真人行动'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-7 max-w-4xl w-full shadow-2xl relative my-auto animate-in zoom-in-95 duration-200 text-stone-800 space-y-6">

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 shadow-2xs">
              <Volume2 className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Web Audio API 多级声学滤波与调制引擎
                </span>
                <span className="text-xs text-stone-500">
                  四套独立频响曲线 · 告别高重复度 AI 机械音
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                儿童自然人声与物理泛音声学系统
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              speechNarrator.stop();
              onClose();
            }}
            className="text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="关闭语音调优面板"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Active Voice Source Banner */}
        <div className="bg-linear-to-r from-amber-50 via-orange-50 to-stone-50 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-900">
                当前匹配声源与 DSP 链路：
              </span>
              <span className="text-xs font-extrabold text-stone-900 bg-white px-2 py-0.5 rounded-lg border border-amber-200 shadow-2xs">
                {activeVoice ? activeVoice.name : '系统标准清晰普通话'}
              </span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-lg">
                {activeAcousticProfile.timbreModulation.instrumentModelName}
              </span>
            </div>
            <p className="text-xs text-stone-600">
              {activeVoice?.tier === 'neural-natural'
                ? `🌟 已启用自然人声 + [${activeAcousticProfile.name}] 专属三段参数均衡与谐波激振节点（检测到 ${detectedVoices.length} 个本地声源）。`
                : '🍃 已启用动态分句语调曲线 + Web Audio API 物理腔体滤波节点，消除传统 TTS 平直机械感。'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleToggleMute}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                isMuted
                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100 shadow-2xs'
              }`}
              title={isMuted ? '已静音' : '声音正常'}
              aria-label="切换静音状态"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
              <span>{isMuted ? '音效已静音' : '音效已开启'}</span>
            </button>
          </div>
        </div>

        {/* 1. Four Templates with Distinct Frequency Curves & Timbre Modulation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-600" />
              <span>四种儿童声学模板（独立频响曲线 EQ + 泛音调制参数）</span>
            </h3>
            <span className="text-xs text-stone-500">点击卡片即时切换并试听专属泛音信标</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(Object.keys(VOICE_PROFILES) as VoiceProfileType[]).map((key) => {
              const cfg = VOICE_PROFILES[key];
              const dsp = cfg.acousticProfile;
              const isSelected = currentProfile === key;

              return (
                <div
                  key={key}
                  onClick={() => handleSelectProfile(key)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2.5 relative ${
                    isSelected
                      ? 'bg-amber-50/75 border-amber-500 shadow-md ring-2 ring-amber-200'
                      : 'bg-stone-50/80 border-stone-200 hover:border-amber-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{cfg.emoji}</span>
                    {isSelected && (
                      <span className="text-[11px] font-black text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        当前模板
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">
                      {cfg.name} <span className="text-xs font-normal text-stone-500">({cfg.subtitle})</span>
                    </h4>
                    <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                      {cfg.description}
                    </p>
                  </div>

                  {/* Distinct Frequency Curve & Modulation Specs */}
                  <div className="bg-white/90 rounded-xl p-2 border border-stone-200/80 space-y-1 text-[10px] text-stone-600">
                    <div className="flex items-center justify-between font-bold text-stone-800">
                      <span>共振峰: {dsp.frequencyCurve.formantCenterFreq}Hz</span>
                      <span className="text-amber-700">+{dsp.frequencyCurve.formantGainDb}dB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>高频柔化: {dsp.frequencyCurve.highCutFreq}Hz</span>
                      <span>LFO: {dsp.timbreModulation.vibratoRateHz}Hz</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-500">
                      <span>基频音阶: {dsp.timbreModulation.scaleFrequencies[0]}Hz</span>
                      <span>呼吸停顿: {cfg.breathPauseMs}ms</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-stone-200/60">
                    <span>语速 {(cfg.rate * 100).toFixed(0)}% · 音高 {(cfg.pitch * 100).toFixed(0)}%</span>
                    <span className="font-bold text-amber-700">点击试听信标</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Real-time Web Audio API Frequency Curve & Timbre Modulation Inspector */}
        <div className="bg-stone-900 text-stone-100 rounded-2xl p-4 sm:p-5 space-y-3 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span className="text-xs sm:text-sm font-black text-white">
                Web Audio API 音频节点链路与频响曲线 ({activeAcousticProfile.name})
              </span>
            </div>
            <button
              type="button"
              onClick={() => handlePlaySoundSample('signature')}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Waves className="w-3.5 h-3.5" />
              <span>播放当前模板 4 音符专属泛音信标</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* 8-Band Frequency Response Curve Visualizer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-stone-400">
                <span>8 段双二阶滤波器 (BiquadFilterNode) 频响曲线</span>
                <span className="text-amber-300 font-mono">
                  LowShelf {activeAcousticProfile.frequencyCurve.lowShelfFreq}Hz / Peaking {activeAcousticProfile.frequencyCurve.formantCenterFreq}Hz / LPF {activeAcousticProfile.frequencyCurve.highCutFreq}Hz
                </span>
              </div>
              <div className="grid grid-cols-8 gap-1.5 items-end h-24 pt-3 px-2 bg-stone-950/80 rounded-xl border border-stone-800">
                {activeAcousticProfile.frequencyCurve.responseCurveDb.map((db, i) => {
                  // Normalize -18dB .. +6dB to 16% .. 100% height
                  const normHeight = Math.max(16, Math.min(100, Math.round(((db + 18) / 24) * 100)));
                  return (
                    <div key={EQ_BAND_LABELS[i]} className="flex flex-col items-center gap-1 h-full justify-end">
                      <span className="text-[9px] font-mono text-amber-300/90">
                        {db > 0 ? `+${db}` : db}
                      </span>
                      <div
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          db >= 0 ? 'bg-amber-400' : 'bg-teal-500/70'
                        }`}
                        style={{ height: `${normHeight}%` }}
                      />
                      <span className="text-[9px] text-stone-400 font-mono">{EQ_BAND_LABELS[i]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timbre Modulation Parameters */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-stone-800/90 p-2.5 rounded-xl border border-stone-700/80">
                <div className="text-[10px] text-stone-400">傅里叶谐波权重 (PeriodicWave)</div>
                <div className="font-mono text-amber-300 font-bold mt-0.5">
                  [{activeAcousticProfile.timbreModulation.harmonicPartials.join(', ')}]
                </div>
                <div className="text-[10px] text-stone-400 mt-1">
                  非谐波泛音比: {activeAcousticProfile.timbreModulation.overtoneRatios.join(' : ')}
                </div>
              </div>

              <div className="bg-stone-800/90 p-2.5 rounded-xl border border-stone-700/80">
                <div className="text-[10px] text-stone-400">LFO 颤音与震音调制节点</div>
                <div className="font-mono text-emerald-300 font-bold mt-0.5">
                  Vibrato {activeAcousticProfile.timbreModulation.vibratoRateHz}Hz (±{activeAcousticProfile.timbreModulation.vibratoDepthCents}c)
                </div>
                <div className="text-[10px] text-stone-400 mt-1">
                  Tremolo: {activeAcousticProfile.timbreModulation.tremoloRateHz}Hz · 深度 {(activeAcousticProfile.timbreModulation.tremoloDepth * 100).toFixed(0)}%
                </div>
              </div>

              <div className="bg-stone-800/90 p-2.5 rounded-xl border border-stone-700/80">
                <div className="text-[10px] text-stone-400">WaveShaper 暖管谐波饱和度</div>
                <div className="font-mono text-sky-300 font-bold mt-0.5">
                  Drive {(activeAcousticProfile.timbreModulation.saturationDrive * 100).toFixed(0)}% · 2x Oversample
                </div>
                <div className="text-[10px] text-stone-400 mt-1">
                  木腔反射延迟: {(activeAcousticProfile.timbreModulation.chamberDelaySec * 1000).toFixed(0)}ms
                </div>
              </div>

              <div className="bg-stone-800/90 p-2.5 rounded-xl border border-stone-700/80">
                <div className="text-[10px] text-stone-400">防机械重复五声音阶轮询池</div>
                <div className="font-mono text-rose-300 font-bold mt-0.5 truncate">
                  {activeAcousticProfile.timbreModulation.scaleFrequencies.map(f => Math.round(f)).join(' / ')}Hz
                </div>
                <div className="text-[10px] text-stone-400 mt-1">
                  每次点击自动轮换音高与微失谐
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Audition Live Presets */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <Play className="w-4 h-4 text-amber-600" />
              <span>经典儿童脚本发音实测（动态语调曲线 + 呼吸停顿 + 泛音伴随）</span>
            </h3>
            {isSpeaking && (
              <span className="text-xs text-amber-700 font-bold animate-pulse flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5" />
                正在按 [{VOICE_PROFILES[currentProfile].name}] 曲线朗读...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PRESET_AUDITIONS.map((preset, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/60 hover:bg-white hover:border-amber-300 transition-all flex items-start justify-between gap-3 shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span>{preset.icon}</span>
                    <span className="text-xs font-bold text-stone-900">{preset.label}</span>
                    <span className="text-[10px] text-stone-500">· {preset.desc}</span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed italic">
                    “{preset.text}”
                  </p>
                </div>

                <button
                  onClick={() => handleAudition(preset.text)}
                  className="min-h-[40px] px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                  aria-label={`试听${preset.label}`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>试听</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Custom text audition & Controls */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="custom-voice-text" className="text-xs font-bold text-stone-700">
              自由测试文本（支持家长自定义输入测试）：
            </label>
            <div className="flex items-center gap-2">
              {isSpeaking ? (
                <button
                  onClick={handleStop}
                  className="min-h-[40px] px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                  aria-label="停止播放"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>停止播放</span>
                </button>
              ) : (
                <button
                  onClick={() => handleAudition(customText)}
                  className="min-h-[40px] px-3.5 py-1.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                  aria-label="播放测试语音"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>立即试听</span>
                </button>
              )}
            </div>
          </div>
          <input
            id="custom-voice-text"
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="输入想让小岛朗读给孩子听的话..."
            className="w-full text-xs sm:text-sm bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
          />
        </div>

        {/* 5. Organic Acoustic Sound Effects (Modulated by Active Template DSP) */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>实体有机声学音效（随当前所选模板的滤波器与调式实时变化）</span>
            </h3>
            <span className="text-xs text-stone-500">连续点击自动轮换五声音阶，杜绝单频死板重复</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              {
                id: 'marimba' as const,
                label: '木质马林巴轮询',
                desc: '五声音阶微失谐轻点',
                icon: '🪵'
              },
              {
                id: 'kalimba' as const,
                label: '卡林巴拇指琴琶音',
                desc: '模板专属动机绽放',
                icon: '🎶'
              },
              {
                id: 'bell' as const,
                label: '晨风泛音风铃',
                desc: '非谐波金属泛音列',
                icon: '🎐'
              },
              {
                id: 'hug' as const,
                label: '暖心大提琴低颂',
                desc: 'LFO呼吸调制共鸣',
                icon: '🫂'
              }
            ].map((snd) => (
              <button
                key={snd.id}
                onClick={() => handlePlaySoundSample(snd.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[70px] ${
                  playingSound === snd.id
                    ? 'bg-emerald-50 border-emerald-400 scale-95 shadow-xs'
                    : 'bg-stone-50/90 border-stone-200 hover:bg-white hover:border-emerald-300'
                }`}
                aria-label={`试听${snd.label}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{snd.icon}</span>
                  <Play className="w-3.5 h-3.5 text-stone-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">{snd.label}</div>
                  <div className="text-[10px] text-stone-500">{snd.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 6. Anti-AI-Taste Engineering Standards Disclosure */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-2 text-xs text-stone-700">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>声学系统去“AI味”三大研发准则与儿童安全底线</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px] leading-relaxed text-stone-600">
            <div className="space-y-1">
              <strong className="text-stone-900 block">1. 独立频响曲线与泛音调制</strong>
              <p>
                四套模板分别配置专属双二阶滤波器（LowShelf + Peaking共振峰 + LPF）、PeriodicWave 谐波列与 LFO 调制深度，彻底消除同质化假音质。
              </p>
            </div>
            <div className="space-y-1">
              <strong className="text-stone-900 block">2. 过滤设计者代码与术语</strong>
              <p>
                自动过滤括号内设计者术语（如“引导大人负责”），杜绝技术元数据外泄，只向孩子传递已知温暖事实。
              </p>
            </div>
            <div className="space-y-1">
              <strong className="text-stone-900 block">3. 100% 本地端离线与隐私</strong>
              <p>
                严禁开放自由聊天 LLM，所有发音与 Web Audio 节点合成均在设备端本地执行，零网络延迟、零孩子原话上云。
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
          <button
            onClick={() => {
              speechNarrator.stop();
              onClose();
            }}
            className="min-h-[44px] px-6 py-2.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-sm"
          >
            完成设定并返回
          </button>
        </div>

      </div>
    </div>
  );
};
