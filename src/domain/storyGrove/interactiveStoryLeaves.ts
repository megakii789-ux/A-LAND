export type InteractiveStoryLeafId = 'cup-size' | 'toy-share';

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
  sceneVisualEffect: 'COMPARE_BOTH' | 'SINGLE_SIDE_ONLY' | 'ASK_NEED' | 'COOPERATE_ROLES' | 'HOURGLASS_TURNS' | 'GRAB_FIRST';
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
    subtitle: '点击木桌上的物品比一比，再试试不同的办法',
    sceneSettingPrompt: '森林木桌上放着一只蓝水杯。小松鼠觉得它太大了，小象却觉得它太小了。先点点桌上的东西看看吧！',
    characters: [
      { id: 'squirrel', name: '小松鼠跳跳', roleNote: '手掌小小，抱着小木积木' },
      { id: 'elephant', name: '小象噗噗', roleNote: '鼻子长长，提着大水桶' },
    ],
    hotspots: [
      {
        id: 'obj_wooden_block',
        label: '小松鼠的小积木',
        shortHint: '放在左边的迷你木块',
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
        shortHint: '桌子正中间的杯子',
        xPercent: 50,
        yPercent: 58,
        inspectObservation: '蓝水杯稳稳放在木桌中间，杯身上画着两格水位线，本身的个头一点儿也没变。',
        inspectCharacterLine: '果果轻声问：“杯子自己没有变魔术，为什么跳跳和噗噗说的不一样呢？”',
        speakerName: '小狐狸果果',
        isKeyObservation: true,
      },
      {
        id: 'obj_elephant_bucket',
        label: '小象的大水桶',
        shortHint: '放在右边的木水桶',
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
        inspectObservation: '小树枝上有三道刻痕：小积木到第1格，蓝水杯到第2格，大水桶到第3格。',
        inspectCharacterLine: '果果点点头：“原来跟不同的东西比，同一个杯子看起来就不一样啦！”',
        speakerName: '小狐狸果果',
        isKeyObservation: false,
      },
    ],
    actions: [
      {
        id: 'act_compare_both_sides',
        label: '把蓝水杯先后移到小积木和大水桶旁比一比',
        shortTag: '两边都比一比',
        childActionLine: '我把蓝水杯先挨着小积木看，再挨着大水桶看，发现它比积木大、比水桶小！',
        sceneVisualEffect: 'COMPARE_BOTH',
        consequenceSummary: '木桌上升起了双侧对比线：蓝水杯在小积木旁显大，在大水桶旁显小。',
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
        cognitiveTakeaway: '看一件事情时，换个参照物或者站在别人的位置比一比，就会明白为什么大家想法不同。',
        encouragesRevision: false,
        islandLinkNote: '故事林树冠亮起了“双视角对比果”，小岛伙伴记住了你的双边观察法。',
      },
      {
        id: 'act_only_look_squirrel',
        label: '只看小松鼠这边，宣布蓝水杯就是大杯子',
        shortTag: '只看一边下结论',
        childActionLine: '蓝水杯比小积木高这么多，它肯定就是大杯子，小象说错了！',
        sceneVisualEffect: 'SINGLE_SIDE_ONLY',
        consequenceSummary: '放大镜只停在左边小积木上，右边的大水桶被阴影盖住了，小象委屈地垂下了鼻子。',
        characterResponses: [
          {
            speaker: '小松鼠跳跳',
            mood: 'HAPPY',
            line: '耶！你帮我说话啦！',
          },
          {
            speaker: '小象噗噗',
            mood: 'UPSET',
            line: '可是你还没看看我的大水桶呢……只看一边，我好委屈呀。',
          },
        ],
        cognitiveTakeaway: '只看一边就急着下结论，容易漏掉另一半重要的画面。要不要再点点右边的大水桶，换个行动试试？',
        encouragesRevision: true,
        revisionPrompt: '小象还在指着右边的大水桶呢，试试看两边都观察，或者换一种做法吧！',
        islandLinkNote: '你可以随时回到木桌继续观察，换个办法看看小象的反应。',
      },
      {
        id: 'act_ask_usage_need',
        label: '问问跳跳和噗噗各自想用杯子做什么',
        shortTag: '问问各自需要',
        childActionLine: '跳跳、噗噗，你们今天想用这只蓝水杯装什么呀？',
        sceneVisualEffect: 'ASK_NEED',
        consequenceSummary: '桌面上浮现出两人的心愿泡泡：跳跳想用它给小芽浇水，噗噗想接满一整桶洗澡水。',
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
        cognitiveTakeaway: '不仅能比大小，还能问问每个人的真实需要，矛盾一下子就解开啦！',
        encouragesRevision: false,
        islandLinkNote: '故事林叶片长出了温暖露珠，小岛伙伴记住了你先询问需要的好方法。',
      },
    ],
  },
  'toy-share': {
    id: 'toy-share',
    title: '两个人想玩同一辆小火车',
    subtitle: '点点火车轨道边的道具，试试怎么玩更开心',
    sceneSettingPrompt: '森林木地板上只有一辆红色小火车头，小熊和小浣熊都想现在玩。先点点地上的物件看看都有什么吧！',
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
        inspectObservation: '只有一辆红色火车头，车钩后面还可以挂果子车厢，必须沿着木轨才能开进车站。',
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
        inspectObservation: '小浣熊用彩色木块搭好了精致的站台，没有火车开过来，车站就冷冷清清的。',
        inspectCharacterLine: '乐乐指着站台说：“我搭了半天车站，如果火车不来停靠，车站就没有乘客啦！”',
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
        inspectObservation: '绿旗一挥、铃铛一响，小火车就能准时进站和发车，原来当站长也超有趣！',
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
        childActionLine: '波波开红色火车头，乐乐拿着小绿旗在积木车站指挥进站，下一圈再互换角色！',
        sceneVisualEffect: 'COOPERATE_ROLES',
        consequenceSummary: '红色小火车呜呜开进积木车站，乐乐摇响站长铃铛，两人的玩耍合在了一条轨道上！',
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
        cognitiveTakeaway: '当两个人都想玩同一个玩具时，把各自搭的车站和火车连起来分工合作，快乐会翻倍！',
        encouragesRevision: false,
        islandLinkNote: '故事林轨道亮起了金色信号灯，小岛记住了你的合作新点子。',
      },
      {
        id: 'act_hourglass_turns',
        label: '放好松果沙漏：约定沙漏流完一轮就交换火车头',
        shortTag: '用沙漏约定轮流',
        childActionLine: '我们把松果沙漏立在中间，波波先开两圈，沙漏流完就换乐乐开进车站！',
        sceneVisualEffect: 'HOURGLASS_TURNS',
        consequenceSummary: '松果沙漏在轨道中央闪着暖光，波波专心开车，乐乐一边看沙漏一边准备车站迎接。',
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
      },
      {
        id: 'act_grab_first',
        label: '谁手快谁先拿走火车头，不管另一边的车站',
        shortTag: '直接抱走自己玩',
        childActionLine: '谁先抢到红色火车头就归谁玩，不用管旁边的车站！',
        sceneVisualEffect: 'GRAB_FIRST',
        consequenceSummary: '火车头被抱离了轨道，积木车站孤零零地倒了一块，两只小动物都鼓起了腮帮子。',
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
        cognitiveTakeaway: '不商量直接抢走，不仅朋友难过，连火车也没法在完整轨道上开啦。要不要回来看看车站和沙漏，换个做法？',
        encouragesRevision: true,
        revisionPrompt: '看看地上的积木车站、小绿旗和松果沙漏，试着换一种能让两个人一起开心的办法吧！',
        islandLinkNote: '随时可以回到地板场景重新观察，试试合作或轮流的新方法。',
      },
    ],
  },
};

