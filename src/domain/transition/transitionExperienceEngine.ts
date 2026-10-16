// 晴雨小岛 · 分支式换家体验与多维心理认知引擎 V1.0
// 核心原则：
// 1. 移除“换家必然害怕/焦虑”、“两个家一样温暖/爱一样多”、“必须拥抱/写信/装安心玩偶”的单一预设路径；
// 2. 遵循六步引导链路：现在有什么感觉 -> 是什么事情让你这样想 -> 哪些是已经知道的 -> 你希望发生什么 -> 可以尝试什么 -> 结果怎样；
// 3. 完整支持三条核心 Vertical Slices（Slice A 双向不舍 / Slice B 忠诚冲突 / Slice C 具体害怕与担忧）+ 普通轻松过渡路径；
// 4. 不从一个情绪标签直接推断家庭事实或心理状态，不做临床诊断，不生成虚构心理改善分数。

export type TransitionContextMode = 'story_experience' | 'own_life_practice';

export type TransitionSliceId =
  | 'SLICE_A_BIDIRECTIONAL_ATTACHMENT'
  | 'SLICE_B_LOYALTY_CONFLICT'
  | 'SLICE_C_SPECIFIC_FEAR_OR_CONCERN'
  | 'ORDINARY_HAPPY_TRANSITION';

export type TransitionFeelingId =
  | 'miss_current_place'
  | 'look_forward_other_place'
  | 'happy_relaxed_to_go'
  | 'happy_here_worry_other_adult'
  | 'unfamiliar_or_dislike_one_place'
  | 'scared_or_uneasy'
  | 'unsure_or_skip';

export type ThoughtCategory =
  | 'known_fact'
  | 'guess_about_adult_or_future'
  | 'open_question'
  | 'personal_preference';

export interface TransitionThoughtItem {
  id: string;
  text: string;
  category: ThoughtCategory;
  /** 孩子在忠诚冲突/认知分辨中将其归入的类别 */
  childClassifiedAs?: 'known_fact' | 'guess_about_adult_or_future' | null;
  explanationText: string;
}

export type RelationshipConcernType =
  | 'none'
  | 'bidirectional_attachment'
  | 'worry_other_adult_sad'
  | 'pressure_to_pass_messages'
  | 'dislike_or_unfamiliar_with_one_place';

export type PracticalConcernType =
  | 'none'
  | 'separation_reluctance'
  | 'schedule_uncertainty'
  | 'unfamiliar_environment_or_habits'
  | 'missing_familiar_items'
  | 'unsure_unspoken_reason';

export type SafetyConcernStatus =
  | 'none'
  | 'unconfirmed'
  | 'specific_person_or_harm_behavior';

export type PlacePreferenceAttitude =
  | 'like_both_places'
  | 'dislike_or_unadapted_to_one_place'
  | 'still_observing_differences';

export type SpecificFearReasonId =
  | 'reason_separation_reluctance'
  | 'reason_schedule_uncertainty'
  | 'reason_unfamiliar_environment'
  | 'reason_specific_person_or_behavior'
  | 'reason_unsure_or_dont_want_to_say';

export type TransitionActionId =
  // Slice A Actions (双向不舍)
  | 'action_quiet_wave_no_hug_no_letter'
  | 'action_carry_both_stars_together'
  | 'action_fist_bump_see_you_soon'
  // Slice B Actions (忠诚冲突)
  | 'action_allow_joy_release_adult_worry'
  | 'action_decline_messenger_role'
  | 'action_keep_honest_place_preference'
  // Slice C Actions (具体害怕与担忧 - 非伤害类)
  | 'action_check_schedule_signpost'
  | 'action_pack_habit_card_or_nightlight'
  | 'action_confirm_reunion_stone'
  | 'action_sit_quietly_no_explanation'
  // Slice C Safety Actions (涉及具体人或伤害行为时的安全保护路线)
  | 'action_tell_trusted_adult_immediately'
  | 'action_stay_in_safe_place_with_help'
  // Ordinary Happy Transition Action (普通轻松换家)
  | 'action_cross_bridge_lightheartedly';

export type NextAttemptDecision =
  | 'try_another_way'
  | 'stay_quiet_or_pause'
  | 'switch_slice'
  | 'finish_current_exploration';

export type EmotionProsodyTone =
  | 'warm-dual-empathy'
  | 'calm-fact-clarity'
  | 'gentle-inquiry'
  | 'protective-safety'
  | 'light-everyday';

export interface TransitionObservedOutcome {
  actionId: TransitionActionId;
  sceneVisualChangeSummary: string;
  companionFeedbackSpeech: string;
  realisticPossibleWorldNote: string;
  trainedCognitiveSkill: string;
  usedOrdinaryRitual: boolean;
  isSafetyProtectionRoute: boolean;
}

export interface TransitionInteractiveObjectState {
  // Slice A interactive objects
  westStarLit: boolean;
  eastStarLit: boolean;
  bridgePaceMode: 'slow_pause' | 'steady_walk' | null;
  backpackMode: 'dual_star_badge' | 'empty_light_pack' | 'small_drawing' | null;
  declineHug: boolean;
  declineLetter: boolean;
  // Slice B interactive objects
  classifiedFactBubble: 'known_fact' | 'guess_about_adult_or_future' | null;
  classifiedGuessBubble: 'known_fact' | 'guess_about_adult_or_future' | null;
  responsibilityFenceRaised: boolean;
  placeAttitude: PlacePreferenceAttitude | null;
  guessDirectlyClaimedAsFactBlocked: boolean;
  // Slice C interactive objects
  investigatedFearReason: SpecificFearReasonId | null;
  illuminatedSignpost: boolean;
  tappedNightlight: boolean;
  tappedReunionStone: boolean;
  satOnQuietBench: boolean;
  safetyShieldActivated: boolean;
  // Ordinary happy path object
  everydayItemPicked: 'sketchbook' | 'soccer_ball' | 'none' | null;
}

export interface TransitionExperienceState {
  context: TransitionContextMode;
  activeSliceId: TransitionSliceId;
  feelingSet: TransitionFeelingId[];
  thoughtSet: TransitionThoughtItem[];
  relationshipConcern: RelationshipConcernType;
  practicalConcern: PracticalConcernType;
  safetyConcern: SafetyConcernStatus;
  wishGoal: string | null;
  chosenAction: TransitionActionId | null;
  observedOutcome: TransitionObservedOutcome | null;
  nextAttempt: NextAttemptDecision | null;
  interactiveObjects: TransitionInteractiveObjectState;
  actionHistory: TransitionActionId[];
  attemptCount: number;
  revisionCount: number;
  pausedVoluntarily: boolean;
  isAnxietySoothingTriggered: boolean;
  ordinaryRitualsBlockedBySafety: boolean;
  emotionProsodyTone: EmotionProsodyTone;
  currentCompanionSpeech: string;
}

/**
 * 供 scripts/generate-tts-assets.py 合成四角色预制神经语音及单元测试校验的固定台词表
 */
