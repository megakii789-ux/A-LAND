import { CampTransferGoalId } from '../cognitive/productExperienceMetrics';

export type InteractiveStoryLeafId = 'cup-size' | 'toy-share';

export type CupTablePosition = 'CENTER_TABLE' | 'NEXT_TO_BLOCK' | 'NEXT_TO_BUCKET';

export type FlashlightBeamTarget =
  | 'OFF'
  | 'SHADOW_CURTAIN'
  | 'OUTSIDE_BRANCH'
  | 'LANTERN_DIFFUSER'
  | 'TENT_INSIDE';

export interface StorySceneHotspot {
  id: string;
  label: string;
  shortHint: string;
  xPercent: number;
  yPercent: number;
  inspectObservation: string;
  inspectCharacterLine: string;
  speakerName: string;
  isKeyObservation: boolean;
}

export interface StorySceneActionChoice {
  id: string;
  label: string;
  shortTag: string;
  childActionLine: string;
  sceneVisualEffect:
    | 'COMPARE_BOTH'
    | 'SINGLE_SIDE_ONLY'
    | 'ASK_NEED'
    | 'COOPERATE_ROLES'
    | 'HOURGLASS_TURNS'
    | 'GRAB_FIRST';
  consequenceSummary: string;
  characterResponses: {
    speaker: string;
    mood: 'HAPPY' | 'THOUGHTFUL' | 'SURPRISED' | 'UPSET';
    line: string;
  }[];
  cognitiveTakeaway: string;
  encouragesRevision: boolean;
  revisionPrompt?: string;
  islandLinkNote: string;
  /** Sprint 4 FIX-02: 与该具体行动绑定的必要观察证据 ID（不限制先观察还是先行动，但必须获取对应证据才算达成认知目标） */
  requiredHotspotIds: string[];
}

export interface InteractiveStoryLeafDefinition {
  id: InteractiveStoryLeafId;
  title: string;
  subtitle: string;
  sceneSettingPrompt: string;
  characters: {
    id: string;
    name: string;
    roleNote: string;
  }[];
  hotspots: StorySceneHotspot[];
  actions: StorySceneActionChoice[];
}

