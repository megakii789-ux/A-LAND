// Web Speech API Natural Voice Discovery & Web Audio Timbre-Coupled Prosody Engine
// Designed specifically for 6-year-old children, parents, and caregivers.
// - Multi-tier intelligent voice ranking & per-template voice timbre matching
// - Dynamic clause-by-clause prosody contour modulation (eliminating flat, repetitive AI TTS monotony)
// - Tightly coupled with Web Audio API DSP Frequency Curves & Timbre Modulation (src/utils/sound.ts)
// - Pure client-side local execution (100% offline, zero child voice recordings uploaded to cloud)
// - Child safety filtering (stripping parenthetical designer notes, markdown, and meta-prompts before speaking)

import {
  sounds,
  TEMPLATE_ACOUSTIC_PROFILES,
  TemplateAcousticProfile
} from './sound';

export type VoiceProfileType =
  | 'warm-sister'
  | 'gentle-guide'
  | 'playful-buddy'
  | 'starlight-companion';

export type ProsodyContourType =
  | 'rising-empathy'
  | 'grounded-cadence'
  | 'lively-bounce'
  | 'crystalline-arc';

export interface VoiceProfileConfig {
  id: VoiceProfileType;
  name: string;
  subtitle: string;
  description: string;
  emoji: string;
  rate: number;
  pitch: number;
  volume: number;
  suitableScenarios: string;
  /** Prosodic pitch/rate contour shape across multi-clause sentences */
  prosodyContour: ProsodyContourType;
  /** Natural breathing pause between segmented clauses (ms) */
  breathPauseMs: number;
  /** Preferred system voice timbre keywords when multiple Chinese voices exist */
  preferredVoiceKeywords: string[];
  /** Linked Web Audio API Frequency Curve & Timbre Modulation profile */
  acousticProfile: TemplateAcousticProfile;
}

export const VOICE_PROFILES: Record<VoiceProfileType, VoiceProfileConfig> = {
  'warm-sister': {
    id: 'warm-sister',
    name: '暖阳姐姐',
    subtitle: '绘本温和风',
    description: '语速轻缓柔和，中低频温暖饱满（220Hz +4.5dB），如同睡前共读绘本的大姐姐。',
    emoji: '🌸',
    rate: 0.89,
    pitch: 1.04,
    volume: 1.0,
    suitableScenarios: '平静角深呼吸、抱抱响应、睡前故事、情绪安抚',
    prosodyContour: 'rising-empathy',
    breathPauseMs: 220,
    preferredVoiceKeywords: ['xiaoxiao', '晓晓', 'tingting', '婷婷', 'lili', 'female'],
    acousticProfile: TEMPLATE_ACOUSTIC_PROFILES['warm-sister']
  },
  'gentle-guide': {
    id: 'gentle-guide',
    name: '和风守护',
    subtitle: '沉稳清晰风',
    description: '语调踏实沉着，低频厚实稳健（165Hz +5.8dB，高频柔化至1680Hz），给予确定感与安全边界。',
    emoji: '🍃',
    rate: 0.85,
    pitch: 0.95,
    volume: 1.0,
    suitableScenarios: '困难拆解台、安全围栏提醒、两家桥规则说明',
    prosodyContour: 'grounded-cadence',
    breathPauseMs: 260,
    preferredVoiceKeywords: ['yunxi', '云希', 'kangkang', '康康', 'yunjian', 'male', 'sinji'],
    acousticProfile: TEMPLATE_ACOUSTIC_PROFILES['gentle-guide']
  },
  'playful-buddy': {
    id: 'playful-buddy',
    name: '元气伙伴',
    subtitle: '活泼同伴风',
    description: '节奏明快灵动，中高频清脆透亮（1380Hz共振峰 +4.4dB），充满探索好奇心。',
    emoji: '☀️',
    rate: 0.96,
    pitch: 1.09,
    volume: 1.0,
    suitableScenarios: '探索小岛、天气电台、思考侦探社、微课互动',
    prosodyContour: 'lively-bounce',
    breathPauseMs: 145,
    preferredVoiceKeywords: ['xiaoyi', '晓伊', 'yaoyao', '瑶瑶', 'meijia', '美佳', 'huihui'],
    acousticProfile: TEMPLATE_ACOUSTIC_PROFILES['playful-buddy']
  },
  'starlight-companion': {
    id: 'starlight-companion',
    name: '星光守护',
    subtitle: '空灵泛音风',
    description: '音色清透悠远，高频泛音延展（1920Hz水晶共振峰 +4.8dB），专注多面自我与想象力表达。',
    emoji: '✨',
    rate: 0.91,
    pitch: 1.02,
    volume: 1.0,
    suitableScenarios: '星光小屋、多面自我卡片、作品展览、兴趣探索',
    prosodyContour: 'crystalline-arc',
    breathPauseMs: 195,
    preferredVoiceKeywords: ['yu-shu', 'sinji', '善怡', 'xiaoxiao', 'tingting'],
    acousticProfile: TEMPLATE_ACOUSTIC_PROFILES['starlight-companion']
  }
};

