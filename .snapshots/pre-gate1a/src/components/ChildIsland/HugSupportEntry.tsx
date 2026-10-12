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

  // 目标监护人
  const [targetCaregiver, setTargetCaregiver] = useState<'爸爸' | '妈妈' | '身边的大人'>('妈妈');

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

  // 处理入口 A: 发起即时求助 (离线时绝不模拟成功，明确显示 SEND_FAILED)
  const handleStartInstantHelp = async () => {
    if (isSubmitting) return; // duplicate submit guard
    sounds.playWarmHug();
    setIsSubmitting(true);
    try {
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      const resultState = await controllerRef.current.submitHugRequest({
        isOnline,
        targetCaregiverName: targetCaregiver,
        requestType: HugRequestType.INSTANT_HELP
      });
      setInstantDomainState(resultState);
      const presentation = mapHugStateToChildPresentation(resultState);
      speechNarrator.speak(presentation.spokenText);
    } catch {
      // 出现异常 fail closed 明确设为失败
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

  // 处理入口 B: 发送异步想念
  const handleSendAsyncMiss = async () => {
    if (isSubmitting) return;
    sounds.playClick();
    setIsSubmitting(true);
    try {
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      const resultState = await controllerRef.current.submitHugRequest({
        isOnline,
        targetCaregiverName: targetCaregiver,
        requestType: HugRequestType.ASYNC_MISS
      });
      setAsyncDomainState(resultState);
      const presentation = mapHugStateToChildPresentation(resultState);
      speechNarrator.speak(presentation.spokenText);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 本地 Completion：“有人来陪我了”
  // 目的仅为结束本地支持流程；不报告谁有没有来；不向另一位家长发送对抗数据
  const handleLocalConfirmArrived = () => {
    sounds.playBell();
    if (instantDomainState) {
      const confirmedState: HugDomainState = {
        ...instantDomainState,
        coPresence: CoPresenceStatus.ARRIVED_CONFIRMED,
      };
      setInstantDomainState(confirmedState);
      const pres = mapHugStateToChildPresentation(confirmedState);
      speechNarrator.speak(pres.spokenText);

      // 短暂显示退场提示后退出
      setTimeout(() => {
        setInstantDomainState(null);
        setIsOpen(false);
      }, 2000);
    }
  };

  // 模拟切换 Canonical State（便于在无网络后端时验证与体验各个规范状态）
  const handleSimulateCanonicalState = (stateNumber: number) => {
    sounds.playClick();
    let nextState: HugDomainState;
    switch (stateNumber) {
      case 1: // local/send failed
        nextState = {
          requestType: HugRequestType.INSTANT_HELP,
          communication: CommunicationStatus.SEND_FAILED,
          care: CareResponsibility.UNASSIGNED,
          coPresence: CoPresenceStatus.NOT_PRESENT,
          targetCaregiverName: targetCaregiver,
        };
        break;
      case 2: // server accepted, unseen
        nextState = {
          requestType: HugRequestType.INSTANT_HELP,
          communication: CommunicationStatus.SENT,
          care: CareResponsibility.UNASSIGNED,
          coPresence: CoPresenceStatus.NOT_PRESENT,
          targetCaregiverName: targetCaregiver,
        };
        break;
      case 3: // caregiver opened, unassigned
        nextState = {
          requestType: HugRequestType.INSTANT_HELP,
          communication: CommunicationStatus.ACKNOWLEDGED,
          care: CareResponsibility.UNASSIGNED,
          coPresence: CoPresenceStatus.NOT_PRESENT,
          targetCaregiverName: targetCaregiver,
        };
        break;
      case 4: // caregiver promised self, unconfirmed
        nextState = {
          requestType: HugRequestType.INSTANT_HELP,
          communication: CommunicationStatus.ACKNOWLEDGED,
          care: CareResponsibility.ASSIGNED_SELF,
          coPresence: CoPresenceStatus.UNCONFIRMED,
          targetCaregiverName: targetCaregiver,
        };
        break;
      case 5: // caregiver delegated, unconfirmed
        nextState = {
          requestType: HugRequestType.INSTANT_HELP,
          communication: CommunicationStatus.ACKNOWLEDGED,
          care: CareResponsibility.ASSIGNED_OTHER,
          coPresence: CoPresenceStatus.UNCONFIRMED,
          targetCaregiverName: targetCaregiver,
        };
        break;
      case 6: // caregiver cannot attend
        nextState = {
          requestType: HugRequestType.INSTANT_HELP,
          communication: CommunicationStatus.ACKNOWLEDGED,
          care: CareResponsibility.CANNOT_ATTEND,
          coPresence: CoPresenceStatus.NOT_PRESENT,
          targetCaregiverName: targetCaregiver,
        };
        break;
      case 7: // locally confirmed
      default:
        nextState = {
          requestType: HugRequestType.INSTANT_HELP,
          communication: CommunicationStatus.ACKNOWLEDGED,
          care: CareResponsibility.ASSIGNED_SELF,
          coPresence: CoPresenceStatus.ARRIVED_CONFIRMED,
          targetCaregiverName: targetCaregiver,
        };
        break;
    }
    setInstantDomainState(nextState);
    const pres = mapHugStateToChildPresentation(nextState);
    speechNarrator.speak(pres.spokenText);
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
                {(['妈妈', '爸爸', '身边的大人'] as const).map((person) => (
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
                      aria-label="确认送出求助提醒"
                    >
                      <Heart className="w-6 h-6 fill-white" />
                      <span>呼唤 {targetCaregiver} 抱抱我</span>
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

                    {/* 本地 Completion：“有人来陪我了” (结束支持流程，不报告、不对抗) */}
                    <button
                      type="button"
                      onClick={handleLocalConfirmArrived}
                      className="w-full min-h-[56px] py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-sm text-base flex items-center justify-center gap-2 cursor-pointer"
                      aria-label="有人来陪我了，结束求助"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                      <span>有人来陪我了（结束本次提醒）</span>
                    </button>

                    {/* 状态模拟切换区：严格展示 7 种 Canonical States */}
                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                      <span className="text-xs font-bold text-stone-500 block mb-1.5">
                        切换客观状态测试：
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => handleSimulateCanonicalState(1)}
                          className="p-2 rounded-lg bg-white border border-stone-200 text-stone-700 text-left hover:bg-stone-100 cursor-pointer"
                        >
                          1. 发送故障
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSimulateCanonicalState(2)}
                          className="p-2 rounded-lg bg-white border border-stone-200 text-stone-700 text-left hover:bg-stone-100 cursor-pointer"
                        >
                          2. 已达中继未看
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSimulateCanonicalState(3)}
                          className="p-2 rounded-lg bg-white border border-stone-200 text-stone-700 text-left hover:bg-stone-100 cursor-pointer"
                        >
                          3. 大人已看未指派
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSimulateCanonicalState(4)}
                          className="p-2 rounded-lg bg-white border border-stone-200 text-stone-700 text-left hover:bg-stone-100 cursor-pointer"
                        >
                          4. 承诺前来未确认
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSimulateCanonicalState(5)}
                          className="p-2 rounded-lg bg-white border border-stone-200 text-stone-700 text-left hover:bg-stone-100 cursor-pointer"
                        >
                          5. 委托他人未确认
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSimulateCanonicalState(6)}
                          className="p-2 rounded-lg bg-white border border-stone-200 text-stone-700 text-left hover:bg-stone-100 cursor-pointer"
                        >
                          6. 大人暂时抽不开身
                        </button>
                      </div>
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
                      aria-label="寄出想念信"
                    >
                      <Send className="w-5 h-5" />
                      <span>寄出想念信给 {targetCaregiver}</span>
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
                          aria-label="朗读想念送达状态"
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

            {/* 等待 UI 安全出口：允许离开屏幕、找身边成人、去平静角 */}
            <div className="mt-5 pt-4 border-t border-stone-200 space-y-2">
              <div className="grid grid-cols-2 gap-2">
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
                  className="min-h-[48px] py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  aria-label="去平静角深呼吸"
                >
                  <Wind className="w-4 h-4 text-emerald-600" />
                  <span>去平静角深呼吸</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    speechNarrator.speak('身边有老师或家人时，可以直接走到他们面前拉拉衣角。');
                  }}
                  className="min-h-[48px] py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  aria-label="找身边能看到的大人"
                >
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>找身边看得见的大人</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 text-stone-500 hover:text-stone-800 text-sm font-semibold transition-colors cursor-pointer text-center"
              >
                离开屏幕，回小岛玩去（随时点我重新打开）
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
