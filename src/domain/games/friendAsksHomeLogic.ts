/**
 * 《朋友问起我的家》多轮社交情境与边界表达领域引擎 (Sprint 2 & Sprint 3 深度升级)
 * 认知目标：自主表达、隐私边界、社会关系判断、多轮同伴应对与自我保护
 *
 * 核心原则：
 * 1. 覆盖五类真实同伴社交场景（朋友好奇询问、同学反复追问隐私、同伴误解家庭情况、多名同学起哄嘲笑、朋友愿意倾听理解）；
 * 2. 提供七类自主表达方式（直接回答、部分回答、询问对方、改变话题、说明自己的边界、暂停对话、寻找可靠成年人帮助）；
 * 3. Sprint 3 A1：三维社交表达组合器（说多少 × 语气 × 下一步行动）三个维度独立生效，绝不把“找大人/暂停/换话题”静默降级为普通边界说明；
 * 4. Sprint 3 A2：全量采用结构化 STORY_CHILD（小满的故事）与 OWN_EXPRESSION（我自己的表达）双轨文案，在未配置双家背景的中性模式下，绝不向孩子强加双家日程或特定接送假设；
 * 5. 拒绝回答、暂停对话、转换话题或寻求大人帮助始终是完全正当的自主选择，绝不判为失败。
 */

import {
  ResponseTarget,
  DisclosureDepth,
  PeerReactionOutcome,
} from './types';
import { FriendHomeFramingMode } from '../cognitive/productExperienceMetrics';

export type ExpressionMode =
  | 'DIRECT_ANSWER'      // 直接回答
  | 'PARTIAL_ANSWER'     // 部分回答
  | 'ASK_PEER'           // 询问对方
  | 'CHANGE_TOPIC'       // 改变话题
  | 'STATE_BOUNDARY'     // 说明自己的边界
  | 'PAUSE_CONVERSATION' // 暂停对话
  | 'SEEK_ADULT_HELP';   // 寻找可靠成年人帮助

export interface ExpressionModeMeta {
  readonly mode: ExpressionMode;
  readonly label: string;
  readonly shortTag: string;
  readonly badgeColor: string;
  readonly description: string;
}

export const EXPRESSION_MODE_META: Record<ExpressionMode, ExpressionModeMeta> = {
  DIRECT_ANSWER: {
    mode: 'DIRECT_ANSWER',
    label: '直接回答',
    shortTag: '坦诚说明',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    description: '在自己觉得安全舒服时，简单清楚说出客观事实。',
  },
  PARTIAL_ANSWER: {
    mode: 'PARTIAL_ANSWER',
    label: '部分回答',
    shortTag: '只说一点点',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    description: '只分享自己愿意说的那一部分，保留其他家庭细节。',
  },
  ASK_PEER: {
    mode: 'ASK_PEER',
    label: '询问对方',
    shortTag: '反问互动',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
    description: '反过来问问对方的想法或日常，把单向打听变成平等聊天。',
  },
  CHANGE_TOPIC: {
    mode: 'CHANGE_TOPIC',
    label: '改变话题',
    shortTag: '聊别的好玩事',
    badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
    description: '不想继续聊家庭话题时，自然地把注意力引向眼前的游戏。',
  },
  STATE_BOUNDARY: {
    mode: 'STATE_BOUNDARY',
    label: '说明自己的边界',
    shortTag: '温和坚定划界',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    description: '清楚告诉对方：“这是我们家的私事，我不想再聊这个啦。”',
  },
  PAUSE_CONVERSATION: {
    mode: 'PAUSE_CONVERSATION',
    label: '暂停对话',
    shortTag: '随时停下离开',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    description: '觉得不舒服或不想继续时，直接停下对话、去别处玩耍。',
  },
  SEEK_ADULT_HELP: {
    mode: 'SEEK_ADULT_HELP',
    label: '寻找可靠成年人帮助',
    shortTag: '找老师/家长支持',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    description: '走向身边的老师或放学告诉家人，让可靠的大人一起支持你。',
  },
};

export interface DialogueTurnOption {
  readonly id: string;
  readonly mode: ExpressionMode;
  readonly childSpokenText: string;
  /** Sprint 3 A2: 结构化中性个人表达文案（不含未配置的双家或特定接送人假设） */
  readonly childSpokenTextOwn?: string;
  readonly innerThoughtHint: string;
  readonly innerThoughtHintOwn?: string;
  readonly nextNodeId: string;
}

export type PeerMoodState =
  | 'CURIOUS'
  | 'PROBING'
  | 'CONFUSED'
  | 'MOCKING'
  | 'RESPECTFUL'
  | 'DISTRACTED_PLAY'
  | 'ADULT_SUPPORTED';

export interface DialogueTurnNode {
  readonly nodeId: string;
  readonly roundNumber: number;
  readonly speakerName: string;
  readonly speakerNameOwn?: string;
  readonly peerMood: PeerMoodState;
  readonly peerSpokenText: string;
  /** Sprint 3 A2: 结构化中性个人表达同伴台词（不含未配置的双家或特定父母假设） */
  readonly peerSpokenTextOwn?: string;
  readonly sceneActionNote: string;
  readonly sceneActionNoteOwn?: string;
  readonly cognitiveReflectionNote: string;
  readonly cognitiveReflectionNoteOwn?: string;
  readonly isTerminal: boolean;
  readonly isSafetyProtectionActive?: boolean;
  readonly options?: ReadonlyArray<DialogueTurnOption>;
}

export type SocialScenarioCategory =
  | 'CURIOUS_INQUIRY'        // 1. 朋友出于好奇询问
  | 'REPEATED_PROBING'       // 2. 同学反复追问隐私
  | 'PEER_MISUNDERSTANDING'  // 3. 同伴误解家庭情况
  | 'CROWD_BULLYING'         // 4. 多名同学起哄或嘲笑
  | 'SUPPORTIVE_LISTENING';  // 5. 朋友愿意倾听与理解

export interface FriendHomeScenario {
  readonly id: string;
  readonly category: SocialScenarioCategory;
  readonly categoryBadge: string;
  readonly title: string;
  readonly locationTag: string;
  readonly peerName: string;
  readonly peerAvatarType: 'xiaoming' | 'doudou' | 'lele' | 'crowd' | 'duoduo';
  readonly contextSummary: string;
  /** Sprint 3 A2: 结构化中性个人表达背景摘要 */
  readonly contextSummaryOwn: string;
  readonly initialNodeId: string;
  readonly nodes: Readonly<Record<string, DialogueTurnNode>>;
}

// =========================================================================
// Sprint 3 A1: 三维自主表达组合器（说多少 × 语气 × 下一步行动 独立生效）
// =========================================================================

export type ComposerAmount = 'DIRECT' | 'PARTIAL' | 'HOLD';
export type ComposerTone = 'GENTLE' | 'ASK_BACK' | 'FIRM';
export type ComposerTopic = 'PICKUP' | 'PLAY_TOPIC' | 'ADULT' | 'PAUSE';

const COMPOSER_AMOUNT_STORY: Record<ComposerAmount, string> = {
  DIRECT: '因为爸爸妈妈住在两个不同的家里，轮流来接我放学',
  PARTIAL: '今天家里已经安排好由妈妈来接我放学啦',
  HOLD: '这是我们家自己的接送安排，我今天不想多聊这个',
};

const COMPOSER_AMOUNT_OWN: Record<ComposerAmount, string> = {
  DIRECT: '因为我们家每天接送的安排不一样，今天家里已经约好谁来接我啦',
  PARTIAL: '家里大人们今天各自有安排，已经定好谁来接我啦',
  HOLD: '这是我自己的小秘密，我今天不想多说家里的私事',
};

const COMPOSER_TONE_BRIDGE: Record<ComposerTone, string> = {
  GENTLE: '，谢谢你关心我呀。',
  ASK_BACK: '，那今天是谁来接你放学、你最想先玩什么呢？',
  FIRM: '，请尊重我的想法，不要再追问啦。',
};

const COMPOSER_TOPIC_CLOSING_STORY: Record<ComposerTopic, string> = {
  PICKUP: '一会儿在校门口就能看到来接我的人啦！',
  PLAY_TOPIC: '你看校门口那只橘猫在晒太阳，我们快去聊好玩的游戏吧！',
  ADULT: '我现在要去牵妈妈和老师的手，请可靠的大人陪我一起说。',
  PAUSE: '我现在想先停下这个话题，去旁边安静待一会儿。',
};

const COMPOSER_TOPIC_CLOSING_OWN: Record<ComposerTopic, string> = {
  PICKUP: '一会儿在校门口就能看到来接我的家人啦！',
  PLAY_TOPIC: '你看校门口那只橘猫在晒太阳，我们快去聊好玩的游戏吧！',
  ADULT: '我现在要去牵老师和家人的手，请可靠的大人陪我一起说。',
  PAUSE: '我现在想先停下这个话题，去旁边安静待一会儿。',
};

/**
 * Sprint 3 A1: 合成三维表达选项
 * - “说多少 (amount)”、“语气 (tone)”、“下一步行动 (topic)”三个维度独立生效；
 * - 组合后的台词与三个维度完全一致；
 * - 找大人 (ADULT -> SEEK_ADULT_HELP)、暂停 (PAUSE -> PAUSE_CONVERSATION)、改变话题 (PLAY_TOPIC -> CHANGE_TOPIC) 真实触发对应分支，绝不静默降级为普通边界说明。
 */