export const TRANSITION_FIXED_VOICE_LINES = {
  ENTRY_GREETING:
    '这里是双向桥小驿。去另一边住的时候，每个人心里可能会有不一样的感受，也可能平平常常。先点点看你现在有什么感觉吧！',
  NEUTRAL_FIRST_ENTRY:
    '这里是双向桥小驿。今天去另一边住，你是觉得轻松开心、有点舍不得、担心别人的感受、有些害怕或说不清，还是想先听一个小朋友的故事呢？',
  STORY_MODE_ENTRY:
    '我们来看看小朋友乐乐过桥的故事吧！你可以帮乐乐点点看他遇到了什么情况。',

  // Ordinary / Happy Path (Counterexample #2)
  ORDINARY_ENTRY:
    '今天去另一边心情挺轻松！换地方住不一定都会害怕，你可以直接点点桥上的路标或带一件日常物品，轻快过桥。',
  ORDINARY_OUTCOME:
    '你选了平时爱玩的日常物品，迈着轻松的步子走过小桥。今天就是普通又顺畅的一天！',

  // Slice A: 双向不舍
  SLICE_A_ENTRY:
    '一边舍不得离开现在的地方，一边又期待去另一边，这两种感觉可以同时待在心里，不需要二选一。',
  SLICE_A_WEST_STAR:
    '点亮左岸想念星：我舍不得这边的照顾者和熟悉的小角落。',
  SLICE_A_EAST_STAR:
    '点亮右岸期待星：我也想念另一边的照顾者，期待那边的故事。',
  SLICE_A_BOTH_STARS:
    '两颗小星星同时亮在桥中央啦！你可以同时想念两边，不用灭掉任何一颗星。',
  SLICE_A_STEPPING_STONES:
    '踩踩桥上的慢步石：过桥的时候不用急着奔跑，可以按自己的步子慢慢走。',
  SLICE_A_BACKPACK:
    '打开随身小背包：你可以装进双星小徽章，也可以什么特别信物都不带，轻装走过去。',
  SLICE_A_OUTCOME_NO_HUG_NO_LETTER:
    '你选择了不抱抱、也不写信，只轻轻点点头安静走过小桥。不想拥抱或不想马上笑出来完全没关系，你的节奏被尊重。',
  SLICE_A_OUTCOME_BOTH_STARS:
    '你把两颗想念星一起收进随身小袋里。带着对两边的喜欢过桥，心里不用做选择题。',
  SLICE_A_OUTCOME_FIST_BUMP:
    '你和身边的大人轻轻碰了碰小拳头，说声过几天见，按自己的步子踏上小桥。',

  // Slice B: 忠诚冲突
  SLICE_B_ENTRY:
    '在这边玩得很开心，却突然担心另一边的大人会不会孤单难过？我们用分界镜来看看，哪些是真事，哪些是心里的猜测。',
  SLICE_B_FACT_BUBBLE:
    '放进已知事实盘：我今天在这边玩拼图笑了，这是真实发生的事，开心不是做错事。',
  SLICE_B_GUESS_BUBBLE:
    '放进猜测云朵：觉得另一边的大人一定在伤心怪你，这只是脑海里的猜测，不是已经确定的事实。',
  SLICE_B_FENCE:
    '立起责任小围栏：大人的心情和大人之间的沟通属于大人的责任圈，不需要小孩子来哄或传话。',
  SLICE_B_ATTITUDE_LIKE_BOTH:
    '你觉得两边都有好玩的地方，两边都可以喜欢。',
  SLICE_B_ATTITUDE_DISLIKE_ONE:
    '你觉得对其中一个地方不太喜欢或不太习惯。这也是真实的感受，没有人规定你必须觉得两个地方一样好。',
  SLICE_B_OUTCOME_ALLOW_JOY:
    '你把大人的情绪放回大人的责任圈，允许自己安心玩耍。就算大人有时需要时间消化，你也不用背负内疚。',
  SLICE_B_OUTCOME_DECLINE_MESSENGER:
    '你练习对大人说：请你们直接在手机上商量吧，我不想当传话筒。守住小边界后，心里轻快多啦。',
  SLICE_B_OUTCOME_HONEST_PREFERENCE:
    '你保留了对不同地方的真实喜欢与不习惯，不逼自己说两个地方一样好的违心话。',

  // Slice C: 具体害怕与担忧
  SLICE_C_ENTRY:
    '心里觉得有点害怕或七上八下时，我们先不急着塞玩偶。先点点路标，看看是什么具体原因让你担心，或者也可以先不说。',
  SLICE_C_REASON_SEPARATION:
    '你发现自己是舍不得分开的那一刻。我们可以看看下次见面的约定石。',
  SLICE_C_REASON_SCHEDULE:
    '你发现自己是因为不知道哪天去、什么时候回来才心慌。我们可以点亮日历路标问清楚时间。',
  SLICE_C_REASON_UNFAMILIAR:
    '你发现自己是对另一边的陌生床铺或生活规矩不习惯。我们可以准备一张习惯说明小卡。',
  SLICE_C_REASON_UNSURE:
    '暂时说不清楚原因，或者现在不想回答，完全可以！我们坐在桥边安静长椅上歇一会儿，不追问你。',
  SLICE_C_REASON_HARM_SAFETY:
    '你提到有具体的人或行为让你害怕受伤害。这时候绝不能靠装小书包或勉强拥抱解决，保护你的安全最重要！',
  SLICE_C_OUTCOME_SCHEDULE:
    '你向大人问清楚了接送的日子和钟点。虽然计划偶尔会有小变动，但知道安排后心里更有底了。',
  SLICE_C_OUTCOME_HABIT:
    '你把自己的睡前小习惯告诉了大人，带上了熟悉的小夜灯，给自己留出慢慢适应的时间。',
  SLICE_C_OUTCOME_REUNION:
    '你确认了下次见面的具体约定。分开只是暂时的，不用强迫自己立刻不难过。',
  SLICE_C_OUTCOME_QUIET_BENCH:
    '你在桥边长椅上安安静静坐了一会儿。没有被强迫选原因，可以等想说的时候再说。',
  SLICE_C_OUTCOME_SAFETY_TELL_ADULT:
    '你启动了安全护盾：拒绝普通的换家安抚仪式，立即向信任的安全大人或老师求助，清楚说出我在那边觉得不安全。',
  SLICE_C_OUTCOME_SAFETY_STAY_SAFE:
    '你选择留在安全明亮的地方，请信任的大人陪在身边保护你，绝不勉强自己独自面对危险。',

  // Common Retry / Pause / Utility
  PAUSE_VOLUNTARILY:
    '今天先体验到这里，我们随时可以停下来休息，或者去小岛别的地方玩。',
  RETRY_ANOTHER_WAY:
    '我们换一种做法再试一次，看看这次会有什么不一样的结果！',
  OPTIONAL_TOOLS_NOTE:
    '小书包、日历和想念盒都在工具抽屉里，需要时随时可以用，不需要时也不用勉强打卡。',
} as const;

export interface FeelingOptionMeta {
  id: TransitionFeelingId;
  label: string;
  shortTag: string;
  recommendedSlice: TransitionSliceId;
}

export const TRANSITION_FEELING_OPTIONS: FeelingOptionMeta[] = [
  {
    id: 'miss_current_place',
    label: '舍不得现在住的地方',
    shortTag: '不舍得这边',
    recommendedSlice: 'SLICE_A_BIDIRECTIONAL_ATTACHMENT',
  },
  {
    id: 'look_forward_other_place',
    label: '也期待去另一边看看',
    shortTag: '也期待那边',
    recommendedSlice: 'SLICE_A_BIDIRECTIONAL_ATTACHMENT',
  },
  {
    id: 'happy_here_worry_other_adult',
    label: '在这边很开心，但担心另一边的大人孤单难过',
    shortTag: '开心又怕大人难过',
    recommendedSlice: 'SLICE_B_LOYALTY_CONFLICT',
  },
  {
    id: 'unfamiliar_or_dislike_one_place',
    label: '对其中一个地方不太喜欢，或者还不太习惯',
    shortTag: '对一边不习惯/不喜欢',
    recommendedSlice: 'SLICE_B_LOYALTY_CONFLICT',
  },
  {
    id: 'scared_or_uneasy',
    label: '心里有点害怕、七上八下',
    shortTag: '有点害怕/担心',
    recommendedSlice: 'SLICE_C_SPECIFIC_FEAR_OR_CONCERN',
  },
  {
    id: 'unsure_or_skip',
    label: '现在说不清楚，或者不想选原因',
    shortTag: '说不清/先不选',
    recommendedSlice: 'SLICE_C_SPECIFIC_FEAR_OR_CONCERN',
  },
  {
    id: 'happy_relaxed_to_go',
    label: '今天开开心心、平平静静去另一边',
    shortTag: '轻松愉快过桥',
    recommendedSlice: 'ORDINARY_HAPPY_TRANSITION',
  },
];

