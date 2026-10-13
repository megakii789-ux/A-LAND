import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  WeatherRecord,
  ParentObservation,
  ParentScript,
  WeeklyLesson,
  AdultPresenceTier,
  HugEvent,
  MedalRecord
} from '../types';
import {
  INITIAL_LEAF_SCENARIOS,
  INITIAL_PARENT_SCRIPTS,
  INITIAL_PARENT_OBSERVATIONS,
  INITIAL_WEEKLY_LESSONS,
  INITIAL_MEDALS
} from '../data/mockData';
import { sounds } from '../utils/sound';
import { speechNarrator } from '../utils/speech';
import {
  PersonalizationProfile,
  loadPersonalizationProfile,
  savePersonalizationProfile,
  resetPersonalizationProfile,
  clearAllPersonalizationData,
  revokeConsentAndWipeStorage,
} from '../domain/personalization';

export type IslandPlace = 'island' | 'weather' | 'story' | 'detective' | 'courage' | 'bridge' | 'starlight' | 'calm' | 'medals';

interface AppContextType {
  // Navigation
  currentView: 'child' | 'parent';
  setCurrentView: (view: 'child' | 'parent') => void;
  childPlace: IslandPlace;
  setChildPlace: (place: IslandPlace) => void;
  selectedLeafId: string | null;
  setSelectedLeafId: (id: string | null) => void;

  // Medals (成就徽章馆)
  medals: MedalRecord[];
  unlockMedal: (medalId: string) => void;
  recentUnlockedMedal: MedalRecord | null;
  dismissUnlockedMedal: () => void;

  // Weather & Step-back
  todayWeather: WeatherRecord | null;
  weatherHistory: WeatherRecord[];
  saveTodayWeather: (weather: Omit<WeatherRecord, 'id' | 'timestamp'>) => void;

  // Hug Button (抱抱键)
  hugEvents: HugEvent[];
  activeHugNotice: boolean;
  requestHug: (toParent?: '爸爸' | '妈妈' | '当前照顾者') => void;
  acknowledgeHug: () => void;

  // Audio mute
  isMuted: boolean;
  toggleMute: () => void;

  // Presence Tier
  presenceTier: AdultPresenceTier;
  setPresenceTier: (tier: AdultPresenceTier) => void;

  // Parent Observation Card (看行为，一键标记：这次他自己想到了)
  parentObservations: ParentObservation[];
  incrementSelfInitiated: (id: string) => void;

  // Leaves & Progress
  completedLeaves: string[];
  markLeafComplete: (leafId: string, childQuote?: string) => void;
  childQuotes: Record<string, string>;

  // Two homes bridge data
  tonightAt: '妈妈家' | '爸爸家';
  daysToNextSwitch: number;
  packedItems: string[];
  togglePackedItem: (item: string) => void;
  missNotes: Array<{ id: string; text: string; date: string }>;
  addMissNote: (text: string) => void;

  // Starlight cabin
  starlightTraits: string[];
  addStarlightTrait: (trait: string) => void;

  // SEC-05: 历史本地敏感数据隔离与清理
  hasLegacySensitiveData: boolean;
  clearLegacySensitiveStorage: () => void;

