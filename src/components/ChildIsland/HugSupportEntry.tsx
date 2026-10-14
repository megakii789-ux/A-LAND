import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Mail,
  Send,
  Sparkles,
  Volume2,
  X,
  Users,
  CheckCircle2,
  AlertCircle,
  Wind,
  WifiOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/sound';
import { speechNarrator } from '../../utils/speech';
import {
  HugRequestType,
  CommunicationStatus,
  CareResponsibility,
  CoPresenceStatus,
  HugDomainState,
  mapHugStateToChildPresentation,
  OfflineHugController
} from '../../domain/hug';

interface HugSupportEntryProps {
  onOpenCalmCorner?: () => void;
}

export const HugSupportEntry: React.FC<HugSupportEntryProps> = ({ onOpenCalmCorner }) => {
  const { setChildPlace } = useApp();

  // 离线控制器实例
  const controllerRef = useRef(new OfflineHugController());

  // 弹窗与 Tab 状态
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'A_INSTANT' | 'B_ASYNC'>('A_INSTANT');

  // 目标监护人（AG-R5: 默认采用中性“身边信任的大人”）
  const [targetCaregiver, setTargetCaregiver] = useState<'身边信任的大人' | '爸爸' | '妈妈'>('身边信任的大人');

  // 入口 A: 我现在需要大人 (三轴领域状态) - 支持刷新恢复 (Refresh during open hug)
  const [instantDomainState, setInstantDomainState] = useState<HugDomainState | null>(() => {
    return OfflineHugController.restoreActiveState();
  });

  // 入口 B: 我想告诉 XX 我想 Ta 了 (异步消息领域状态与留言内容)
  const [asyncDomainState, setAsyncDomainState] = useState<HugDomainState | null>(null);
  const [asyncMessageTag, setAsyncMessageTag] = useState<string>('画了一朵小云想给你看');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 持久化活跃抱抱状态
  useEffect(() => {
    OfflineHugController.serializeActiveState(instantDomainState);
  }, [instantDomainState]);

  // 网络状态监听 (Network loss during hug / Reconnect)
  useEffect(() => {
    const handleOffline = () => {
      if (instantDomainState) {
        const updated = controllerRef.current.handleNetworkLossDuringHug(instantDomainState);
        setInstantDomainState(updated);
        const pres = mapHugStateToChildPresentation(updated);
        speechNarrator.speak(pres.spokenText);
      }
    };

    const handleOnline = () => {
      if (instantDomainState && instantDomainState.communication === CommunicationStatus.SEND_FAILED) {
        const reconnectInfo = controllerRef.current.handleReconnect(instantDomainState);
        speechNarrator.speak(reconnectInfo.promptText);
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [instantDomainState]);

  // 处理入口 A: 发起即时求助 (SEC-03: 诚实告知儿童这里不会发消息，引导找身边大人)
  const handleStartInstantHelp = async () => {
    if (isSubmitting) return; // duplicate submit guard
    sounds.playWarmHug();
    setIsSubmitting(true);
    try {
      const resultState = await controllerRef.current.submitHugRequest({
        isOnline: false,
        targetCaregiverName: targetCaregiver,
        requestType: HugRequestType.INSTANT_HELP,
        hasVerifiedRemoteRelay: false
      });
      setInstantDomainState(resultState);
      const presentation = mapHugStateToChildPresentation(resultState);
      speechNarrator.speak(presentation.spokenText);
    } catch {
      const fallbackState: HugDomainState = {
        requestType: HugRequestType.INSTANT_HELP,
        communication: CommunicationStatus.SEND_FAILED,
        care: CareResponsibility.UNASSIGNED,
        coPresence: CoPresenceStatus.NOT_PRESENT,
        targetCaregiverName: targetCaregiver
      };
      setInstantDomainState(fallbackState);
      const presentation = mapHugStateToChildPresentation(fallbackState);
      speechNarrator.speak(presentation.spokenText);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理入口 B: 发送异步想念 (SEC-03: 本机小岛保存，不冒充远程送达)
  const handleSendAsyncMiss = async () => {
    if (isSubmitting) return;
    sounds.playClick();
    setIsSubmitting(true);
    try {
      const resultState = await controllerRef.current.submitHugRequest({
        isOnline: false,
        targetCaregiverName: targetCaregiver,
        requestType: HugRequestType.ASYNC_MISS,
        hasVerifiedRemoteRelay: false
      });
      setAsyncDomainState(resultState);
      const presentation = mapHugStateToChildPresentation(resultState);
      speechNarrator.speak(presentation.spokenText);
    } catch {
      const fallbackState: HugDomainState = {
        requestType: HugRequestType.ASYNC_MISS,
        communication: CommunicationStatus.SEND_FAILED,
        care: CareResponsibility.UNASSIGNED,
        coPresence: CoPresenceStatus.NOT_PRESENT,
        targetCaregiverName: targetCaregiver
      };
      setAsyncDomainState(fallbackState);
      const presentation = mapHugStateToChildPresentation(fallbackState);
      speechNarrator.speak(presentation.spokenText);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 本地 Completion：“我身边有大人了” (关闭提示，不作为远程到场证明)
  const handleLocalConfirmArrived = () => {
    sounds.playBell();
    speechNarrator.speak('小提醒已关闭。有大人在身边，慢慢来。');
    setInstantDomainState(null);
    setIsOpen(false);
  };

  // 通过纯函数 domain mapper 获取文案（组件不自行判断）
  const currentInstantPresentation = instantDomainState
    ? mapHugStateToChildPresentation(instantDomainState)
    : null;

  const currentAsyncPresentation = asyncDomainState
    ? mapHugStateToChildPresentation(asyncDomainState)
    : null;

  return (
    <div className="relative w-full sm:w-auto">
      {/* 底部固定入口按钮 */}
      <button
        type="button"
        onClick={() => {
          sounds.playWarmHug();
          setIsOpen(true);
        }}
        className="group relative flex items-center justify-between sm:justify-start gap-3.5 px-6 py-4 min-h-[64px] w-full sm:w-auto rounded-3xl bg-linear-to-r from-rose-400 via-pink-400 to-rose-400 text-white shadow-lg hover:shadow-rose-200/80 hover:brightness-105 transition-all duration-200 motion-reduce:transition-none transform active:scale-95 motion-reduce:active:scale-100 cursor-pointer"
        aria-label="找大人抱抱与想念入口：点击打开求助与想念窗口"
      >
        <span className="absolute -inset-1 rounded-3xl bg-rose-400/25 animate-pulse motion-reduce:animate-none opacity-75 group-hover:opacity-100 pointer-events-none" />

        <div className="relative flex items-center gap-3.5 min-w-0">
          <div className="relative flex items-center justify-center w-11 h-11 min-w-[44px] rounded-2xl bg-white/20 backdrop-blur-xs shrink-0 shadow-inner">
            <Heart className="w-6 h-6 text-white fill-white/90 group-hover:scale-110 transition-transform" />
          </div>

          <div className="text-left min-w-0">
            <div className="text-lg sm:text-xl font-black tracking-wide flex items-center gap-1.5 text-white">
              <span>找大人抱抱</span>
              <Sparkles className="w-4 h-4 text-amber-200 shrink-0" />
            </div>
            <div className="text-sm sm:text-base text-rose-50 font-medium truncate">
              {instantDomainState
                ? currentInstantPresentation?.displayText || '正在支持中 · 点击查看'
                : '身边有人在 · 随时可以找大人'}
            </div>
          </div>
        </div>

        <span className="relative w-10 h-10 rounded-xl bg-white/20 hover:bg-white/35 flex items-center justify-center text-white shrink-0 ml-2 transition-colors">
          <Volume2 className="w-5 h-5" />
        </span>
      </button>

      {/* 弹窗全屏或大卡片支持交互 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="找大人支持与想念"
        >
          <div
            className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl border-2 border-rose-200 relative my-auto animate-in zoom-in-95 duration-200 text-stone-800 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮：允许随时离开屏幕，不强迫等待 */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-2.5 rounded-full hover:bg-stone-100 transition-colors cursor-pointer min-w-[48px] min-h-[48px] flex items-center justify-center"
              aria-label="暂时关闭窗口，回小岛自由玩"
            >
              <X className="w-6 h-6" />
            </button>

            {/* 顶栏双入口切换 Tab */}
            <div className="flex gap-2 p-1 bg-stone-100 rounded-2xl mb-5">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('A_INSTANT');
                }}
                className={`flex-1 min-h-[48px] py-2.5 px-3 rounded-xl font-black text-base flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'A_INSTANT'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                aria-label="入口A：我现在需要大人"
              >
                <Heart className="w-5 h-5" />
                <span>我现在需要大人</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('B_ASYNC');
                }}
                className={`flex-1 min-h-[48px] py-2.5 px-3 rounded-xl font-black text-base flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'B_ASYNC'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                aria-label="入口B：我想告诉 Ta 我想 Ta 了"
              >
                <Mail className="w-5 h-5" />
                <span>我想告诉 Ta</span>
              </button>
            </div>

            {/* 照顾者选择器 */}
            <div className="mb-4">
              <label className="text-xs font-bold text-stone-500 block mb-2">
                你想告诉谁：
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['身边信任的大人', '妈妈', '爸爸'] as const).map((person) => (
                  <button
                    key={person}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setTargetCaregiver(person);
                    }}
                    className={`min-h-[48px] p-2 rounded-xl text-base font-bold border-2 transition-all cursor-pointer ${
                      targetCaregiver === person
                        ? 'bg-rose-50 border-rose-400 text-rose-900 font-black'
                        : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}
                  >
                    {person}
                  </button>
                ))}
              </div>
            </div>

            {/* ======================= 入口 A: 我现在需要大人 ======================= */}
            {activeTab === 'A_INSTANT' && (
              <div className="space-y-4">
                {!instantDomainState ? (
                  <div className="space-y-4 text-center py-2">
                    <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
                      🫂
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                        需要大人的现实陪伴
                      </h3>
                      <p className="text-base text-stone-600 mt-1 font-medium">
                        心里有点难受、害怕，或者需要一个温暖的大抱抱
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartInstantHelp}
                      className="w-full min-h-[64px] py-4 px-6 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-2xl shadow-md text-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                      aria-label="在屏幕上开启找大人提醒"
                    >
                      <Heart className="w-6 h-6 fill-white" />
                      <span>找 {targetCaregiver}（请走到大人身边）</span>
                    </button>
                  </div>
                ) : (
                  /* 状态进行中：严密基于 domain mapper 获取陈述文案，无倒计时，无无限转圈 */
                  <div className="space-y-4">
                    <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/90 border-2 border-rose-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-800 bg-rose-100 px-3 py-1 rounded-full">
                          {currentInstantPresentation?.displayText}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (currentInstantPresentation) {
                              speechNarrator.speak(currentInstantPresentation.spokenText);
                            }
                          }}
                          className="w-9 h-9 rounded-xl bg-white text-rose-700 flex items-center justify-center shadow-xs cursor-pointer"
                          aria-label="朗读当前状态"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      </div>

                      <p className="text-base sm:text-lg text-stone-800 font-bold leading-relaxed">
                        “{currentInstantPresentation?.spokenText}”
                      </p>

                      <div className="pt-2 border-t border-rose-200/80 flex items-center gap-2 text-sm text-rose-900 font-semibold">
                        <span>🌱</span>
                        <span>温和行动：{currentInstantPresentation?.safeWaitingAction}</span>
                      </div>
                    </div>

                    {/* 本地结束按键：结束本地求助引导 (说明本地关闭不等于远程确认到场) */}
                    <button
                      type="button"
                      onClick={handleLocalConfirmArrived}
                      className="w-full min-h-[56px] py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-sm text-base flex items-center justify-center gap-2 cursor-pointer"
                      aria-label="我身边有大人了，关闭提醒"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                      <span>我身边有大人了（关闭提示）</span>
                    </button>

                    {/* 非接触式与安全求助指引卡片 (SEC-03: 提供陪伴、说话、找老师等多种安心选择) */}
                    <div className="bg-amber-50/90 p-4 rounded-2xl border border-amber-200/90 text-xs sm:text-sm text-stone-700 space-y-2">
                      <span className="font-bold flex items-center gap-1.5 text-amber-900">
                        <span>💡</span>
                        <span>你现在可以试着这样做：</span>
                      </span>
                      <ul className="list-disc list-inside space-y-1.5 text-stone-700 font-medium leading-relaxed">
                        <li>请身边信任的大人坐在旁边陪陪你、说说话</li>
                        <li>走到大人面前拉拉衣角，告诉大人“我需要你陪我一会儿”</li>
                        <li>如果身边的熟悉大人在忙，可以直接找老师或其他安全大人</li>
                        <li>也可以去绿草平静角深呼吸，摸摸安心小玩偶</li>
                      </ul>
                      <p className="text-[11px] text-stone-500 pt-1 border-t border-amber-200/60">
                        提示：这里不会发消息。小岛陪伴你，最重要的事情是直接找身边看得见的大人。
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ======================= 入口 B: 我想告诉 XX 我想 Ta 了 ======================= */}
            {activeTab === 'B_ASYNC' && (
              <div className="space-y-4">
                {!asyncDomainState ? (
                  <div className="space-y-4 text-center py-2">
                    <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
                      💌
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                        异步想念信 · 不需要等回复
                      </h3>
                      <p className="text-base text-stone-600 mt-1 font-medium">
                        把想念的话装进小信封。大人有空时会看，你不需要等在屏幕前。
                      </p>
                    </div>

                    <div className="space-y-2 text-left">
                      <span className="text-xs font-bold text-stone-500 block">选择一句话：</span>
                      {[
                        '画了一朵小云想给你看',
                        '今天吃到了很甜的苹果',
                        '搭了一个高高的积木城堡',
                        '我想对你说声晚安'
                      ].map((phrase) => (
                        <button
                          key={phrase}
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setAsyncMessageTag(phrase);
                          }}
                          className={`w-full p-3 rounded-xl border-2 text-left font-bold text-base transition-all cursor-pointer ${
                            asyncMessageTag === phrase
                              ? 'bg-sky-50 border-sky-400 text-sky-900'
                              : 'bg-white border-stone-200 text-stone-700'
                          }`}
                        >
                          💌 {phrase}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleSendAsyncMiss}
                      className="w-full min-h-[64px] py-4 px-6 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-2xl shadow-md text-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                      aria-label="在小岛写下想念信（保存在本机）"
                    >
                      <Send className="w-5 h-5" />
                      <span>在小岛写下想念信（装进本机小信封）</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/90 border-2 border-sky-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-800 bg-sky-100 px-3 py-1 rounded-full">
                          {currentAsyncPresentation?.displayText}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (currentAsyncPresentation) {
                              speechNarrator.speak(currentAsyncPresentation.spokenText);
                            }
                          }}
                          className="w-9 h-9 rounded-xl bg-white text-sky-700 flex items-center justify-center shadow-xs cursor-pointer"
                          aria-label="朗读想念信内容"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      </div>

                      <p className="text-base sm:text-lg text-stone-800 font-bold leading-relaxed">
                        “{currentAsyncPresentation?.spokenText}”
                      </p>

                      <div className="pt-2 border-t border-sky-200/80 flex items-center gap-2 text-sm text-sky-900 font-semibold">
                        <span>🍃</span>
                        <span>温和行动：{currentAsyncPresentation?.safeWaitingAction}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAsyncDomainState(null)}
                      className="w-full min-h-[52px] py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-2xl text-base transition-colors cursor-pointer"
                    >
                      再写一封想念信
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* AG-R5 契约：当面求助、暂不表达、退出、寻找其他安全成年人均必须可用 */}
            <div className="mt-5 pt-4 border-t border-stone-200 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {/* 1. 当面求助 */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    speechNarrator.speak('走到大人身边拉拉衣角，告诉大人“我需要你陪我一会儿”。');
                  }}
                  className="min-h-[48px] py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  aria-label="当面求助：拉拉大人衣角"
                >
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>当面求助（拉拉衣角）</span>
                </button>

                {/* 2. 寻找其他安全成年人 */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    speechNarrator.speak('如果熟悉的大人暂时不在，可以直接找老师、护士或其他信任的大人。');
                  }}
                  className="min-h-[48px] py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  aria-label="寻找其他安全成年人"
                >
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>找老师或其他安全大人</span>
                </button>

                {/* 3. 暂不表达 */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    speechNarrator.speak('不想说也没关系。把心里的小门轻轻关好，自己待一会儿也是完全可以的。');
                    setIsOpen(false);
                  }}
                  className="min-h-[48px] py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  aria-label="暂不表达：我先自己待会儿"
                >
                  <Wind className="w-4 h-4 text-stone-500" />
                  <span>我先自己待会儿（暂不表达）</span>
                </button>

                {/* 4. 平静角深呼吸 */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setIsOpen(false);
                    if (onOpenCalmCorner) {
                      onOpenCalmCorner();
                    } else {
                      setChildPlace('calm');
                    }
                  }}
                  className="min-h-[48px] py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  aria-label="去平静角深呼吸"
                >
                  <Wind className="w-4 h-4 text-emerald-600" />
                  <span>去平静角深呼吸</span>
                </button>
              </div>

              {/* 5. 退出 */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 text-stone-500 hover:text-stone-800 text-sm font-semibold transition-colors cursor-pointer text-center"
                aria-label="退出求助窗口，回小岛自由玩"
              >
                退出求助窗口，回小岛自由玩（随时可重新打开）
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
