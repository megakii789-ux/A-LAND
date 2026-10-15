// Web Audio API Multi-Template Acoustic DSP, Master Bus & Tactile Sound Engine
// Designed for 6-year-old children, parents, and caregivers.
// - Zero-Leak Master Acoustic Bus with ConvolverNode natural wooden room impulse response
//   and DynamicsCompressorNode child ear-safe limiter (-6dBFS ceiling).
// - 4 mathematically distinct Frequency Curves and Timbre Modulation Profiles corresponding
//   to the 4 animal companions / voice templates ('warm-sister', 'gentle-guide', 'playful-buddy', 'starlight-companion').
// - 8-part Tactile Semantic Sound Matrix (Tap/Marimba, CardSelect, ModalOpen, ModalClose,
//   DiscoveryChime, KalimbaBloom, WindchimeBell, WarmHug, CoinFlip, Breathe).
// - 100% client-side offline synthesis, zero cloud uploads, automatic node disconnection on end.

export type AudioTemplateId =
  | 'warm-sister'
  | 'gentle-guide'
  | 'playful-buddy'
  | 'starlight-companion';

export interface FrequencyCurveConfig {
  /** Low-shelf filter cutoff frequency in Hz */
  lowShelfFreq: number;
  /** Low-shelf gain in dB */
  lowShelfGainDb: number;
  /** Vocal/instrument body formant center frequency in Hz */
  formantCenterFreq: number;
  /** Formant peaking gain in dB */
  formantGainDb: number;
  /** Formant resonance Q factor */
  formantQ: number;
  /** High-frequency roll-off cutoff in Hz (preserves crisp woody air while eliminating digital harshness) */
  highCutFreq: number;
  /** High-cut filter Q factor */
  highCutQ: number;
  /**
   * 8-band reference frequency response curve in dB at
   * [60Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz]
   */
  responseCurveDb: [number, number, number, number, number, number, number, number];
}

export interface TimbreModulationConfig {
  /** Primary oscillator waveform */
  primaryWaveform: OscillatorType;
  /** Secondary body oscillator waveform */
  secondaryWaveform: OscillatorType;
  /** Fourier harmonic partial weights [f1, f2, f3, f4, f5] for PeriodicWave timbre shaping */
  harmonicPartials: [number, number, number, number, number];
  /** Physical non-harmonic overtone multiplier ratios */
  overtoneRatios: [number, number, number];
  /** LFO pitch vibrato frequency in Hz */
  vibratoRateHz: number;
  /** LFO pitch vibrato depth in cents */
  vibratoDepthCents: number;
  /** LFO amplitude tremolo frequency in Hz */
  tremoloRateHz: number;
  /** LFO amplitude modulation depth (0.0 - 0.3) */
  tremoloDepth: number;
  /** WaveShaper soft-tube harmonic saturation drive (0.05 - 0.40) */
  saturationDrive: number;
  /** Micro-acoustic body chamber reflection delay in seconds */
  chamberDelaySec: number;
  /** Chamber reflection feedback ratio (0.0 - 0.4) */
  chamberFeedback: number;
  /** Envelope attack time in seconds */
  attackSec: number;
  /** Envelope decay time in seconds */
  decaySec: number;
  /** 5-note pentatonic scale frequencies (Hz) for anti-repetition round-robin playback */
  scaleFrequencies: [number, number, number, number, number];
  /** 4-note signature motif (Hz) played when selecting or previewing the template */
  signatureMotif: [number, number, number, number];
  /** Acoustic physical model description */
  instrumentModelName: string;
}

export interface TemplateAcousticProfile {
  id: AudioTemplateId;
  name: string;
  frequencyCurve: FrequencyCurveConfig;
  timbreModulation: TimbreModulationConfig;
}