export interface StoryGroveTransferHotspot {
  id: string;
  label: string;
  shortHint: string;
  xPercent: number;
  yPercent: number;
  observationDetail: string;
  speakerName: string;
  speakerLine: string;
}

export interface StoryGroveTransferAction {
  id: string;
  label: string;
  childSpokenOrAction: string;
  visualOutcomeState: 'PANIC_CONFLICT' | 'SHADOW_REVEALED' | 'BOUNDARY_CALMED' | 'FLASHLIGHT_SHARED';
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
  hotspots: StoryGroveTransferHotspot[];
  actions: StoryGroveTransferAction[];
}

export const STORY_GROVE_CAMP_TRANSFER_CHALLENGE: StoryGroveTransferChallenge = {
  id: 'leaf-camp-transfer',
  title: '树屋露营夜的神秘影子与唯一手电筒',
  subtitle: '全新童话情境 · 先在树屋帐篷里点点看，再自己选办法试试看',
  openingNarrative:
    '夜晚的树屋帐篷外忽然晃动着一个长着尖角的黑影！小刺猬紧张地一直追问你“你是不是吓哭了？快把你害怕的秘密告诉我”，而帐篷里只有一把小手电筒，小狐狸和小刺猬都想拿。你会怎么做呢？',
  hotspots: [
    {
      id: 'camp_obj_window_shadow',
      label: '帐篷布上的摇晃黑影',
      shortHint: '窗帘布上忽大忽小的影子',
      xPercent: 26,
      yPercent: 38,
      observationDetail: '黑影随着夜风一晃一晃的，每次风停下来，黑影的“尖角”也跟着停在原地不动。',
      speakerName: '小狐狸果果',
      speakerLine: '咦？那个黑影好像只在刮风的时候才动，会是什么东西被风吹摇晃呢？',
    },
    {
      id: 'camp_obj_pinecone_branch',
      label: '窗外挂着松果的树枝',
      shortHint: '透过帐篷缝隙能看到的树枝',
      xPercent: 52,
      yPercent: 28,
      observationDetail: '透过窗缝仔细看，窗外有一根翘起的松树枝，上面正好挂着两颗大松果，形状和黑影一模一样！',
      speakerName: '小狐狸果果',
      speakerLine: '快看窗缝外面！那根挂着松果的树枝，轮廓好像刚才的影子呀！',
    },
    {
      id: 'camp_obj_single_flashlight',
      label: '唯一的小手电筒',
      shortHint: '木垫子中间仅有的照明工具',
      xPercent: 50,
      yPercent: 72,
      observationDetail: '营地里只有这一把暖光手电筒，旁边还有一盏可以把光散开的小露营灯罩。',
      speakerName: '小熊贝贝',
      speakerLine: '手电筒只有一把，要是大家都抢，光束乱晃反而什么都照不清啦。',
    },
    {
      id: 'camp_obj_whispering_peer',
      label: '不停追问的小刺猬点点',
      shortHint: '紧挨着你追问害怕秘密的同伴',
      xPercent: 78,
      yPercent: 60,
      observationDetail: '小刺猬点点其实自己也有点发抖，所以才一直拉着你的袖子追问你害不害怕。',
      speakerName: '小刺猬点点',
      speakerLine: '你快说嘛，你是不是也很怕黑？你在家里晚上是不是也不敢一个人睡？',
    },
  ],
  actions: [
    {
      id: 'camp_act_guess_monster_scream',
      label: '直接大喊“有怪兽”并一把抢过手电筒蒙进被子里',
      childSpokenOrAction: '啊！外面肯定是大怪兽！手电筒归我一个人拿，你们别碰！',
      visualOutcomeState: 'PANIC_CONFLICT',
      consequenceNarrative: '手电筒被蒙进被窝，帐篷里一下子黑乎乎的，小刺猬吓得缩成一团，大家还是不知道窗外是什么。',
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
      revisionHint: '帐篷里还是黑乎乎的，点点看窗缝外的树枝或小手电筒，换个办法试试看吧！',
      islandFeedbackText: '在树屋露营夜里，你尝试了不同办法并准备重新观察调整。',
    },
    {
      id: 'camp_act_shine_light_check_branch',
      label: '先把手电筒照向窗外树枝，一起看清黑影到底是什么',
      childSpokenOrAction: '我们先别自己吓自己，用手电筒照一照窗外那根挂松果的树枝看看！',
      visualOutcomeState: 'SHADOW_REVEALED',
      consequenceNarrative: '暖黄色的光束照亮窗外：原来“尖角怪影”只是夜风吹动了两颗大松果！帐篷里的紧张一下子消散了。',
      characterReactions: [
        {
          speaker: '小刺猬点点',
          mood: 'HAPPY',
          line: '哇！原来是两颗大松果在跳舞，根本不是怪兽呀！',
        },
        {
          speaker: '小狐狸果果',
          mood: 'CALM',
          line: '先照亮看清楚再下结论，一下子就不害怕啦！',
        },
      ],
      resolvesProblem: true,
      revisionHint: '你已经照亮了松果树枝！还可以试试怎么回答小刺猬的追问，或者怎么分配手电筒。',
      islandFeedbackText: '树屋露营灯亮起了暖光，你用真实观察解开了松果黑影之谜！',
    },
    {
      id: 'camp_act_state_comfort_boundary',
      label: '温和地告诉小刺猬：“这是我的小秘密，我现在先不聊这个，我们一起看窗外吧”',
      childSpokenOrAction: '点点，晚上的小习惯是我自己的事，我现在不想聊这个，我们一起坐好看看窗外吧！',
      visualOutcomeState: 'BOUNDARY_CALMED',
      consequenceNarrative: '小刺猬听懂了你的温和边界，不再紧抓着你的袖子追问，而是安静地坐到垫子上。',
      characterReactions: [
        {
          speaker: '小刺猬点点',
          mood: 'CALM',
          line: '好吧，我不追问你的秘密了，那我挨着你一起看窗外。',
        },
        {
          speaker: '小狐狸果果',
          mood: 'HAPPY',
          line: '既清楚说出了自己不想聊的事，又照顾了同伴的情绪，真棒！',
        },
      ],
      resolvesProblem: true,
      revisionHint: '小刺猬已经安定下来啦，也可以再试试分配手电筒或照亮窗外树枝！',
      islandFeedbackText: '树屋露营夜里，你温和又清楚地表达了自己的边界，伙伴们都很安心。',
    },
    {
      id: 'camp_act_share_flashlight_roles',
      label: '和伙伴商量：一人掀开窗帘角、一人握稳手电筒照亮露营灯罩，大家一起看',
      childSpokenOrAction: '手电筒只有一把，我们分工吧：果果掀开窗帘一角，我和点点把光对准露营灯罩，这样每个人都能看清！',
      visualOutcomeState: 'FLASHLIGHT_SHARED',
      consequenceNarrative: '手电筒套上露营灯罩变成柔和的小夜灯，果果掀开窗帘角，三个人同时看清了窗外摇晃的松果！',
      characterReactions: [
        {
          speaker: '小熊贝贝',
          mood: 'HAPPY',
          line: '用灯罩把光散开，大家不用抢手电筒也能一起看清楚啦！',
        },
        {
          speaker: '小刺猬点点',
          mood: 'HAPPY',
          line: '每个人都有事情做，帐篷里亮堂堂的，一点儿也不怕了！',
        },
      ],
      resolvesProblem: true,
      revisionHint: '分工照明超棒！你也可以随时切换试试其他做法，看看伙伴有什么不同反应。',
      islandFeedbackText: '树屋露营夜的小夜灯常亮啦，你和伙伴分工共享手电筒，大家都很开心！',
    },
  ],
};
