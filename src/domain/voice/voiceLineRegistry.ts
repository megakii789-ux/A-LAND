import { ANIMAL_COMPANIONS, AnimalCompanionId } from '../personalization';
import { PREBAKED_TTS_BY_PROFILE_KEY, PrebakedTtsEntry } from '../../data/ttsManifest';

export type VoiceCallCategory =
  | 'FIXED_LINE' // 固定台词
  | 'FINITE_PARAM_COMBO' // 有限参数组合台词
  | 'DYNAMIC_BEHAVIOR_FEEDBACK' // 根据儿童行为变化的动态反馈
  | 'FREE_INPUT_OR_UNBOUNDED'; // 用户自由输入或无法预先穷举的文本

export type VoiceSceneId =
  | 'island_home_companion'
  | 'island_landmarks'
  | 'weather_station'
  | 'calm_corner'
  | 'crayon_detective'
  | 'friend_asks_home'
  | 'toy_boat_negotiation'
  | 'story_grove'
  | 'camp_transfer'
  | 'two_homes_bridge'
  | 'difficulty_breaker'
  | 'hug_help_entry'
  | 'personalization_audition'
  | 'starlight_medals'
  | 'general_narration';

export interface VoiceLineRegistryEntry {
  lineId: string;
  sceneId: VoiceSceneId;
  category: 'FIXED_LINE' | 'FINITE_PARAM_COMBO';
  isCompanionSelfIntro: boolean;
  /** Shared text identical across all 4 companions */
  sharedText?: string;
  /** Companion-specific text variants (e.g., self-introductions) */
  companionTexts?: Record<AnimalCompanionId, string>;
}

export interface VoiceCallSiteDescriptor {
  sourceId: string;
  file: string;
  sceneId: VoiceSceneId;
  category: VoiceCallCategory;
  description: string;
  lineIds: string[];
}

