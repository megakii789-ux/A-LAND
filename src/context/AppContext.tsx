import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  WeatherRecord,
  ParentObservation,
  AdultPresenceTier,
  HugEvent,
  MedalRecord
} from '../types';
import { INITIAL_PARENT_OBSERVATIONS, INITIAL_MEDALS } from '../data/mockData';
import { sounds, ambientSound } from '../utils/sound';
import { speechNarrator } from '../utils/speech';
import { hasParentAccess, lockParentAccess } from '../domain/privacy/parentAccess';
import {
  PersonalizationProfile,
  loadPersonalizationProfile,
  savePersonalizationProfile,
  resetPersonalizationProfile,
  clearAllPersonalizationData,
  revokeConsentAndWipeStorage,
  PERSONALIZATION_STORAGE_KEY,
} from '../domain/personalization';

export type IslandPlace = 'island' | 'weather' | 'story' | 'detective' | 'courage' | 'bridge' | 'starlight' | 'calm' | 'medals';
export type TonightResidenceState = '妈妈家' | '爸爸家' | '尚未设置';

interface AppContextType {
  currentView: 'child' | 'parent';
  setCurrentView: (v: 'child' | 'parent') => void;
  childPlace: IslandPlace;
  setChildPlace: (place: IslandPlace) => void;
  selectedLeafId: string | null;
  setSelectedLeafId: (id: string | null) => void;

  // Weather & Body Sensation (Soil layer) - default null / empty
  todayWeather: WeatherRecord | null;
  weatherHistory: WeatherRecord[];
  saveTodayWeather: (w: Omit<WeatherRecord, 'id' | 'timestamp'>) => void;

  // Local Hug Support - no fake remote push notifications
  hugEvents: HugEvent[];
  activeHugNotice: boolean;
  requestHug: (to?: '爸爸' | '妈妈' | '当前照顾者') => void;
  acknowledgeHug: () => void;

  // Audio Mute & Reduced Motion
  isMuted: boolean;
  toggleMute: () => void;
  reducedMotion: boolean;
  setReducedMotion: (enabled: boolean) => void;

  // Adult Presence Tier
  presenceTier: AdultPresenceTier;
  setPresenceTier: (t: AdultPresenceTier) => void;

  // Parent Observations - default 0
  parentObservations: ParentObservation[];
  incrementSelfInitiated: (id: string) => void;

  // Completed Leaves
  completedLeaves: string[];
  markLeafComplete: (leafId: string, childQuote?: string) => void;
  childQuotes: Record<string, string>;

  // Two Homes Bridge & Family Schedule (Sensitive - NOT persisted by default)
  tonightAt: TonightResidenceState;
  setTonightAt: (home: TonightResidenceState) => void;
  daysToNextSwitch: number | null;
  setDaysToNextSwitch: (days: number | null) => void;
  packedItems: string[];
  togglePackedItem: (item: string) => void;
  missNotes: Array<{ id: string; text: string; date: string }>;
  addMissNote: (text: string) => void;

  // Starlight Cabin traits - default empty
  starlightTraits: string[];
  addStarlightTrait: (trait: string) => void;
  removeStarlightTrait: (trait: string) => void;

  // Activity Markers (Medals) - default unlocked: false
  medals: MedalRecord[];
  unlockMedal: (medalId: string) => void;
  recentUnlockedMedal: MedalRecord | null;
  dismissUnlockedMedal: () => void;

  // Controlled Personalization (AG-04B)
  personalization: PersonalizationProfile;
  updatePersonalization: (partial: Partial<PersonalizationProfile>) => void;
  resetPersonalization: () => void;
  clearAllPersonalization: () => void;
  revokePersonalizationConsent: () => void;