export const INTERACTIVE_STORY_LEAVES: Record<InteractiveStoryLeafId, InteractiveStoryLeafDefinition> = {
  'cup-size': {
    id: 'cup-size',
    title: '一只杯子，是大还是小？',
    subtitle: '动手把蓝水杯移到积木和水桶旁边比一比',
    sceneSettingPrompt:
      '点击或移动桌上的蓝水杯，让它先后挨着左边的小积木和右边的大水桶，看看会发生什么！',
    characters: [
      { id: 'squirrel', name: '小松鼠跳跳', roleNote: '手掌小小，抱着小木积木' },
      { id: 'elephant', name: '小象噗噗', roleNote: '鼻子长长，提着大水桶' },
    ],
    hotspots: [
      {
        id: 'obj_wooden_block',
        label: '小松鼠的小积木',
        shortHint: '左边的迷你木块',
        xPercent: 22,
        yPercent: 64,
        inspectObservation: '小积木只有小松鼠爪子那么大，蓝水杯立在它旁边像一座小塔。',
        inspectCharacterLine: '跳跳指着积木说：“你看！杯子比我的积木高好多，当然是大杯子呀！”',
        speakerName: '小松鼠跳跳',
        isKeyObservation: true,
      },
      {
        id: 'obj_blue_cup',
        label: '森林蓝水杯',
        shortHint: '可移动的蓝色水杯',
        xPercent: 50,
        yPercent: 58,
        inspectObservation: '蓝水杯杯身上画着两格水位线，不管移到左边还是右边，它自己的大小一点儿也没变。',
        inspectCharacterLine: '果果轻声问：“杯子自己没有变魔术，为什么跳跳和噗噗说的不一样呢？”',
        speakerName: '小狐狸果果',
        isKeyObservation: false,
      },
      {
        id: 'obj_elephant_bucket',
        label: '小象的大水桶',
        shortHint: '右边的木水桶',
        xPercent: 78,
        yPercent: 52,
        inspectObservation: '大水桶圆滚滚的，能装下好几杯水，蓝水杯挨着它就像一颗小纽扣。',
        inspectCharacterLine: '噗噗晃晃长鼻子：“我平时喝一桶水，这只蓝杯子还不够我喝一口呢，真小！”',
        speakerName: '小象噗噗',
        isKeyObservation: true,
      },
      {
        id: 'obj_twig_ruler',
        label: '刻度小树枝',
        shortHint: '桌沿边的测量树枝',
        xPercent: 50,
        yPercent: 82,
        inspectObservation: '小树枝上有三道刻痕：记录着不同物品的高度刻度。',
        inspectCharacterLine: '果果点点头：“试着把蓝水杯分别移到小积木和大水桶旁边比一比吧！”',
        speakerName: '小狐狸果果',
        isKeyObservation: false,
      },
    ],
    actions: [
      {
        id: 'act_compare_both_sides',
        label: '把蓝水杯先后移到小积木和大水桶旁比一比',
        shortTag: '两边都比一比',
        childActionLine: '我把蓝水杯先移到小积木旁，再移到大水桶旁，发现它比积木大、比水桶小！',
        sceneVisualEffect: 'COMPARE_BOTH',
        consequenceSummary: '木桌上升起了双侧对比线：同一只蓝水杯，在小积木旁显大，在大水桶旁显小。',
        characterResponses: [
          {
            speaker: '小松鼠跳跳',
            mood: 'SURPRISED',
            line: '哇！原来我只盯着我的小积木看，跟大水桶比它真的变小啦！',
          },
          {
            speaker: '小象噗噗',
            mood: 'HAPPY',
            line: '哈哈，原来我们两个都没说错，只是拿来比较的东西不一样！',
          },
        ],
        cognitiveTakeaway:
          '同一只杯子没有改变，只是比较对象改变了。换个参照物比一比，就能明白为什么大家想法不同。',
        encouragesRevision: false,
        islandLinkNote: '故事林树冠亮起了“双视角对比果”，小岛伙伴记住了你的双边观察法。',
        requiredHotspotIds: ['obj_wooden_block', 'obj_elephant_bucket'],
      },
      {
        id: 'act_only_look_squirrel',
        label: '只看小松鼠这边，宣布蓝水杯就是大杯子',
        shortTag: '只看一边下结论',
        childActionLine: '蓝水杯比小积木高这么多，它肯定就是大杯子，小象说错了！',
        sceneVisualEffect: 'SINGLE_SIDE_ONLY',
        consequenceSummary:
          '视线只停在左边小积木上，右边的大水桶被阴影盖住了，小象委屈地垂下了鼻子。',
        characterResponses: [
          {
            speaker: '小松鼠跳跳',
            mood: 'HAPPY',
            line: '耶！你帮我说话啦！',
          },
          {
            speaker: '小象噗噗',
            mood: 'UPSET',
            line: '可是你还没把杯子移到我的大水桶旁边比一比呢……只看一边，我好委屈呀。',
          },
        ],
        cognitiveTakeaway:
          '只看一边就急着下结论，容易漏掉另一半重要的画面。去把蓝水杯移到大水桶旁边看看吧！',
        encouragesRevision: true,
        revisionPrompt: '试试把蓝水杯移到右边大水桶旁，看看两边对比有什么不同！',
        islandLinkNote: '你可以随时移动木桌上的蓝水杯继续观察，换个办法看看小象的反应。',
        requiredHotspotIds: ['obj_wooden_block', 'obj_elephant_bucket'],
      },
      {
        id: 'act_ask_usage_need',
        label: '问问跳跳和噗噗各自想用杯子做什么',
        shortTag: '问问各自需要',
        childActionLine: '跳跳、噗噗，你们今天想用这只蓝水杯装什么呀？',
        sceneVisualEffect: 'ASK_NEED',
        consequenceSummary:
          '桌面上浮现出两人的心愿泡泡：跳跳想用它给小芽浇水，噗噗想接满一整桶洗澡水。',
        characterResponses: [
          {
            speaker: '小松鼠跳跳',
            mood: 'HAPPY',
            line: '我想给小花苗浇水，这杯水刚好够浇三棵小苗！',
          },
          {
            speaker: '小象噗噗',
            mood: 'THOUGHTFUL',
            line: '我想装水冲背，怪不得觉得它小！那这只蓝杯子先给跳跳浇花吧。',
          },
        ],
        cognitiveTakeaway: '了解双方各自的参照物和真实需要，矛盾一下子就解开啦！',
        encouragesRevision: false,
        islandLinkNote: '故事林叶片长出了温暖露珠，小岛伙伴记住了你先观察再询问需要的好方法。',
        requiredHotspotIds: ['obj_wooden_block', 'obj_elephant_bucket'],
      },
    ],
  },
  'toy-share': {
    id: 'toy-share',
    title: '两个人想玩同一辆小火车',
    subtitle: '点点火车轨道边的道具，试试怎么玩更开心',
    sceneSettingPrompt:
      '森林木地板上只有一辆红色小火车头，小熊和小浣熊都想现在玩。先点点地上的物件看看都有什么吧！',
    characters: [
      { id: 'bear', name: '小熊波波', roleNote: '想推着火车头在长轨道上跑' },
      { id: 'raccoon', name: '小浣熊乐乐', roleNote: '搭好了积木车站想让火车进站' },
    ],
    hotspots: [
      {
        id: 'obj_red_train',
        label: '红色小火车头',
        shortHint: '轨道中央唯一的火车头',
        xPercent: 48,
        yPercent: 56,
        inspectObservation:
          '只有一辆红色火车头，车钩后面还可以挂果子车厢，必须沿着木轨才能开进车站。',
        inspectCharacterLine: '波波抱紧车头说：“我最喜欢推火车头呜呜跑了！”',
        speakerName: '小熊波波',
        isKeyObservation: true,
      },
      {
        id: 'obj_station_blocks',
        label: '积木小车站',
        shortHint: '小浣熊搭好的车站拱门',
        xPercent: 78,
        yPercent: 54,
        inspectObservation:
          '小浣熊用彩色木块搭好了精致的站台，没有火车开过来，车站就冷冷清清的。',
        inspectCharacterLine:
          '乐乐指着站台说：“我搭了半天车站，如果火车不来停靠，车站就没有乘客啦！”',
        speakerName: '小浣熊乐乐',
        isKeyObservation: true,
      },
      {
        id: 'obj_acorn_hourglass',
        label: '松果计时沙漏',
        shortHint: '地毯左边的小沙漏',
        xPercent: 22,
        yPercent: 66,
        inspectObservation: '沙漏流完一次正好可以让小火车绕轨道跑两圈，适合用来约定轮流时间。',
        inspectCharacterLine: '果果提醒道：“用沙漏看得见时间，等待的人心里就不慌啦。”',
        speakerName: '小狐狸果果',
        isKeyObservation: false,
      },
      {
        id: 'obj_whistle_flag',
        label: '站长小绿旗与铃铛',
        shortHint: '车站旁的指挥道具',
        xPercent: 64,
        yPercent: 78,
        inspectObservation:
          '绿旗一挥、铃铛一响，小火车就能准时进站和发车，原来当站长也超有趣！',
        inspectCharacterLine: '乐乐眼睛一亮：“哇，摇铃铛指挥火车进站好像也很酷耶！”',
        speakerName: '小浣熊乐乐',
        isKeyObservation: true,
      },
    ],
    actions: [
      {
        id: 'act_cooperate_station_driver',
        label: '分工一起玩：波波当司机开火车，乐乐摇绿旗当站长接客',
        shortTag: '司机+站长分工玩',
        childActionLine:
          '波波开红色火车头，乐乐拿着小绿旗在积木车站指挥进站，下一圈再互换角色！',
        sceneVisualEffect: 'COOPERATE_ROLES',
        consequenceSummary:
          '红色小火车呜呜开进积木车站，乐乐摇响站长铃铛，两人的玩耍合在了一条轨道上！',
        characterResponses: [
          {
            speaker: '小熊波波',
            mood: 'HAPPY',
            line: '火车进站啰！有乐乐当站长摇旗子，开火车变得更好玩了！',
          },
          {
            speaker: '小浣熊乐乐',
            mood: 'HAPPY',
            line: '叮铃铃！第一班森林列车准时到站，下一圈换我当司机哟！',
          },
        ],
        cognitiveTakeaway:
          '当两个人都想玩同一个玩具时，先了解火车、车站和指挥旗的作用，分工合作会让快乐翻倍！',
        encouragesRevision: false,
        islandLinkNote: '故事林轨道亮起了金色信号灯，小岛记住了你的合作新点子。',
        requiredHotspotIds: ['obj_red_train', 'obj_station_blocks', 'obj_whistle_flag'],
      },
      {
        id: 'act_hourglass_turns',
        label: '放好松果沙漏：约定沙漏流完一轮就交换火车头',
        shortTag: '用沙漏约定轮流',
        childActionLine:
          '我们把松果沙漏立在中间，波波先开两圈，沙漏流完就换乐乐开进车站！',
        sceneVisualEffect: 'HOURGLASS_TURNS',
        consequenceSummary:
          '松果沙漏在轨道中央闪着暖光，波波专心开车，乐乐一边看沙漏一边准备车站迎接。',
        characterResponses: [
          {
            speaker: '小熊波波',
            mood: 'HAPPY',
            line: '好呀，看着沙漏我知道能开满两圈，到点我就交给你！',
          },
          {
            speaker: '小浣熊乐乐',
            mood: 'THOUGHTFUL',
            line: '看得见沙子流下来，我就知道马上轮到我了，不会干着急！',
          },
        ],
        cognitiveTakeaway: '有清楚看得见的轮流规则，等待的人也有事情做、心里有盼头。',
        encouragesRevision: false,
        islandLinkNote: '故事林沙漏徽章点亮了，小岛伙伴夸你会用清楚的规则商量。',
        requiredHotspotIds: ['obj_red_train', 'obj_acorn_hourglass'],
      },
      {
        id: 'act_grab_first',
        label: '谁手快谁先拿走火车头，不管另一边的车站',
        shortTag: '直接抱走自己玩',
        childActionLine: '谁先抢到红色火车头就归谁玩，不用管旁边的车站！',
        sceneVisualEffect: 'GRAB_FIRST',
        consequenceSummary:
          '火车头被抱离了轨道，积木车站孤零零地倒了一块，两只小动物都鼓起了腮帮子。',
        characterResponses: [
          {
            speaker: '小熊波波',
            mood: 'SURPRISED',
            line: '咦，离开轨道和车站，光抱着火车头也没地方开呀……',
          },
          {
            speaker: '小浣熊乐乐',
            mood: 'UPSET',
            line: '你不跟我商量就抱走，我的积木车站都没法玩了，我不开心！',
          },
        ],
        cognitiveTakeaway:
          '不商量直接抢走，不仅朋友难过，连火车也没法在完整轨道上开啦。要不要回来看看车站和沙漏，换个做法？',
        encouragesRevision: true,
        revisionPrompt:
          '看看地上的积木车站、小绿旗和松果沙漏，试着换一种能让两个人一起开心的办法吧！',
        islandLinkNote: '随时可以回到地板场景重新观察，试试合作或轮流的新方法。',
        requiredHotspotIds: ['obj_red_train', 'obj_station_blocks', 'obj_whistle_flag'],
      },
    ],
  },
};