export function normalizeVoiceLookupKey(text: string): string {
  return text
    .replace(/（[^）]*）|\([^)]*\)|【[^】]*】|\[[^\]]*\]/g, '')
    .replace(/[\s*_#`~>"'“”‘’、，。！？；：,.!?;:—\-…·]/g, '')
    .trim();
}

export const COMPANION_SHORT_SELF_INTROS: Record<AnimalCompanionId, string> = {
  guoguo_squirrel: '我是果果',
  beibei_otter: '我是贝贝',
  tiantian_raccoon: '我是天天',
  qiqi_deer: '我是奇奇',
};

export const COMPANION_FULL_GREETINGS: Record<AnimalCompanionId, string> = {
  guoguo_squirrel: `你好呀！我是${ANIMAL_COMPANIONS.guoguo_squirrel.name}。${ANIMAL_COMPANIONS.guoguo_squirrel.greetingText}`,
  beibei_otter: `你好呀！我是${ANIMAL_COMPANIONS.beibei_otter.name}。${ANIMAL_COMPANIONS.beibei_otter.greetingText}`,
  tiantian_raccoon: `你好呀！我是${ANIMAL_COMPANIONS.tiantian_raccoon.name}。${ANIMAL_COMPANIONS.tiantian_raccoon.greetingText}`,
  qiqi_deer: `你好呀！我是${ANIMAL_COMPANIONS.qiqi_deer.name}。${ANIMAL_COMPANIONS.qiqi_deer.greetingText}`,
};

export const COMPANION_BODY_GREETINGS: Record<AnimalCompanionId, string> = {
  guoguo_squirrel: ANIMAL_COMPANIONS.guoguo_squirrel.greetingText,
  beibei_otter: ANIMAL_COMPANIONS.beibei_otter.greetingText,
  tiantian_raccoon: ANIMAL_COMPANIONS.tiantian_raccoon.greetingText,
  qiqi_deer: ANIMAL_COMPANIONS.qiqi_deer.greetingText,
};

/**
 * 全域固定台词与有限参数组合台词注册表 (V1.1 Section II)
 */
export const VOICE_LINE_REGISTRY: VoiceLineRegistryEntry[] = [
  // 1. 伙伴专属自我介绍与问候 (Companion Self-Introductions)
  {
    lineId: 'companion.self_intro.short',
    sceneId: 'island_home_companion',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: true,
    companionTexts: COMPANION_SHORT_SELF_INTROS,
  },
  {
    lineId: 'companion.greeting.full',
    sceneId: 'island_home_companion',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: true,
    companionTexts: COMPANION_FULL_GREETINGS,
  },
  {
    lineId: 'companion.greeting.body',
    sceneId: 'island_home_companion',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: true,
    companionTexts: COMPANION_BODY_GREETINGS,
  },

  // 2. 首页与全岛地标导览 (Island Home & Map Landmarks)
  {
    lineId: 'island.map.welcome_overview',
    sceneId: 'island_landmarks',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText:
      '欢迎来到晴雨小岛！海面上飘着小木船，山巅有情绪天气站，树林深处是故事森林，小桥两边是温暖的家，还有放大镜木屋与星光树屋。你想先去哪里探险呢？',
  },
  {
    lineId: 'island.landmark.weather',
    sceneId: 'island_landmarks',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText:
      '这里是情绪天气站。站在山顶吹着微风，看看头顶的天空，也抱抱自己身体里正在流动的感觉。',
  },
  {
    lineId: 'island.landmark.story',
    sceneId: 'island_landmarks',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText:
      '这里是故事森林，也就是故事林。古老的大树下有一本本好看的绘本，跟小动物们一起看看他们是怎样想办法的。',
  },
  {
    lineId: 'island.landmark.detective',
    sceneId: 'island_landmarks',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText:
      '这里是思考侦探所，也就是想法侦探社。在这里当个聪明的小侦探，用放大镜看清楚眼前发生的事情，不凭感觉瞎猜。',
  },
  {
    lineId: 'island.landmark.courage',
    sceneId: 'island_landmarks',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText:
      '这里是勇气小屋，也是勇气说话屋。在这里练习大声说出不，学会把心里的困惑和委屈讲给信任的大人听。',
  },
  {
    lineId: 'island.landmark.bridge',
    sceneId: 'island_landmarks',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText:
      '这里是双向桥小驿，也就是照顾小桥。桥的两边都是爱你的家，日程清清楚楚，两边的爸爸妈妈都深深爱着你。',
  },
  {
    lineId: 'island.landmark.starlight',
    sceneId: 'island_landmarks',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText:
      '这里是星光树屋，也是星光小屋。在夜空树梢上点亮属于你的爱好、特长与好朋友，家庭只是大拼图里的一片，你本身闪闪发光。',
  },
  {
    lineId: 'island.landmark.calm',
    sceneId: 'island_landmarks',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText:
      '这里是绿草平静角。如果觉得有点累或者心里噗通噗通跳，就来这里跟着圆圈深呼吸，随时可以停下来休息。',
  },
  {
    lineId: 'island.landmark.breaker',
    sceneId: 'island_landmarks',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText:
      '这里是大困难拆解台。遇到觉得很难的事情别着急，动动手用小木槌把它敲成三小块，一步一步迈过去。',
  },
  {
    lineId: 'island.card.calm_banner',
    sceneId: 'calm_corner',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText:
      '绿草呼吸平静角。跟着圆圈慢慢吸气和呼气，放松身体；如果遇到大困难，也可以去拆解台把它拆成三小步。',
  },
  {
    lineId: 'island.card.weather',
    sceneId: 'island_landmarks',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '情绪天气站。看今天头顶的天气与身体感觉',
  },
  {
    lineId: 'island.card.story',
    sceneId: 'island_landmarks',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '故事林。走一圈、想一想，探索生活小故事',
  },
  {
    lineId: 'island.card.detective',
    sceneId: 'island_landmarks',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '想法侦探社。用放大镜找线索，区分事实与猜测',
  },
  {
    lineId: 'island.card.courage',
    sceneId: 'island_landmarks',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '勇气说话屋。学会把心里话好好告诉可信大人',
  },
  {
    lineId: 'island.card.bridge',
    sceneId: 'island_landmarks',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '照顾小桥。看交接日历、收拾小书包与安心想念',
  },
  {
    lineId: 'island.card.starlight',
    sceneId: 'island_landmarks',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '星光小屋。点亮你的独特爱好与强项拼图',
  },
  {
    lineId: 'island.card.calm',
    sceneId: 'island_landmarks',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '绿草呼吸平静角。跟随圆圈呼吸练习，放松身体平复情绪',
  },

  // 3. 情绪天气站与平静角 (Weather Station & Calm Corner)
  {
    lineId: 'weather.prompt.entry',
    sceneId: 'weather_station',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '挑选今天头顶的天气。晴、阴、雨、雷、雾，或者不想选，都可以。',
  },
  {
    lineId: 'weather.option.sunny',
    sceneId: 'weather_station',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '我现在像暖洋洋的太阳，亮堂堂的',
  },
  {
    lineId: 'weather.option.cloudy',
    sceneId: 'weather_station',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '我现在像慢慢飘的厚云，有一点点心事',
  },
  {
    lineId: 'weather.option.rainy',
    sceneId: 'weather_station',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '我现在像下雨天，眼眶或心里有点湿湿的',
  },
  {
    lineId: 'weather.option.stormy',
    sceneId: 'weather_station',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '我现在像打雷闪电，肚子里有火或者好急好冲',
  },
  {
    lineId: 'weather.option.foggy',
    sceneId: 'weather_station',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '我现在像在一团雾里，懵懵的看不清',
  },
  {
    lineId: 'weather.option.skip_quiet',
    sceneId: 'weather_station',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '我今天先不挑天气，先自己安安静静呆着',
  },
  {
    lineId: 'weather.feedback.skip_ok',
    sceneId: 'weather_station',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '没关系，不想选是完全可以的。你想在小岛上玩什么都可以。',
  },
  {
    lineId: 'weather.feedback.stormy_empathy',
    sceneId: 'weather_station',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '你现在像一团暴风雨。可以生气，可以大喊。我在这儿，我们一起等雷声停下来。',
  },
  {
    lineId: 'weather.feedback.rainy_empathy',
    sceneId: 'weather_station',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '你现在像一场大雨。可以难过，可以哭一哭。我在这儿，我们一起等雨小一点。',
  },
  {
    lineId: 'weather.feedback.decline_calm_ok',
    sceneId: 'weather_station',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '好呀，不去平静角也可以。我们一起安安静静呆着，或者换个轻巧的故事玩。',
  },
  {
    lineId: 'weather.feedback.seek_adult',
    sceneId: 'weather_station',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '你真勇敢，愿意和大人在一起。去找身边的爸爸、妈妈或老师抱一抱吧。',
  },
  {
    lineId: 'calm.phase.inhale',
    sceneId: 'calm_corner',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '深深吸气... 肚子鼓起来',
  },
  {
    lineId: 'calm.phase.hold',
    sceneId: 'calm_corner',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '轻轻停一停... 感觉好安静',
  },
  {
    lineId: 'calm.phase.exhale',
    sceneId: 'calm_corner',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '缓缓呼气... 把烦恼吹出去',
  },
  {
    lineId: 'calm.phase.rest',
    sceneId: 'calm_corner',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '轻松休息... 身体松松的',
  },

  // 4. 蜡笔侦探与想法侦探社 (Crayon Detective & Thought Detective Lab)
  {
    lineId: 'detective.lab.header_intro',
    sceneId: 'crayon_detective',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '想法侦探社：这里有四件神奇的小工具和一道安全围栏，帮你看清心里的声音！',
  },
  {
    lineId: 'detective.intro.drawing',
    sceneId: 'crayon_detective',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText:
      '欢迎来到美术角！桌上的绿色小蜡笔不见了，我们拿起小放大镜，看看地上和桌边有些什么。',
  },
  {
    lineId: 'detective.intro.soccer',
    sceneId: 'crayon_detective',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText:
      '欢迎来到绿茵场！训练用的小足球不知道滚去哪里了，我们拿起放大镜，仔细看看草坪边缘。',
  },
  {
    lineId: 'detective.intro.animals',
    sceneId: 'crayon_detective',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText:
      '欢迎来到大橡树下！小松鼠放在树洞旁的大橡果找不到了，我们拿起放大镜，去拨开落叶、看看树洞和地面痕迹吧。',
  },
  {
    lineId: 'detective.intro.puzzles',
    sceneId: 'crayon_detective',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText:
      '欢迎来到拼图小桌！彩虹拼图的最后一片找不到啦，我们拿起放大镜，在桌角和地毯上找一找。',
  },
  {
    lineId: 'detective.feedback.unknown_ok',
    sceneId: 'crayon_detective',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '有些事情我们暂时还不知道，这是很正常的！不用急着猜。',
  },
  {
    lineId: 'detective.feedback.reset',
    sceneId: 'crayon_detective',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '已重新整理场景，拿起放大镜重新找找吧！',
  },

  // 5. 社交游戏与勇气说话屋 (Friend Asks Home & Courage House)
  {
    lineId: 'courage.header_intro',
    sceneId: 'friend_asks_home',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '勇气说话屋：学说三句话，搭好句式积木，有话可以说，也可以说不。保护自己的身体和心！',
  },
  {
    lineId: 'friend.intro.two_homes',
    sceneId: 'friend_asks_home',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText:
      '放学校门口的好奇提问。好朋友小明说：“咦，昨天是你爸爸来接你，今天怎么只有你妈妈呀？他们为什么不一起接你呢？” 你想怎么回应呢？怎么说、说多少或者停下对话，都由你决定。',
  },
  {
    lineId: 'friend.intro.neutral_pickup',
    sceneId: 'friend_asks_home',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText:
      '放学校门口的好奇提问。好朋友小明说：“咦，今天是谁来接你放学呀？你们家平时是怎么安排接送的呀？” 你想怎么回应呢？怎么说、说多少或者停下对话，都由你决定。',
  },
  {
    lineId: 'friend.feedback.reset',
    sceneId: 'friend_asks_home',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '我们重新开始这个情境，你可以尝试不同的回答、转移话题或者直接划定边界！',
  },

  // 6. 小船协商 (Toy Boat Negotiation)
  {
    lineId: 'boat.intro.pond',
    sceneId: 'toy_boat_negotiation',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText:
      '池塘边的唯一红帆船。晴朗水塘里只有一条红帆小木船。小兔提莫想先当船长冲浪，小熊波波也想自己掌舵去芦苇丛，谁都不想在岸边空手干等太久。 请先移动小船位置、设置轮流秒数或合作方案，再点开始执行观察实验结果吧！',
  },
  {
    lineId: 'boat.intro.creek',
    sceneId: 'toy_boat_negotiation',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText:
      '浅水溪湾的松果渡船挑战。浅水溪湾需要把岸上的松果运到对岸小岛，但现场只有一条小木船、一支船桨和岸边的挖掘机。如果两个人抢着单干，船容易卡在浅滩石头旁！ 请先移动小船位置、设置轮流秒数或合作方案，再点开始执行观察实验结果吧！',
  },
  {
    lineId: 'boat.feedback.reset',
    sceneId: 'toy_boat_negotiation',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '我们停下来重新商量！你可以调整谁先玩、每轮几秒或者换成合作方案。',
  },

  // 7. 故事森林与树屋露营夜 (Story Grove & Camp Transfer)
  {
    lineId: 'story.cup.opening',
    sceneId: 'story_grove',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '点击或移动桌上的蓝水杯，让它先后挨着左边的小积木和右边的大水桶，看看会发生什么！',
  },
  {
    lineId: 'story.cup.move_block',
    sceneId: 'story_grove',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '把蓝水杯移到小积木旁边：杯子比小积木高好多，跳跳开心得蹦起来说“看，是大杯子吧！”',
  },
  {
    lineId: 'story.cup.move_bucket',
    sceneId: 'story_grove',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '把蓝水杯移到大水桶旁边：杯子在大水桶旁边显得好小，噗噗笑着晃鼻子说“看，跟我的水桶比它真小！”',
  },
  {
    lineId: 'story.cup.move_center',
    sceneId: 'story_grove',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '蓝水杯回到桌子中间：杯身上的两格水位线一点儿没变，杯子自己的大小没有改变。',
  },
  {
    lineId: 'story.train.opening',
    sceneId: 'story_grove',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '森林木地板上只有一辆红色小火车头，小熊和小浣熊都想现在玩。先点点地上的物件看看都有什么吧！',
  },
  {
    lineId: 'camp.opening',
    sceneId: 'camp_transfer',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText:
      '夜晚的树屋帐篷外晃动着一个神秘黑影！身旁的小刺猬紧张地追问你的隐私秘密，而地上只有一件照明工具，大家都想拿。先转动光束照一照吧！',
  },
  {
    lineId: 'camp.unknown_ok',
    sceneId: 'camp_transfer',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '暂时不知道也没关系！你可以先转动手电筒照一照，或者先休息一下回小岛。',
  },

  // 8. 双向小桥多维心理体验与中性首次入口 (Two Homes Bridge V1.1)
  {
    lineId: 'bridge.entry.neutral_first_visit',
    sceneId: 'two_homes_bridge',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText:
      '这里是双向桥小驿。今天去另一边住，你是觉得轻松开心、有点舍不得、担心别人的感受、有些害怕或说不清，还是想先听一个小朋友的故事呢？',
  },
  {
    lineId: 'bridge.entry.story_mode',
    sceneId: 'two_homes_bridge',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '我们来看看小朋友乐乐过桥的故事吧！你可以帮乐乐点点看他遇到了什么情况。',
  },
  {
    lineId: 'bridge.entry.welcome',
    sceneId: 'two_homes_bridge',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText:
      '这里是双向桥小驿。去另一边住的时候，每个人心里可能会有不一样的感受，也可能平平常常。先点点看你现在有什么感觉吧！',
  },
  {
    lineId: 'bridge.ordinary.intro',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText:
      '今天去另一边心情挺轻松！换地方住不一定都会害怕，你可以直接点点桥上的路标或带一件日常物品，轻快过桥。',
  },
  {
    lineId: 'bridge.ordinary.outcome',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '你选了平时爱玩的日常物品，迈着轻松的步子走过小桥。今天就是普通又顺畅的一天！',
  },
  {
    lineId: 'bridge.slice_a.intro',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText:
      '一边舍不得离开现在的地方，一边又期待去另一边，这两种感觉可以同时待在心里，不需要二选一。',
  },
  {
    lineId: 'bridge.slice_a.star_here',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '点亮左岸想念星：我舍不得这边的照顾者和熟悉的小角落。',
  },
  {
    lineId: 'bridge.slice_a.star_there',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '点亮右岸期待星：我也想念另一边的照顾者，期待那边的故事。',
  },
  {
    lineId: 'bridge.slice_a.both_stars',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '两颗小星星同时亮在桥中央啦！你可以同时想念两边，不用灭掉任何一颗星。',
  },
  {
    lineId: 'bridge.slice_a.pace_stone',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '踩踩桥上的慢步石：过桥的时候不用急着奔跑，可以按自己的步子慢慢走。',
  },
  {
    lineId: 'bridge.slice_a.pocket_bag',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '打开随身小背包：你可以装进双星小徽章，也可以什么特别信物都不带，轻装走过去。',
  },
  {
    lineId: 'bridge.slice_a.outcome_no_hug',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText:
      '你选择了不抱抱、也不写信，只轻轻点点头安静走过小桥。不想拥抱或不想马上笑出来完全没关系，你的节奏被尊重。',
  },
  {
    lineId: 'bridge.slice_a.outcome_both_stars',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '你把两颗想念星一起收进随身小袋里。带着对两边的喜欢过桥，心里不用做选择题。',
  },
  {
    lineId: 'bridge.slice_a.outcome_fist_bump',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '你和身边的大人轻轻碰了碰小拳头，说声过几天见，按自己的步子踏上小桥。',
  },
  {
    lineId: 'bridge.slice_b.intro',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText:
      '在这边玩得很开心，却突然担心另一边的大人会不会孤单难过？我们用分界镜来看看，哪些是真事，哪些是心里的猜测。',
  },
  {
    lineId: 'bridge.slice_b.fact_sorted',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '放进已知事实盘：我今天在这边玩拼图笑了，这是真实发生的事，开心不是做错事。',
  },
  {
    lineId: 'bridge.slice_b.guess_sorted',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '放进猜测云朵：觉得另一边的大人一定在伤心怪你，这只是脑海里的猜测，不是已经确定的事实。',
  },
  {
    lineId: 'bridge.slice_b.boundary_sorted',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '立起责任小围栏：大人的心情和大人之间的沟通属于大人的责任圈，不需要小孩子来哄或传话。',
  },
  {
    lineId: 'bridge.slice_b.pref_both',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '你觉得两边都有好玩的地方，两边都可以喜欢。',
  },
  {
    lineId: 'bridge.slice_b.pref_asymmetric',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '你觉得对其中一个地方不太喜欢或不太习惯。这也是真实的感受，没有人规定你必须觉得两个地方一样好。',
  },
  {
    lineId: 'bridge.slice_b.outcome_adult_emotion',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '你把大人的情绪放回大人的责任圈，允许自己安心玩耍。就算大人有时需要时间消化，你也不用背负内疚。',
  },
  {
    lineId: 'bridge.slice_b.outcome_no_messenger',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '你练习对大人说：请你们直接在手机上商量吧，我不想当传话筒。守住小边界后，心里轻快多啦。',
  },
  {
    lineId: 'bridge.slice_b.outcome_honest_pref',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '你保留了对不同地方的真实喜欢与不习惯，不逼自己说两个地方一样好的违心话。',
  },
  {
    lineId: 'bridge.slice_c.intro',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText:
      '心里觉得有点害怕或七上八下时，我们先不急着塞玩偶。先点点路标，看看是什么具体原因让你担心，或者也可以先不说。',
  },
  {
    lineId: 'bridge.slice_c.reason_parting',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '你发现自己是舍不得分开的那一刻。我们可以看看下次见面的约定石。',
  },
  {
    lineId: 'bridge.slice_c.reason_schedule',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '你发现自己是因为不知道哪天去、什么时候回来才心慌。我们可以点亮日历路标问清楚时间。',
  },
  {
    lineId: 'bridge.slice_c.reason_environment',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '你发现自己是对另一边的陌生床铺或生活规矩不习惯。我们可以准备一张习惯说明小卡。',
  },
  {
    lineId: 'bridge.slice_c.reason_unsure',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '暂时说不清楚原因，或者现在不想回答，完全可以！我们坐在桥边安静长椅上歇一会儿，不追问你。',
  },
  {
    lineId: 'bridge.slice_c.reason_safety',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '你提到有具体的人或行为让你害怕受伤害。这时候绝不能靠装小书包或勉强拥抱解决，保护你的安全最重要！',
  },
  {
    lineId: 'bridge.slice_c.outcome_schedule',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '你向大人问清楚了接送的日子和钟点。虽然计划偶尔会有小变动，但知道安排后心里更有底了。',
  },
  {
    lineId: 'bridge.slice_c.outcome_routine',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '你把自己的睡前小习惯告诉了大人，带上了熟悉的小夜灯，给自己留出慢慢适应的时间。',
  },
  {
    lineId: 'bridge.slice_c.outcome_reunion',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '你确认了下次见面的具体约定。分开只是暂时的，不用强迫自己立刻不难过。',
  },
  {
    lineId: 'bridge.slice_c.outcome_quiet_bench',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '你在桥边长椅上安安静静坐了一会儿。没有被强迫选原因，可以等想说的时候再说。',
  },
  {
    lineId: 'bridge.slice_c.outcome_safety_shield',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText:
      '你启动了安全护盾：拒绝普通的换家安抚仪式，立即向信任的安全大人或老师求助，清楚说出我在那边觉得不安全。',
  },
  {
    lineId: 'bridge.slice_c.outcome_stay_safe',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '你选择留在安全明亮的地方，请信任的大人陪在身边保护你，绝不勉强自己独自面对危险。',
  },
  {
    lineId: 'bridge.common.pause_exit',
    sceneId: 'two_homes_bridge',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '今天先体验到这里，我们随时可以停下来休息，或者去小岛别的地方玩。',
  },
  {
    lineId: 'bridge.common.retry',
    sceneId: 'two_homes_bridge',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '我们换一种做法再试一次，看看这次会有什么不一样的结果！',
  },
  {
    lineId: 'bridge.common.utility_drawer',
    sceneId: 'two_homes_bridge',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '小书包、日历和想念盒都在工具抽屉里，需要时随时可以用，不需要时也不用勉强打卡。',
  },

  // 9. 大困难拆解台 (DifficultyBreakerModal)
  {
    lineId: 'breaker.entry.greeting',
    sceneId: 'difficulty_breaker',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText:
      '欢迎来到大困难拆解台！遇到手头事多或心里打结的时候，我们可以先看清事实和感受，换个镜头看一看，再挑一两块舒服的小踏脚石。',
  },
  {
    lineId: 'breaker.transition.dual_attachment',
    sceneId: 'difficulty_breaker',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '去另一边住时，同时想念两个地方是很自然的事。不需要二选一，也不必勉强拥抱或写信。',
  },
  {
    lineId: 'breaker.transition.loyalty_conflict',
    sceneId: 'difficulty_breaker',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText:
      '你在这边玩得开心是真实发生的事实，担心另一边大人难过只是心里的猜测。大人的情绪由大人负责，你也不需要违心说两个地方一样好。',
  },
  {
    lineId: 'breaker.transition.specific_concern',
    sceneId: 'difficulty_breaker',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText:
      '如果对去另一边有具体担忧，我们先查清是日程不明、环境不习惯，还是暂时说不清楚。要是遇到有人凶你或伤害你，立刻启动安全护盾找信任的大人！',
  },
  {
    lineId: 'breaker.transition.ordinary_happy',
    sceneId: 'difficulty_breaker',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText:
      '今天去另一边心情挺轻松，没有任何害怕！我们不需要做心理安抚，只要把收拾日常物品拆成两三个轻快的小动作就能出发。',
  },
  {
    lineId: 'breaker.outcome.step_selected',
    sceneId: 'difficulty_breaker',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '你把原本乱糟糟的大石头拆成了清楚的小踏脚石！按自己舒服的步子迈出这一小步就很棒啦。',
  },
  {
    lineId: 'breaker.outcome.pause_rest',
    sceneId: 'difficulty_breaker',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '你选择了先停下来休息一会儿。不用勉强马上做决定，什么时候想继续都可以。',
  },

  // 10. 现实求助与抱抱入口 (HugSupportEntry & HugButton)
  {
    lineId: 'hug.button.nearby_adult',
    sceneId: 'hug_help_entry',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText:
      '这里不会向手机发送远程消息。请直接走到身边你信任的大人那里，或者把求助卡拿给身边的大人看。',
  },
  {
    lineId: 'hug.entry.arrived_dismiss',
    sceneId: 'hug_help_entry',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '小提醒已关闭。有大人在身边，慢慢来。',
  },
  {
    lineId: 'hug.entry.pull_sleeve',
    sceneId: 'hug_help_entry',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '走到大人身边拉拉衣角，告诉大人“我需要你陪我一会儿”。',
  },
  {
    lineId: 'hug.entry.trusted_adult',
    sceneId: 'hug_help_entry',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '如果熟悉的大人暂时不在，可以直接找老师、护士或其他信任的大人。',
  },
  {
    lineId: 'hug.entry.quiet_alone_ok',
    sceneId: 'hug_help_entry',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '不想说也没关系。把心里的小门轻轻关好，自己待一会儿也是完全可以的。',
  },
  {
    lineId: 'hug.instant.offline_nearby',
    sceneId: 'hug_help_entry',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText:
      '这里不会发消息。网络未接通或离线模式，无法发送至远程，请寻找身边的信任成年人。如果你想找身边信任的大人，我们可以直接走到身边的大人面前，拉拉大人的衣角说“我想要个抱抱”。',
  },
  {
    lineId: 'hug.instant.offline_dad',
    sceneId: 'hug_help_entry',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText:
      '这里不会发消息。网络未接通或离线模式，无法发送至远程，请寻找身边的信任成年人。如果你想找爸爸，我们可以直接走到身边的大人面前，拉拉大人的衣角说“我想要个抱抱”。',
  },
  {
    lineId: 'hug.instant.offline_mom',
    sceneId: 'hug_help_entry',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText:
      '这里不会发消息。网络未接通或离线模式，无法发送至远程，请寻找身边的信任成年人。如果你想找妈妈，我们可以直接走到身边的大人面前，拉拉大人的衣角说“我想要个抱抱”。',
  },
  {
    lineId: 'hug.async.offline_notice',
    sceneId: 'hug_help_entry',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText:
      '当前无网络连接或离线模式，无法发送至远程，请寻找身边的信任成年人。这句想念仅在当前页面存在，不需要等回复，你可以去玩别的啦。',
  },

  // 11. 个性化设置与试听台 (Personalization & Voice Audition)
  {
    lineId: 'audition.preset.breathe',
    sceneId: 'personalization_audition',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '你好呀，今天我们一起做深呼吸，慢慢退后一步看一看。',
  },
  {
    lineId: 'audition.preset.blocks',
    sceneId: 'personalization_audition',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '我看到你的积木倒了，心里有点难过对吗？这很正常，大人也会这样。',
  },
  {
    lineId: 'audition.preset.responsibility',
    sceneId: 'personalization_audition',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '大人不住在一个房子里，是大人的决定。这件事百分之百不是因为你。',
  },
  {
    lineId: 'audition.preset.sleeve',
    sceneId: 'personalization_audition',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '身边有老师或者家人时，可以直接走到他们面前拉拉衣角。',
  },
  {
    lineId: 'personalization.interest.drawing',
    sceneId: 'personalization_audition',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '太棒啦，接下来侦探小游戏会优先为你准备小画笔与色彩的主题场景！',
  },
  {
    lineId: 'personalization.interest.soccer',
    sceneId: 'personalization_audition',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '太棒啦，接下来侦探小游戏会优先为你准备绿茵小足球的主题场景！',
  },
  {
    lineId: 'personalization.interest.animals',
    sceneId: 'personalization_audition',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '太棒啦，接下来侦探小游戏会优先为你准备森林小动物的主题场景！',
  },
  {
    lineId: 'personalization.interest.puzzles',
    sceneId: 'personalization_audition',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '太棒啦，接下来侦探小游戏会优先为你准备积木与拼图的主题场景！',
  },
  {
    lineId: 'personalization.style.hands_on',
    sceneId: 'personalization_audition',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '喜欢直接动手操作',
  },
  {
    lineId: 'personalization.style.story_first',
    sceneId: 'personalization_audition',
    category: 'FINITE_PARAM_COMBO',
    isCompanionSelfIntro: false,
    sharedText: '喜欢先听小故事',
  },
  {
    lineId: 'personalization.voice.enabled',
    sceneId: 'personalization_audition',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '语音提示已开启',
  },
  {
    lineId: 'personalization.guide.choose_companion',
    sceneId: 'personalization_audition',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '选择你喜欢的动物伙伴，它们会陪你一起在小岛上探索。',
  },
  {
    lineId: 'personalization.guide.choose_interest',
    sceneId: 'personalization_audition',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '选择你喜欢的活动，例如画画、足球、小动物或者拼图。',
  },
  {
    lineId: 'personalization.reset.default',
    sceneId: 'personalization_audition',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '偏好已恢复为初始状态。',
  },
  {
    lineId: 'personalization.reset.clear_all',
    sceneId: 'personalization_audition',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '已彻底清除本地保存的偏好，恢复无痕状态。',
  },
  {
    lineId: 'starlight.header_intro',
    sceneId: 'starlight_medals',
    category: 'FIXED_LINE',
    isCompanionSelfIntro: false,
    sharedText: '星光小屋：家庭形态只是拼图中的一块。你有很多特长，也在学新本领，完整的你很大很大！',
  },
];

/**
 * 全站 `speechNarrator.speak()` 调用源头分类清单 (V1.1 Section II)
 */
export const VOICE_CALL_SITE_CATALOG: VoiceCallSiteDescriptor[] = [
  {
    sourceId: 'CompanionBanner.greeting',
    file: 'src/components/ChildIsland/CompanionBanner.tsx',
    sceneId: 'island_home_companion',
    category: 'FINITE_PARAM_COMBO',
    description: '首页伙伴自我介绍与会话记忆问候',
    lineIds: ['companion.self_intro.short', 'companion.greeting.full', 'companion.greeting.body'],
  },
  {
    sourceId: 'FairytaleIslandMap.landmarks',
    file: 'src/components/ChildIsland/FairytaleIslandMap.tsx',
    sceneId: 'island_landmarks',
    category: 'FIXED_LINE',
    description: '2.5D 童话小岛全岛导览与八大地标固定语音介绍',
    lineIds: [
      'island.map.welcome_overview',
      'island.landmark.weather',
      'island.landmark.story',
      'island.landmark.detective',
      'island.landmark.courage',
      'island.landmark.bridge',
      'island.landmark.starlight',
      'island.landmark.calm',
      'island.landmark.breaker',
    ],
  },
  {
    sourceId: 'LocationCard.audioAffordance',
    file: 'src/components/ChildIsland/LocationCard.tsx',
    sceneId: 'island_landmarks',
    category: 'FINITE_PARAM_COMBO',
    description: '清晰卡片视图 7 个地点的喇叭按钮导览',
    lineIds: [
      'island.card.weather',
      'island.card.story',
      'island.card.detective',
      'island.card.courage',
      'island.card.bridge',
      'island.card.starlight',
      'island.card.calm',
    ],
  },
  {
    sourceId: 'AlwaysReachableCalmCard.intro',
    file: 'src/components/ChildIsland/AlwaysReachableCalmCard.tsx',
    sceneId: 'calm_corner',
    category: 'FIXED_LINE',
    description: '首页常驻绿草呼吸平静角与拆解台导览',
    lineIds: ['island.card.calm_banner'],
  },
  {
    sourceId: 'WeatherStationModal.weatherAndResponses',
    file: 'src/components/ChildIsland/WeatherStationModal.tsx',
    sceneId: 'weather_station',
    category: 'FINITE_PARAM_COMBO',
    description: '情绪天气站开场、6 种天气卡片及不选/找大人回应',
    lineIds: [
      'weather.prompt.entry',
      'weather.option.sunny',
      'weather.option.cloudy',
      'weather.option.rainy',
      'weather.option.stormy',
      'weather.option.foggy',
      'weather.option.skip_quiet',
      'weather.feedback.skip_ok',
      'weather.feedback.stormy_empathy',
      'weather.feedback.rainy_empathy',
      'weather.feedback.decline_calm_ok',
      'weather.feedback.seek_adult',
    ],
  },
  {
    sourceId: 'CalmSpace.breathingPhases',
    file: 'src/components/ChildIsland/CalmSpace.tsx',
    sceneId: 'calm_corner',
    category: 'FINITE_PARAM_COMBO',
    description: '绿草平静角吸气、停一停、呼气、休息四阶段呼吸引导',
    lineIds: ['calm.phase.inhale', 'calm.phase.hold', 'calm.phase.exhale', 'calm.phase.rest'],
  },
  {
    sourceId: 'CrayonDetectiveGame.introsAndDynamicClues',
    file: 'src/components/InteractiveGames/CrayonDetectiveGame/CrayonDetectiveGame.tsx',
    sceneId: 'crayon_detective',
    category: 'DYNAMIC_BEHAVIOR_FEEDBACK',
    description: '蜡笔侦探 4 大主题开场/重置/不知道固定语音 + 线索探查与假设修正动态反馈',
    lineIds: [
      'detective.intro.drawing',
      'detective.intro.soccer',
      'detective.intro.animals',
      'detective.intro.puzzles',
      'detective.feedback.unknown_ok',
      'detective.feedback.reset',
    ],
  },
  {
    sourceId: 'FriendAsksHomeGame.introsAndDialogue',
    file: 'src/components/InteractiveGames/FriendAsksHomeGame/FriendAsksHomeGame.tsx',
    sceneId: 'friend_asks_home',
    category: 'DYNAMIC_BEHAVIOR_FEEDBACK',
    description: '朋友问起家里事双情境开场/重置固定语音 + 轮次分支回应动态反馈',
    lineIds: ['friend.intro.two_homes', 'friend.intro.neutral_pickup', 'friend.feedback.reset'],
  },
  {
    sourceId: 'ToyBoatNegotiationGame.introsAndSimulation',
    file: 'src/components/InteractiveGames/ToyBoatNegotiationGame/ToyBoatNegotiationGame.tsx',
    sceneId: 'toy_boat_negotiation',
    category: 'DYNAMIC_BEHAVIOR_FEEDBACK',
    description: '轮流玩小船双情境开场/重置固定语音 + 拖拽区域/秒数/模拟结果动态反馈',
    lineIds: ['boat.intro.pond', 'boat.intro.creek', 'boat.feedback.reset'],
  },
  {
    sourceId: 'StoryGroveModal.interactiveStoriesAndCamp',
    file: 'src/components/ChildIsland/StoryGrove/StoryGroveModal.tsx',
    sceneId: 'story_grove',
    category: 'DYNAMIC_BEHAVIOR_FEEDBACK',
    description: '故事森林杯子对比、小火车与树屋露营夜核心固定台词 + 热点与行动结果反馈',
    lineIds: [
      'story.cup.opening',
      'story.cup.move_block',
      'story.cup.move_bucket',
      'story.cup.move_center',
      'story.train.opening',
      'camp.opening',
      'camp.unknown_ok',
    ],
  },
  {
    sourceId: 'TwoHomesBridgeModal.multiSliceTransition',
    file: 'src/components/ChildIsland/TwoHomesBridge/TwoHomesBridgeModal.tsx',
    sceneId: 'two_homes_bridge',
    category: 'FINITE_PARAM_COMBO',
    description: '双向小桥中性首次入口 + 双向不舍/忠诚冲突/具体担忧/日常顺畅全部分支台词',
    lineIds: [
      'bridge.entry.neutral_first_visit',
      'bridge.entry.story_mode',
      'bridge.entry.welcome',
      'bridge.ordinary.intro',
      'bridge.ordinary.outcome',
      'bridge.slice_a.intro',
      'bridge.slice_a.star_here',
      'bridge.slice_a.star_there',
      'bridge.slice_a.both_stars',
      'bridge.slice_a.pace_stone',
      'bridge.slice_a.pocket_bag',
      'bridge.slice_a.outcome_no_hug',
      'bridge.slice_a.outcome_both_stars',
      'bridge.slice_a.outcome_fist_bump',
      'bridge.slice_b.intro',
      'bridge.slice_b.fact_sorted',
      'bridge.slice_b.guess_sorted',
      'bridge.slice_b.boundary_sorted',
      'bridge.slice_b.pref_both',
      'bridge.slice_b.pref_asymmetric',
      'bridge.slice_b.outcome_adult_emotion',
      'bridge.slice_b.outcome_no_messenger',
      'bridge.slice_b.outcome_honest_pref',
      'bridge.slice_c.intro',
      'bridge.slice_c.reason_parting',
      'bridge.slice_c.reason_schedule',
      'bridge.slice_c.reason_environment',
      'bridge.slice_c.reason_unsure',
      'bridge.slice_c.reason_safety',
      'bridge.slice_c.outcome_schedule',
      'bridge.slice_c.outcome_routine',
      'bridge.slice_c.outcome_reunion',
      'bridge.slice_c.outcome_quiet_bench',
      'bridge.slice_c.outcome_safety_shield',
      'bridge.slice_c.outcome_stay_safe',
      'bridge.common.pause_exit',
      'bridge.common.retry',
      'bridge.common.utility_drawer',
    ],
  },
  {
    sourceId: 'DifficultyBreakerModal.multiDimensionalBreaker',
    file: 'src/components/ChildIsland/DifficultyBreaker/DifficultyBreakerModal.tsx',
    sceneId: 'difficulty_breaker',
    category: 'FINITE_PARAM_COMBO',
    description: '大困难拆解台开场、换家四分支引导与踏脚石完成/暂停反馈',
    lineIds: [
      'breaker.entry.greeting',
      'breaker.transition.dual_attachment',
      'breaker.transition.loyalty_conflict',
      'breaker.transition.specific_concern',
      'breaker.transition.ordinary_happy',
      'breaker.outcome.step_selected',
      'breaker.outcome.pause_rest',
    ],
  },
  {
    sourceId: 'HugSupportEntryAndButton.honestOfflineHelp',
    file: 'src/components/ChildIsland/HugSupportEntry.tsx',
    sceneId: 'hug_help_entry',
    category: 'FINITE_PARAM_COMBO',
    description: '现实求助入口与找大人抱抱按钮诚实本地引导语音',
    lineIds: [
      'hug.button.nearby_adult',
      'hug.entry.arrived_dismiss',
      'hug.entry.pull_sleeve',
      'hug.entry.trusted_adult',
      'hug.entry.quiet_alone_ok',
      'hug.instant.offline_nearby',
      'hug.instant.offline_dad',
      'hug.instant.offline_mom',
      'hug.async.offline_notice',
    ],
  },
  {
    sourceId: 'PersonalizationAndAudition.settings',
    file: 'src/components/ChildIsland/Personalization/PersonalizationSettingsModal.tsx',
    sceneId: 'personalization_audition',
    category: 'FINITE_PARAM_COMBO',
    description: '个性化偏好设置与四角色声音试听台全部预设语音',
    lineIds: [
      'audition.preset.breathe',
      'audition.preset.blocks',
      'audition.preset.responsibility',
      'audition.preset.sleeve',
      'personalization.interest.drawing',
      'personalization.interest.soccer',
      'personalization.interest.animals',
      'personalization.interest.puzzles',
      'personalization.style.hands_on',
      'personalization.style.story_first',
      'personalization.voice.enabled',
      'personalization.guide.choose_companion',
      'personalization.guide.choose_interest',
      'personalization.reset.default',
      'personalization.reset.clear_all',
    ],
  },
  {
    sourceId: 'FreeInputAndCustomQuotes.unbounded',
    file: 'src/components/ChildIsland/StarlightCabin/StarlightCabinModal.tsx',
    sceneId: 'starlight_medals',
    category: 'FREE_INPUT_OR_UNBOUNDED',
    description: '儿童自由输入特长拼图、自创金句或组合式句式积木（走诚实系统语音回退，绝不冒用其他角色 MP3）',
    lineIds: ['starlight.header_intro'],
  },
];

const NORM_KEY_TO_ENTRY_MAP = new Map<string, VoiceLineRegistryEntry>();
for (const entry of VOICE_LINE_REGISTRY) {
  if (entry.sharedText) {
    NORM_KEY_TO_ENTRY_MAP.set(normalizeVoiceLookupKey(entry.sharedText), entry);
  }
  if (entry.companionTexts) {
    for (const txt of Object.values(entry.companionTexts)) {
      NORM_KEY_TO_ENTRY_MAP.set(normalizeVoiceLookupKey(txt), entry);
    }
  }
}

const ALL_COMPANION_IDS: AnimalCompanionId[] = [
  'guoguo_squirrel',
  'beibei_otter',
  'tiantian_raccoon',
  'qiqi_deer',
];

/**
 * 识别并转换伙伴专属自我介绍文本：
 * - 当旧角色朗读过“我是果果”或“你好呀！我是果果……”后切换到新角色（如奇奇），
 *   重听或朗读中断续播时自动转换为新角色对应的自我介绍（如“我是奇奇”或“你好呀！我是奇奇……”），
 *   严禁旧角色专属自我介绍残留为新角色的重听内容。
 */
export function adaptCompanionSelfIntroText(
  text: string,
  targetCompanionId: AnimalCompanionId
): {
  adaptedText: string;
  wasAdapted: boolean;
  lineId: string | null;
  isCompanionSelfIntro: boolean;
} {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      adaptedText: text,
      wasAdapted: false,
      lineId: null,
      isCompanionSelfIntro: false,
    };
  }

  const norm = normalizeVoiceLookupKey(trimmed);
  const targetCompanion = ANIMAL_COMPANIONS[targetCompanionId] || ANIMAL_COMPANIONS.guoguo_squirrel;

  // 1. 短版自我介绍：“我是果果” / “我是贝贝” / “我是天天” / “我是奇奇”
  for (const cid of ALL_COMPANION_IDS) {
    const shortIntro = COMPANION_SHORT_SELF_INTROS[cid];
    if (norm === normalizeVoiceLookupKey(shortIntro)) {
      const hasTrailingPeriod = /[。！!]$/.test(trimmed);
      const nextText = hasTrailingPeriod
        ? `${COMPANION_SHORT_SELF_INTROS[targetCompanionId]}。`
        : COMPANION_SHORT_SELF_INTROS[targetCompanionId];
      return {
        adaptedText: nextText,
        wasAdapted: nextText !== text,
        lineId: 'companion.self_intro.short',
        isCompanionSelfIntro: true,
      };
    }
  }

  // 2. 完整问候语：“你好呀！我是果果。我是小松鼠果果……”（含天天的备用欢迎语）
  const legacyFullGreetings: Array<{ cid: AnimalCompanionId; text: string }> = [
    { cid: 'guoguo_squirrel', text: COMPANION_FULL_GREETINGS.guoguo_squirrel },
    { cid: 'beibei_otter', text: COMPANION_FULL_GREETINGS.beibei_otter },
    { cid: 'tiantian_raccoon', text: COMPANION_FULL_GREETINGS.tiantian_raccoon },
    {
      cid: 'tiantian_raccoon',
      text: '你好呀！我是天天。我是小浣熊天天，再乱的小书包和难题，我们一步一步就能理清楚。',
    },
    { cid: 'qiqi_deer', text: COMPANION_FULL_GREETINGS.qiqi_deer },
    {
      cid: 'qiqi_deer',
      text: '你好呀！我是奇奇。我是小鹿奇奇，每个人心里都有好多颗闪亮的小星星，我们一起去看看吧。',
    },
  ];
  for (const item of legacyFullGreetings) {
    if (norm === normalizeVoiceLookupKey(item.text)) {
      const nextText = COMPANION_FULL_GREETINGS[targetCompanionId];
      return {
        adaptedText: nextText,
        wasAdapted: nextText !== text,
        lineId: 'companion.greeting.full',
        isCompanionSelfIntro: true,
      };
    }
  }

  // 3. 仅问候语正文：“我是小松鼠果果……”
  const legacyBodyGreetings: Array<{ cid: AnimalCompanionId; text: string }> = [
    { cid: 'guoguo_squirrel', text: COMPANION_BODY_GREETINGS.guoguo_squirrel },
    { cid: 'beibei_otter', text: COMPANION_BODY_GREETINGS.beibei_otter },
    { cid: 'tiantian_raccoon', text: COMPANION_BODY_GREETINGS.tiantian_raccoon },
    {
      cid: 'tiantian_raccoon',
      text: '我是小浣熊天天，再乱的小书包和难题，我们一步一步就能理清楚。',
    },
    { cid: 'qiqi_deer', text: COMPANION_BODY_GREETINGS.qiqi_deer },
    {
      cid: 'qiqi_deer',
      text: '我是小鹿奇奇，每个人心里都有好多颗闪亮的小星星，我们一起去看看吧。',
    },
  ];
  for (const item of legacyBodyGreetings) {
    if (norm === normalizeVoiceLookupKey(item.text)) {
      const nextText = COMPANION_BODY_GREETINGS[targetCompanionId];
      return {
        adaptedText: nextText,
        wasAdapted: nextText !== text,
        lineId: 'companion.greeting.body',
        isCompanionSelfIntro: true,
      };
    }
  }

  // 4. 首页伙伴记忆组合问候：“你好呀！我是<旧伙伴>。{sessionMemory.companionReactionText}”
  const sessionMemoryPrefixMatch = trimmed.match(
    /^你好呀[！!]?\s*我是(果果|贝贝|天天|奇奇)[。，,！!]?\s*(.+)$/
  );
  if (sessionMemoryPrefixMatch) {
    const remainder = sessionMemoryPrefixMatch[2];
    const nextText = `你好呀！我是${targetCompanion.name}。${remainder}`;
    return {
      adaptedText: nextText,
      wasAdapted: nextText !== text,
      lineId: 'companion.greeting.session_memory',
      isCompanionSelfIntro: true,
    };
  }

  // 5. 泛化包含“我是(果果|贝贝|天天|奇奇)”的自我介绍语句
  if (/我是(果果|贝贝|天天|奇奇)/.test(trimmed)) {
    const nextText = trimmed
      .replace(/我是(小松鼠果果|小海獭贝贝|小浣熊天天|小鹿奇奇)/g, `我是${targetCompanion.animal}${targetCompanion.name}`)
      .replace(/我是(果果|贝贝|天天|奇奇)/g, `我是${targetCompanion.name}`);
    return {
      adaptedText: nextText,
      wasAdapted: nextText !== text,
      lineId: 'companion.self_intro.custom',
      isCompanionSelfIntro: true,
    };
  }

  return {
    adaptedText: text,
    wasAdapted: false,
    lineId: null,
    isCompanionSelfIntro: false,
  };
}

