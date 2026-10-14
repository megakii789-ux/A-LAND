import React, { useState } from 'react';
import {
  Calendar,
  Backpack,
  HeartHandshake,
  Heart,
  X,
  Volume2,
  CheckCircle2,
  Clock,
  Sparkles,
  Home
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { sounds } from '../../../utils/sound';
import { speechNarrator } from '../../../utils/speech';
import {
  IslandPanoramaIllustration,
  LocationBadgeIllustration,
  TwoHomesBridgeCardIllustration
} from '../StoryGrove/StoryIllustrations';
import { IslandUiIconSvg } from '../CompanionIcons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const WEEK_SCHEDULE = [
  { day: '周一', home: '妈妈家' as const },
  { day: '周二', home: '妈妈家' as const },
  { day: '周三', home: '妈妈家' as const },
  { day: '周四', home: '妈妈家' as const, isToday: true },
  { day: '周五', home: '爸爸家' as const },
  { day: '周六', home: '爸爸家' as const },
  { day: '周日', home: '爸爸家' as const },
];

export const TwoHomesBridgeModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    tonightAt,
    daysToNextSwitch,
    packedItems,
    togglePackedItem,
    missNotes,
    addMissNote
  } = useApp();

  const [tab, setTab] = useState<'calendar' | 'ritual' | 'missBox'>('calendar');
  const [calendarViewMode, setCalendarViewMode] = useState<'strip' | 'list'>('strip');
  const [newMissText, setNewMissText] = useState<string>('');

  if (!isOpen) return null;

  const isScheduleConfigured = tonightAt !== '尚未设置' && daysToNextSwitch !== null;
  const spokenTonightSchedule = isScheduleConfigured
    ? `今晚睡在${tonightAt}。还有${daysToNextSwitch}个晚上换到${tonightAt === '妈妈家' ? '爸爸家' : '妈妈家'}。`
    : '大人还没有设置今晚住哪个家，你可以请身边的大人在家长区填好日程，或者点下面的小脚印听听示例安排。';

  const handleSpeak = (text: string) => {
    speechNarrator.speak(text);
  };

  const handleSendMiss = () => {
    if (!newMissText.trim()) return;
    sounds.playBell();
    addMissNote(newMissText.trim());
    setNewMissText('');
  };

  const PACKING_CANDIDATES = [
    { text: '安心小熊玩偶', emoji: '🧸' },
    { text: '最爱读的绘本', emoji: '📖' },
    { text: '彩色水彩画笔', emoji: '🎨' },
    { text: '自己的小水杯', emoji: '🥛' },
    { text: '晚安睡眠小毯子', emoji: '🛌' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="bg-amber-50/95 border-2 border-amber-200 rounded-3xl p-4 sm:p-8 max-w-2xl w-full shadow-2xl relative my-auto transition-all duration-200 text-stone-800 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-stone-500 hover:text-stone-700 p-2 rounded-full hover:bg-amber-100 transition-colors z-20 cursor-pointer min-w-[56px] min-h-[56px] flex items-center justify-center"
          aria-label="离开两个家的桥"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pr-12">
          <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center p-1.5 shadow-inner shrink-0 border-2 border-teal-200">
            <LocationBadgeIllustration type="bridge" className="w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xl sm:text-3xl font-black text-stone-800">
                两个家的桥
              </h3>
              <button
                onClick={() => handleSpeak("两个家的桥：看今晚在哪个家，准备换家小书包，安放你的思念。爱在两个家里一样多！")}
                className="p-2 rounded-xl text-teal-700 hover:bg-teal-100 min-w-[56px] min-h-[56px] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="听一听两个家的桥介绍"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm sm:text-base text-stone-600 font-medium">可预测的日程与温馨交接，让两个家都成为安心港湾</p>
          </div>
        </div>

        {/* Storybook Hero Illustration */}
        <div className="mb-5 rounded-2xl overflow-hidden border-2 border-amber-200 shadow-sm bg-white">
          <TwoHomesBridgeCardIllustration className="w-full h-32 sm:h-40 object-cover" />
        </div>

        {/* Navigation - min-h-[56px] */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1.5 bg-amber-100/70 rounded-2xl mb-6">
          <button
            onClick={() => {
              sounds.playClick();
              setTab('calendar');
            }}
            className={`min-h-[56px] py-2 px-1.5 sm:px-2 rounded-xl text-xs sm:text-base font-black transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap ${
              tab === 'calendar'
                ? 'bg-white text-amber-950 shadow-sm border border-amber-200'
                : 'text-stone-700 hover:text-stone-900'
            }`}
            aria-label="查看图画日历"
          >
            <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
            <span>图画日历</span>
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setTab('ritual');
            }}
            className={`min-h-[56px] py-2 px-1.5 sm:px-2 rounded-xl text-xs sm:text-base font-black transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap ${
              tab === 'ritual'
                ? 'bg-white text-amber-950 shadow-sm border border-amber-200'
                : 'text-stone-700 hover:text-stone-900'
            }`}
            aria-label="整理换家小书包"
          >
            <Backpack className="w-4 h-4 text-amber-700 shrink-0" />
            <span>换家小书包</span>
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setTab('missBox');
            }}
            className={`min-h-[56px] py-2 px-1.5 sm:px-2 rounded-xl text-xs sm:text-base font-black transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap ${
              tab === 'missBox'
                ? 'bg-white text-amber-950 shadow-sm border border-amber-200'
                : 'text-stone-700 hover:text-stone-900'
            }`}
            aria-label="打开想念盒子"
          >
            <Heart className="w-4 h-4 text-rose-600 shrink-0" />
            <span>想念盒子</span>
          </button>
        </div>

        {/* ================= TAB 1: 图画日历 ================= */}
        {tab === 'calendar' && (
          <div className="space-y-4">
            <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-amber-300 shadow-sm text-center space-y-2.5">
              <span className="text-xs sm:text-sm font-bold text-amber-800 uppercase tracking-wider block">
                🌙 今晚睡在：
              </span>
              <div className="text-2xl sm:text-4xl font-black text-stone-800 flex items-center justify-center gap-2">
                {tonightAt === '妈妈家' ? (
                  <IslandUiIconSvg name="mom_home" className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" />
                ) : tonightAt === '爸爸家' ? (
                  <IslandUiIconSvg name="dad_home" className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" />
                ) : (
                  <Home className="w-7 h-7 text-amber-700 shrink-0" />
                )}
                <span>{isScheduleConfigured ? tonightAt : '等待大人设置日程'}</span>
                <button
                  onClick={() => handleSpeak(spokenTonightSchedule)}
                  className="p-2 text-amber-700 hover:text-amber-900 cursor-pointer min-w-[48px] min-h-[48px] flex items-center justify-center rounded-xl hover:bg-amber-50"
                  aria-label={`朗读今晚安排：${spokenTonightSchedule}`}
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-950 px-4 py-1.5 rounded-full text-xs sm:text-base font-bold shadow-2xs">
                <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                {isScheduleConfigured ? (
                  <span>
                    还有 <strong>{daysToNextSwitch}</strong> 个晚上换到{tonightAt === '妈妈家' ? '爸爸家' : '妈妈家'}
                  </span>
                ) : (
                  <span>大人在家长区填好换家日程后，这里就会显示倒数晚数啦</span>
                )}
              </div>
            </div>

            {/* Visual 7-day strip + equivalent list toggle */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm sm:text-lg font-black text-stone-800">
                  本周日程小脚印（点一点听安排）：
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setCalendarViewMode(prev => (prev === 'strip' ? 'list' : 'strip'));
                  }}
                  className="min-h-[44px] px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-extrabold border border-amber-300 cursor-pointer transition-colors"
                  aria-label={calendarViewMode === 'strip' ? '切换为整周列表视图（无需左右滑动）' : '切换为横向日历条视图'}
                >
                  {calendarViewMode === 'strip' ? '📋 切换列表视图' : '📅 切换日历条视图'}
                </button>
              </div>

              {calendarViewMode === 'strip' ? (
                <>
                  {/* Mobile explicit horizontal scroll hint */}
                  <div className="sm:hidden flex items-center justify-between text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/80">
                    <span>↔ 左右滑动查看整周 7 天日程</span>
                    <span className="text-[11px] text-stone-500">或点上方切换列表</span>
                  </div>

                  <div
                    role="region"
                    aria-label="本周七天日程横向日历条"
                    className="flex sm:grid sm:grid-cols-7 gap-2 overflow-x-auto snap-x snap-mandatory pb-1.5 pt-1"
                  >
                    {WEEK_SCHEDULE.map(({ day, home, isToday }) => (
                      <button
                        key={day}
                        onClick={() => {
                          sounds.playClick();
                          handleSpeak(`${day}，住在${home}`);
                        }}
                        className={`min-w-[74px] sm:min-w-0 min-h-[76px] p-2 rounded-2xl border-2 shrink-0 snap-center flex flex-col justify-center items-center text-xs sm:text-sm cursor-pointer transition-all ${
                          isToday
                            ? 'bg-amber-500 text-white border-amber-600 font-black shadow-md ring-2 ring-amber-300'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-amber-300'
                        }`}
                        aria-label={`${day}，住在${home}${isToday ? '（今天）' : ''}`}
                      >
                        <div className="text-xs font-bold opacity-95 whitespace-nowrap">
                          {day}{isToday ? '·今' : ''}
                        </div>
                        <IslandUiIconSvg
                          name={home === '妈妈家' ? 'mom_home' : 'dad_home'}
                          className="w-7 h-7 my-1"
                        />
                        <div className={`text-[10px] font-bold whitespace-nowrap ${isToday ? 'text-amber-50' : 'text-stone-500'}`}>
                          {home}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div
                  role="region"
                  aria-label="本周七天日程等效列表视图"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  {WEEK_SCHEDULE.map(({ day, home, isToday }) => (
                    <button
                      key={day}
                      onClick={() => {
                        sounds.playClick();
                        handleSpeak(`${day}，住在${home}`);
                      }}
                      className={`min-h-[56px] px-3.5 py-2.5 rounded-2xl border-2 flex items-center justify-between text-sm cursor-pointer transition-all ${
                        isToday
                          ? 'bg-amber-500 text-white border-amber-600 font-black shadow-sm'
                          : 'bg-stone-50 border-stone-200 text-stone-800 hover:border-amber-300 font-bold'
                      }`}
                      aria-label={`${day}，住在${home}${isToday ? '（今天）' : ''}`}
                    >
                      <span className="flex items-center gap-2">
                        <IslandUiIconSvg
                          name={home === '妈妈家' ? 'mom_home' : 'dad_home'}
                          className="w-7 h-7 shrink-0"
                        />
                        <span>{day} {isToday ? '（今天）' : ''}</span>
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        isToday ? 'bg-white text-amber-900' : 'bg-white text-stone-700 border border-stone-200'
                      }`}>
                        住在{home}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="text-sm sm:text-base text-stone-600 text-center leading-relaxed font-medium bg-amber-50/80 p-3 rounded-2xl border border-amber-200">
              这里不统计谁占了多少天。两个家都为你准备了温暖的小床和可口的饭菜！
            </p>
          </div>
        )}

        {/* ================= TAB 2: 换家小书包与仪式 ================= */}
        {tab === 'ritual' && (
          <div className="space-y-4">
            <div className="bg-white/95 p-4 rounded-3xl border border-amber-200 shadow-xs">
              <h4 className="text-base sm:text-lg font-black text-stone-800">清点安心物放进书包：</h4>
              <p className="text-sm sm:text-base text-stone-600 font-medium mt-0.5">带一件让你在两个家都感到熟悉安心的小宝贝</p>
            </div>

            <div className="grid gap-2.5">
              {PACKING_CANDIDATES.map((item) => {
                const isPacked = packedItems.includes(item.text);
                return (
                  <button
                    key={item.text}
                    onClick={() => {
                      sounds.playClick();
                      togglePackedItem(item.text);
                      if (!isPacked) {
                        handleSpeak(`把${item.text}放进书包啦！`);
                      }
                    }}
                    className={`w-full min-h-[58px] p-3.5 rounded-2xl border-2 flex items-center justify-between text-base sm:text-lg font-black transition-all cursor-pointer ${
                      isPacked
                        ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-sm ring-2 ring-amber-200'
                        : 'bg-white border-stone-200 text-stone-700 hover:border-amber-300'
                    }`}
                    aria-label={`${item.text}，${isPacked ? '已放进书包' : '点击放进书包'}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-2xl">{item.emoji}</span>
                      <span>{item.text}</span>
                    </span>
                    <span className={`text-sm px-3 py-1 rounded-full font-bold flex items-center gap-1 ${
                      isPacked ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {isPacked ? <CheckCircle2 className="w-4 h-4" /> : null}
                      <span>{isPacked ? '已在书包' : '+ 放进书包'}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 bg-amber-100/80 rounded-3xl border-2 border-amber-300 text-sm sm:text-base text-amber-950 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-base sm:text-lg flex items-center gap-1.5">
                  <span>✨ “明天见”交接小动作：</span>
                </span>
                <button
                  onClick={() => handleSpeak("和送你的大人做一个击掌、对碰小拳头，或者做一个大大的拥抱！“明天见，我永远爱你！”")}
                  className="p-1 text-amber-800 hover:text-amber-950 cursor-pointer"
                  aria-label="朗读交接小动作说明"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              <p className="font-medium leading-relaxed">
                和送你的大人做一个击掌、对碰小拳头，或者做一个大大的拥抱！“明天见，我永远爱你！”
              </p>
            </div>
          </div>
        )}

        {/* ================= TAB 3: 想念盒子 ================= */}
        {tab === 'missBox' && (
          <div className="space-y-4">
            <div className="bg-white/95 p-4 rounded-3xl border border-amber-200 shadow-xs">
              <h4 className="text-base sm:text-lg font-black text-stone-800">想念盒子：把想念轻轻收起来</h4>
              <p className="text-sm sm:text-base text-stone-600 font-medium mt-0.5">想念是爱的证明。写下一句话，不强制发送给大人</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={newMissText}
                onChange={(e) => setNewMissText(e.target.value)}
                placeholder="例如：今天想念一起讲恐龙故事的晚上……"
                className="flex-1 min-h-[56px] text-base px-4 py-3 rounded-2xl border-2 border-stone-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium text-stone-800"
                aria-label="写下你的小思念"
              />
              <button
                onClick={handleSendMiss}
                disabled={!newMissText.trim()}
                className="min-h-[56px] px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-2xl text-base font-black shadow-md transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
                aria-label="收进盒子里"
              >
                收进盒子里
              </button>
            </div>

            <div className="space-y-2.5 pt-1">
              <span className="text-sm font-bold text-stone-500 block">盒子里存放的小思念：</span>
              {missNotes.length === 0 ? (
                <div className="p-4 bg-white rounded-2xl border border-stone-200 text-center text-stone-400 font-medium text-sm">
                  盒子里目前空空的，有想念随时写下来存着
                </div>
              ) : (
                missNotes.map((note) => (
                  <div key={note.id} className="p-4 bg-white rounded-2xl border-2 border-stone-200 text-base font-medium text-stone-800 flex justify-between items-center shadow-2xs">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">💌</span>
                      <span>{note.text}</span>
                    </span>
                    <span className="text-xs text-stone-400 font-bold">{note.date}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