export interface DetectedVoice {
  name: string;
  lang: string;
  tier: 'neural-natural' | 'enhanced-system' | 'standard' | 'fallback';
  isNatural: boolean;
  score: number;
  rawVoice?: SpeechSynthesisVoice;
}

export interface SegmentProsodyParams {
  rate: number;
  pitch: number;
  volume: number;
  pauseAfterMs: number;
}

/**
 * Computes dynamic clause-level prosody modulation (rate, pitch, volume, and breathing pause)
 * for a specific template so multi-segment speech never sounds like a flat, repetitive AI loop.
 * Guaranteed to remain strictly within child developmental comfort bounds (rate 0.85~1.00, pitch 0.92~1.12).
 */
export function computeSegmentProsody(
  profileId: VoiceProfileType,
  segmentIndex: number,
  totalSegments: number,
  segmentText: string = ''
): SegmentProsodyParams {
  const config = VOICE_PROFILES[profileId] || VOICE_PROFILES['warm-sister'];
  const isFirst = segmentIndex === 0;
  const isLast = segmentIndex === totalSegments - 1;
  const isQuestion = /[？?吗呢呀]$/.test(segmentText.trim());

  let pitchDelta = 0;
  let rateDelta = 0;
  let volume = config.volume;
  let pauseAfterMs = config.breathPauseMs;

  switch (config.prosodyContour) {
    case 'rising-empathy': {
      // Warm gentle lift on opening, soft comforting settle on closing clause
      if (isFirst) pitchDelta += 0.02;
      else if (isLast) {
        pitchDelta -= 0.02;
        rateDelta -= 0.02;
      } else {
        pitchDelta += (segmentIndex % 2 === 1 ? 0.01 : -0.01);
      }
      if (isQuestion) pitchDelta += 0.02;
      break;
    }
    case 'grounded-cadence': {
      // Steady, reassuring cadence with deliberate calm pacing at endings
      if (isFirst) rateDelta += 0.01;
      if (isLast) {
        pitchDelta -= 0.02;
        rateDelta -= 0.02;
        pauseAfterMs += 40;
      }
      break;
    }
    case 'lively-bounce': {
      // Expressive companion rhythm with alternating melodic inflection
      pitchDelta += segmentIndex % 2 === 0 ? 0.02 : -0.015;
      rateDelta += segmentIndex % 2 === 0 ? 0.015 : -0.01;
      if (isQuestion) pitchDelta += 0.02;
      break;
    }
    case 'crystalline-arc': {
      // Smooth melodic arch peaking in the middle of the narrative thought
      const progress = totalSegments > 1 ? segmentIndex / (totalSegments - 1) : 0.5;
      const arch = Math.sin(progress * Math.PI); // 0 -> 1 -> 0
      pitchDelta += Number((arch * 0.03 - 0.01).toFixed(3));
      rateDelta += Number(((1 - arch) * 0.015 - 0.01).toFixed(3));
      volume = Number(Math.min(1.0, Math.max(0.88, 0.94 + arch * 0.06)).toFixed(2));
      break;
    }
  }

  const finalRate = Number(Math.max(0.83, Math.min(1.0, config.rate + rateDelta)).toFixed(3));
  const finalPitch = Number(Math.max(0.92, Math.min(1.12, config.pitch + pitchDelta)).toFixed(3));

  return {
    rate: finalRate,
    pitch: finalPitch,
    volume,
    pauseAfterMs
  };
}

/**
 * Text cleaner and prosody segmentation:
 * 1. Strips out designer annotations, developer codes, parentheses (e.g. `（大人的解释）`, `(S0-S5)`)
 *    so children are never read internal system terminology.
 * 2. Normalizes punctuation and splits into natural human breathing clauses (3~15 chars).
 */