  // Explicit Local Storage Consent & Demo Mode (Phase 3 P1)
  saveLocal: boolean;
  setSaveLocal: (enabled: boolean) => void;
  careScheduleSaveConsent: boolean;
  setCareScheduleSaveConsent: (enabled: boolean) => void;
  persistCareSchedule: boolean;
  setPersistCareSchedule: (enabled: boolean) => void;
  familyContent: boolean;
  setFamilyContent: (enabled: boolean) => void;
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  clearAllData: () => void;
  clearDeviceData: () => void;
  hasLegacySensitiveData: boolean;
  clearLegacySensitiveStorage: () => void;
  storageError: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'sunny_rain_island_v1_state';
const CONSENT_STORAGE_KEY = 'sunny_rain_island_v1_consent';
const CARE_SCHEDULE_CONSENT_KEY = 'sunny_rain_island_v1_care_consent';

const createZeroObservations = (): ParentObservation[] =>
  INITIAL_PARENT_OBSERVATIONS.map((obs) => ({
    ...obs,
    selfInitiatedCount: 0,
    lastObservedDate: undefined,
  }));

const createZeroMedals = (): MedalRecord[] =>
  INITIAL_MEDALS.map((m) => ({
    ...m,
    unlocked: false,
    unlockedAt: undefined,
  }));

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentViewState] = useState<'child' | 'parent'>('child');
  const [childPlace, setChildPlace] = useState<IslandPlace>('island');
  const [selectedLeafId, setSelectedLeafId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [reducedMotion, setReducedMotionState] = useState<boolean>(false);
  const [hasLegacySensitiveData, setHasLegacySensitiveData] = useState<boolean>(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Phase 3 #2: Default weather, residence, miss notes, and family/starlight traits to unknown or empty!
  const [todayWeather, setTodayWeather] = useState<WeatherRecord | null>(null);
  const [weatherHistory, setWeatherHistory] = useState<WeatherRecord[]>([]);
  const [hugEvents, setHugEvents] = useState<HugEvent[]>([]);
  const [activeHugNotice, setActiveHugNotice] = useState<boolean>(false);
  const [presenceTier, setPresenceTier] = useState<AdultPresenceTier>('A');
  const [parentObservations, setParentObservations] = useState<ParentObservation[]>(createZeroObservations);
  const [completedLeaves, setCompletedLeaves] = useState<string[]>([]);
  const [childQuotes, setChildQuotes] = useState<Record<string, string>>({});

  // Sensitive family residence & care schedule defaults to unknown ('尚未设置' / null), never '妈妈家'
  const [tonightAt, setTonightAt] = useState<TonightResidenceState>('尚未设置');
  const [daysToNextSwitch, setDaysToNextSwitch] = useState<number | null>(null);
  const [packedItems, setPackedItems] = useState<string[]>([]);
  const [missNotes, setMissNotes] = useState<Array<{ id: string; text: string; date: string }>>([]);
  const [starlightTraits, setStarlightTraits] = useState<string[]>([]);
  const [medals, setMedals] = useState<MedalRecord[]>(createZeroMedals);
  const [recentUnlockedMedal, setRecentUnlockedMedal] = useState<MedalRecord | null>(null);

  // Phase 3 #3 & #4: Local storage consent defaults to FALSE; care schedule persistence separate & defaults to FALSE
  const [saveLocal, setSaveLocalState] = useState<boolean>(false);
  const [careScheduleSaveConsent, setCareScheduleSaveConsentState] = useState<boolean>(false);
  const [familyContent, setFamilyContentState] = useState<boolean>(false);
  const [isDemoMode, setIsDemoModeState] = useState<boolean>(false);

  // Controlled Child Personalization (AG-04B) — Single Source of Truth for Companion & Voice
  const [personalization, setPersonalization] = useState<PersonalizationProfile>(() => {
    let loaded = loadPersonalizationProfile();
    if (typeof window !== 'undefined') {
      try {
        const hasSavedPersonalization = Boolean(localStorage.getItem(PERSONALIZATION_STORAGE_KEY));
        if (!hasSavedPersonalization && loaded.companionId === 'guoguo_squirrel') {
          const legacyVoice = localStorage.getItem('child_voice_profile');
          const legacyMap: Record<string, PersonalizationProfile['companionId']> = {
            'playful-buddy': 'guoguo_squirrel',
            'warm-sister': 'beibei_otter',
            'gentle-guide': 'tiantian_raccoon',
            'starlight-companion': 'qiqi_deer',
          };
          if (legacyVoice && legacyMap[legacyVoice]) {
            loaded = { ...loaded, companionId: legacyMap[legacyVoice] };
            localStorage.removeItem('child_voice_profile');
          }
        }
      } catch {}
    }
    speechNarrator.syncWithCompanion(loaded.companionId);
    speechNarrator.setVoiceEnabled(loaded.accessibility.voiceEnabled);
    return loaded;
  });

  // Authoritative global companion -> voice engine synchronization (independent of CompanionBanner mount)
  useEffect(() => {
    speechNarrator.syncWithCompanion(personalization.companionId);
    speechNarrator.setVoiceEnabled(personalization.accessibility.voiceEnabled);
  }, [personalization.companionId, personalization.accessibility.voiceEnabled]);

  // Hydrate ONLY if explicit consent was previously granted
  useEffect(() => {
    try {
      const hasConsent = localStorage.getItem(CONSENT_STORAGE_KEY) === 'yes';
      const hasCareConsent = localStorage.getItem(CARE_SCHEDULE_CONSENT_KEY) === 'yes';
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          if (
            parsed.childQuotes ||
            parsed.missNotes ||
            parsed.todayWeather ||
            parsed.weatherHistory ||
            parsed.parentObservations
          ) {
            setHasLegacySensitiveData(true);
          }
          if (hasConsent) {
            setSaveLocalState(true);
            setCareScheduleSaveConsentState(hasCareConsent);
            if (Array.isArray(parsed.completedLeaves)) {
              setCompletedLeaves(
                parsed.completedLeaves.filter((id: unknown): id is string => typeof id === 'string')
              );
            }
            if (typeof parsed.familyContent === 'boolean') {
              setFamilyContentState(parsed.familyContent);
            }
            if (typeof parsed.reducedMotion === 'boolean') {
              setReducedMotionState(parsed.reducedMotion);
            }
            if (parsed.presenceTier === 'A' || parsed.presenceTier === 'B' || parsed.presenceTier === 'C') {
              setPresenceTier(parsed.presenceTier);
            }
            if (hasCareConsent) {
              if (parsed.tonightAt === '妈妈家' || parsed.tonightAt === '爸爸家') {
                setTonightAt(parsed.tonightAt);
              }
              if (typeof parsed.daysToNextSwitch === 'number') {
                setDaysToNextSwitch(parsed.daysToNextSwitch);
              }
            }
          }
        }
      }
    } catch {
      // Ignore storage read errors and remain in safe memory-only mode
    }
  }, []);

  // Persist ONLY when saveLocal === true and never persist Demo Mode data or sensitive child quotes
  useEffect(() => {
    if (!saveLocal || isDemoMode) return;
    try {
      const safeStateToSave = {
        completedLeaves,
        presenceTier,
        familyContent,
        reducedMotion,
      };
      const payload: Record<string, unknown> = { ...safeStateToSave };
      // Phase 3 #4: Family pickup & care schedule is only persisted if separately consented
      if (careScheduleSaveConsent) {
        payload.tonightAt = tonightAt;
        payload.daysToNextSwitch = daysToNextSwitch;
      }
      localStorage.setItem(CONSENT_STORAGE_KEY, 'yes');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setStorageError(null);
    } catch {
      setStorageError('浏览器禁止写入本地存储，当前数据仅在本次页面打开期间有效。');
    }
  }, [
    saveLocal,
    isDemoMode,
    careScheduleSaveConsent,
    completedLeaves,
    presenceTier,
    familyContent,
    reducedMotion,
    tonightAt,
    daysToNextSwitch,
  ]);

  // Parent view guard: Enforce PIN access and auto-lock after 5 minutes of inactivity
  useEffect(() => {
    if (currentView !== 'parent') return;
    let timer: ReturnType<typeof setTimeout>;
    const lock = () => {
      lockParentAccess();
      setCurrentViewState('child');
    };
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(lock, 5 * 60 * 1000);
    };
    const handleVisibility = () => {
      if (document.hidden) lock();
    };
    resetTimer();
    window.addEventListener('pointerdown', resetTimer);
    window.addEventListener('keydown', resetTimer);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [currentView]);

  useEffect(() => {
    if (currentView === 'parent') {
      speechNarrator.stop();
      ambientSound.stop();
    }
  }, [currentView]);

  const setCurrentView = (v: 'child' | 'parent') => {
    if (v === 'parent' && !hasParentAccess()) {
      return;
    }
    speechNarrator.stop();
    if (v === 'parent') {
      ambientSound.stop();
    }
    if (v === 'child') {
      lockParentAccess();
    }
    setCurrentViewState(v);
  };

  const setSaveLocal = (enabled: boolean) => {
    setSaveLocalState(enabled);
    if (!enabled) {
      setCareScheduleSaveConsentState(false);
      try {
        localStorage.removeItem(CONSENT_STORAGE_KEY);
        localStorage.removeItem(CARE_SCHEDULE_CONSENT_KEY);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('parent_medals_milestones');
      } catch {
        // Ignore
      }
    }
  };

  const setCareScheduleSaveConsent = (enabled: boolean) => {
    setCareScheduleSaveConsentState(enabled);
    try {
      if (enabled && saveLocal) {
        localStorage.setItem(CARE_SCHEDULE_CONSENT_KEY, 'yes');
      } else {
        localStorage.removeItem(CARE_SCHEDULE_CONSENT_KEY);
      }
    } catch {
      // Ignore
    }
  };

  const setFamilyContent = (enabled: boolean) => {
    if (!hasParentAccess()) return;
    setFamilyContentState(enabled);
  };

  const setReducedMotion = (enabled: boolean) => {
    setReducedMotionState(enabled);
  };

  const clearLegacySensitiveStorage = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('sunny_island_child_private_artifacts_v1');
      localStorage.removeItem('active_open_hug_state');
      setHasLegacySensitiveData(false);
    } catch {
      // Ignore
    }
  };

  const setDemoMode = (enabled: boolean) => {
    setIsDemoModeState(enabled);
    if (enabled) {
      const demoWeather: WeatherRecord = {
        id: 'demo-weather-1',
        timestamp: new Date().toISOString(),
        primary: 'sunny',
        secondary: 'cloudy',
        intensity: 2,
        bodySensations: ['松松的'],
        calmingMethod: '深呼吸',
      };
      setTodayWeather(demoWeather);
      setWeatherHistory([demoWeather]);
      setTonightAt('妈妈家');
      setDaysToNextSwitch(2);
      setMissNotes([{ id: 'demo-miss-1', text: '【演示样本】今天画了一只小恐龙', date: '演示模式' }]);
      setStarlightTraits(['喜欢搭积木的小建筑师（演示）']);
      setParentObservations([
        { ...INITIAL_PARENT_OBSERVATIONS[0], selfInitiatedCount: 2, lastObservedDate: '演示数据' },
        { ...INITIAL_PARENT_OBSERVATIONS[1], selfInitiatedCount: 3, lastObservedDate: '演示数据' },
        { ...INITIAL_PARENT_OBSERVATIONS[2], selfInitiatedCount: 1, lastObservedDate: '演示数据' },
        { ...INITIAL_PARENT_OBSERVATIONS[3], selfInitiatedCount: 2, lastObservedDate: '演示数据' },
        { ...INITIAL_PARENT_OBSERVATIONS[4], selfInitiatedCount: 1, lastObservedDate: '演示数据' },
      ]);
      setMedals(
        INITIAL_MEDALS.map((m, idx) =>
          idx < 2 ? { ...m, unlocked: true, unlockedAt: '演示模式' } : { ...m, unlocked: false }
        )
      );
    } else {
      setTodayWeather(null);
      setWeatherHistory([]);
      setTonightAt('尚未设置');
      setDaysToNextSwitch(null);
      setMissNotes([]);
      setStarlightTraits([]);
      setParentObservations(createZeroObservations());
      setMedals(createZeroMedals());
    }
  };

  const unlockMedal = (medalId: string) => {
    setMedals((prev) => {
      const target = prev.find((m) => m.id === medalId);
      if (!target || target.unlocked) return prev;
      const updated = prev.map((m) =>
        m.id === medalId ? { ...m, unlocked: true, unlockedAt: '本次会话' } : m
      );
      const newlyUnlocked = updated.find((m) => m.id === medalId) || null;
      if (newlyUnlocked) {
        setRecentUnlockedMedal(newlyUnlocked);
      }
      return updated;
    });
  };

  const dismissUnlockedMedal = () => {
    setRecentUnlockedMedal(null);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.setMasterMuted(next);
    if (next) {
      speechNarrator.stop();
    }
  };

  const saveTodayWeather = (w: Omit<WeatherRecord, 'id' | 'timestamp'>) => {
    const record: WeatherRecord = {
      ...w,
      id: `weather-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setTodayWeather(record);
    setWeatherHistory((prev) => [record, ...prev].slice(0, 30));
  };

  // R3-02: Local help trigger only; NEVER pretend a remote notification was delivered to parent device
  const requestHug = (to: '爸爸' | '妈妈' | '当前照顾者' = '当前照顾者') => {
    const newHug: HugEvent = {
      id: `hug-${Date.now()}`,
      timestamp: new Date().toISOString(),
      toParent: to,
      acknowledged: false
    };
    setHugEvents((prev) => [newHug, ...prev]);
    setActiveHugNotice(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('qingyu:local-help'));
    }
  };

  const acknowledgeHug = () => {
    setActiveHugNotice(false);
    setHugEvents((prev) => prev.map((h) => ({ ...h, acknowledged: true })));
  };

  const incrementSelfInitiated = (id: string) => {
    sounds.playBell();
    setParentObservations((prev) =>
      prev.map((obs) =>
        obs.id === id
          ? {
              ...obs,
              selfInitiatedCount: obs.selfInitiatedCount + 1,
              lastObservedDate: new Date().toLocaleDateString('zh-CN')
            }
          : obs
      )
    );
  };

  const markLeafComplete = (leafId: string, quote?: string) => {
    sounds.playBell();
    setCompletedLeaves((prev) => (prev.includes(leafId) ? prev : [...prev, leafId]));
    // Child free quotes remain strictly in session memory only, never uploaded or persisted
    if (quote && quote.trim()) {
      setChildQuotes((prev) => ({ ...prev, [leafId]: quote.trim() }));
    }
  };

  const togglePackedItem = (item: string) => {
    setPackedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const addMissNote = (text: string) => {
    if (!text.trim()) return;
    setMissNotes((prev) => [
      {
        id: `miss-${Date.now()}`,
        text: text.trim().slice(0, 160),
        date: '仅当前页面'
      },
      ...prev
    ]);
  };

  const addStarlightTrait = (trait: string) => {
    if (!trait.trim() || starlightTraits.includes(trait.trim())) return;
    setStarlightTraits((prev) => [...prev, trait.trim()]);
  };

  const removeStarlightTrait = (trait: string) => {
    setStarlightTraits((prev) => prev.filter((t) => t !== trait));
  };

  const updatePersonalization = (partial: Partial<PersonalizationProfile>) => {
    const updated = savePersonalizationProfile(partial);
    speechNarrator.syncWithCompanion(updated.companionId);
    speechNarrator.setVoiceEnabled(updated.accessibility.voiceEnabled);
    setPersonalization(updated);
  };

  const resetPersonalization = () => {
    const reset = resetPersonalizationProfile();
    speechNarrator.syncWithCompanion(reset.companionId);
    speechNarrator.setVoiceEnabled(reset.accessibility.voiceEnabled);
    setPersonalization(reset);
  };

  const clearAllPersonalization = () => {
    clearAllPersonalizationData();
    const reset = resetPersonalizationProfile();
    speechNarrator.syncWithCompanion(reset.companionId);
    speechNarrator.setVoiceEnabled(reset.accessibility.voiceEnabled);
    setPersonalization(reset);
  };

  const revokePersonalizationConsent = () => {
    const revoked = revokeConsentAndWipeStorage();
    speechNarrator.syncWithCompanion(revoked.companionId);
    speechNarrator.setVoiceEnabled(revoked.accessibility.voiceEnabled);
    setPersonalization(revoked);
    setSaveLocal(false);
  };

  const clearAllData = () => {
    // Set consent flags to false FIRST so no effect re-writes data to localStorage
    setSaveLocalState(false);
    setCareScheduleSaveConsentState(false);
    setIsDemoModeState(false);
    setFamilyContentState(false);
    setReducedMotionState(false);
    setHasLegacySensitiveData(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      localStorage.removeItem(CARE_SCHEDULE_CONSENT_KEY);
      localStorage.removeItem(PERSONALIZATION_STORAGE_KEY);
      localStorage.removeItem('sunny_island_child_private_artifacts_v1');
      localStorage.removeItem('active_open_hug_state');
      localStorage.removeItem('child_voice_profile');
      localStorage.removeItem('parent_medals_milestones');
    } catch {
      // Ignore
    }
    clearAllPersonalizationData();
    const reset = resetPersonalizationProfile();
    speechNarrator.syncWithCompanion(reset.companionId);
    speechNarrator.setVoiceEnabled(reset.accessibility.voiceEnabled);
    setPersonalization(reset);
    setTodayWeather(null);
    setWeatherHistory([]);
    setHugEvents([]);
    setActiveHugNotice(false);
    setParentObservations(createZeroObservations());
    setCompletedLeaves([]);
    setChildQuotes({});
    setTonightAt('尚未设置');
    setDaysToNextSwitch(null);
    setPackedItems([]);
    setMissNotes([]);
    setStarlightTraits([]);
    setMedals(createZeroMedals());
    setRecentUnlockedMedal(null);
    lockParentAccess();
    setCurrentViewState('child');
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
        reducedMotion,
        setReducedMotion,
        presenceTier,
        setPresenceTier,
        parentObservations,
        incrementSelfInitiated,
        completedLeaves,
        markLeafComplete,
        childQuotes,
        tonightAt,
        setTonightAt,
        daysToNextSwitch,
        setDaysToNextSwitch,
        packedItems,
        togglePackedItem,
        missNotes,
        addMissNote,
        starlightTraits,
        addStarlightTrait,
        removeStarlightTrait,
        medals,
        unlockMedal,
        recentUnlockedMedal,
        dismissUnlockedMedal,
        personalization,
        updatePersonalization,
        resetPersonalization,
        clearAllPersonalization,
        revokePersonalizationConsent,
        saveLocal,
        setSaveLocal,
        careScheduleSaveConsent,
        setCareScheduleSaveConsent,
        persistCareSchedule: careScheduleSaveConsent,
        setPersistCareSchedule: setCareScheduleSaveConsent,
        familyContent,
        setFamilyContent,
        isDemoMode,
        setDemoMode,
        clearAllData,
        clearDeviceData: clearAllData,
        hasLegacySensitiveData,
        clearLegacySensitiveStorage,
        storageError,
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
