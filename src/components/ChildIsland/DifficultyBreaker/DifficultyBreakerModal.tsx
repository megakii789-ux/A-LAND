import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Volume2,
  CheckCircle2,
  X,
  Eye,
  Footprints,
  Heart,
  ShieldAlert,
  PauseCircle,
  RotateCcw,
  Compass,
} from 'lucide-react';
import { sounds } from '../../../utils/sound';
import {
  speechNarrator,
  COMPANION_TO_VOICE_PROFILE,
  VOICE_PROFILES,
  CompanionVoiceId,
  EmotionProsodyTone,
  KaraokeSyncState,
} from '../../../utils/speech';
import { useApp } from '../../../context/AppContext';
import { ANIMAL_COMPANIONS } from '../../../domain/personalization';
import { CompanionAvatarSvg } from '../CompanionIcons';

const BREAKER_COMPANION_ORDER: CompanionVoiceId[] = [
  'guoguo_squirrel',
  'beibei_otter',
  'tiantian_raccoon',
  'qiqi_deer',
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export type BreakerTransitionSubBranchId =
  | 'sub_dual_attachment'
  | 'sub_loyalty_conflict'
  | 'sub_specific_concern'
  | 'sub_ordinary_transition';

export interface BreakerActionItem {
  id: string;
  badge: string;
  text: string;
  type: 'calm' | 'connect' | 'action' | 'boundary' | 'safety';
  isSafetyAction?: boolean;
}

export interface BreakerStageContent {
  subId?: BreakerTransitionSubBranchId;
  shortLabel: string;
  subtitle: string;
  stoneHeadline: string;
  entrySpeech: string;
  fenItems: {
    fact: string;
    feeling: string;
    guess: string;
    guessCategoryLabel: '脑中疑问或想法' | '未证实猜测' | '未证实的脑中猜测' | '任务切片想法';
  };
  tongPerspective: {
    lensName: string;
    frontStuckPoint: string;
    shiftContent: string;
    silverLining: string;
    tongSpeech: string;
  };
  availableActions: BreakerActionItem[];
}

interface DifficultyPreset {
  id: string;
  title: string;
  tag: string;
  desc: string;
  defaultContent: BreakerStageContent;
  subBranches?: Record<BreakerTransitionSubBranchId, BreakerStageContent>;
}

/**
 * 大困难拆解台固定语音台词表（用于 4 角色预合成神经语音与测试校验）
 */
export const BREAKER_FIXED_VOICE_LINES = {
  ENTRY_GREETING:
    '欢迎来到大困难拆解台！遇到手头事多或心里打结的时候，我们可以先看清事实和感受，换个镜头看一看，再挑一两块舒服的小踏脚石。',
  TRANSITION_DUAL_ENTRY:
    '去另一边住时，同时想念两个地方是很自然的事。不需要二选一，也不必勉强拥抱或写信。',
  TRANSITION_LOYALTY_ENTRY:
    '你在这边玩得开心是真实发生的事实，担心另一边大人难过只是心里的猜测。大人的情绪由大人负责，你也不需要违心说两个地方一样好。',
  TRANSITION_SPECIFIC_ENTRY:
    '如果对去另一边有具体担忧，我们先查清是日程不明、环境不习惯，还是暂时说不清楚。要是遇到有人凶你或伤害你，立刻启动安全护盾找信任的大人！',
  TRANSITION_ORDINARY_ENTRY:
    '今天去另一边心情挺轻松，没有任何害怕！我们不需要做心理安抚，只要把收拾日常物品拆成两三个轻快的小动作就能出发。',
  COMPLETE_SPEECH:
    '你把原本乱糟糟的大石头拆成了清楚的小踏脚石！按自己舒服的步子迈出这一小步就很棒啦。',
  PAUSE_SPEECH:
    '你选择了先停下来休息一会儿。不用勉强马上做决定，什么时候想继续都可以。',
} as const;

const TRANSITION_SUB_BRANCHES: Record<BreakerTransitionSubBranchId, BreakerStageContent> = {
  sub_dual_attachment: {
    subId: 'sub_dual_attachment',
    shortLabel: '双向不舍',
    subtitle: '两边都记挂 · 不二选一',
    stoneHeadline: '两边都有记挂的事，不想二选一',
    entrySpeech: BREAKER_FIXED_VOICE_LINES.TRANSITION_DUAL_ENTRY,
    fenItems: {
      fact: '已知事实：我要从这边住处去另一边住处，两边都有我熟悉或记挂的事。',
      feeling:
        '多种感受共存：既舍不得现在的照护者，也期待另一边的生活；或者现在只想安安静静待一会儿，不想马上笑。',
      guess:
        '脑中疑问：“我是不是必须只选一边喜欢？出门时是不是非要拥抱、写信或假装很开心？”',
      guessCategoryLabel: '脑中疑问或想法',
    },
    tongPerspective: {
      lensName: '双星共存镜（允许两种心意同时存在）',
      frontStuckPoint: '以为只能在两个地方里二选一，或者以为不拥抱、不写信就不懂事。',
      shiftContent:
        '想念这边和期待那边可以同时装在心里，从来不需要二选一！告别方式也由我自己定，不想拥抱或不想写信完全没问题。',
      silverLining:
        '按自己舒服的慢步子过渡，既留住了对这边的记挂，也保留了去那边的期待。',
      tongSpeech: BREAKER_FIXED_VOICE_LINES.TRANSITION_DUAL_ENTRY,
    },
    availableActions: [
      {
        id: 'act-th-dual-1',
        badge: '双星同亮',
        text: '把两颗想念星同时揣进口袋，不需要二选一',
        type: 'connect',
      },
      {
        id: 'act-th-dual-2',
        badge: '身体边界',
        text: '今天不想拥抱也不写信，轻轻点头安静过桥',
        type: 'boundary',
      },
      {
        id: 'act-th-dual-3',
        badge: '慢步过渡',
        text: '踩着慢步石，先在原地安静坐五分钟再出发',
        type: 'calm',
      },
      {
        id: 'act-th-dual-4',
        badge: '轻巧告别',
        text: '和身边大人轻轻碰碰小拳头说“过几天见”',
        type: 'action',
      },
    ],
  },
  sub_loyalty_conflict: {
    subId: 'sub_loyalty_conflict',
    shortLabel: '忠诚冲突',
    subtitle: '分清真事与大人猜测',
    stoneHeadline: '在这边玩得开心，却担心另一边大人难过',
    entrySpeech: BREAKER_FIXED_VOICE_LINES.TRANSITION_LOYALTY_ENTRY,
    fenItems: {
      fact: '已知事实：我今天在这边搭积木、玩游戏笑了，度过了开心的一下午。',
      feeling:
        '真实感受：心里像夹心饼干一样有点拧巴；或者发现自己对两个地方的习惯程度、喜欢程度不一样。',
      guess:
        '[未证实猜测] “另一边的大人现在一定在家里偷偷伤心，觉得我不爱他了。”（这是猜测，不是已证实的事实）',
      guessCategoryLabel: '未证实猜测',
    },
    tongPerspective: {
      lensName: '事实分界镜 & 责任小围栏',
      frontStuckPoint:
        '把对大人心情的猜测当成了确定事实，或者被夹在两边大人中间当传话筒。',
      shiftContent:
        '我今天玩得开心是真实事实，另一边大人会不会难过只是心里的猜测！大人的情绪和大人之间的事归大人负责，不由小孩承担。',
      silverLining:
        '没有人规定必须说“两个地方一样好”——喜欢一边多一点，或者对另一边不太喜欢、还不习惯，都是诚实自然的感受。',
      tongSpeech: BREAKER_FIXED_VOICE_LINES.TRANSITION_LOYALTY_ENTRY,
    },
    availableActions: [
      {
        id: 'act-th-loy-1',
        badge: '分清责任',
        text: '把大人的心情放回大人圈，允许自己安心玩耍',
        type: 'boundary',
      },
      {
        id: 'act-th-loy-2',
        badge: '拒绝传话',
        text: '立起责任小围栏：“大人的事请你们在手机上说，我不当传话筒”',
        type: 'boundary',
      },
      {
        id: 'act-th-loy-3',
        badge: '诚实感受',
        text: '保留真实感受：不强迫自己说“两个地方一样好”',
        type: 'calm',
      },
      {
        id: 'act-th-loy-4',
        badge: '区分事实',
        text: '把“大人一定在伤心”放进未证实猜测云，不替大人操心',
        type: 'action',
      },
    ],
  },
  sub_specific_concern: {
    subId: 'sub_specific_concern',
    shortLabel: '具体担忧',
    subtitle: '先查原因 · 安全优先',
    stoneHeadline: '去另一边前有具体担忧，或者暂时说不清楚',
    entrySpeech: BREAKER_FIXED_VOICE_LINES.TRANSITION_SPECIFIC_ENTRY,
    fenItems: {
      fact: '已知事实：去另一边前心里有具体挂念的事（可能是日程不明、新环境不习惯、暂时说不清，或担心某个具体的人/行为）。',
      feeling:
        '真实感受：胸口有点闷，脑子里有一串小问号；也允许现在找不到词说、不想回答。',
      guess:
        '脑中疑问：“不知道去住几天、谁来接我，或者那边枕头/规矩不习惯怎么办？”',
      guessCategoryLabel: '脑中疑问或想法',
    },
    tongPerspective: {
      lensName: '原因路标镜 & 安全保护护盾',
      frontStuckPoint:
        '如果不先查清具体原因就盲目塞玩偶或深呼吸，真正卡住的问题还是没解决。',
      shiftContent:
        '先查清具体原因：日程不明就看日历路标，环境不熟就带习惯卡，说不清就先安静休息；若遇到有人凶我、打人或伤害行为，绝不用普通换家仪式应付！',
      silverLining:
        '任何时候身体安全排第一：涉及具体伤害时立即停用普通书包与拥抱仪式，直接找信任的大人或老师保护我！',
      tongSpeech: BREAKER_FIXED_VOICE_LINES.TRANSITION_SPECIFIC_ENTRY,
    },
    availableActions: [
      {
        id: 'act-th-spec-1',
        badge: '核实日程',
        text: '点亮日程路标：向大人问清去住几天、谁来接我',
        type: 'action',
      },
      {
        id: 'act-th-spec-2',
        badge: '环境过渡',
        text: '带上一张小习惯卡或熟悉小夜灯，适应不同环境',
        type: 'action',
      },
      {
        id: 'act-th-spec-3',
        badge: '暂不回答',
        text: '现在说不清楚原因，先在安静长椅上坐会儿不回答',
        type: 'calm',
      },
      {
        id: 'act-th-spec-4',
        badge: '安全护盾',
        text: '若涉及具体伤害行为：停用普通换家仪式，立即向信任的大人或老师求助',
        type: 'safety',
        isSafetyAction: true,
      },
    ],
  },
  sub_ordinary_transition: {
    subId: 'sub_ordinary_transition',
    shortLabel: '轻松日常',
    subtitle: '平常出发 · 分步理物',
    stoneHeadline: '心情轻松去另一边，只需分步理好日常物品',
    entrySpeech: BREAKER_FIXED_VOICE_LINES.TRANSITION_ORDINARY_ENTRY,
    fenItems: {
      fact: '已知事实：今天要去另一边住，桌上有画画本、小足球和水壶要收进书包。',
      feeling:
        '平稳日常感受：全身松松的，心情平平常常挺轻松，没有任何害怕，只是看一桌子东西不知先拿哪件。',
      guess:
        '任务切片想法：“一下子看整桌东西有点多，分成两三件小事就轻轻松松啦！”',
      guessCategoryLabel: '任务切片想法',
    },
    tongPerspective: {
      lensName: '轻松日常分步镜（无需焦虑安抚）',
      frontStuckPoint: '桌上的画本、水壶和玩具摆在一起，不知道先装哪一样。',
      shiftContent:
        '很多时候换地方住就像平时去公园一样，是一件普通又顺畅的日常小事，根本不需要启动焦虑安抚！',
      silverLining:
        '把整桌东西拆成「装画本 → 装水壶 → 穿鞋出发」三个小动作，一分钟就能开心出门。',
      tongSpeech: BREAKER_FIXED_VOICE_LINES.TRANSITION_ORDINARY_ENTRY,
    },
    availableActions: [
      {
        id: 'act-th-ord-1',
        badge: '日常第1步',
        text: '把日常爱玩的画画本或小足球放进书包',
        type: 'action',
      },
      {
        id: 'act-th-ord-2',
        badge: '日常第2步',
        text: '把自己的小水壶放进书包侧袋',
        type: 'action',
      },
      {
        id: 'act-th-ord-3',
        badge: '日常第3步',
        text: '背起小书包，轻快走过小桥出发',
        type: 'action',
      },
      {
        id: 'act-th-ord-4',
        badge: '自然日常',
        text: '今天什么额外安抚仪式都不做，像平时出门一样自然过去',
        type: 'calm',
      },
    ],
  },
};

export const PRESET_DIFFICULTIES: DifficultyPreset[] = [
  {
    id: 'diff-two-homes',
    title: '要去另一边住，手头或心里有不同头绪',
    tag: '多维拆解 · 不预设害怕',
    desc: '可能两边都想念、可能担心大人心情、可能有具体问题想弄明白，也可能是平平常常想分步理好日常物品。',
    defaultContent: TRANSITION_SUB_BRANCHES.sub_dual_attachment,
    subBranches: TRANSITION_SUB_BRANCHES,
  },
  {
    id: 'diff-blocks-broken',
    title: '辛辛苦苦搭的积木城堡塌了',
    tag: '挫折拆解 · 分清故意与意外',
    desc: '搭了一下午的高塔被小伙伴不小心撞塌了，气得想大喊大叫摔东西。',
    defaultContent: {
      shortLabel: '积木塌了',
      subtitle: '分清事实与怒火 · 重新开局',
      stoneHeadline: '辛辛苦苦搭的积木城堡塌了',
      entrySpeech:
        '积木城堡倒了确实很让人心疼！我们先看清地板上的事实、手握紧的感受，还有脑子里是不是在猜对方故意害你。',
      fenItems: {
        fact: '已知事实：积木散在地板上了，塔倒了（看得见的客观事实）。',
        feeling: '身体感受：脸热热的，双手握紧成小拳头，好气好气。',
        guess:
          '[未证实猜测] “他肯定是存心跟我过不去、想看我哭”（脑子里的怀疑猜测）。',
        guessCategoryLabel: '未证实的脑中猜测',
      },
      tongPerspective: {
        lensName: '小伙伴的眼睛 & 创造力新镜头',
        frontStuckPoint: '觉得整座城堡全完了，而且认定对方是故意捣乱的大坏蛋。',
        shiftContent:
          '他刚才在追滚远的小球，没看清脚下，现在也吓得呆在原地不知所措。',
        silverLining:
          '不用一口气重搭整座大城，先挑 3 块底座积木，还能改造成更酷的宇宙飞船！',
        tongSpeech:
          '换个镜头看：对方刚才在追小球没看路，不是故意针对你。我们不用一口气搭完大城堡，先找三块底座积木就能重新开始！',
      },
      availableActions: [
        {
          id: 'act-5',
          badge: '身体降温',
          text: '按下暂停键：双手抱在胸前退后两步，等火苗变小',
          type: 'calm',
        },
        {
          id: 'act-6',
          badge: '清楚表达',
          text: '用坚定的话表达边界：“我不喜欢你撞倒我的积木，下次请看路”',
          type: 'boundary',
        },
        {
          id: 'act-7',
          badge: '微小起步',
          text: '先只挑出 3 块蓝色长积木拼好飞船底座',
          type: 'action',
        },
        {
          id: 'act-8',
          badge: '合作重建',
          text: '请小伙伴帮忙递积木，一起搭一艘新飞船',
          type: 'connect',
        },
      ],
    },
  },
  {
    id: 'diff-friend-ask',
    title: '同学好奇问：“你爸爸/妈妈怎么没来？”',
    tag: '社交边界 · 隐私自己做主',
    desc: '放学时别的小朋友随口问了一句，心里突然纠结不知道该说多少。',
    defaultContent: {
      shortLabel: '同伴追问',
      subtitle: '守住隐私边界 · 想说多少自己定',
      stoneHeadline: '同学好奇问：“你爸爸/妈妈怎么没来？”',
      entrySpeech:
        '同学随口问家里事的时候，你拥有隐私决定权：想简单答一句、想礼貌换话题，或者不想回答都可以！',
      fenItems: {
        fact: '已知事实：放学时同学随口问了一句关于家里接送的话。',
        feeling: '身体感受：胸口轻轻缩了一下，不知道该不该把家里的事全说出来。',
        guess:
          '[未证实猜测] “我是不是必须把大人的事全讲清楚，不然别人会觉得我奇怪？”',
        guessCategoryLabel: '未证实的脑中猜测',
      },
      tongPerspective: {
        lensName: '天上的眼睛 & 隐私盾牌镜',
        frontStuckPoint: '以为别人问什么就必须回答什么，心里很有压力。',
        shiftContent:
          '同学多半只是随口好奇，就像问“今天吃什么点心”一样；而且家里的私事本来就归我自己决定说不说。',
        silverLining:
          '用一句简短的话回应或直接去玩滑梯，既礼貌又守住了自己的舒服边界！',
        tongSpeech:
          '家里的事由你自己做主说多少！你可以简短回答一句，也可以礼貌说先去玩滑梯。',
      },
      availableActions: [
        {
          id: 'act-9',
          badge: '轻描淡写',
          text: '简短回应一句：“今天是我妈妈/爸爸来接我”',
          type: 'action',
        },
        {
          id: 'act-10',
          badge: '礼貌边界',
          text: '温和守住边界：“这是我们家的事，我想先去玩滑梯啦”',
          type: 'boundary',
        },
        {
          id: 'act-11',
          badge: '转移注意',
          text: '牵起接我的大人的手，聊聊今晚吃什么好吃的',
          type: 'connect',
        },
        {
          id: 'act-12',
          badge: '寻求支持',
          text: '如果有人一直追问起哄，直接转身告诉信任的老师',
          type: 'safety',
          isSafetyAction: true,
        },
      ],
    },
  },
];

export const DifficultyBreakerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { unlockMedal, personalization, updatePersonalization } = useApp();

  const [selectedPresetId, setSelectedPresetId] = useState<string>('diff-two-homes');
  const [transitionSubId, setTransitionSubId] =
    useState<BreakerTransitionSubBranchId>('sub_dual_attachment');
  const [currentStep, setCurrentStep] = useState<'pick' | 'fen' | 'tong' | 'ze' | 'complete'>(
    'pick'
  );

  // Step 1: 分 (revealed parts)
  const [fenRevealed, setFenRevealed] = useState<{
    fact: boolean;
    feeling: boolean;
    guess: boolean;
  }>({
    fact: false,
    feeling: false,
    guess: false,
  });

  // Step 2: 通 (lens flipped)
  const [isCoinFlipped, setIsCoinFlipped] = useState<boolean>(false);

  // Step 3: 择 (3 stepping stones slots + voluntary pause)
  const [steppingStones, setSteppingStones] = useState<Array<BreakerActionItem | null>>([
    null,
    null,
    null,
  ]);
  const [pausedVoluntarily, setPausedVoluntarily] = useState<boolean>(false);

  const [isSpeaking, setIsSpeaking] = useState<boolean>(speechNarrator.getSpeaking());
  const [karaoke, setKaraoke] = useState<KaraokeSyncState>(speechNarrator.getKaraokeState());
  const [lastSpokenText, setLastSpokenText] = useState<string>(
    BREAKER_FIXED_VOICE_LINES.ENTRY_GREETING
  );

  const activeCompanion =
    ANIMAL_COMPANIONS[personalization.companionId] || ANIMAL_COMPANIONS.guoguo_squirrel;
  const activeVoiceProfileId =
    COMPANION_TO_VOICE_PROFILE[activeCompanion.id as CompanionVoiceId] || 'playful-buddy';
  const activeVoiceCfg = VOICE_PROFILES[activeVoiceProfileId];

  const activePreset =
    PRESET_DIFFICULTIES.find((p) => p.id === selectedPresetId) || PRESET_DIFFICULTIES[0];

  const activeContent: BreakerStageContent =
    activePreset.id === 'diff-two-homes' && activePreset.subBranches
      ? activePreset.subBranches[transitionSubId]
      : activePreset.defaultContent;

  useEffect(() => {
    const unsubscribe = speechNarrator.subscribe(() => {
      setIsSpeaking(speechNarrator.getSpeaking());
      setKaraoke(speechNarrator.getKaraokeState());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    speechNarrator.syncWithCompanion(activeCompanion.id);
    setLastSpokenText(BREAKER_FIXED_VOICE_LINES.ENTRY_GREETING);
    speechNarrator.speak(BREAKER_FIXED_VOICE_LINES.ENTRY_GREETING, undefined, undefined, {
      speakerId: activeCompanion.id,
      sceneId: 'difficulty_breaker',
      emotionTone: 'gentle-inquiry',
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const speakWithCompanion = (
    text: string,
    tone: EmotionProsodyTone = 'warm-dual-empathy'
  ) => {
    setLastSpokenText(text);
    speechNarrator.speak(text, undefined, undefined, {
      speakerId: activeCompanion.id,
      sceneId: 'difficulty_breaker',
      emotionTone: tone,
    });
  };

  const handleSwitchCompanionInline = (nextCompanionId: CompanionVoiceId) => {
    updatePersonalization({ companionId: nextCompanionId });
    speechNarrator.switchCompanion(nextCompanionId);
  };

  const resetBreakerScenarioProgressToFen = () => {
    setFenRevealed({ fact: false, feeling: false, guess: false });
    setIsCoinFlipped(false);
    setSteppingStones([null, null, null]);
    setPausedVoluntarily(false);
    setCurrentStep('fen');
  };

  const handlePickPreset = (presetId: string, subBranchOverride?: BreakerTransitionSubBranchId) => {
    sounds.playClick();
    setSelectedPresetId(presetId);
    const targetSub = subBranchOverride || transitionSubId;
    if (subBranchOverride) {
      setTransitionSubId(subBranchOverride);
    }
    resetBreakerScenarioProgressToFen();

    const presetObj = PRESET_DIFFICULTIES.find((p) => p.id === presetId) || PRESET_DIFFICULTIES[0];
    const stageObj =
      presetObj.id === 'diff-two-homes' && presetObj.subBranches
        ? presetObj.subBranches[targetSub]
        : presetObj.defaultContent;
    speakWithCompanion(stageObj.entrySpeech, 'warm-dual-empathy');
  };

  const handleSwitchTransitionSubBranch = (subId: BreakerTransitionSubBranchId) => {
    sounds.playClick();
    setTransitionSubId(subId);
    resetBreakerScenarioProgressToFen();
    const subContent = TRANSITION_SUB_BRANCHES[subId];
    speakWithCompanion(
      subContent.entrySpeech,
      subId === 'sub_ordinary_transition'
        ? 'light-everyday'
        : subId === 'sub_specific_concern'
          ? 'protective-safety'
          : 'warm-dual-empathy'
    );
  };

  const handleToggleFenPiece = (piece: 'fact' | 'feeling' | 'guess') => {
    sounds.playBell();
    setFenRevealed((prev) => {
      const nextVal = !prev[piece];
      if (nextVal) {
        speakWithCompanion(
          activeContent.fenItems[piece],
          piece === 'fact' ? 'calm-fact-clarity' : 'warm-dual-empathy'
        );
      }
      return { ...prev, [piece]: nextVal };
    });
  };

  const handlePlaceAction = (action: BreakerActionItem, slotIndex?: number) => {
    sounds.playScaleClink();
    setPausedVoluntarily(false);
    setSteppingStones((prev) => {
      const next = [...prev];
      if (typeof slotIndex === 'number') {
        next[slotIndex] = action;
      } else {
        const firstEmpty = next.findIndex((item) => item === null);
        if (firstEmpty !== -1) {
          next[firstEmpty] = action;
        } else {
          next[2] = action;
        }
      }
      return next;
    });
    speakWithCompanion(
      action.text,
      action.isSafetyAction ? 'protective-safety' : 'light-everyday'
    );
  };

  const handleRemoveStone = (index: number) => {
    sounds.playClick();
    setSteppingStones((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const placedStonesCount = steppingStones.filter(Boolean).length;
  // 允许孩子选 1~3 个踏脚石即可完成，不强迫必须凑满多步
  const isStep3Ready = placedStonesCount >= 1;

  const activeSubtitleText =
    isSpeaking && karaoke.fullText ? karaoke.fullText : lastSpokenText;

  return (
    <div
      data-testid="difficulty-breaker-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto"
    >
      <div className="bg-amber-50/98 border-2 border-amber-300 rounded-3xl p-3 sm:p-5 max-w-3xl w-full shadow-2xl relative my-auto text-stone-800 max-h-[95dvh] overflow-y-auto space-y-2.5">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 w-12 h-12 min-w-[48px] min-h-[48px] flex items-center justify-center text-stone-500 hover:text-stone-800 rounded-full hover:bg-amber-100 transition-colors z-20 cursor-pointer"
          aria-label="关闭拆解台"
        >
          <X className="w-6 h-6" />
        </button>

        {/* ================= 顶部标题与原创矢量徽章（零裸 Emoji 豆腐块） ================= */}
        <div className="flex items-center gap-3 pr-12">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center shadow-inner shrink-0 p-1.5">
            <svg viewBox="0 0 56 56" className="w-full h-full" aria-hidden="true">
              {/* 魔法木槌与三颗发光小晶石 */}
              <rect
                x="24"
                y="22"
                width="7"
                height="26"
                rx="3.5"
                transform="rotate(-35 27 35)"
                fill="#B45309"
              />
              <rect
                x="10"
                y="10"
                width="26"
                height="14"
                rx="4"
                transform="rotate(-35 23 17)"
                fill="#F59E0B"
                stroke="#78350F"
                strokeWidth="2.2"
              />
              <circle cx="14" cy="44" r="5" fill="#34D399" stroke="#065F46" strokeWidth="1.8" />
              <circle cx="28" cy="46" r="5" fill="#FB7185" stroke="#881337" strokeWidth="1.8" />
              <circle cx="42" cy="42" r="5" fill="#38BDF8" stroke="#0C4A6E" strokeWidth="1.8" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-xl font-black text-stone-900">
                大困难变小魔法拆解台
              </h3>
              <span className="text-xs bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-full font-extrabold border border-amber-300">
                分 · 通 · 择
              </span>
            </div>
            <p className="text-xs text-stone-600 font-medium mt-0.5">
              遇到头绪多或心里打结的事，先看清事实与感受，换个镜头看，再挑一两步小踏脚石。
            </p>
          </div>
        </div>

        {/* ================= 四伙伴全域声音与字幕同步栏 ================= */}
        <div
          data-testid="breaker-companion-bar"
          data-companion-id={activeCompanion.id}
          data-voice-profile={activeVoiceProfileId}
          className={`p-2 sm:p-2.5 rounded-2xl border-2 bg-white/95 shadow-2xs space-y-1.5 ${activeCompanion.themeColorBorder}`}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${activeCompanion.themeColorBg} ${activeCompanion.themeColorBorder}`}
              >
                <CompanionAvatarSvg companionId={activeCompanion.id} className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  data-testid="breaker-companion-name"
                  className="text-xs sm:text-sm font-black text-stone-900"
                >
                  {activeCompanion.name}陪你拆解
                </span>
                <span
                  data-testid="breaker-voice-badge"
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300"
                >
                  {activeVoiceCfg.companionName} · {activeVoiceCfg.neuralVoiceId}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap" aria-label="切换拆解台伙伴角色">
              {BREAKER_COMPANION_ORDER.map((compId) => {
                const comp = ANIMAL_COMPANIONS[compId];
                const isSelected = compId === activeCompanion.id;
                return (
                  <button
                    key={compId}
                    type="button"
                    data-testid={`breaker-companion-switch-${compId}`}
                    onClick={() => handleSwitchCompanionInline(compId)}
                    className={`min-h-[44px] min-w-[44px] px-3 py-1 rounded-xl text-xs font-black border cursor-pointer ${
                      isSelected
                        ? 'bg-amber-200 text-amber-950 border-amber-600 shadow-2xs'
                        : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    {comp.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            data-testid="breaker-companion-subtitle"
            className="px-2.5 py-1.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-xs font-bold text-stone-800 leading-snug flex items-center justify-between gap-2"
          >
            <span className="flex-1">{activeSubtitleText}</span>
            <button
              type="button"
              data-testid="breaker-replay-speech"
              onClick={() => speakWithCompanion(lastSpokenText)}
              className="min-h-[44px] min-w-[44px] px-3 py-1 rounded-xl bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-black shrink-0 flex items-center justify-center gap-1 cursor-pointer"
              aria-label="重听拆解台语音"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>重听</span>
            </button>
          </div>
        </div>

        {/* ================= 步骤进度导航栏（高对比度即时切换） ================= */}
        {currentStep !== 'pick' && (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-amber-100/80 rounded-2xl border-2 border-amber-200">
              <button
                type="button"
                data-testid="breaker-step-tab-fen"
                onClick={() => setCurrentStep('fen')}
                className={`min-h-[44px] px-2 py-1.5 rounded-xl font-black text-xs sm:text-sm text-center cursor-pointer border-2 ${
                  currentStep === 'fen'
                    ? 'bg-sky-100 text-sky-950 border-sky-600 shadow-xs'
                    : 'bg-white/80 text-stone-700 border-transparent hover:border-amber-300'
                }`}
                aria-label="第一步：看清大石头"
              >
                1. 看清石头 (分)
              </button>
              <button
                type="button"
                data-testid="breaker-step-tab-tong"
                onClick={() => setCurrentStep('tong')}
                className={`min-h-[44px] px-2 py-1.5 rounded-xl font-black text-xs sm:text-sm text-center cursor-pointer border-2 ${
                  currentStep === 'tong'
                    ? 'bg-emerald-100 text-emerald-950 border-emerald-600 shadow-xs'
                    : 'bg-white/80 text-stone-700 border-transparent hover:border-amber-300'
                }`}
                aria-label="第二步：换个位置看"
              >
                2. 换位置看 (通)
              </button>
              <button
                type="button"
                data-testid="breaker-step-tab-ze"
                onClick={() => setCurrentStep('ze')}
                className={`min-h-[44px] px-2 py-1.5 rounded-xl font-black text-xs sm:text-sm text-center cursor-pointer border-2 ${
                  currentStep === 'ze'
                    ? 'bg-amber-100 text-amber-950 border-amber-600 shadow-xs'
                    : 'bg-white/80 text-stone-700 border-transparent hover:border-amber-300'
                }`}
                aria-label="第三步：选踏脚石"
              >
                3. 选踏脚石 (择)
              </button>
            </div>

            {/* 当选择换家主题时，展示 4 个多维子情境切换栏（彻底消除“换家必然害怕睡不着”单一预设） */}
            {selectedPresetId === 'diff-two-homes' && (
              <div
                data-testid="breaker-transition-sub-selector"
                className="bg-white/95 p-2 rounded-2xl border-2 border-teal-200 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-black text-teal-950 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-teal-700 shrink-0" />
                    <span>换地方住时，你现在更像哪一种情况？（点选切换，不预设害怕）：</span>
                  </span>
                  <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    支持复杂心意与日常轻松过渡
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(
                    Object.keys(TRANSITION_SUB_BRANCHES) as BreakerTransitionSubBranchId[]
                  ).map((subKey) => {
                    const branch = TRANSITION_SUB_BRANCHES[subKey];
                    const isSubActive = transitionSubId === subKey;
                    return (
                      <button
                        key={subKey}
                        type="button"
                        data-testid={`breaker-sub-${subKey}`}
                        aria-pressed={isSubActive}
                        onClick={() => handleSwitchTransitionSubBranch(subKey)}
                        className={`min-h-[46px] px-2.5 py-1.5 rounded-xl border-2 text-left cursor-pointer flex flex-col justify-between ${
                          isSubActive
                            ? 'bg-teal-100 text-teal-950 border-teal-600 shadow-2xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-teal-300'
                        }`}
                      >
                        <span className="text-xs font-black">{branch.shortLabel}</span>
                        <span
                          className={`text-[11px] leading-tight ${
                            isSubActive ? 'text-teal-900 font-bold' : 'text-stone-600'
                          }`}
                        >
                          {branch.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 0: 挑选大石头困难 (PICK) ================= */}
        {currentStep === 'pick' && (
          <div data-testid="breaker-step-pick" className="space-y-2.5">
            <div className="bg-white p-3 rounded-2xl border-2 border-amber-200 flex items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-black text-stone-900">
                  选一块你想拆解的生活情况：
                </h4>
                <p className="text-xs text-stone-600 mt-0.5">
                  不管是两处生活的不同头绪、积木倒了，还是同伴追问，都可以拆成清楚的小步骤。
                </p>
              </div>
              <button
                type="button"
                onClick={() => speakWithCompanion(BREAKER_FIXED_VOICE_LINES.ENTRY_GREETING)}
                className="min-w-[48px] min-h-[48px] p-2 rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 flex items-center justify-center cursor-pointer shrink-0 border border-amber-300"
                aria-label="听一听挑选困难提示"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid gap-2">
              {PRESET_DIFFICULTIES.map((p) => (
                <div
                  key={p.id}
                  data-testid={`breaker-preset-card-${p.id}`}
                  className="p-3 rounded-2xl bg-white border-2 border-amber-200 hover:border-amber-500 transition-all shadow-2xs space-y-2"
                >
                  <button
                    type="button"
                    data-testid={`breaker-pick-${p.id}`}
                    onClick={() => handlePickPreset(p.id)}
                    className="w-full text-left flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 p-2">
                      {p.id === 'diff-two-homes' && (
                        <svg viewBox="0 0 40 40" className="w-full h-full" aria-hidden="true">
                          <path d="M4 28 Q20 14 36 28" stroke="#0D9488" strokeWidth="4" fill="none" strokeLinecap="round" />
                          <polygon points="4,18 11,11 18,18" fill="#F59E0B" />
                          <rect x="6" y="18" width="10" height="8" rx="1.5" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
                          <polygon points="22,18 29,11 36,18" fill="#0284C7" />
                          <rect x="24" y="18" width="10" height="8" rx="1.5" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
                        </svg>
                      )}
                      {p.id === 'diff-blocks-broken' && (
                        <svg viewBox="0 0 40 40" className="w-full h-full" aria-hidden="true">
                          <rect x="6" y="22" width="12" height="10" rx="2" fill="#F87171" stroke="#991B1B" strokeWidth="1.5" />
                          <rect x="21" y="24" width="13" height="8" rx="2" fill="#60A5FA" stroke="#1E3A8A" strokeWidth="1.5" />
                          <polygon points="14,10 24,18 10,20" fill="#FBBF24" stroke="#92400E" strokeWidth="1.5" />
                        </svg>
                      )}
                      {p.id === 'diff-friend-ask' && (
                        <svg viewBox="0 0 40 40" className="w-full h-full" aria-hidden="true">
                          <path d="M20 6 L33 12 V21 C33 28 27 33 20 35 C13 33 7 28 7 21 V12 Z" fill="#A7F3D0" stroke="#047857" strokeWidth="2" />
                          <circle cx="20" cy="20" r="5" fill="#047857" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-black text-stone-900">
                          {p.title}
                        </span>
                        <span className="text-xs bg-amber-100 text-amber-950 border border-amber-300 px-2.5 py-0.5 rounded-full font-black flex items-center gap-1">
                          <span>开始拆解</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <span className="inline-block text-[11px] font-bold text-teal-900 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md mt-1">
                        {p.tag}
                      </span>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">{p.desc}</p>
                    </div>
                  </button>

                  {/* 换家主题卡片内直接展示 4 个子情境快捷入口 */}
                  {p.id === 'diff-two-homes' && (
                    <div className="pt-2 border-t border-amber-100 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {(
                        Object.keys(TRANSITION_SUB_BRANCHES) as BreakerTransitionSubBranchId[]
                      ).map((subKey) => {
                        const sub = TRANSITION_SUB_BRANCHES[subKey];
                        return (
                          <button
                            key={subKey}
                            type="button"
                            data-testid={`breaker-pick-sub-${subKey}`}
                            onClick={() => handlePickPreset('diff-two-homes', subKey)}
                            className="min-h-[42px] px-2.5 py-1.5 rounded-xl bg-teal-50/80 hover:bg-teal-100 border border-teal-200 text-left cursor-pointer"
                          >
                            <div className="text-xs font-black text-teal-950">{sub.shortLabel}</div>
                            <div className="text-[11px] text-teal-800">{sub.subtitle}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= STEP 1: 分 (2.5D 可直接触控拆分晶石舞台 + 三块卡片) ================= */}
        {currentStep === 'fen' && (
          <div data-testid="breaker-step-fen" className="space-y-2.5">
            {/* 2.5D 交互式拆分大石头 SVG 舞台 */}
            <div
              data-testid="breaker-svg-stage-fen"
              className="bg-white rounded-2xl border-2 border-sky-200 p-2.5 shadow-2xs space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-sky-950 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-300">
                    第 1 步 · 分：看清事实、感受与脑中想法
                  </span>
                  <h4
                    data-testid="breaker-active-headline"
                    className="text-sm sm:text-base font-black text-stone-900"
                  >
                    “{activeContent.stoneHeadline}”
                  </h4>
                </div>
                <span className="text-xs font-black text-sky-900 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                  已敲开{' '}
                  {[fenRevealed.fact, fenRevealed.feeling, fenRevealed.guess].filter(Boolean)
                    .length}{' '}
                  / 3 块
                </span>
              </div>

              <div className="rounded-2xl overflow-hidden bg-linear-to-b from-sky-50 via-amber-50/50 to-stone-100 border border-stone-200">
                <svg
                  viewBox="0 0 640 126"
                  className="w-full h-28 sm:h-30 block select-none"
                  role="img"
                  aria-label="可敲开的三块原石拆解舞台"
                >
                  {/* 木工拆解台立体桌面 */}
                  <polygon points="36,98 604,98 620,108 20,108" fill="#F59E0B" opacity="0.35" />
                  <rect
                    x="20"
                    y="102"
                    width="600"
                    height="16"
                    rx="6"
                    fill="#D97706"
                    stroke="#92400E"
                    strokeWidth="2.2"
                  />

                  {/* 左块：已知事实晶石 (可点击) */}
                  <g
                    onClick={() => handleToggleFenPiece('fact')}
                    className="cursor-pointer"
                    transform={fenRevealed.fact ? 'translate(-10, -5)' : 'translate(0, 0)'}
                  >
                    <polygon
                      points="75,100 98,28 210,22 225,100"
                      fill={fenRevealed.fact ? '#A7F3D0' : '#E7E5E4'}
                      stroke={fenRevealed.fact ? '#059669' : '#78716C'}
                      strokeWidth="2.8"
                      strokeLinejoin="round"
                    />
                    {/* 顶部高光切面 */}
                    <polygon
                      points="98,28 210,22 198,42 108,44"
                      fill={fenRevealed.fact ? '#D1FAE5' : '#F5F5F4'}
                      opacity="0.85"
                    />
                    <text
                      x="152"
                      y="64"
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="bold"
                      fill={fenRevealed.fact ? '#064E3B' : '#44403C'}
                    >
                      1. 已知事实
                    </text>
                    <text
                      x="152"
                      y="85"
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill={fenRevealed.fact ? '#047857' : '#57534E'}
                    >
                      {fenRevealed.fact ? '✓ 已看清真事' : '● 点我敲开'}
                    </text>
                  </g>

                  {/* 中块：身体与心里感受晶石 (可点击) */}
                  <g
                    onClick={() => handleToggleFenPiece('feeling')}
                    className="cursor-pointer"
                    transform={fenRevealed.feeling ? 'translate(0, -8)' : 'translate(0, 0)'}
                  >
                    <polygon
                      points="242,100 258,20 382,20 398,100"
                      fill={fenRevealed.feeling ? '#FECDD3' : '#D6D3D1'}
                      stroke={fenRevealed.feeling ? '#E11D48' : '#78716C'}
                      strokeWidth="2.8"
                      strokeLinejoin="round"
                    />
                    <polygon
                      points="258,20 382,20 370,38 270,38"
                      fill={fenRevealed.feeling ? '#FFE4E6' : '#E7E5E4'}
                      opacity="0.85"
                    />
                    <text
                      x="320"
                      y="62"
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="bold"
                      fill={fenRevealed.feeling ? '#881337' : '#44403C'}
                    >
                      2. 真实感受
                    </text>
                    <text
                      x="320"
                      y="83"
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill={fenRevealed.feeling ? '#BE123C' : '#57534E'}
                    >
                      {fenRevealed.feeling ? '✓ 已接纳感受' : '● 点我敲开'}
                    </text>
                  </g>

                  {/* 右块：脑中想法或未证实猜测晶石 (可点击) */}
                  <g
                    onClick={() => handleToggleFenPiece('guess')}
                    className="cursor-pointer"
                    transform={fenRevealed.guess ? 'translate(10, -5)' : 'translate(0, 0)'}
                  >
                    <polygon
                      points="415,100 430,22 542,28 565,100"
                      fill={fenRevealed.guess ? '#FDE68A' : '#E7E5E4'}
                      stroke={fenRevealed.guess ? '#D97706' : '#78716C'}
                      strokeWidth="2.8"
                      strokeLinejoin="round"
                    />
                    <polygon
                      points="430,22 542,28 532,44 442,42"
                      fill={fenRevealed.guess ? '#FEF3C7' : '#F5F5F4'}
                      opacity="0.85"
                    />
                    <text
                      x="488"
                      y="64"
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="bold"
                      fill={fenRevealed.guess ? '#78350F' : '#44403C'}
                    >
                      3. 想法/猜测
                    </text>
                    <text
                      x="488"
                      y="85"
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill={fenRevealed.guess ? '#B45309' : '#57534E'}
                    >
                      {fenRevealed.guess ? '✓ 已分清边界' : '● 点我敲开'}
                    </text>
                  </g>
                </svg>
              </div>
            </div>

            {/* 三块可敲开详情卡片（桌面端三列直接对应上方三块晶石，移动端单列舒展） */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* 1. 事实 */}
              <button
                type="button"
                data-testid="breaker-fen-fact"
                aria-pressed={fenRevealed.fact}
                onClick={() => handleToggleFenPiece('fact')}
                className={`p-3 rounded-2xl border-2 text-left cursor-pointer flex flex-col justify-between ${
                  fenRevealed.fact
                    ? 'bg-emerald-100/90 border-emerald-600 text-emerald-950 shadow-xs'
                    : 'bg-white border-emerald-300 hover:border-emerald-500 text-stone-800'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 border border-emerald-500 text-emerald-950 flex items-center justify-center shrink-0">
                        <Eye className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs font-black text-emerald-950">
                        1. 分出事实
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-black px-2 py-0.5 rounded-lg shrink-0 border ${
                        fenRevealed.fact
                          ? 'bg-emerald-200 text-emerald-950 border-emerald-600'
                          : 'bg-amber-100 text-amber-950 border-amber-300'
                      }`}
                    >
                      {fenRevealed.fact ? '✓ 已看清' : '点我敲开'}
                    </span>
                  </div>
                  <p
                    className={`text-xs leading-relaxed ${
                      fenRevealed.fact ? 'text-emerald-950 font-bold' : 'text-stone-500 font-medium'
                    }`}
                  >
                    {fenRevealed.fact
                      ? activeContent.fenItems.fact
                      : '点一下敲开这块石头，看看哪些是真正发生、看得见的客观事实。'}
                  </p>
                </div>
              </button>

              {/* 2. 感受 */}
              <button
                type="button"
                data-testid="breaker-fen-feeling"
                aria-pressed={fenRevealed.feeling}
                onClick={() => handleToggleFenPiece('feeling')}
                className={`p-3 rounded-2xl border-2 text-left cursor-pointer flex flex-col justify-between ${
                  fenRevealed.feeling
                    ? 'bg-rose-100/90 border-rose-600 text-rose-950 shadow-xs'
                    : 'bg-white border-rose-300 hover:border-rose-500 text-stone-800'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-rose-100 border border-rose-500 text-rose-950 flex items-center justify-center shrink-0">
                        <Heart className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs font-black text-rose-950">
                        2. 分出感受
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-black px-2 py-0.5 rounded-lg shrink-0 border ${
                        fenRevealed.feeling
                          ? 'bg-rose-200 text-rose-950 border-rose-600'
                          : 'bg-amber-100 text-amber-950 border-amber-300'
                      }`}
                    >
                      {fenRevealed.feeling ? '✓ 已接纳' : '点我敲开'}
                    </span>
                  </div>
                  <p
                    className={`text-xs leading-relaxed ${
                      fenRevealed.feeling ? 'text-rose-950 font-bold' : 'text-stone-500 font-medium'
                    }`}
                  >
                    {fenRevealed.feeling
                      ? activeContent.fenItems.feeling
                      : '点一下看看身体和心里现在有什么感觉（可以同时有两种感觉，也可以很轻松）。'}
                  </p>
                </div>
              </button>

              {/* 3. 想法或未证实猜测 */}
              <button
                type="button"
                data-testid="breaker-fen-guess"
                aria-pressed={fenRevealed.guess}
                onClick={() => handleToggleFenPiece('guess')}
                className={`p-3 rounded-2xl border-2 text-left cursor-pointer flex flex-col justify-between ${
                  fenRevealed.guess
                    ? 'bg-amber-100/90 border-amber-600 text-amber-950 shadow-xs'
                    : 'bg-white border-amber-300 hover:border-amber-500 text-stone-800'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-amber-100 border border-amber-500 text-amber-950 flex items-center justify-center shrink-0">
                        <Compass className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs font-black text-amber-950 truncate">
                        3. {activeContent.fenItems.guessCategoryLabel}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-black px-2 py-0.5 rounded-lg shrink-0 border ${
                        fenRevealed.guess
                          ? 'bg-amber-200 text-amber-950 border-amber-600'
                          : 'bg-amber-100 text-amber-950 border-amber-300'
                      }`}
                    >
                      {fenRevealed.guess ? '✓ 已分清' : '点我敲开'}
                    </span>
                  </div>
                  <p
                    className={`text-xs leading-relaxed ${
                      fenRevealed.guess ? 'text-amber-950 font-bold' : 'text-stone-500 font-medium'
                    }`}
                  >
                    {fenRevealed.guess
                      ? activeContent.fenItems.guess
                      : '点一下识别脑海里的疑问或对大人心情的猜测，不把猜测当成确定事实。'}
                  </p>
                </div>
              </button>
            </div>

            <div className="flex justify-between items-center pt-0.5 gap-2">
              <button
                type="button"
                data-testid="breaker-back-to-pick"
                onClick={() => setCurrentStep('pick')}
                className="min-h-[48px] px-3.5 py-2 text-xs sm:text-sm font-black text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 flex items-center gap-1.5 rounded-xl cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> 换个生活情况
              </button>
              <button
                type="button"
                data-testid="breaker-next-to-tong"
                onClick={() => {
                  sounds.playBell();
                  setCurrentStep('tong');
                  speakWithCompanion(activeContent.tongPerspective.tongSpeech, 'warm-dual-empathy');
                }}
                className="min-h-[48px] px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>分清楚了，去换镜头（通）</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: 通 (换个镜头翻转看) ================= */}
        {currentStep === 'tong' && (
          <div data-testid="breaker-step-tong" className="space-y-4">
            <div
              data-testid="breaker-svg-stage-tong"
              className="bg-emerald-50/90 p-3.5 rounded-2xl border-2 border-emerald-300 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-black text-emerald-950 bg-emerald-200/80 px-2.5 py-0.5 rounded-full">
                  第 2 步 · 通：转动双面透镜，换个角度看看
                </span>
                <span className="text-xs font-bold text-emerald-900">
                  当前镜头：{activeContent.tongPerspective.lensName}
                </span>
              </div>

              {/* 2.5D 双面透镜 SVG 交互区 */}
              <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-emerald-200">
                <button
                  type="button"
                  data-testid="breaker-flip-lens-btn"
                  onClick={() => {
                    sounds.playCoinFlip();
                    const nextFlipped = !isCoinFlipped;
                    setIsCoinFlipped(nextFlipped);
                    speakWithCompanion(
                      nextFlipped
                        ? activeContent.tongPerspective.silverLining
                        : activeContent.tongPerspective.shiftContent,
                      'warm-dual-empathy'
                    );
                  }}
                  className="w-28 h-28 rounded-2xl bg-linear-to-b from-amber-100 to-emerald-100 border-2 border-emerald-500 shadow-xs flex flex-col items-center justify-center p-2 text-center cursor-pointer shrink-0"
                >
                  <svg viewBox="0 0 64 64" className="w-12 h-12" aria-hidden="true">
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      fill={isCoinFlipped ? '#FEF3C7' : '#D1FAE5'}
                      stroke="#059669"
                      strokeWidth="3.5"
                    />
                    {isCoinFlipped ? (
                      <>
                        <circle cx="24" cy="28" r="5" fill="#F59E0B" />
                        <circle cx="40" cy="28" r="5" fill="#0284C7" />
                        <path
                          d="M20 42 Q32 50 44 42"
                          stroke="#065F46"
                          strokeWidth="3"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </>
                    ) : (
                      <>
                        <circle cx="32" cy="32" r="12" fill="#34D399" opacity="0.35" />
                        <path
                          d="M20 32 H44 M32 20 V44"
                          stroke="#065F46"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </>
                    )}
                  </svg>
                  <span className="text-[11px] font-black text-emerald-950 mt-1">
                    {isCoinFlipped ? '已翻转 · 新发现' : '点我翻转透镜'}
                  </span>
                </button>

                <div className="flex-1 space-y-2 text-xs sm:text-sm">
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <div className="font-black text-stone-700 text-xs">
                      原本容易卡住的想法：
                    </div>
                    <p className="text-stone-600 mt-0.5 leading-snug">
                      {activeContent.tongPerspective.frontStuckPoint}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300">
                    <div className="font-black text-emerald-950 flex items-center gap-1.5 text-xs">
                      <Eye className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>换到【{activeContent.tongPerspective.lensName}】看：</span>
                    </div>
                    <p className="text-emerald-950 font-bold mt-1 leading-relaxed">
                      {activeContent.tongPerspective.shiftContent}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300">
                    <div className="font-black text-amber-950 flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>解开纠结的小发现：</span>
                    </div>
                    <p className="text-amber-950 font-bold mt-1 leading-relaxed">
                      {activeContent.tongPerspective.silverLining}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep('fen')}
                className="min-h-[48px] px-3.5 py-2 text-xs sm:text-sm font-black text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 flex items-center gap-1.5 rounded-xl cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> 上一步：分一分
              </button>
              <button
                type="button"
                data-testid="breaker-next-to-ze"
                onClick={() => {
                  sounds.playBell();
                  setCurrentStep('ze');
                }}
                className="min-h-[52px] px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>去挑舒服的小踏脚石（择）</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: 择 (踏脚石小路 + 允许选 1~3 步或主动暂停) ================= */}
        {currentStep === 'ze' && (
          <div data-testid="breaker-step-ze" className="space-y-3.5">
            <div className="bg-amber-100/80 p-3 rounded-2xl border-2 border-amber-300 flex items-center justify-between gap-2 flex-wrap">
              <div>
                <span className="text-xs sm:text-sm font-black text-amber-950">
                  第 3 步 · 择：挑 1~3 块你觉得舒服的小踏脚石（也可以先休息）
                </span>
                <p className="text-xs text-stone-700 mt-0.5">
                  点选下方你愿意尝试的小动作放进溪流踏脚石，哪怕只选 1 步也可以出发！
                </p>
              </div>
              <button
                type="button"
                data-testid="breaker-pause-btn"
                onClick={() => {
                  sounds.playClick();
                  setPausedVoluntarily(true);
                  speakWithCompanion(BREAKER_FIXED_VOICE_LINES.PAUSE_SPEECH, 'gentle-inquiry');
                }}
                className="min-h-[38px] px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-black flex items-center gap-1 cursor-pointer shrink-0"
              >
                <PauseCircle className="w-4 h-4" />
                <span>先停下休息/暂不选</span>
              </button>
            </div>

            {pausedVoluntarily && (
              <div
                data-testid="breaker-paused-banner"
                className="p-3 rounded-2xl bg-teal-50 border-2 border-teal-300 text-xs font-bold text-teal-950 flex items-center justify-between gap-2"
              >
                <span>
                  你选择了先停下来休息一会儿。不用勉强马上做决定，随时可以继续或直接离开拆解台。
                </span>
              </div>
            )}

            {/* 三块踏脚石插槽 */}
            <div
              data-testid="breaker-svg-stage-ze"
              className="grid grid-cols-3 gap-2"
            >
              {[0, 1, 2].map((slotIdx) => {
                const stone = steppingStones[slotIdx];
                return (
                  <div
                    key={slotIdx}
                    data-testid={`breaker-stone-slot-${slotIdx}`}
                    className={`min-h-[92px] p-2.5 rounded-2xl border-2 flex flex-col justify-between text-center ${
                      stone
                        ? stone.isSafetyAction
                          ? 'bg-rose-100 border-rose-600 text-rose-950 shadow-xs'
                          : 'bg-amber-100/90 border-amber-600 text-amber-950 shadow-xs'
                        : 'bg-white/70 border-dashed border-amber-300 text-stone-400'
                    }`}
                  >
                    {stone ? (
                      <>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-black px-1.5 py-0.5 rounded-md bg-white/90">
                            第 {slotIdx + 1} 步 · {stone.badge}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveStone(slotIdx)}
                            className="text-stone-500 hover:text-rose-700 font-black px-1 cursor-pointer"
                            aria-label={`移除第${slotIdx + 1}步`}
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-xs font-black leading-snug line-clamp-2 my-1">
                          {stone.text}
                        </p>
                      </>
                    ) : (
                      <div className="my-auto flex flex-col items-center justify-center">
                        <Footprints className="w-5 h-5 mb-1 opacity-60" />
                        <span className="text-xs font-black text-stone-600">
                          踏脚石 {slotIdx + 1}
                        </span>
                        <span className="text-[10px] text-stone-500">点下方卡片放入</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 备选小动作池 */}
            <div className="grid sm:grid-cols-2 gap-2">
              {activeContent.availableActions.map((act) => {
                const isUsed = steppingStones.some((s) => s?.id === act.id);
                return (
                  <button
                    key={act.id}
                    type="button"
                    data-testid={`breaker-action-${act.id}`}
                    aria-pressed={isUsed}
                    onClick={() => handlePlaceAction(act)}
                    disabled={isUsed}
                    className={`min-h-[54px] p-3 rounded-2xl border-2 text-left flex items-center justify-between gap-2 cursor-pointer ${
                      isUsed
                        ? 'bg-teal-100 border-teal-600 text-teal-950'
                        : act.isSafetyAction
                          ? 'bg-rose-50 hover:bg-rose-100 border-rose-400 text-rose-950'
                          : 'bg-white hover:bg-amber-50 border-stone-200 hover:border-amber-400 text-stone-800'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {act.isSafetyAction && (
                          <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
                        )}
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 border border-amber-300">
                          {act.badge}
                        </span>
                      </div>
                      <p className="text-xs font-black leading-snug">{act.text}</p>
                    </div>
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-xl shrink-0 border ${
                        isUsed
                          ? 'bg-teal-200 text-teal-950 border-teal-600'
                          : 'bg-amber-100 text-amber-950 border-amber-300'
                      }`}
                    >
                      {isUsed ? '✓ 已放入' : '+ 放入'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-1 gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep('tong')}
                className="min-h-[48px] px-3.5 py-2 text-xs sm:text-sm font-black text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 flex items-center gap-1.5 rounded-xl cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> 上一步：通一通
              </button>

              <button
                type="button"
                data-testid="breaker-complete-btn"
                disabled={!isStep3Ready}
                onClick={() => {
                  sounds.playBell();
                  unlockMedal('breaker-master');
                  unlockMedal('action-pioneer');
                  setCurrentStep('complete');
                  speakWithCompanion(BREAKER_FIXED_VOICE_LINES.COMPLETE_SPEECH, 'light-everyday');
                }}
                className="min-h-[52px] px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>选好踏脚石啦（已选 {placedStonesCount} 步）</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: 拆解完成总结（当前伙伴同步鼓励） ================= */}
        {currentStep === 'complete' && (
          <div data-testid="breaker-step-complete" className="text-center py-3 space-y-4">
            <div className="w-16 h-16 bg-amber-100 border-2 border-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm p-2">
              <CompanionAvatarSvg companionId={activeCompanion.id} className="w-12 h-12" />
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-black text-stone-900">
                踏脚石铺好啦！你可以按自己的节奏迈步
              </h3>
              <p className="text-xs text-stone-600 mt-1 max-w-md mx-auto">
                刚才在「{activeContent.stoneHeadline}」里，你选出的小踏脚石是：
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border-2 border-emerald-400 text-left space-y-2 max-w-md mx-auto shadow-2xs">
              {steppingStones.filter(Boolean).map((st, idx) => (
                <div key={st!.id} className="flex items-center gap-2.5 text-xs text-stone-900">
                  <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-black text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 border border-amber-300 shrink-0">
                    {st!.badge}
                  </span>
                  <span className="font-bold">{st!.text}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-amber-100/80 rounded-2xl border border-amber-300 text-xs font-bold text-amber-950 max-w-md mx-auto">
              {activeCompanion.name}：“{BREAKER_FIXED_VOICE_LINES.COMPLETE_SPEECH}”
            </div>

            <div className="flex gap-2.5 justify-center pt-1 max-w-md mx-auto">
              <button
                type="button"
                data-testid="breaker-reset-btn"
                onClick={() => {
                  sounds.playClick();
                  setCurrentStep('pick');
                }}
                className="flex-1 min-h-[48px] py-2.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-black rounded-xl text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                <span>拆解另一个情况</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 min-h-[48px] py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs sm:text-sm shadow-sm cursor-pointer flex items-center justify-center"
              >
                完成拆解，回小岛
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