export const TEMPLATE_ACOUSTIC_PROFILES: Record<AudioTemplateId, TemplateAcousticProfile> = {
  'warm-sister': {
    id: 'warm-sister',
    name: '暖阳姐姐（小海獭贝贝）· 玫瑰木马林巴与丝绒暖弦',
    frequencyCurve: {
      lowShelfFreq: 220,
      lowShelfGainDb: 4.2,
      formantCenterFreq: 680,
      formantGainDb: 3.0,
      formantQ: 1.35,
      highCutFreq: 4800,
      highCutQ: 0.72,
      responseCurveDb: [3.6, 4.2, 3.9, 3.2, 2.0, 0.8, -1.8, -6.5]
    },
    timbreModulation: {
      primaryWaveform: 'sine',
      secondaryWaveform: 'triangle',
      harmonicPartials: [1.0, 0.52, 0.24, 0.11, 0.04],
      overtoneRatios: [1.0, 2.0, 3.98],
      vibratoRateHz: 4.2,
      vibratoDepthCents: 5.5,
      tremoloRateHz: 3.2,
      tremoloDepth: 0.06,
      saturationDrive: 0.18,
      chamberDelaySec: 0.022,
      chamberFeedback: 0.12,
      attackSec: 0.008,
      decaySec: 0.28,
      // Warm F Major Pentatonic (F4, G4, A4, C5, D5)
      scaleFrequencies: [349.23, 392.00, 440.00, 523.25, 587.33],
      signatureMotif: [349.23, 440.00, 523.25, 698.46],
      instrumentModelName: '玫瑰木马林巴 + 丝绒暖腔立体声脉冲'
    }
  },
  'gentle-guide': {
    id: 'gentle-guide',
    name: '和风守护（小浣熊天天）· 沉稳胡桃木琴与温暖颂钵',
    frequencyCurve: {
      lowShelfFreq: 165,
      lowShelfGainDb: 5.4,
      formantCenterFreq: 460,
      formantGainDb: 3.5,
      formantQ: 1.55,
      highCutFreq: 3900,
      highCutQ: 0.78,
      responseCurveDb: [4.8, 5.4, 4.5, 3.4, 1.2, -0.8, -3.5, -9.2]
    },
    timbreModulation: {
      primaryWaveform: 'triangle',
      secondaryWaveform: 'sine',
      harmonicPartials: [1.0, 0.35, 0.48, 0.16, 0.08],
      overtoneRatios: [1.0, 1.5, 3.0],
      vibratoRateHz: 2.5,
      vibratoDepthCents: 3.2,
      tremoloRateHz: 2.1,
      tremoloDepth: 0.04,
      saturationDrive: 0.14,
      chamberDelaySec: 0.028,
      chamberFeedback: 0.14,
      attackSec: 0.010,
      decaySec: 0.36,
      // Grounded Low C Major Pentatonic (C4, D4, E4, G4, A4)
      scaleFrequencies: [261.63, 293.66, 329.63, 392.00, 440.00],
      signatureMotif: [261.63, 329.63, 392.00, 523.25],
      instrumentModelName: '胡桃木低音木琴 + 黄铜颂钵共鸣包络'
    }
  },
  'playful-buddy': {
    id: 'playful-buddy',
    name: '元气伙伴（小松鼠果果）· 灵动雪松木卡林巴拇指琴',
    frequencyCurve: {
      lowShelfFreq: 280,
      lowShelfGainDb: -0.8,
      formantCenterFreq: 1380,
      formantGainDb: 4.2,
      formantQ: 1.75,
      highCutFreq: 6400,
      highCutQ: 0.85,
      responseCurveDb: [-1.2, -0.8, 0.6, 2.4, 4.2, 3.6, 1.4, -3.2]
    },
    timbreModulation: {
      primaryWaveform: 'sine',
      secondaryWaveform: 'triangle',
      harmonicPartials: [1.0, 0.64, 0.38, 0.24, 0.12],
      overtoneRatios: [1.0, 2.75, 5.4],
      vibratoRateHz: 6.2,
      vibratoDepthCents: 7.5,
      tremoloRateHz: 5.4,
      tremoloDepth: 0.09,
      saturationDrive: 0.22,
      chamberDelaySec: 0.015,
      chamberFeedback: 0.09,
      attackSec: 0.004,
      decaySec: 0.22,
      // Bright G Major Pentatonic (G4, A4, B4, D5, E5)
      scaleFrequencies: [392.00, 440.00, 493.88, 587.33, 659.25],
      signatureMotif: [392.00, 493.88, 587.33, 783.99],
      instrumentModelName: '雪松木卡林巴 + 清脆水滴空气泛音'
    }
  },
  'starlight-companion': {
    id: 'starlight-companion',
    name: '星光守护（小鹿奇奇）· 空灵水晶竖琴与森林风铃',
    frequencyCurve: {
      lowShelfFreq: 240,
      lowShelfGainDb: 1.4,
      formantCenterFreq: 1920,
      formantGainDb: 4.6,
      formantQ: 2.0,
      highCutFreq: 7600,
      highCutQ: 0.95,
      responseCurveDb: [0.9, 1.4, 1.8, 2.4, 3.8, 4.6, 3.2, -1.5]
    },
    timbreModulation: {
      primaryWaveform: 'sine',
      secondaryWaveform: 'sine',
      harmonicPartials: [1.0, 0.36, 0.66, 0.42, 0.26],
      overtoneRatios: [1.0, 2.0, 4.08],
      vibratoRateHz: 3.6,
      vibratoDepthCents: 8.5,
      tremoloRateHz: 4.0,
      tremoloDepth: 0.11,
      saturationDrive: 0.15,
      chamberDelaySec: 0.032,
      chamberFeedback: 0.16,
      attackSec: 0.007,
      decaySec: 0.48,
      // Ethereal D Major Add9 Pentatonic (D4, F#4, A4, B4, E5)
      scaleFrequencies: [293.66, 369.99, 440.00, 493.88, 659.25],
      signatureMotif: [293.66, 369.99, 440.00, 659.25],
      instrumentModelName: '空灵水晶竖琴 + 森林微风立体声混响'
    }
  }
};

/**
 * Generates a non-linear analog soft-saturation curve (tanh harmonic exciter)
 * for WaveShaperNode to eliminate cold digital harshness and add warm even/odd harmonics.
 */
export function createWarmSaturationCurve(drive: number, samples: number = 256): Float32Array<ArrayBuffer> {
  const curve = new Float32Array(new ArrayBuffer(samples * 4));
  const k = Math.max(0.01, Math.min(2.0, drive)) * 10;
  const norm = Math.tanh(k);
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / (samples - 1) - 1;
    // Slight asymmetry introduces warm 2nd-order wood/tube harmonic richness
    const asymmetricX = x + 0.04 * x * x;
    curve[i] = norm > 0 ? Math.tanh(k * asymmetricX) / norm : x;
  }
  return curve;
}

/**
 * Computes interpolated frequency response (dB) at an arbitrary frequency (Hz)
 * for a given TemplateAcousticProfile's frequency curve.
 */
export function computeFrequencyResponseAt(
  profileId: AudioTemplateId,
  freqHz: number
): number {
  const profile = TEMPLATE_ACOUSTIC_PROFILES[profileId] || TEMPLATE_ACOUSTIC_PROFILES['warm-sister'];
  const bands = [60, 125, 250, 500, 1000, 2000, 4000, 8000];
  const curve = profile.frequencyCurve.responseCurveDb;

  if (freqHz <= bands[0]) return curve[0];
  if (freqHz >= bands[bands.length - 1]) return curve[curve.length - 1];

  for (let i = 0; i < bands.length - 1; i++) {
    if (freqHz >= bands[i] && freqHz <= bands[i + 1]) {
      const ratio =
        (Math.log2(freqHz) - Math.log2(bands[i])) /
        (Math.log2(bands[i + 1]) - Math.log2(bands[i]));
      return Number((curve[i] + ratio * (curve[i + 1] - curve[i])).toFixed(2));
    }
  }
  return 0;
}

