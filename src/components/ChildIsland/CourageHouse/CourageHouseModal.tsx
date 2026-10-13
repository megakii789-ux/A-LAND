import React, { useState } from 'react';
import {
  Mic,
  MessageSquare,
  Home,
  Shield,
  Send,
  X,
  Volume2,
  CheckCircle2,
  Lock,
  Sparkles,
  Inbox
} from 'lucide-react';
import { sounds } from '../../../utils/sound';
import { speechNarrator } from '../../../utils/speech';
import { LocationBadgeIllustration, CourageShieldIllustration } from '../StoryGrove/StoryIllustrations';
import { FriendAsksHomeGame } from '../../InteractiveGames/FriendAsksHomeGame/FriendAsksHomeGame';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CourageHouseModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'toolbox' | 'rooms' | 'blocks' | 'secretBox'>('toolbox');
  const [isFriendAsksGameOpen, setIsFriendAsksGameOpen] = useState<boolean>(false);

  // Three sentences toolbox
  const [activeSentence, setActiveSentence] = useState<string>('light');

  // Information house (rooms)
  const [currentRoom, setCurrentRoom] = useState<'living' | 'bedroom' | 'family'>('living');
  const [bodyTension, setBodyTension] = useState<'tight' | 'relaxed'>('relaxed');

  // Blocks sentence builder
  const [feelingPart, setFeelingPart] = useState<string>('难过');
  const [needPart, setNeedPart] = useState<string>('一个抱抱');

  // Secret letter drawer (not sent to adults, private)
  const [secretLetter, setSecretLetter] = useState<string>('');
  const [letterSaved, setLetterSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSpeak = (text: string) => {
    speechNarrator.speak(text);
  };

  const handleSaveSecretLetter = () => {
    if (!secretLetter.trim()) return;
    sounds.playBell();
    setLetterSaved(true);
    setTimeout(() => {
      setSecretLetter('');
      setLetterSaved(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="bg-rose-50/95 border border-rose-200 rounded-3xl p-5 sm:p-8 max-w-2xl w-full shadow-2xl relative my-auto animate-in zoom-in-95 duration-200 text-stone-800 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-2 rounded-full hover:bg-rose-100 transition-colors z-20"
          aria-label="离开勇气说话屋"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center p-1.5 shadow-inner shrink-0 border-2 border-rose-200">
            <LocationBadgeIllustration type="courage" className="w-full h-full" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl sm:text-3xl font-black text-stone-800">
                勇气说话屋
              </h3>
              <button
                onClick={() => handleSpeak("勇气说话屋：学说三句话，搭好句式积木，有话可以说，也可以说不。保护自己的身体和心！")}
                className="p-2 rounded-xl text-rose-700 hover:bg-rose-100 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="听一听勇气说话屋介绍"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm sm:text-base text-stone-600 font-medium">被问到时有话可说，不说也没关系，永远有权利保护自己</p>
          </div>
        </div>

        {/* Storybook Hero Illustration */}
        <div className="mb-4 rounded-2xl overflow-hidden border-2 border-rose-200 shadow-sm bg-white">
          <CourageShieldIllustration className="w-full h-32 sm:h-40 object-cover" />
        </div>

        {/* 真实可玩互动演练横幅 */}
        <button
          onClick={() => {
            sounds.playClick();
            setIsFriendAsksGameOpen(true);
          }}
          className="w-full mb-4 p-3.5 bg-linear-to-r from-rose-400 via-rose-500 to-rose-600 hover:from-rose-500 hover:to-rose-600 text-white rounded-2xl font-black text-sm sm:text-base flex items-center justify-between shadow-md transition-all active:scale-98 cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-2xl" aria-hidden="true">💬</span>
            <span className="text-left">
              <span>开始真实互动演练：《朋友问起我的家》</span>
              <span className="block text-xs font-normal text-rose-100 mt-0.5">选择怎么说、跟谁说，面对起哄立刻保护自己</span>
            </span>
          </div>
          <span className="text-xs bg-rose-700/60 px-3 py-1.5 rounded-full font-bold shrink-0">
            立刻演练 →
          </span>
        </button>

        {isFriendAsksGameOpen ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsFriendAsksGameOpen(false)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                ← 返回勇气说话屋
              </button>
            </div>
            <FriendAsksHomeGame onExit={() => setIsFriendAsksGameOpen(false)} />
          </div>
        ) : (
          <>
            {/* Navigation Tabs - >=56px touch friendly */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-rose-100/70 rounded-2xl mb-6">
          <button
            onClick={() => {
              sounds.playClick();
              setTab('toolbox');
            }}
            className={`min-h-[52px] py-2.5 px-2 rounded-xl text-sm sm:text-base font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'toolbox'
                ? 'bg-white text-rose-900 shadow-sm border border-rose-200'
                : 'text-stone-700 hover:text-stone-900'
            }`}
            aria-label="打开三句话工具箱"
          >
            <Shield className="w-4 h-4 text-rose-600 shrink-0" />
            <span>三句话工具箱</span>
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setTab('rooms');
            }}
            className={`min-h-[52px] py-2.5 px-2 rounded-xl text-sm sm:text-base font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'rooms'
                ? 'bg-white text-rose-900 shadow-sm border border-rose-200'
                : 'text-stone-700 hover:text-stone-900'
            }`}
            aria-label="打开信息小房子"
          >
            <Home className="w-4 h-4 text-rose-600 shrink-0" />
            <span>信息小房子</span>
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setTab('blocks');
            }}
            className={`min-h-[52px] py-2.5 px-2 rounded-xl text-sm sm:text-base font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'blocks'
                ? 'bg-white text-rose-900 shadow-sm border border-rose-200'
                : 'text-stone-700 hover:text-stone-900'
            }`}
            aria-label="打开积木句拼接"
          >
            <Sparkles className="w-4 h-4 text-rose-600 shrink-0" />
            <span>积木魔法句</span>
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setTab('secretBox');
            }}
            className={`min-h-[52px] py-2.5 px-2 rounded-xl text-sm sm:text-base font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'secretBox'
                ? 'bg-white text-rose-900 shadow-sm border border-rose-200'
                : 'text-stone-700 hover:text-stone-900'
            }`}
            aria-label="打开不寄出的信心事抽屉"
          >
            <Inbox className="w-4 h-4 text-rose-600 shrink-0" />
            <span>心事小抽屉</span>
          </button>
        </div>

        {/* ================= TAB 1: 三句话工具箱 ================= */}
        {tab === 'toolbox' && (
          <div className="space-y-4">
            <div className="bg-white/95 p-4 rounded-3xl border border-rose-200 shadow-xs">
              <h4 className="text-base sm:text-lg font-black text-stone-800 mb-1">
                当有人好奇问：“你爸爸/妈妈今天怎么没来？”
              </h4>
              <p className="text-sm sm:text-base text-stone-600 font-medium">
                你不需要感到难堪，选择最让你舒服的一句话说出来：
              </p>
            </div>

            <div className="grid gap-3">
              {[
                {
                  id: 'light',
                  tag: '1. 轻描淡写',
                  text: '“我爸爸今天有事，今天是我妈妈来接我。你看我画的小恐龙！”',
                  desc: '回答了事实，又自然转向自己想玩的事情。',
                  icon: '🦖'
                },
                {
                  id: 'fact',
                  tag: '2. 简短事实',
                  text: '“我爸爸妈妈分开住，我有两个家。”',
                  desc: '大方平静地说出事实，不用过多解释。',
                  icon: '🏡'
                },
                {
                  id: 'boundary',
                  tag: '3. 礼貌边界',
                  text: '“这是我们家的事，我现在想先去搭积木。”',
                  desc: '不想说的时候，完全有权利温柔地拒绝。',
                  icon: '🧱'
                },
                {
                  id: 'teacher',
                  tag: '4. 求助老师',
                  text: '“如果有人故意起哄嘲笑，我直接转身告诉老师。”',
                  desc: '找可信赖的老师或者大人，是对的！',
                  icon: '🤝'
                }
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    sounds.playClick();
                    setActiveSentence(item.id);
                  }}
                  className={`p-4 rounded-3xl border-2 cursor-pointer transition-all min-h-[64px] ${
                    activeSentence === item.id
                      ? 'bg-white border-rose-400 shadow-md ring-2 ring-rose-200'
                      : 'bg-white/80 border-stone-200 hover:border-rose-300'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveSentence(item.id);
                    }
                  }}
                  aria-label={`选择${item.tag}：${item.text}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-sm sm:text-base font-black text-rose-800">{item.tag}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(item.text);
                      }}
                      className="p-2 rounded-xl text-rose-700 hover:bg-rose-100 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors cursor-pointer"
                      aria-label={`朗读句子：${item.text}`}
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-stone-800 mt-2 leading-snug">
                    {item.text}
                  </p>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 2: 信息小房子 ================= */}
        {tab === 'rooms' && (
          <div className="space-y-4">
            <div className="bg-white/95 p-4 rounded-3xl border border-rose-200 shadow-xs">
              <h4 className="text-base sm:text-lg font-black text-stone-800">信息小房子：说多少、对谁说</h4>
              <p className="text-sm sm:text-base text-stone-600 font-medium mt-1">把事情放进不同的房间，尊重自己的节奏</p>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => {
                  sounds.playClick();
                  setCurrentRoom('living');
                }}
                className={`min-h-[72px] p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                  currentRoom === 'living'
                    ? 'bg-amber-100 border-amber-400 text-amber-950 font-black shadow-xs ring-2 ring-amber-200'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-amber-300'
                }`}
                aria-label="查看客厅信息：谁都能知道的事"
              >
                <span className="text-2xl block mb-1">🛋️</span>
                <span className="text-sm sm:text-base block font-bold">客厅</span>
                <span className="text-xs text-stone-500 block font-medium">谁都能知道</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setCurrentRoom('bedroom');
                }}
                className={`min-h-[72px] p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                  currentRoom === 'bedroom'
                    ? 'bg-sky-100 border-sky-400 text-sky-950 font-black shadow-xs ring-2 ring-sky-200'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-sky-300'
                }`}
                aria-label="查看卧室信息：好朋友知道的事"
              >
                <span className="text-2xl block mb-1">🛏️</span>
                <span className="text-sm sm:text-base block font-bold">卧室</span>
                <span className="text-xs text-stone-500 block font-medium">好朋友知道</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setCurrentRoom('family');
                }}
                className={`min-h-[72px] p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                  currentRoom === 'family'
                    ? 'bg-rose-100 border-rose-400 text-rose-950 font-black shadow-xs ring-2 ring-rose-200'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-rose-300'
                }`}
                aria-label="查看家人房信息：家人和可信大人知道的事"
              >
                <span className="text-2xl block mb-1">🏡</span>
                <span className="text-sm sm:text-base block font-bold">家人房</span>
                <span className="text-xs text-stone-500 block font-medium">家人和可信大人</span>
              </button>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-rose-200 text-sm sm:text-base shadow-xs space-y-3">
              {currentRoom === 'living' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-base sm:text-lg font-black text-amber-900 flex items-center gap-1.5">
                      <span>🛋️ 客厅里的信息：</span>
                    </span>
                    <button
                      onClick={() => handleSpeak("客厅里的信息：我的名字、我爱吃草莓蛋糕、我喜欢搭积木。谁都可以知道！")}
                      className="p-1.5 text-stone-600 hover:text-stone-900"
                      aria-label="朗读客厅信息"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-stone-800 font-medium text-base leading-relaxed">
                    我的名字、我爱吃草莓蛋糕、我喜欢搭积木。谁都可以知道！
                  </p>
                </div>
              )}
              {currentRoom === 'bedroom' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-base sm:text-lg font-black text-sky-900 flex items-center gap-1.5">
                      <span>🛏️ 卧室里的信息：</span>
                    </span>
                    <button
                      onClick={() => handleSpeak("卧室里的信息：我有点怕黑、我有两套喜爱的拼图玩具。关系很好的好朋友可以知道。")}
                      className="p-1.5 text-stone-600 hover:text-stone-900"
                      aria-label="朗读卧室信息"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-stone-800 font-medium text-base leading-relaxed">
                    我有点怕黑、我有两套喜爱的拼图玩具。关系很好的好朋友可以知道。
                  </p>
                </div>
              )}
              {currentRoom === 'family' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-base sm:text-lg font-black text-rose-900 flex items-center gap-1.5">
                      <span>🏡 家人房里的信息：</span>
                    </span>
                    <button
                      onClick={() => handleSpeak("家人房里的信息：两个家里的秘密小事、大人的安排。只留给家人和真正信任的人知道。")}
                      className="p-1.5 text-stone-600 hover:text-stone-900"
                      aria-label="朗读家人房信息"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-stone-800 font-medium text-base leading-relaxed">
                    两个家里的秘密小事、大人的安排。只留给家人和真正信任的人知道。
                  </p>
                </div>
              )}

              {/* 身体感觉提问 */}
              <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span className="text-sm sm:text-base font-bold text-stone-700">想一想：想到这些事情时，你的小肚子是？</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setBodyTension('relaxed');
                    }}
                    className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-sm font-black border transition-all cursor-pointer ${
                      bodyTension === 'relaxed'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-400 ring-2 ring-emerald-200'
                        : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}
                    aria-label="肚子感觉松松的"
                  >
                    松松的 🟢
                  </button>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setBodyTension('tight');
                    }}
                    className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-sm font-black border transition-all cursor-pointer ${
                      bodyTension === 'tight'
                        ? 'bg-amber-100 text-amber-900 border-amber-400 ring-2 ring-amber-200'
                        : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}
                    aria-label="肚子感觉紧紧的"
                  >
                    紧紧的 🟡
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-2xl border-2 border-amber-200 text-sm sm:text-base text-amber-900 font-bold flex items-center gap-2">
              <span className="text-xl">🌟</span>
              <span>无论在哪间房间：让我不舒服的事，一定要告诉可信赖的大人！</span>
            </div>
          </div>
        )}
        {/* ================= TAB 3: 积木魔法句 ================= */}
        {tab === 'blocks' && (
          <div className="space-y-4">
            <div className="bg-white/95 p-4 rounded-3xl border border-rose-200 shadow-xs">
              <h4 className="text-base sm:text-lg font-black text-stone-800">“我感到……我需要……” 积木魔法句</h4>
              <p className="text-sm sm:text-base text-stone-600 font-medium mt-1">点选彩色大积木，拼出一句能准确告诉大人的话：</p>
            </div>

            {/* Blocks choice: Feeling */}
            <div>
              <span className="text-sm sm:text-base font-bold text-stone-700 block mb-2">1. 点击我的身体感受积木：</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { text: '难过', emoji: '😢' },
                  { text: '生气', emoji: '😤' },
                  { text: '想念', emoji: '💌' },
                  { text: '有点累', emoji: '🥱' },
                  { text: '孤单', emoji: '🎈' }
                ].map((f) => (
                  <button
                    key={f.text}
                    onClick={() => {
                      sounds.playClick();
                      setFeelingPart(f.text);
                    }}
                    className={`min-h-[56px] p-2.5 rounded-2xl text-base font-black border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      feelingPart === f.text
                        ? 'bg-rose-500 text-white border-rose-600 shadow-md ring-2 ring-rose-200 scale-102'
                        : 'bg-white border-stone-200 text-stone-700 hover:border-rose-300'
                    }`}
                    aria-label={`选择感受积木：${f.text}`}
                  >
                    <span className="text-xl">{f.emoji}</span>
                    <span>{f.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Blocks choice: Need */}
            <div>
              <span className="text-sm sm:text-base font-bold text-stone-700 block mb-2">2. 点击我需要的帮助积木：</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {[
                  { text: '一个抱抱', emoji: '🤗' },
                  { text: '陪我玩5分钟积木', emoji: '🧱' },
                  { text: '安静一会儿', emoji: '🤫' },
                  { text: '听你讲个故事', emoji: '📖' },
                  { text: '喝一口温水', emoji: '💧' }
                ].map((n) => (
                  <button
                    key={n.text}
                    onClick={() => {
                      sounds.playClick();
                      setNeedPart(n.text);
                    }}
                    className={`min-h-[56px] p-3 rounded-2xl text-base font-black border-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      needPart === n.text
                        ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-200 scale-102'
                        : 'bg-white border-stone-200 text-stone-700 hover:border-amber-300'
                    }`}
                    aria-label={`选择需要积木：${n.text}`}
                  >
                    <span className="text-xl">{n.emoji}</span>
                    <span>{n.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Assembled sentence preview with large text */}
            <div className="p-5 bg-white rounded-3xl border-2 border-rose-300 shadow-md text-center space-y-3">
              <span className="text-xs sm:text-sm font-bold text-stone-400 block uppercase tracking-wider">拼好的积木魔法句：</span>
              <div className="text-xl sm:text-2xl font-black text-rose-900 leading-relaxed">
                “我现在感到<span className="text-rose-600 underline underline-offset-4 decoration-rose-300">{feelingPart}</span>，我需要<span className="text-amber-600 underline underline-offset-4 decoration-amber-300">{needPart}</span>。”
              </div>
              <div>
                <button
                  onClick={() => handleSpeak(`我现在感到${feelingPart}，我需要${needPart}。`)}
                  className="min-h-[56px] px-6 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-2xl text-base font-black inline-flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                  aria-label="听一听拼好的积木魔法句"
                >
                  <Volume2 className="w-5 h-5 text-rose-700" />
                  <span>听一听这句话</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: 不寄出的信 ================= */}
        {tab === 'secretBox' && (
          <div className="space-y-4">
            <div className="bg-white/95 p-4 rounded-3xl border border-rose-200 shadow-xs flex items-center justify-between gap-3">
              <div>
                <h4 className="text-base sm:text-lg font-black text-stone-800">不寄出的信（安放心事小抽屉）</h4>
                <p className="text-sm sm:text-base text-stone-600 font-medium mt-0.5">这里只属于你自己，默认绝对不会给大人看，安心安放感受</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0 text-rose-600">
                <Lock className="w-6 h-6" />
              </div>
            </div>

            <textarea
              value={secretLetter}
              onChange={(e) => setSecretLetter(e.target.value)}
              placeholder="写下或请大朋友帮忙打字：任何今天让你委屈、想念或悄悄难过的事情……放进抽屉后盖上盖子。"
              rows={4}
              className="w-full p-4 rounded-3xl border-2 border-stone-200 bg-white text-base sm:text-lg focus:outline-hidden focus:ring-2 focus:ring-rose-400 font-medium text-stone-800"
              aria-label="写下你的小秘密心事"
            />

            {letterSaved && (
              <div className="p-4 bg-emerald-100 text-emerald-900 rounded-2xl text-base font-black text-center animate-in zoom-in flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <span>🔒 心事已经轻轻锁进小抽屉啦。你的感受被好好安放着！</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                disabled={!secretLetter.trim()}
                onClick={handleSaveSecretLetter}
                className="min-h-[56px] px-8 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-2xl text-base sm:text-lg font-black shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                aria-label="盖上盖子，放进抽屉"
              >
                <Send className="w-5 h-5" />
                <span>盖上盖子，放进抽屉</span>
              </button>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};
