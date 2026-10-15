/**
 * 受控儿童多主题内容适配引擎 (Audited Content Theme Engine V2.0)
 * 认知目标：事实与猜测分离 (FACT_VS_INFERENCE, 结构ID: fact_vs_inference)
 * 
 * 核心契约：
 * 1. 结构同构性：无论选择画画、运动、小动物自然还是拼图主题，每个主题均包含至少 2 个独立案件，
 *    所有案件严格拥有相同的认知结构：3个客观事实 (FACT) + 1个主观猜想 (INFERENCE) + 1个永久未知 (UNKNOWN)；
 * 2. 严格人工审核与冻结：状态标为 AUDITED_FROZEN_V1，禁止运行时未经审核的 LLM 自由生成；
 * 3. 评测判定完全一致：分类箱和评测逻辑 100% 同构，不偏袒或惩罚任何兴趣；
 * 4. 情绪与安全边界一致：不责备错误、允许撤回、肯定“承认不知道”的勇气，支持发现新线索后修正判断。
 */

import { HotspotEvidence, SortingBasket, SortingBasketType } from '../games/types';
import { InterestActivityId } from './types';
import { StructureId } from '../transfer/types';

export type AuditedContentStatus = 'AUDITED_FROZEN_V1' | 'PENDING_HUMAN_REVIEW' | 'REJECTED';

export type HypothesisEvidenceRelation =
  | 'SUPPORTED_BY_EVIDENCE'
  | 'CONTRADICTED_BY_EVIDENCE'
  | 'INSUFFICIENT_EVIDENCE'
  | 'NOT_INVESTIGATED_YET';

export interface HypothesisEvaluationResult {
  readonly relation: HypothesisEvidenceRelation;
  readonly badgeLabel: string;
  readonly spokenFeedback: string;
  readonly relevantClueIds: ReadonlyArray<string>;
}

export interface DetectiveHypothesisOption {
  readonly id: string;
  readonly label: string;
  readonly isUnknownOption?: boolean;
  readonly isSupportedByEvidence?: boolean;
  readonly feedbackText: string;
  readonly supportingClueIds?: ReadonlyArray<string>;
  readonly contradictingClueIds?: ReadonlyArray<string>;
  readonly supportedFeedbackText?: string;
  readonly contradictedFeedbackText?: string;
  readonly insufficientEvidenceFeedbackText?: string;
}

export interface DetectiveInvestigationLead {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly targetHotspotIds: ReadonlyArray<string>;
  readonly discoverySpokenText: string;
}

export interface DetectiveNextActionChoice {
  readonly id: string;
  readonly label: string;
  readonly feedbackText: string;
  readonly isRecommended: boolean;
  readonly consequenceBenefit?: string;
  readonly consequenceTradeoff?: string;
  readonly worldChangeSummary?: string;
}

export interface ThemedDetectiveScenario {
  readonly id: string;
  readonly caseNumber?: 1 | 2;
  readonly caseBadge?: string;
  readonly structureId: StructureId;
  readonly themeId: InterestActivityId;
  readonly themeTitle: string;
  readonly sceneTitle: string;
  readonly auditStatus: AuditedContentStatus;
  readonly auditorSignOff: string;
  readonly frozenVersion: string;
  readonly sceneDescription: string;
  readonly spokenIntro: string;
  readonly missingItemLabel: string;
  readonly hotspots: ReadonlyArray<HotspotEvidence>;
  readonly sortingBaskets: ReadonlyArray<SortingBasket>;
  readonly initialHypotheses?: ReadonlyArray<DetectiveHypothesisOption>;
  readonly investigationLeads?: ReadonlyArray<DetectiveInvestigationLead>;
  readonly resolutionSummary?: string;
  readonly nextActionChoices?: ReadonlyArray<DetectiveNextActionChoice>;
}

const SHARED_SORTING_BASKETS: ReadonlyArray<SortingBasket> = [
  {
    id: 'EYES_OBSERVED',
    label: '眼睛看到的',
    subLabel: '客观事实 · 相机能拍到',
    expectedCategory: 'FACT',
    icon: '👀',
    colorBg: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
  },
  {
    id: 'MIND_GUESSED',
    label: '脑子想到的',
    subLabel: '猜想念头 · 脑海里的想法',
    expectedCategory: 'INFERENCE',
    icon: '💡',
    colorBg: 'bg-amber-50',
    borderColor: 'border-amber-300',
  },
  {
    id: 'STILL_UNKNOWN',
    label: '还不知道的',
    subLabel: '盲区秘密 · 还没有证据',
    expectedCategory: 'UNKNOWN',
    icon: '❓',
    colorBg: 'bg-sky-50',
    borderColor: 'border-sky-300',
  },
];

// ============================================================================
// 1. 画画主题 Case 1：《美术角绿色蜡笔去哪了》
// ============================================================================
const DRAWING_SCENARIO: ThemedDetectiveScenario = {
  id: 'scenario_detective_drawing_v1',
  caseNumber: 1,
  caseBadge: '案件一 · 绿色蜡笔之谜',
  structureId: StructureId.FACT_VS_INFERENCE,
  themeId: 'drawing',
  themeTitle: '画画与色彩',
  sceneTitle: '美术角蜡笔侦探',
  auditStatus: 'AUDITED_FROZEN_V1',
  auditorSignOff: 'ChildCognitiveSafetyCommittee-2026-03-A',
  frozenVersion: '1.0.0-frozen',
  sceneDescription: '美术课下课了，桌上的绿色蜡笔找不到了，大家一起找出客观事实！',
  spokenIntro: '欢迎来到美术角！桌上的绿色小蜡笔不见了，我们拿起小放大镜，看看地上和桌边有些什么。',
  missingItemLabel: '绿色蜡笔',
  hotspots: [
    {
      id: 'hs_easel',
      name: '画架小桌',
      xPercent: 28,
      yPercent: 38,
      radiusPercent: 12,
      foundDescription: '画架上画着一半的向日葵，桌角有绿色蜡笔划痕和碎屑。',
      spokenText: '画架桌角有几粒绿色的蜡笔碎屑，还有刚刚画完的向日葵。',
      category: 'FACT',
      observationPrompt: '桌角留着几粒绿色的蜡笔碎屑和刚画了一半的向日葵。',
      hint: '这是小眼睛清清楚楚拍到的。',
      icon: '🎨',
      interactionVerb: '查看画架桌角',
    },
    {
      id: 'hs_cat_tracks',
      name: '地板梅花印',
      xPercent: 48,
      yPercent: 76,
      radiusPercent: 14,
      foundDescription: '地板上有一串小猫咪的彩色梅花脚印，从桌子一直通向窗帘。',
      spokenText: '地板上有一串小猫踩了颜料的小脚印，一直通向窗帘后面。',
      category: 'FACT',
      observationPrompt: '木地板上有一串沾着颜料的小梅花脚印，通向窗帘那边。',
      hint: '这是真实踩在地板上的脚印。',
      icon: '🐾',
      interactionVerb: '追踪地板梅花印',
    },
    {
      id: 'hs_curtain',
      name: '飘动的窗帘底',
      xPercent: 82,
      yPercent: 58,
      radiusPercent: 13,
      foundDescription: '窗帘角下滚着一支绿色蜡笔，上面有被猫爪拨动玩耍的划痕。',
      spokenText: '在窗帘底下找到了一支绿色蜡笔！上面还有被小猫咪抓过的小划痕。',
      category: 'FACT',
      observationPrompt: '掀开窗帘布角，底下露出一截绿色的笔杆，上面有细细的猫爪划痕。',
      hint: '小蜡笔真的滚在窗帘底下了。',
      icon: '🖍️',
      interactionVerb: '掀开窗帘底',
      requiresObjectReveal: true,
      unrevealedPrompt: '窗帘角微微鼓起，再点一下亲手掀开窗帘看看！',
    },
    {
      id: 'hs_qiqi_thought',
      name: '奇奇的脑海念头',
      xPercent: 16,
      yPercent: 18,
      radiusPercent: 14,
      foundDescription: '“奇奇觉得皮皮刚才多看了蜡笔一眼，肯定是他偷偷装走了。”',
      spokenText: '奇奇心里想：“皮皮刚才多看了蜡笔一眼，肯定是他拿的！”',
      category: 'INFERENCE',
      observationPrompt: '奇奇冒出一个念头：“皮皮刚才看了一眼，肯定是他拿走的！”',
      hint: '这是奇奇脑子里猜的想法，眼睛可没有拍到皮皮拿蜡笔哦。',
      icon: '💭',
      interactionVerb: '听听奇奇的念头',
    },
    {
      id: 'hs_backpack',
      name: '皮皮的书包',
      xPercent: 68,
      yPercent: 30,
      radiusPercent: 12,
      foundDescription: '皮皮的书包拉链拉得紧紧的，外面什么也看不到，里面有没有蜡笔是不知道的。',
      spokenText: '皮皮的书包拉链拉得好好的，外面什么也看不见。里面有没有蜡笔，我们现在根本不知道。',
      category: 'UNKNOWN',
      observationPrompt: '椅子上的小书包拉链拉得严严实实，从外面看不到里面有什么。',
      hint: '拉链拉着，眼睛看不见里面，这是不知道的事情。',
      icon: '🎒',
      isPermanentUnknown: true,
      interactionVerb: '查看拉紧的书包',
    },
  ],
  sortingBaskets: SHARED_SORTING_BASKETS,
  initialHypotheses: [
    {
      id: 'hyp_peer_took',
      label: '肯定是皮皮偷偷拿走了',
      feedbackText: '这是我们着急时容易冒出的猜测，先记下来，一会儿看看证据支不支持它！',
      supportingClueIds: [],
      contradictingClueIds: ['hs_curtain'],
      contradictedFeedbackText: '我们找到了蜡笔，不过这条线索还没有证明皮皮拿过它。要不要再看看刚才发现了什么？',
      insufficientEvidenceFeedbackText: '奇奇虽然心里这样猜，但现场还没有任何证据证明皮皮拿过蜡笔哦。',
    },
    {
      id: 'hyp_unknown_yet',
      label: '现在证据还不够，我还不知道',
      isUnknownOption: true,
      feedbackText: '好清醒的小侦探！在没看清全部线索前，勇敢说“还不知道”是最科学的做法！',
      supportingClueIds: ['hs_backpack'],
      supportedFeedbackText: '保持诚实与谨慎！在证据拼齐之前，承认“还不知道”也是很棒的侦探品质。',
    },
    {
      id: 'hyp_rolled_away',
      label: '可能被小动物或什么东西碰滚走了',
      isSupportedByEvidence: true,
      feedbackText: '这是一个很有可能的假设，我们去找找地上有没有滚落或小动物的痕迹吧！',
      supportingClueIds: ['hs_cat_tracks', 'hs_curtain'],
      supportedFeedbackText: '证据完全吻合！地板上的彩色梅花印一路通向窗帘，掀开窗帘果然找到了带猫爪印的绿色蜡笔！',
      insufficientEvidenceFeedbackText: '这个方向很有希望！快顺着地板脚印或窗帘底下再找找关键物证吧！',
    },
  ],
  investigationLeads: [
    {
      id: 'lead_floor_tracks',
      label: '顺着地板上的脚印找',
      icon: '🐾',
      targetHotspotIds: ['hs_easel', 'hs_cat_tracks'],
      discoverySpokenText: '来看看画架桌角和地板上的脚印！请直接在场景中点一点闪光的目标物。',
    },
    {
      id: 'lead_check_curtain',
      label: '掀开窗帘底下看看',
      icon: '🪟',
      targetHotspotIds: ['hs_curtain'],
      discoverySpokenText: '窗帘角好像藏着什么！请去场景右侧亲手掀开窗帘看看吧。',
    },
    {
      id: 'lead_listen_and_bag',
      label: '听听大家的想法并看一眼书包',
      icon: '🎒',
      targetHotspotIds: ['hs_qiqi_thought', 'hs_backpack'],
      discoverySpokenText: '去场景里点一点奇奇的想法气泡和椅子上的书包，看看哪些是猜想、哪些还不知道。',
    },
  ],
  resolutionSummary: '原来是小花猫跳上画架桌玩耍时，把绿色蜡笔拨到了窗帘底下，并不是皮皮拿走的！',
  nextActionChoices: [
    {
      id: 'act_pickup_and_apologize',
      label: '捡起窗帘下的蜡笔，温和地告诉大家不是皮皮拿的',
      feedbackText: '太棒啦！用真实证据帮伙伴解开误会，大家都笑起来了！',
      isRecommended: true,
      consequenceBenefit: '收益：用真凭实据帮皮皮澄清了误会，大家开心地继续合画向日葵。',
      consequenceTradeoff: '代价：需要停下手里的画，花一点时间和大家一起擦掉地板上的猫爪颜料印。',
      worldChangeSummary: '奇奇主动向皮皮道了歉，绿色蜡笔给向日葵涂上了饱满的绿叶，美术角充满欢笑！',
    },
    {
      id: 'act_put_pen_box_rule',
      label: '把蜡笔收进稳固的高处笔筒，和大家约定用完立刻放回',
      feedbackText: '好办法！从源头保护画笔，下次小花猫再跳上桌也不怕蜡笔滚丢啦！',
      isRecommended: true,
      consequenceBenefit: '收益：建立了桌面收纳好习惯，以后蜡笔再也不会被小猫拨到地上。',
      consequenceTradeoff: '代价：每次换颜色都要伸手去高处笔筒拿，比随手放桌边稍微慢一点点。',
      worldChangeSummary: '画架桌中央摆上了稳稳的木笔筒，彩色蜡笔整整齐齐立在里面，小花猫只能在旁边好奇地看。',
    },
    {
      id: 'act_still_blame',
      label: '不看窗帘下的证据，还是大声怪皮皮',
      feedbackText: '如果只凭猜测责怪别人，好朋友会很委屈哦。我们试试用找到的事实说话吧！',
      isRecommended: false,
      consequenceBenefit: '收益：一时把心里的着急发泄了出来。',
      consequenceTradeoff: '代价：无视已经找到的窗帘蜡笔证据，会让无辜的皮皮很伤心，伙伴之间产生隔阂。',
      worldChangeSummary: '皮皮委屈地低下了头，果果轻轻举起窗帘下带猫爪痕的绿色蜡笔，邀请我们重新看看事实。',
    },
  ],
};