export interface SpecificFearReasonMeta {
  id: SpecificFearReasonId;
  title: string;
  childPrompt: string;
  knownFactText: string;
  wishGoalText: string;
  practicalConcern: PracticalConcernType;
  safetyConcern: SafetyConcernStatus;
  companionSpeech: string;
  recommendedActionIds: TransitionActionId[];
}

export const SPECIFIC_FEAR_REASONS: Record<SpecificFearReasonId, SpecificFearReasonMeta> = {
  reason_separation_reluctance: {
    id: 'reason_separation_reluctance',
    title: '舍不得分开的那一刻',
    childPrompt: '只是刚分开时鼻头酸酸的，舍不得现在身边的人',
    knownFactText: '已知事实：分开只是暂时的，到了约定日期还会再见面。',
    wishGoalText: '我希望清楚知道下次哪天再见面，并按自己舒服的方式告别。',
    practicalConcern: 'separation_reluctance',
    safetyConcern: 'none',
    companionSpeech: TRANSITION_FIXED_VOICE_LINES.SLICE_C_REASON_SEPARATION,
    recommendedActionIds: ['action_confirm_reunion_stone', 'action_quiet_wave_no_hug_no_letter'],
  },
  reason_schedule_uncertainty: {
    id: 'reason_schedule_uncertainty',
    title: '不知道日程怎么安排',
    childPrompt: '不确定要去住几天、谁来接我、什么时候回来',
    knownFactText: '已知事实：接送时间和住几晚是可以向大人问清楚的具体安排。',
    wishGoalText: '我希望提前看清日程路标，知道哪天去、哪天回。',
    practicalConcern: 'schedule_uncertainty',
    safetyConcern: 'none',
    companionSpeech: TRANSITION_FIXED_VOICE_LINES.SLICE_C_REASON_SCHEDULE,
    recommendedActionIds: ['action_check_schedule_signpost'],
  },
  reason_unfamiliar_environment: {
    id: 'reason_unfamiliar_environment',
    title: '对新环境或陌生习惯不适应',
    childPrompt: '另一边的枕头、关灯习惯或规矩跟这边不一样，睡不踏实',
    knownFactText: '已知事实：两个地方的生活习惯确实不同，觉得陌生并不是我的错。',
    wishGoalText: '我希望能留一盏熟悉的小夜灯，或者把我的小习惯告诉大人。',
    practicalConcern: 'unfamiliar_environment_or_habits',
    safetyConcern: 'none',
    companionSpeech: TRANSITION_FIXED_VOICE_LINES.SLICE_C_REASON_UNFAMILIAR,
    recommendedActionIds: ['action_pack_habit_card_or_nightlight'],
  },
  reason_unsure_or_dont_want_to_say: {
    id: 'reason_unsure_or_dont_want_to_say',
    title: '不想回答或暂时说不清楚',
    childPrompt: '心里闷闷的，但现在找不到词说，或者不想选上面的原因',
    knownFactText: '已知事实：说不清原因也是完全正常的，没有人可以强迫我必须立刻回答。',
    wishGoalText: '我希望先在安静长椅上休息，不被追问。',
    practicalConcern: 'unsure_unspoken_reason',
    safetyConcern: 'unconfirmed',
    companionSpeech: TRANSITION_FIXED_VOICE_LINES.SLICE_C_REASON_UNSURE,
    recommendedActionIds: ['action_sit_quietly_no_explanation'],
  },
  reason_specific_person_or_behavior: {
    id: 'reason_specific_person_or_behavior',
    title: '担心某个具体的人或伤害行为',
    childPrompt: '那边有人凶我、打人、吓唬我，或者做让我身体不舒服、害怕的事',
    knownFactText: '已知安全底线：任何时候，我的身体安全和不受伤害都排在第一位！',
    wishGoalText: '我希望立刻得到安全的保护，向信任的大人或老师求助。',
    practicalConcern: 'none',
    safetyConcern: 'specific_person_or_harm_behavior',
    companionSpeech: TRANSITION_FIXED_VOICE_LINES.SLICE_C_REASON_HARM_SAFETY,
    recommendedActionIds: [
      'action_tell_trusted_adult_immediately',
      'action_stay_in_safe_place_with_help',
    ],
  },
};

export interface TransitionActionMeta {
  id: TransitionActionId;
  sliceId: TransitionSliceId;
  label: string;
  subtitle: string;
  declinesHugOrLetter?: boolean;
  isSafetyAction?: boolean;
  outcome: TransitionObservedOutcome;
}

