import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Compass,
  UserCheck,
  Heart,
  ShieldCheck,
  HelpCircle,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ParentGateModal } from './ParentGateModal';
import { PrivacyDeclarationModal } from './Privacy/PrivacyDeclarationModal';
import { sounds } from '../utils/sound';
import { lockParentAccess } from '../domain/privacy/parentAccess';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    isMuted,
    toggleMute,
    activeHugNotice,
    acknowledgeHug,
    todayWeather
  } = useApp();

  const [isGateOpen, setIsGateOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // SEC-06: 离开成人工作台、页面隐藏或生命周期变化时立即锁定
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        lockParentAccess();
        if (currentView === 'parent') {
          setCurrentView('child');
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentView, setCurrentView]);

  const handleSwitchToParent = () => {
    if (currentView === 'parent') {
      lockParentAccess();
      setCurrentView('child');
    } else {
      setIsGateOpen(true);
    }
  };

  const handleGateSuccess = () => {
    setIsGateOpen(false);
    setCurrentView('parent');
  };


  return (
    <>
      <header role="banner" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-3 sm:px-6 py-2 sm:py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          {/* Logo and Tagline */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">
            <div role="img" aria-label="晴雨小岛 标志" className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-linear-to-tr from-amber-400 to-sky-400 flex items-center justify-center text-xl sm:text-2xl shadow-xs shrink-0">
              🏝️
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-base sm:text-lg text-stone-900 tracking-tight">
                  晴雨小岛
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                  <span aria-hidden="true" className="text-stone-300">·</span>
                  <span>儿童思考方法成长空间</span>
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden md:block">
                退后一步，看清事实、理解他人、自己做选择
              </p>
            </div>
          </div>

          {/* Right Action Controls as navigation landmark */}
          <nav role="navigation" aria-label="快捷工具栏及端切换" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Active Hug Alert Pill */}
            {activeHugNotice && (
              <button
                onClick={() => {
                  sounds.playBell();
                  setCurrentView('parent');
                  acknowledgeHug();
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md animate-pulse min-h-[44px]"
                aria-label="孩子发出了求助抱抱提醒，点击立刻切换至家长端"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span className="hidden sm:inline">孩子需要抱抱</span>
                <span className="sm:hidden">抱抱</span>
              </button>
            )}

            {/* Sound Toggle */}
            <button
              onClick={toggleMute}
              className={`w-11 h-11 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-stone-100 text-stone-400 border-stone-200'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
              title={isMuted ? '取消静音' : '静音'}
              aria-label={isMuted ? '伴伴声音已静音，点击取消静音' : '伴伴声音正在播放，点击静音'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Privacy Declaration Info button */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsPrivacyOpen(true);
              }}
              className="h-11 sm:h-10 px-2.5 sm:px-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="儿童与家庭隐私保护声明"
              aria-label="儿童与家庭隐私保护声明，打开隐私声明弹窗"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">隐私声明</span>
            </button>

            {/* Framework About info */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsAboutOpen(true);
              }}
              className="w-11 h-11 sm:w-10 sm:h-10 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors flex items-center justify-center cursor-pointer"
              title="产品框架与设计理念"
              aria-label="产品设计理念，打开产品核心根叶框架介绍弹窗"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Switch Mode: Child Island vs Parent Coach */}
            <button
              onClick={handleSwitchToParent}
              className={`h-11 sm:h-10 px-3 sm:px-3.5 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                currentView === 'parent'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                  : 'bg-amber-100/90 text-amber-900 border-amber-300 hover:bg-amber-200'
              }`}
              aria-label={currentView === 'parent' ? '当前处于家长端，点击返回孩子端小岛' : '当前处于孩子端，点击切换到家长教练端'}
            >
              {currentView === 'parent' ? (
                <>
                  <Compass className="w-4 h-4" />
                  <span>孩子端</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">家长教练端</span>
                  <span className="sm:hidden">家长端</span>
                </>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Parent Verification Gate */}
      <ParentGateModal
        isOpen={isGateOpen}
        onClose={() => setIsGateOpen(false)}
        onSuccess={handleGateSuccess}
      />

      {/* Privacy Declaration Modal */}
      <PrivacyDeclarationModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      {/* Framework About Modal */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-stone-800 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setIsAboutOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-2 rounded-full hover:bg-stone-100 transition-colors"
              aria-label="关闭关于产品说明弹窗"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div role="img" aria-label="绿芽标志" className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl">
                🌱
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">产品主线：根与叶</h3>
                <p className="text-xs text-stone-500">6岁儿童思考方法成长空间设计核心</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-stone-600 leading-relaxed">
              <p>
                <strong>这是一套面向日常各种生活场景的通用思考方法：</strong>
                日常生活的丰富情境是自然生长的枝叶；产品的主线只有一条：用孩子动手就能玩懂的具体经验，让孩子在安全温暖的探索中自主发现受用终身的方法（根）。
              </p>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                <div className="font-bold text-stone-800">三种姿态与核心动作：</div>
                <div>• <strong>退后一步：</strong>学会把情绪和自我分开，头顶有一朵属于自己的天气（看见情绪，接纳感受）。</div>
                <div>• <strong>分：</strong>看清是什么，分清事实、感受与猜测。</div>
                <div>• <strong>通：</strong>同一件事换个视角看，发现不同的可能性与新视角。</div>
                <div>• <strong>择：</strong>了解行动与结果，学着自主选择（保护安全是不可动摇的底线）。</div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900">
                <strong>双端支持法则：</strong>身边的成年人提供温暖陪伴、持续支持与可预测的关爱。孩子端专注于轻松自主的探索与练习，绝不设积分、排名、倒计时与惩罚。
              </div>
            </div>

            <button
              onClick={() => setIsAboutOpen(false)}
              className="mt-5 w-full py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
            >
              了解完毕，开始体验
            </button>
          </div>
        </div>
      )}
    </>
  );
};