/**
 * 根据播放文本与可选参数解析统一的 `lineId`、`sceneId` 与分类元数据
 */
export function resolveVoiceLineMetadata(
  text: string,
  companionId: AnimalCompanionId,
  explicitLineId?: string,
  explicitSceneId?: VoiceSceneId
): {
  lineId: string;
  sceneId: VoiceSceneId;
  category: VoiceCallCategory;
  isCompanionSelfIntro: boolean;
} {
  const selfIntroCheck = adaptCompanionSelfIntroText(text, companionId);
  if (selfIntroCheck.isCompanionSelfIntro && selfIntroCheck.lineId) {
    return {
      lineId: explicitLineId || selfIntroCheck.lineId,
      sceneId: explicitSceneId || 'island_home_companion',
      category: 'FINITE_PARAM_COMBO',
      isCompanionSelfIntro: true,
    };
  }

  const normKey = normalizeVoiceLookupKey(text);
  const registered = NORM_KEY_TO_ENTRY_MAP.get(normKey);
  if (registered) {
    return {
      lineId: explicitLineId || registered.lineId,
      sceneId: explicitSceneId || registered.sceneId,
      category: registered.category,
      isCompanionSelfIntro: registered.isCompanionSelfIntro,
    };
  }

  // Fallback classification for dynamic feedback or unbounded input
  const hashSuffix = normKey.slice(0, 18) || 'empty';
  return {
    lineId: explicitLineId || `dynamic.${explicitSceneId || 'general_narration'}.${hashSuffix}`,
    sceneId: explicitSceneId || 'general_narration',
    category: 'DYNAMIC_BEHAVIOR_FEEDBACK',
    isCompanionSelfIntro: false,
  };
}