export const TRANSITION_ACTIONS: Record<TransitionActionId, TransitionActionMeta> = {
  // Slice A Actions
  action_quiet_wave_no_hug_no_letter: {
    id: 'action_quiet_wave_no_hug_no_letter',
    sliceId: 'SLICE_A_BIDIRECTIONAL_ATTACHMENT',
    label: '不抱抱也不写信，轻轻点头安静过桥',
    subtitle: '允许自己现在不想拥抱、不想写卡片，也不用假装立刻很开心',
    declinesHugOrLetter: true,
    outcome: {
      actionId: 'action_quiet_wave_no_hug_no_letter',
      sceneVisualChangeSummary: '桥面亮起柔和的静谧星光，小身影按自己的慢步子平稳走过木桥，不需要勉强拥抱或写信。',
      companionFeedbackSpeech: TRANSITION_FIXED_VOICE_LINES.SLICE_A_OUTCOME_NO_HUG_NO_LETTER,
      realisticPossibleWorldNote: '现实可能结果：有时候大人会问“怎么不抱一下”，你可以温和说“我现在想安静走过去”。',
      trainedCognitiveSkill: '自主设定身体与情感表达边界，理解过渡不需要强颜欢笑或固定仪式',
      usedOrdinaryRitual: false,
      isSafetyProtectionRoute: false,
    },
  },
  action_carry_both_stars_together: {
    id: 'action_carry_both_stars_together',
    sliceId: 'SLICE_A_BIDIRECTIONAL_ATTACHMENT',
    label: '把两颗想念星同时揣进小口袋',
    subtitle: '一边装着对这边的舍不得，一边装着对那边的期待，不用二选一',
    outcome: {
      actionId: 'action_carry_both_stars_together',
      sceneVisualChangeSummary: '左岸琥珀星与右岸青空星同时升上拱桥灯柱，小背包里亮起双星徽章。',
      companionFeedbackSpeech: TRANSITION_FIXED_VOICE_LINES.SLICE_A_OUTCOME_BOTH_STARS,
      realisticPossibleWorldNote: '现实可能结果：到了另一边后，你可能还是会偶尔想起前一边，这很自然，两边都可以挂念。',
      trainedCognitiveSkill: '容纳双向复杂情感（不舍与期待并存），打破非黑即白的“二选一”思维',
      usedOrdinaryRitual: true,
      isSafetyProtectionRoute: false,
    },
  },
  action_fist_bump_see_you_soon: {
    id: 'action_fist_bump_see_you_soon',
    sliceId: 'SLICE_A_BIDIRECTIONAL_ATTACHMENT',
    label: '轻轻碰碰小拳头说“过几天见”',
    subtitle: '用简短利落的小动作告别，背上小包出发',
    outcome: {
      actionId: 'action_fist_bump_see_you_soon',
      sceneVisualChangeSummary: '桥头亮起温暖的约定路灯，角色轻快地踏上木桥石阶。',
      companionFeedbackSpeech: TRANSITION_FIXED_VOICE_LINES.SLICE_A_OUTCOME_FIST_BUMP,
      realisticPossibleWorldNote: '现实可能结果：简短告别能帮你在分开那一刻少一点拉扯，按约定时间再见面。',
      trainedCognitiveSkill: '自主选择适合自己的过渡告别方式',
      usedOrdinaryRitual: true,
      isSafetyProtectionRoute: false,
    },
  },

  // Slice B Actions
  action_allow_joy_release_adult_worry: {
    id: 'action_allow_joy_release_adult_worry',
    sliceId: 'SLICE_B_LOYALTY_CONFLICT',
    label: '把大人的心情放回大人圈，允许自己安心玩',
    subtitle: '我在这边开心是事实，另一边大人会不会难过只是猜测，不是我的责任',
    outcome: {
      actionId: 'action_allow_joy_release_adult_worry',
      sceneVisualChangeSummary: '分界镜将“猜测云”移到责任围栏外，孩子身边的游乐星光重新亮起。',
      companionFeedbackSpeech: TRANSITION_FIXED_VOICE_LINES.SLICE_B_OUTCOME_ALLOW_JOY,
      realisticPossibleWorldNote: '现实可能结果：大人有时候也有自己的情绪起伏，需要时间自己调节，但那不是因为你玩得开心做错了事。',
      trainedCognitiveSkill: '区分“已知事实”与“对成人感受的猜测”，划清儿童与成人的情绪责任边界',
      usedOrdinaryRitual: false,
      isSafetyProtectionRoute: false,
    },
  },
  action_decline_messenger_role: {
    id: 'action_decline_messenger_role',
    sliceId: 'SLICE_B_LOYALTY_CONFLICT',
    label: '不当传话筒：“大人的事请你们在手机上说吧”',
    subtitle: '表达关心，但拒绝替两边大人传话、打听或调解矛盾',
    outcome: {
      actionId: 'action_decline_messenger_role',
      sceneVisualChangeSummary: '责任小围栏稳稳亮起金色护栏，传话信封被退回大人沟通通道。',
      companionFeedbackSpeech: TRANSITION_FIXED_VOICE_LINES.SLICE_B_OUTCOME_DECLINE_MESSENGER,
      realisticPossibleWorldNote: '现实可能结果：大人听到后可能一时会愣住，不一定马上完全理解，但你不需要替大人解决他们之间的分歧。',
      trainedCognitiveSkill: '拒绝三角化传话与成人关系调解任务，保护儿童心理边界',
      usedOrdinaryRitual: false,
      isSafetyProtectionRoute: false,
    },
  },
  action_keep_honest_place_preference: {
    id: 'action_keep_honest_place_preference',
    sliceId: 'SLICE_B_LOYALTY_CONFLICT',
    label: '保留真实感受：不强迫自己说“两个地方一样好”',
    subtitle: '可以喜欢一边多一点，也可以对另一边还不习惯，诚实面对自己的感受',
    outcome: {
      actionId: 'action_keep_honest_place_preference',
      sceneVisualChangeSummary: '两座小屋显示各自不同的真实色彩与规矩标签，不再贴上“必须一模一样”的贴纸。',
      companionFeedbackSpeech: TRANSITION_FIXED_VOICE_LINES.SLICE_B_OUTCOME_HONEST_PREFERENCE,
      realisticPossibleWorldNote: '现实可能结果：两个地方的饭菜、规矩和气氛本来就不一样，允许自己慢慢观察或向信任的大人说出哪里不习惯。',
      trainedCognitiveSkill: '接纳对不同生活环境的真实偏好差异，摆脱“必须觉得两边完全一样好”的讨好压力',
      usedOrdinaryRitual: false,
      isSafetyProtectionRoute: false,
    },
  },

  // Slice C Actions (Non-harm specific reasons)
  action_check_schedule_signpost: {
    id: 'action_check_schedule_signpost',
    sliceId: 'SLICE_C_SPECIFIC_FEAR_OR_CONCERN',
    label: '点亮日程路标：向大人问清哪天去、哪天回、谁来接',
    subtitle: '用具体的日期和接送安排代替心里乱糟糟的瞎猜',
    outcome: {
      actionId: 'action_check_schedule_signpost',
      sceneVisualChangeSummary: '桥头的日历路标牌亮起清晰的去程与返程标记。',
      companionFeedbackSpeech: TRANSITION_FIXED_VOICE_LINES.SLICE_C_OUTCOME_SCHEDULE,
      realisticPossibleWorldNote: '现实可能结果：大人写下日程后心里会清楚很多；如果遇到临时变化，也可以请大人提前告诉你。',
      trainedCognitiveSkill: '针对“信息不确定”寻找具体事实支持，将模糊焦虑转化为可核实的日程问题',
      usedOrdinaryRitual: true,
      isSafetyProtectionRoute: false,
    },
  },
  action_pack_habit_card_or_nightlight: {
    id: 'action_pack_habit_card_or_nightlight',
    sliceId: 'SLICE_C_SPECIFIC_FEAR_OR_CONCERN',
    label: '带上熟悉小夜灯或习惯小卡，说出不习惯的地方',
    subtitle: '告诉大人“我怕黑想留小夜灯”或“这个新规矩我还不太适应”',
    outcome: {
      actionId: 'action_pack_habit_card_or_nightlight',
      sceneVisualChangeSummary: '右侧小屋窗台亮起温暖的小夜灯，床头贴上了睡眠习惯小卡片。',
      companionFeedbackSpeech: TRANSITION_FIXED_VOICE_LINES.SLICE_C_OUTCOME_HABIT,
      realisticPossibleWorldNote: '现实可能结果：大人可能先帮你调整小夜灯或被子，有些规矩需要一起商量，不用逼自己一天就完全习惯。',
      trainedCognitiveSkill: '识别环境适应中的具体需求，并用具体语言向照护者表达',
      usedOrdinaryRitual: true,
      isSafetyProtectionRoute: false,
    },
  },
  action_confirm_reunion_stone: {
    id: 'action_confirm_reunion_stone',
    sliceId: 'SLICE_C_SPECIFIC_FEAR_OR_CONCERN',
    label: '摸摸重逢约定石，确认下次见面的时间',
    subtitle: '允许自己分开时有点舍不得，同时记住下次见面的真实约定',
    outcome: {
      actionId: 'action_confirm_reunion_stone',
      sceneVisualChangeSummary: '桥头的重逢约定石亮起微光，连接起分开与重逢的时间线。',
      companionFeedbackSpeech: TRANSITION_FIXED_VOICE_LINES.SLICE_C_OUTCOME_REUNION,
      realisticPossibleWorldNote: '现实可能结果：知道下次什么时候见面后，想念还在，但不会觉得是永远见不到了。',
      trainedCognitiveSkill: '区分“暂时分开”与“永远失去”，建立客体恒常与重逢预期',
      usedOrdinaryRitual: true,
      isSafetyProtectionRoute: false,
    },
  },
  action_sit_quietly_no_explanation: {
    id: 'action_sit_quietly_no_explanation',
    sliceId: 'SLICE_C_SPECIFIC_FEAR_OR_CONCERN',
    label: '坐在桥边长椅安静歇一会儿，现在不解释原因',
    subtitle: '说不清为什么害怕、或者不想回答时，允许先安静待着',
    declinesHugOrLetter: true,
    outcome: {
      actionId: 'action_sit_quietly_no_explanation',
      sceneVisualChangeSummary: '桥边木长椅洒下柔和树影，动物伙伴安安静静坐在旁边，没有任何催促气泡。',
      companionFeedbackSpeech: TRANSITION_FIXED_VOICE_LINES.SLICE_C_OUTCOME_QUIET_BENCH,
      realisticPossibleWorldNote: '现实可能结果：你可以告诉大人“我现在还说不清楚，想先静一静”，等准备好了再说。',
      trainedCognitiveSkill: '觉察并接纳“暂时说不清”的状态，保护自己在未准备好时的表达自主权',
      usedOrdinaryRitual: false,
      isSafetyProtectionRoute: false,
    },
  },

  // Slice C Safety Protection Actions (Counterexample #7)
  action_tell_trusted_adult_immediately: {
    id: 'action_tell_trusted_adult_immediately',
    sliceId: 'SLICE_C_SPECIFIC_FEAR_OR_CONCERN',
    label: '启动安全护盾：立即向信任的大人或老师求助',
    subtitle: '清楚告诉安全的照顾者、老师或警察叔叔：“那边有人伤害我/让我害怕，我需要保护”',
    isSafetyAction: true,
    outcome: {
      actionId: 'action_tell_trusted_adult_immediately',
      sceneVisualChangeSummary: '场景升起醒目的金色安全护盾，普通换家书包与拥抱仪式全部停用，点亮现实安全求助通道。',
      companionFeedbackSpeech: TRANSITION_FIXED_VOICE_LINES.SLICE_C_OUTCOME_SAFETY_TELL_ADULT,
      realisticPossibleWorldNote: '重要安全原则：当涉及具体伤害、打人或危险行为时，绝不用装玩偶、深呼吸或勉强拥抱来掩盖问题，必须由信任的成年人介入保护。',
      trainedCognitiveSkill: '区分“普通适应担忧”与“具体安全伤害”，在面临伤害风险时拒绝常规安抚并启动现实求助',
      usedOrdinaryRitual: false,
      isSafetyProtectionRoute: true,
    },
  },
  action_stay_in_safe_place_with_help: {
    id: 'action_stay_in_safe_place_with_help',
    sliceId: 'SLICE_C_SPECIFIC_FEAR_OR_CONCERN',
    label: '留在安全明亮的地方，请信任的大人陪在身边',
    subtitle: '不独自面对让我害怕的人，直接走到安全的大人身边请求保护',
    isSafetyAction: true,
    outcome: {
      actionId: 'action_stay_in_safe_place_with_help',
      sceneVisualChangeSummary: '安全护盾环绕角色，安全灯塔点亮，暂停一切普通换家交接步骤。',
      companionFeedbackSpeech: TRANSITION_FIXED_VOICE_LINES.SLICE_C_OUTCOME_SAFETY_STAY_SAFE,
      realisticPossibleWorldNote: '重要安全原则：你的身体安全永远高于日常日程安排，感到危险时有权停下并要求安全大人的保护。',
      trainedCognitiveSkill: '优先保障人身安全与现实保护行动',
      usedOrdinaryRitual: false,
      isSafetyProtectionRoute: true,
    },
  },

  // Ordinary Happy Transition Action (Counterexample #2)
  action_cross_bridge_lightheartedly: {
    id: 'action_cross_bridge_lightheartedly',
    sliceId: 'ORDINARY_HAPPY_TRANSITION',
    label: '带着日常小画本或小足球，轻快走过小桥',
    subtitle: '今天心情轻松，不需要做焦虑安抚，像平时出门一样自然过桥',
    outcome: {
      actionId: 'action_cross_bridge_lightheartedly',
      sceneVisualChangeSummary: '阳光洒在木桥上，角色带着日常小物品轻快走过桥面，没有任何焦虑安抚弹窗。',
      companionFeedbackSpeech: TRANSITION_FIXED_VOICE_LINES.ORDINARY_OUTCOME,
      realisticPossibleWorldNote: '现实可能结果：很多时候换地方住只是一件普通的日常小事，开心自然地过去就好。',
      trainedCognitiveSkill: '识别平稳轻松的日常过渡状态，不被预设焦虑标签干扰',
      usedOrdinaryRitual: false,
      isSafetyProtectionRoute: false,
    },
  },
};

