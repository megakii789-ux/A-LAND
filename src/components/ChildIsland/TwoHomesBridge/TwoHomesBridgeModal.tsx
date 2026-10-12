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

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

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
  const [newMissText, setNewMissText] = useState<string>('');

  if (!isOpen) return null;

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
      <div className="bg-amber-50/95 border-2 border-amber-200 rounded-3xl p-5 sm:p-8 max-w-2xl w-full shadow-2xl relative my-auto animate-in zoom-in-95 duration-200 text-stone-800 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-2 rounded-full hover:bg-amber-100 transition-colors z-20 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="离开两个家的桥"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center p-1.5 shadow-inner shrink-0 border-2 border-teal-200">
            <LocationBadgeIllustration type="bridge" className="w-full h-full" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl sm:text-3xl font-black text-stone-800">
                两个家的桥
              </h3>
              <button
                onClick={() => handleSpeak("两个家的桥：看今晚在哪个家，准备换家小书包，安放你的思念。爱在两个家里一样多！")}
                className="p-2 rounded-xl text-teal-700 hover:bg-teal-100 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors cursor-pointer"
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

        {/* Navigation - min-h-[52px] */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-amber-100/70 rounded-2xl mb-6">
          <button
            onClick={() => {
              sounds.playClick();
              setTab('calendar');
            }}
            className={`min-h-[52px] py-2.5 px-2 rounded-xl text-sm sm:text-base font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
            className={`min-h-[52px] py-2.5 px-2 rounded-xl text-sm sm:text-base font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
            className={`min-h-[52px] py-2.5 px-2 rounded-xl text-sm sm:text-base font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
            <div className="bg-white p-5 rounded-3xl border-2 border-amber-300 shadow-sm text-center space-y-2">
              <span className="text-xs sm:text-sm font-bold text-amber-800 uppercase tracking-wider block">
                🌙 今晚睡在：
              </span>
              <div className="text-3xl sm:text-4xl font-black text-stone-800 flex items-center justify-center gap-2">
                <span>🏡 {tonightAt}</span>
                <button
                  onClick={() => handleSpeak(`今晚睡在${tonightAt}。还有${daysToNextSwitch}个晚上换到另一个家。`)}
                  className="p-1.5 text-amber-700 hover:text-amber-900 cursor-pointer"
                  aria-label={`朗读今晚安排：今晚睡在${tonightAt}`}
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-950 px-4 py-1.5 rounded-full text-sm sm:text-base font-bold shadow-2xs">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>还有 <strong>{daysToNextSwitch}</strong> 个晚上换到{tonightAt === '妈妈家' ? '爸爸家' : '妈妈家'}</span>
              </div>
            </div>

            {/* Visual 7-day strip */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs">
              <span className="text-base sm:text-lg font-black text-stone-800 block mb-3">
                本周日程小脚印（点一点听安排）：
              </span>
              <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
                {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, idx) => {
                  const isCurrent = idx === 3;
                  const home = idx < 4 ? '妈妈家' : '爸爸家';
                  return (
                    <button
                      key={day}
                      onClick={() => {
                        sounds.playClick();
                        handleSpeak(`${day}，住在${home}`);
                      }}
                      className={`min-h-[64px] p-1.5 sm:p-2 rounded-2xl border-2 flex flex-col justify-center items-center text-xs sm:text-sm cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-amber-500 text-white border-amber-600 font-black shadow-md ring-2 ring-amber-300 scale-105'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-amber-300'
                      }`}
                      aria-label={`${day}，住在${home}${isCurrent ? '（今天）' : ''}`}
                    >
                      <div className="text-xs sm:text-sm font-bold opacity-90">{day}</div>
                      <div className="text-xl sm:text-2xl mt-1">{home === '妈妈家' ? '👩' : '👨'}</div>
                    </button>
                  );
                })}
              </div>
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