// ============================================================================
// 1B. 画画主题 Case 2：《画板夹层里的金色水彩笔》 (不同坐标与不同真相解释)
// ============================================================================
const DRAWING_SCENARIO_CASE_2: ThemedDetectiveScenario = {
  id: 'scenario_detective_drawing_v2',
  caseNumber: 2,
  caseBadge: '案件二 · 金色水彩笔之谜',
  structureId: StructureId.FACT_VS_INFERENCE,
  themeId: 'drawing',
  themeTitle: '画画与色彩',
  sceneTitle: '阳光窗台水彩笔侦探',
  auditStatus: 'AUDITED_FROZEN_V1',
  auditorSignOff: 'ChildCognitiveSafetyCommittee-2026-03-A2',
  frozenVersion: '1.0.0-frozen',
  sceneDescription: '画星星要用到的金色水彩笔不见了！这次没有小猫咪，会是怎么回事呢？',
  spokenIntro: '新案件来啦！画星星的金色水彩笔不见了，窗户正吹着微风，我们用放大镜找找新线索吧！',
  missingItemLabel: '金色水彩笔',
  hotspots: [
    {
      id: 'hs_draw2_window_wind',
      name: '敞开的通风小窗',
      xPercent: 78,
      yPercent: 22,
      radiusPercent: 12,
      foundDescription: '窗户开着一条缝，微风把窗台上的画纸吹得轻轻翘起。',
      spokenText: '窗户开着，一阵风吹进来，把桌上的画纸吹得哗啦啦响。',
      category: 'FACT',
      observationPrompt: '窗户开着一条缝，风吹得桌边的画纸轻轻晃动。',
      hint: '这是眼睛看到、身体能感受到的微风和开着的窗户。',
      icon: '🌬️',
    },
    {
      id: 'hs_draw2_cap_on_desk',
      name: '留着笔帽的桌面',
      xPercent: 35,
      yPercent: 52,
      radiusPercent: 13,
      foundDescription: '桌面上留着一枚金色的水彩笔帽，旁边有一道滚向画板槽的金色水迹。',
      spokenText: '桌面上还留着金色的笔帽，笔帽旁边有一点点金色的水彩印子通向画板托槽。',
      category: 'FACT',
      observationPrompt: '桌面上躺着一枚金色笔帽，旁边有一小道金色印子指向画板下方。',
      hint: '笔帽和水彩印子都是眼睛清清楚楚看到的事实。',
      icon: '🖊️',
    },
    {
      id: 'hs_draw2_board_slot',
      name: '倾斜画板的凹槽',
      xPercent: 58,
      yPercent: 78,
      radiusPercent: 14,
      foundDescription: '倾斜的木画板底部凹槽里，正好躺着那支没盖帽子的金色水彩笔！',
      spokenText: '找到了！金色水彩笔顺着斜斜的画板，滚进了底下的木头凹槽里！',
      category: 'FACT',
      observationPrompt: '木头画板底下的挡板凹槽里，卡着一支闪亮的金色水彩笔。',
      hint: '水彩笔真真实实地卡在画板凹槽里。',
      icon: '✨',
    },
    {
      id: 'hs_draw2_guess_bubble',
      name: '朵朵的焦急猜测',
      xPercent: 20,
      yPercent: 24,
      radiusPercent: 13,
      foundDescription: '“朵朵心想：同桌刚才借过橡皮，肯定顺手把我的金色笔也拿走了！”',
      spokenText: '朵朵着急地想：“同桌刚才借过橡皮，肯定顺手把我的金色水彩笔也拿走了！”',
      category: 'INFERENCE',
      observationPrompt: '朵朵脑海里想：“同桌刚才借了橡皮，肯定把我的金色笔也拿走了！”',
      hint: '这是朵朵着急时猜出来的念头，并没有看到同桌拿水彩笔。',
      icon: '💭',
    },
    {
      id: 'hs_draw2_closed_tin',
      name: '盖紧的铁皮颜料盒',
      xPercent: 84,
      yPercent: 68,
      radiusPercent: 12,
      foundDescription: '角落里不透明的铁皮颜料盒盖得严严实实，没打开前谁也不知道里面装了什么。',
      spokenText: '铁皮颜料盒盖得紧紧的，不打开的话，里面有什么我们现在还不知道。',
      category: 'UNKNOWN',
      observationPrompt: '不透明的铁皮颜料盒盖着盖子，从外面看不见里面装了什么。',
      hint: '盖子合着看不见，这是现在还不知道的事。',
      icon: '🧰',
      isPermanentUnknown: true,
    },
  ],
  sortingBaskets: SHARED_SORTING_BASKETS,
  initialHypotheses: [
    {
      id: 'hyp2_desk_mate',
      label: '肯定是同桌借橡皮时顺手拿走了',
      feedbackText: '这是着急时的猜测，我们先别急着下结论，去看看桌子和画板周围吧！',
    },
    {
      id: 'hyp2_unknown_yet',
      label: '现在线索不够，我还不知道',
      isUnknownOption: true,
      feedbackText: '非常棒！还没检查画板和桌面时，先保持“还不知道”最稳妥！',
    },
    {
      id: 'hyp2_rolled_slot',
      label: '可能被风吹动，顺着斜坡滚进角落了',
      isSupportedByEvidence: true,
      feedbackText: '好思路！圆圆的笔没盖帽子时很容易滚动，我们快去检查桌面和画板凹槽！',
    },
  ],
  investigationLeads: [
    {
      id: 'lead2_desk_and_wind',
      label: '观察窗台微风和桌面笔帽',
      icon: '🌬️',
      targetHotspotIds: ['hs_draw2_window_wind', 'hs_draw2_cap_on_desk'],
      discoverySpokenText: '我们看到窗户吹进微风，桌面上还留着金色笔帽和一道指向画板的水迹！',
    },
    {
      id: 'lead2_board_groove',
      label: '低头查看画板底下的凹槽',
      icon: '✨',
      targetHotspotIds: ['hs_draw2_board_slot'],
      discoverySpokenText: '往画板底下一看，金色水彩笔正安静地躺在木头凹槽里呢！',
    },
    {
      id: 'lead2_thought_and_tin',
      label: '听听朵朵的想法并查看铁皮盒',
      icon: '🧰',
      targetHotspotIds: ['hs_draw2_guess_bubble', 'hs_draw2_closed_tin'],
      discoverySpokenText: '我们听到了朵朵的猜测，还看到了盖紧的铁皮颜料盒。',
    },
  ],
  resolutionSummary: '原来水彩笔没盖笔帽，被窗台吹来的微风一吹，顺着倾斜画板滚进了底部凹槽，同桌根本没有拿！',
  nextActionChoices: [
    {
      id: 'act2_cap_pen_and_smile',
      label: '把金色水彩笔拿出来盖好笔帽，继续和同桌开心地画星星',
      feedbackText: '太棒了！不仅找回了水彩笔，还养成了用完盖好笔帽的好习惯！',
      isRecommended: true,
    },
    {
      id: 'act2_question_deskmate',
      label: '就算找到了笔，还是埋怨同桌',
      feedbackText: '证据已经证明笔是自己滚进凹槽的，冤枉同桌会让伙伴难过哦。',
      isRecommended: false,
    },
  ],
};