  // AG-04B: 受控儿童个性化引擎状态与控制
  personalization: PersonalizationProfile;
  updatePersonalization: (partial: Partial<PersonalizationProfile>) => void;
  resetPersonalization: () => void;
  clearAllPersonalization: () => void;
  revokePersonalizationConsent: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const LEGACY_STORAGE_KEY = 'sunny_rain_island_v1_state';
const SAFE_SETTINGS_STORAGE_KEY = 'aland_safe_non_sensitive_settings_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<'child' | 'parent'>('child');
  const [childPlace, setChildPlace] = useState<IslandPlace>('island');
  const [selectedLeafId, setSelectedLeafId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // AG-04B: 本地受控个性化偏好状态
  const [personalization, setPersonalization] = useState<PersonalizationProfile>(() =>
    loadPersonalizationProfile()
  );

  // 同步个性化无障碍偏好 (语音静音与减少动效)
  useEffect(() => {
    if (!personalization.accessibility.voiceEnabled) {
      sounds.setMuted(true);
      setIsMuted(true);
    } else {
      sounds.setMuted(false);
      setIsMuted(false);
    }

    if (typeof document !== 'undefined') {
      if (personalization.accessibility.reducedMotion) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
    }
  }, [personalization.accessibility.voiceEnabled, personalization.accessibility.reducedMotion]);

  // 切换场景立即停止旧语音，防止声音叠加
  useEffect(() => {
    speechNarrator.stop();
  }, [childPlace, currentView]);

  // Weather
  const [todayWeather, setTodayWeather] = useState<WeatherRecord | null>({
    id: 'weather-sample',
    timestamp: new Date().toISOString(),
    primary: 'sunny',
    intensity: 3,
    bodySensations: ['胸口松松的', '身上暖暖的'],
    calmingMethod: '深呼吸'
  });
  const [weatherHistory, setWeatherHistory] = useState<WeatherRecord[]>([]);

  // Hug events
  const [hugEvents, setHugEvents] = useState<HugEvent[]>([]);
  const [activeHugNotice, setActiveHugNotice] = useState<boolean>(false);

  // Presence tier (A: 独立, B: 先看后放行, C: 必须共玩)
  const [presenceTier, setPresenceTier] = useState<AdultPresenceTier>('A');

  // Observations
  const [parentObservations, setParentObservations] = useState<ParentObservation[]>(INITIAL_PARENT_OBSERVATIONS);

  // Completed leaves & child quotes (private)
  const [completedLeaves, setCompletedLeaves] = useState<string[]>([]);
  const [childQuotes, setChildQuotes] = useState<Record<string, string>>({});

  // Two homes bridge
  const [tonightAt, setTonightAt] = useState<'妈妈家' | '爸爸家'>('妈妈家');
  const [daysToNextSwitch, setDaysToNextSwitch] = useState<number>(2);
  const [packedItems, setPackedItems] = useState<string[]>(['安心小熊玩偶', '水彩画笔']);
  const [missNotes, setMissNotes] = useState<Array<{ id: string; text: string; date: string }>>([
    { id: '1', text: '想念爸爸带我去池塘看小鸭子', date: '昨天晚上' }
  ]);

  // Starlight traits
  const [starlightTraits, setStarlightTraits] = useState<string[]>([
    '画画很仔细',
    '喜欢照顾小猫',
    '有两个温暖的家',
    '正在学系鞋带',
    '很会安慰难过的小熊'
  ]);

  // Medals (成就徽章馆)
  const [medals, setMedals] = useState<MedalRecord[]>(INITIAL_MEDALS);
  const [recentUnlockedMedal, setRecentUnlockedMedal] = useState<MedalRecord | null>(null);

  const [hasLegacySensitiveData, setHasLegacySensitiveData] = useState<boolean>(false);

  // SEC-05: 仅加载受控非敏感设置，敏感表达（想念、自由问答、自省）保持内存态
  useEffect(() => {
    try {
      // 1. 检查是否存在旧版持久化的敏感数据
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        setHasLegacySensitiveData(true);
      }

      // 2. 加载受控的最小非敏感设置 (故事完成标记、两家日程、徽章、陪伴层级)
      const safeRaw = localStorage.getItem(SAFE_SETTINGS_STORAGE_KEY);
      if (safeRaw) {
        const parsed = JSON.parse(safeRaw);
        if (Array.isArray(parsed.completedLeaves)) setCompletedLeaves(parsed.completedLeaves);
        if (parsed.tonightAt) setTonightAt(parsed.tonightAt);
        if (typeof parsed.daysToNextSwitch === 'number') setDaysToNextSwitch(parsed.daysToNextSwitch);
        if (Array.isArray(parsed.packedItems)) setPackedItems(parsed.packedItems);
        if (parsed.presenceTier) setPresenceTier(parsed.presenceTier);
        if (Array.isArray(parsed.medals)) setMedals(parsed.medals);
      } else if (legacyRaw) {
        // 首次从旧版平滑提取非敏感字段，绝不自动持久化敏感数据
        const legacyParsed = JSON.parse(legacyRaw);
        if (Array.isArray(legacyParsed.completedLeaves)) setCompletedLeaves(legacyParsed.completedLeaves);
        if (legacyParsed.tonightAt) setTonightAt(legacyParsed.tonightAt);
        if (Array.isArray(legacyParsed.packedItems)) setPackedItems(legacyParsed.packedItems);
        if (legacyParsed.presenceTier) setPresenceTier(legacyParsed.presenceTier);
        if (Array.isArray(legacyParsed.medals)) setMedals(legacyParsed.medals);
      }
    } catch {}
  }, []);

  // SEC-05: 仅保存最小非敏感设置至本地，绝对禁止持久化儿童自由表达、想念与心理观察
  useEffect(() => {
    try {
      const safeStateToSave = {
        completedLeaves,
        tonightAt,
        daysToNextSwitch,
        packedItems,
        presenceTier,
        medals
      };
      localStorage.setItem(SAFE_SETTINGS_STORAGE_KEY, JSON.stringify(safeStateToSave));
    } catch {}
  }, [
    completedLeaves,
    tonightAt,
    daysToNextSwitch,
    packedItems,
    presenceTier,
    medals
  ]);