export interface StoryGroveTransferHotspot {
  id: string;
  /** Sprint 4 FIX-05: 未探索前显示的中性名称（严禁提前剧透谜底，如“松果”） */
  label: string;
  /** Sprint 4 FIX-05: 真实观察或手电筒照亮后才揭示的详情名称 */
  revealedLabel: string;
  shortHint: string;
  revealedHint: string;
  beamTarget: FlashlightBeamTarget;
  relatedGoalId: CampTransferGoalId;
  xPercent: number;
  yPercent: number;
  observationDetail: string;
  speakerName: string;
  speakerLine: string;
}

export interface StoryGroveTransferAction {
  id: string;
  /** Sprint 4 FIX-05: 表达孩子想做的行动本身，不提前剧透谜底答案 */
  label: string;
  shortTag: string;
  targetGoalId: CampTransferGoalId | null;
  requiredHotspotIds: string[];
  childSpokenOrAction: string;
  visualOutcomeState:
    | 'PANIC_CONFLICT'
    | 'SHADOW_REVEALED'
    | 'BOUNDARY_CALMED'
    | 'FLASHLIGHT_SHARED';
  consequenceNarrative: string;
  characterReactions: {
    speaker: string;
    mood: 'HAPPY' | 'CALM' | 'SCARED' | 'UPSET';
    line: string;
  }[];
  resolvesProblem: boolean;
  revisionHint: string;
  islandFeedbackText: string;
}