// ============================================================================
// 2. 运动主题 Case 1：《绿茵场足球侦探》
// ============================================================================
const SPORTS_SCENARIO: ThemedDetectiveScenario = {
  id: 'scenario_detective_sports_v1',
  caseNumber: 1,
  caseBadge: '案件一 · 绿茵场足球之谜',
  structureId: StructureId.FACT_VS_INFERENCE,
  themeId: 'sports',
  themeTitle: '足球与运动',
  sceneTitle: '绿茵场足球侦探',
  auditStatus: 'AUDITED_FROZEN_V1',
  auditorSignOff: 'ChildCognitiveSafetyCommittee-2026-03-B',
  frozenVersion: '1.0.0-frozen',
  sceneDescription: '足球练习结束后，黑白足球找不到了，我们一起来找球场上的线索！',
  spokenIntro: '欢迎来到绿茵场！训练用的小足球不知道滚去哪里了，我们拿起放大镜，仔细看看草坪边缘。',
  missingItemLabel: '训练足球',
  hotspots: [
    {
      id: 'hs_sports_grass_line',
      name: '草坪边线压痕',
      xPercent: 26,
      yPercent: 42,
      radiusPercent: 12,
      foundDescription: '白石灰边线旁的绿草有几处被重重压倒的滚痕，上面带着新鲜泥巴。',
      spokenText: '边线旁的青草被压平了一条细道，是足球刚才滚过去的真实印记。',
      category: 'FACT',
      observationPrompt: '边线旁的青草被压倒了一条细道，上面沾着新鲜泥巴。',
      hint: '这是草地上实实在在能拍到的压痕。',
      icon: '🌱',
    },
    {
      id: 'hs_sports_dog_paw',
      name: '球门后小狗爪印',
      xPercent: 52,
      yPercent: 78,
      radiusPercent: 14,
      foundDescription: '白色球网下方的湿泥地上，有一串欢快的小狗爪子印通向灌木丛。',
      spokenText: '球门后面有一串湿漉漉的小狗爪印，一直延伸到冬青树丛里。',
      category: 'FACT',
      observationPrompt: '球门后面的泥地上有一串小狗爪印，通向冬青灌木丛。',
      hint: '这是小狗踩在泥巴上的脚印，眼睛看得见。',
      icon: '🐾',
    },
    {
      id: 'hs_sports_bush',
      name: '冬青灌木丛底',
      xPercent: 84,
      yPercent: 54,
      radiusPercent: 13,
      foundDescription: '深绿色的冬青叶子底下，卡着那颗黑白足球，球皮上还粘着一片黄叶。',
      spokenText: '灌木丛底下露出了黑白足球！它卡在叶子堆里，上面还粘着落叶呢。',
      category: 'FACT',
      observationPrompt: '冬青灌木丛的枝叶底下，露出了半颗黑白相间的足球。',
      hint: '足球真实地卡在草丛底下，找到它了。',
      icon: '⚽',
    },
    {
      id: 'hs_sports_teammate_thought',
      name: '队友的脑海念头',
      xPercent: 18,
      yPercent: 20,
      radiusPercent: 14,
      foundDescription: '“队友觉得隔壁班刚才走得匆忙，肯定是他们把球踢走藏起来了。”',
      spokenText: '小刚心里想：“隔壁班刚才路过，肯定是他们故意把球藏起来了！”',
      category: 'INFERENCE',
      observationPrompt: '小刚脑海里冒出一句话：“肯定是隔壁班路过时把球藏起来了！”',
      hint: '这是脑海里的猜测，眼睛并没有看到隔壁班拿球哦。',
      icon: '💭',
    },
    {
      id: 'hs_sports_locker',
      name: '锁着的铁皮球柜',
      xPercent: 70,
      yPercent: 28,
      radiusPercent: 12,
      foundDescription: '球场边铁皮器材柜的大锁挂得好好的，里面还有没有球我们谁也看不见。',
      spokenText: '器材柜锁得紧紧的，谁也没钥匙开门。里面有没有备用球，我们现在根本不知道。',
      category: 'UNKNOWN',
      observationPrompt: '铁皮器材柜挂着大锁，从外面看不见里面有没有球。',
      hint: '柜子锁着看不见，不知道就是不知道。',
      icon: '🔒',
      isPermanentUnknown: true,
    },
  ],
  sortingBaskets: SHARED_SORTING_BASKETS,
  initialHypotheses: [
    {
      id: 'hyp_sports_other_class',
      label: '肯定是隔壁班把球藏起来了',
      feedbackText: '这是小刚心里的猜测，我们先别着急怪隔壁班，去草地上找找痕迹！',
    },
    {
      id: 'hyp_sports_unknown',
      label: '现在证据还不够，我还不知道',
      isUnknownOption: true,
      feedbackText: '很稳重！还没看清草地上的痕迹前，先说“还不知道”才是真侦探！',
    },
    {
      id: 'hyp_sports_rolled_bush',
      label: '球可能顺着草坡滚进灌木丛了',
      isSupportedByEvidence: true,
      feedbackText: '很有道理！圆圆的足球最容易顺着草地滚动，我们快去边线和灌木丛看看！',
    },
  ],
  investigationLeads: [
    {
      id: 'lead_sports_grass',
      label: '追踪草地压痕与球门泥地',
      icon: '🌱',
      targetHotspotIds: ['hs_sports_grass_line', 'hs_sports_dog_paw'],
      discoverySpokenText: '我们顺着草坪边线查看，发现了青草滚痕和一串小狗爪印！',
    },
    {
      id: 'lead_sports_bush',
      label: '拨开冬青灌木丛底部看看',
      icon: '⚽',
      targetHotspotIds: ['hs_sports_bush'],
      discoverySpokenText: '拨开灌木丛的树枝，黑白足球果然卡在叶子底下！',
    },
    {
      id: 'lead_sports_locker',
      label: '听听队友想法并查看上锁球柜',
      icon: '🔒',
      targetHotspotIds: ['hs_sports_teammate_thought', 'hs_sports_locker'],
      discoverySpokenText: '我们听到了小刚的猜测，也看到了锁得紧紧的铁皮柜。',
    },
  ],
  resolutionSummary: '原来足球滚过边线后，被路过的小狗拨进了冬青灌木丛底下，并不是隔壁班拿走的！',
  nextActionChoices: [
    {
      id: 'act_sports_share_truth',
      label: '把足球从灌木丛捡回来，告诉小刚不是隔壁班藏的',
      feedbackText: '太棒了！用事实解开了误会，两个班依然是友好的球场伙伴！',
      isRecommended: true,
    },
    {
      id: 'act_sports_argue',
      label: '跑去跟隔壁班吵架',
      feedbackText: '球已经在灌木丛里找到啦，凭空吵架会伤了和气哦。',
      isRecommended: false,
    },
  ],
};

