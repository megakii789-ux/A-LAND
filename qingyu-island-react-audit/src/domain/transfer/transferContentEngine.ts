import {
  StructureId,
  LeafDefinition,
  ContentFilterCriteria,
} from './types';
import { validateLeafDefinition } from './transferValidator';

/**
 * 28 张标准叶子集：
 * 每个结构包含：
 * - 2 training leaves
 * - 1 held-out transfer leaf (绝对不泄露工具名称)
 * - 1 surface-similar but structure-different foil (干扰叶)
 */
export const SEED_TRANSFER_LEAVES: ReadonlyArray<LeafDefinition> = [
  // =========================================================================
  // 1. FACT_VS_INFERENCE (事实与猜想分离)
  // =========================================================================
  {
    leafId: 'fact_infer_train_1',
    title: '积木城堡倒了',
    structureId: StructureId.FACT_VS_INFERENCE,
    posture: 'FEN',
    surfaceDomain: 'daily_routine',
    emotionalWeight: 'light',
    personalDistance: 'character',
    cognitiveLoad: 'low',
    boundary: 'NONE',
    isHeldOutTransfer: false,
    scaffoldTier: 1,
    targetAgeMin: 6,
    associatedToolName: '放大镜',
    promptSpokenText: '小熊看到地上的积木倒了，心里想：“一定是小兔子故意推倒的！”我们用放大镜看看，什么是真的看到的？',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '看到的事实：积木散在地毯上', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '脑袋里的猜想：小兔子故意推的', isKeyAction: false },
    ],
    reflectionComparison: {
      comparedLeafId: 'fact_infer_train_2',
      situationA: '小熊看到积木散在地上',
      situationB: '小狗看到门砰的一声关上了',
      sharedCoreQuestion: '什么是眼睛真正看到的，什么是心里猜出来的？',
    },
  },
  {
    leafId: 'fact_infer_train_2',
    title: '大风吹关了房门',
    structureId: StructureId.FACT_VS_INFERENCE,
    posture: 'FEN',
    surfaceDomain: 'daily_routine',
    emotionalWeight: 'light',
    personalDistance: 'character',
    cognitiveLoad: 'low',
    boundary: 'NONE',
    isHeldOutTransfer: false,
    scaffoldTier: 2,
    targetAgeMin: 6,
    associatedToolName: '放大镜',
    promptSpokenText: '门“砰”的一声关上了！小狗吓了一跳，想：“妈妈生气摔门了！”我们用放大镜分一分。',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '耳朵听到的：门发出了砰的一声', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '心里的猜想：有人在生气摔门', isKeyAction: false },
    ],
    reflectionComparison: {
      comparedLeafId: 'fact_infer_train_1',
      situationA: '小狗听到门砰的一声响',
      situationB: '小熊看到积木倒在地上',
      sharedCoreQuestion: '耳朵听到的声音，和脑袋里猜的原因，是一回事吗？',
    },
  },
  {
    leafId: 'fact_infer_heldout',
    title: '同桌今天没打招呼',
    structureId: StructureId.FACT_VS_INFERENCE,
    posture: 'FEN',
    surfaceDomain: 'school', // 跨情境：进入学校
    emotionalWeight: 'medium',
    personalDistance: 'peer',
    cognitiveLoad: 'moderate',
    boundary: 'NONE',
    isHeldOutTransfer: true,
    scaffoldTier: 3,
    targetAgeMin: 6,
    associatedToolName: '放大镜', // 铁律：在 held-out 的 prompt 和 options 中绝不出现“放大镜”字样
    promptSpokenText: '早上走进教室，同桌低着头走过去，没有跟你挥手。这时候可以怎么想？',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '看到的事实：同桌低着头走过去了', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '他在想心事，或者没看清，不一定是讨厌我', isKeyAction: true },
    ],
    reflectionComparison: {
      comparedLeafId: 'fact_infer_train_2',
      situationA: '朋友走过去没跟我挥手',
      situationB: '门突然砰的一声关上了',
      sharedCoreQuestion: '没看清原因的时候，不要先把最坏的猜想当成真的。',
    },
  },
  {
    leafId: 'fact_infer_foil',
    title: '走廊里踩到别人鞋子',
    structureId: StructureId.BEHAVIOR_PERSON_SEPARATION, // 表面相似：学校同伴摩擦；结构不同：行为与人分离，非事实猜想
    posture: 'FEN',
    surfaceDomain: 'school',
    emotionalWeight: 'medium',
    personalDistance: 'peer',
    cognitiveLoad: 'moderate',
    boundary: 'NONE',
    isHeldOutTransfer: false,
    isFoil: true,
    scaffoldTier: 2,
    targetAgeMin: 6,
    promptSpokenText: '在走廊排队时不小心踩到了同学的脚，同学喊：“你太讨厌了！”',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '是不小心踩脚的行为不好，但我不是坏孩子', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '赶紧说对不起并退后一步', isKeyAction: true },
    ],
  },

  // =========================================================================
  // 2. PERSPECTIVE_DEPENDENT_EFFECT (位置决定视角效应)
  // =========================================================================
  {
    leafId: 'persp_train_1',
    title: '一场大雨落下来',
    structureId: StructureId.PERSPECTIVE_DEPENDENT_EFFECT,
    posture: 'TONG',
    surfaceDomain: 'nature',
    emotionalWeight: 'light',
    personalDistance: 'character',
    cognitiveLoad: 'low',
    boundary: 'NONE',
    isHeldOutTransfer: false,
    scaffoldTier: 1,
    targetAgeMin: 6,
    associatedToolName: '双面币',
    promptSpokenText: '天上下起了大雨！小青蛙在池塘里呱呱欢呼，想要出门野餐的小兔子却叹气了。用双面币转一转，雨对谁好？',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '站在小青蛙那边看：洗个凉快澡，太棒了！', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '站在小兔子那边看：草地湿了，不能野餐了', isKeyAction: true },
    ],
    reflectionComparison: {
      comparedLeafId: 'persp_train_2',
      situationA: '池塘下雨小青蛙高兴小兔子难过',
      situationB: '大象和小老鼠看桌上的水杯',
      sharedCoreQuestion: '同一个东西，站在不同地方看，感觉一样吗？',
    },
  },
  {
    leafId: 'persp_train_2',
    title: '水杯到底大还是小',
    structureId: StructureId.PERSPECTIVE_DEPENDENT_EFFECT,
    posture: 'TONG',
    surfaceDomain: 'daily_routine',
    emotionalWeight: 'light',
    personalDistance: 'character',
    cognitiveLoad: 'low',
    boundary: 'NONE',
    isHeldOutTransfer: false,
    scaffoldTier: 2,
    targetAgeMin: 6,
    associatedToolName: '双面币',
    promptSpokenText: '桌上放着一只杯子。小蚂蚁仰着头说像高山，长颈鹿低头看说像个小汤圆。',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '对小蚂蚁来说：比身体大好多好多', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '对长颈鹿来说：一口就能喝掉', isKeyAction: true },
    ],
    reflectionComparison: {
      comparedLeafId: 'persp_train_1',
      situationA: '同一只杯子对蚂蚁是大、对长颈鹿是小',
      situationB: '同一场雨对青蛙是好、对兔子是坏',
      sharedCoreQuestion: '没有绝对的大或小，看我们在拿它跟谁比。',
    },
  },
  {
    leafId: 'persp_heldout',
    title: '爸爸妈妈的不同作息',
    structureId: StructureId.PERSPECTIVE_DEPENDENT_EFFECT,
    posture: 'TONG',
    surfaceDomain: 'two_homes', // 跨情境：两个家
    emotionalWeight: 'medium',
    personalDistance: 'peer',
    cognitiveLoad: 'moderate',
    boundary: 'NONE',
    isHeldOutTransfer: true,
    scaffoldTier: 3,
    targetAgeMin: 6,
    associatedToolName: '双面币', // 铁律：在 held-out 的 prompt 和 options 中绝不出现“双面币”
    promptSpokenText: '在爸爸家晚上八点就要上床听故事，在妈妈家可以搭积木到八点半。两边为什么不一样呢？',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '爸爸早上要早起上班，妈妈晚上有更多时间陪我', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '两个家的时间表不同，但都在照顾我', isKeyAction: true },
    ],
    reflectionComparison: {
      comparedLeafId: 'persp_train_1',
      situationA: '爸爸家和妈妈家的作息时间不一样',
      situationB: '下雨天青蛙高兴而小兔子不高兴',
      sharedCoreQuestion: '每个人有自己的节奏和位置，两边都有各自的道理。',
    },
  },
  {
    leafId: 'persp_foil',
    title: '收拾两个家的书包',
    structureId: StructureId.CHOICE_TRADEOFF, // 表面相似：两家往返；结构不同：权衡取舍，非视角效应
    posture: 'ZE',
    surfaceDomain: 'two_homes',
    emotionalWeight: 'medium',
    personalDistance: 'peer',
    cognitiveLoad: 'moderate',
    boundary: 'NONE',
    isHeldOutTransfer: false,
    isFoil: true,
    scaffoldTier: 2,
    targetAgeMin: 6,
    promptSpokenText: '书包容量只有这么大，装了画画彩笔就装不下大恐龙玩具了，该怎么选？',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '这次带彩笔画画，恐龙留在这边下次玩', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '无论选哪样，都能开心地玩', isKeyAction: true },
    ],
  },

  // =========================================================================
  // 3. CHOICE_TRADEOFF (选择权衡与取舍)
  // =========================================================================
  {
    leafId: 'choice_train_1',
    title: '买蜡笔还是买皮球',
    structureId: StructureId.CHOICE_TRADEOFF,
    posture: 'ZE',
    surfaceDomain: 'daily_routine',
    emotionalWeight: 'light',
    personalDistance: 'character',
    cognitiveLoad: 'low',
    boundary: 'NONE',
    isHeldOutTransfer: false,
    scaffoldTier: 1,
    targetAgeMin: 6,
    associatedToolName: '小天平',
    promptSpokenText: '兜里的小卡片只能换一样礼物：小熊想要彩色蜡笔画画，又想要红皮球去草地拍。放到小天平上比一比吧！',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '选蜡笔：可以画大恐龙，但今天不能拍球了', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '选皮球：可以去草地跑，但今天不能涂色了', isKeyAction: true },
    ],
    reflectionComparison: {
      comparedLeafId: 'choice_train_2',
      situationA: '小熊在蜡笔和皮球之间挑一样',
      situationB: '小猫在睡懒觉和早起去公园之间挑一样',
      sharedCoreQuestion: '选了这个就得先放下那个，但选好了就能开开心心玩。',
    },
  },
  {
    leafId: 'choice_train_2',
    title: '多睡十分钟还是去早市',
    structureId: StructureId.CHOICE_TRADEOFF,
    posture: 'ZE',
    surfaceDomain: 'daily_routine',
    emotionalWeight: 'light',
    personalDistance: 'character',
    cognitiveLoad: 'low',
    boundary: 'NONE',
    isHeldOutTransfer: false,
    scaffoldTier: 2,
    targetAgeMin: 6,
    associatedToolName: '小天平',
    promptSpokenText: '早晨闹钟响了。小猫想在暖和的被窝里多躺一会儿，又想跟爷爷去看热气腾腾的早市小金鱼。小天平两边都有好处。',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '多睡会儿：身上暖洋洋，但可能看不到金鱼了', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '立刻起床：能看小金鱼，但得揉揉眼睛爬起来', isKeyAction: true },
    ],
    reflectionComparison: {
      comparedLeafId: 'choice_train_1',
      situationA: '暖被窝和看金鱼各有各的好',
      situationB: '买蜡笔和买皮球各有各的好',
      sharedCoreQuestion: '没有十全十美的事，想好最想要什么就行。',
    },
  },
  {
    leafId: 'choice_heldout',
    title: '周末选去游乐园还是看外婆',
    structureId: StructureId.CHOICE_TRADEOFF,
    posture: 'ZE',
    surfaceDomain: 'playground', // 跨情境：周末社交与游玩
    emotionalWeight: 'medium',
    personalDistance: 'peer',
    cognitiveLoad: 'moderate',
    boundary: 'NONE',
    isHeldOutTransfer: true,
    scaffoldTier: 3,
    targetAgeMin: 6,
    associatedToolName: '小天平', // 铁律：在 held-out 的 prompt 和 options 中绝不出现“小天平”
    promptSpokenText: '周六下午只有半天时间。好朋友约你去儿童乐园玩滑梯，外婆也烤了你最爱吃的苹果派等你去。',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '去游乐园：能跟朋友滑滑梯，下周再去看外婆', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '去看外婆：能吃到热苹果派，跟朋友改约周日', isKeyAction: true },
    ],
    reflectionComparison: {
      comparedLeafId: 'choice_train_1',
      situationA: '游乐园和外婆家只能挑一个先去',
      situationB: '蜡笔和皮球只能挑一个先买',
      sharedCoreQuestion: '两边都很棒，先选一个，另一个留到下次，不贪心也不难过。',
    },
  },
  {
    leafId: 'choice_foil',
    title: '游乐场里谁先滑滑梯',
    structureId: StructureId.PERSPECTIVE_DEPENDENT_EFFECT, // 表面相似：游乐场；结构不同：视角与共情，非自主权衡
    posture: 'TONG',
    surfaceDomain: 'playground',
    emotionalWeight: 'medium',
    personalDistance: 'peer',
    cognitiveLoad: 'moderate',
    boundary: 'NONE',
    isHeldOutTransfer: false,
    isFoil: true,
    scaffoldTier: 2,
    targetAgeMin: 6,
    promptSpokenText: '滑梯前排了很长的队，前面的小朋友走得很慢，后面的小朋友直跺脚。',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '前面的小朋友可能有点害怕高，走得慢', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '后面的小朋友很想快点滑，所以有点着急', isKeyAction: true },
    ],
  },

  // =========================================================================
  // 4. MULTI_ATTRIBUTE_IDENTITY (多属性身份与客体认知)
  // =========================================================================
  {
    leafId: 'multi_attr_train_1',
    title: '苹果树的春夏秋冬',
    structureId: StructureId.MULTI_ATTRIBUTE_IDENTITY,
    posture: 'FEN',
    surfaceDomain: 'nature',
    emotionalWeight: 'light',
    personalDistance: 'character',
    cognitiveLoad: 'low',
    boundary: 'NONE',
    isHeldOutTransfer: false,
    scaffoldTier: 1,
    targetAgeMin: 6,
    associatedToolName: '多面魔方',
    promptSpokenText: '春天苹果树开满白花，夏天结出绿青果，冬天叶子掉光只剩光秃秃的树枝。小松鼠问：它还是苹果树吗？用多面魔方看一看。',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '即使叶子掉光了，树根和树干依然是苹果树', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '外表虽然变了样，它还是原来那棵树', isKeyAction: true },
    ],
    reflectionComparison: {
      comparedLeafId: 'multi_attr_train_2',
      situationA: '苹果树夏天有叶子冬天光秃秃',
      situationB: '小熊既是小学生又是爱哭的小弟弟',
      sharedCoreQuestion: '换了外表或者做不同的事，核心依然是同一个。',
    },
  },
  {
    leafId: 'multi_attr_train_2',
    title: '小熊的很多个小身份',
    structureId: StructureId.MULTI_ATTRIBUTE_IDENTITY,
    posture: 'FEN',
    surfaceDomain: 'school',
    emotionalWeight: 'light',
    personalDistance: 'character',
    cognitiveLoad: 'low',
    boundary: 'NONE',
    isHeldOutTransfer: false,
    scaffoldTier: 2,
    targetAgeMin: 6,
    associatedToolName: '多面魔方',
    promptSpokenText: '在学校里，小熊是认真听讲的学生；在家里，他是爱撒娇的宝宝；在球场上，他是守门员。哪一个才是真的他？用多面魔方转一转。',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '每个面向都是他的一部分，拼在一起才完整', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '不能只看一个样子就给一个人下结论', isKeyAction: true },
    ],
    reflectionComparison: {
      comparedLeafId: 'multi_attr_train_1',
      situationA: '小熊在学校是学生在家是宝宝',
      situationB: '苹果树春天开花冬天落叶',
      sharedCoreQuestion: '人有很多面，事物也有很多面，一个样子不能代表全部。',
    },
  },
  {
    leafId: 'multi_attr_heldout',
    title: '生气的妈妈和温柔的妈妈',
    structureId: StructureId.MULTI_ATTRIBUTE_IDENTITY,
    posture: 'FEN',
    surfaceDomain: 'two_homes', // 跨情境：家庭情感认知
    emotionalWeight: 'deep',
    personalDistance: 'peer',
    cognitiveLoad: 'moderate',
    boundary: 'NONE',
    isHeldOutTransfer: true,
    scaffoldTier: 3,
    targetAgeMin: 6,
    associatedToolName: '多面魔方', // 铁律：在 held-out 的 prompt 和 options 中绝不出现“多面魔方”
    promptSpokenText: '今天妈妈因为工作着急皱起了眉头，声音有点大。小兔子害怕地想：“妈妈是不是不爱我了？”',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '皱眉头是妈妈着急的样子，平时抱我是温柔的样子', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '着急的情绪过去后，妈妈依然是那个爱我的妈妈', isKeyAction: true },
    ],
    reflectionComparison: {
      comparedLeafId: 'multi_attr_train_2',
      situationA: '妈妈今天着急皱眉头，但平时很温柔',
      situationB: '小熊在学校严肃而在家撒娇',
      sharedCoreQuestion: '一个人会有不同的情绪状态，着急时不等于爱消失了。',
    },
  },
  {
    leafId: 'multi_attr_foil',
    title: '老师今天有点着急',
    structureId: StructureId.RELATION_CHANGE_CONTINUITY, // 表面相似：学校师生互动；结构不同：关系延续性，非多属性身份
    posture: 'TONG',
    surfaceDomain: 'school',
    emotionalWeight: 'medium',
    personalDistance: 'peer',
    cognitiveLoad: 'moderate',
    boundary: 'NONE',
    isHeldOutTransfer: false,
    isFoil: true,
    scaffoldTier: 2,
    targetAgeMin: 6,
    promptSpokenText: '老师今天因为赶着发画纸有点严肃，没能微笑着叫我名字。老师心里是不是不喜欢我了？',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '老师手头忙着做事，但他依然是关心大家的好老师', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '等老师忙完再跟老师轻轻笑一笑', isKeyAction: true },
    ],
  },

  // =========================================================================
  // 5. CONTEXT_DEPENDENT_BEHAVIOR (情境依赖性行为理解)
  // =========================================================================
  {
    leafId: 'context_train_1',
    title: '操场与图书馆的声音',
    structureId: StructureId.CONTEXT_DEPENDENT_BEHAVIOR,
    posture: 'TONG',
    surfaceDomain: 'school',
    emotionalWeight: 'light',
    personalDistance: 'character',
    cognitiveLoad: 'low',
    boundary: 'NONE',
    isHeldOutTransfer: false,
    scaffoldTier: 1,
    targetAgeMin: 6,
    associatedToolName: '环境温度计',
    promptSpokenText: '小猴子在草地上踢球时可以大声喊加油，走进图书馆看绘本时老师却竖起手指说“嘘”。用环境温度计测一测。',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '操场是运动的地方，大声喊叫很精神', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '图书馆是安静的地方，轻轻说话不打扰别人', isKeyAction: true },
    ],
    reflectionComparison: {
      comparedLeafId: 'context_train_2',
      situationA: '操场可以大声喊，图书馆要轻声细语',
      situationB: '家里可以穿睡衣，去学校要穿校服',
      sharedCoreQuestion: '地方不一样，合适的做法也不一样。',
    },
  },
  {
    leafId: 'context_train_2',
    title: '睡衣与小校服',
    structureId: StructureId.CONTEXT_DEPENDENT_BEHAVIOR,
    posture: 'TONG',
    surfaceDomain: 'daily_routine',
    emotionalWeight: 'light',
    personalDistance: 'character',
    cognitiveLoad: 'low',
    boundary: 'NONE',
    isHeldOutTransfer: false,
    scaffoldTier: 2,
    targetAgeMin: 6,
    associatedToolName: '环境温度计',
    promptSpokenText: '周末在自己家客厅，小鹿可以穿着软绵绵的恐龙睡衣光脚丫；但是周一去幼儿园门口，就必须穿好整齐的鞋子。',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '家里是放松休息的地方，穿舒服最重要', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '学校是集体活动的地方，穿整齐更安全', isKeyAction: true },
    ],
    reflectionComparison: {
      comparedLeafId: 'context_train_1',
      situationA: '家里穿睡衣舒服，学校穿鞋子整齐',
      situationB: '操场跑跳大声喊，图书馆安静看书',
      sharedCoreQuestion: '换了一个环境，就换一套合适的小规则。',
    },
  },
  {
    leafId: 'context_heldout',
    title: '两个家里的不同规矩',
    structureId: StructureId.CONTEXT_DEPENDENT_BEHAVIOR,
    posture: 'TONG',
    surfaceDomain: 'two_homes', // 跨情境：两个家规则差异
    emotionalWeight: 'medium',
    personalDistance: 'peer',
    cognitiveLoad: 'moderate',
    boundary: 'NONE',
    isHeldOutTransfer: true,
    scaffoldTier: 3,
    targetAgeMin: 6,
    associatedToolName: '环境温度计', // 铁律：在 held-out 的 prompt 和 options 中绝不出现“环境温度计”
    promptSpokenText: '在爸爸家吃完饭要自己把碗放进水槽，在妈妈家妈妈习惯先擦桌子再一起洗碗。两边都可以吗？',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '在爸爸家按照爸爸家的习惯做，在妈妈家按照妈妈家的习惯做', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '不同的房子有不同的节奏，两边都是我的家', isKeyAction: true },
    ],
    reflectionComparison: {
      comparedLeafId: 'context_train_1',
      situationA: '在爸爸家和妈妈家有不同的收碗规矩',
      situationB: '在操场和图书馆有不同的说话音量',
      sharedCoreQuestion: '在哪儿就遵守哪儿的规矩，不用非争谁对谁错。',
    },
  },
  {
    leafId: 'context_foil',
    title: '打翻牛奶要不要承认',
    structureId: StructureId.FACT_VS_INFERENCE, // 表面相似：家里日常规则；结构不同：事实与推断，非情境规则
    posture: 'FEN',
    surfaceDomain: 'daily_routine',
    emotionalWeight: 'medium',
    personalDistance: 'peer',
    cognitiveLoad: 'moderate',
    boundary: 'NONE',
    isHeldOutTransfer: false,
    isFoil: true,
    scaffoldTier: 2,
    targetAgeMin: 6,
    promptSpokenText: '牛奶倒在地板上了，心里害怕大人责怪。这时候应该先做什么？',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '事实是牛奶打翻了，拿抹布擦干净', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '大人可能会惊讶，但不等于大人不爱我', isKeyAction: true },
    ],
  },

  // =========================================================================
  // 6. RELATION_CHANGE_CONTINUITY (形式改变中的关系延续)
  // =========================================================================
  {
    leafId: 'relation_train_1',
    title: '搬家后的小溪两岸',
    structureId: StructureId.RELATION_CHANGE_CONTINUITY,
    posture: 'TONG',
    surfaceDomain: 'nature',
    emotionalWeight: 'medium',
    personalDistance: 'character',
    cognitiveLoad: 'low',
    boundary: 'NONE',
    isHeldOutTransfer: false,
    scaffoldTier: 1,
    targetAgeMin: 6,
    associatedToolName: '隐形爱心线',
    promptSpokenText: '松鼠哥哥搬到了小溪对岸的大树上，弟弟还住在原来的树洞里。他们中间隔着一条小河。用隐形爱心线连一连，他们还是最好的兄弟吗？',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '虽然住的树不一样了，但心里依然想着彼此', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '每天挥手、放风筝，爱像小溪一样一直在流', isKeyAction: true },
    ],
    reflectionComparison: {
      comparedLeafId: 'relation_train_2',
      situationA: '两只松鼠隔着小溪住两棵树',
      situationB: '小熊转学了依然跟老朋友写明信片',
      sharedCoreQuestion: '距离变远了、房子变了，但心里的喜欢不会断。',
    },
  },
  {
    leafId: 'relation_train_2',
    title: '转学后寄出的小明信片',
    structureId: StructureId.RELATION_CHANGE_CONTINUITY,
    posture: 'TONG',
    surfaceDomain: 'friendship',
    emotionalWeight: 'medium',
    personalDistance: 'character',
    cognitiveLoad: 'low',
    boundary: 'NONE',
    isHeldOutTransfer: false,
    scaffoldTier: 2,
    targetAgeMin: 6,
    associatedToolName: '隐形爱心线',
    promptSpokenText: '好朋友小兔子搬家转学去别的城市了。小刺猬坐在空荡荡的课桌前，手里握着小兔子寄来的画片。用隐形爱心线想一想。',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '不在同一个教室了，但我们依然是好朋友', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '画片上的小笑脸，证明她一直记得我', isKeyAction: true },
    ],
    reflectionComparison: {
      comparedLeafId: 'relation_train_1',
      situationA: '好朋友搬走后依然互通明信片',
      situationB: '松鼠兄弟隔着小溪各自住一棵树',
      sharedCoreQuestion: '只要牵挂在，哪怕见面的样子变了，关系就不会消失。',
    },
  },
  {
    leafId: 'relation_heldout',
    title: '爸爸妈妈分开住之后',
    structureId: StructureId.RELATION_CHANGE_CONTINUITY,
    posture: 'TONG',
    surfaceDomain: 'two_homes', // 跨情境：两家生活形式转变
    emotionalWeight: 'deep',
    personalDistance: 'peer',
    cognitiveLoad: 'moderate',
    boundary: 'NONE',
    isHeldOutTransfer: true,
    scaffoldTier: 3,
    targetAgeMin: 6,
    associatedToolName: '隐形爱心线', // 铁律：在 held-out 的 prompt 和 options 中绝不出现“隐形爱心线”
    promptSpokenText: '爸爸和妈妈不住在同一个大房子里了。小鹿看着两把不同颜色的大门钥匙，想：“我们的家还在吗？”',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '大人的生活形式变了，但爸爸依然是爸爸，妈妈依然是妈妈', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '我有两把钥匙，两边的门打开，里面都有爱我的人', isKeyAction: true },
    ],
    reflectionComparison: {
      comparedLeafId: 'relation_train_1',
      situationA: '爸爸妈妈分开住在两个房子里',
      situationB: '松鼠兄弟住在一溪之隔的两棵树上',
      sharedCoreQuestion: '房子的形状变了，但爸爸妈妈对我的爱永远不会变。',
    },
  },
  {
    leafId: 'relation_foil',
    title: '在两边家轮流换衣服',
    structureId: StructureId.FEN_SINGLE_BURDEN_SPLIT, // 表面相似：两家往返生活；结构不同：单一负荷分切，非关系延续
    posture: 'FEN',
    surfaceDomain: 'two_homes',
    emotionalWeight: 'medium',
    personalDistance: 'peer',
    cognitiveLoad: 'moderate',
    boundary: 'NONE',
    isHeldOutTransfer: false,
    isFoil: true,
    scaffoldTier: 2,
    targetAgeMin: 6,
    promptSpokenText: '今天要换到另一个家住，衣服、鞋子、玩具乱糟糟堆成一座小山，不知道怎么收拾。',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '先收拾今天穿的小衣服，剩下的玩具等会儿收', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '一步一步来，大山就变成小积木了', isKeyAction: true },
    ],
  },

  // =========================================================================
  // 7. BEHAVIOR_PERSON_SEPARATION (具体行为与人本身分离)
  // =========================================================================
  {
    leafId: 'behavior_person_train_1',
    title: '不小心弄脏小毛衣',
    structureId: StructureId.BEHAVIOR_PERSON_SEPARATION,
    posture: 'FEN',
    surfaceDomain: 'daily_routine',
    emotionalWeight: 'light',
    personalDistance: 'character',
    cognitiveLoad: 'low',
    boundary: 'NONE',
    isHeldOutTransfer: false,
    scaffoldTier: 1,
    targetAgeMin: 6,
    associatedToolName: '泥巴小标签',
    promptSpokenText: '小浣熊吃草莓酱时，不小心滴在了洁白的小毛衣上。他难过地哭着说：“我是个笨蛋小浣熊！”用小刷子刷一刷泥巴小标签。',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '衣服脏了是洗衣服的事，小浣熊还是聪明可爱的小浣熊', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '做错了一件事，不代表整个人都是坏的', isKeyAction: true },
    ],
    reflectionComparison: {
      comparedLeafId: 'behavior_person_train_2',
      situationA: '草莓酱滴在毛衣上，不是笨蛋浣熊',
      situationB: '小狐狸拼图输了发脾气，不是坏狐狸',
      sharedCoreQuestion: '事情没做好可以改，但我们每个人依然是值得被爱的好孩子。',
    },
  },
  {
    leafId: 'behavior_person_train_2',
    title: '下棋输了摔棋子',
    structureId: StructureId.BEHAVIOR_PERSON_SEPARATION,
    posture: 'FEN',
    surfaceDomain: 'playground',
    emotionalWeight: 'medium',
    personalDistance: 'character',
    cognitiveLoad: 'low',
    boundary: 'NONE',
    isHeldOutTransfer: false,
    scaffoldTier: 2,
    targetAgeMin: 6,
    associatedToolName: '泥巴小标签',
    promptSpokenText: '小狐狸下飞行棋输了，一时着急把棋子扔在地上。旁边的小伙伴喊：“小狐狸是个大坏蛋！”拿小刷子把人和事分一分。',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '扔棋子这个动作是不对的，需要捡起来道歉', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '小狐狸不是坏蛋，他只是刚才太难过了没控制好', isKeyAction: true },
    ],
    reflectionComparison: {
      comparedLeafId: 'behavior_person_train_1',
      situationA: '小狐狸扔了棋子，但不是坏孩子',
      situationB: '小浣熊弄脏毛衣，但不是笨孩子',
      sharedCoreQuestion: '批评的是刚才那个动作，而不是这个人本身。',
    },
  },
  {
    leafId: 'behavior_person_heldout',
    title: '打人是不对的，但可以先保护身体',
    structureId: StructureId.BEHAVIOR_PERSON_SEPARATION,
    posture: 'FEN',
    surfaceDomain: 'school', // 跨情境：校园冲突
    emotionalWeight: 'deep',
    personalDistance: 'peer',
    cognitiveLoad: 'moderate',
    boundary: 'PHYSICAL_HARM', // Phase H 安全围栏：打人身体伤害红线
    isHeldOutTransfer: true,
    scaffoldTier: 3,
    targetAgeMin: 6,
    associatedToolName: '泥巴小标签', // 铁律：在 held-out 的 prompt 和 options 中绝不出现“泥巴小标签”
    promptSpokenText: '操场上有个小朋友因为积木被抢，伸手推倒了同学。大家说他是大恶霸。该怎么看待这件事？',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '推人打人的行为绝对不可以，先保护好身体退后，找大人帮忙', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '他可能很委屈，但推人是不对的；行为要制止，但他也不是永远的大坏蛋', isKeyAction: true },
    ],
    reflectionComparison: {
      comparedLeafId: 'behavior_person_train_2',
      situationA: '小朋友在操场推人，行为不对但人需要帮助',
      situationB: '小狐狸下棋输了摔棋子，行为不对但不是坏蛋',
      sharedCoreQuestion: '危险动作一定要停下，但不要给任何人贴上一辈子的坏标签。',
    },
  },
  {
    leafId: 'behavior_person_foil',
    title: '操场上的玩具被别人拿走了',
    structureId: StructureId.TONG_FEELING_EXPRESSION, // 表面相似：操场同伴冲突；结构不同：表达感受与需要，非行为与人分离
    posture: 'TONG',
    surfaceDomain: 'playground',
    emotionalWeight: 'medium',
    personalDistance: 'peer',
    cognitiveLoad: 'moderate',
    boundary: 'NONE',
    isHeldOutTransfer: false,
    isFoil: true,
    scaffoldTier: 2,
    targetAgeMin: 6,
    promptSpokenText: '你在沙坑里玩小铲子，另一个小朋友没问就拿走了。心里很着急。',
    stepsOrOptions: [
      { id: 'opt_1', labelSpokenText: '大声而清楚地说：“我还在玩，请先还给我”', isKeyAction: true },
      { id: 'opt_2', labelSpokenText: '如果他不给，找身边的大人帮忙协调', isKeyAction: true },
    ],
  },
];