export interface StoryGroveTransferChallenge {
  id: string;
  title: string;
  subtitle: string;
  openingNarrative: string;
  goals: {
    id: CampTransferGoalId;
    title: string;
    shortPrompt: string;
    requiredHotspotIds: string[];
    resolvingActionId: string;
  }[];
  hotspots: StoryGroveTransferHotspot[];
  actions: StoryGroveTransferAction[];
}

export const STORY_GROVE_CAMP_TRANSFER_CHALLENGE: StoryGroveTransferChallenge = {
  id: 'leaf-camp-transfer',
  title: '树屋露营夜',
  subtitle: '转动手电筒光束照一照，再自己选办法处理今晚的三件小事',
  openingNarrative:
    '夜晚的树屋帐篷外晃动着一个神秘黑影！身旁的小刺猬紧张地追问你的隐私秘密，而地上只有一件照明工具，大家都想拿。先转动光束照一照吧！',
  goals: [
    {
      id: 'SHADOW_INVESTIGATION',
      title: '核实窗外黑影',
      shortPrompt: '照亮并观察窗外的影子与帐篷旁边的东西，弄清黑影来源',
      requiredHotspotIds: ['camp_obj_window_shadow', 'camp_obj_pinecone_branch'],
      resolvingActionId: 'camp_act_shine_light_check_branch',
    },
    {
      id: 'PERSONAL_BOUNDARY',
      title: '表达个人边界',
      shortPrompt: '观察身旁紧张追问的同伴，温和清楚地说出自己的意愿',
      requiredHotspotIds: ['camp_obj_whispering_peer'],
      resolvingActionId: 'camp_act_state_comfort_boundary',
    },
    {
      id: 'SHARED_RESOURCE',
      title: '安排共享照明',
      shortPrompt: '观察地上的照明工具，和伙伴商量分工一起用光亮',
      requiredHotspotIds: ['camp_obj_single_flashlight'],
      resolvingActionId: 'camp_act_share_flashlight_roles',
    },
  ],
  hotspots: [
    {
      id: 'camp_obj_window_shadow',
      label: '窗外的影子',
      revealedLabel: '随风摇晃的窗帘黑影',
      shortHint: '窗帘布上忽大忽小的影子',
      revealedHint: '只在刮风时晃动的尖角影子',
      beamTarget: 'SHADOW_CURTAIN',
      relatedGoalId: 'SHADOW_INVESTIGATION',
      xPercent: 26,
      yPercent: 38,
      observationDetail:
        '光束照在窗帘上：黑影随着夜风一晃一晃，每次风停下来，那个“尖角”也跟着停在原地不动。',
      speakerName: '小狐狸果果',
      speakerLine: '咦？那个黑影好像只在刮风的时候才动，会是外面的什么东西被风吹动呢？',
    },
    {
      id: 'camp_obj_pinecone_branch',
      label: '帐篷旁边的东西',
      revealedLabel: '风中摇晃的松果树枝',
      shortHint: '窗缝外黑乎乎的轮廓',
      revealedHint: '挂着两颗大松果的翘起树枝',
      beamTarget: 'OUTSIDE_BRANCH',
      relatedGoalId: 'SHADOW_INVESTIGATION',
      xPercent: 52,
      yPercent: 28,
      observationDetail:
        '光束穿过窗缝照出去：原来窗外有一根翘起的树枝，上面挂着两颗大松果，被风一吹就像长了尖角！',
      speakerName: '小狐狸果果',
      speakerLine: '照清楚啦！原来那根挂着松果的树枝，就是刚才窗帘上影子的真身呀！',
    },
    {
      id: 'camp_obj_single_flashlight',
      label: '地上的照明工具',
      revealedLabel: '唯一的小手电筒与柔光灯罩',
      shortHint: '木垫子中间仅有的发亮工具',
      revealedHint: '可套上灯罩散开光线的手电筒',
      beamTarget: 'LANTERN_DIFFUSER',
      relatedGoalId: 'SHARED_RESOURCE',
      xPercent: 50,
      yPercent: 72,
      observationDetail:
        '营地里只有这一把暖光手电筒，旁边还放着一只半透明的柔光小灯罩，套上它就能把光散开照亮整座帐篷。',
      speakerName: '小熊贝贝',
      speakerLine: '手电筒只有一把，要是大家都抢，光束乱晃反而什么都照不清啦。',
    },
    {
      id: 'camp_obj_whispering_peer',
      label: '身旁紧张的同伴',
      revealedLabel: '紧抓袖子追问的小刺猬点点',
      shortHint: '紧挨着你说话的伙伴',
      revealedHint: '因为自己害怕而不停追问的同伴',
      beamTarget: 'TENT_INSIDE',
      relatedGoalId: 'PERSONAL_BOUNDARY',
      xPercent: 78,
      yPercent: 60,
      observationDetail:
        '柔和的余光照向帐篷内：小刺猬点点其实自己也有点发抖，所以才一直拉着你的袖子追问你害不害怕。',
      speakerName: '小刺猬点点',
      speakerLine: '你快说嘛，你是不是也很怕黑？你在家里晚上是不是也不敢一个人睡？',
    },
  ],
  actions: [
    {
      id: 'camp_act_guess_monster_scream',
      label: '直接大喊“有怪兽”并一把抢过照明工具蒙进被子里',
      shortTag: '抢走灯光躲起来',
      targetGoalId: null,
      requiredHotspotIds: [],
      childSpokenOrAction: '啊！外面肯定是大怪兽！照明工具归我一个人拿，你们别碰！',
      visualOutcomeState: 'PANIC_CONFLICT',
      consequenceNarrative:
        '手电筒被蒙进被窝，帐篷里一下子黑乎乎的，小刺猬吓得缩成一团，大家还是不知道窗外是什么。',
      characterReactions: [
        {
          speaker: '小刺猬点点',
          mood: 'SCARED',
          line: '呜呜，你把灯抢走了，帐篷里好黑，我更害怕了！',
        },
        {
          speaker: '小狐狸果果',
          mood: 'UPSET',
          line: '还没看清窗外是什么就自己把灯藏起来，大家都没法安心啦。',
        },
      ],
      resolvesProblem: false,
      revisionHint: '帐篷里还是黑乎乎的，试试转动手电筒照向窗外或照明工具，换个办法试试吧！',
      islandFeedbackText: '在树屋露营夜里，你尝试了不同办法并准备重新观察调整。',
    },
    {
      id: 'camp_act_shine_light_check_branch',
      label: '把光束照向窗外晃动的地方，看清影子是怎么来的',
      shortTag: '照亮窗外核实黑影',
      targetGoalId: 'SHADOW_INVESTIGATION',
      requiredHotspotIds: ['camp_obj_window_shadow', 'camp_obj_pinecone_branch'],
      childSpokenOrAction:
        '我们先别自己吓自己，把手电筒光束对准窗外晃动的地方，一起看清楚影子到底是什么！',
      visualOutcomeState: 'SHADOW_REVEALED',
      consequenceNarrative:
        '暖黄色的光束照亮窗外：原来“尖角怪影”只是夜风吹动了两颗大松果！窗外黑影之谜解开了。',
      characterReactions: [
        {
          speaker: '小刺猬点点',
          mood: 'HAPPY',
          line: '哇！照亮之后看清楚了，原来是两颗大松果在跳舞，根本不是怪兽呀！',
        },
        {
          speaker: '小狐狸果果',
          mood: 'CALM',
          line: '先照亮看清楚再下结论，一下子就不害怕啦！',
        },
      ],
      resolvesProblem: true,
      revisionHint: '窗外黑影已经看清啦！你还可以继续处理同伴追问或照明工具的分工。',
      islandFeedbackText: '树屋露营灯亮起了暖光，你用真实观察解开了窗外黑影之谜！',
    },
    {
      id: 'camp_act_state_comfort_boundary',
      label: '温和地告诉同伴：“这是我的小秘密，我现在先不聊这个”',
      shortTag: '温和表达个人边界',
      targetGoalId: 'PERSONAL_BOUNDARY',
      requiredHotspotIds: ['camp_obj_whispering_peer'],
      childSpokenOrAction:
        '点点，晚上的小习惯是我自己的事，我现在不想聊这个，我们一起坐好看看窗外吧！',
      visualOutcomeState: 'BOUNDARY_CALMED',
      consequenceNarrative:
        '小刺猬听懂了你的温和边界，不再紧抓着你的袖子追问，而是安静地坐到垫子上。',
      characterReactions: [
        {
          speaker: '小刺猬点点',
          mood: 'CALM',
          line: '好吧，我不追问你的秘密了，那我挨着你一起坐好。',
        },
        {
          speaker: '小狐狸果果',
          mood: 'HAPPY',
          line: '既清楚说出了自己不想聊的事，又照顾了同伴的情绪，真棒！',
        },
      ],
      resolvesProblem: true,
      revisionHint: '同伴已经安定下来啦！你还可以继续核实窗外黑影或安排照明分工。',
      islandFeedbackText: '树屋露营夜里，你温和又清楚地表达了自己的边界，伙伴们都很安心。',
    },
    {
      id: 'camp_act_share_flashlight_roles',
      label: '和伙伴商量分工：一人掀开窗帘角、一人握稳照明工具一起看',
      shortTag: '商量分工共享照明',
      targetGoalId: 'SHARED_RESOURCE',
      requiredHotspotIds: ['camp_obj_single_flashlight'],
      childSpokenOrAction:
        '照明工具只有一件，我们分工吧：果果掀开窗帘一角，我和点点把光散开照亮帐篷，这样每个人都能看清！',
      visualOutcomeState: 'FLASHLIGHT_SHARED',
      consequenceNarrative:
        '手电筒套上柔光灯罩变成温暖的小夜灯，果果掀开窗帘角，三个人不用争抢也能同时看清周围！',
      characterReactions: [
        {
          speaker: '小熊贝贝',
          mood: 'HAPPY',
          line: '分工合作加上柔光灯罩，大家不用抢手电筒也能一起看清楚啦！',
        },
        {
          speaker: '小刺猬点点',
          mood: 'HAPPY',
          line: '每个人都有事情做，帐篷里亮堂堂的，一点儿也不怕了！',
        },
      ],
      resolvesProblem: true,
      revisionHint: '照明分工已经安排好啦！你还可以继续探索其他目标或随时换个办法试试。',
      islandFeedbackText: '树屋露营夜的小夜灯常亮啦，你和伙伴分工共享照明，大家都很开心！',
    },
  ],
};

