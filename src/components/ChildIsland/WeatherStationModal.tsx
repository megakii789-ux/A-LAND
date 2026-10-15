import React, { useState } from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  Eye,
  Heart,
  Volume2,
  X,
  Sparkles,
  ArrowRight,
  Check,
  HelpCircle,
  Users
} from 'lucide-react';
import { WeatherType } from '../../types';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/sound';
import { speechNarrator } from '../../utils/speech';
import { isHeavyWeather } from '../../domain/weather/soilWeatherContract';
import { WeatherSunCloudIllustration } from './StoryGrove/StoryIllustrations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onGoToCalm: () => void;
}

interface WeatherCardItem {
  type: WeatherType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  childPhrase: string;
  intensityPrompt: string;
}

const WEATHERS: WeatherCardItem[] = [
  {
    type: 'sunny',
    label: '晴天',
    icon: Sun,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    childPhrase: '我现在像暖洋洋的太阳，亮堂堂的',
    intensityPrompt: '太阳照在身上：暖暖的，还是热腾腾的？'
  },
  {
    type: 'cloudy',
    label: '阴天',
    icon: Cloud,
    color: 'text-slate-500',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-300',
    childPhrase: '我现在像慢慢飘的厚云，有一点点心事',
    intensityPrompt: '天上的云朵：是淡淡的一层，还是厚厚的？'
  },
  {
    type: 'rainy',
    label: '雨天',
    icon: CloudRain,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    childPhrase: '我现在像下雨天，眼眶或心里有点湿湿的',
    intensityPrompt: '现在的雨：是毛毛细雨，还是大水滴？'
  },
  {
    type: 'stormy',
    label: '雷雨',
    icon: CloudLightning,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-300',
    childPhrase: '我现在像打雷闪电，肚子里有火或者好急好冲',
    intensityPrompt: '雷声的大小：是远远的轰隆，还是近近的巨响？'
  },
  {
    type: 'foggy',
    label: '雾天',
    icon: CloudFog,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    childPhrase: '我现在像在一团雾里，懵懵的看不清',
    intensityPrompt: '周围的雾：是薄薄的一层，还是白茫茫的一片？'
  },
  {
    type: 'opt_out',
    label: '我不想选',
    icon: HelpCircle,
    color: 'text-stone-500',
    bgColor: 'bg-stone-50',
    borderColor: 'border-stone-300',
    childPhrase: '我今天先不挑天气，先自己安安静静呆着',
    intensityPrompt: '没关系，不想选是完全被尊重的。'
  }
];

// 强度级别：3个定性档位，绝不显示 1/2/3/4/5 分数
const INTENSITY_LEVELS: Array<{
  value: number;
  label: string;
  iconVisual: string;
  description: string;
}> = [
  {
    value: 1,
    label: '轻微',
    iconVisual: '🌱',
    description: '一点点，像小微风轻轻吹'
  },
  {
    value: 3,
    label: '明显',
    iconVisual: '🌿',
    description: '很清楚，我明显感觉到'
  },
  {
    value: 5,
    label: '强烈',
    iconVisual: '🌳',
    description: '很大很冲，整个身体都能觉察'
  }
];

const BODY_PARTS = [
  { id: 'head', label: '头热热的' },
  { id: 'chest', label: '胸口堵堵的' },
  { id: 'tummy', label: '肚子紧紧的' },
  { id: 'hands', label: '小手抖抖的' },
  { id: 'relaxed', label: '全身松松的' }
];

