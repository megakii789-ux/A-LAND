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
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'sunny_rain_island_v1_state';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<'child' | 'parent'>('child');
  const [childPlace, setChildPlace] = useState<IslandPlace>('island');
  const [selectedLeafId, setSelectedLeafId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

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

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.todayWeather) setTodayWeather(parsed.todayWeather);
        if (parsed.weatherHistory) setWeatherHistory(parsed.weatherHistory);
        if (parsed.parentObservations) setParentObservations(parsed.parentObservations);
        if (parsed.completedLeaves) setCompletedLeaves(parsed.completedLeaves);
        if (parsed.childQuotes) setChildQuotes(parsed.childQuotes);
        if (parsed.tonightAt) setTonightAt(parsed.tonightAt);
        if (parsed.packedItems) setPackedItems(parsed.packedItems);
        if (parsed.missNotes) setMissNotes(parsed.missNotes);
        if (parsed.starlightTraits) setStarlightTraits(parsed.starlightTraits);
        if (parsed.presenceTier) setPresenceTier(parsed.presenceTier);
        if (parsed.medals) setMedals(parsed.medals);
      }
    } catch {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      const stateToSave = {
        todayWeather,
        weatherHistory,
        parentObservations,
        completedLeaves,
        childQuotes,
        tonightAt,
        packedItems,
        missNotes,
        starlightTraits,
        presenceTier,
        medals
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {}
  }, [
    todayWeather,
    weatherHistory,
    parentObservations,
    completedLeaves,
    childQuotes,
    tonightAt,
    packedItems,
    missNotes,
    starlightTraits,
    presenceTier,
    medals
  ]);

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
        dismissUnlockedMedal
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