/**
 * Sprint 4 FIX-02:
 * 检查互动故事叶（《杯子大小》《小火车》）是否真正达成了与所选行动关联的证据条件。
 * 允许先行动后观察，也允许先观察后行动；但只有获得与该行动关联的必要观察/操作证据时才返回 true。
 */
export function evaluateInteractiveLeafGoalCompletion(
  leafId: InteractiveStoryLeafId,
  chosenActionId: string | null,
  inspectedHotspotIds: string[],
  comparedCupPositions: ('NEXT_TO_BLOCK' | 'NEXT_TO_BUCKET')[] = []
): {
  isGoalCompleted: boolean;
  missingHotspotIds: string[];
} {
  const leaf = INTERACTIVE_STORY_LEAVES[leafId];
  if (!leaf || !chosenActionId) {
    return { isGoalCompleted: false, missingHotspotIds: [] };
  }
  const action = leaf.actions.find((a) => a.id === chosenActionId);
  if (!action || action.encouragesRevision) {
    return {
      isGoalCompleted: false,
      missingHotspotIds: action?.requiredHotspotIds ?? [],
    };
  }

  const effectiveInspected = new Set<string>(inspectedHotspotIds);
  if (leafId === 'cup-size') {
    if (comparedCupPositions.includes('NEXT_TO_BLOCK')) {
      effectiveInspected.add('obj_wooden_block');
    }
    if (comparedCupPositions.includes('NEXT_TO_BUCKET')) {
      effectiveInspected.add('obj_elephant_bucket');
    }
  }

  const missingHotspotIds = action.requiredHotspotIds.filter(
    (reqId) => !effectiveInspected.has(reqId)
  );

  return {
    isGoalCompleted: missingHotspotIds.length === 0,
    missingHotspotIds,
  };
}