// ============================================================================
// 2B. 运动主题 Case 2：《长椅下的黄色跳绳》
// ============================================================================
const SPORTS_SCENARIO_CASE_2: ThemedDetectiveScenario = {
  id: 'scenario_detective_sports_v2',
  caseNumber: 2,
  caseBadge: '案件二 · 黄色跳绳之谜',
  structureId: StructureId.FACT_VS_INFERENCE,
  themeId: 'sports',
  themeTitle: '足球与运动',
  sceneTitle: '操场长椅跳绳侦探',
  auditStatus: 'AUDITED_FROZEN_V1',
  auditorSignOff: 'ChildCognitiveSafetyCommittee-2026-03-B2',
  frozenVersion: '1.0.0-frozen',
  sceneDescription: '休息喝水回来后，放在长椅边上的黄色竹节跳绳不见了，去哪里了呢？',
  spokenIntro: '新案件！放在操场长椅上的黄色跳绳不见了，我们拿起放大镜，看看长椅底下和器材筐！',
  missingItemLabel: '黄色跳绳',
  hotspots: [
    {
      id: 'hs_sports2_water_bottle',
      name: '长椅上的水壶印',
      xPercent: 32,
      yPercent: 48,
      radiusPercent: 12,
      foundDescription: '长椅木板上有一圈水壶底留下的水渍，旁边垂着半截黄色的绳头。',
      spokenText: '长椅上留着水壶的水印，木板缝隙里还露出一小截黄色的绳头。',
      category: 'FACT',
      observationPrompt: '长椅木板缝隙间露出了一小截黄色的塑料竹节。',
      hint: '这是眼睛在长椅缝隙里亲眼看到的黄色绳头。',
      icon: '🪑',
    },
    {
      id: 'hs_sports2_basket_tag',
      name: '公用跳绳收纳筐',
      xPercent: 62,
      yPercent: 72,
      radiusPercent: 14,
      foundDescription: '长椅正下方的蓝色收纳筐里，整整齐齐盘着那根贴着星星贴纸的黄色跳绳。',
      spokenText: '长椅下面的蓝色收纳筐里，正好放着贴了星星贴纸的黄色跳绳！',
      category: 'FACT',
      observationPrompt: '长椅下方的蓝色收纳筐里，躺着贴有星星贴纸的黄色跳绳。',
      hint: '贴着星星贴纸的黄色跳绳真真实实地在收纳筐里。',
      icon: '🧺',
    },
    {
      id: 'hs_sports2_sweat_towel',
      name: '搭在椅背的毛巾',
      xPercent: 78,
      yPercent: 36,
      radiusPercent: 12,
      foundDescription: '小汗巾搭在长椅靠背上，刚才拿毛巾擦汗时不小心把跳绳扫进了下面的筐里。',
      spokenText: '椅背上搭着擦汗的小毛巾，位置正好在收纳筐正上方。',
      category: 'FACT',
      observationPrompt: '椅背上搭着一条小毛巾，垂下来的角正好挨着下面的收纳筐。',
      hint: '毛巾的位置是眼睛看得到的事实。',
      icon: '🧣',
    },
    {
      id: 'hs_sports2_guess',
      name: '乐乐的着急猜想',
      xPercent: 18,
      yPercent: 22,
      radiusPercent: 13,
      foundDescription: '“乐乐心里想：刚才小宇也在跳绳，肯定是他把我的跳绳换走了！”',
      spokenText: '乐乐心里猜：“刚才小宇也在练习，肯定是他把我的跳绳拿走了！”',
      category: 'INFERENCE',
      observationPrompt: '乐乐脑海里想：“刚才小宇在旁边跳绳，肯定是他拿走了我的跳绳！”',
      hint: '这是乐乐脑子里的猜测，并没有看到小宇拿跳绳。',
      icon: '💭',
    },
    {
      id: 'hs_sports2_zipped_gymbag',
      name: '拉紧的运动挎包',
      xPercent: 86,
      yPercent: 64,
      radiusPercent: 12,
      foundDescription: '跑道边放着一个拉紧拉链的深蓝色运动包，从外面完全看不见里面有什么。',
      spokenText: '跑道边的运动包拉链拉得严严实实，里面装了什么我们现在根本不知道。',
      category: 'UNKNOWN',
      observationPrompt: '跑道边的深蓝色运动包拉着拉链，外面看不出里面装了什么。',
      hint: '包拉着拉链看不见，这是现在还不知道的事情。',
      icon: '👜',
      isPermanentUnknown: true,
    },
  ],
  sortingBaskets: SHARED_SORTING_BASKETS,
  initialHypotheses: [
    {
      id: 'hyp_s2_peer',
      label: '肯定是小宇把我的跳绳拿走了',
      feedbackText: '这是着急时的猜测，我们先去长椅上下仔细找一找证据吧！',
    },
    {
      id: 'hyp_s2_unknown',
      label: '现在证据还不够，我还不知道',
      isUnknownOption: true,
      feedbackText: '好样的！没看清长椅周围前，先说“还不知道”最客观！',
    },
    {
      id: 'hyp_s2_fell_basket',
      label: '拿毛巾喝水时，可能不小心碰掉进长椅下了',
      isSupportedByEvidence: true,
      feedbackText: '很有可能哦！我们快检查一下长椅缝隙和下面的收纳筐！',
    },
  ],
  investigationLeads: [
    {
      id: 'lead_s2_bench',
      label: '检查长椅木板缝隙与椅背毛巾',
      icon: '🪑',
      targetHotspotIds: ['hs_sports2_water_bottle', 'hs_sports2_sweat_towel'],
      discoverySpokenText: '我们走近长椅，看到了椅背上的毛巾和木板缝里露出的黄色绳头！',
    },
    {
      id: 'lead_s2_basket',
      label: '低头查看长椅下方的蓝色收纳筐',
      icon: '🧺',
      targetHotspotIds: ['hs_sports2_basket_tag'],
      discoverySpokenText: '往长椅下面的收纳筐里一看，贴着星星贴纸的黄色跳绳就在里面！',
    },
    {
      id: 'lead_s2_thought_bag',
      label: '听听乐乐的猜想并看一眼运动包',
      icon: '👜',
      targetHotspotIds: ['hs_sports2_guess', 'hs_sports2_zipped_gymbag'],
      discoverySpokenText: '我们听到了乐乐心里的念头，也看到了拉紧拉链的运动包。',
    },
  ],
  resolutionSummary: '原来是拿毛巾擦汗时，不小心把黄色跳绳扫进了长椅正下方的蓝色收纳筐里，并不是小宇拿走的！',
  nextActionChoices: [
    {
      id: 'act_s2_invite_jump',
      label: '从收纳筐取出黄色跳绳，邀请小宇一起比赛跳绳',
      feedbackText: '真棒！找到了跳绳，还和好朋友一起开心地跳了起来！',
      isRecommended: true,
    },
    {
      id: 'act_s2_blame_xiaoyu',
      label: '不看收纳筐，非要打开别人的运动包',
      feedbackText: '未经允许翻别人的包既不礼貌也没有必要，长椅下的收纳筐里已经找到跳绳啦！',
      isRecommended: false,
    },
  ],
};