export function createInitialInteractiveObjectState(): TransitionInteractiveObjectState {
  return {
    westStarLit: false,
    eastStarLit: false,
    bridgePaceMode: null,
    backpackMode: null,
    declineHug: false,
    declineLetter: false,
    classifiedFactBubble: null,
    classifiedGuessBubble: null,
    responsibilityFenceRaised: false,
    placeAttitude: null,
    guessDirectlyClaimedAsFactBlocked: false,
    investigatedFearReason: null,
    illuminatedSignpost: false,
    tappedNightlight: false,
    tappedReunionStone: false,
    satOnQuietBench: false,
    safetyShieldActivated: false,
    everydayItemPicked: null,
  };
}

export function createDefaultThoughtsForSlice(sliceId: TransitionSliceId): TransitionThoughtItem[] {
  switch (sliceId) {
    case 'SLICE_A_BIDIRECTIONAL_ATTACHMENT':
      return [
        {
          id: 'thought_a_fact_both_matter',
          text: '我舍不得这边的照顾者，同时也期待去另一边，这两种感觉都是真的。',
          category: 'known_fact',
          explanationText: '已知事实：人的心里可以同时装着对两个地方的想念，不需要二选一。',
        },
        {
          id: 'thought_a_guess_must_choose',
          text: '“我是不是必须只选一边喜欢，或者出门时必须笑眯眯拥抱？”',
          category: 'open_question',
          explanationText: '思考发现：你不需要做选择题，也可以自己决定要不要拥抱、要不要写信。',
        },
      ];
    case 'SLICE_B_LOYALTY_CONFLICT':
      return [
        {
          id: 'thought_b_fact_joy_here',
          text: '我今天在这边玩拼图笑了，度过了开心的一下午。',
          category: 'known_fact',
          childClassifiedAs: null,
          explanationText: '已知事实：这是你亲身经历的真实事情，玩得开心绝对不是做错事。',
        },
        {
          id: 'thought_b_guess_adult_sad',
          text: '“另一边的大人现在一定在家里偷偷伤心，觉得我不爱他了。”',
          category: 'guess_about_adult_or_future',
          childClassifiedAs: null,
          explanationText: '未证实的猜测：我们没有顺风耳和透视眼，另一边大人此刻怎么想只是我们的猜测，不能直接当成事实。',
        },
        {
          id: 'thought_b_pref_different',
          text: '我对两个地方的喜欢程度或习惯程度可以不一样。',
          category: 'personal_preference',
          explanationText: '真实偏好：不需要强迫自己说“两个地方一样好”。',
        },
      ];
    case 'SLICE_C_SPECIFIC_FEAR_OR_CONCERN':
      return [
        {
          id: 'thought_c_question_why',
          text: '让我心里七上八下的具体原因是什么？还是我现在暂时说不清楚？',
          category: 'open_question',
          explanationText: '先弄清具体原因（或允许自己暂时说不清），才能找到真正管用的办法。',
        },
      ];
    case 'ORDINARY_HAPPY_TRANSITION':
    default:
      return [
        {
          id: 'thought_ordinary_fact',
          text: '今天去另一边住心情很轻松，我知道接下来的日常安排。',
          category: 'known_fact',
          explanationText: '已知事实：普通平稳的换家日不需要额外做焦虑安抚练习。',
        },
      ];
  }
}

export function getSliceEntrySpeech(sliceId: TransitionSliceId): string {
  switch (sliceId) {
    case 'SLICE_A_BIDIRECTIONAL_ATTACHMENT':
      return TRANSITION_FIXED_VOICE_LINES.SLICE_A_ENTRY;
    case 'SLICE_B_LOYALTY_CONFLICT':
      return TRANSITION_FIXED_VOICE_LINES.SLICE_B_ENTRY;
    case 'SLICE_C_SPECIFIC_FEAR_OR_CONCERN':
      return TRANSITION_FIXED_VOICE_LINES.SLICE_C_ENTRY;
    case 'ORDINARY_HAPPY_TRANSITION':
      return TRANSITION_FIXED_VOICE_LINES.ORDINARY_ENTRY;
  }
}