/**
 * Sprint 4.1 FIX-01:
 * 统一互动故事叶的“行动执行 -> 观察证据校验 -> 有效场景状态与结果反馈”。
 * 当行动所需的关键观察证据尚未具备时，绝不提前呈现最终真相、完成画面或最终伙伴记忆。
 */
export function resolveInteractiveLeafActionEffectiveOutcome(
  leafId: InteractiveStoryLeafId,
  chosenActionId: string | null,
  inspectedHotspotIds: string[],
  comparedCupPositions: ('NEXT_TO_BLOCK' | 'NEXT_TO_BUCKET')[] = []
): {
  hasAllRequiredEvidence: boolean;
  isGoalCompleted: boolean;
  missingHotspotIds: string[];
  missingNeutralLabels: string[];
  effectiveSceneVisualEffect: 'OBSERVING' | StorySceneActionChoice['sceneVisualEffect'];
  effectiveConsequenceSummary: string;
  effectiveCharacterResponses: {
    speaker: string;
    mood: 'HAPPY' | 'THOUGHTFUL' | 'SURPRISED' | 'UPSET';
    line: string;
  }[];
  effectiveCompanionSummary: string;
  effectiveCompanionReaction: string;
} {
  const leaf = INTERACTIVE_STORY_LEAVES[leafId];
  const action = chosenActionId ? leaf?.actions.find((a) => a.id === chosenActionId) : undefined;
  if (!leaf || !action) {
    return {
      hasAllRequiredEvidence: false,
      isGoalCompleted: false,
      missingHotspotIds: [],
      missingNeutralLabels: [],
      effectiveSceneVisualEffect: 'OBSERVING',
      effectiveConsequenceSummary: '',
      effectiveCharacterResponses: [],
      effectiveCompanionSummary: '',
      effectiveCompanionReaction: '',
    };
  }

  const { isGoalCompleted, missingHotspotIds } = evaluateInteractiveLeafGoalCompletion(
    leafId,
    chosenActionId,
    inspectedHotspotIds,
    comparedCupPositions
  );

  const missingNeutralLabels = missingHotspotIds.map(
    (id) => leaf.hotspots.find((h) => h.id === id)?.label || id
  );

  if (!action.encouragesRevision && missingHotspotIds.length > 0) {
    const joinedLabels = missingNeutralLabels.join('、');
    return {
      hasAllRequiredEvidence: false,
      isGoalCompleted: false,
      missingHotspotIds,
      missingNeutralLabels,
      effectiveSceneVisualEffect: 'OBSERVING',
      effectiveConsequenceSummary:
        leafId === 'cup-size'
          ? `你想「${action.shortTag}」，不过还没有把蓝水杯移到「${joinedLabels}」旁边亲自比过呢！先在画面里拖动或移动蓝水杯去比一比吧。`
          : `你想「${action.shortTag}」，不过还没有观察了解「${joinedLabels}」的情况呢！先点一点上方场景里的物件看看吧。`,
      effectiveCharacterResponses:
        leafId === 'cup-size'
          ? [
              {
                speaker: '小松鼠跳跳',
                mood: 'THOUGHTFUL',
                line: `先把蓝水杯移到「${joinedLabels}」旁边亲眼看一看，我们才知道两边比起来怎么样呀！`,
              },
            ]
          : [
              {
                speaker: '小兔朵朵',
                mood: 'THOUGHTFUL',
                line: `先看看「${joinedLabels}」，弄清楚大家各自想玩什么，我们再一起分工吧！`,
              },
            ],
      effectiveCompanionSummary: `准备尝试「${action.shortTag}」（尚未完成「${joinedLabels}」观察比对）`,
      effectiveCompanionReaction: `还没有亲自观察「${joinedLabels}」，先动手在场景里看一看吧！`,
    };
  }

  return {
    hasAllRequiredEvidence: true,
    isGoalCompleted,
    missingHotspotIds: [],
    missingNeutralLabels: [],
    effectiveSceneVisualEffect: action.sceneVisualEffect,
    effectiveConsequenceSummary: action.consequenceSummary,
    effectiveCharacterResponses: action.characterResponses,
    effectiveCompanionSummary: action.shortTag,
    effectiveCompanionReaction: action.consequenceSummary,
  };
}