// ============================================================================
// 3. 动物与自然主题 Case 1：《森林落叶坚果侦探》（冲突线索与保留不确定性案件）
// ============================================================================
const NATURE_SCENARIO: ThemedDetectiveScenario = {
  id: 'scenario_detective_nature_v1',
  caseNumber: 1,
  caseBadge: '案件一 · 金黄橡果之谜',
  structureId: StructureId.FACT_VS_INFERENCE,
  themeId: 'nature',
  themeTitle: '自然与小动物',
  sceneTitle: '森林落叶坚果侦探',
  auditStatus: 'AUDITED_FROZEN_V1',
  auditorSignOff: 'ChildCognitiveSafetyCommittee-2026-03-C',
  frozenVersion: '1.0.0-frozen',
  sceneDescription: '大橡树底下，小松鼠收集的大橡果不见了！现场既有喜鹊羽毛又有分岔滚痕，真相究竟是什么？',
  spokenIntro: '欢迎来到大橡树下！小松鼠放在树洞旁的大橡果找不到了，我们拿起放大镜，去拨开落叶、看看树洞和地面痕迹吧。',
  missingItemLabel: '金黄橡果',
  hotspots: [
    {
      id: 'hs_nature_tree_moss',
      name: '树洞口的青苔与喜鹊羽',
      xPercent: 25,
      yPercent: 36,
      radiusPercent: 12,
      foundDescription: '树洞口的绿色青苔被刮乱了一小块，旁边落着一根黑白相间的喜鹊尾羽。',
      spokenText: '树洞口青苔被擦乱了一小块，旁边落着一根黑白喜鹊羽毛，说明喜鹊曾停在附近。',
      category: 'FACT',
      observationPrompt: '树洞口的青苔被刮乱了一小块，旁边落着一根黑白相间的喜鹊尾羽。',
      hint: '青苔刮痕和喜鹊羽毛是眼睛亲眼看到的事实，但还没有拍到喜鹊叼橡果哦。',
      icon: '🪶',
      interactionVerb: '查看树洞口羽毛',
    },
    {
      id: 'hs_nature_wind_trail',
      name: '分岔的滚落压痕',
      xPercent: 50,
      yPercent: 74,
      radiusPercent: 14,
      foundDescription: '湿润草地上的圆形滚落压痕在树根处分成了两条岔道：一条通向红枫叶堆，另一条通向黑树洞。',
      spokenText: '草地上的滚动压痕在树根旁分成了两条岔路，一条通向红枫叶堆，另一条通向深树洞！',
      category: 'FACT',
      observationPrompt: '草地上的滚动压痕在树根旁分成了两条岔路，分别指向红枫叶堆和深树洞。',
      hint: '这是草地上实实在在能拍到的两条分岔滚痕。',
      icon: '🍂',
      interactionVerb: '追踪分岔滚痕',
    },
    {
      id: 'hs_nature_leaf_pile',
      name: '红枫叶堆下的空帽壳',
      xPercent: 82,
      yPercent: 56,
      radiusPercent: 13,
      foundDescription: '拨开厚厚的红枫叶堆，下面只有半个空空的橡果小帽壳，金黄橡果并不在叶子堆里！',
      spokenText: '我们亲手拨开红枫叶堆，哇，底下只有半个空空的橡果帽壳，橡果肉并不在这里！',
      category: 'FACT',
      observationPrompt: '拨开厚厚的红枫叶堆后，下面只躺着半个空空的橡果小帽壳，没有橡果肉。',
      hint: '空帽壳是眼睛看到的事实，说明橡果没有停留在枫叶堆下。',
      icon: '🌰',
      interactionVerb: '拨开红枫叶堆',
      requiresObjectReveal: true,
      unrevealedPrompt: '厚厚的红枫叶堆鼓起一小块，再点一下亲手拨开红枫叶看看！',
    },
    {
      id: 'hs_nature_squirrel_thought',
      name: '小松鼠的脑海念头',
      xPercent: 18,
      yPercent: 18,
      radiusPercent: 14,
      foundDescription: '“小松鼠觉得刚才喜鹊在树顶上叫唤，肯定是喜鹊把整颗橡果吞进肚子里了。”',
      spokenText: '小松鼠心里急着想：“刚才喜鹊大叫了一声，肯定是它把我的橡果偷吃掉了！”',
      category: 'INFERENCE',
      observationPrompt: '小松鼠心里冒出一个念头：“刚才喜鹊叫了一声，肯定是它把橡果吞掉了！”',
      hint: '这是心里着急猜的念头，眼睛并没有拍到喜鹊吃橡果哦。',
      icon: '💭',
      interactionVerb: '听听小松鼠的猜想',
    },
    {
      id: 'hs_nature_deep_burrow',
      name: '黑乎乎的深树洞',
      xPercent: 68,
      yPercent: 30,
      radiusPercent: 12,
      foundDescription: '倒木深处有一个窄窄的黑树洞，光线照不进去、小手也够不着，橡果有没有滚进最里面谁也看不见。',
      spokenText: '倒木深处的老树洞黑咕隆咚的，眼睛完全看不清。橡果是不是滚进了最深处，我们现在谁也不知道。',
      category: 'UNKNOWN',
      observationPrompt: '倒木深处有个黑漆漆的小树洞，光线照不进去，看不清里面有什么。',
      hint: '洞里太暗看不见，橡果在不在里面属于还不知道的事。',
      icon: '🕳️',
      isPermanentUnknown: true,
      interactionVerb: '探看黑乎乎的深树洞',
    },
  ],
  sortingBaskets: SHARED_SORTING_BASKETS,
  initialHypotheses: [
    {
      id: 'hyp_nat_magpie',
      label: '肯定是树顶的喜鹊把橡果叼走了',
      feedbackText: '这是小松鼠着急时的猜想，虽然树洞口有羽毛，但还有别的地面痕迹，快去仔细调查吧！',
      supportingClueIds: [],
      contradictingClueIds: [],
      insufficientEvidenceFeedbackText: '树洞口虽然有一根喜鹊羽毛，但草地上还有通向深树洞的滚痕，单凭羽毛还不能肯定就是喜鹊叼走的哦。',
    },
    {
      id: 'hyp_nat_unknown',
      label: '现在证据还不够，我还不知道',
      isUnknownOption: true,
      isSupportedByEvidence: true,
      feedbackText: '真清醒！在线索指向不同方向、关键地方还看不清时，诚实说“还不知道”最棒！',
      supportingClueIds: ['hs_nature_leaf_pile', 'hs_nature_deep_burrow'],
      supportedFeedbackText: '太有科学精神了！枫叶堆下只有空帽壳，而喜鹊羽毛和通向黑树洞的滚痕让两种可能都存在，承认“现在证据还不够、还不知道”才是最准确的结论！',
      insufficientEvidenceFeedbackText: '很稳重！去拨开红枫叶堆、再看看深树洞，检验一下现有证据够不够下结论吧！',
    },
    {
      id: 'hyp_nat_wind',
      label: '橡果肯定就藏在红枫叶堆底下',
      isSupportedByEvidence: false,
      feedbackText: '地面有一条压痕通向红枫叶堆，我们去亲手拨开红枫叶堆验证一下吧！',
      supportingClueIds: [],
      contradictingClueIds: ['hs_nature_leaf_pile'],
      contradictedFeedbackText: '我们亲手拨开了红枫叶堆，下面只有半个空空的橡果帽壳，证据反驳了“藏在枫叶堆下”的猜想哦！',
      insufficientEvidenceFeedbackText: '虽然有一条滚痕指向红枫叶堆，但还没拨开叶子看之前，还不能确定橡果一定在里面哦。',
    },
  ],
  investigationLeads: [
    {
      id: 'lead_nat_trail',
      label: '查看树洞口羽毛与地面分岔滚痕',
      icon: '🍂',
      targetHotspotIds: ['hs_nature_tree_moss', 'hs_nature_wind_trail'],
      discoverySpokenText: '注意树洞口和草地！请在场景中点一点树洞口的羽毛和草地上的分岔滚痕。',
    },
    {
      id: 'lead_nat_pile',
      label: '亲手拨开厚厚的红枫叶堆',
      icon: '🌰',
      targetHotspotIds: ['hs_nature_leaf_pile'],
      discoverySpokenText: '去场景右下角点一点红枫叶堆，亲手拨开落叶看看底下到底有什么！',
    },
    {
      id: 'lead_nat_burrow',
      label: '听听小松鼠猜想并探看深树洞',
      icon: '🕳️',
      targetHotspotIds: ['hs_nature_squirrel_thought', 'hs_nature_deep_burrow'],
      discoverySpokenText: '点一点小松鼠的想法气泡和倒木深处的黑树洞，看看哪些是猜想、哪些看不见。',
    },
  ],
  resolutionSummary: '拨开红枫叶堆只发现了半个空帽壳；树洞口虽有喜鹊羽毛，但草地滚痕同时通向黑乎乎的深树洞。因为深洞内部看不见，喜鹊叼走和滚进深洞两种可能都存在，保留“现在证据还不够、还不知道”才是最科学的侦探结论！',
  nextActionChoices: [
    {
      id: 'act_nat_pickup_wave',
      label: '在深树洞口铺几粒平整细沙，放好备粮，明天再来观察有没有新脚印',
      feedbackText: '太有智慧啦！在证据不足时不冤枉喜鹊、也不冒险伸手进黑洞，而是用科学方法继续观察！',
      isRecommended: true,
      consequenceBenefit: '收益：既保护了小手安全、没有冤枉喜鹊邻居，又能收集明天的新脚印证据。',
      consequenceTradeoff: '代价：今晚暂时拿不回那颗失踪的橡果，需要耐心等待一天。',
      worldChangeSummary: '小松鼠在深树洞口铺好了平整的细沙观察带，朝树顶的喜鹊友好地挥挥手，安心等待明天的线索！',
    },
    {
      id: 'act_nat_bamboo_cover',
      label: '把空帽壳收进标本袋，给树洞储藏点加上松果小木盖',
      feedbackText: '好主意！不管是风吹滚落还是小鸟啄食，加上小木盖都能稳稳护住以后的橡果！',
      isRecommended: true,
      consequenceBenefit: '收益：给储藏点加装防护盖，以后收集的坚果再也不怕滚进深洞或被叼走。',
      consequenceTradeoff: '代价：每次放橡果都要先打开小木盖，比直接放树洞口多花一点点力气。',
      worldChangeSummary: '树洞储藏点装上了可爱的松果小木盖，小松鼠把半个空帽壳收进了侦探标本袋！',
    },
    {
      id: 'act_nat_shout_magpie',
      label: '证据还没查清，就一口咬定是喜鹊偷的并冲树顶大喊',
      feedbackText: '只有一根羽毛和半个空壳，还不能证明是喜鹊偷吃的哦，凭猜测指责邻居会让伙伴伤心。',
      isRecommended: false,
      consequenceBenefit: '收益：大喊一声把心里的着急发泄了出来。',
      consequenceTradeoff: '代价：万一橡果其实滚进了黑树洞，就会白白冤枉无辜的喜鹊，森林里少了友好的笑声。',
      worldChangeSummary: '喜鹊委屈地飞到了远处的树枝上，果果指了指深树洞旁那条分岔的滚痕，提醒我们证据还不够。',
    },
  ],
};

// ============================================================================
// 3B. 动物与自然主题 Case 2：《小溪边的彩色鹅卵石》
// ============================================================================
const NATURE_SCENARIO_CASE_2: ThemedDetectiveScenario = {
  id: 'scenario_detective_nature_v2',
  caseNumber: 2,
  caseBadge: '案件二 · 彩色鹅卵石之谜',
  structureId: StructureId.FACT_VS_INFERENCE,
  themeId: 'nature',
  themeTitle: '自然与小动物',
  sceneTitle: '溪流木桥鹅卵石侦探',
  auditStatus: 'AUDITED_FROZEN_V1',
  auditorSignOff: 'ChildCognitiveSafetyCommittee-2026-03-C2',
  frozenVersion: '1.0.0-frozen',
  sceneDescription: '放在溪边木板上的花纹鹅卵石不见了，我们一起去溪边找线索！',
  spokenIntro: '新案件！小海獭放在木板上的彩色鹅卵石不见了，我们拿起放大镜，看看木板缝和浅水滩吧！',
  missingItemLabel: '彩色鹅卵石',
  hotspots: [
    {
      id: 'hs_nat2_wet_board',
      name: '微斜的溪边木板',
      xPercent: 34,
      yPercent: 44,
      radiusPercent: 12,
      foundDescription: '溪边木板有一点向水边倾斜，木板上留着一道湿湿的滑痕。',
      spokenText: '溪边的木板湿漉漉的有点滑，上面有一道滑向浅水滩的印子。',
      category: 'FACT',
      observationPrompt: '微斜的木板上有一道湿漉漉的滑痕，指向木板边缘。',
      hint: '木板倾斜和湿滑痕是眼睛看到的事实。',
      icon: '🪵',
    },
    {
      id: 'hs_nat2_ripples',
      name: '浅水滩清澈水草',
      xPercent: 60,
      yPercent: 76,
      radiusPercent: 14,
      foundDescription: '木板正下方的清澈浅水滩里，绿水草旁闪着那颗带花纹的彩色鹅卵石。',
      spokenText: '清澈的浅水滩底下，彩色鹅卵石正安静地躺在水草旁边呢！',
      category: 'FACT',
      observationPrompt: '木板下方的清澈浅水里，躺着那颗带彩色条纹的鹅卵石。',
      hint: '水底的彩色鹅卵石是小眼睛清清楚楚看到的事实。',
      icon: '🪨',
    },
    {
      id: 'hs_nat2_frog_leaf',
      name: '荷叶上的水珠',
      xPercent: 78,
      yPercent: 38,
      radiusPercent: 12,
      foundDescription: '旁边的荷叶上溅着几滴刚扬起的水花，水波一晃把木板边打湿了。',
      spokenText: '旁边的荷叶上有刚溅起的小水珠，水波拍打着木板边。',
      category: 'FACT',
      observationPrompt: '木板旁的荷叶上挂着几颗刚溅上去的小水珠。',
      hint: '荷叶上的水珠是眼睛看到的客观事实。',
      icon: '🍀',
    },
    {
      id: 'hs_nat2_otter_guess',
      name: '小海獭的猜测念头',
      xPercent: 18,
      yPercent: 22,
      radiusPercent: 13,
      foundDescription: '“小海獭心想：刚才小乌龟游过去，肯定是小乌龟把石头背走了！”',
      spokenText: '小海獭心里猜：“刚才小乌龟慢吞吞游过去，肯定是它把石头背走了！”',
      category: 'INFERENCE',
      observationPrompt: '小海獭脑海里想：“刚才小乌龟游过去，肯定是它把鹅卵石背走了！”',
      hint: '这是脑海里的猜测，并没有看到小乌龟拿石头。',
      icon: '💭',
    },
    {
      id: 'hs_nat2_mud_shell',
      name: '合拢的大河蚌壳',
      xPercent: 86,
      yPercent: 66,
      radiusPercent: 12,
      foundDescription: '岸边泥沙上有一只紧紧合拢的大河蚌壳，外面根本看不见里面有什么。',
      spokenText: '大河蚌把壳合得紧紧的，里面有什么东西，我们现在谁也不知道。',
      category: 'UNKNOWN',
      observationPrompt: '泥沙上的大河蚌壳紧紧闭着，从外面看不见里面有什么。',
      hint: '蚌壳合着看不见，这是现在还不知道的事。',
      icon: '🐚',
      isPermanentUnknown: true,
    },
  ],
  sortingBaskets: SHARED_SORTING_BASKETS,
  initialHypotheses: [
    {
      id: 'hyp_n2_turtle',
      label: '肯定是小乌龟把鹅卵石背走了',
      feedbackText: '这是心里的猜测，我们先看看木板和浅水滩里有什么真实证据吧！',
    },
    {
      id: 'hyp_n2_unknown',
      label: '现在证据还不够，我还不知道',
      isUnknownOption: true,
      feedbackText: '好冷静的小侦探！没查看水滩前先说“还不知道”非常棒！',
    },
    {
      id: 'hyp_n2_slid_water',
      label: '鹅卵石可能从湿滑的木板上滑进浅水滩了',
      isSupportedByEvidence: true,
      feedbackText: '好观察！湿湿的木板很容易让圆石头滑落，我们快低头看看浅水滩！',
    },
  ],
  investigationLeads: [
    {
      id: 'lead_n2_board',
      label: '查看溪边湿木板与荷叶水珠',
      icon: '🪵',
      targetHotspotIds: ['hs_nat2_wet_board', 'hs_nat2_frog_leaf'],
      discoverySpokenText: '我们仔细看木板，发现木板湿滑微斜，上面有一道滑向水边的痕迹！',
    },
    {
      id: 'lead_n2_shallow',
      label: '探头查看木板下方的清澈浅水滩',
      icon: '🪨',
      targetHotspotIds: ['hs_nat2_ripples'],
      discoverySpokenText: '往清澈的浅水滩里一看，彩色鹅卵石正躺在水草旁边呢！',
    },
    {
      id: 'lead_n2_guess_shell',
      label: '听听小海獭想法并查看合拢的河蚌',
      icon: '🐚',
      targetHotspotIds: ['hs_nat2_otter_guess', 'hs_nat2_mud_shell'],
      discoverySpokenText: '我们听到了小海獭的猜测，也看到了紧紧闭着壳的大河蚌。',
    },
  ],
  resolutionSummary: '原来水花打湿了倾斜的木板，光滑的彩色鹅卵石自己滑进了木板下方的浅水滩里，并不是小乌龟背走的！',
  nextActionChoices: [
    {
      id: 'act_n2_pick_dry_spot',
      label: '从浅水滩捞起鹅卵石，放进干燥平稳的小石碗里保存',
      feedbackText: '既找回了心爱的鹅卵石，又学会了放在平稳干燥的地方，太聪明啦！',
      isRecommended: true,
    },
    {
      id: 'act_n2_chase_turtle',
      label: '去追小乌龟要石头',
      feedbackText: '石头已经在浅水滩里找到啦，不要冤枉无辜的小乌龟哦。',
      isRecommended: false,
    },
  ],
};