/**
 * 校验 SEED_TRANSFER_LEAVES 集合自身完整性与契约合规
 */
export function validateSeedTransferLeaves(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  for (const leaf of SEED_TRANSFER_LEAVES) {
    const res = validateLeafDefinition(leaf);
    if (!res.isValid) {
      errors.push(`Leaf ${leaf.leafId} invalid: ${res.errors.join('; ')}`);
    }
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 内容引擎过滤函数
 * 允许按 structureId, surfaceDomain, emotionalWeight, personalDistance, cognitiveLoad, boundary 进行复合筛选
 */
export function filterLeaves(
  leaves: ReadonlyArray<LeafDefinition>,
  criteria: ContentFilterCriteria
): LeafDefinition[] {
  return leaves.filter((leaf) => {
    if (criteria.structureId && leaf.structureId !== criteria.structureId) {
      return false;
    }
    if (criteria.surfaceDomain && leaf.surfaceDomain !== criteria.surfaceDomain) {
      return false;
    }
    if (criteria.emotionalWeight && leaf.emotionalWeight !== criteria.emotionalWeight) {
      return false;
    }
    if (criteria.personalDistance && leaf.personalDistance !== criteria.personalDistance) {
      return false;
    }
    if (criteria.cognitiveLoad && leaf.cognitiveLoad !== criteria.cognitiveLoad) {
      return false;
    }
    if (criteria.boundary && leaf.boundary !== criteria.boundary) {
      return false;
    }
    return true;
  });
}