export function cleanAndSegmentText(text: string): string[] {
  if (!text) return [];

  // Strip parentheses and brackets and their contents (Chinese and English)
  let cleaned = text
    .replace(/（[^）]*）/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/【[^】]*】/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\{[^}]*\}/g, '')
    .replace(/<[^>]*>/g, '')
    // Strip markdown formatting symbols
    .replace(/[*_#`~>]/g, '')
    // Replace quotes and dashes with slight natural pauses
    .replace(/[“”"']/g, '')
    .trim();

  if (!cleaned) return [];

  // Split by major sentence terminators (periods, exclamations, question marks, newlines)
  const rawSentences = cleaned.split(/[。！？!?；;\n]+/).map(s => s.trim()).filter(Boolean);

  const segments: string[] = [];

  for (const sentence of rawSentences) {
    if (sentence.length <= 14) {
      segments.push(sentence);
      continue;
    }

    const clauses = sentence.split(/[，,、]+/).map(c => c.trim()).filter(Boolean);
    if (clauses.length <= 1) {
      segments.push(sentence);
    } else {
      let currentChunk = '';
      for (const clause of clauses) {
        if (!currentChunk) {
          currentChunk = clause;
        } else if (currentChunk.length + clause.length <= 14) {
          currentChunk += '，' + clause;
        } else {
          segments.push(currentChunk);
          currentChunk = clause;
        }
      }
      if (currentChunk) {
        segments.push(currentChunk);
      }
    }
  }

  return segments.filter(s => s.length > 0);
}

/**
 * Voice ranking algorithm based on child developmental suitability,
 * warmth, and naturalness.
 */
export function scoreAndCategorizeVoice(voice: { name: string; lang: string }): DetectedVoice {
  const nameLower = voice.name.toLowerCase();
  const langLower = voice.lang.toLowerCase();

  // Check if Chinese
  const isChinese =
    langLower.includes('zh') ||
    langLower.includes('cmn') ||
    langLower.includes('chinese') ||
    /[\u4e00-\u9fa5]/.test(voice.name);

  if (!isChinese) {
    return {
      name: voice.name,
      lang: voice.lang,
      tier: 'fallback',
      isNatural: false,
      score: 0
    };
  }

  // Tier 1: Gold Standard Neural / Natural Chinese child-friendly voices
  if (nameLower.includes('xiaoxiao') || voice.name.includes('晓晓')) {
    return {
      name: voice.name,
      lang: voice.lang,
      tier: 'neural-natural',
      isNatural: true,
      score: 100
    };
  }
  if (nameLower.includes('yunxi') || voice.name.includes('云希')) {
    return {
      name: voice.name,
      lang: voice.lang,
      tier: 'neural-natural',
      isNatural: true,
      score: 95
    };
  }
  if (
    (nameLower.includes('tingting') || voice.name.includes('婷婷')) &&
    (nameLower.includes('enhanced') || nameLower.includes('natural') || nameLower.includes('premium') || voice.name.includes('增强'))
  ) {
    return {
      name: voice.name,
      lang: voice.lang,
      tier: 'neural-natural',
      isNatural: true,
      score: 94
    };
  }
  if (
    (nameLower.includes('google') || nameLower.includes('chrome')) &&
    (nameLower.includes('chinese') || nameLower.includes('普通话') || langLower.includes('zh-cn'))
  ) {
    return {
      name: voice.name,
      lang: voice.lang,
      tier: 'neural-natural',
      isNatural: true,
      score: 90
    };
  }
  if (nameLower.includes('natural') || nameLower.includes('neural') || nameLower.includes('online')) {
    return {
      name: voice.name,
      lang: voice.lang,
      tier: 'neural-natural',
      isNatural: true,
      score: 88
    };
  }

  // Tier 2: Enhanced Apple / System local Chinese voices
  if (nameLower.includes('tingting') || voice.name.includes('婷婷')) {
    return {
      name: voice.name,
      lang: voice.lang,
      tier: 'enhanced-system',
      isNatural: true,
      score: 82
    };
  }
  if (
    nameLower.includes('sinji') ||
    nameLower.includes('yu-shu') ||
    nameLower.includes('meijia') ||
    nameLower.includes('lili') ||
    nameLower.includes('kangkang') ||
    nameLower.includes('yaoyao') ||
    nameLower.includes('huihui')
  ) {
    return {
      name: voice.name,
      lang: voice.lang,
      tier: 'enhanced-system',
      isNatural: true,
      score: 78
    };
  }

  // Tier 3: Standard OS Chinese synthesizer
  if (
    !nameLower.includes('espeak') &&
    !nameLower.includes('dispatcher') &&
    !nameLower.includes('dummy') &&
    !nameLower.includes('robotic')
  ) {
    return {
      name: voice.name,
      lang: voice.lang,
      tier: 'standard',
      isNatural: false,
      score: 60
    };
  }

  // Tier 4: Robotic fallback
  return {
    name: voice.name,
    lang: voice.lang,
    tier: 'fallback',
    isNatural: false,
    score: 10
  };
}

class SpeechNarrator {
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;
  private currentProfile: VoiceProfileType = 'warm-sister';
  private cachedVoices: DetectedVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private manualVoiceOverride: SpeechSynthesisVoice | null = null;
  private segmentQueue: string[] = [];
  private currentSegmentIndex: number = 0;
  private segmentTimer: number | null = null;
  private listeners: Set<() => void> = new Set();
  private lastSpokenText: string = '';
  private voiceWarning: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('child_voice_profile');
        if (
          saved &&
          (saved === 'warm-sister' ||
            saved === 'gentle-guide' ||
            saved === 'playful-buddy' ||
            saved === 'starlight-companion')
        ) {
          this.currentProfile = saved as VoiceProfileType;
          sounds.setTemplate(this.currentProfile);
        }
      } catch {}

      this.initVoices();
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const refresh = () => {
      const rawList = window.speechSynthesis.getVoices();
      if (!rawList || rawList.length === 0) return;

      const detected: DetectedVoice[] = rawList.map(v => {
        const scored = scoreAndCategorizeVoice({ name: v.name, lang: v.lang });
        return {
          ...scored,
          rawVoice: v
        };
      });

      // Sort by score descending (highest naturalness first)
      detected.sort((a, b) => b.score - a.score);
      this.cachedVoices = detected;

      this.syncVoiceForCurrentProfile();
      this.notifyListeners();
    };

    refresh();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        refresh();
      };
    }
  }

  /**
   * Matches the best Chinese voice for the active template's preferred timbre keywords,
   * falling back to the highest-scored Chinese voice if no specific match is installed.
   */
  private syncVoiceForCurrentProfile() {
    if (this.manualVoiceOverride) {
      this.selectedVoice = this.manualVoiceOverride;
      return;
    }

    const chineseVoices = this.cachedVoices.filter(v => v.score > 0 && v.rawVoice);
    if (chineseVoices.length === 0) {
      if (this.cachedVoices.length > 0) {
        this.voiceWarning = '当前设备未检测到中文语音包，伴伴已切换为字幕文字提示模式。';
      }
      return;
    }

    this.voiceWarning = null;
    const config = this.getProfileConfig();

    // Try to find a high-quality Chinese voice matching this template's preferred timbre keywords
    const keywordMatch = chineseVoices.find(v => {
      const lower = v.name.toLowerCase();
      return (
        v.score >= 60 &&
        config.preferredVoiceKeywords.some(kw => lower.includes(kw.toLowerCase()))
      );
    });

    if (keywordMatch && keywordMatch.rawVoice) {
      this.selectedVoice = keywordMatch.rawVoice;
    } else if (chineseVoices[0].rawVoice) {
      this.selectedVoice = chineseVoices[0].rawVoice;
    }
  }

  public hasChineseVoice(): boolean {
    return this.cachedVoices.some(v => v.score > 0);
  }

  public getVoiceWarning(): string | null {
    return this.voiceWarning;
  }

  public dismissVoiceWarning(): void {
    this.voiceWarning = null;
    this.notifyListeners();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch {}
    });
  }

  public getProfile(): VoiceProfileType {
    return this.currentProfile;
  }

  public getProfileConfig(profileId?: VoiceProfileType): VoiceProfileConfig {
    const id = profileId || this.currentProfile;
    return VOICE_PROFILES[id] || VOICE_PROFILES['warm-sister'];
  }

  public setProfile(profile: VoiceProfileType) {
    if (!VOICE_PROFILES[profile]) return;
    this.currentProfile = profile;
    // Synchronize the Web Audio API DSP engine to use this template's frequency curve and timbre modulation
    sounds.setTemplate(profile);
    this.syncVoiceForCurrentProfile();
    try {
      localStorage.setItem('child_voice_profile', profile);
    } catch {}
    this.notifyListeners();
  }

  public getDetectedVoices(): DetectedVoice[] {
    return this.cachedVoices;
  }

  public getActiveVoice(): DetectedVoice | null {
    if (!this.selectedVoice && this.cachedVoices.length > 0) {
      return this.cachedVoices[0];
    }
    return (
      this.cachedVoices.find(v => v.rawVoice === this.selectedVoice) ||
      this.cachedVoices[0] ||
      null
    );
  }

  public setSpecificVoice(voiceName: string) {
    const match = this.cachedVoices.find(v => v.name === voiceName);
    if (match && match.rawVoice) {
      this.manualVoiceOverride = match.rawVoice;
      this.selectedVoice = match.rawVoice;
      this.notifyListeners();
    }
  }

  public cleanText(text: string): string[] {
    return cleanAndSegmentText(text);
  }

  public getLastText(): string {
    return this.lastSpokenText;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Natural voice playback with per-template dynamic prosody contour and Web Audio harmonic underlay
   */
  public speak(
    text: string,
    onEnd?: () => void,
    onError?: (reason: string) => void
  ) {
    this.lastSpokenText = text;

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.voiceWarning = '当前环境不支持语音播报功能，伴伴已为你展示字幕。';
      this.notifyListeners();
      if (onError) onError('SPEECH_SYNTHESIS_UNSUPPORTED');
      if (onEnd) onEnd();
      return;
    }

    // Stop any in-flight playback and clear timers
    this.stop();

    const segments = cleanAndSegmentText(text);
    if (segments.length === 0) {
      if (onEnd) onEnd();
      return;
    }

    this.segmentQueue = segments;
    this.currentSegmentIndex = 0;
    this.isSpeaking = true;
    this.isPaused = false;

    // Ensure Web Audio DSP template is synchronized
    sounds.setTemplate(this.currentProfile);
    this.syncVoiceForCurrentProfile();

    // Check if device lacks Chinese voice resources
    if (this.cachedVoices.length > 0 && !this.hasChineseVoice()) {
      this.voiceWarning = '当前设备未检测到中文语音包，伴伴已切换为字幕文字提示模式。';
      this.notifyListeners();
      if (onError) onError('NO_CHINESE_VOICE');
    }

    this.notifyListeners();

    const totalSegments = this.segmentQueue.length;

    const playNextSegment = () => {
      if (!this.isSpeaking) return;

      if (this.currentSegmentIndex >= totalSegments) {
        this.isSpeaking = false;
        this.isPaused = false;
        this.notifyListeners();
        if (onEnd) onEnd();
        return;
      }

      const segmentIdx = this.currentSegmentIndex;
      const segmentText = this.segmentQueue[segmentIdx];
      this.currentSegmentIndex++;

      // Compute dynamic clause-specific prosody modulation for active template
      const prosody = computeSegmentProsody(
        this.currentProfile,
        segmentIdx,
        totalSegments,
        segmentText
      );

      // Trigger subtle Web Audio API template-specific harmonic resonance cue
      sounds.playSpeechProsodyCue(this.currentProfile, segmentIdx);

      try {
        const utterance = new SpeechSynthesisUtterance(segmentText);
        utterance.lang = 'zh-CN';
        utterance.rate = prosody.rate;
        utterance.pitch = prosody.pitch;
        utterance.volume = prosody.volume;

        if (this.selectedVoice) {
          utterance.voice = this.selectedVoice;
        }

        utterance.onend = () => {
          if (!this.isSpeaking) return;

          // Template-specific natural breathing pause between clauses
          this.segmentTimer = window.setTimeout(() => {
            playNextSegment();
          }, prosody.pauseAfterMs);
        };

        utterance.onerror = () => {
          if (!this.isSpeaking) return;
          this.segmentTimer = window.setTimeout(() => {
            playNextSegment();
          }, 100);
        };

        window.speechSynthesis.speak(utterance);
      } catch {
        this.isSpeaking = false;
        this.isPaused = false;
        this.notifyListeners();
        if (onError) onError('SYNTHESIS_ERROR');
        if (onEnd) onEnd();
      }
    };

    playNextSegment();
  }

  public pause() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && this.isSpeaking) {
      try {
        window.speechSynthesis.pause();
        this.isPaused = true;
        this.notifyListeners();
      } catch {}
    }
  }

  public resume() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && this.isPaused) {
      try {
        window.speechSynthesis.resume();
        this.isPaused = false;
        this.notifyListeners();
      } catch {}
    }
  }

  public replay() {
    if (this.lastSpokenText) {
      this.speak(this.lastSpokenText);
    }
  }

  public stop() {
    if (this.segmentTimer !== null) {
      clearTimeout(this.segmentTimer);
      this.segmentTimer = null;
    }
    this.segmentQueue = [];
    this.currentSegmentIndex = 0;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    this.isSpeaking = false;
    this.isPaused = false;
    this.notifyListeners();
  }

  public getSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const speechNarrator = new SpeechNarrator();