export const WeatherStationModal: React.FC<Props> = ({ isOpen, onClose, onGoToCalm }) => {
  const { todayWeather, saveTodayWeather } = useApp();

  const [step, setStep] = useState<'camera' | 'select' | 'heavyHolding'>('camera');
  const [selectedPrimary, setSelectedPrimary] = useState<WeatherType>(todayWeather?.primary || 'sunny');
  const [selectedSecondary, setSelectedSecondary] = useState<WeatherType | null>(todayWeather?.secondary || null);
  const [intensity, setIntensity] = useState<number>(todayWeather?.intensity || 3);
  const [bodySensations, setBodySensations] = useState<string[]>(todayWeather?.bodySensations || ['全身松松的']);
  const [allowDualWeather, setAllowDualWeather] = useState<boolean>(!!todayWeather?.secondary);
  const [calmCornerDeclined, setCalmCornerDeclined] = useState<boolean>(false);
  const [withAdultChosen, setWithAdultChosen] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentPrimaryConfig = WEATHERS.find(w => w.type === selectedPrimary) || WEATHERS[0];

  const handleSpeak = (text: string) => {
    speechNarrator.speak(text);
  };

  // “我不想选”完整路径处理
  const handleOptOutSubmit = () => {
    sounds.playClick();
    saveTodayWeather({
      primary: 'opt_out',
      secondary: null,
      intensity: 1,
      bodySensations: []
    });
    speechNarrator.speak('没关系，不想选是完全可以的。你想在小岛上玩什么都可以。');
    onClose();
  };

  const handleFinishSelection = () => {
    if (selectedPrimary === 'opt_out') {
      handleOptOutSubmit();
      return;
    }

    saveTodayWeather({
      primary: selectedPrimary,
      secondary: allowDualWeather ? selectedSecondary : null,
      intensity,
      bodySensations
    });

    const isHeavy = isHeavyWeather(
      selectedPrimary,
      intensity >= 4 ? 'intense' : intensity >= 2 ? 'medium' : 'gentle'
    );

    if (isHeavy) {
      setStep('heavyHolding');
      handleSpeak(
        selectedPrimary === 'stormy'
          ? '你现在像一团暴风雨。可以生气，可以大喊。我在这儿，我们一起等雷声停下来。'
          : '你现在像一场大雨。可以难过，可以哭一哭。我在这儿，我们一起等雨小一点。'
      );
    } else {
      sounds.playBell();
      onClose();
    }
  };

  const toggleSensation = (label: string) => {
    sounds.playClick();
    setBodySensations(prev =>
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    );
  };

  // 孩子拒绝平静角时的处理：尊重拒绝，不反复循环推荐
  const handleDeclineCalmCorner = () => {
    sounds.playClick();
    setCalmCornerDeclined(true);
    speechNarrator.speak('好呀，不去平静角也可以。我们一起安安静静呆着，或者换个轻巧的故事玩。');
    onClose();
  };

  const handleSelectAdultSupport = () => {
    sounds.playClick();
    setWithAdultChosen(true);
    speechNarrator.speak('你真勇敢，愿意和大人在一起。去找身边的爸爸、妈妈或老师抱一抱吧。');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="情绪天气站"
      className="fixed inset-0 z-50 flex items-center justify-center bg-sky-950/40 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto"
    >
      <div className="bg-white/98 border border-sky-100 rounded-3xl p-5 sm:p-7 max-w-xl w-full shadow-2xl relative my-auto animate-in zoom-in-95 duration-200 text-stone-800 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-2.5 rounded-full hover:bg-stone-100 transition-colors cursor-pointer min-w-[48px] min-h-[48px] flex items-center justify-center"
          aria-label="关闭天气站"
        >
          <X className="w-6 h-6" />
        </button>

        {/* STEP 1: 天上的眼睛看自己 */}
        {step === 'camera' && (
          <div className="text-center py-2 space-y-4">
            <div className="inline-flex items-center gap-2 bg-sky-50 text-sky-800 px-4 py-2 rounded-full text-base font-bold border border-sky-200">
              <Eye className="w-5 h-5 text-sky-600" />
              <span>天上的眼睛看自己</span>
            </div>

            {/* Storybook Weather Illustration */}
            <div className="rounded-3xl overflow-hidden border-2 border-sky-200/90 shadow-sm bg-white">
              <WeatherSunCloudIllustration className="w-full h-32 sm:h-40 object-cover" />
            </div>

            <div className="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto bg-linear-to-b from-sky-200 via-sky-100 to-amber-50 rounded-full flex flex-col items-center justify-center shadow-inner border-4 border-white overflow-hidden">
              <div className="absolute top-2 text-sky-800 font-black text-xs tracking-wide bg-white/90 px-3 py-0.5 rounded-full shadow-2xs">
                拉远一点看
              </div>

              <div className="animate-bounce duration-1000 motion-reduce:animate-none">
                <currentPrimaryConfig.icon className={`w-12 h-12 ${currentPrimaryConfig.color} drop-shadow-xs`} />
              </div>

              <div className="mt-1 text-center">
                <div className="w-10 h-10 bg-amber-200 rounded-full mx-auto flex items-center justify-center border-2 border-white shadow-xs">
                  <span className="text-xl">🧒</span>
                </div>
                <span className="text-xs font-bold text-stone-700 block">我</span>
              </div>
            </div>

            <div className="bg-sky-50/80 p-4 rounded-2xl border border-sky-100">
              <p className="text-base sm:text-lg font-bold text-stone-800 leading-relaxed">
                “把小镜头升到天上：画面里能看到小小的自己，头顶有一朵属于你的天气。”
              </p>
              <p className="text-sm text-sky-700 mt-1.5 font-medium">
                天气会变，云会飘走。情绪只是今天的天气，你永远是你。
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  setStep('select');
                }}
                className="w-full sm:w-auto min-h-[64px] px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-2xl shadow-md transition-all text-lg flex items-center justify-center gap-2 cursor-pointer"
                aria-label="看今天头顶的天气"
              >
                <span>看今天头顶的天气</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={handleOptOutSubmit}
                className="w-full sm:w-auto min-h-[56px] px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-2xl transition-colors text-base flex items-center justify-center gap-2 cursor-pointer"
                aria-label="我不想选，直接回小岛"
              >
                <span>我今天不想选</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: 选天气与感受 */}
        {step === 'select' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-stone-800 flex items-center gap-2">
                  <span>挑选今天的天气</span>
                  <button
                    onClick={() => handleSpeak("挑选今天头顶的天气。晴、阴、雨、雷、雾，或者不想选，都可以。")}
                    className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl hover:bg-sky-100 text-sky-700 transition-colors flex items-center justify-center cursor-pointer"
                    title="朗读提示"
                    aria-label="朗读提示"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </h3>
                <p className="text-base text-stone-600 font-medium">每种天气都很好，没有对错，只选最像你的感觉</p>
              </div>

              <button
                onClick={() => setStep('camera')}
                className="text-sm text-sky-700 hover:text-sky-800 flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 px-3.5 py-2.5 rounded-xl font-bold min-h-[48px] cursor-pointer"
                aria-label="返回天上的眼睛"
              >
                <Eye className="w-4 h-4" />
                <span>天上的眼睛</span>
              </button>
            </div>

            {/* 6 个天气选项 (晴 / 阴 / 雨 / 雷 / 雾 / 我不想选) */}
            <div>
              <label className="text-sm font-bold text-stone-700 uppercase tracking-wider mb-2.5 block">
                1. 挑选今天头顶的天气：
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5">
                {WEATHERS.map((w) => {
                  const Icon = w.icon;
                  const isSelected = selectedPrimary === w.type;
                  return (
                    <button
                      key={w.type}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setSelectedPrimary(w.type);
                      }}
                      className={`min-h-[72px] sm:min-h-[80px] p-2 sm:p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 border-2 transition-all cursor-pointer ${
                        isSelected
                          ? `${w.bgColor} ${w.borderColor} shadow-sm scale-102 font-black`
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                      aria-label={`天气选择：${w.label}`}
                    >
                      <Icon className={`w-8 h-8 ${w.color}`} />
                      <span className="text-sm font-extrabold text-stone-800">{w.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* 儿童句子卡片 */}
              <div className="mt-3.5 p-3.5 bg-amber-50/90 border-2 border-amber-200 rounded-2xl flex items-center justify-between gap-2">
                <span className="text-base text-stone-800 font-bold">
                  “{currentPrimaryConfig.childPhrase}”
                </span>
                <button
                  type="button"
                  onClick={() => handleSpeak(currentPrimaryConfig.childPhrase)}
                  className="text-amber-800 p-2 hover:bg-amber-100 rounded-xl min-w-[48px] min-h-[48px] flex items-center justify-center cursor-pointer shrink-0"
                  aria-label="朗读天气句子"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 如果选了“我不想选”，直接提供轻柔确认退出按钮 */}
            {selectedPrimary === 'opt_out' ? (
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 text-center space-y-3">
                <p className="text-base font-bold text-stone-700">
                  今天不想选天气，完全没关系。你随时可以去任何地方玩。
                </p>
                <button
                  onClick={handleOptOutSubmit}
                  className="min-h-[64px] w-full py-4 bg-stone-700 hover:bg-stone-800 text-white font-black rounded-2xl shadow-md transition-all text-lg flex items-center justify-center gap-2 cursor-pointer"
                  aria-label="确认完成，回小岛"
                >
                  <Check className="w-6 h-6" />
                  好啦，回小岛玩去
                </button>
              </div>
            ) : (
              <>
                {/* 双重天气支持 */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <label className="flex items-center justify-between cursor-pointer min-h-[48px]">
                    <span className="text-base font-bold text-stone-800">
                      我有两种天气同时在（例如：又有点高兴，又有点想念）
                    </span>
                    <input
                      type="checkbox"
                      checked={allowDualWeather}
                      onChange={(e) => {
                        sounds.playClick();
                        setAllowDualWeather(e.target.checked);
                        if (!e.target.checked) setSelectedSecondary(null);
                      }}
                      className="w-5 h-5 rounded-md text-sky-600 focus:ring-sky-500 cursor-pointer"
                      aria-label="勾选是否有两种天气同时存在"
                    />
                  </label>

                  {allowDualWeather && (
                    <div className="mt-3 pt-3 border-t border-stone-200 grid grid-cols-5 gap-2">
                      {WEATHERS.filter(w => w.type !== 'opt_out').map((w) => {
                        const Icon = w.icon;
                        const isSec = selectedSecondary === w.type;
                        return (
                          <button
                            key={w.type}
                            type="button"
                            onClick={() => {
                              sounds.playClick();
                              setSelectedSecondary(w.type);
                            }}
                            className={`min-h-[56px] p-2 rounded-xl flex flex-col items-center justify-center border-2 text-sm cursor-pointer ${
                              isSec ? 'bg-sky-100 border-sky-400 font-bold text-sky-900' : 'bg-white border-stone-200 text-stone-700'
                            }`}
                            aria-label={`第二种天气：${w.label}`}
                          >
                            <Icon className={`w-5 h-5 ${w.color}`} />
                            <span className="text-xs font-bold mt-0.5">{w.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. 天气强烈程度：定性表达，绝不展示 1-5 数字分数 */}
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">
                      2. 这个感觉大不大？
                    </label>
                    <span className="text-xs text-sky-700 font-medium">
                      {currentPrimaryConfig.intensityPrompt}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {INTENSITY_LEVELS.map((lvl) => {
                      const isSelected = intensity === lvl.value;
                      return (
                        <button
                          key={lvl.value}
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setIntensity(lvl.value);
                          }}
                          className={`min-h-[64px] p-3 rounded-2xl text-left border-2 transition-all flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-sky-50 border-sky-500 shadow-xs ring-1 ring-sky-400'
                              : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                          }`}
                          aria-label={`感觉程度：${lvl.label}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-base font-black text-stone-800">
                              {lvl.iconVisual} {lvl.label}
                            </span>
                            {isSelected && <span className="text-sky-600 text-xs font-bold">✓</span>}
                          </div>
                          <span className="text-xs text-stone-500 mt-1 font-medium leading-snug">
                            {lvl.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. 身体感觉地图 */}
                <div>
                  <label className="text-sm font-bold text-stone-700 uppercase tracking-wider mb-2.5 block">
                    3. 身体哪里有感觉？（指出感觉在哪里）
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {BODY_PARTS.map((bp) => {
                      const active = bodySensations.includes(bp.label);
                      return (
                        <button
                          key={bp.id}
                          type="button"
                          onClick={() => toggleSensation(bp.label)}
                          className={`min-h-[56px] px-4 py-3 rounded-2xl text-base font-bold border-2 transition-all cursor-pointer ${
                            active
                              ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-xs'
                              : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                          }`}
                          aria-label={`身体感觉：${bp.label}`}
                        >
                          {active ? '✓ ' : ''}{bp.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 提交主行动按钮 >= 64px */}
                <div className="pt-2">
                  <button
                    onClick={handleFinishSelection}
                    className="w-full min-h-[64px] py-4 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-2xl shadow-md hover:shadow-lg transition-all text-lg flex items-center justify-center gap-2 cursor-pointer"
                    aria-label="记下今天的天气"
                  >
                    <Check className="w-6 h-6" />
                    记下今天的天气
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 3: 高负荷天气接住环节 (不推新重内容，提供和大人一起、平静角、自由退出) */}
        {step === 'heavyHolding' && (
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mx-auto shadow-inner">
              <CloudLightning className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-stone-800 mb-1">
                先停一停，我们在身边
              </h3>
              <p className="text-base text-stone-600 font-medium">天气有点大，现在不忙着动脑筋，感受第一</p>
            </div>

            {/* 接住三句（事实、许可、陪伴） */}
            <div className="bg-violet-50/90 border border-violet-200 rounded-2xl p-4 text-left space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="text-lg">🌧️</span>
                <div>
                  <strong className="text-xs text-violet-800 block">1. 说出事实：</strong>
                  <p className="text-base text-stone-800 font-bold">
                    {selectedPrimary === 'stormy' ? '“你现在像一团暴风雷电，肚子里有火。”' : '“你现在像一场大雨，心里有点湿。”'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="text-lg">💚</span>
                <div>
                  <strong className="text-xs text-violet-800 block">2. 情绪许可：</strong>
                  <p className="text-base text-stone-800 font-bold">
                    “可以难过，可以生气，可以大哭。所有的感受都可以有。”
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="text-lg">🤝</span>
                <div>
                  <strong className="text-xs text-violet-800 block">3. 真实陪伴：</strong>
                  <p className="text-base text-stone-800 font-bold">
                    “我就在这儿陪着你，我们一起等云朵变轻、等雨小一点。”
                  </p>
                </div>
              </div>
            </div>

            {/* 高强度选项：和大人一起、平静角、以及安全退出 */}
            <div className="space-y-3 pt-1">
              {/* 选项 A: 和大人一起 */}
              <button
                type="button"
                onClick={handleSelectAdultSupport}
                className="w-full min-h-[58px] py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl shadow-sm transition-all text-base flex items-center justify-center gap-2 cursor-pointer"
                aria-label="我想和大人在一起抱抱"
              >
                <Users className="w-5 h-5" />
                <span>找身边的大人抱一抱</span>
              </button>

              {withAdultChosen && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-sm font-bold text-center">
                  ❤️ 已经准备好啦：把手伸给身边的大人，或者喊一声“我需要抱抱”
                </div>
              )}

              {/* 选项 B: 平静角深呼吸（若未拒绝则展示） */}
              {!calmCornerDeclined && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playBell();
                    onGoToCalm();
                  }}
                  className="w-full min-h-[58px] py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-sm transition-all text-base flex items-center justify-center gap-2 cursor-pointer"
                  aria-label="去绿草平静角深呼吸"
                >
                  <Sparkles className="w-5 h-5 text-emerald-200" />
                  <span>去“绿草平静角”深呼吸放松</span>
                </button>
              )}

              {/* 选项 C: 拒绝平静角 / 自由留在小岛上（安全退出，不强迫） */}
              <button
                type="button"
                onClick={handleDeclineCalmCorner}
                className="w-full min-h-[56px] py-3.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-2xl transition-colors text-base flex items-center justify-center cursor-pointer"
                aria-label="不去平静角，只想在小岛上玩轻巧的东西"
              >
                <span>我想留在小岛上玩轻松的（不去平静角）</span>
              </button>

              {/* 选项 D: 直接结束退出 */}
              <button
                type="button"
                onClick={onClose}
                className="w-full min-h-[48px] py-3 text-stone-600 hover:text-stone-900 text-sm font-bold transition-colors cursor-pointer flex items-center justify-center"
                aria-label="直接关闭"
              >
                记好了，先关掉天气站
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