// ============================================================================
// 4. 拼图与机关主题 Case 1：《拼图桌彩虹碎片侦探》
// ============================================================================
const PUZZLE_SCENARIO: ThemedDetectiveScenario = {
  id: 'scenario_detective_puzzle_v1',
  caseNumber: 1,
  caseBadge: '案件一 · 彩虹拼图角之谜',
  structureId: StructureId.FACT_VS_INFERENCE,
  themeId: 'puzzle',
  themeTitle: '拼图与机关',
  sceneTitle: '拼图桌彩虹碎片侦探',
  auditStatus: 'AUDITED_FROZEN_V1',
  auditorSignOff: 'ChildCognitiveSafetyCommittee-2026-03-D',
  frozenVersion: '1.0.0-frozen',
  sceneDescription: '拼图只差最后一片彩虹角了，地毯和桌边有些什么秘密线索呢？',
  spokenIntro: '欢迎来到拼图小桌！彩虹拼图的最后一片找不到啦，我们拿起放大镜，在桌角和地毯上找一找。',
  missingItemLabel: '彩虹拼图角',
  hotspots: [
    {
      id: 'hs_puzzle_box_corner',
      name: '拼图盒边的纸屑',
      xPercent: 26,
      yPercent: 38,
      radiusPercent: 12,
      foundDescription: '拼图盒子边角有一圈撕开的透明胶带，旁边还掉了一小片彩色纸屑。',
      spokenText: '拼图盒子旁边有几粒彩色的小纸屑，盒子盖子被打开过。',
      category: 'FACT',
      observationPrompt: '拼图盒子旁边落着几粒彩色纸屑，盒盖敞开在桌角。',
      hint: '这是小眼睛拍到的纸屑与盒子。',
      icon: '📦',
    },
    {
      id: 'hs_puzzle_rug_edge',
      name: '地毯边翻折印',
      xPercent: 50,
      yPercent: 76,
      radiusPercent: 14,
      foundDescription: '客厅毛绒地毯的一角翻了起来，地板砖上留下了一条浅浅的压痕。',
      spokenText: '地毯的一只角被踢翻过来了，底下露出了干净的地板。',
      category: 'FACT',
      observationPrompt: '桌下的毛绒地毯有一只角翻折了过来，挨着沙发抱枕。',
      hint: '这是眼睛看到的翻起来的地毯角。',
      icon: '🧶',
    },
    {
      id: 'hs_puzzle_cushion_corner',
      name: '抱枕底下的拼图角',
      xPercent: 82,
      yPercent: 54,
      radiusPercent: 13,
      foundDescription: '小沙发抱枕底下露出了一块厚纸片，正是那枚红黄绿相间的彩虹拼图！',
      spokenText: '在软软的抱枕底下找到了！是最后那片彩虹拼图，它悄悄压在下面呢。',
      category: 'FACT',
      observationPrompt: '沙发软抱枕底下露出了一角红黄绿相间的厚纸片。',
      hint: '拼图真真实实地找到了。',
      icon: '🧩',
    },
    {
      id: 'hs_puzzle_child_thought',
      name: '明明的脑海念头',
      xPercent: 18,
      yPercent: 18,
      radiusPercent: 14,
      foundDescription: '“明明心里想：刚才弟弟在这跑过，肯定是他故意把拼图扔掉的。”',
      spokenText: '明明脑子里想：“刚才弟弟走过这里，肯定是他故意把拼图扔掉的！”',
      category: 'INFERENCE',
      observationPrompt: '明明脑海里冒出念头：“刚才弟弟路过，肯定是他故意扔掉的！”',
      hint: '这是脑子里猜的想法，眼睛并没有看到弟弟扔拼图。',
      icon: '💭',
    },
    {
      id: 'hs_puzzle_locked_drawer',
      name: '卡住的小抽屉',
      xPercent: 70,
      yPercent: 28,
      radiusPercent: 12,
      foundDescription: '木桌下的小抽屉被卡得紧紧的拉不开，里面还有没有别的东西谁也不知道。',
      spokenText: '桌子下的小抽屉卡住了，拉也拉不开。里面放着什么，我们现在根本不知道。',
      category: 'UNKNOWN',
      observationPrompt: '木桌下的小抽屉卡住了拉不开，从外面看不见里面有什么。',
      hint: '抽屉拉不开看不见，这是不知道的事情。',
      icon: '🗄️',
      isPermanentUnknown: true,
    },
  ],
  sortingBaskets: SHARED_SORTING_BASKETS,
  initialHypotheses: [
    {
      id: 'hyp_puz_brother',
      label: '肯定是弟弟路过时故意扔掉的',
      feedbackText: '这是明明着急时的猜测，我们先别急着怪弟弟，去桌边和沙发找找看！',
    },
    {
      id: 'hyp_puz_unknown',
      label: '现在证据还不够，我还不知道',
      isUnknownOption: true,
      feedbackText: '好清醒！在没仔细检查地毯和抱枕前，先说“还不知道”最明智！',
    },
    {
      id: 'hyp_puz_slid_cushion',
      label: '拼图块可能从桌边滑落到地毯或抱枕下了',
      isSupportedByEvidence: true,
      feedbackText: '好主意！轻巧的拼图块很容易从桌角滑下去，我们快去地毯和抱枕旁找找！',
    },
  ],
  investigationLeads: [
    {
      id: 'lead_puz_desk_rug',
      label: '检查拼图盒边与桌下翻折的地毯',
      icon: '🧶',
      targetHotspotIds: ['hs_puzzle_box_corner', 'hs_puzzle_rug_edge'],
      discoverySpokenText: '我们检查了桌角的拼图盒，还发现了桌下翻折起来的地毯角！',
    },
    {
      id: 'lead_puz_cushion',
      label: '抬起沙发边的小抱枕看看',
      icon: '🧩',
      targetHotspotIds: ['hs_puzzle_cushion_corner'],
      discoverySpokenText: '轻轻抬起小抱枕，哇，最后一片彩虹拼图角正压在下面呢！',
    },
    {
      id: 'lead_puz_thought_drawer',
      label: '听听明明的想法并看一眼卡住的抽屉',
      icon: '🗄️',
      targetHotspotIds: ['hs_puzzle_child_thought', 'hs_puzzle_locked_drawer'],
      discoverySpokenText: '我们听到了明明的猜想，也看到了拉不开的木桌小抽屉。',
    },
  ],
  resolutionSummary: '原来打开拼图盒时，最后一片彩虹拼图从桌边滑落，正好藏进了沙发抱枕底下，并不是弟弟扔掉的！',
  nextActionChoices: [
    {
      id: 'act_puz_finish_together',
      label: '拿出抱枕下的彩虹拼图角，邀请弟弟一起拼上最后一块',
      feedbackText: '太棒啦！完整的彩虹拼图拼好啦，兄弟俩一起欢呼起来！',
      isRecommended: true,
    },
    {
      id: 'act_puz_scold_brother',
      label: '就算找到了拼图，还是冲弟弟发脾气',
      feedbackText: '拼图是自己滑到抱枕底下的，对无辜的弟弟发脾气会让大家都不开心哦。',
      isRecommended: false,
    },
  ],
};