/**
 * 审计全站注册的固定台词与有限参数组合台词是否具备完整的四角色预制神经语音覆盖
 */
const COMPANION_VOICE_PROFILE_MAP: Record<AnimalCompanionId, string> = {
  guoguo_squirrel: 'playful-buddy',
  beibei_otter: 'warm-sister',
  tiantian_raccoon: 'gentle-guide',
  qiqi_deer: 'starlight-companion',
};

export function auditGlobalFourCompanionCoverage(): {
  totalRegisteredLines: number;
  fullyCoveredLines: number;
  missingEntries: Array<{ lineId: string; companionId: AnimalCompanionId; profileId: string; text: string }>;
} {
  const missingEntries: Array<{
    lineId: string;
    companionId: AnimalCompanionId;
    profileId: string;
    text: string;
  }> = [];
  let fullyCoveredLines = 0;

  for (const entry of VOICE_LINE_REGISTRY) {
    let entryComplete = true;
    if (entry.sharedText) {
      const normKey = normalizeVoiceLookupKey(entry.sharedText);
      for (const cid of ALL_COMPANION_IDS) {
        const profileId = COMPANION_VOICE_PROFILE_MAP[cid];
        const manifestHit: PrebakedTtsEntry | undefined =
          PREBAKED_TTS_BY_PROFILE_KEY[`${profileId}:${normKey}`];
        if (!manifestHit || manifestHit.profileId !== profileId) {
          entryComplete = false;
          missingEntries.push({
            lineId: entry.lineId,
            companionId: cid,
            profileId,
            text: entry.sharedText,
          });
        }
      }
    } else if (entry.companionTexts) {
      for (const cid of ALL_COMPANION_IDS) {
        const profileId = COMPANION_VOICE_PROFILE_MAP[cid];
        const text = entry.companionTexts[cid];
        const normKey = normalizeVoiceLookupKey(text);
        const manifestHit: PrebakedTtsEntry | undefined =
          PREBAKED_TTS_BY_PROFILE_KEY[`${profileId}:${normKey}`];
        if (!manifestHit || manifestHit.profileId !== profileId) {
          entryComplete = false;
          missingEntries.push({
            lineId: entry.lineId,
            companionId: cid,
            profileId,
            text,
          });
        }
      }
    }
    if (entryComplete) {
      fullyCoveredLines += 1;
    }
  }

  return {
    totalRegisteredLines: VOICE_LINE_REGISTRY.length,
    fullyCoveredLines,
    missingEntries,
  };
}