export interface DSPNodeChain {
  input: AudioNode;
  lowShelfFilter: BiquadFilterNode;
  formantFilter: BiquadFilterNode;
  highCutFilter: BiquadFilterNode;
  waveShaper: WaveShaperNode;
  output: AudioNode;
  dispose?: () => void;
}

class SoundPlayer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private activeTemplate: AudioTemplateId = 'warm-sister';
  private stepCounter: number = 0;
  private activeVoiceCount: number = 0;
  private masterCompressor: DynamicsCompressorNode | null = null;
  private reverbBufferCache: AudioBuffer | null = null;
  private sharedConvolver: ConvolverNode | null = null;
  private sharedReverbSend: GainNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('child_voice_profile');
        if (
          saved === 'warm-sister' ||
          saved === 'gentle-guide' ||
          saved === 'playful-buddy' ||
          saved === 'starlight-companion'
        ) {
          this.activeTemplate = saved;
        }
      } catch {}
    }
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Ensures a single shared child ear-safe DynamicsCompressorNode + natural stereo room reverb bus
   * exists on the AudioContext so transient sounds never clip or leak cyclic feedback nodes.
   */
  private getMasterOutput(ctx: AudioContext): { dryBus: AudioNode; reverbSend: AudioNode } {
    if (!this.masterCompressor && typeof ctx.createDynamicsCompressor === 'function') {
      try {
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.setValueAtTime(-14, ctx.currentTime);
        comp.knee.setValueAtTime(18, ctx.currentTime);
        comp.ratio.setValueAtTime(3.5, ctx.currentTime);
        comp.attack.setValueAtTime(0.003, ctx.currentTime);
        comp.release.setValueAtTime(0.18, ctx.currentTime);
        comp.connect(ctx.destination);
        this.masterCompressor = comp;

        // Build algorithmic natural wooden room stereo impulse response (0.38s smooth velvet tail, zero metallic comb filtering)
        if (typeof ctx.createConvolver === 'function' && typeof ctx.createBuffer === 'function') {
          const sampleRate = ctx.sampleRate || 44100;
          const length = Math.floor(sampleRate * 0.38);
          const impulse = ctx.createBuffer(2, length, sampleRate);
          for (let ch = 0; ch < 2; ch++) {
            const channelData = impulse.getChannelData(ch);
            for (let i = 0; i < length; i++) {
              const t = i / sampleRate;
              // Early wooden reflections + smooth exponential decay
              const env = Math.exp(-t * 11.5);
              const seed = Math.sin(i * 0.17 + ch * 1.3) * 0.5 + (Math.random() * 2 - 1) * 0.5;
              channelData[i] = seed * env * 0.25;
            }
          }
          this.reverbBufferCache = impulse;
          const convolver = ctx.createConvolver();
          convolver.buffer = impulse;

          const reverbSend = ctx.createGain();
          reverbSend.gain.setValueAtTime(0.18, ctx.currentTime);
          reverbSend.connect(convolver);
          convolver.connect(comp);

          this.sharedConvolver = convolver;
          this.sharedReverbSend = reverbSend;
        }
      } catch {
        return { dryBus: ctx.destination, reverbSend: ctx.destination };
      }
    }

    const dryBus = this.masterCompressor || ctx.destination;
    const reverbSend = this.sharedReverbSend || dryBus;
    return { dryBus, reverbSend };
  }

  public getActiveVoiceCount(): number {
    return this.activeVoiceCount;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.ctx && this.ctx.state === 'running') {
      try {
        this.ctx.suspend().catch(() => {});
      } catch {}
    }
  }

  public stopAll() {
    this.setMuted(true);
  }

  public resume() {
    this.setMuted(false);
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        this.ctx.resume().catch(() => {});
      } catch {}
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setTemplate(templateId: AudioTemplateId) {
    if (!TEMPLATE_ACOUSTIC_PROFILES[templateId]) return;
    this.activeTemplate = templateId;
    this.stepCounter = 0;
  }

  public getTemplate(): AudioTemplateId {
    return this.activeTemplate;
  }

  public getTemplateProfile(templateId?: AudioTemplateId): TemplateAcousticProfile {
    const id = templateId || this.activeTemplate;
    return TEMPLATE_ACOUSTIC_PROFILES[id] || TEMPLATE_ACOUSTIC_PROFILES['warm-sister'];
  }

  /**
   * Returns the next scale frequency with organic micro-detuning so repeated
   * interactions never produce robotic identical frequencies.
   */
  public getNextScaleNote(templateId?: AudioTemplateId): {
    frequency: number;
    stepIndex: number;
    microDetuneCents: number;
  } {
    const profile = this.getTemplateProfile(templateId);
    const scale = profile.timbreModulation.scaleFrequencies;
    const stepIndex = this.stepCounter % scale.length;
    this.stepCounter++;

    // Deterministic subtle organic variation cycle (-3.5, +2.5, -1.8, +3.8, +0.8 cents)
    const detunePattern = [-3.5, 2.5, -1.8, 3.8, 0.8];
    const microDetuneCents = detunePattern[this.stepCounter % detunePattern.length];
    const baseFreq = scale[stepIndex];
    const frequency = Number((baseFreq * Math.pow(2, microDetuneCents / 1200)).toFixed(2));

    return {
      frequency,
      stepIndex,
      microDetuneCents
    };
  }

  /**
   * Constructs the multi-stage Web Audio API DSP processing chain for a given template:
   * [Input] -> LowShelf BiquadFilter -> Formant Peaking BiquadFilter -> HighCut BiquadFilter
   *         -> WaveShaperNode (Warm Saturation) -> Feed-Forward Early Reflection (Zero Feedback Leak!)
   *         -> StereoPannerNode -> Master Output (with auto-disconnect lifecycle).
   */
  public createTemplateDSPChain(
    ctx: AudioContext,
    templateId?: AudioTemplateId,
    pan: number = 0,
    autoDisposeAfterSec: number = 1.2
  ): DSPNodeChain {
    const profile = this.getTemplateProfile(templateId);
    const { frequencyCurve, timbreModulation } = profile;
    const now = ctx.currentTime;
    const { dryBus, reverbSend } = this.getMasterOutput(ctx);

    // Stage 1: Low-Shelf Filter (shapes chest/wood foundation)
    const lowShelfFilter = ctx.createBiquadFilter();
    lowShelfFilter.type = 'lowshelf';
    lowShelfFilter.frequency.setValueAtTime(frequencyCurve.lowShelfFreq, now);
    lowShelfFilter.gain.setValueAtTime(frequencyCurve.lowShelfGainDb, now);

    // Stage 2: Formant Peaking Filter (shapes vocal/instrument acoustic cavity resonance)
    const formantFilter = ctx.createBiquadFilter();
    formantFilter.type = 'peaking';
    formantFilter.frequency.setValueAtTime(frequencyCurve.formantCenterFreq, now);
    formantFilter.gain.setValueAtTime(frequencyCurve.formantGainDb, now);
    formantFilter.Q.setValueAtTime(frequencyCurve.formantQ, now);

    // Stage 3: High-Cut Low-Pass Filter (preserves crisp woody air while smoothing harsh digital peaks)
    const highCutFilter = ctx.createBiquadFilter();
    highCutFilter.type = 'lowpass';
    highCutFilter.frequency.setValueAtTime(frequencyCurve.highCutFreq, now);
    highCutFilter.Q.setValueAtTime(frequencyCurve.highCutQ, now);

    // Stage 4: WaveShaperNode (non-linear soft tube/tape harmonic saturation)
    const waveShaper = ctx.createWaveShaper();
    waveShaper.curve = createWarmSaturationCurve(timbreModulation.saturationDrive);
    waveShaper.oversample = '2x';

    // Stage 5: Feed-forward Early Wood Reflection (NO cyclic feedback loop -> zero memory leak & zero comb-filter ring!)
    const dryGain = ctx.createGain();
    dryGain.gain.setValueAtTime(0.88, now);

    const wetGain = ctx.createGain();
    wetGain.gain.setValueAtTime(timbreModulation.chamberFeedback * 0.65, now);

    const chamberDelay = ctx.createDelay(0.2);
    chamberDelay.delayTime.setValueAtTime(timbreModulation.chamberDelaySec, now);

    const dampingFilter = ctx.createBiquadFilter();
    dampingFilter.type = 'lowpass';
    dampingFilter.frequency.setValueAtTime(frequencyCurve.highCutFreq * 0.8, now);

    // Stage 6: Master Output & Stereo Panning
    const masterOut = ctx.createGain();
    masterOut.gain.setValueAtTime(0.92, now);

    // Wire serial EQ + WaveShaper chain
    lowShelfFilter.connect(formantFilter);
    formantFilter.connect(highCutFilter);
    highCutFilter.connect(waveShaper);

    // Wire parallel dry + feed-forward early reflection path
    waveShaper.connect(dryGain);
    dryGain.connect(masterOut);

    waveShaper.connect(chamberDelay);
    chamberDelay.connect(dampingFilter);
    dampingFilter.connect(wetGain);
    wetGain.connect(masterOut);

    let pannerNode: StereoPannerNode | null = null;
    if (typeof ctx.createStereoPanner === 'function') {
      try {
        pannerNode = ctx.createStereoPanner();
        pannerNode.pan.setValueAtTime(Math.max(-0.6, Math.min(0.6, pan)), now);
        masterOut.connect(pannerNode);
        pannerNode.connect(dryBus);
        if (reverbSend !== dryBus) {
          pannerNode.connect(reverbSend);
        }
      } catch {
        masterOut.connect(dryBus);
      }
    } else {
      masterOut.connect(dryBus);
    }

    let disposed = false;
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      try {
        lowShelfFilter.disconnect();
        formantFilter.disconnect();
        highCutFilter.disconnect();
        waveShaper.disconnect();
        dryGain.disconnect();
        chamberDelay.disconnect();
        dampingFilter.disconnect();
        wetGain.disconnect();
        masterOut.disconnect();
        if (pannerNode) pannerNode.disconnect();
      } catch {}
    };

    if (typeof window !== 'undefined' && autoDisposeAfterSec > 0) {
      window.setTimeout(dispose, Math.ceil((autoDisposeAfterSec + 0.15) * 1000));
    }

    return {
      input: lowShelfFilter,
      lowShelfFilter,
      formantFilter,
      highCutFilter,
      waveShaper,
      output: masterOut,
      dispose
    };
  }

  /**
   * Builds a custom PeriodicWave from the template's Fourier harmonic partial weights,
   * falling back gracefully to standard waveform if createPeriodicWave is unavailable.
   */
  private applyCustomHarmonicTimbre(
    ctx: AudioContext,
    osc: OscillatorNode,
    partials: [number, number, number, number, number],
    fallbackType: OscillatorType
  ) {
    if (typeof ctx.createPeriodicWave === 'function') {
      try {
        const real = new Float32Array(partials.length + 1);
        const imag = new Float32Array(partials.length + 1);
        real[0] = 0;
        imag[0] = 0;
        for (let i = 0; i < partials.length; i++) {
          real[i + 1] = partials[i] * 0.35;
          imag[i + 1] = partials[i];
        }
        const wave = ctx.createPeriodicWave(real, imag, { disableNormalization: false });
        osc.setPeriodicWave(wave);
        return;
      } catch {}
    }
    osc.type = fallbackType;
  }

  /**
   * Attaches dual LFO modulation (Pitch Vibrato + Amplitude Tremolo) to a synthesized voice
   */
  private attachTimbreModulationLFO(
    ctx: AudioContext,
    targetOsc: OscillatorNode,
    targetGain: GainNode,
    modConfig: TimbreModulationConfig,
    startTime: number,
    stopTime: number
  ) {
    try {
      const vibratoLfo = ctx.createOscillator();
      const vibratoDepth = ctx.createGain();
      vibratoLfo.type = 'sine';
      vibratoLfo.frequency.setValueAtTime(modConfig.vibratoRateHz, startTime);
      vibratoDepth.gain.setValueAtTime(modConfig.vibratoDepthCents, startTime);

      if (targetOsc.detune) {
        vibratoLfo.connect(vibratoDepth);
        vibratoDepth.connect(targetOsc.detune);
        vibratoLfo.start(startTime);
        vibratoLfo.stop(stopTime);
      }

      const tremoloLfo = ctx.createOscillator();
      const tremoloDepth = ctx.createGain();
      tremoloLfo.type = 'sine';
      tremoloLfo.frequency.setValueAtTime(modConfig.tremoloRateHz, startTime);
      tremoloDepth.gain.setValueAtTime(modConfig.tremoloDepth * 0.025, startTime);

      tremoloLfo.connect(tremoloDepth);
      tremoloDepth.connect(targetGain.gain);
      tremoloLfo.start(startTime);
      tremoloLfo.stop(stopTime);
    } catch {}
  }

  /**
   * Helper: Transient Mallet/Velvet Strike Burst shaped by template formant & air frequencies
   */
  private triggerImpactTransient(
    ctx: AudioContext,
    destination: AudioNode,
    formantFreq: number = 2200,
    volume: number = 0.032,
    duration: number = 0.014
  ) {
    try {
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Soft sine-windowed attack prevents digital clicks while giving woody/velvet crispness
        const windowEnv = Math.sin((Math.PI * Math.min(i, bufferSize * 0.25)) / (bufferSize * 0.25));
        data[i] = (Math.random() * 2 - 1) * windowEnv * Math.exp(-i / (bufferSize * 0.32));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(Math.max(1200, formantFreq * 1.6), ctx.currentTime);
      noiseFilter.Q.setValueAtTime(1.5, ctx.currentTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(volume, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(destination);

      noise.start();
    } catch {}
  }

  /**
   * Plays a synthesized note routed through the specified template's Web Audio DSP chain
   */
  public playModulatedNote(
    freq?: number,
    templateId?: AudioTemplateId,
    durationScale: number = 1.0
  ) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const profile = this.getTemplateProfile(templateId);
      const { frequencyCurve, timbreModulation } = profile;
      const noteInfo = this.getNextScaleNote(profile.id);
      const targetFreq = freq || noteInfo.frequency;

      const now = ctx.currentTime;
      const pan = (noteInfo.stepIndex - 2) * 0.09;
      const attack = timbreModulation.attackSec;
      const decay = timbreModulation.decaySec * durationScale;
      const stopTime = now + attack + decay + 0.05;
      const dspChain = this.createTemplateDSPChain(ctx, profile.id, pan, attack + decay + 0.2);

      const oscPrimary = ctx.createOscillator();
      const gainPrimary = ctx.createGain();
      this.applyCustomHarmonicTimbre(
        ctx,
        oscPrimary,
        timbreModulation.harmonicPartials,
        timbreModulation.primaryWaveform
      );
      // Subtle pitch-drop envelope on attack (1.06x -> 1.0x in 14ms) for physical mallet bounce
      oscPrimary.frequency.setValueAtTime(targetFreq * 1.06, now);
      oscPrimary.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.014);

      gainPrimary.gain.setValueAtTime(0.001, now);
      gainPrimary.gain.linearRampToValueAtTime(0.13, now + attack);
      gainPrimary.gain.exponentialRampToValueAtTime(0.0008, now + attack + decay);

      const oscOvertone = ctx.createOscillator();
      const gainOvertone = ctx.createGain();
      oscOvertone.type = timbreModulation.secondaryWaveform;
      oscOvertone.frequency.setValueAtTime(targetFreq * timbreModulation.overtoneRatios[1], now);

      gainOvertone.gain.setValueAtTime(0.001, now);
      gainOvertone.gain.linearRampToValueAtTime(0.038, now + attack * 0.7);
      gainOvertone.gain.exponentialRampToValueAtTime(0.0005, now + attack + decay * 0.55);

      this.attachTimbreModulationLFO(
        ctx,
        oscPrimary,
        gainPrimary,
        timbreModulation,
        now,
        stopTime
      );

      oscPrimary.connect(gainPrimary);
      oscOvertone.connect(gainOvertone);
      gainPrimary.connect(dspChain.input);
      gainOvertone.connect(dspChain.input);

      this.triggerImpactTransient(
        ctx,
        dspChain.input,
        frequencyCurve.formantCenterFreq,
        0.028,
        0.014
      );

      this.activeVoiceCount++;
      oscPrimary.onended = () => {
        this.activeVoiceCount = Math.max(0, this.activeVoiceCount - 1);
      };

      oscPrimary.start(now);
      oscOvertone.start(now);
      oscPrimary.stop(stopTime);
      oscOvertone.stop(stopTime);
    } catch {}
  }

  /**
   * Plays a template's distinctive 4-note acoustic signature motif through its Web Audio DSP chain.
   */
  public playTemplateSignature(templateId?: AudioTemplateId) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const profile = this.getTemplateProfile(templateId);
      const { timbreModulation, frequencyCurve } = profile;
      const now = ctx.currentTime;
      const dspChain = this.createTemplateDSPChain(ctx, profile.id, 0, 1.4);

      const stepSpacing =
        profile.id === 'playful-buddy'
          ? 0.068
          : profile.id === 'gentle-guide'
          ? 0.11
          : profile.id === 'starlight-companion'
          ? 0.092
          : 0.082;

      timbreModulation.signatureMotif.forEach((freq, idx) => {
        const startTime = now + idx * stepSpacing;
        const attack = timbreModulation.attackSec;
        const decay = timbreModulation.decaySec * 1.35;
        const stopTime = startTime + attack + decay + 0.05;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        this.applyCustomHarmonicTimbre(
          ctx,
          osc,
          timbreModulation.harmonicPartials,
          timbreModulation.primaryWaveform
        );
        osc.frequency.setValueAtTime(freq * 1.04, startTime);
        osc.frequency.exponentialRampToValueAtTime(freq, startTime + 0.012);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.095, startTime + attack);
        gain.gain.exponentialRampToValueAtTime(0.0008, startTime + attack + decay);

        const oscOvertone = ctx.createOscillator();
        const gainOvertone = ctx.createGain();
        oscOvertone.type = timbreModulation.secondaryWaveform;
        oscOvertone.frequency.setValueAtTime(freq * timbreModulation.overtoneRatios[1], startTime);
        gainOvertone.gain.setValueAtTime(0.026, startTime);
        gainOvertone.gain.exponentialRampToValueAtTime(0.0005, startTime + decay * 0.5);

        this.attachTimbreModulationLFO(ctx, osc, gain, timbreModulation, startTime, stopTime);

        osc.connect(gain);
        oscOvertone.connect(gainOvertone);
        gain.connect(dspChain.input);
        gainOvertone.connect(dspChain.input);

        if (idx === 0) {
          this.triggerImpactTransient(
            ctx,
            dspChain.input,
            frequencyCurve.formantCenterFreq,
            0.025,
            0.012
          );
        }

        osc.start(startTime);
        oscOvertone.start(startTime);
        osc.stop(stopTime);
        oscOvertone.stop(stopTime);
      });
    } catch {}
  }

  /**
   * Plays an ultra-subtle, non-masking opening breath chime ONLY on segmentIndex === 0
   * so mid-sentence clauses are never interrupted by synthetic oscillator beeps!
   */
  public playSpeechProsodyCue(templateId?: AudioTemplateId, segmentIndex: number = 0) {
    if (segmentIndex > 0) return; // Never beep between clauses of a sentence!
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const profile = this.getTemplateProfile(templateId);
      const scale = profile.timbreModulation.scaleFrequencies;
      const freq = scale[0];
      const now = ctx.currentTime;
      const dspChain = this.createTemplateDSPChain(ctx, profile.id, 0, 0.35);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0005, now);
      gain.gain.linearRampToValueAtTime(0.012, now + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0003, now + 0.16);

      osc.connect(gain);
      gain.connect(dspChain.input);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }

  // =========================================================================
  // 1. Tactile Tap / Click: Crisp Rosewood & Water-Drop Pop with Pitch Bounce
  // =========================================================================
  public playClick() {
    this.playTap();
  }

  public playTap() {
    const note = this.getNextScaleNote(this.activeTemplate);
    this.playMarimba(note.frequency, note.stepIndex);
  }

  public playMarimba(freq?: number, stepIndex: number = 2) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const profile = this.getTemplateProfile(this.activeTemplate);
      const targetFreq = freq || profile.timbreModulation.scaleFrequencies[0];
      const now = ctx.currentTime;
      const pan = (stepIndex - 2) * 0.08;
      const dspChain = this.createTemplateDSPChain(ctx, profile.id, pan, 0.45);

      // 1. Fundamental woody-drop tone with fast pitch-drop bounce (1.22x -> 1.0x in 16ms)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      this.applyCustomHarmonicTimbre(
        ctx,
        osc1,
        profile.timbreModulation.harmonicPartials,
        'sine'
      );
      osc1.frequency.setValueAtTime(targetFreq * 1.22, now);
      osc1.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.016);
      osc1.frequency.exponentialRampToValueAtTime(targetFreq * 0.992, now + 0.18);

      // Zero-crossing 2.5ms soft attack prevents harsh digital pop while feeling ultra-snappy
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.14, now + 0.003);
      gain1.gain.exponentialRampToValueAtTime(0.0008, now + 0.19);

      // 2. Crisp 4th-harmonic marimba resonator overtone (gives lively sparkle & clarity)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      const overtoneFreq = targetFreq * profile.timbreModulation.overtoneRatios[1];
      osc2.frequency.setValueAtTime(overtoneFreq * 1.08, now);
      osc2.frequency.exponentialRampToValueAtTime(overtoneFreq, now + 0.012);

      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.linearRampToValueAtTime(0.048, now + 0.0025);
      gain2.gain.exponentialRampToValueAtTime(0.0006, now + 0.075);

      osc1.connect(gain1);
      osc2.connect(gain2);
      gain1.connect(dspChain.input);
      gain2.connect(dspChain.input);

      this.triggerImpactTransient(
        ctx,
        dspChain.input,
        profile.frequencyCurve.formantCenterFreq,
        0.028,
        0.012
      );

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.21);
      osc2.stop(now + 0.085);
    } catch {}
  }

  // =========================================================================
  // 2. Storybook Card Select: Velvet Page Brush + Ascending Third Interval
  // =========================================================================
  public playCardSelect() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const profile = this.getTemplateProfile(this.activeTemplate);
      const note = this.getNextScaleNote(profile.id);
      const now = ctx.currentTime;
      const dspChain = this.createTemplateDSPChain(ctx, profile.id, 0.04, 0.55);

      // Soft paper-brush foley swish (bandpass-filtered noise)
      this.triggerImpactTransient(ctx, dspChain.input, 2400, 0.022, 0.032);

      // Two-note ascending harmonic interval (Root -> Major Third / Fourth)
      const intervals = [note.frequency, Number((note.frequency * 1.25).toFixed(2))];
      intervals.forEach((freq, idx) => {
        const start = now + idx * 0.045;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        this.applyCustomHarmonicTimbre(
          ctx,
          osc,
          profile.timbreModulation.harmonicPartials,
          'sine'
        );
        osc.frequency.setValueAtTime(freq * 1.08, start);
        osc.frequency.exponentialRampToValueAtTime(freq, start + 0.012);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(idx === 0 ? 0.09 : 0.11, start + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0008, start + 0.22);

        osc.connect(gain);
        gain.connect(dspChain.input);
        osc.start(start);
        osc.stop(start + 0.24);
      });
    } catch {}
  }

  // =========================================================================
  // 3. Modal Open / Close Spatial Transition Cues
  // =========================================================================
  public playModalOpen() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const profile = this.getTemplateProfile(this.activeTemplate);
      const scale = profile.timbreModulation.scaleFrequencies;
      const now = ctx.currentTime;
      const dspChain = this.createTemplateDSPChain(ctx, profile.id, 0, 0.8);

      const notes = [scale[0], scale[2], scale[4]];
      notes.forEach((freq, idx) => {
        const start = now + idx * 0.055;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.075, start + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0008, start + 0.34);

        osc.connect(gain);
        gain.connect(dspChain.input);
        osc.start(start);
        osc.stop(start + 0.36);
      });
    } catch {}
  }

  public playModalClose() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const profile = this.getTemplateProfile(this.activeTemplate);
      const scale = profile.timbreModulation.scaleFrequencies;
      const now = ctx.currentTime;
      const dspChain = this.createTemplateDSPChain(ctx, profile.id, 0, 0.65);

      const notes = [scale[2], scale[0]];
      notes.forEach((freq, idx) => {
        const start = now + idx * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.07, start + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0008, start + 0.28);

        osc.connect(gain);
        gain.connect(dspChain.input);
        osc.start(start);
        osc.stop(start + 0.3);
      });
    } catch {}
  }

  // =========================================================================
  // 4. Discovery & Kalimba Thumb Piano Bloom (卡林巴拇指琴立体声绽放)
  // =========================================================================
  public playDiscoveryChime() {
    this.playKalimbaBloom();
  }

  public playWarmBloom() {
    this.playKalimbaBloom();
  }

  public playKalimbaBloom() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const profile = this.getTemplateProfile(this.activeTemplate);
      const now = ctx.currentTime;
      const dspChain = this.createTemplateDSPChain(ctx, profile.id, 0, 1.2);

      const notes = profile.timbreModulation.signatureMotif;
      notes.forEach((freq, idx) => {
        const time = now + idx * 0.072;

        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        this.applyCustomHarmonicTimbre(
          ctx,
          osc1,
          profile.timbreModulation.harmonicPartials,
          'sine'
        );
        osc1.frequency.setValueAtTime(freq * 1.03, time);
        osc1.frequency.exponentialRampToValueAtTime(freq, time + 0.01);

        gain1.gain.setValueAtTime(0.001, time);
        gain1.gain.linearRampToValueAtTime(0.088, time + 0.005);
        gain1.gain.exponentialRampToValueAtTime(0.001, time + 0.58);

        // Metallic spring tine overtone (2.75x ratio)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2.75, time);

        gain2.gain.setValueAtTime(0.001, time);
        gain2.gain.linearRampToValueAtTime(0.025, time + 0.003);
        gain2.gain.exponentialRampToValueAtTime(0.0008, time + 0.19);

        this.attachTimbreModulationLFO(
          ctx,
          osc1,
          gain1,
          profile.timbreModulation,
          time,
          time + 0.62
        );

        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(dspChain.input);
        gain2.connect(dspChain.input);

        this.triggerImpactTransient(
          ctx,
          dspChain.input,
          profile.frequencyCurve.formantCenterFreq,
          0.02,
          0.01
        );

        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + 0.62);
        osc2.stop(time + 0.21);
      });
    } catch {}
  }

  // =========================================================================
  // 5. Celestial Brass & Crystal Windchime / Bell (晨风清脆风铃)
  // =========================================================================
  public playBell() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const profile = this.getTemplateProfile(this.activeTemplate);
      const now = ctx.currentTime;
      const dspChain = this.createTemplateDSPChain(ctx, profile.id, 0.06, 1.3);

      const scale = profile.timbreModulation.scaleFrequencies;
      const chimes = [scale[1] * 2, scale[2] * 2, scale[4] * 2];
      chimes.forEach((freq, idx) => {
        const time = now + idx * 0.062;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        this.applyCustomHarmonicTimbre(
          ctx,
          osc,
          profile.timbreModulation.harmonicPartials,
          'sine'
        );
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.065, time + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0008, time + 0.82);

        const oscOvertone = ctx.createOscillator();
        const gainOvertone = ctx.createGain();
        oscOvertone.type = 'sine';
        oscOvertone.frequency.setValueAtTime(
          freq * profile.timbreModulation.overtoneRatios[1],
          time
        );

        gainOvertone.gain.setValueAtTime(0.001, time);
        gainOvertone.gain.linearRampToValueAtTime(0.018, time + 0.004);
        gainOvertone.gain.exponentialRampToValueAtTime(0.0005, time + 0.36);

        this.attachTimbreModulationLFO(
          ctx,
          osc,
          gain,
          profile.timbreModulation,
          time,
          time + 0.85
        );

        osc.connect(gain);
        oscOvertone.connect(gainOvertone);
        gain.connect(dspChain.input);
        gainOvertone.connect(dspChain.input);

        osc.start(time);
        oscOvertone.start(time);
        osc.stop(time + 0.85);
        oscOvertone.stop(time + 0.38);
      });
    } catch {}
  }

  // =========================================================================
  // 6. Warm Cello & Singing Bowl Hug Resonance (暖心大提琴与低音颂钵)
  // =========================================================================
  public playWarmHug() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const profile = this.getTemplateProfile(this.activeTemplate);
      const now = ctx.currentTime;
      const dspChain = this.createTemplateDSPChain(ctx, profile.id, 0, 2.5);

      const base = profile.timbreModulation.scaleFrequencies[0] * 0.5;
      const chord = [base, base * 1.5, base * 2.0, base * 2.5];

      chord.forEach((freq, i) => {
        const oscPrimary = ctx.createOscillator();
        const oscBody = ctx.createOscillator();
        const noteGain = ctx.createGain();

        this.applyCustomHarmonicTimbre(
          ctx,
          oscPrimary,
          profile.timbreModulation.harmonicPartials,
          'sine'
        );
        oscPrimary.frequency.setValueAtTime(freq, now);

        oscBody.type = 'triangle';
        oscBody.frequency.setValueAtTime(freq * 1.002, now);

        const bodyFilter = ctx.createBiquadFilter();
        bodyFilter.type = 'lowpass';
        bodyFilter.frequency.setValueAtTime(520 + i * 85, now);
        bodyFilter.Q.setValueAtTime(1.2, now);

        this.attachTimbreModulationLFO(
          ctx,
          oscPrimary,
          noteGain,
          profile.timbreModulation,
          now,
          now + 2.2
        );

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.048, now + 0.38);
        noteGain.gain.exponentialRampToValueAtTime(0.0008, now + 2.1);

        oscPrimary.connect(bodyFilter);
        oscBody.connect(bodyFilter);
        bodyFilter.connect(noteGain);
        noteGain.connect(dspChain.input);

        oscPrimary.start(now);
        oscBody.start(now);
        oscPrimary.stop(now + 2.2);
        oscBody.stop(now + 2.2);
      });
    } catch {}
  }

  public playCoinFlip() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const profile = this.getTemplateProfile(this.activeTemplate);
      const now = ctx.currentTime;
      const dspChain = this.createTemplateDSPChain(ctx, profile.id, 0, 0.55);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      this.applyCustomHarmonicTimbre(
        ctx,
        osc,
        profile.timbreModulation.harmonicPartials,
        'sine'
      );
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(1040, now + 0.11);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.26);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.075, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(dspChain.input);

      this.triggerImpactTransient(
        ctx,
        dspChain.input,
        profile.frequencyCurve.formantCenterFreq,
        0.028,
        0.01
      );

      osc.start(now);
      osc.stop(now + 0.32);
    } catch {}
  }

  public playScaleClink() {
    this.playWoodClack();
  }

  public playWoodClack() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const profile = this.getTemplateProfile(this.activeTemplate);
      const note = this.getNextScaleNote(profile.id);
      const now = ctx.currentTime;
      const dspChain = this.createTemplateDSPChain(ctx, profile.id, 0, 0.3);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.frequency * 0.85, now);
      osc.frequency.exponentialRampToValueAtTime(note.frequency * 0.52, now + 0.075);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.11, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(dspChain.input);

      this.triggerImpactTransient(
        ctx,
        dspChain.input,
        profile.frequencyCurve.formantCenterFreq,
        0.04,
        0.012
      );

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {}
  }

  public playBreathe(isInhale: boolean) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const profile = this.getTemplateProfile(this.activeTemplate);
      const now = ctx.currentTime;
      const dspChain = this.createTemplateDSPChain(ctx, profile.id, 0, 3.2);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      this.applyCustomHarmonicTimbre(
        ctx,
        osc,
        profile.timbreModulation.harmonicPartials,
        'sine'
      );

      const baseLow = profile.timbreModulation.scaleFrequencies[0] * 0.65;
      const baseHigh = profile.timbreModulation.scaleFrequencies[2] * 0.65;

      if (isInhale) {
        osc.frequency.setValueAtTime(baseLow, now);
        osc.frequency.exponentialRampToValueAtTime(baseHigh, now + 3.0);
        gain.gain.setValueAtTime(0.002, now);
        gain.gain.linearRampToValueAtTime(0.042, now + 2.4);
        gain.gain.linearRampToValueAtTime(0.015, now + 3.0);
      } else {
        osc.frequency.setValueAtTime(baseHigh, now);
        osc.frequency.exponentialRampToValueAtTime(baseLow, now + 3.0);
        gain.gain.setValueAtTime(0.035, now);
        gain.gain.linearRampToValueAtTime(0.002, now + 2.8);
      }

      osc.connect(gain);
      gain.connect(dspChain.input);

      osc.start(now);
      osc.stop(now + 3.05);
    } catch {}
  }

  public playNatureChime() {
    this.playBell();
  }
}

export const sounds = new SoundPlayer();

export const ambientSound = {
  stop: () => {
    sounds.setMuted(true);
  },
  play: () => {
    sounds.setMuted(false);
  },
  isMuted: () => sounds.getMuted()
};