// ============================================================================
// 4B. 拼图与机关主题 Case 2：《积木盒夹层里的红色齿轮》
// ============================================================================
const PUZZLE_SCENARIO_CASE_2: ThemedDetectiveScenario = {
  id: 'scenario_detective_puzzle_v2',
  caseNumber: 2,
  caseBadge: '案件二 · 红色小齿轮之谜',
  structureId: StructureId.FACT_VS_INFERENCE,
  themeId: 'puzzle',
  themeTitle: '拼图与机关',
  sceneTitle: '机关工坊齿轮侦探',
  auditStatus: 'AUDITED_FROZEN_V1',
  auditorSignOff: 'ChildCognitiveSafetyCommittee-2026-03-D2',
  frozenVersion: '1.0.0-frozen',
  sceneDescription: '风车积木只差最关键的红色小齿轮就能转起来了，齿轮藏在哪里呢？',
  spokenIntro: '新案件来啦！让风车转起来的红色小齿轮找不到啦，我们拿起放大镜，检查一下说明书和收纳托盘吧！',
  missingItemLabel: '红色小齿轮',
  hotspots: [
    {
      id: 'hs_puz2_manual_fold',
      name: '厚厚的折页说明书',
      xPercent: 34,
      yPercent: 46,
      radiusPercent: 13,
      foundDescription: '大张的彩色说明书对折在桌面上，中间高高鼓起了一个圆圆的小包。',
      spokenText: '桌面上的折页说明书中间鼓鼓的，好像夹着一个圆圆的小零件。',
      category: 'FACT',
      observationPrompt: '对折的彩色说明书中间鼓起了一个圆圆的小包。',
      hint: '说明书鼓起的小包是眼睛清清楚楚看到的事实。',
      icon: '📘',
    },
    {
      id: 'hs_puz2_red_gear',
      name: '说明书夹层里的齿轮',
      xPercent: 56,
      yPercent: 74,
      radiusPercent: 14,
      foundDescription: '翻开说明书折页，那枚带锯齿的红色小齿轮正夹在图纸正中央！',
      spokenText: '翻开说明书一看，找到了！红色小齿轮正好夹在折页中间呢！',
      category: 'FACT',
      observationPrompt: '翻开的说明书折页里，躺着那枚带锯齿的红色小齿轮。',
      hint: '红色小齿轮真真实实地夹在说明书里。',
      icon: '⚙️',
    },
    {
      id: 'hs_puz2_sorted_tray',
      name: '分格零件托盘',
      xPercent: 78,
      yPercent: 38,
      radiusPercent: 12,
      foundDescription: '透明塑料分格托盘里摆着蓝色和黄色齿轮，红色格子空着，刚才是压在说明书下面的。',
      spokenText: '透明托盘就放在说明书旁边，刚才翻图纸时把红色齿轮带进折页里了。',
      category: 'FACT',
      observationPrompt: '透明分格托盘紧挨着说明书，里面整齐摆着蓝色和黄色齿轮。',
      hint: '透明托盘里的零件是眼睛直接看到的事实。',
      icon: '🍱',
    },
    {
      id: 'hs_puz2_guess',
      name: '小哲的怀疑念头',
      xPercent: 18,
      yPercent: 22,
      radiusPercent: 13,
      foundDescription: '“小哲心里想：肯定是玩具厂装盒子的时候漏掉了红色齿轮！”',
      spokenText: '小哲叹气想：“肯定是玩具厂粗心，根本没把红色齿轮放进盒子里！”',
      category: 'INFERENCE',
      observationPrompt: '小哲脑海里想：“肯定是玩具厂忘了装红色齿轮，怎么找都没用！”',
      hint: '这是小哲没找到前脑子里的猜测，不是已经证实的事实。',
      icon: '💭',
    },
    {
      id: 'hs_puz2_opaque_jar',
      name: '不透明的铁皮储蓄罐',
      xPercent: 86,
      yPercent: 66,
      radiusPercent: 12,
      foundDescription: '书架角放着一个封口的不透明铁皮罐，外面根本看不见里面装了什么。',
      spokenText: '书架角的不透明铁皮罐封着口，里面有什么我们现在根本不知道。',
      category: 'UNKNOWN',
      observationPrompt: '角落里的不透明铁皮罐封着盖子，从外面看不见里面有什么。',
      hint: '铁皮罐不透明看不见，这是现在还不知道的事情。',
      icon: '🏺',
      isPermanentUnknown: true,
    },
  ],
  sortingBaskets: SHARED_SORTING_BASKETS,
  initialHypotheses: [
    {
      id: 'hyp_p2_factory',
      label: '肯定是盒子里本来就没有，别找了',
      feedbackText: '这是灰心时的猜测，如果直接放弃就装不好风车啦，我们先找找桌面证据吧！',
    },
    {
      id: 'hyp_p2_unknown',
      label: '现在证据还不够，我还不知道',
      isUnknownOption: true,
      feedbackText: '很沉稳！还没翻看桌面上的说明书和托盘前，先说“还不知道”最科学！',
    },
    {
      id: 'hyp_p2_under_paper',
      label: '可能被大张的图纸或说明书盖住了',
      isSupportedByEvidence: true,
      feedbackText: '超级敏锐！桌面上铺着大张折页说明书，小零件最容易夹在里面啦！',
    },
  ],
  investigationLeads: [
    {
      id: 'lead_p2_manual_tray',
      label: '查看桌面分格托盘与鼓起的说明书',
      icon: '📘',
      targetHotspotIds: ['hs_puz2_manual_fold', 'hs_puz2_sorted_tray'],
      discoverySpokenText: '我们看到透明托盘紧挨着说明书，而折页说明书中间鼓起了一个小圆包！',
    },
    {
      id: 'lead_p2_open_manual',
      label: '轻轻翻开折页说明书夹层',
      icon: '⚙️',
      targetHotspotIds: ['hs_puz2_red_gear'],
      discoverySpokenText: '翻开说明书折页，红色小齿轮果然夹在图纸正中央！',
    },
    {
      id: 'lead_p2_thought_jar',
      label: '听听小哲的念头并查看不透明铁罐',
      icon: '🏺',
      targetHotspotIds: ['hs_puz2_guess', 'hs_puz2_opaque_jar'],
      discoverySpokenText: '我们听到了小哲的猜测，也看到了看不清内部的不透明铁罐。',
    },
  ],
  resolutionSummary: '原来翻看大张说明书时，红色小齿轮恰好滑进了折页夹层里，幸好我们没有轻言放弃！',
  nextActionChoices: [
    {
      id: 'act_p2_install_gear',
      label: '把红色小齿轮装上风车轴，轻轻一拨让大风车转起来',
      feedbackText: '呼呼呼！红色小齿轮带动大风车欢快地转起来啦，认真找证据真有成就感！',
      isRecommended: true,
    },
    {
      id: 'act_p2_give_up',
      label: '把积木推到一边不玩了',
      feedbackText: '齿轮已经在说明书夹层里找到啦，装上去就能看到风车转动啰！',
      isRecommended: false,
    },
  ],
};

// 默认场景映射表（保持向后兼容，供既有测试直接读取 Case 1）
export const THEMED_SCENARIOS: Record<InterestActivityId, ThemedDetectiveScenario> = {
  drawing: DRAWING_SCENARIO,
  sports: SPORTS_SCENARIO,
  nature: NATURE_SCENARIO,
  puzzle: PUZZLE_SCENARIO,
};

// 多案件映射表（每个主题均配备 2 个独立案件、不同坐标、不同真相解释）
export const THEMED_SCENARIO_CASES: Record<InterestActivityId, ReadonlyArray<ThemedDetectiveScenario>> = {
  drawing: [DRAWING_SCENARIO, DRAWING_SCENARIO_CASE_2],
  sports: [SPORTS_SCENARIO, SPORTS_SCENARIO_CASE_2],
  nature: [NATURE_SCENARIO, NATURE_SCENARIO_CASE_2],
  puzzle: [PUZZLE_SCENARIO, PUZZLE_SCENARIO_CASE_2],
};

/**
 * 通用线索分类评测函数（跨所有主题 100% 同构）
 */
export function evaluateThemedCluePlacement(
  clueCategory: string,
  targetBasket: SortingBasketType
): { isMatch: boolean; spokenFeedback: string } {
  if (clueCategory === 'FACT') {
    if (targetBasket === 'EYES_OBSERVED') {
      return {
        isMatch: true,
        spokenFeedback: '找对啦！这是小眼睛和相机能拍到的真实事实。',
      };
    } else {
      return {
        isMatch: false,
        spokenFeedback: '再看一看，这是眼睛清清楚楚看到的证据哦，要不要试着放进“眼睛看到的”盒子里？',
      };
    }
  }

  if (clueCategory === 'INFERENCE') {
    if (targetBasket === 'MIND_GUESSED') {
      return {
        isMatch: true,
        spokenFeedback: '太棒了！这是小脑袋里的猜想和念头，可能对也可能不对。',
      };
    } else {
      return {
        isMatch: false,
        spokenFeedback: '温和提示：这是脑海里自己猜的念头，眼睛没有拍到客观证据哦，放进“脑子想到的”盒子里更合适呢。',
      };
    }
  }

  if (clueCategory === 'UNKNOWN') {
    if (targetBasket === 'STILL_UNKNOWN') {
      return {
        isMatch: true,
        spokenFeedback: '非常清醒！不知道就是不知道，承认还不知道也是很有力量的事！',
      };
    } else {
      return {
        isMatch: false,
        spokenFeedback: '外面拉着或锁着，我们谁也看不见里面，所以这是一件“还不知道”的事，不要凭空猜想哦。',
      };
    }
  }

  return {
    isMatch: false,
    spokenFeedback: '我们试着把卡片换个盒子摆摆看吧。',
  };
}

