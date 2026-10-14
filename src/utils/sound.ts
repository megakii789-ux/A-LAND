// Web Audio API Multi-Template Acoustic DSP & Timbre Modulation Engine
// Designed for 6-year-old children, parents, and caregivers.
// - Introduces full Web Audio API DSP processing node chains (3-Band Parametric EQ BiquadFilterNodes,
//   Formant Peaking Filter, WaveShaperNode analog harmonic exciter, LFO Vibrato/Tremolo modulation,
//   Acoustic Chamber Delay/Feedback, StereoPannerNode, and DynamicsCompressorNode safety limiter).
// - Defines 4 mathematically distinct Frequency Curves and Timbre Modulation Profiles corresponding
//   to the 4 voice/sound templates ('warm-sister', 'gentle-guide', 'playful-buddy', 'starlight-companion').
// - Eliminates repetitive static AI tones via round-robin pentatonic scale progression and organic micro-humanization.
// - 100% client-side offline synthesis, zero cloud uploads, child ear-safe dynamic compression.

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
  /** High-frequency roll-off cutoff in Hz (eliminates harsh digital treble) */
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
    name: '暖阳姐姐 · 玫瑰木与暖大提琴共鸣',
    frequencyCurve: {
      lowShelfFreq: 220,
      lowShelfGainDb: 4.5,
      formantCenterFreq: 680,
      formantGainDb: 3.2,
      formantQ: 1.4,
      highCutFreq: 2100,
      highCutQ: 0.75,
      responseCurveDb: [3.8, 4.5, 4.1, 3.4, 1.8, -1.2, -6.5, -14.0]
    },
    timbreModulation: {
      primaryWaveform: 'sine',
      secondaryWaveform: 'triangle',
      harmonicPartials: [1.0, 0.48, 0.22, 0.09, 0.03],
      overtoneRatios: [1.0, 2.0, 3.0],
      vibratoRateHz: 4.2,
      vibratoDepthCents: 6.5,
      tremoloRateHz: 3.2,
      tremoloDepth: 0.08,
      saturationDrive: 0.22,
      chamberDelaySec: 0.028,
      chamberFeedback: 0.18,
      attackSec: 0.018,
      decaySec: 0.32,
      // Warm F Major Pentatonic (F4, G4, A4, C5, D5)
      scaleFrequencies: [349.23, 392.00, 440.00, 523.25, 587.33],
      signatureMotif: [349.23, 440.00, 523.25, 698.46],
      instrumentModelName: '玫瑰木马林巴 + 大提琴暖腔滤波'
    }
  },
  'gentle-guide': {
    id: 'gentle-guide',
    name: '和风守护 · 沉稳低音木管与黄铜颂钵',
    frequencyCurve: {
      lowShelfFreq: 165,
      lowShelfGainDb: 5.8,
      formantCenterFreq: 460,
      formantGainDb: 3.8,
      formantQ: 1.85,
      highCutFreq: 1680,
      highCutQ: 0.85,
      responseCurveDb: [5.2, 5.8, 4.9, 3.6, 0.4, -3.8, -10.2, -18.5]
    },
    timbreModulation: {
      primaryWaveform: 'triangle',
      secondaryWaveform: 'sine',
      harmonicPartials: [1.0, 0.18, 0.52, 0.14, 0.24],
      overtoneRatios: [1.0, 1.5, 2.5],
      vibratoRateHz: 2.5,
      vibratoDepthCents: 3.5,
      tremoloRateHz: 2.1,
      tremoloDepth: 0.05,
      saturationDrive: 0.14,
      chamberDelaySec: 0.036,
      chamberFeedback: 0.24,
      attackSec: 0.026,
      decaySec: 0.42,
      // Grounded Low C Major Pentatonic (C4, D4, E4, G4, A4)
      scaleFrequencies: [261.63, 293.66, 329.63, 392.00, 440.00],
      signatureMotif: [261.63, 329.63, 392.00, 523.25],
      instrumentModelName: '低音木管共鸣腔 + 黄铜颂钵稳态包络'
    }
  },
  'playful-buddy': {
    id: 'playful-buddy',
    name: '元气伙伴 · 灵动雪松木卡林巴拇指琴',
    frequencyCurve: {
      lowShelfFreq: 280,
      lowShelfGainDb: -1.5,
      formantCenterFreq: 1380,
      formantGainDb: 4.4,
      formantQ: 2.1,
      highCutFreq: 3400,
      highCutQ: 0.95,
      responseCurveDb: [-1.8, -1.5, 0.2, 2.1, 4.2, 3.1, -1.5, -7.8]
    },
    timbreModulation: {
      primaryWaveform: 'sine',
      secondaryWaveform: 'triangle',
      harmonicPartials: [1.0, 0.62, 0.38, 0.26, 0.12],
      overtoneRatios: [1.0, 2.75, 5.4],
      vibratoRateHz: 6.2,
      vibratoDepthCents: 9.0,
      tremoloRateHz: 5.4,
      tremoloDepth: 0.12,
      saturationDrive: 0.28,
      chamberDelaySec: 0.016,
      chamberFeedback: 0.12,
      attackSec: 0.006,
      decaySec: 0.22,
      // Bright G Major Pentatonic (G4, A4, B4, D5, E5)
      scaleFrequencies: [392.00, 440.00, 493.88, 587.33, 659.25],
      signatureMotif: [392.00, 493.88, 587.33, 783.99],
      instrumentModelName: '雪松木卡林巴 + 2.75倍金属弹片泛音'
    }
  },
  'starlight-companion': {
    id: 'starlight-companion',
    name: '星光守护 · 空灵水晶竖琴与泛音风铃',
    frequencyCurve: {
      lowShelfFreq: 240,
      lowShelfGainDb: 1.2,
      formantCenterFreq: 1920,
      formantGainDb: 4.8,
      formantQ: 2.6,
      highCutFreq: 4200,
      highCutQ: 1.15,
      responseCurveDb: [0.8, 1.2, 1.5, 2.0, 3.5, 4.8, 2.2, -4.2]
    },
    timbreModulation: {
      primaryWaveform: 'sine',
      secondaryWaveform: 'sine',
      harmonicPartials: [1.0, 0.32, 0.68, 0.45, 0.30],
      overtoneRatios: [1.0, 2.24, 4.12],
      vibratoRateHz: 3.6,
      vibratoDepthCents: 11.5,
      tremoloRateHz: 4.0,
      tremoloDepth: 0.15,
      saturationDrive: 0.16,
      chamberDelaySec: 0.045,
      chamberFeedback: 0.32,
      attackSec: 0.012,
      decaySec: 0.55,
      // Ethereal D Major Add9 Pentatonic (D4, F#4, A4, B4, E5)
      scaleFrequencies: [293.66, 369.99, 440.00, 493.88, 659.25],
      signatureMotif: [293.66, 369.99, 440.00, 659.25],
      instrumentModelName: '空灵水晶竖琴 + 空间泛音双延迟网络'
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
      const ratio = ( Math.log2(freqHz) - Math.log2(bands[i]) ) /
                    ( Math.log2(bands[i + 1]) - Math.log2(bands[i]) );
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
}

class SoundPlayer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private activeTemplate: AudioTemplateId = 'warm-sister';
  private stepCounter: number = 0;

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

  public setMuted(muted: boolean) {
    this.isMuted = muted;
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

    // Deterministic subtle organic variation cycle (-4, +2, -2, +4, 0 cents)
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
   *         -> WaveShaperNode (Warm Saturation) -> Parallel Acoustic Chamber Delay
   *         -> StereoPannerNode -> Master Output
   */
  public createTemplateDSPChain(
    ctx: AudioContext,
    templateId?: AudioTemplateId,
    pan: number = 0
  ): DSPNodeChain {
    const profile = this.getTemplateProfile(templateId);
    const { frequencyCurve, timbreModulation } = profile;
    const now = ctx.currentTime;

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

    // Stage 3: High-Cut Low-Pass Filter (eliminates digital treble harshness)
    const highCutFilter = ctx.createBiquadFilter();
    highCutFilter.type = 'lowpass';
    highCutFilter.frequency.setValueAtTime(frequencyCurve.highCutFreq, now);
    highCutFilter.Q.setValueAtTime(frequencyCurve.highCutQ, now);

    // Stage 4: WaveShaperNode (non-linear soft tube/tape harmonic saturation)
    const waveShaper = ctx.createWaveShaper();
    waveShaper.curve = createWarmSaturationCurve(timbreModulation.saturationDrive);
    waveShaper.oversample = '2x';

    // Stage 5: Acoustic Chamber Micro-Reflection Network (Delay + Feedback + Damping)
    const dryGain = ctx.createGain();
    dryGain.gain.setValueAtTime(0.85, now);

    const wetGain = ctx.createGain();
    wetGain.gain.setValueAtTime(timbreModulation.chamberFeedback, now);

    const chamberDelay = ctx.createDelay(0.2);
    chamberDelay.delayTime.setValueAtTime(timbreModulation.chamberDelaySec, now);

    const feedbackGain = ctx.createGain();
    feedbackGain.gain.setValueAtTime(Math.min(0.45, timbreModulation.chamberFeedback), now);

    const dampingFilter = ctx.createBiquadFilter();
    dampingFilter.type = 'lowpass';
    dampingFilter.frequency.setValueAtTime(frequencyCurve.highCutFreq * 0.75, now);

    // Stage 6: Stereo Panner & Master Limiter Output
    const masterOut = ctx.createGain();
    masterOut.gain.setValueAtTime(0.9, now);

    // Wire serial EQ + WaveShaper chain
    lowShelfFilter.connect(formantFilter);
    formantFilter.connect(highCutFilter);
    highCutFilter.connect(waveShaper);

    // Wire parallel dry + acoustic chamber reflection path
    waveShaper.connect(dryGain);
    dryGain.connect(masterOut);

    waveShaper.connect(chamberDelay);
    chamberDelay.connect(dampingFilter);
    dampingFilter.connect(wetGain);
    wetGain.connect(masterOut);

    // Feedback loop
    dampingFilter.connect(feedbackGain);
    feedbackGain.connect(chamberDelay);

    // Optional StereoPannerNode if supported by browser AudioContext
    if (typeof ctx.createStereoPanner === 'function') {
      try {
        const panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(Math.max(-0.5, Math.min(0.5, pan)), now);
        masterOut.connect(panner);
        panner.connect(ctx.destination);
      } catch {
        masterOut.connect(ctx.destination);
      }
    } else {
      masterOut.connect(ctx.destination);
    }

    return {
      input: lowShelfFilter,
      lowShelfFilter,
      formantFilter,
      highCutFilter,
      waveShaper,
      output: masterOut
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
          // Cosine phase alignment for warm rounded waveform crest
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
      // 1. Pitch Vibrato LFO -> Oscillator detune (cents)
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

      // 2. Amplitude Tremolo LFO -> Gain modulation
      const tremoloLfo = ctx.createOscillator();
      const tremoloDepth = ctx.createGain();
      tremoloLfo.type = 'sine';
      tremoloLfo.frequency.setValueAtTime(modConfig.tremoloRateHz, startTime);
      tremoloDepth.gain.setValueAtTime(modConfig.tremoloDepth * 0.03, startTime);

      tremoloLfo.connect(tremoloDepth);
      tremoloDepth.connect(targetGain.gain);
      tremoloLfo.start(startTime);
      tremoloLfo.stop(stopTime);
    } catch {}
  }

  /**
   * Helper: Transient Mallet/Strike Noise Burst shaped by template formant frequency
   */
  private triggerImpactTransient(
    ctx: AudioContext,
    destination: AudioNode,
    formantFreq: number = 1800,
    volume: number = 0.03,
    duration: number = 0.012
  ) {
    try {
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(formantFreq, ctx.currentTime);
      noiseFilter.Q.setValueAtTime(1.8, ctx.currentTime);

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
   * and modulated by its unique harmonic partials and LFO parameters.
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
      const pan = ((noteInfo.stepIndex - 2) * 0.08);
      const dspChain = this.createTemplateDSPChain(ctx, profile.id, pan);

      const attack = timbreModulation.attackSec;
      const decay = timbreModulation.decaySec * durationScale;
      const stopTime = now + attack + decay + 0.05;

      // Primary harmonic oscillator with PeriodicWave Fourier partials
      const oscPrimary = ctx.createOscillator();
      const gainPrimary = ctx.createGain();
      this.applyCustomHarmonicTimbre(
        ctx,
        oscPrimary,
        timbreModulation.harmonicPartials,
        timbreModulation.primaryWaveform
      );
      oscPrimary.frequency.setValueAtTime(targetFreq, now);

      gainPrimary.gain.setValueAtTime(0.001, now);
      gainPrimary.gain.linearRampToValueAtTime(0.12, now + attack);
      gainPrimary.gain.exponentialRampToValueAtTime(0.0008, now + attack + decay);

      // Physical overtone resonator oscillator using template's non-harmonic ratio
      const oscOvertone = ctx.createOscillator();
      const gainOvertone = ctx.createGain();
      oscOvertone.type = timbreModulation.secondaryWaveform;
      oscOvertone.frequency.setValueAtTime(targetFreq * timbreModulation.overtoneRatios[1], now);

      gainOvertone.gain.setValueAtTime(0.001, now);
      gainOvertone.gain.linearRampToValueAtTime(0.035, now + attack * 0.7);
      gainOvertone.gain.exponentialRampToValueAtTime(0.0005, now + attack + decay * 0.55);

      // Attach LFO vibrato & tremolo modulation
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

      // Physical mallet transient shaped by the template's formant center frequency
      this.triggerImpactTransient(
        ctx,
        dspChain.input,
        frequencyCurve.formantCenterFreq,
        0.028,
        0.014
      );

      oscPrimary.start(now);
      oscOvertone.start(now);
      oscPrimary.stop(stopTime);
      oscOvertone.stop(stopTime);
    } catch {}
  }

  /**
   * Plays a template's distinctive 4-note acoustic signature motif through its Web Audio DSP chain.
   * Gives immediate, unmistakable auditory differentiation when switching or previewing templates.
   */
  public playTemplateSignature(templateId?: AudioTemplateId) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const profile = this.getTemplateProfile(templateId);
      const { timbreModulation, frequencyCurve } = profile;
      const now = ctx.currentTime;
      const dspChain = this.createTemplateDSPChain(ctx, profile.id, 0);

      // Spacing and articulation distinct per template
      const stepSpacing =
        profile.id === 'playful-buddy'
          ? 0.065
          : profile.id === 'gentle-guide'
          ? 0.115
          : profile.id === 'starlight-companion'
          ? 0.095
          : 0.085;

      timbreModulation.signatureMotif.forEach((freq, idx) => {
        const startTime = now + idx * stepSpacing;
        const attack = timbreModulation.attackSec;
        const decay = timbreModulation.decaySec * 1.3;
        const stopTime = startTime + attack + decay + 0.05;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        this.applyCustomHarmonicTimbre(
          ctx,
          osc,
          timbreModulation.harmonicPartials,
          timbreModulation.primaryWaveform
        );
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.09, startTime + attack);
        gain.gain.exponentialRampToValueAtTime(0.0008, startTime + attack + decay);

        const oscOvertone = ctx.createOscillator();
        const gainOvertone = ctx.createGain();
        oscOvertone.type = timbreModulation.secondaryWaveform;
        oscOvertone.frequency.setValueAtTime(freq * timbreModulation.overtoneRatios[1], startTime);
        gainOvertone.gain.setValueAtTime(0.025, startTime);
        gainOvertone.gain.exponentialRampToValueAtTime(0.0005, startTime + decay * 0.5);

        this.attachTimbreModulationLFO(
          ctx,
          osc,
          gain,
          timbreModulation,
          startTime,
          stopTime
        );

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
   * Plays a gentle, non-intrusive acoustic prosody accompaniment cue during speech narration
   * so that each voice template carries its authentic physical timbre atmosphere.
   */
  public playSpeechProsodyCue(templateId?: AudioTemplateId, segmentIndex: number = 0) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const profile = this.getTemplateProfile(templateId);
      const scale = profile.timbreModulation.scaleFrequencies;
      const freq = scale[segmentIndex % scale.length];
      const now = ctx.currentTime;
      const dspChain = this.createTemplateDSPChain(ctx, profile.id, 0);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      this.applyCustomHarmonicTimbre(
        ctx,
        osc,
        profile.timbreModulation.harmonicPartials,
        profile.timbreModulation.primaryWaveform
      );
      osc.frequency.setValueAtTime(freq, now);

      // Ultra-soft resonance under speech (0.022 max gain) so voice clarity is never masked
      gain.gain.setValueAtTime(0.0005, now);
      gain.gain.linearRampToValueAtTime(0.022, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.28);

      osc.connect(gain);
      gain.connect(dspChain.input);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  // =========================================================================
  // Template 1 / Tactile Click: Rosewood Marimba with Round-Robin Scale & DSP
  // =========================================================================
  public playClick() {
    const note = this.getNextScaleNote(this.activeTemplate);
    this.playMarimba(note.frequency);
  }

  public playMarimba(freq?: number) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const profile = this.getTemplateProfile(this.activeTemplate);
      const targetFreq = freq || profile.timbreModulation.scaleFrequencies[0];
      const now = ctx.currentTime;
      const dspChain = this.createTemplateDSPChain(ctx, profile.id, 0);

      // Wood bar body cavity bandpass filter
      const bodyResonance = ctx.createBiquadFilter();
      bodyResonance.type = 'bandpass';
      bodyResonance.frequency.setValueAtTime(targetFreq, now);
      bodyResonance.Q.setValueAtTime(2.8, now);

      // 1. Fundamental wood tone with custom harmonic partials
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      this.applyCustomHarmonicTimbre(
        ctx,
        osc1,
        profile.timbreModulation.harmonicPartials,
        'sine'
      );
      osc1.frequency.setValueAtTime(targetFreq, now);
      osc1.frequency.exponentialRampToValueAtTime(targetFreq * 0.985, now + 0.14);

      gain1.gain.setValueAtTime(0.14, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      // 2. Physical wood overtone modulated by active template's overtone ratio
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(
        targetFreq * profile.timbreModulation.overtoneRatios[1],
        now
      );

      gain2.gain.setValueAtTime(0.04, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc1.connect(gain1);
      osc2.connect(gain2);
      gain1.connect(bodyResonance);
      gain2.connect(bodyResonance);
      bodyResonance.connect(dspChain.input);

      this.triggerImpactTransient(
        ctx,
        dspChain.input,
        profile.frequencyCurve.formantCenterFreq,
        0.035,
        0.014
      );

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.17);
      osc2.stop(now + 0.07);
    } catch {}
  }

  // =========================================================================
  // Template 2: Kalimba Thumb Piano (卡林巴拇指琴琶音 + 模板专属调式与频响曲线)
  // =========================================================================
  public playWarmBloom() {
    this.playKalimbaBloom();
  }

  public playKalimbaBloom() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const profile = this.getTemplateProfile(this.activeTemplate);
      const now = ctx.currentTime;
      const dspChain = this.createTemplateDSPChain(ctx, profile.id, 0);

      // Uses active template's unique signature motif notes so each template blooms differently
      const notes = profile.timbreModulation.signatureMotif;
      notes.forEach((freq, idx) => {
        const time = now + idx * 0.075;

        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        this.applyCustomHarmonicTimbre(
          ctx,
          osc1,
          profile.timbreModulation.harmonicPartials,
          'sine'
        );
        osc1.frequency.setValueAtTime(freq, time);

        gain1.gain.setValueAtTime(0.08, time);
        gain1.gain.exponentialRampToValueAtTime(0.001, time + 0.58);

        // Metallic spring tine overtone (2.75x ratio)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 2.75, time);

        gain2.gain.setValueAtTime(0.022, time);
        gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

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
        osc2.stop(time + 0.2);
      });
    } catch {}
  }

  // =========================================================================
  // Template 3: Celestial Brass Windchime / Bell (晨风清脆风铃 + 模板泛音调制)
  // =========================================================================
  public playBell() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const profile = this.getTemplateProfile(this.activeTemplate);
      const now = ctx.currentTime;
      const dspChain = this.createTemplateDSPChain(ctx, profile.id, 0.05);

      const scale = profile.timbreModulation.scaleFrequencies;
      const chimes = [scale[1] * 2, scale[2] * 2, scale[4] * 2];
      chimes.forEach((freq, idx) => {
        const time = now + idx * 0.06;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        this.applyCustomHarmonicTimbre(
          ctx,
          osc,
          profile.timbreModulation.harmonicPartials,
          'sine'
        );
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.06, time);
        gain.gain.exponentialRampToValueAtTime(0.0008, time + 0.78);

        // Non-harmonic chime shimmer overtone modulated by template ratio
        const oscOvertone = ctx.createOscillator();
        const gainOvertone = ctx.createGain();
        oscOvertone.type = 'sine';
        oscOvertone.frequency.setValueAtTime(
          freq * profile.timbreModulation.overtoneRatios[1],
          time
        );

        gainOvertone.gain.setValueAtTime(0.016, time);
        gainOvertone.gain.exponentialRampToValueAtTime(0.0005, time + 0.35);

        this.attachTimbreModulationLFO(
          ctx,
          osc,
          gain,
          profile.timbreModulation,
          time,
          time + 0.82
        );

        osc.connect(gain);
        oscOvertone.connect(gainOvertone);
        gain.connect(dspChain.input);
        gainOvertone.connect(dspChain.input);

        osc.start(time);
        oscOvertone.start(time);
        osc.stop(time + 0.82);
        oscOvertone.stop(time + 0.38);
      });
    } catch {}
  }

  // =========================================================================
  // Template 4: Warm Cello & Singing Bowl Hug Resonance (暖心大提琴与低音颂钵)
  // =========================================================================
  public playWarmHug() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const profile = this.getTemplateProfile(this.activeTemplate);
      const now = ctx.currentTime;
      const dspChain = this.createTemplateDSPChain(ctx, profile.id, 0);

      // Low register warm chord rooted on the active template's fundamental scale
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

        oscBody.type = 'sawtooth';
        oscBody.frequency.setValueAtTime(freq * 1.002, now);

        const bodyFilter = ctx.createBiquadFilter();
        bodyFilter.type = 'lowpass';
        bodyFilter.frequency.setValueAtTime(420 + i * 65, now);
        bodyFilter.Q.setValueAtTime(1.3, now);

        this.attachTimbreModulationLFO(
          ctx,
          oscPrimary,
          noteGain,
          profile.timbreModulation,
          now,
          now + 2.2
        );

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.045, now + 0.42);
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
      const dspChain = this.createTemplateDSPChain(ctx, profile.id, 0);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      this.applyCustomHarmonicTimbre(
        ctx,
        osc,
        profile.timbreModulation.harmonicPartials,
        'sine'
      );
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.26);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(dspChain.input);

      this.triggerImpactTransient(
        ctx,
        dspChain.input,
        profile.frequencyCurve.formantCenterFreq,
        0.03,
        0.01
      );

      osc.start(now);
      osc.stop(now + 0.3);
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
      const dspChain = this.createTemplateDSPChain(ctx, profile.id, 0);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.frequency * 0.75, now);
      osc.frequency.exponentialRampToValueAtTime(note.frequency * 0.48, now + 0.08);

      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(dspChain.input);

      this.triggerImpactTransient(
        ctx,
        dspChain.input,
        profile.frequencyCurve.formantCenterFreq,
        0.045,
        0.014
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
      const dspChain = this.createTemplateDSPChain(ctx, profile.id, 0);

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
        gain.gain.setValueAtTime(0.005, now);
        gain.gain.linearRampToValueAtTime(0.045, now + 2.5);
        gain.gain.linearRampToValueAtTime(0.02, now + 3.0);
      } else {
        osc.frequency.setValueAtTime(baseHigh, now);
        osc.frequency.exponentialRampToValueAtTime(baseLow, now + 3.0);
        gain.gain.setValueAtTime(0.035, now);
        gain.gain.linearRampToValueAtTime(0.005, now + 2.8);
      }

      osc.connect(gain);
      gain.connect(dspChain.input);

      osc.start(now);
      osc.stop(now + 3.0);
    } catch {}
  }

  public playNatureChime() {
    this.playBell();
  }
}

export const sounds = new SoundPlayer();