export function getSliceProsodyTone(
  sliceId: TransitionSliceId,
  safetyConcern: SafetyConcernStatus = 'none'
): EmotionProsodyTone {
  if (safetyConcern === 'specific_person_or_harm_behavior') {
    return 'protective-safety';
  }
  switch (sliceId) {
    case 'SLICE_A_BIDIRECTIONAL_ATTACHMENT':
      return 'warm-dual-empathy';
    case 'SLICE_B_LOYALTY_CONFLICT':
      return 'calm-fact-clarity';
    case 'SLICE_C_SPECIFIC_FEAR_OR_CONCERN':
      return 'gentle-inquiry';
    case 'ORDINARY_HAPPY_TRANSITION':
      return 'light-everyday';
  }
}

export function createInitialTransitionExperienceState(
  initialSliceId: TransitionSliceId = 'SLICE_A_BIDIRECTIONAL_ATTACHMENT',
  context: TransitionContextMode = 'own_life_practice',
  startNeutral: boolean = false
): TransitionExperienceState {
  const initialFeelings: TransitionFeelingId[] = startNeutral
    ? []
    : initialSliceId === 'SLICE_A_BIDIRECTIONAL_ATTACHMENT'
      ? ['miss_current_place', 'look_forward_other_place']
      : initialSliceId === 'SLICE_B_LOYALTY_CONFLICT'
        ? ['happy_here_worry_other_adult']
        : initialSliceId === 'ORDINARY_HAPPY_TRANSITION'
          ? ['happy_relaxed_to_go']
          : ['scared_or_uneasy'];

  return {
    context,
    activeSliceId: initialSliceId,
    feelingSet: initialFeelings,
    thoughtSet: createDefaultThoughtsForSlice(initialSliceId),
    relationshipConcern: startNeutral
      ? 'none'
      : initialSliceId === 'SLICE_A_BIDIRECTIONAL_ATTACHMENT'
        ? 'bidirectional_attachment'
        : initialSliceId === 'SLICE_B_LOYALTY_CONFLICT'
          ? 'worry_other_adult_sad'
          : 'none',
    practicalConcern:
      !startNeutral && initialSliceId === 'SLICE_C_SPECIFIC_FEAR_OR_CONCERN'
        ? 'schedule_uncertainty'
        : 'none',
    safetyConcern: 'none',
    wishGoal: null,
    chosenAction: null,
    observedOutcome: null,
    nextAttempt: null,
    interactiveObjects: createInitialInteractiveObjectState(),
    actionHistory: [],
    attemptCount: 0,
    revisionCount: 0,
    pausedVoluntarily: false,
    isAnxietySoothingTriggered: false,
    ordinaryRitualsBlockedBySafety: false,
    emotionProsodyTone: startNeutral ? 'light-everyday' : getSliceProsodyTone(initialSliceId, 'none'),
    currentCompanionSpeech: startNeutral
      ? TRANSITION_FIXED_VOICE_LINES.NEUTRAL_FIRST_ENTRY
      : getSliceEntrySpeech(initialSliceId),
  };
}

/**
 * 切换感受标签（支持多种感受共存，绝不强制单选 — 满足验收反例 #1 与 #2）
 */
export function toggleTransitionFeeling(
  state: TransitionExperienceState,
  feelingId: TransitionFeelingId
): TransitionExperienceState {
  const exists = state.feelingSet.includes(feelingId);
  let nextFeelingSet = exists
    ? state.feelingSet.filter((f) => f !== feelingId)
    : [...state.feelingSet, feelingId];

  // 反例 #2: 若孩子只选了或主动点选了“今天开开心心去另一边”，绝不触发焦虑安抚，自动切换到轻松日常过桥分支
  const isSelectingHappyRelaxed = !exists && feelingId === 'happy_relaxed_to_go';
  if (isSelectingHappyRelaxed) {
    nextFeelingSet = ['happy_relaxed_to_go'];
  }
  const isOnlyHappyRelaxed =
    nextFeelingSet.length === 1 && nextFeelingSet[0] === 'happy_relaxed_to_go';

  // 反例 #1: 若孩子同时选中“舍不得这边”和“也期待那边”，两者并存并导向 Slice A
  const hasDualAttachment =
    nextFeelingSet.includes('miss_current_place') &&
    nextFeelingSet.includes('look_forward_other_place');

  let nextSliceId = state.activeSliceId;
  let nextObjects = { ...state.interactiveObjects };
  let nextSpeech = state.currentCompanionSpeech;

  if (isOnlyHappyRelaxed) {
    nextSliceId = 'ORDINARY_HAPPY_TRANSITION';
    nextSpeech = TRANSITION_FIXED_VOICE_LINES.ORDINARY_ENTRY;
  } else if (hasDualAttachment) {
    nextSliceId = 'SLICE_A_BIDIRECTIONAL_ATTACHMENT';
    nextObjects = {
      ...nextObjects,
      westStarLit: true,
      eastStarLit: true,
    };
    nextSpeech = TRANSITION_FIXED_VOICE_LINES.SLICE_A_BOTH_STARS;
  } else if (
    !exists &&
    (feelingId === 'happy_here_worry_other_adult' || feelingId === 'unfamiliar_or_dislike_one_place')
  ) {
    nextSliceId = 'SLICE_B_LOYALTY_CONFLICT';
    nextSpeech =
      feelingId === 'unfamiliar_or_dislike_one_place'
        ? TRANSITION_FIXED_VOICE_LINES.SLICE_B_ATTITUDE_DISLIKE_ONE
        : TRANSITION_FIXED_VOICE_LINES.SLICE_B_ENTRY;
    if (feelingId === 'unfamiliar_or_dislike_one_place') {
      nextObjects.placeAttitude = 'dislike_or_unadapted_to_one_place';
    }
  } else if (!exists && (feelingId === 'scared_or_uneasy' || feelingId === 'unsure_or_skip')) {
    nextSliceId = 'SLICE_C_SPECIFIC_FEAR_OR_CONCERN';
    nextSpeech =
      feelingId === 'unsure_or_skip'
        ? TRANSITION_FIXED_VOICE_LINES.SLICE_C_REASON_UNSURE
        : TRANSITION_FIXED_VOICE_LINES.SLICE_C_ENTRY;
    if (feelingId === 'unsure_or_skip') {
      nextObjects.investigatedFearReason = 'reason_unsure_or_dont_want_to_say';
      nextObjects.satOnQuietBench = true;
    }
  }

  return {
    ...state,
    activeSliceId: nextSliceId,
    feelingSet: nextFeelingSet,
    thoughtSet:
      nextSliceId !== state.activeSliceId
        ? createDefaultThoughtsForSlice(nextSliceId)
        : state.thoughtSet,
    interactiveObjects: nextObjects,
    isAnxietySoothingTriggered: false,
    emotionProsodyTone: getSliceProsodyTone(nextSliceId, state.safetyConcern),
    currentCompanionSpeech: nextSpeech,
  };
}

/**
 * Slice A 场景物体操作：点亮左岸星、右岸星、同时点亮双星、调节过桥步速、设置小背包或拒绝拥抱/写信
 */