/**
 * 根据儿童偏好的兴趣获取已审核冻结的默认场景定义（Case 1）
 */
export function getThemedScenarioByInterest(interestId: InterestActivityId): ThemedDetectiveScenario {
  return THEMED_SCENARIOS[interestId] || THEMED_SCENARIOS.drawing;
}

/**
 * 获取某兴趣主题下的全部案件列表（至少 2 个不同案件）
 */
export function getThemedScenarioCasesByInterest(
  interestId: InterestActivityId
): ReadonlyArray<ThemedDetectiveScenario> {
  return THEMED_SCENARIO_CASES[interestId] || THEMED_SCENARIO_CASES.drawing;
}

/**
 * 获取某兴趣主题下指定序号的案件（支持循环切换）
 */
export function getThemedScenarioCase(
  interestId: InterestActivityId,
  caseIndex: number
): ThemedDetectiveScenario {
  const cases = getThemedScenarioCasesByInterest(interestId);
  const safeIndex = Math.abs(caseIndex) % cases.length;
  return cases[safeIndex] || cases[0];
}

/**
 * P0-02：根据当前已发现的现场线索，评估某条假设与证据之间的真实支撑关系
 * 区分：SUPPORTED_BY_EVIDENCE / CONTRADICTED_BY_EVIDENCE / INSUFFICIENT_EVIDENCE / NOT_INVESTIGATED_YET
 */
export function evaluateHypothesisAgainstEvidence(
  scenario: ThemedDetectiveScenario,
  hypothesisId: string,
  discoveredClueIds: ReadonlyArray<string>
): HypothesisEvaluationResult {
  const hyp = (scenario.initialHypotheses || []).find((h) => h.id === hypothesisId);
  const discoveredSet = new Set(discoveredClueIds);

  if (!hyp) {
    return {
      relation: 'NOT_INVESTIGATED_YET',
      badgeLabel: '尚未调查',
      spokenFeedback: '请先在场景中调查线索后再做判断。',
      relevantClueIds: [],
    };
  }

  if (discoveredSet.size === 0) {
    return {
      relation: 'NOT_INVESTIGATED_YET',
      badgeLabel: '尚未调查',
      spokenFeedback: hyp.isUnknownOption
        ? hyp.feedbackText
        : '我们还一条现场线索都没查看呢！先去场景里点一点物体找证据，再来检验这个猜想吧。',
      relevantClueIds: [],
    };
  }

  const factHotspots = scenario.hotspots.filter((h) => h.category === 'FACT');
  const decisiveFactId = factHotspots[2]?.id || factHotspots[factHotspots.length - 1]?.id;

  const contradictingIds =
    hyp.contradictingClueIds !== undefined
      ? hyp.contradictingClueIds
      : !hyp.isSupportedByEvidence && !hyp.isUnknownOption && decisiveFactId
        ? [decisiveFactId]
        : [];

  const matchedContradicting = contradictingIds.filter((id) => discoveredSet.has(id));
  if (matchedContradicting.length > 0) {
    return {
      relation: 'CONTRADICTED_BY_EVIDENCE',
      badgeLabel: '有证据反驳',
      spokenFeedback:
        hyp.contradictedFeedbackText ||
        `我们找到了关键物证，不过这条线索还没有证明「${hyp.label}」。要不要再看看刚才发现了什么？`,
      relevantClueIds: matchedContradicting,
    };
  }

  const supportingIds =
    hyp.supportingClueIds !== undefined
      ? hyp.supportingClueIds
      : hyp.isSupportedByEvidence
        ? factHotspots.slice(1).map((h) => h.id)
        : [];

  const matchedSupporting = supportingIds.filter((id) => discoveredSet.has(id));

  if (hyp.isUnknownOption) {
    // 针对线索冲突/保留不确定性的案件（如森林落叶坚果侦探），查验关键物证后“还不知道”本身就是受证据支持的科学结论
    if (hyp.isSupportedByEvidence && (matchedSupporting.length > 0 || discoveredSet.size >= 2)) {
      return {
        relation: 'SUPPORTED_BY_EVIDENCE',
        badgeLabel: '有证据支持',
        spokenFeedback:
          hyp.supportedFeedbackText ||
          '太有科学精神了！现有线索指向不同可能，承认“现在证据还不够、还不知道”才是最准确的结论！',
        relevantClueIds: matchedSupporting,
      };
    }

    // 在真相明确的案件中，如果已经翻出了决定性物证（如窗帘下的绿色蜡笔），提醒孩子结合新物证再看一看
    if (!hyp.isSupportedByEvidence && decisiveFactId && discoveredSet.has(decisiveFactId)) {
      return {
        relation: 'INSUFFICIENT_EVIDENCE',
        badgeLabel: '当前证据不足',
        spokenFeedback:
          '其实我们已经找到关键物证啦！再看看刚才在现场发现的事实，能不能更新一下我们的判断呢？',
        relevantClueIds: [decisiveFactId],
      };
    }

    return {
      relation: 'INSUFFICIENT_EVIDENCE',
      badgeLabel: '当前证据不足',
      spokenFeedback:
        hyp.supportedFeedbackText ||
        '目前关键物证还没拼齐，在证据不足时保持“还不知道”是非常诚实稳妥的做法！',
      relevantClueIds: matchedSupporting,
    };
  }

  if (hyp.isSupportedByEvidence) {
    const hasKeySupport =
      supportingIds.length > 0
        ? supportingIds.some((id) => discoveredSet.has(id)) &&
          (decisiveFactId ? discoveredSet.has(decisiveFactId) : true)
        : discoveredSet.size >= 2;

    if (hasKeySupport) {
      return {
        relation: 'SUPPORTED_BY_EVIDENCE',
        badgeLabel: '有证据支持',
        spokenFeedback:
          hyp.supportedFeedbackText ||
          `有理有据！现场找到的真实物证正好支持「${hyp.label}」！`,
        relevantClueIds: matchedSupporting,
      };
    }

    return {
      relation: 'INSUFFICIENT_EVIDENCE',
      badgeLabel: '当前证据不足',
      spokenFeedback:
        hyp.insufficientEvidenceFeedbackText ||
        '这个方向很有道理，不过关键物证还没找齐，再去场景里翻一翻、看一看吧！',
      relevantClueIds: matchedSupporting,
    };
  }

  return {
    relation: 'INSUFFICIENT_EVIDENCE',
    badgeLabel: '当前证据不足',
    spokenFeedback:
      hyp.insufficientEvidenceFeedbackText ||
      '目前找到的现场线索还不能证明这个想法哦，再去场景里找找其他物证吧！',
    relevantClueIds: [],
  };
}

/**
 * P0-03：根据儿童探索场景物体的先后顺序生成差异化伴随反馈
 */
export function getOrderAwareDiscoveryFeedback(
  scenario: ThemedDetectiveScenario,
  hotspot: HotspotEvidence,
  priorDiscoveredClueIds: ReadonlyArray<string>
): string {
  const priorSet = new Set(priorDiscoveredClueIds);
  const stepOrderNumber = priorSet.size + 1;

  // 案件 A（画画 Case 1）脚印与窗帘的顺序联动
  if (scenario.id === 'scenario_detective_drawing_v1') {
    if (hotspot.id === 'hs_curtain') {
      if (priorSet.has('hs_cat_tracks')) {
        return `第 ${stepOrderNumber} 步发现：顺着刚才的彩色猫爪印掀开窗帘，果然在窗帘底下找到了带抓痕的绿色蜡笔！脚印和蜡笔两条证据连起来啦！`;
      }
      return `第 ${stepOrderNumber} 步发现：你直接掀开窗帘找到了带抓痕的绿色蜡笔！它是怎么滚到这里来的呢？去地板和画架旁看看有没有痕迹吧！`;
    }
    if (hotspot.id === 'hs_cat_tracks') {
      if (priorSet.has('hs_curtain')) {
        return `第 ${stepOrderNumber} 步发现：原来地板上有一串通向窗帘的猫爪印！这正好解释了刚才为什么在窗帘下找到了绿色蜡笔！`;
      }
      return `第 ${stepOrderNumber} 步发现：木地板上有一串沾着颜料的猫爪梅花印，正一路通向右侧窗帘底下呢，快去掀开窗帘看看！`;
    }
  }

  // 案件 B（自然 Case 1）分岔滚痕、枫叶堆空壳与深树洞的顺序联动
  if (scenario.id === 'scenario_detective_nature_v1') {
    if (hotspot.id === 'hs_nature_leaf_pile') {
      if (priorSet.has('hs_nature_wind_trail')) {
        return `第 ${stepOrderNumber} 步发现：顺着刚才的分岔滚痕拨开红枫叶堆，底下竟然只有半个空帽壳！看来橡果有可能滚向了另一条岔路上的黑树洞！`;
      }
      return `第 ${stepOrderNumber} 步发现：亲手拨开红枫叶堆，底下只有半个空空的橡果帽壳，没有橡果肉！去看看草地滚痕和树洞口还有什么线索吧！`;
    }
    if (hotspot.id === 'hs_nature_deep_burrow') {
      if (priorSet.has('hs_nature_leaf_pile')) {
        return `第 ${stepOrderNumber} 步发现：枫叶堆里只有空帽壳，而这个深树洞里又黑漆漆看不见，所以橡果到底在不在洞里，现在真的还不知道！`;
      }
      return `第 ${stepOrderNumber} 步发现：倒木深处的树洞黑漆漆的看不清里面，再去拨开红枫叶堆看看橡果在不在那边吧！`;
    }
  }

  const baseText = hotspot.observationPrompt || hotspot.foundDescription;
  if (priorSet.size === 0) {
    return `第 1 个现场发现：${baseText} 再去点点场景里的其他物体，看看线索之间有什么关系！`;
  }
  return `第 ${stepOrderNumber} 个现场发现：${baseText}`;
}