export function composeScenario1TurnOption(
  amount: ComposerAmount,
  tone: ComposerTone,
  topic: ComposerTopic,
  roundNumber: number = 1
): DialogueTurnOption {
  const storySentence = `“${COMPOSER_AMOUNT_STORY[amount]}${COMPOSER_TONE_BRIDGE[tone]}${COMPOSER_TOPIC_CLOSING_STORY[topic]}”`;
  const ownSentence = `“${COMPOSER_AMOUNT_OWN[amount]}${COMPOSER_TONE_BRIDGE[tone]}${COMPOSER_TOPIC_CLOSING_OWN[topic]}”`;

  let mode: ExpressionMode;
  let nextNodeId: string;
  let innerThoughtHint: string;

  if (topic === 'ADULT') {
    mode = 'SEEK_ADULT_HELP';
    nextNodeId = 'round3_adult_comfort';
    innerThoughtHint = '已按你的选择执行：结合当前分享程度与语气，直接走向可靠大人寻求支持。';
  } else if (topic === 'PAUSE') {
    mode = 'PAUSE_CONVERSATION';
    nextNodeId = 'round3_paused_safely';
    innerThoughtHint = '已按你的选择执行：结合当前分享程度与语气，主动暂停对话保护自己的舒服空间。';
  } else if (topic === 'PLAY_TOPIC') {
    mode = 'CHANGE_TOPIC';
    nextNodeId = roundNumber === 1 ? 'round2_after_topic' : 'round3_topic_shifted';
    innerThoughtHint = '已按你的选择执行：结合当前分享程度与语气，主动把话题引向眼前的游戏。';
  } else {
    // topic === 'PICKUP'
    if (tone === 'ASK_BACK') {
      mode = 'ASK_PEER';
      nextNodeId = roundNumber === 1 ? 'round2_after_ask_peer' : 'round3_topic_shifted';
      innerThoughtHint = '已按你的选择执行：回应放学安排并反问同伴，让聊天平等自然流动。';
    } else if (amount === 'DIRECT') {
      mode = 'DIRECT_ANSWER';
      nextNodeId = roundNumber === 1 ? 'round2_after_direct' : 'round3_understood_happy';
      innerThoughtHint = '已按你的选择执行：坦诚说明放学接送安排。';
    } else if (amount === 'PARTIAL') {
      mode = 'PARTIAL_ANSWER';
      nextNodeId = roundNumber === 1 ? 'round2_after_partial' : 'round3_boundary_respected';
      innerThoughtHint = '已按你的选择执行：只分享今天愿意说的一点点接送安排。';
    } else {
      mode = 'STATE_BOUNDARY';
      nextNodeId = roundNumber === 1 ? 'round2_after_boundary' : 'round3_boundary_respected';
      innerThoughtHint = '已按你的选择执行：温和或坚定地划定家庭接送隐私边界。';
    }
  }

  return {
    id: `composed_${amount}_${tone}_${topic}_r${roundNumber}`,
    mode,
    childSpokenText: storySentence,
    childSpokenTextOwn: ownSentence,
    innerThoughtHint,
    innerThoughtHintOwn: innerThoughtHint,
    nextNodeId,
  };
}

/**
 * Sprint 3 A2: 结构化解析场景、节点、选项的 STORY_CHILD vs OWN_EXPRESSION 文案
 */
export function shouldUseNeutralOwnExpression(
  framingMode: FriendHomeFramingMode,
  hasTwoHomesContext: boolean
): boolean {
  return framingMode === 'OWN_EXPRESSION' && !hasTwoHomesContext;
}

export function resolveScenarioContextSummary(
  scenario: FriendHomeScenario,
  framingMode: FriendHomeFramingMode,
  hasTwoHomesContext: boolean
): string {
  const raw = shouldUseNeutralOwnExpression(framingMode, hasTwoHomesContext)
    ? scenario.contextSummaryOwn
    : scenario.contextSummary;
  if (framingMode === 'STORY_CHILD') {
    return `【小满的故事】${raw}`;
  }
  return raw;
}

export function resolveNodeFramedContent(
  node: DialogueTurnNode,
  framingMode: FriendHomeFramingMode,
  hasTwoHomesContext: boolean
): {
  speakerName: string;
  peerSpokenText: string;
  sceneActionNote: string;
  cognitiveReflectionNote: string;
} {
  if (shouldUseNeutralOwnExpression(framingMode, hasTwoHomesContext)) {
    return {
      speakerName: node.speakerNameOwn || node.speakerName,
      peerSpokenText: node.peerSpokenTextOwn || node.peerSpokenText,
      sceneActionNote: node.sceneActionNoteOwn || node.sceneActionNote,
      cognitiveReflectionNote: node.cognitiveReflectionNoteOwn || node.cognitiveReflectionNote,
    };
  }
  return {
    speakerName: node.speakerName,
    peerSpokenText: node.peerSpokenText,
    sceneActionNote: node.sceneActionNote,
    cognitiveReflectionNote: node.cognitiveReflectionNote,
  };
}

export function resolveOptionFramedText(
  option: DialogueTurnOption,
  framingMode: FriendHomeFramingMode,
  hasTwoHomesContext: boolean
): {
  childSpokenText: string;
  innerThoughtHint: string;
} {
  if (shouldUseNeutralOwnExpression(framingMode, hasTwoHomesContext)) {
    return {
      childSpokenText: option.childSpokenTextOwn || option.childSpokenText,
      innerThoughtHint: option.innerThoughtHintOwn || option.innerThoughtHint,
    };
  }
  return {
    childSpokenText: option.childSpokenText,
    innerThoughtHint: option.innerThoughtHint,
  };
}

