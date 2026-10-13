/**
 * 《朋友问起我的家》领域状态与逻辑 (Friend Asks About My Family Logic)
 * 认知目标：自主表达、隐私边界、社会关系判断
 * 
 * 核心规则：
 * 1. 孩子享有选择是否表达、向谁表达、表达多少的绝对自主权；
 * 2. 覆盖 4 类真实同伴反应：理解、继续追问、误解、嘲笑起哄；
 * 3. 面对嘲笑或欺凌时直接切换为安全保护与求助模式，绝不强迫原谅；
 * 4. 允许角色改变决定、重选路径；
 * 5. 标注为成年人陪伴共玩敏感场景。
 */

import {
  ResponseTarget,
  DisclosureDepth,
  PeerReactionOutcomeType,
  PeerReactionOutcome,
} from './types';

export interface ChoicePathway {
  readonly target: ResponseTarget;
  readonly depth: DisclosureDepth;
  readonly spokenTextPrompt: string;
  readonly outcome: PeerReactionOutcome;
}

export const FRIEND_ASKS_PATHWAYS: Record<string, ChoicePathway> = {
  // 分支 1: 向小明简述客观事实 -> 同伴理解接纳
  'peer_clear_fact': {
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

  // 分支 2: 向小明只说一点点 -> 同伴继续追问好奇
  'peer_minimal_touch': {
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

  // 分支 3: 暂时不回答，转移话题 -> 同伴被转移注意力
  'peer_no_answer_redirect': {
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

  // 分支 4: 遇到同伴误解的情况
  'peer_misunderstanding_sim': {
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

  // 分支 5: 遭遇恶意嘲笑 / 起哄 -> 触发安全保护围栏 (Bypass to Protection)
  'peer_bullying_encounter': {
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

  // 分支 6: 选择告诉信任的大人或老师
  'adult_co_regulation': {
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