  const clearLegacySensitiveStorage = () => {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      setHasLegacySensitiveData(false);
    } catch {}
  };

  const unlockMedal = (medalId: string) => {
    setMedals(prev => {
      const target = prev.find(m => m.id === medalId);
      if (!target || target.unlocked) return prev;
      sounds.playBell();
      const updated = prev.map(m =>
        m.id === medalId
          ? { ...m, unlocked: true, unlockedAt: '刚刚' }
          : m
      );
      const unlockedOne = updated.find(m => m.id === medalId) || null;
      setRecentUnlockedMedal(unlockedOne);
      return updated;
    });
  };

  const dismissUnlockedMedal = () => {
    setRecentUnlockedMedal(null);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sounds.setMuted(nextMuted);
  };

  const saveTodayWeather = (weather: Omit<WeatherRecord, 'id' | 'timestamp'>) => {
    const newRecord: WeatherRecord = {
      ...weather,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setTodayWeather(newRecord);
    setWeatherHistory(prev => [newRecord, ...prev.slice(0, 14)]);
    sounds.playBell();

    // Check medal unlock
    if (weather.primary === 'sunny') {
      unlockMedal('sun-awareness');
    } else if (weather.primary === 'rainy' || weather.primary === 'stormy') {
      unlockMedal('rain-acceptance');
    }
    if (weatherHistory.length >= 2) {
      unlockMedal('rain-flow');
    }
  };

  const requestHug = (toParent: '爸爸' | '妈妈' | '当前照顾者' = '当前照顾者') => {
    sounds.playWarmHug();
    const newHug: HugEvent = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      toParent,
      acknowledged: false
    };
    setHugEvents(prev => [newHug, ...prev]);
    setActiveHugNotice(true);
    unlockMedal('hug-courage');
  };

  const acknowledgeHug = () => {
    setActiveHugNotice(false);
  };

  const incrementSelfInitiated = (id: string) => {
    sounds.playBell();
    setParentObservations(prev =>
      prev.map(obs =>
        obs.id === id
          ? { ...obs, selfInitiatedCount: obs.selfInitiatedCount + 1, lastObservedDate: '刚刚' }
          : obs
      )
    );
  };

  const markLeafComplete = (leafId: string, quote?: string) => {
    sounds.playBell();
    if (!completedLeaves.includes(leafId)) {
      setCompletedLeaves(prev => [...prev, leafId]);
    }
    if (quote) {
      setChildQuotes(prev => ({ ...prev, [leafId]: quote }));
    }
    unlockMedal('coin-flipper');
  };

  const togglePackedItem = (item: string) => {
    sounds.playClick();
    setPackedItems(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const addMissNote = (text: string) => {
    sounds.playBell();
    const note = {
      id: Date.now().toString(),
      text,
      date: '刚刚'
    };
    setMissNotes(prev => [note, ...prev]);
  };

  const addStarlightTrait = (trait: string) => {
    sounds.playBell();
    if (!starlightTraits.includes(trait)) {
      setStarlightTraits(prev => [...prev, trait]);
    }
  };

  // AG-04B: 受控儿童个性化方法
  const updatePersonalization = (partial: Partial<PersonalizationProfile>) => {
    const updated = savePersonalizationProfile(partial);
    setPersonalization(updated);
  };

  const resetPersonalization = () => {
    const reset = resetPersonalizationProfile();
    setPersonalization(reset);
  };

  const clearAllPersonalization = () => {
    clearAllPersonalizationData();
    setPersonalization(loadPersonalizationProfile());
  };

  const revokePersonalizationConsent = () => {
    const revoked = revokeConsentAndWipeStorage();
    setPersonalization(revoked);
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        childPlace,
        setChildPlace,
        selectedLeafId,
        setSelectedLeafId,
        todayWeather,
        weatherHistory,
        saveTodayWeather,
        hugEvents,
        activeHugNotice,
        requestHug,
        acknowledgeHug,
        isMuted,
        toggleMute,
        presenceTier,
        setPresenceTier,
        parentObservations,
        incrementSelfInitiated,
        completedLeaves,
        markLeafComplete,
        childQuotes,
        tonightAt,
        daysToNextSwitch,
        packedItems,
        togglePackedItem,
        missNotes,
        addMissNote,
        starlightTraits,
        addStarlightTrait,
        medals,
        unlockMedal,
        recentUnlockedMedal,
        dismissUnlockedMedal,
        hasLegacySensitiveData,
        clearLegacySensitiveStorage,
        personalization,
        updatePersonalization,
        resetPersonalization,
        clearAllPersonalization,
        revokePersonalizationConsent
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