export const FRIEND_HOME_SCENARIOS: ReadonlyArray<FriendHomeScenario> = [
  // =========================================================================
  // 场景一：朋友出于好奇询问（放学校门口 · 小明）
  // =========================================================================
  {
    id: 'scenario_curious_friend_pickup',
    category: 'CURIOUS_INQUIRY',
    categoryBadge: '情境 1 · 朋友好奇询问',
    title: '放学校门口的好奇提问',
    locationTag: '放学时间的幼儿园门口',
    peerName: '好朋友小明',
    peerAvatarType: 'xiaoming',
    contextSummary: '放学排队时，好朋友小明看到今天只有妈妈来接你，好奇地凑过来问。',
    contextSummaryOwn: '放学排队时，好朋友小明好奇地凑过来问你今天家里是谁来接你放学。',
    initialNodeId: 'round1_start',
    nodes: {
      round1_start: {
        nodeId: 'round1_start',
        roundNumber: 1,
        speakerName: '好朋友小明',
        peerMood: 'CURIOUS',
        peerSpokenText: '“咦，昨天是你爸爸来接你，今天怎么只有你妈妈呀？他们为什么不一起接你呢？”',
        peerSpokenTextOwn: '“咦，今天是谁来接你放学呀？你们家平时是怎么安排接送的呀？”',
        sceneActionNote: '小明背着黄色小书包，眨着眼睛好奇地看着你。',
        cognitiveReflectionNote: '好朋友可能只是随口好奇。怎么回答、说多少、或者不回答，都由你做主。',
        isTerminal: false,
        options: [
          {
            id: 'opt_c1_direct',
            mode: 'DIRECT_ANSWER',
            childSpokenText: '“因为爸爸妈妈住在两个不同的家里，轮流来接我放学呀。”',
            childSpokenTextOwn: '“因为我们家每天接送的安排不一样，今天家里已经约好谁来接我放学啦。”',
            innerThoughtHint: '直接说明客观安排，不觉得难为情。',
            nextNodeId: 'round2_after_direct',
          },
          {
            id: 'opt_c1_partial',
            mode: 'PARTIAL_ANSWER',
            childSpokenText: '“他们今天各自有事，所以妈妈来接我。”',
            childSpokenTextOwn: '“家里大人们今天各自有安排，已经定好谁来接我啦。”',
            innerThoughtHint: '只说今天已安排好接送，不用把所有家事都讲出来。',
            nextNodeId: 'round2_after_partial',
          },
          {
            id: 'opt_c1_ask_peer',
            mode: 'ASK_PEER',
            childSpokenText: '“今天是我妈妈接我呀！那今天是谁来接你放学呢？”',
            childSpokenTextOwn: '“今天我们家已经安排好接我的人啦！那今天是谁来接你放学呢？”',
            innerThoughtHint: '简短回应并反问小明，让聊天自然流动。',
            nextNodeId: 'round2_after_ask_peer',
          },
          {
            id: 'opt_c1_change_topic',
            mode: 'CHANGE_TOPIC',
            childSpokenText: '“你看校门口那只橘猫在晒太阳！我们快去看！”',
            childSpokenTextOwn: '“你看校门口那只橘猫在晒太阳！我们快去看！”',
            innerThoughtHint: '不想聊接送话题，主动把话题引向好玩的事物。',
            nextNodeId: 'round2_after_topic',
          },
          {
            id: 'opt_c1_boundary',
            mode: 'STATE_BOUNDARY',
            childSpokenText: '“这是我们家自己的安排，我不想聊这个话题啦。”',
            childSpokenTextOwn: '“这是我们家自己的安排，我不想聊这个话题啦。”',
            innerThoughtHint: '温和清楚地划出自己的隐私边界。',
            nextNodeId: 'round2_after_boundary',
          },
        ],
      },
      // 真实同伴反应：即使直接回答了，6岁同伴也未必立刻完全听懂，可能会继续追问细节！
      round2_after_direct: {
        nodeId: 'round2_after_direct',
        roundNumber: 2,
        speakerName: '好朋友小明',
        peerMood: 'PROBING',
        peerSpokenText: '“啊？住在两个家？那你的玩具和画笔放哪边呀？会不会弄丢呀？”',
        peerSpokenTextOwn: '“哦！那你放学回家后，最喜欢的玩具和画笔都放在哪里呀？会不会找不到呀？”',
        sceneActionNote: '小明还没有完全听懂，又冒出了新的好奇问题。',
        cognitiveReflectionNote: '即使我们说得很清楚，同伴有时还会继续追问。这时你可以继续分享，也可以随时喊停！',
        isTerminal: false,
        options: [
          {
            id: 'opt_c1_r2_share_more',
            mode: 'DIRECT_ANSWER',
            childSpokenText: '“两边都有我的小书架和画笔，爸爸妈妈都很爱我，不会丢的！”',
            childSpokenTextOwn: '“家里有我专门的小书架和画笔盒，家里人都很爱我，不会弄丢的！”',
            innerThoughtHint: '愿意继续分享家里的温暖小角落。',
            nextNodeId: 'round3_understood_happy',
          },
          {
            id: 'opt_c1_r2_boundary',
            mode: 'STATE_BOUNDARY',
            childSpokenText: '“玩具放哪里是我们家的秘密啦，我们聊今天玩的积木吧！”',
            childSpokenTextOwn: '“家里怎么放玩具是我自己的秘密啦，我们聊今天玩的积木吧！”',
            innerThoughtHint: '说到这里就够了，温和设定界限并转回游戏。',
            nextNodeId: 'round3_boundary_respected',
          },
          {
            id: 'opt_c1_r2_pause',
            mode: 'PAUSE_CONVERSATION',
            childSpokenText: '“我妈妈朝我招手啦，我先不聊了，明天见！”',
            childSpokenTextOwn: '“接我的家人朝我招手啦，我先不聊了，明天见！”',
            innerThoughtHint: '随时可以暂停对话，走向家人身边。',
            nextNodeId: 'round3_paused_safely',
          },
        ],
      },
      round2_after_partial: {
        nodeId: 'round2_after_partial',
        roundNumber: 2,
        speakerName: '好朋友小明',
        peerMood: 'CURIOUS',
        peerSpokenText: '“哦，这样呀！可是我好像从来没见过他们一起在门口接你耶？”',
        peerSpokenTextOwn: '“哦，这样呀！那你们家平时每天都是怎么分工接送的呀？”',
        sceneActionNote: '小明歪着脑袋想了想，还在顺着刚才的话继续问。',
        cognitiveReflectionNote: '只说一点点后，如果同伴还在追问，你可以直接表达边界，或者换个话题。',
        isTerminal: false,
        options: [
          {
            id: 'opt_c1_p2_boundary',
            mode: 'STATE_BOUNDARY',
            childSpokenText: '“因为每个家接送的办法不一样呀，我不想再聊谁来接我啦。”',
            childSpokenTextOwn: '“因为每个家庭安排的办法不一样呀，我不想再聊谁来接我啦。”',
            innerThoughtHint: '坚定说明不想继续被追问。',
            nextNodeId: 'round3_boundary_respected',
          },
          {
            id: 'opt_c1_p2_topic',
            mode: 'CHANGE_TOPIC',
            childSpokenText: '“明天幼儿园有滑梯比赛，你参加吗？”',
            childSpokenTextOwn: '“明天幼儿园有滑梯比赛，你参加吗？”',
            innerThoughtHint: '把注意力带到明天的活动上。',
            nextNodeId: 'round3_topic_shifted',
          },
          {
            id: 'opt_c1_p2_adult',
            mode: 'SEEK_ADULT_HELP',
            childSpokenText: '走到妈妈身边牵起妈妈的手：“妈妈，我们回家吧！”',
            childSpokenTextOwn: '走到接自己的家人身边牵起手：“我们回家吧！”',
            innerThoughtHint: '回到可靠的大人身边，给自己满满的安全感。',
            nextNodeId: 'round3_adult_comfort',
          },
        ],
      },
      round2_after_ask_peer: {
        nodeId: 'round2_after_ask_peer',
        roundNumber: 2,
        speakerName: '好朋友小明',
        peerMood: 'RESPECTFUL',
        peerSpokenText: '“今天是我奶奶骑小三轮车来接我！奶奶还带了烤红薯呢！”',
        peerSpokenTextOwn: '“今天是我奶奶骑小三轮车来接我！奶奶还带了烤红薯呢！”',
        sceneActionNote: '小明一下子开心地聊起了自己的奶奶，不再追问你的家事。',
        cognitiveReflectionNote: '反问对方也是一个聪明的社交办法！你想怎么结束这次愉快的聊天呢？',
        isTerminal: false,
        options: [
          {
            id: 'opt_c1_ap2_wave',
            mode: 'CHANGE_TOPIC',
            childSpokenText: '“哇，烤红薯好香呀！那我们明天在幼儿园见咯！”',
            childSpokenTextOwn: '“哇，烤红薯好香呀！那我们明天在幼儿园见咯！”',
            innerThoughtHint: '顺着对方的开心话题挥手告别。',
            nextNodeId: 'round3_topic_shifted',
          },
          {
            id: 'opt_c1_ap2_pause',
            mode: 'PAUSE_CONVERSATION',
            childSpokenText: '“我要去牵妈妈的手啦，拜拜！”',
            childSpokenTextOwn: '“我要去牵家人的手啦，拜拜！”',
            innerThoughtHint: '自然地结束对话去接家人。',
            nextNodeId: 'round3_paused_safely',
          },
        ],
      },
      round2_after_topic: {
        nodeId: 'round2_after_topic',
        roundNumber: 2,
        speakerName: '好朋友小明',
        peerMood: 'DISTRACTED_PLAY',
        peerSpokenText: '“哇，那只橘猫耳朵还动了一下！不过你刚才还没回答我呢，你爸妈是不是吵架啦？”',
        peerSpokenTextOwn: '“哇，那只橘猫耳朵还动了一下！不过你刚才还没告诉我你们家平时是怎么安排的呢？”',
        sceneActionNote: '小明看了一眼猫咪，竟然又把问题绕了回来！',
        cognitiveReflectionNote: '看，有时候转移话题一次，同伴还是会绕回来问。这时不必慌张，可以直接划出边界或停下对话！',
        isTerminal: false,
        options: [
          {
            id: 'opt_c1_t2_boundary',
            mode: 'STATE_BOUNDARY',
            childSpokenText: '“大人的事不用我们猜，这是我家的私事，我不想回答这个问题。”',
            childSpokenTextOwn: '“家里的事不用猜，这是我家的私事，我不想回答这个问题。”',
            innerThoughtHint: '清楚告诉对方这是家庭私事，不必回答。',
            nextNodeId: 'round3_boundary_respected',
          },
          {
            id: 'opt_c1_t2_pause',
            mode: 'PAUSE_CONVERSATION',
            childSpokenText: '“我不聊这个啦，我去找妈妈了！”',
            childSpokenTextOwn: '“我不聊这个啦，我去找接我的家人了！”',
            innerThoughtHint: '直接暂停对话，离开让你不舒服的追问。',
            nextNodeId: 'round3_paused_safely',
          },
          {
            id: 'opt_c1_t2_adult',
            mode: 'SEEK_ADULT_HELP',
            childSpokenText: '牵起妈妈的手说：“妈妈，小明一直问我家里大人的事，我不知道怎么说。”',
            childSpokenTextOwn: '牵起身边可靠大人的手说：“小明一直追问我家里的私事，我不知道怎么说。”',
            innerThoughtHint: '请信任的大人帮忙承接。',
            nextNodeId: 'round3_adult_comfort',
          },
        ],
      },
      round2_after_boundary: {
        nodeId: 'round2_after_boundary',
        roundNumber: 2,
        speakerName: '好朋友小明',
        peerMood: 'CONFUSED',
        peerSpokenText: '“哦……你不喜欢聊这个呀，我还以为可以问呢。”',
        peerSpokenTextOwn: '“哦……你不喜欢聊这个呀，我还以为可以问呢。”',
        sceneActionNote: '小明愣了一下，挠了挠头，停下了追问。',
        cognitiveReflectionNote: '当你清楚说出边界后，对方知道了你的界限。接下来你可以按自己的意愿继续玩或离开。',
        isTerminal: false,
        options: [
          {
            id: 'opt_c1_b2_play',
            mode: 'CHANGE_TOPIC',
            childSpokenText: '“嗯，家里的事我想自己留着。不过我们还是好朋友，明天一起搭积木吧！”',
            childSpokenTextOwn: '“嗯，家里的事我想自己留着。不过我们还是好朋友，明天一起搭积木吧！”',
            innerThoughtHint: '守住隐私边界的同时，依然可以约好朋友玩游戏。',
            nextNodeId: 'round3_boundary_respected',
          },
          {
            id: 'opt_c1_b2_pause',
            mode: 'PAUSE_CONVERSATION',
            childSpokenText: '“嗯，我先跟妈妈回家啦，明天见！”',
            childSpokenTextOwn: '“嗯，我先跟家人回家啦，明天见！”',
            innerThoughtHint: '平静地结束今天的对话。',
            nextNodeId: 'round3_paused_safely',
          },
        ],
      },
      round3_understood_happy: {
        nodeId: 'round3_understood_happy',
        roundNumber: 3,
        speakerName: '好朋友小明',
        peerMood: 'RESPECTFUL',
        peerSpokenText: '“原来两边都有属于你的小天地呀！我妈妈带了小饼干，分你一块，明天见！”',
        peerSpokenTextOwn: '“原来你有这么温暖的小天地呀！我带了香香的小饼干，分你一块，明天见！”',
        sceneActionNote: '小明笑着挥挥手，你们开心地在门口道别。',
        cognitiveReflectionNote: '你按照自己的意愿分享了客观事实，也感受到了朋友的善意。记住：分享多少永远由你决定！',
        isTerminal: true,
      },
      round3_boundary_respected: {
        nodeId: 'round3_boundary_respected',
        roundNumber: 3,
        speakerName: '好朋友小明',
        peerMood: 'RESPECTFUL',
        peerSpokenText: '“好吧，那我不问啦！明天我要带恐龙卡片来跟你一起玩！”',
        peerSpokenTextOwn: '“好吧，那我不问啦！明天我要带恐龙卡片来跟你一起玩！”',
        sceneActionNote: '小明尊重了你的边界，和你约好明天玩卡片。',
        cognitiveReflectionNote: '太棒了！说明自己的边界并不是不友好，而是让朋友知道怎么让你舒服。',
        isTerminal: true,
      },
      round3_topic_shifted: {
        nodeId: 'round3_topic_shifted',
        roundNumber: 3,
        speakerName: '好朋友小明',
        peerMood: 'DISTRACTED_PLAY',
        peerSpokenText: '“好呀好呀，明天我第一个去排大滑梯！拜拜！”',
        peerSpokenTextOwn: '“好呀好呀，明天我第一个去排大滑梯！拜拜！”',
        sceneActionNote: '小明蹦蹦跳跳地跟着奶奶走了，把刚才的问题忘在了脑后。',
        cognitiveReflectionNote: '通过转换话题或反问互动，你既保护了自己的私人空间，又轻松化解了尴尬！',
        isTerminal: true,
      },
      round3_paused_safely: {
        nodeId: 'round3_paused_safely',
        roundNumber: 3,
        speakerName: '果果伙伴的温暖提醒',
        peerMood: 'RESPECTFUL',
        peerSpokenText: '你平静地停下了对话，走到妈妈身边。哪怕小明还没完全明白也没关系，你的舒服最重要！',
        peerSpokenTextOwn: '你平静地停下了对话，走到接你的家人身边。哪怕小明还没完全明白也没关系，你的舒服最重要！',
        sceneActionNote: '妈妈笑眯眯地接过你的小书包，牵着你的手走在夕阳下。',
        sceneActionNoteOwn: '家人笑眯眯地接过你的小书包，牵着你的手走在夕阳下。',
        cognitiveReflectionNote: '暂停对话是完全正当的选择！你不需要满足每个人的好奇心。',
        isTerminal: true,
      },
      round3_adult_comfort: {
        nodeId: 'round3_adult_comfort',
        roundNumber: 3,
        speakerName: '妈妈的温暖支持',
        speakerNameOwn: '身边可靠大人的温暖支持',
        peerMood: 'ADULT_SUPPORTED',
        peerSpokenText: '妈妈蹲下来抱了抱你：“宝贝做得真好！家里的事属于我们自己，不想回答的时候，随时可以来找妈妈。”',
        peerSpokenTextOwn: '身边的大人温柔地抱了抱你：“宝贝做得真好！家里的事属于我们自己，不想回答的时候，随时可以来找大人帮忙。”',
        sceneActionNote: '妈妈温和地向小明挥手道别，带着你安心回家。',
        sceneActionNoteOwn: '大人温和地向小明挥手道别，带着你安心回家。',
        cognitiveReflectionNote: '寻求可靠成年人的帮助是非常有智慧的做法，大人们永远是你的坚强后盾！',
        isTerminal: true,
      },
    },
  },

  // =========================================================================
  // 场景二：同学反复追问隐私（美术角画画 · 同桌豆豆）
  // =========================================================================
  {
    id: 'scenario_probing_classmate_drawing',
    category: 'REPEATED_PROBING',
    categoryBadge: '情境 2 · 同学反复追问隐私',
    title: '美术课上的连环追问',
    locationTag: '幼儿园美术桌旁',
    peerName: '同桌豆豆',
    peerAvatarType: 'doudou',
    contextSummary: '自由画画时你画了两座漂亮的小房子，同桌豆豆凑过来不停追问你们家的隐私细节。',
    contextSummaryOwn: '自由画画时你正在专心画自己的作品，同桌豆豆凑过来不停追问你们家的隐私细节。',
    initialNodeId: 'p_round1',
    nodes: {
      p_round1: {
        nodeId: 'p_round1',
        roundNumber: 1,
        speakerName: '同桌豆豆',
        peerMood: 'PROBING',
        peerSpokenText: '“喂，别人都是画一座房子，你为什么画了两个家呀？你爸爸妈妈到底怎么回事呀？快告诉我嘛！”',
        peerSpokenTextOwn: '“喂，你画的房子里都有谁呀？你们家大人平时在家里都干什么呀？快把你们家的秘密告诉我嘛！”',
        sceneActionNote: '豆豆放下水彩笔，胳膊肘撑在你的画纸边，非要打破砂锅问到底。',
        cognitiveReflectionNote: '当同学追问隐私让你觉得有点挤、有点不自在时，你完全不需要按照他的要求交代所有细节。',
        isTerminal: false,
        options: [
          {
            id: 'opt_p1_partial',
            mode: 'PARTIAL_ANSWER',
            childSpokenText: '“因为我两边都可以住呀，左边有小猫，右边有秋千。”',
            childSpokenTextOwn: '“我只是画了我喜欢的小院子呀，院子里有小猫和秋千。”',
            innerThoughtHint: '只聊聊画里的景物，不谈家里的隐私。',
            nextNodeId: 'p_round2_still_probing',
          },
          {
            id: 'opt_p1_boundary',
            mode: 'STATE_BOUNDARY',
            childSpokenText: '“豆豆，这是我自己的画和我们家的事，我不想回答这么多问题。”',
            childSpokenTextOwn: '“豆豆，这是我自己的画和我们家的事，我不想回答这么多问题。”',
            innerThoughtHint: '一开始就清楚表达自己的边界。',
            nextNodeId: 'p_round2_after_boundary',
          },
          {
            id: 'opt_p1_ask_peer',
            mode: 'ASK_PEER',
            childSpokenText: '“我喜欢画两座房子呀！那你画纸上的大飞船准备涂什么颜色？”',
            childSpokenTextOwn: '“我喜欢这样画呀！那你画纸上的大飞船准备涂什么颜色？”',
            innerThoughtHint: '反问豆豆的画，把他的注意力拉回他自己的作品。',
            nextNodeId: 'p_round2_after_ask',
          },
          {
            id: 'opt_p1_pause',
            mode: 'PAUSE_CONVERSATION',
            childSpokenText: '拿起画板和蜡笔盒：“我去靠窗那张安静的桌子画啦。”',
            childSpokenTextOwn: '拿起画板和蜡笔盒：“我去靠窗那张安静的桌子画啦。”',
            innerThoughtHint: '直接暂停对话，换个让自己舒服的座位。',
            nextNodeId: 'p_round3_moved_away',
          },
        ],
      },
      // 真实同伴反应：即使部分回答或说明了边界，爱打听的同学可能还是不罢休！
      p_round2_still_probing: {
        nodeId: 'p_round2_still_probing',
        roundNumber: 2,
        speakerName: '同桌豆豆',
        peerMood: 'PROBING',
        peerSpokenText: '“那你星期几住左边、星期几住右边？你更喜欢爸爸还是更喜欢妈妈？快说快说！”',
        peerSpokenTextOwn: '“那你们家休息日都去哪里？你在家里最喜欢谁？快把你们家的事统统告诉我嘛！”',
        sceneActionNote: '豆豆不仅没有停下，反而问起了让你更不想回答的私人问题！',
        cognitiveReflectionNote: '真实生活中，有些同学不会因为你回答了一句就停下。这时坚定守住边界或暂停对话非常必要！',
        isTerminal: false,
        options: [
          {
            id: 'opt_p2_firm_boundary',
            mode: 'STATE_BOUNDARY',
            childSpokenText: '“爸爸妈妈我都喜欢！这是我的小秘密，请你不要再追问我啦！”',
            childSpokenTextOwn: '“家里人我都喜欢！这是我的小秘密，请你不要再追问我啦！”',
            innerThoughtHint: '坚定拒绝回答越界的私人问题。',
            nextNodeId: 'p_round3_boundary_held',
          },
          {
            id: 'opt_p2_pause_move',
            mode: 'PAUSE_CONVERSATION',
            childSpokenText: '“我不想跟你聊这个了，我要专心涂颜色了。”',
            childSpokenTextOwn: '“我不想跟你聊这个了，我要专心涂颜色了。”',
            innerThoughtHint: '停止回应追问，把注意力放回自己的画笔上。',
            nextNodeId: 'p_round3_moved_away',
          },
          {
            id: 'opt_p2_seek_teacher',
            mode: 'SEEK_ADULT_HELP',
            childSpokenText: '举手叫美术老师：“老师，豆豆一直追问我不想说的家事，吵得我没法画画了。”',
            childSpokenTextOwn: '举手叫美术老师：“老师，豆豆一直追问我不想说的家事，吵得我没法画画了。”',
            innerThoughtHint: '当同伴反复追问越界时，请老师帮忙提醒他。',
            nextNodeId: 'p_round3_teacher_helped',
          },
        ],
      },
      p_round2_after_boundary: {
        nodeId: 'p_round2_after_boundary',
        roundNumber: 2,
        speakerName: '同桌豆豆',
        peerMood: 'CONFUSED',
        peerSpokenText: '“哼，小气鬼，问一下都不行吗？我只是好奇嘛！”',
        peerSpokenTextOwn: '“哼，小气鬼，问一下都不行吗？我只是好奇嘛！”',
        sceneActionNote: '豆豆嘟着嘴小声嘀咕了一句，似乎有点不高兴你不告诉他。',
        cognitiveReflectionNote: '重要发现：即使你礼貌说出了边界，对方也未必会马上说“对不起”。不公开隐私不等于“小气”，你做得完全正确！',
        isTerminal: false,
        options: [
          {
            id: 'opt_p2b_stay_calm',
            mode: 'STATE_BOUNDARY',
            childSpokenText: '“每个人都有不想说的私事，这不是小气。我们各画各的吧！”',
            childSpokenTextOwn: '“每个人都有不想说的私事，这不是小气。我们各画各的吧！”',
            innerThoughtHint: '不被对方的嘀咕带偏，稳稳守住自己的界限。',
            nextNodeId: 'p_round3_boundary_held',
          },
          {
            id: 'opt_p2b_change_topic',
            mode: 'CHANGE_TOPIC',
            childSpokenText: '“秘密不能说，不过我的金色水彩笔可以借你画星星哦！”',
            childSpokenTextOwn: '“秘密不能说，不过我的金色水彩笔可以借你画星星哦！”',
            innerThoughtHint: '守住隐私底线的同时，用画笔转换气氛。',
            nextNodeId: 'p_round3_topic_resolved',
          },
          {
            id: 'opt_p2b_seek_teacher',
            mode: 'SEEK_ADULT_HELP',
            childSpokenText: '请旁边的老师过来：“老师，我已经说不想聊家里的事了，请帮我跟豆豆说一声。”',
            childSpokenTextOwn: '请旁边的老师过来：“老师，我已经说不想聊家里的事了，请帮我跟豆豆说一声。”',
            innerThoughtHint: '请老师温和引导同伴尊重隐私。',
            nextNodeId: 'p_round3_teacher_helped',
          },
        ],
      },
      p_round2_after_ask: {
        nodeId: 'p_round2_after_ask',
        roundNumber: 2,
        speakerName: '同桌豆豆',
        peerMood: 'DISTRACTED_PLAY',
        peerSpokenText: '“我的飞船当然要涂银色和火焰红啦！对了，你有蓝色蜡笔吗？”',
        peerSpokenTextOwn: '“我的飞船当然要涂银色和火焰红啦！对了，你有蓝色蜡笔吗？”',
        sceneActionNote: '豆豆立刻低头研究起自己的大飞船，开始找蓝色蜡笔。',
        cognitiveReflectionNote: '反问对方喜欢的画作，一下子就把连环追问变成了画画交流！',
        isTerminal: false,
        options: [
          {
            id: 'opt_p2a_share_crayon',
            mode: 'CHANGE_TOPIC',
            childSpokenText: '“给，这支天蓝色蜡笔借你涂太空舱，我们安安静静把画画完吧！”',
            childSpokenTextOwn: '“给，这支天蓝色蜡笔借你涂太空舱，我们安安静静把画画完吧！”',
            innerThoughtHint: '顺势进入安静愉快的画画时光。',
            nextNodeId: 'p_round3_topic_resolved',
          },
        ],
      },
      p_round3_boundary_held: {
        nodeId: 'p_round3_boundary_held',
        roundNumber: 3,
        speakerName: '你守住了舒服的边界',
        peerMood: 'RESPECTFUL',
        peerSpokenText: '豆豆见你态度坚定，耸了耸肩转回去涂自己的画了：“好吧好吧，不问就不问。”',
        peerSpokenTextOwn: '豆豆见你态度坚定，耸了耸肩转回去涂自己的画了：“好吧好吧，不问就不问。”',
        sceneActionNote: '你安心地用彩色蜡笔给两座小屋画上了温暖的太阳。',
        sceneActionNoteOwn: '你安心地用彩色蜡笔给自己的画添上了温暖的太阳。',
        cognitiveReflectionNote: '就算对方一开始嘀咕两句也没关系，坚持自己的隐私边界，对方最终会学会停下！',
        isTerminal: true,
      },
      p_round3_moved_away: {
        nodeId: 'p_round3_moved_away',
        roundNumber: 3,
        speakerName: '主动暂停对话 · 守护安静空间',
        peerMood: 'RESPECTFUL',
        peerSpokenText: '你换到了阳光充足的窗边座位，安安静静地画完了自己最满意的画。',
        peerSpokenTextOwn: '你换到了阳光充足的窗边座位，安安静静地画完了自己最满意的画。',
        sceneActionNote: '窗边的微风很舒服，没有人再打扰你的思考。',
        cognitiveReflectionNote: '当别人反复追问让你烦躁时，主动暂停对话或换个位置，是非常棒的自我照顾方式！',
        isTerminal: true,
      },
      p_round3_teacher_helped: {
        nodeId: 'p_round3_teacher_helped',
        roundNumber: 3,
        speakerName: '美术老师温和介入',
        peerMood: 'ADULT_SUPPORTED',
        peerSpokenText: '老师走过来温和地告诉豆豆：“每个小朋友家里的事都是私人秘密，当朋友说不想聊时，我们要立刻停下哦。”',
        peerSpokenTextOwn: '老师走过来温和地告诉豆豆：“每个小朋友家里的事都是私人秘密，当朋友说不想聊时，我们要立刻停下哦。”',
        sceneActionNote: '豆豆点点头不再追问，教室里恢复了轻松的画画氛围。',
        cognitiveReflectionNote: '说明边界后对方还不听时，找老师帮忙是最稳妥有效的支持路径！',
        isTerminal: true,
      },
      p_round3_topic_resolved: {
        nodeId: 'p_round3_topic_resolved',
        roundNumber: 3,
        speakerName: '同桌豆豆',
        peerMood: 'DISTRACTED_PLAY',
        peerSpokenText: '“谢谢你的水彩笔！你看我的太空飞船加上星星好看吗？”',
        peerSpokenTextOwn: '“谢谢你的水彩笔！你看我的太空飞船加上星星好看吗？”',
        sceneActionNote: '你们一起开心地完成了美术作品，再也没有被隐私追问困扰。',
        cognitiveReflectionNote: '你既没有勉强自己回答隐私问题，又聪明地让活动继续愉快进行！',
        isTerminal: true,
      },
    },
  },

  // =========================================================================
  // 场景三：同伴误解家庭情况（操场滑梯旁 · 同学乐乐）
  // =========================================================================
  {
    id: 'scenario_misunderstanding_peer_playground',
    category: 'PEER_MISUNDERSTANDING',
    categoryBadge: '情境 3 · 同伴误解家庭情况',
    title: '滑梯旁的小误会',
    locationTag: '户外大滑梯草坪',
    peerName: '同学乐乐',
    peerAvatarType: 'lele',
    contextSummary: '课间玩滑梯时，同学乐乐听说你爸爸妈妈不住在一起，脱口说出了一句错误的猜测。',
    contextSummaryOwn: '课间玩滑梯时，同学乐乐不了解你们家的安排，脱口说出了一句错误的猜测。',
    initialNodeId: 'm_round1',
    nodes: {
      m_round1: {
        nodeId: 'm_round1',
        roundNumber: 1,
        speakerName: '同学乐乐',
        peerMood: 'CONFUSED',
        peerSpokenText: '“啊？你爸爸妈妈不住在一起呀？那是不是因为你不听话，有一边不要你了呀？”',
        peerSpokenTextOwn: '“啊？今天你们家大人怎么没来参加开放日活动呀？是不是因为你不听话，家里人不疼你了呀？”',
        sceneActionNote: '乐乐抓着滑梯扶手，因为不懂大人的事，说出了让你心里一紧的误解。',
        cognitiveReflectionNote: '同伴说出错误的猜测，是因为他不了解事实。大人的安排绝不是小孩的错，你可以澄清，也可以不理会他的瞎猜！',
        isTerminal: false,
        options: [
          {
            id: 'opt_m1_direct',
            mode: 'DIRECT_ANSWER',
            childSpokenText: '“才不是呢！大人的事跟小孩没关系，爸爸妈妈都超爱我的！”',
            childSpokenTextOwn: '“才不是呢！大人们今天有工作安排，跟小孩听不听话没关系，家里人都超爱我的！”',
            innerThoughtHint: '清楚有力地纠正对方的错误猜测。',
            nextNodeId: 'm_round2_after_correct',
          },
          {
            id: 'opt_m1_boundary',
            mode: 'STATE_BOUNDARY',
            childSpokenText: '“你猜得不对！我不喜欢别人乱猜我家的事，请不要这样说。”',
            childSpokenTextOwn: '“你猜得不对！我不喜欢别人乱猜我家的事，请不要这样说。”',
            innerThoughtHint: '直接告诉对方这样乱猜让人不舒服。',
            nextNodeId: 'm_round2_after_boundary',
          },
          {
            id: 'opt_m1_pause',
            mode: 'PAUSE_CONVERSATION',
            childSpokenText: '“你说的不对，我不想跟你聊这个了，我去玩跷跷板！”',
            childSpokenTextOwn: '“你说的不对，我不想跟你聊这个了，我去玩跷跷板！”',
            innerThoughtHint: '不需要花力气说服不懂的人，随时可以离开。',
            nextNodeId: 'm_round3_paused_confident',
          },
          {
            id: 'opt_m1_adult',
            mode: 'SEEK_ADULT_HELP',
            childSpokenText: '走到操场边的老师身边：“老师，乐乐说我爸妈不住一起是因为不要我了，我听了很难过。”',
            childSpokenTextOwn: '走到操场边的老师身边：“老师，乐乐乱猜我们家大人不疼我了，我听了很难过。”',
            innerThoughtHint: '把心里的委屈告诉老师，让老师帮忙澄清和安慰。',
            nextNodeId: 'm_round3_adult_clarified',
          },
        ],
      },
      m_round2_after_correct: {
        nodeId: 'm_round2_after_correct',
        roundNumber: 2,
        speakerName: '同学乐乐',
        peerMood: 'CONFUSED',
        peerSpokenText: '“哦……我是在电视上看到的，原来他们都很爱你呀！那他们周末还会带你去公园玩吗？”',
        peerSpokenTextOwn: '“哦……原来是我瞎猜错了，你们家里人本来就很疼你呀！那你们周末还会去公园玩吗？”',
        sceneActionNote: '乐乐不好意思地吐了吐舌头，知道了自己刚才是在瞎猜。',
        cognitiveReflectionNote: '你坚定的回答打破了错误的猜测！现在你可以决定要不要继续聊周末，或者直接去滑滑梯。',
        isTerminal: false,
        options: [
          {
            id: 'opt_m2_partial',
            mode: 'PARTIAL_ANSWER',
            childSpokenText: '“当然会呀！来，让一让，我要从滑梯上滑下去咯！”',
            childSpokenTextOwn: '“当然会呀！来，让一让，我要从滑梯上滑下去咯！”',
            innerThoughtHint: '简单回应一句，开心地继续玩滑梯。',
            nextNodeId: 'm_round3_clarified_play',
          },
          {
            id: 'opt_m2_topic',
            mode: 'CHANGE_TOPIC',
            childSpokenText: '“我们比一比谁先滑到草坪底下的软垫子上吧！”',
            childSpokenTextOwn: '“我们比一比谁先滑到草坪底下的软垫子上吧！”',
            innerThoughtHint: '直接开启滑梯游戏。',
            nextNodeId: 'm_round3_clarified_play',
          },
        ],
      },
      m_round2_after_boundary: {
        nodeId: 'm_round2_after_boundary',
        roundNumber: 2,
        speakerName: '同学乐乐',
        peerMood: 'CONFUSED',
        peerSpokenText: '“我又不是故意的，我只是随便猜一下嘛……”',
        peerSpokenTextOwn: '“我又不是故意的，我只是随便猜一下嘛……”',
        sceneActionNote: '乐乐小声辩解了一句，但没有再继续乱说。',
        cognitiveReflectionNote: '同伴被指出错误时可能会嘴硬辩解一句，这很常见。你已经清楚表达了态度，接下来想怎么做？',
        isTerminal: false,
        options: [
          {
            id: 'opt_m2b_change',
            mode: 'CHANGE_TOPIC',
            childSpokenText: '“没看清事实就不能乱猜哦。走吧，我们去玩沙坑！”',
            childSpokenTextOwn: '“没看清事实就不能乱猜哦。走吧，我们去玩沙坑！”',
            innerThoughtHint: '用侦探小岛学到的道理提醒一句，然后去玩自己喜欢的项目。',
            nextNodeId: 'm_round3_clarified_play',
          },
          {
            id: 'opt_m2b_pause',
            mode: 'PAUSE_CONVERSATION',
            childSpokenText: '“我先去跟果果他们玩跳房子啦。”',
            childSpokenTextOwn: '“我先去跟果果他们玩跳房子啦。”',
            innerThoughtHint: '离开嘴硬的同伴，去找让自己更开心的伙伴。',
            nextNodeId: 'm_round3_paused_confident',
          },
        ],
      },
      m_round3_clarified_play: {
        nodeId: 'm_round3_clarified_play',
        roundNumber: 3,
        speakerName: '阳光操场上的安心时刻',
        peerMood: 'RESPECTFUL',
        peerSpokenText: '乐乐点点头：“好呀，那我以后不瞎猜了！预备——滑！”',
        peerSpokenTextOwn: '乐乐点点头：“好呀，那我以后不瞎猜了！预备——滑！”',
        sceneActionNote: '你们顺着滑梯欢快地滑下来，心里的乌云散得干干净净。',
        cognitiveReflectionNote: '记住：别人的错误猜测只是他不了解情况，永远改变不了爸爸妈妈爱你的事实！',
        cognitiveReflectionNoteOwn: '记住：别人的错误猜测只是他不了解情况，永远改变不了家人爱你的事实！',
        isTerminal: true,
      },
      m_round3_paused_confident: {
        nodeId: 'm_round3_paused_confident',
        roundNumber: 3,
        speakerName: '坚定离开错误猜测',
        peerMood: 'RESPECTFUL',
        peerSpokenText: '你迈开大步去玩自己喜欢的跷跷板，心里清楚知道：“爸爸妈妈都很爱我，才不管别人怎么瞎猜呢！”',
        peerSpokenTextOwn: '你迈开大步去玩自己喜欢的跷跷板，心里清楚知道：“家里人都很爱我，才不管别人怎么瞎猜呢！”',
        sceneActionNote: '你在阳光下玩得开心极了，内心稳稳当当。',
        cognitiveReflectionNote: '面对别人的误解，你没有义务必须留在原地解释，转身离开也是非常有力量的选择！',
        isTerminal: true,
      },
      m_round3_adult_clarified: {
        nodeId: 'm_round3_adult_clarified',
        roundNumber: 3,
        speakerName: '老师的温暖拥抱与引导',
        peerMood: 'ADULT_SUPPORTED',
        peerSpokenText: '老师温柔地摸摸你的头：“宝贝，爸爸妈妈都很爱你，大人的决定从来不是小朋友的错。老师这就去告诉乐乐不能随便乱猜。”',
        peerSpokenTextOwn: '老师温柔地摸摸你的头：“宝贝，家里人都很爱你，大人的安排从来不是小朋友的错。老师这就去告诉乐乐不能随便乱猜。”',
        sceneActionNote: '老师牵着你的手，让你感到无比安心。',
        cognitiveReflectionNote: '遇到让自己难过的误解时，找信任的大人倾诉和撑腰，能立刻帮我们找回力量！',
        isTerminal: true,
      },
    },
  },

  // =========================================================================
  // 场景四：多名同学起哄或嘲笑（走廊积木角 · 调皮起哄者）
  // =========================================================================
  {
    id: 'scenario_bullying_crowd_corridor',
    category: 'CROWD_BULLYING',
    categoryBadge: '情境 4 · 多名同学起哄嘲笑',
    title: '走廊里的起哄声音（安全保护模式）',
    locationTag: '活动室走廊积木角',
    peerName: '两名起哄的调皮同学',
    peerAvatarType: 'crowd',
    contextSummary: '走廊上有两个调皮的同学故意凑在一起起哄笑话你的家。触发安全红线：重点保护自己与求助，不强求说服对方！',
    contextSummaryOwn: '走廊上有两个调皮的同学故意凑在一起起哄笑话你。触发安全红线：重点保护自己与求助，不强求说服对方！',
    initialNodeId: 'b_round1',
    nodes: {
      b_round1: {
        nodeId: 'b_round1',
        roundNumber: 1,
        speakerName: '两名起哄的调皮同学',
        peerMood: 'MOCKING',
        peerSpokenText: '“哈哈，大家快看，他爸爸妈妈不住在一起，他家跟别人不一样，真奇怪！”',
        peerSpokenTextOwn: '“哈哈，大家快看，他家跟别人家不一样，真奇怪！”',
        sceneActionNote: '两个调皮同学故意大声哄笑，试图看你着急的样子。',
        cognitiveReflectionNote: '【安全保护红线】嘲笑别人的家庭是没有礼貌的越界行为！你绝对不需要忍受，不需要讨好他们，更不需要原谅！',
        isTerminal: false,
        isSafetyProtectionActive: true,
        options: [
          {
            id: 'opt_b1_state_boundary',
            mode: 'STATE_BOUNDARY',
            childSpokenText: '看着他们大声说：“请你立刻停下！笑话别人非常没有礼貌！”',
            childSpokenTextOwn: '看着他们大声说：“请你立刻停下！笑话别人非常没有礼貌！”',
            innerThoughtHint: '用响亮坚定的声音划出红线，制止起哄。',
            nextNodeId: 'b_round2_after_stop',
          },
          {
            id: 'opt_b1_pause_walk_away',
            mode: 'PAUSE_CONVERSATION',
            childSpokenText: '不理会他们的起哄，昂起头直接离开走廊，去图书角找好朋友。',
            childSpokenTextOwn: '不理会他们的起哄，昂起头直接离开走廊，去图书角找好朋友。',
            innerThoughtHint: '拒绝留在被嘲笑的现场，第一时间保护自己的安全与心情。',
            nextNodeId: 'b_round2_after_walk_away',
          },
          {
            id: 'opt_b1_seek_teacher',
            mode: 'SEEK_ADULT_HELP',
            childSpokenText: '大步走向值日老师：“老师，那两个同学在走廊起哄笑话我的家，请帮助我！”',
            childSpokenTextOwn: '大步走向值日老师：“老师，那两个同学在走廊起哄笑话我的家，请帮助我！”',
            innerThoughtHint: '面对多人起哄，立刻找老师介入是最强有力的保护！',
            nextNodeId: 'b_round3_teacher_stopped_bullying',
          },
        ],
      },
      // 真实同伴反应：面对起哄者，大声说停后对方有时还会做鬼脸，这时继续离开或找老师，绝不缠斗！
      b_round2_after_stop: {
        nodeId: 'b_round2_after_stop',
        roundNumber: 2,
        speakerName: '两名起哄的调皮同学',
        peerMood: 'MOCKING',
        peerSpokenText: '其中一个同学被你的大声吓了一跳，但另一个还在小声嘟囔：“略略略，凶什么凶……”',
        peerSpokenTextOwn: '其中一个同学被你的大声吓了一跳，但另一个还在小声嘟囔：“略略略，凶什么凶……”',
        sceneActionNote: '起哄声变小了，但对方并没有立刻乖乖道歉。',
        cognitiveReflectionNote: '真实世界里，起哄的人不一定立刻认错。我们不需要留在原地跟他们吵架说服他们，下一步直接离开或请老师处理！',
        isTerminal: false,
        isSafetyProtectionActive: true,
        options: [
          {
            id: 'opt_b2_seek_teacher',
            mode: 'SEEK_ADULT_HELP',
            childSpokenText: '转身叫来值日老师：“老师，我已经叫他们停下了，他们还在起哄。”',
            childSpokenTextOwn: '转身叫来值日老师：“老师，我已经叫他们停下了，他们还在起哄。”',
            innerThoughtHint: '已经表明态度后，交给老师严肃处理。',
            nextNodeId: 'b_round3_teacher_stopped_bullying',
          },
          {
            id: 'opt_b2_leave_to_friend',
            mode: 'PAUSE_CONVERSATION',
            childSpokenText: '已经大声表达过态度了，直接转身去阳光操场找好朋友朵朵玩！',
            childSpokenTextOwn: '已经大声表达过态度了，直接转身去阳光操场找好朋友朵朵玩！',
            innerThoughtHint: '不把时间浪费在没礼貌的人身上。',
            nextNodeId: 'b_round3_safe_with_friends',
          },
        ],
      },
      b_round2_after_walk_away: {
        nodeId: 'b_round2_after_walk_away',
        roundNumber: 2,
        speakerName: '图书角的安全地带',
        peerMood: 'RESPECTFUL',
        peerSpokenText: '你离开走廊来到安静的图书角，好朋友朵朵递给你一本恐龙立体书：“怎么啦？要不要一起看书，或者告诉老师？”',
        peerSpokenTextOwn: '你离开走廊来到安静的图书角，好朋友朵朵递给你一本恐龙立体书：“怎么啦？要不要一起看书，或者告诉老师？”',
        sceneActionNote: '起哄的声音被远远甩在身后，身边是友善的伙伴和老师。',
        cognitiveReflectionNote: '你第一时间脱离了不舒服的环境！现在你想告诉老师，还是先和好朋友安静看书？',
        isTerminal: false,
        isSafetyProtectionActive: true,
        options: [
          {
            id: 'opt_b2w_tell_teacher',
            mode: 'SEEK_ADULT_HELP',
            childSpokenText: '“朵朵陪我一起去告诉老师吧，不能让他们随便笑话别人！”',
            childSpokenTextOwn: '“朵朵陪我一起去告诉老师吧，不能让他们随便笑话别人！”',
            innerThoughtHint: '在好朋友陪伴下告诉老师，既安全又有力量。',
            nextNodeId: 'b_round3_teacher_stopped_bullying',
          },
          {
            id: 'opt_b2w_read_book',
            mode: 'CHANGE_TOPIC',
            childSpokenText: '“我不想理他们，我们先一起看这本立体恐龙书，放学我再跟妈妈说！”',
            childSpokenTextOwn: '“我不想理他们，我们先一起看这本立体恐龙书，放学我再跟家里大人说！”',
            innerThoughtHint: '先平复心情享受快乐时光，放学再和家人倾诉。',
            nextNodeId: 'b_round3_safe_with_friends',
          },
        ],
      },
      b_round3_teacher_stopped_bullying: {
        nodeId: 'b_round3_teacher_stopped_bullying',
        roundNumber: 3,
        speakerName: '值日老师果断保护',
        peerMood: 'ADULT_SUPPORTED',
        peerSpokenText: '老师立刻走过去严肃制止了起哄的同学，并坚定地对你说：“你第一时间来找老师非常勇敢！任何人都没有权利笑话你的家庭。”',
        peerSpokenTextOwn: '老师立刻走过去严肃制止了起哄的同学，并坚定地对你说：“你第一时间来找老师非常勇敢！任何人都没有权利笑话你的家庭。”',
        sceneActionNote: '恶意起哄被彻底制止，你的尊严与安全得到了完全保护。',
        cognitiveReflectionNote: '面对多人起哄或欺凌，保护自己和寻求可靠大人帮助永远是第一位的，绝不需要勉强自己去说服或原谅对方！',
        isTerminal: true,
        isSafetyProtectionActive: true,
      },
      b_round3_safe_with_friends: {
        nodeId: 'b_round3_safe_with_friends',
        roundNumber: 3,
        speakerName: '安全温暖的伙伴圈',
        peerMood: 'RESPECTFUL',
        peerSpokenText: '你和真正懂礼貌的好朋友一起开心地看书玩耍，放学后妈妈也给你大大的拥抱，夸你懂得保护自己！',
        peerSpokenTextOwn: '你和真正懂礼貌的好朋友一起开心地看书玩耍，放学后家人也给你大大的拥抱，夸你懂得保护自己！',
        sceneActionNote: '你明白谁才是值得交往的好朋友，不再为没礼貌的声音难过。',
        cognitiveReflectionNote: '你学会了把不友好的声音挡在护盾外面，把时间和笑容留给真正尊重你的朋友和家人！',
        isTerminal: true,
      },
    },
  },

  // =========================================================================
  // 场景五：朋友愿意倾听与理解（秘密树洞长椅 · 知心伙伴朵朵）
  // =========================================================================
  {
    id: 'scenario_listening_friend_bench',
    category: 'SUPPORTIVE_LISTENING',
    categoryBadge: '情境 5 · 朋友愿意倾听理解',
    title: '树荫长椅上的贴心倾听',
    locationTag: '小花园树荫长椅',
    peerName: '知心伙伴朵朵',
    peerAvatarType: 'duoduo',
    contextSummary: '知心好朋友朵朵坐在你身边，温和地表示愿意倾听你的感受，也完全尊重你不说的权利。',
    contextSummaryOwn: '知心好朋友朵朵坐在你身边，温和地表示愿意倾听你的感受，也完全尊重你不说的权利。',
    initialNodeId: 'l_round1',
    nodes: {
      l_round1: {
        nodeId: 'l_round1',
        roundNumber: 1,
        speakerName: '知心伙伴朵朵',
        peerMood: 'RESPECTFUL',
        peerSpokenText: '“刚才听你说周末要去爸爸的新家住，那儿好玩吗？如果你想跟我讲讲，我特别想听；要是你想保密也没关系哦！”',
        peerSpokenTextOwn: '“周末你们家有什么特别安排呀？如果你想跟我讲讲，我特别想听；要是你想保密也没关系哦！”',
        sceneActionNote: '朵朵捧着两片好看的梧桐叶，眼神温和又真诚。',
        cognitiveReflectionNote: '面对尊重你、愿意倾听的好朋友，你可以放心地多聊一点，也可以只说一点点，或者问问她的周末！',
        isTerminal: false,
        options: [
          {
            id: 'opt_l1_direct',
            mode: 'DIRECT_ANSWER',
            childSpokenText: '“好玩呀！爸爸家阳台上有一盆会害羞的含羞草，妈妈家有大浴缸，两边都有我的小床！”',
            childSpokenTextOwn: '“好玩呀！我们家阳台上有一盆一碰就会合拢的含羞草，还有我最喜欢的小书角！”',
            innerThoughtHint: '向值得信任的好朋友分享家里的温暖小细节。',
            nextNodeId: 'l_round2_shared_joy',
          },
          {
            id: 'opt_l1_partial',
            mode: 'PARTIAL_ANSWER',
            childSpokenText: '“还不错啦，只是有时候收拾小书包会怕忘带小熊玩偶。”',
            childSpokenTextOwn: '“还不错啦，只是有时候出门玩收拾小书包会怕忘带小熊玩偶。”',
            innerThoughtHint: '坦诚分享一点点真实的小烦恼。',
            nextNodeId: 'l_round2_shared_feeling',
          },
          {
            id: 'opt_l1_ask_peer',
            mode: 'ASK_PEER',
            childSpokenText: '“挺好玩的！朵朵，那你这个周末准备去哪里玩呀？”',
            childSpokenTextOwn: '“挺好玩的！朵朵，那你这个周末准备去哪里玩呀？”',
            innerThoughtHint: '简短回应后关心好朋友的周末安排。',
            nextNodeId: 'l_round2_mutual_chat',
          },
          {
            id: 'opt_l1_boundary',
            mode: 'STATE_BOUNDARY',
            childSpokenText: '“谢谢你朵朵！不过今天我想先把家里的事留在心里，我们一起用树叶贴画吧！”',
            childSpokenTextOwn: '“谢谢你朵朵！不过今天我想先把家里的事留在心里，我们一起用树叶贴画吧！”',
            innerThoughtHint: '即使是面对最好的朋友，今天不想聊也完全可以说出来。',
            nextNodeId: 'l_round3_warm_respect',
          },
        ],
      },
      l_round2_shared_joy: {
        nodeId: 'l_round2_shared_joy',
        roundNumber: 2,
        speakerName: '知心伙伴朵朵',
        peerMood: 'RESPECTFUL',
        peerSpokenText: '“哇，一碰就会合拢的含羞草！听起来两边都有特别棒的宝贝呢！那你想妈妈的时候怎么办呀？”',
        peerSpokenTextOwn: '“哇，一碰就会合拢的含羞草！听起来特别棒呢！那你平时在家想找人聊天的时候怎么办呀？”',
        sceneActionNote: '朵朵听得津津有味，温和地问了一个关心你的问题。',
        cognitiveReflectionNote: '好朋友真心关心你时，你可以继续分享你的安心小妙招，或者转换到一起玩游戏。',
        isTerminal: false,
        options: [
          {
            id: 'opt_l2_direct',
            mode: 'DIRECT_ANSWER',
            childSpokenText: '“我想妈妈的时候就可以给她打电话，或者抱抱妈妈送我的安心小海豚！”',
            childSpokenTextOwn: '“我可以给家里人打电话聊天，或者抱抱我最喜欢的安心小海豚玩偶！”',
            innerThoughtHint: '分享自己的安心联系办法。',
            nextNodeId: 'l_round3_deep_friendship',
          },
          {
            id: 'opt_l2_topic',
            mode: 'CHANGE_TOPIC',
            childSpokenText: '“我有安心小妙招哒！来，我们用这片梧桐叶做小船吧！”',
            childSpokenTextOwn: '“我有安心小妙招哒！来，我们用这片梧桐叶做小船吧！”',
            innerThoughtHint: '聊到这里刚刚好，开心转入树叶手工。',
            nextNodeId: 'l_round3_warm_respect',
          },
        ],
      },
      l_round2_shared_feeling: {
        nodeId: 'l_round2_shared_feeling',
        roundNumber: 2,
        speakerName: '知心伙伴朵朵',
        peerMood: 'RESPECTFUL',
        peerSpokenText: '“我懂！我上次去外婆家过夜也差点忘了带小兔子枕头！我们可以画一张小书包检查贴纸呀！”',
        peerSpokenTextOwn: '“我懂！我上次出门也差点忘了带小兔子枕头！我们可以画一张小书包检查贴纸呀！”',
        sceneActionNote: '朵朵不仅理解你的小烦恼，还陪你一起想出了好点子。',
        cognitiveReflectionNote: '被好朋友理解的感觉真温暖！你想怎么回应朵朵的提议？',
        isTerminal: false,
        options: [
          {
            id: 'opt_l2f_accept',
            mode: 'DIRECT_ANSWER',
            childSpokenText: '“太好啦！我们在贴纸上画上小熊玩偶和故事书，这样每次出发前看一眼就不会忘啦！”',
            childSpokenTextOwn: '“太好啦！我们在贴纸上画上小熊玩偶和故事书，这样每次出发前看一眼就不会忘啦！”',
            innerThoughtHint: '和好朋友一起把烦恼变成小行动。',
            nextNodeId: 'l_round3_deep_friendship',
          },
        ],
      },
      l_round2_mutual_chat: {
        nodeId: 'l_round2_mutual_chat',
        roundNumber: 2,
        speakerName: '知心伙伴朵朵',
        peerMood: 'RESPECTFUL',
        peerSpokenText: '“我周末要跟妈妈去植物园捡松果！我捡到最圆的松果带回来送给你！”',
        peerSpokenTextOwn: '“我周末要去植物园捡松果！我捡到最圆的松果带回来送给你！”',
        sceneActionNote: '朵朵开心地把一片金黄的梧桐叶放在你手心里。',
        cognitiveReflectionNote: '互相倾听与询问，让两个人的心靠得更近了。',
        isTerminal: false,
        options: [
          {
            id: 'opt_l2m_thanks',
            mode: 'DIRECT_ANSWER',
            childSpokenText: '“一言为定！那我下周一也带好看的贴纸跟你交换！”',
            childSpokenTextOwn: '“一言为定！那我下周一也带好看的贴纸跟你交换！”',
            innerThoughtHint: '约定下周的友好分享。',
            nextNodeId: 'l_round3_deep_friendship',
          },
        ],
      },
      l_round3_deep_friendship: {
        nodeId: 'l_round3_deep_friendship',
        roundNumber: 3,
        speakerName: '温暖的树荫友谊',
        peerMood: 'RESPECTFUL',
        peerSpokenText: '朵朵笑着和拉了拉勾：“不管是开心的事还是小烦恼，我们都是最好的朋友！”',
        peerSpokenTextOwn: '朵朵笑着和你拉了拉勾：“不管是开心的事还是小烦恼，我们都是最好的朋友！”',
        sceneActionNote: '阳光透过树叶洒在长椅上，心里暖洋洋的。',
        cognitiveReflectionNote: '在安全、尊重你的好朋友面前，适度表达真实感受能收获温暖的友谊与支持！',
        isTerminal: true,
      },
      l_round3_warm_respect: {
        nodeId: 'l_round3_warm_respect',
        roundNumber: 3,
        speakerName: '尊重边界的知心朋友',
        peerMood: 'RESPECTFUL',
        peerSpokenText: '朵朵笑眯眯地点点头：“没问题！你想聊的时候随时跟我说，现在我们来拼树叶小狐狸吧！”',
        peerSpokenTextOwn: '朵朵笑眯眯地点点头：“没问题！你想聊的时候随时跟我说，现在我们来拼树叶小狐狸吧！”',
        sceneActionNote: '真正的好朋友就算听你说“今天不想聊”，也一样会尊重你、喜欢你。',
        cognitiveReflectionNote: '哪怕面对最好的朋友，你也有权保留自己的私人空间，真正的朋友会尊重你的边界！',
        isTerminal: true,
      },
    },
  },
];