/**
 * Sprint 4 FIX-01 & Sprint 4.1 FIX-02:
 * 计算树屋露营夜复合情境的三个可观察子目标完成情况。
 * 每个子目标必须同时具备：
 * 1) 对该问题对应关键热点的真实观察（或手电筒照射）；
 * 2) 执行了解决该问题的对应行动。
 * 局部完成只记录对应子目标，绝不自动冒充全部三项目标完成。
 * 此外（Sprint 4.1 FIX-02）：若当前选择的行动是冲突/未解决行动（如抢走手电筒躲起来），
 * 当前场景处于冲突未解决状态（isCurrentActionConflict = true），当前尝试的 isAllGoalsCompleted 必须为 false，
 * 严禁一边展示争抢冲突一边宣告当前所有问题已经解决。
 */
export function evaluateCampTransferGoals(
  inspectedHotspotIds: string[],
  illuminatedBeamTargets: FlashlightBeamTarget[],
  executedActionIds: string[],
  currentActionId?: string | null
): {
  completedGoals: CampTransferGoalId[];
  isAllGoalsCompleted: boolean;
  isCurrentActionConflict: boolean;
} {
  const effectiveHotspots = new Set<string>(inspectedHotspotIds);
  for (const hotspot of STORY_GROVE_CAMP_TRANSFER_CHALLENGE.hotspots) {
    if (illuminatedBeamTargets.includes(hotspot.beamTarget)) {
      effectiveHotspots.add(hotspot.id);
    }
  }

  const currentAction = currentActionId
    ? STORY_GROVE_CAMP_TRANSFER_CHALLENGE.actions.find((a) => a.id === currentActionId)
    : undefined;
  const isCurrentActionConflict = Boolean(currentAction && !currentAction.resolvesProblem);

  const actionSet = new Set<string>(executedActionIds);
  const completedGoals: CampTransferGoalId[] = [];

  for (const goal of STORY_GROVE_CAMP_TRANSFER_CHALLENGE.goals) {
    const hasAllRequiredEvidence = goal.requiredHotspotIds.every((reqId) =>
      effectiveHotspots.has(reqId)
    );
    const hasExecutedGoalAction = actionSet.has(goal.resolvingActionId);
    if (hasAllRequiredEvidence && hasExecutedGoalAction) {
      completedGoals.push(goal.id);
    }
  }

  const isAllGoalsCompleted =
    !isCurrentActionConflict &&
    completedGoals.length === STORY_GROVE_CAMP_TRANSFER_CHALLENGE.goals.length &&
    STORY_GROVE_CAMP_TRANSFER_CHALLENGE.goals.every((g) => completedGoals.includes(g.id));

  return {
    completedGoals,
    isAllGoalsCompleted,
    isCurrentActionConflict,
  };
}

/**
 * Sprint 4.1 FIX-01:
 * 统一《树屋露营夜》复合情境的“行动执行 -> 真实观察证据校验 -> 有效场景状态/台词/伙伴记忆”。
 * 若某个正向行动所依赖的关键观察证据尚未通过手电筒照射或点击检查获得：
 * - 有效画面状态保持 'PENDING_OBSERVATION'，不提前渲染真相画面（如松果树枝或柔光夜灯）；
 * - 结果文字与角色反应提示孩子先用手电筒照亮对应未知区域，不提前剧透真相；
 * - 伙伴记忆同步记录“尚待照亮核实”，杜绝“已观察完成”与“尚无观察证据”的矛盾。
 */
