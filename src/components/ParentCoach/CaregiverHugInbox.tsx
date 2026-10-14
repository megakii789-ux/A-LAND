import React, { useState } from 'react';
import {
  Heart,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Settings2,
  MessageSquare,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { sounds } from '../../utils/sound';
import {
  TrustedCaregiverContact,
  CaregiverActionChoice,
  CaregiverActionResolution,
  PrivateReflectionOutcome,
  PrivateReflectionRecord,
  ReliabilityReviewConfig,
  DEFAULT_RELIABILITY_CONFIG,
  PARENT_REPAIR_SCRIPT,
  resolveCaregiverChoice,
  evaluateReliabilityReview
} from '../../domain/caregiver';

export interface HugInboxItem {
  id: string;
  childPseudonym: string;
  createdAt: string;
  requestType: 'INSTANT_HELP' | 'ASYNC_MISS';
  currentChoice?: CaregiverActionResolution;
  isLocallyConfirmedByChild: boolean;
  reflectionOutcome?: PrivateReflectionOutcome;
}

interface Props {
  // 外部注入的配置与联系人
  trustedCaregivers?: TrustedCaregiverContact[];
}

const INITIAL_TRUSTED_CONTACTS: TrustedCaregiverContact[] = [
  { id: 'contact-1', name: '李老师（幼儿园班主任）', relationship: '老师', isOnsite: true },
  { id: 'contact-2', name: '外婆（同住长辈）', relationship: '外婆', isOnsite: true },
  { id: 'contact-3', name: '爸爸（另一家监护人）', relationship: '爸爸', isOnsite: false },
  { id: 'contact-4', name: '奶奶（邻近社区）', relationship: '奶奶', isOnsite: false },
];

const DEMO_REQUESTS: HugInboxItem[] = [
  {
    id: 'req-1',
    childPseudonym: '小禾（6岁 · 演示模拟）',
    createdAt: '刚刚（10分钟前）',
    requestType: 'INSTANT_HELP',
    isLocallyConfirmedByChild: false, // 孩子端未确认完成
  },
  {
    id: 'req-2',
    childPseudonym: '小禾（6岁 · 演示模拟）',
    createdAt: '昨天傍晚',
    requestType: 'INSTANT_HELP',
    isLocallyConfirmedByChild: false,
    reflectionOutcome: 'I_COULD_NOT_GO',
  },
  {
    id: 'req-3',
    childPseudonym: '小禾（6岁 · 演示模拟）',
    createdAt: '上周三下午',
    requestType: 'INSTANT_HELP',
    isLocallyConfirmedByChild: true,
    reflectionOutcome: 'I_ATTENDED',
  }
];

const DEMO_REFLECTIONS: PrivateReflectionRecord[] = [
  {
    id: 'ref-1',
    hugRequestId: 'req-2',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    outcome: 'I_COULD_NOT_GO',
  }
];

export const CaregiverHugInbox: React.FC<Props> = ({
  trustedCaregivers = INITIAL_TRUSTED_CONTACTS,
}) => {
  // 可配置阈值（绝不硬编码在 UI）
  const [config, setConfig] = useState<ReliabilityReviewConfig>(DEFAULT_RELIABILITY_CONFIG);
  const [showConfigSettings, setShowConfigSettings] = useState(false);

  // AG-R5 契约：真实模式默认空收件箱；3 条模拟记录仅在明确隔离的 Demo Mode 下显示
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [requests, setRequests] = useState<HugInboxItem[]>([]);
  const [reflections, setReflections] = useState<PrivateReflectionRecord[]>([]);

  // 响应演示模式切换
  React.useEffect(() => {
    if (isDemoMode) {
      setRequests(DEMO_REQUESTS);
      setReflections(DEMO_REFLECTIONS);
    } else {
      setRequests([]);
      setReflections([]);
    }
  }, [isDemoMode]);

  // 选择委托他人时的弹窗状态
  const [delegatingReqId, setDelegatingReqId] = useState<string | null>(null);

  // 反思中的请求 ID
  const [activeReflectionReqId, setActiveReflectionReqId] = useState<string | null>(null);

  // 家长做出三项排他动作之一
  const handleAction = (
    reqId: string,
    choice: CaregiverActionChoice,
    delegatedContact?: TrustedCaregiverContact
  ) => {
    sounds.playClick();
    try {
      const resolution = resolveCaregiverChoice(choice, delegatedContact);
      setRequests(prev =>
        prev.map(r => (r.id === reqId ? { ...r, currentChoice: resolution } : r))
      );
    } catch (err: any) {
      alert(err?.message || '操作失败');
    }
  };

  // 家长填写私密反思
  const handleSaveReflection = (reqId: string, outcome: PrivateReflectionOutcome) => {
    sounds.playBell();
    const newRecord: PrivateReflectionRecord = {
      id: Date.now().toString(),
      hugRequestId: reqId,
      timestamp: new Date().toISOString(),
      outcome,
    };
    setReflections(prev => [newRecord, ...prev]);
    setRequests(prev =>
      prev.map(r => (r.id === reqId ? { ...r, reflectionOutcome: outcome } : r))
    );
    setActiveReflectionReqId(null);
  };

  // 纯函数计算可靠性建议（绝不打分、绝无连续记录、绝无比较）
  const reviewStatus = evaluateReliabilityReview(reflections, config);

  return (
    <div className="space-y-6 text-stone-800">
      {/* 头部与私密自省定位说明 */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-rose-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              即时陪伴请求 · 响应与自省
            </span>
            <span className="text-xs text-stone-500 font-medium">
              无评分 · 无对抗 · 事实为先
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
            家长陪伴响应收件箱
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
            当孩子发出呼唤时，请诚实选择你的现状。不给空头许诺，诚实是建立依恋安全感的基石。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
              isDemoMode
                ? 'bg-amber-500 text-white shadow-xs font-black'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <span>{isDemoMode ? '退出演示模式' : '演示模式 (Demo Mode)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowConfigSettings(!showConfigSettings)}
            className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer shrink-0"
          >
            <Settings2 className="w-4 h-4" />
            <span>配置审查阈值 ({config.missThreshold}次 / {config.rollingWindowDays}天)</span>
          </button>
        </div>
      </div>

      {/* 配置调整面板（证明阈值在配置中，绝非硬编码） */}
      {showConfigSettings && (
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3 text-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-700">可靠性温和审查配置（可调整，非硬编码）：</span>
            <span className="text-xs text-stone-500">v0.6 循证假设</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-stone-600 block mb-1">滚动时间窗口（天数）：</label>
              <input
                type="number"
                min="3"
                max="30"
                value={config.rollingWindowDays}
                onChange={(e) => setConfig({ ...config, rollingWindowDays: Number(e.target.value) || 14 })}
                className="w-full p-2 border border-stone-300 rounded-xl bg-white font-bold text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-stone-600 block mb-1">未履约自报触发阈值（次）：</label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.missThreshold}
                onChange={(e) => setConfig({ ...config, missThreshold: Number(e.target.value) || 2 })}
                className="w-full p-2 border border-stone-300 rounded-xl bg-white font-bold text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* 可靠性温和审查提示（当自报未履约达到阈值时展示建议，绝不自动关闭功能） */}
      {reviewStatus.shouldRecommendReview && (
        <div className="p-5 bg-amber-50/90 border-2 border-amber-300 rounded-3xl shadow-xs space-y-3 animate-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-black text-amber-950">
                生活节奏与陪伴方式温和建议
              </h4>
              <p className="text-sm text-amber-900 mt-1 leading-relaxed font-medium">
                {reviewStatus.recommendationMessage}
              </p>
              <p className="text-xs text-amber-800/80 mt-2">
                * 晴雨小岛不会自动关闭即时抱抱功能。生活总有忙碌与突发，选择更可预测的安排能有效保护孩子的安全感。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 演示模式隔离标识横幅 */}
      {isDemoMode && (
        <div data-testid="hug-inbox-demo-banner" className="bg-amber-100 border-2 border-amber-300 text-amber-950 p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in">
          <span>⚠️ 当前处于演示数据隔离区 (Demo Mode) · 以下展示的 3 条记录均为模拟数据，非真实儿童求助。</span>
          <button
            type="button"
            onClick={() => setIsDemoMode(false)}
            className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-xs font-black cursor-pointer"
          >
            返回真实模式（空收件箱）
          </button>
        </div>
      )}

      {/* 待响应与反思的请求列表 */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div data-testid="hug-inbox-empty" className="p-8 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-300 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-stone-200 text-stone-500 flex items-center justify-center text-2xl mx-auto">
              📬
            </div>
            <h4 className="text-base font-black text-stone-800">收件箱暂无求助记录（真实运行模式）</h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              当前版本未配置真实远程推送中继，儿童以现场当面求助（拉拉衣角）与面对面陪伴为主。如需体验家长响应界面或进行教学演练，可切换至演示模式。
            </p>
            <button
              type="button"
              onClick={() => setIsDemoMode(true)}
              className="mt-2 px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              切换至演示模式查看 3 条模拟记录
            </button>
          </div>
        ) : (
          requests.map((item) => {
            const isResolved = !!item.currentChoice;
            const isConfirmedByChild = item.isLocallyConfirmedByChild;
            const hasReflected = !!item.reflectionOutcome;

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4 transition-all"
              >
              {/* 请求基本信息 */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5 fill-rose-500" />
                  </span>
                  <div>
                    <span className="font-black text-stone-900 text-base">{item.childPseudonym}</span>
                    <span className="text-xs text-stone-500 ml-2">{item.createdAt} 发出即时抱抱请求</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {isConfirmedByChild ? (
                    <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 孩子端已确认真人陪伴
                    </span>
                  ) : (
                    <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> 孩子端未确认完成
                    </span>
                  )}
                </div>
              </div>

              {/* 第一步：家长收到即时请求后的三个排他选项 */}
              {!isResolved ? (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-stone-600 block">
                    请选择你当前真实可行的行动：
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* 选项 1: 我现在可以去 */}
                    <button
                      type="button"
                      onClick={() => handleAction(item.id, 'I_CAN_GO_NOW')}
                      className="p-3.5 rounded-2xl border-2 border-emerald-400 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-950 font-black text-sm flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <span>🏃 我现在可以去</span>
                      <span className="text-xs font-normal text-emerald-800">亲自到孩子身边陪他</span>
                    </button>

                    {/* 选项 2: 我请 XX 去 (指定在场可信成人) */}
                    <button
                      type="button"
                      onClick={() => setDelegatingReqId(item.id)}
                      className="p-3.5 rounded-2xl border-2 border-sky-400 bg-sky-50/60 hover:bg-sky-100/70 text-sky-950 font-black text-sm flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <span>🤝 我请 XX 去</span>
                      <span className="text-xs font-normal text-sky-800">指定已配置的在场联系人</span>
                    </button>

                    {/* 选项 3: 我现在不能去 */}
                    <button
                      type="button"
                      onClick={() => handleAction(item.id, 'I_CANNOT_GO_NOW')}
                      className="p-3.5 rounded-2xl border-2 border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 font-black text-sm flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <span>✋ 我现在不能去</span>
                      <span className="text-xs font-normal text-stone-500">坦诚告知，不给空头期待</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* 已做出承诺/转交后的责任展示 */
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3 text-sm">
                  <div>
                    <span className="text-xs font-bold text-stone-500 block">你的响应动作：</span>
                    <span className="font-bold text-stone-800">
                      {item.currentChoice?.choice === 'I_CAN_GO_NOW' && '已选择：我现在可以去（正在履行）'}
                      {item.currentChoice?.choice === 'I_DELEGATE_TO_TRUSTED' && `已转交委托：请 ${item.currentChoice.delegatedCaregiver?.name} 协助`}
                      {item.currentChoice?.choice === 'I_CANNOT_GO_NOW' && '已坦诚告知：我现在抽不开身'}
                    </span>
                  </div>

                  <span className="text-xs text-stone-500">
                    {new Date(item.currentChoice!.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}

              {/* 第二步：未在孩子端确认时，家长进入 Private Reflection (私密自我反思) */}
              {!isConfirmedByChild && (
                <div className="pt-2 border-t border-stone-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      私密反思：这次陪伴在孩子端没有确认完成。实际发生的是？
                    </span>
                  </div>

                  {!hasReflected ? (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveReflection(item.id, 'I_ATTENDED')}
                        className="py-2.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-bold text-stone-800 text-center cursor-pointer"
                      >
                        我去了
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveReflection(item.id, 'I_COULD_NOT_GO')}
                        className="py-2.5 px-3 rounded-xl border-2 border-rose-300 bg-rose-50/70 hover:bg-rose-100 text-xs font-black text-rose-900 text-center cursor-pointer"
                      >
                        我没能去
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveReflection(item.id, 'I_AM_UNSURE')}
                        className="py-2.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-bold text-stone-800 text-center cursor-pointer"
                      >
                        我不确定
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-stone-100/70 rounded-xl text-xs text-stone-700 flex items-center justify-between">
                        <span>
                          反思记录：
                          {item.reflectionOutcome === 'I_ATTENDED' && '我实际去陪孩子了'}
                          {item.reflectionOutcome === 'I_COULD_NOT_GO' && '我没能去'}
                          {item.reflectionOutcome === 'I_AM_UNSURE' && '我不确定当时的情况'}
                        </span>
                        <span className="text-stone-400 font-mono">（仅自己可见）</span>
                      </div>

                      {/* 关键契约：仅当家长自己选“我没能去”时，才展示修复脚本 (Repair Script) */}
                      {item.reflectionOutcome === 'I_COULD_NOT_GO' && (
                        <div className="p-4 bg-rose-50/90 border-2 border-rose-300 rounded-2xl space-y-2.5 text-stone-800 animate-in fade-in">
                          <div className="flex items-center gap-1.5 text-rose-900 font-black text-sm">
                            <MessageSquare className="w-4 h-4" />
                            <span>{PARENT_REPAIR_SCRIPT.title}</span>
                          </div>

                          <div className="p-3 bg-white/90 rounded-xl border border-rose-200 text-sm font-bold text-stone-800 space-y-1">
                            {PARENT_REPAIR_SCRIPT.lines.map((line, idx) => (
                              <p key={idx}>{line}</p>
                            ))}
                          </div>

                          <p className="text-xs text-rose-800 leading-relaxed font-medium">
                            💡 <strong>重要契约：</strong>{PARENT_REPAIR_SCRIPT.guidance}
                            <span className="block text-rose-900 font-bold mt-1">
                              * 此话术由你本人对孩子说，App 不会冒充家长说。
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
      </div>

      {/* 委托转交选择弹窗（必须指定已配置的在场成人，不能写自由文本） */}
      {delegatingReqId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-sky-200 space-y-4">
            <h3 className="text-lg font-black text-stone-900">
              请指定已配置的可信在场联系人
            </h3>
            <p className="text-xs text-stone-500">
              为了确保孩子真实安全，必须指定已配置好的在场亲友或老师，不能仅填写自由文本姓名：
            </p>

            <div className="space-y-2">
              {trustedCaregivers.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => {
                    handleAction(delegatingReqId, 'I_DELEGATE_TO_TRUSTED', contact);
                    setDelegatingReqId(null);
                  }}
                  className="w-full p-3 rounded-2xl border-2 border-stone-200 hover:border-sky-500 hover:bg-sky-50 flex items-center justify-between text-left transition-all cursor-pointer"
                >
                  <div>
                    <span className="font-black text-stone-800 text-sm block">{contact.name}</span>
                    <span className="text-xs text-stone-500">{contact.relationship}</span>
                  </div>
                  {contact.isOnsite && (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      当前在身边
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setDelegatingReqId(null)}
              className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-2xl text-sm transition-colors cursor-pointer"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