export function getFriendHomeScenarioById(scenarioId: string): FriendHomeScenario {
  return (
    FRIEND_HOME_SCENARIOS.find((s) => s.id === scenarioId) || FRIEND_HOME_SCENARIOS[0]
  );
}

// =========================================================================
// 向下兼容旧版导出 (Legacy Compatibility Exports)
// =========================================================================

export interface ChoicePathway {
  readonly target: ResponseTarget;
  readonly depth: DisclosureDepth;
  readonly spokenTextPrompt: string;
  readonly outcome: PeerReactionOutcome;
}

export const FRIEND_ASKS_PATHWAYS: Record<string, ChoicePathway> = {
  peer_clear_fact: {
    target: 'ASKING_PEER',
    depth: 'CLEAR_FACT',
    spokenTextPrompt: '告诉小明：“因为他们住在不同的地方，轮流来接我，他们都非常爱我。”',
    outcome: {
      type: 'UNDERSTANDING',
      peerSpokenText: '小明眨了眨眼睛说：“哦！原来是这样呀！那我妈妈带了草莓饼干，我们一起去长椅上吃吧！”',
      peerActionDescription: '小明放下了好奇，开心地拉着你一起去吃小饼干。',
      expressionEmoji: '😊',
      isBoundaryTriggered: false,
      nextOptionsPrompt: '你看，真诚客观的一句话划清了事实，你们继续当好朋友啦！',
    },
  },
  peer_minimal_touch: {
    target: 'ASKING_PEER',
    depth: 'MINIMAL_TOUCH',
    spokenTextPrompt: '轻声说一句：“他们今天有各自的工作，轮流来。”',
    outcome: {
      type: 'FURTHER_QUESTION',
      peerSpokenText: '小明凑近一步继续问：“那他们晚上也住在不同的房子吗？为什么不住在一起呀？”',
      peerActionDescription: '小明还带着强烈的好奇心，想要继续打听更多家庭细节。',
      expressionEmoji: '🧐',
      isBoundaryTriggered: false,
      nextOptionsPrompt: '当同伴继续追问让你觉得不舒服时，你可以礼貌划定界限：“这是我们家的事，我不想多聊啦！”',
    },
  },
  peer_no_answer_redirect: {
    target: 'ASKING_PEER',
    depth: 'NO_ANSWER_REDIRECT',
    spokenTextPrompt: '礼貌地笑笑并转移话题：“我想去那边看大滑梯，你看，那个滑梯好高呀！”',
    outcome: {
      type: 'UNDERSTANDING',
      peerSpokenText: '小明顺着你的手指看过去：“哇，真的好高！等等我，我也要去滑！”',
      peerActionDescription: '小明跟着滑梯跑过去了，没有再问刚才的问题。',
      expressionEmoji: '🏃‍♂️',
      isBoundaryTriggered: false,
      nextOptionsPrompt: '保护自己的隐私是完全正当的，你聪明地转移了注意力！',
    },
  },
  peer_misunderstanding_sim: {
    target: 'ASKING_PEER',
    depth: 'MINIMAL_TOUCH',
    spokenTextPrompt: '低头小声说：“他们不住在一起。”',
    outcome: {
      type: 'MISUNDERSTANDING',
      peerSpokenText: '小明挠挠头说：“啊？那他们是不是不要你了呀？”',
      peerActionDescription: '小明因为不懂大人的事情，说出了一句错误的猜想。',
      expressionEmoji: '🤔',
      isBoundaryTriggered: false,
      nextOptionsPrompt: '同伴说错了事实。你可以清楚告诉他：“才不是呢，他们非常爱我”，或者选择不理会他的猜想。',
    },
  },
  peer_bullying_encounter: {
    target: 'ASKING_PEER',
    depth: 'CLEAR_FACT',
    spokenTextPrompt: '当周围出现起哄的声音时……',
    outcome: {
      type: 'BULLYING_RIDICULE',
      peerSpokenText: '旁边跑过来一个小调皮起哄：“哈哈，你家真奇怪，爸爸妈妈不住一起，我们都不跟你玩！”',
      peerActionDescription: '起哄者指手画脚大笑，践踏了交往边界，触发尊严与心理安全围栏。',
      expressionEmoji: '🛑',
      isBoundaryTriggered: true,
      nextOptionsPrompt: '警告：已触发伤害边界！绝对不需要忍受或原谅欺凌者，请立刻执行安全保护行动！',
    },
  },
  adult_co_regulation: {
    target: 'TRUSTED_ADULT',
    depth: 'CLEAR_FACT',
    spokenTextPrompt: '先不对同学多说，放学后牵着妈妈的手：“今天有同学问起我们的家，我不知道怎么说。”',
    outcome: {
      type: 'UNDERSTANDING',
      peerSpokenText: '妈妈蹲下身温柔地抱了抱你：“宝贝，你做得很对。家庭的事情属于我们自己，你想说就说，不想说完全可以不说。”',
      peerActionDescription: '安全大人给予了坚定的心理支持与温暖拥抱。',
      expressionEmoji: '🤗',
      isBoundaryTriggered: false,
      nextOptionsPrompt: '有大人在身边，任何困惑都可以一起商量解决。',
    },
  },
};

export const SAFETY_BYPASS_ACTIONS = [
  {
    id: 'say_stop_firmly',
    label: '严肃大声说停',
    spokenText: '看着对方的眼睛大声说：“请你停下！这不是事实，你这样做非常没有礼貌！”然后转身离开。',
    icon: '✋',
  },
  {
    id: 'report_to_teacher',
    label: '走向值日老师求助',
    spokenText: '走向校门口的老师：“老师，那边的同学在起哄笑话我的家，让我很不舒服，请帮助我。”',
    icon: '🏫',
  },
  {
    id: 'walk_away_to_safety',
    label: '离开现场找好朋友',
    spokenText: '不理会起哄的声音，直接走向自己的好朋友乐乐，拉起乐乐的手一起玩秋千。',
    icon: '🤝',
  },
];