export function resolveCampActionEffectiveOutcome(
  actionId: string | null,
  inspectedHotspotIds: string[],
  illuminatedBeamTargets: FlashlightBeamTarget[]
): {
  hasAllRequiredEvidence: boolean;
  hasRequiredActionEvidence: boolean;
  isActionGoalCompleted: boolean;
  missingHotspotIds: string[];
  missingNeutralLabels: string[];
  effectiveVisualOutcomeState:
    | 'INITIAL_DARK'
    | 'PENDING_OBSERVATION'
    | 'PANIC_CONFLICT'
    | 'SHADOW_REVEALED'
    | 'BOUNDARY_CALMED'
    | 'FLASHLIGHT_SHARED';
  effectiveConsequenceNarrative: string;
  effectiveCharacterReactions: {
    speaker: string;
    mood: 'HAPPY' | 'CALM' | 'SCARED' | 'UPSET';
    line: string;
  }[];
  effectiveRevisionHint: string;
  effectiveIslandFeedbackText: string;
  effectiveChoiceSummary: string;
} {
  const action = actionId
    ? STORY_GROVE_CAMP_TRANSFER_CHALLENGE.actions.find((a) => a.id === actionId)
    : undefined;
  if (!action) {
    return {
      hasAllRequiredEvidence: false,
      hasRequiredActionEvidence: false,
      isActionGoalCompleted: false,
      missingHotspotIds: [],
      missingNeutralLabels: [],
      effectiveVisualOutcomeState: 'INITIAL_DARK',
      effectiveConsequenceNarrative: '',
      effectiveCharacterReactions: [],
      effectiveRevisionHint: '',
      effectiveIslandFeedbackText: '',
      effectiveChoiceSummary: '',
    };
  }

  const effectiveHotspots = new Set<string>(inspectedHotspotIds);
  for (const hotspot of STORY_GROVE_CAMP_TRANSFER_CHALLENGE.hotspots) {
    if (illuminatedBeamTargets.includes(hotspot.beamTarget)) {
      effectiveHotspots.add(hotspot.id);
    }
  }

  const missingHotspotIds = action.requiredHotspotIds.filter(
    (reqId) => !effectiveHotspots.has(reqId)
  );
  const missingNeutralLabels = missingHotspotIds.map(
    (id) => STORY_GROVE_CAMP_TRANSFER_CHALLENGE.hotspots.find((h) => h.id === id)?.label || id
  );

  if (action.resolvesProblem && missingHotspotIds.length > 0) {
    const joinedLabels = missingNeutralLabels.join('、');
    return {
      hasAllRequiredEvidence: false,
      hasRequiredActionEvidence: false,
      isActionGoalCompleted: false,
      missingHotspotIds,
      missingNeutralLabels,
      effectiveVisualOutcomeState: 'PENDING_OBSERVATION',
      effectiveConsequenceNarrative: `你打算「${action.shortTag}」，不过还没有用手电筒照亮并观察「${joinedLabels}」，现在还看不清真实情况哦！`,
      effectiveCharacterReactions: [
        {
          speaker: '小狐狸果果',
          mood: 'CALM',
          line: `我们先在上方画面拖动或转动手电筒光束，把「${joinedLabels}」照亮看清楚，再判断吧！`,
        },
      ],
      effectiveRevisionHint: `先用上方手电筒光束照亮「${joinedLabels}」，获得真实观察证据后就能揭开结果啦！`,
      effectiveIslandFeedbackText: `你准备在树屋露营夜里「${action.shortTag}」，正要去照亮「${joinedLabels}」收集观察证据。`,
      effectiveChoiceSummary: `准备「${action.shortTag}」（待观察：${joinedLabels}）`,
    };
  }

  return {
    hasAllRequiredEvidence: true,
    hasRequiredActionEvidence: true,
    isActionGoalCompleted: Boolean(action.resolvesProblem && action.targetGoalId),
    missingHotspotIds: [],
    missingNeutralLabels: [],
    effectiveVisualOutcomeState: action.visualOutcomeState,
    effectiveConsequenceNarrative: action.consequenceNarrative,
    effectiveCharacterReactions: action.characterReactions,
    effectiveRevisionHint: action.revisionHint,
    effectiveIslandFeedbackText: action.islandFeedbackText,
    effectiveChoiceSummary: action.shortTag,
  };
}

/**
 * Sprint 4 FIX-03:
 * 验证是否构成了真实的行动修正：
 * 必须：
 * 1. 之前已经执行过某个具体行动（previousExecutedActionId 非空）；
 * 2. 已经观察过该行动对应的结果状态（previousOutcomeState 非空）；
 * 3. 本次执行了不同的行动（nextActionId !== previousExecutedActionId）；
 * 4. 本次行动产生了不同的可观察结果（nextOutcomeState !== previousOutcomeState）。
 * 仅点击“返回重新尝试 / 换个方法”按钮绝不构成修正。
 */
export function isGenuineActionRevision(
  previousExecutedActionId: string | null,
  previousOutcomeState: string | null,
  nextActionId: string,
  nextOutcomeState: string
): boolean {
  if (!previousExecutedActionId || !previousOutcomeState) {
    return false;
  }
  if (previousExecutedActionId === nextActionId) {
    return false;
  }
  if (previousOutcomeState === nextOutcomeState) {
    return false;
  }
  return true;
}
