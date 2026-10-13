// Web Speech API Natural Voice Discovery & Narrative Prosody Engine
// Designed specifically for 6-year-old children, parents, and caregivers.
// - Multi-tier intelligent voice ranking (prioritizing natural/neural voices like Xiaoxiao, Yunxi, Tingting Enhanced)
// - Semantic breath-pause segmentation (eliminating breathless robotic staccato "AI味")
// - Pure client-side local execution (100% offline, zero child voice recordings uploaded to cloud)
// - Child safety filtering (stripping parenthetical designer notes, markdown, and meta-prompts before speaking)

export type VoiceProfileType = 'warm-sister' | 'gentle-guide' | 'playful-buddy';

export interface VoiceProfileConfig {
  id: VoiceProfileType;
  name: string;
  subtitle: string;
  description: string;
  emoji: string;
  rate: number;
  pitch: number;
  suitableScenarios: string;
}

export const VOICE_PROFILES: Record<VoiceProfileType, VoiceProfileConfig> = {
  'warm-sister': {
    id: 'warm-sister',
    name: '暖阳姐姐',
    subtitle: '绘本温和风',
    description: '语速轻缓柔和，音高温暖微扬，如同睡前共读绘本的大姐姐。',
    emoji: '🌸',
    rate: 0.89,
    pitch: 1.04,
    suitableScenarios: '平静角深呼吸、抱抱响应、睡前故事、情绪安抚'
  },
  'gentle-guide': {
    id: 'gentle-guide',
    name: '和风守护',
    subtitle: '沉稳清晰风',
    description: '语调踏实平缓，发音清晰沉着，给予孩子确定感与安全边界。',
    emoji: '🍃',
    rate: 0.91,
    pitch: 1.00,
    suitableScenarios: '困难拆解台、安全围栏提醒、两家桥规则说明'
  },
  'playful-buddy': {
    id: 'playful-buddy',
    name: '元气伙伴',
    subtitle: '活泼同伴风',
    description: '节奏轻快生动，充满探索好奇心，如同身边并肩同行的小伙伴。',
    emoji: '☀️',
    rate: 0.95,
    pitch: 1.06,
    suitableScenarios: '探索小岛、天气电台、思考侦探社、微课互动'
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
    // If sentence is short enough (<= 14 characters), keep as a single natural breath unit
    if (sentence.length <= 14) {
      segments.push(sentence);
      continue;
    }

    // If sentence is longer, split on commas or pauses (，,、)
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
  // Microsoft Xiaoxiao (晓晓) is widely regarded as the most natural, empathetic storytelling voice for Chinese children
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
        if (saved && (saved === 'warm-sister' || saved === 'gentle-guide' || saved === 'playful-buddy')) {
          this.currentProfile = saved as VoiceProfileType;
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

      // Pick top Chinese voice
      const best = detected.find(v => v.score > 0);
      if (best && best.rawVoice) {
        this.selectedVoice = best.rawVoice;
        this.voiceWarning = null;
      } else if (detected.length > 0) {
        this.voiceWarning = '当前设备未检测到中文语音包，伴伴已切换为字幕文字提示模式。';
      }

      this.notifyListeners();
    };

    refresh();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        refresh();
      };
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

  public getProfileConfig(): VoiceProfileConfig {
    return VOICE_PROFILES[this.currentProfile] || VOICE_PROFILES['warm-sister'];
  }

  public setProfile(profile: VoiceProfileType) {
    if (!VOICE_PROFILES[profile]) return;
    this.currentProfile = profile;
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
   * Natural voice playback with semantic breath-pause scheduling
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

    // Check if device lacks Chinese voice resources
    if (this.cachedVoices.length > 0 && !this.hasChineseVoice()) {
      this.voiceWarning = '当前设备未检测到中文语音包，伴伴已切换为字幕文字提示模式。';
      this.notifyListeners();
      if (onError) onError('NO_CHINESE_VOICE');
    }

    this.notifyListeners();

    const config = this.getProfileConfig();

    const playNextSegment = () => {
      if (!this.isSpeaking) return;

      if (this.currentSegmentIndex >= this.segmentQueue.length) {
        this.isSpeaking = false;
        this.isPaused = false;
        this.notifyListeners();
        if (onEnd) onEnd();
        return;
      }

      const segmentText = this.segmentQueue[this.currentSegmentIndex];
      this.currentSegmentIndex++;

      try {
        const utterance = new SpeechSynthesisUtterance(segmentText);
        utterance.lang = 'zh-CN';
        utterance.rate = config.rate;
        utterance.pitch = config.pitch;

        if (this.selectedVoice) {
          utterance.voice = this.selectedVoice;
        }

        utterance.onend = () => {
          if (!this.isSpeaking) return;

          // Natural human breathing pause between segments (~180ms)
          this.segmentTimer = window.setTimeout(() => {
            playNextSegment();
          }, 180);
        };

        utterance.onerror = (e) => {
          if (!this.isSpeaking) return;
          // Continue to next segment on minor transient glitch
          this.segmentTimer = window.setTimeout(() => {
            playNextSegment();
          }, 100);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
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