export function interactWithSliceAObject(
  state: TransitionExperienceState,
  interaction:
    | { type: 'TOGGLE_WEST_STAR' }
    | { type: 'TOGGLE_EAST_STAR' }
    | { type: 'LIGHT_BOTH_STARS' }
    | { type: 'SET_BRIDGE_PACE'; pace: 'slow_pause' | 'steady_walk' }
    | { type: 'SET_BACKPACK_MODE'; mode: 'dual_star_badge' | 'empty_light_pack' | 'small_drawing' }
    | { type: 'SET_DECLINE_HUG_OR_LETTER'; declineHug?: boolean; declineLetter?: boolean }
): TransitionExperienceState {
  const objects = { ...state.interactiveObjects };
  const feelings = new Set<TransitionFeelingId>(state.feelingSet);
  let speech = state.currentCompanionSpeech;
  let wishGoal = state.wishGoal;

  switch (interaction.type) {
    case 'TOGGLE_WEST_STAR': {
      objects.westStarLit = !objects.westStarLit;
      if (objects.westStarLit) feelings.add('miss_current_place');
      speech =
        objects.westStarLit && objects.eastStarLit
          ? TRANSITION_FIXED_VOICE_LINES.SLICE_A_BOTH_STARS
          : TRANSITION_FIXED_VOICE_LINES.SLICE_A_WEST_STAR;
      if (objects.westStarLit && objects.eastStarLit) {
        wishGoal = '我希望同时留住对两边的想念，不需要二选一。';
      }
      break;
    }
    case 'TOGGLE_EAST_STAR': {
      objects.eastStarLit = !objects.eastStarLit;
      if (objects.eastStarLit) feelings.add('look_forward_other_place');
      speech =
        objects.westStarLit && objects.eastStarLit
          ? TRANSITION_FIXED_VOICE_LINES.SLICE_A_BOTH_STARS
          : TRANSITION_FIXED_VOICE_LINES.SLICE_A_EAST_STAR;
      if (objects.westStarLit && objects.eastStarLit) {
        wishGoal = '我希望同时留住对两边的想念，不需要二选一。';
      }
      break;
    }
    case 'LIGHT_BOTH_STARS': {
      objects.westStarLit = true;
      objects.eastStarLit = true;
      feelings.add('miss_current_place');
      feelings.add('look_forward_other_place');
      speech = TRANSITION_FIXED_VOICE_LINES.SLICE_A_BOTH_STARS;
      wishGoal = '我希望同时留住对两边的想念，不需要二选一。';
      break;
    }
    case 'SET_BRIDGE_PACE': {
      objects.bridgePaceMode = interaction.pace;
      speech = TRANSITION_FIXED_VOICE_LINES.SLICE_A_STEPPING_STONES;
      wishGoal = '我希望按照自己的步子慢慢过桥，不用急着马上开心起来。';
      break;
    }
    case 'SET_BACKPACK_MODE': {
      objects.backpackMode = interaction.mode;
      speech = TRANSITION_FIXED_VOICE_LINES.SLICE_A_BACKPACK;
      break;
    }
    case 'SET_DECLINE_HUG_OR_LETTER': {
      if (typeof interaction.declineHug === 'boolean') {
        objects.declineHug = interaction.declineHug;
      }
      if (typeof interaction.declineLetter === 'boolean') {
        objects.declineLetter = interaction.declineLetter;
      }
      if (objects.declineHug || objects.declineLetter) {
        wishGoal = '我现在不想拥抱也不想写信，想安安静静走过去。';
      }
      break;
    }
  }

  return {
    ...state,
    activeSliceId: 'SLICE_A_BIDIRECTIONAL_ATTACHMENT',
    feelingSet: Array.from(feelings),
    relationshipConcern: 'bidirectional_attachment',
    wishGoal,
    interactiveObjects: objects,
    currentCompanionSpeech: speech,
  };
}

/**
 * Slice B 场景物体操作：区分真实经历（事实）与对成人感受的猜测、立起责任小围栏、表达对两个地方的真实喜好（允许不喜欢其中一个地方）
 */
export function interactWithSliceBObject(
  state: TransitionExperienceState,
  interaction:
    | {
        type: 'CLASSIFY_BUBBLE';
        bubbleId: 'fact_happy_here' | 'guess_other_adult_sad';
        targetBucket: 'known_fact' | 'guess_about_adult_or_future';
      }
    | { type: 'RAISE_RESPONSIBILITY_FENCE' }
    | { type: 'SET_PLACE_ATTITUDE'; attitude: PlacePreferenceAttitude }
): TransitionExperienceState {
  const objects = { ...state.interactiveObjects };
  let relationshipConcern = state.relationshipConcern;
  let speech = state.currentCompanionSpeech;
  let wishGoal = state.wishGoal;

  const nextThoughts = state.thoughtSet.map((t) => ({ ...t }));

  switch (interaction.type) {
    case 'CLASSIFY_BUBBLE': {
      if (interaction.bubbleId === 'fact_happy_here') {
        objects.classifiedFactBubble = 'known_fact';
        const item = nextThoughts.find((t) => t.id === 'thought_b_fact_joy_here');
        if (item) item.childClassifiedAs = 'known_fact';
        speech = TRANSITION_FIXED_VOICE_LINES.SLICE_B_FACT_BUBBLE;
      } else {
        // 反例 #3：孩子担心某一方难过，绝不能把对大人感受的猜测直接宣称为已知事实！
        if (interaction.targetBucket === 'known_fact') {
          objects.guessDirectlyClaimedAsFactBlocked = true;
          objects.classifiedGuessBubble = 'guess_about_adult_or_future';
        } else {
          objects.classifiedGuessBubble = 'guess_about_adult_or_future';
        }
        const item = nextThoughts.find((t) => t.id === 'thought_b_guess_adult_sad');
        if (item) item.childClassifiedAs = 'guess_about_adult_or_future';
        speech = TRANSITION_FIXED_VOICE_LINES.SLICE_B_GUESS_BUBBLE;
      }
      break;
    }
    case 'RAISE_RESPONSIBILITY_FENCE': {
      objects.responsibilityFenceRaised = true;
      relationshipConcern = 'pressure_to_pass_messages';
      speech = TRANSITION_FIXED_VOICE_LINES.SLICE_B_FENCE;
      wishGoal = '我希望大人的事由大人自己沟通，我不用替大人传话或哄大人开心。';
      break;
    }
    case 'SET_PLACE_ATTITUDE': {
      objects.placeAttitude = interaction.attitude;
      if (interaction.attitude === 'dislike_or_unadapted_to_one_place') {
        relationshipConcern = 'dislike_or_unfamiliar_with_one_place';
        speech = TRANSITION_FIXED_VOICE_LINES.SLICE_B_ATTITUDE_DISLIKE_ONE;
        wishGoal = '我希望保留我对不同地方的真实感受，不被强迫说两个地方一样好。';
      } else {
        speech = TRANSITION_FIXED_VOICE_LINES.SLICE_B_ATTITUDE_LIKE_BOTH;
        wishGoal = '我希望在两边都能自在地做自己，不用因为开心而内疚。';
      }
      break;
    }
  }

  return {
    ...state,
    activeSliceId: 'SLICE_B_LOYALTY_CONFLICT',
    thoughtSet: nextThoughts,
    relationshipConcern,
    wishGoal,
    interactiveObjects: objects,
    currentCompanionSpeech: speech,
  };
}

/**
 * Slice C 场景物体操作：先调查害怕或担忧的具体原因（包含不想回答/说不清，以及涉及具体伤害时的安全分流）
 */
export function investigateSliceCFearReason(
  state: TransitionExperienceState,
  reasonId: SpecificFearReasonId
): TransitionExperienceState {
  const meta = SPECIFIC_FEAR_REASONS[reasonId];
  const objects = {
    ...state.interactiveObjects,
    investigatedFearReason: reasonId,
    illuminatedSignpost: reasonId === 'reason_schedule_uncertainty',
    tappedNightlight: reasonId === 'reason_unfamiliar_environment',
    tappedReunionStone: reasonId === 'reason_separation_reluctance',
    satOnQuietBench: reasonId === 'reason_unsure_or_dont_want_to_say',
    safetyShieldActivated: reasonId === 'reason_specific_person_or_behavior',
  };

  const isHarmSafety = meta.safetyConcern === 'specific_person_or_harm_behavior';

  const updatedThoughts: TransitionThoughtItem[] = [
    {
      id: `thought_c_${reasonId}`,
      text: meta.knownFactText,
      category: 'known_fact',
      explanationText: meta.childPrompt,
    },
  ];

  // 若切换了原因且之前已选行动与当前安全等级冲突，清空旧结果以便重新选择
  const shouldResetAction =
    state.chosenAction !== null &&
    ((isHarmSafety && !TRANSITION_ACTIONS[state.chosenAction]?.isSafetyAction) ||
      (!isHarmSafety && TRANSITION_ACTIONS[state.chosenAction]?.isSafetyAction));

  return {
    ...state,
    activeSliceId: 'SLICE_C_SPECIFIC_FEAR_OR_CONCERN',
    thoughtSet: updatedThoughts,
    practicalConcern: meta.practicalConcern,
    safetyConcern: meta.safetyConcern,
    wishGoal: meta.wishGoalText,
    chosenAction: shouldResetAction ? null : state.chosenAction,
    observedOutcome: shouldResetAction ? null : state.observedOutcome,
    interactiveObjects: objects,
    ordinaryRitualsBlockedBySafety: isHarmSafety,
    emotionProsodyTone: getSliceProsodyTone('SLICE_C_SPECIFIC_FEAR_OR_CONCERN', meta.safetyConcern),
    currentCompanionSpeech: meta.companionSpeech,
  };
}

/**
 * 获取当前情境下允许孩子选择的行动列表（满足反例 #6 与 #7：
 * - 当涉及具体伤害时，严格屏蔽普通开心/放松/拥抱/装书包仪式，只提供现实安全求助与保护行动；
 * - 当说不清原因时，优先提供安静长椅陪伴，不强迫选预设原因）
 */
export function getAvailableActionsForState(
  state: TransitionExperienceState
): TransitionActionMeta[] {
  if (state.activeSliceId === 'ORDINARY_HAPPY_TRANSITION') {
    return [TRANSITION_ACTIONS.action_cross_bridge_lightheartedly];
  }

  if (state.activeSliceId === 'SLICE_A_BIDIRECTIONAL_ATTACHMENT') {
    return [
      TRANSITION_ACTIONS.action_quiet_wave_no_hug_no_letter,
      TRANSITION_ACTIONS.action_carry_both_stars_together,
      TRANSITION_ACTIONS.action_fist_bump_see_you_soon,
    ];
  }

  if (state.activeSliceId === 'SLICE_B_LOYALTY_CONFLICT') {
    return [
      TRANSITION_ACTIONS.action_allow_joy_release_adult_worry,
      TRANSITION_ACTIONS.action_decline_messenger_role,
      TRANSITION_ACTIONS.action_keep_honest_place_preference,
    ];
  }

  // Slice C: 具体害怕与担忧
  if (state.safetyConcern === 'specific_person_or_harm_behavior') {
    // 反例 #7：涉及具体伤害时，严禁提供普通换家安抚仪式
    return [
      TRANSITION_ACTIONS.action_tell_trusted_adult_immediately,
      TRANSITION_ACTIONS.action_stay_in_safe_place_with_help,
    ];
  }

  const reason = state.interactiveObjects.investigatedFearReason;
  if (reason === 'reason_unsure_or_dont_want_to_say') {
    // 反例 #6：说不清原因时，直接提供安静坐一会儿，无需强迫选预设原因
    return [
      TRANSITION_ACTIONS.action_sit_quietly_no_explanation,
      TRANSITION_ACTIONS.action_quiet_wave_no_hug_no_letter,
    ];
  }

  return [
    TRANSITION_ACTIONS.action_check_schedule_signpost,
    TRANSITION_ACTIONS.action_pack_habit_card_or_nightlight,
    TRANSITION_ACTIONS.action_confirm_reunion_stone,
    TRANSITION_ACTIONS.action_sit_quietly_no_explanation,
  ];
}

/**
 * 执行孩子自主选择的过渡行动，生成真实可观察结果（反例 #5 / #7 / #9）
 */
export function executeTransitionAction(
  state: TransitionExperienceState,
  actionId: TransitionActionId
): TransitionExperienceState {
  const actionMeta = TRANSITION_ACTIONS[actionId];
  if (!actionMeta) return state;

  // 反例 #7 防线：当处于具体伤害风险（specific_person_or_harm_behavior）时，拒绝任何普通换家仪式行动
  if (
    state.safetyConcern === 'specific_person_or_harm_behavior' &&
    !actionMeta.isSafetyAction
  ) {
    return {
      ...state,
      ordinaryRitualsBlockedBySafety: true,
      currentCompanionSpeech: TRANSITION_FIXED_VOICE_LINES.SLICE_C_REASON_HARM_SAFETY,
    };
  }

  const priorDistinctActions = new Set(state.actionHistory);
  const isNewDistinctRevision =
    state.actionHistory.length > 0 &&
    state.chosenAction !== actionId &&
    (!priorDistinctActions.has(actionId) || state.chosenAction !== null);

  const nextHistory = [...state.actionHistory, actionId];
  const nextAttemptCount = state.attemptCount + 1;
  const nextRevisionCount = state.revisionCount + (isNewDistinctRevision ? 1 : 0);

  const nextObjects = { ...state.interactiveObjects };
  if (actionId === 'action_quiet_wave_no_hug_no_letter') {
    nextObjects.declineHug = true;
    nextObjects.declineLetter = true;
  } else if (actionId === 'action_carry_both_stars_together') {
    nextObjects.westStarLit = true;
    nextObjects.eastStarLit = true;
    nextObjects.backpackMode = 'dual_star_badge';
  } else if (actionId === 'action_sit_quietly_no_explanation') {
    nextObjects.satOnQuietBench = true;
  } else if (
    actionId === 'action_tell_trusted_adult_immediately' ||
    actionId === 'action_stay_in_safe_place_with_help'
  ) {
    nextObjects.safetyShieldActivated = true;
  }

  return {
    ...state,
    chosenAction: actionId,
    observedOutcome: actionMeta.outcome,
    nextAttempt: 'finish_current_exploration',
    interactiveObjects: nextObjects,
    actionHistory: nextHistory,
    attemptCount: nextAttemptCount,
    revisionCount: nextRevisionCount,
    pausedVoluntarily: false,
    currentCompanionSpeech: actionMeta.outcome.companionFeedbackSpeech,
  };
}

/**
 * 孩子点击“换个方式再试一次”：保留历史尝试轨迹，清空当前已选行动以便真实尝试新方法
 */
export function prepareRetryTransitionAttempt(
  state: TransitionExperienceState
): TransitionExperienceState {
  return {
    ...state,
    chosenAction: null,
    observedOutcome: null,
    nextAttempt: 'try_another_way',
    pausedVoluntarily: false,
    currentCompanionSpeech: TRANSITION_FIXED_VOICE_LINES.RETRY_ANOTHER_WAY,
  };
}

/**
 * 孩子点击“先停下来休息 / 暂时不选”：尊重主动暂停边界
 */
export function pauseTransitionExperienceVoluntarily(
  state: TransitionExperienceState
): TransitionExperienceState {
  return {
    ...state,
    pausedVoluntarily: true,
    nextAttempt: 'stay_quiet_or_pause',
    currentCompanionSpeech: TRANSITION_FIXED_VOICE_LINES.PAUSE_VOLUNTARILY,
  };
}
