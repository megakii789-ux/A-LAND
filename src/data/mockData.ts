import { LeafScenario, ParentScript, ParentObservation, WeeklyLesson, MedalRecord } from '../types';

export const INITIAL_LEAF_SCENARIOS: LeafScenario[] = [
  {
    id: 'cup-size',
    title: '一只杯子，是大还是小？',
    subtitle: '认识物与名：同一个东西换个位置看就不一样',
    category: '物与名',
    weight: 'light',
    character: '小松鼠',
    boundary: 'NONE',
    summary: '桌上放着一只蓝色的水杯。小松鼠拿着一块小积木走过来，小象拿着大水桶走过来。他们为了杯子是大还是小争吵起来……',
    doors: {
      fen: {
        question: '发生了什么？杯子到底是什么样子的？',
        description: '我们先来量一量、看一看杯子的真实样子。'
      },
      tong: {
        question: '站在小积木和小水桶的角度看呢？',
        description: '换个眼睛看看：对积木它是大山，对水桶它是一小滴。'
      },
      ze: {
        question: '如果我们要用这个杯子，可以怎么选？',
        description: '装积木还是装大象洗澡水？看我们拿它来做什么。'
      }
    },
    walkSteps: {
      fenContent: {
        fact: '事实：杯子高10厘米，里面能装一杯温水。',
        guess: '小积木猜：“它是一座高山，我爬不上去！”',
        feeling: '小积木觉得高大，大象觉得它很袖珍。'
      },
      tongContent: {
        sideA: '站在小积木身边看：杯子比积木大好多好多！',
        sideB: '站在大水桶旁边看：杯子在大水桶面前好小好小！',
        whoseView: '杯子没有变，变的是我们在拿它和谁比。'
      },
      zeContent: {
        choiceA: {
          text: '说它“大”还是“小”都可以，看跟谁比',
          benefit: '可能大家都能听懂对方的意思，减少争吵',
          cost: '要多说一句“它比积木大，但比水桶小”'
        },
        choiceB: {
          text: '不管别人怎么说，直接量一量它有多高',
          benefit: '清楚准确，讲的是眼睛看到的事实',
          cost: '需要一把尺子花点时间量'
        }
      }
    },
    choices: [
      {
        id: 'cup-1',
        label: '换位置说话',
        description: '对积木说“它很大”，对水桶说“它很小”。名字是相对的。',
        benefit: '尝试看到不同位置看到的不同信息',
        cost: '需要多想一秒再回答'
      },
      {
        id: 'cup-2',
        label: '只说事实',
        description: '这是一只装水的杯子，它就是它自己。',
        benefit: '清楚明白，不被标签绕晕',
        cost: '有时候大家还是想比大小'
      }
    ],
    offscreenTask: {
      action: '在家里找一只平时喝水的小杯子，然后找一个比它小的东西（比如橡皮），再找一个比它大的东西（比如锅）。指给身边的大人看！',
      tipForAdult: '当孩子拿给你看时，温和地复述：“对橡皮来说杯子是大，对锅来说它是小，杯子本身没有变呢。”'
    },
    compareWithOtherLeaf: {
      otherLeafTitle: '下雨了，对谁好、对谁不好',
      question: '这个杯子的大小，和下雨天有什么像的地方？',
      keyAnalogy: '事情本身是一样的，但换一个位置看，感觉和用处完全不一样！'
    }
  },
  {
    id: 'rain-weather',
    title: '下雨了，对谁好、对谁不好？',
    subtitle: '一事多面：同一场雨，两张不同的笑脸',
    category: '一事多面',
    weight: 'light',
    character: '小青蛙与小兔子',
    boundary: 'NONE',
    summary: '天空中乌云密布，哗啦啦下起了一场大雨。小青蛙跳进池塘呱呱欢呼，拿着风筝准备去草地野餐的小兔子却难过地低下了头……',
    doors: {
      fen: {
        question: '天上发生了什么？谁湿了，谁在笑？',
        description: '分一分：雨是真的落下来了，草地湿了，心里的感觉不同。'
      },
      tong: {
        question: '翻转双面币：种地的伯伯高兴，野餐的小朋友呢？',
        description: '每一面都有感觉，两面都很真实。'
      },
      ze: {
        question: '雨停不了，小兔子今天可以怎么选？',
        description: '在小天平上掂量：允许自己先难过一会儿，或者换个雨天玩法？'
      }
    },
    walkSteps: {
      fenContent: {
        fact: '事实：今天下雨了，地面湿漉漉的，不能在草地放风筝。',
        guess: '小兔猜：“老天爷肯定是故意针对我，讨厌我出去玩。”',
        feeling: '小兔子好失望（失望是完全正常的），种麦子的老伯伯心里很高兴。'
      },
      tongContent: {
        sideA: '正面（对种地的伯伯和小荷花好）：麦苗喝足了水，会长得绿油油！',
        sideB: '反面（对想去野餐的小朋友不好）：风筝飞不起来，衣服鞋子容易湿。',
        whoseView: '雨不是故意为谁下的，它只是自然的天气。'
      },
      zeContent: {
        choiceA: {
          text: '在家里搭一个室内帐篷野餐，听窗外的雨声',
          benefit: '可能还是能和小伙伴一起吃到美味的点心',
          cost: '不能在草地上奔跑放风筝了'
        },
        choiceB: {
          text: '先安静坐一会儿，或者穿雨衣小雨靴去看看小水洼',
          benefit: '允许自己失望，也可能发现雨天特有的水洼声音',
          cost: '裤脚可能会溅到泥水，回家要洗脚'
        }
      }
    },
    choices: [
      {
        id: 'rain-1',
        label: '搭屋里小帐篷野餐',
        description: '把垫子铺在客厅，吃草莓小蛋糕。',
        benefit: '暖和舒适，不受窗外下雨影响',
        cost: '空间比草地小一点点'
      },
      {
        id: 'rain-2',
        label: '穿小靴子去踩踩小水坑（或安静看雨）',
        description: '听雨滴掉在伞面上的咚咚声。',
        benefit: '观察大自然的另一面',
        cost: '需要穿雨衣慢慢走'
      }
    ],
    offscreenTask: {
      action: '推开窗户或者走出房门，深吸一口气，看看今天的天空，想想除了我以外，小树、小鸟或者小蚂蚁在做什么？',
      tipForAdult: '陪伴孩子感知自然的多面性，接纳计划被打乱的失望感，不强迫孩子立刻高兴起来。'
    },
    compareWithOtherLeaf: {
      otherLeafTitle: '一只杯子，是大还是小？',
      question: '下雨天翻看双面币，跟看杯子大小哪里很像？',
      keyAnalogy: '同一件事对不同的人带来不一样的感受，不用强求别人和我想的一模一样！'
    }
  },
  {
    id: 'not-my-fault',
    title: '小熊的心事：不是我的错',
    subtitle: '家的形状（需成人共读 · 待独立审查）：大人的决定在大人圈',
    category: '家的形状',
    weight: 'deep',
    character: '小熊波波',
    boundary: 'ADULT_RESPONSIBILITY_CROSSING',
    summary: '小熊波波最近在不同的房子生活。一天晚上，波波突然掉了眼泪，他小声问：“是不是因为上周我把果酱打翻了，爸爸妈妈才分开的？”',
    doors: {
      fen: {
        question: '哪些是真正发生的事，哪些是小熊脑子里的猜测？',
        description: '分一分：分开住是事实；“都怪我”只是小熊脑海里的一个猜测。'
      },
      tong: {
        question: '用天上的眼睛看：大人的责任圈和小熊的圈子。',
        description: '大人分开是因为大人之间有大人的事情要处理，和小熊乖不乖没有关系。'
      },
      ze: {
        question: '心里堵堵的时候，小熊可以选怎么做？',
        description: '可以告诉信任的大人，也可以画下来或先安静休息。'
      }
    },
    walkSteps: {
      fenContent: {
        fact: '事实：爸爸妈妈做了一个决定，不住在同一个房子里了。',
        guess: '脑子里的猜测：“是我不听话、打翻了果酱，他们才分开的。”（这不是事实！）',
        feeling: '难过、担心、想念，肚子里像被揪紧了一样。'
      },
      tongContent: {
        sideA: '大人的圈子：婚姻是大人之间的关系，大人的决定由大人自己负责。',
        sideB: '小熊的圈子：小熊是小孩子，长大、玩耍、被照顾是小熊的圈子。',
        whoseView: '大人的生活安排改变，不是因为小孩子做错了事。'
      },
      zeContent: {
        choiceA: {
          text: '走到身边信任的大人面前，问出心里的疑问',
          benefit: '可能听到大人说明“这不是你的错”，心里慢慢松一口气',
          cost: '需要一点勇气开口（如果不愿开口也可以先不说）'
        },
        choiceB: {
          text: '给可信的大人画一张小纸条，或者先抱抱小玩偶休息',
          benefit: '不用勉强说话，也能按自己的节奏表达或休息',
          cost: '需要花几分钟画出来'
        },
        fenceReminder: '安全围栏：大人的婚姻决定绝不属于小孩的责任，不需要把大人的压力背在自己身上。'
      }
    },
    choices: [
      {
        id: 'fault-1',
        label: '跟身边信任的大人说一说',
        description: '“妈妈/爸爸，你们分开不是因为我，对不对？”',
        benefit: '把心里的疑问说出来，请大人帮你放下重担',
        cost: '可能眼眶会有点红'
      },
      {
        id: 'fault-2',
        label: '画一张小画或先安静抱抱玩偶',
        description: '不想说话的时候，也可以只画下来或安静待一会儿。',
        benefit: '尊重自己的节奏，不强迫自己马上表达',
        cost: '可以等准备好了再给大人看'
      }
    ],
    offscreenTask: {
      action: '如果你愿意，可以找今天在身边的信任大人要一个拥抱，或者拍拍自己的肩膀说“这不是我的错”。',
      tipForAdult: '请看着孩子的眼睛，温和而清楚地告诉孩子：“分开是大人的决定，这件事100%不是你的错。”'
    },
    compareWithOtherLeaf: {
      otherLeafTitle: '一只杯子，是大还是小？',
      question: '小熊脑子里的“都怪我”，像不像给杯子乱贴的旗子？',
      keyAnalogy: '那面沉重的旗子只是脑袋猜出来的，把旗子摘下来，大人的事由大人负责！'
    }
  },
  {
    id: 'two-homes-rules',
    title: '两个地方的规则不一样',
    subtitle: '对错与规则（需成人共读 · 待独立审查）：不同环境有不同习惯',
    category: '对错与规则',
    weight: 'medium',
    character: '小兔米米',
    boundary: 'ADULT_RESPONSIBILITY_CROSSING',
    summary: '在妈妈家，晚上要把玩具收进箱子里，8点半上床看绘本；在爸爸家，积木可以留在客厅地板上，9点喝牛奶睡觉。米米有点困惑：“到底谁的规则才是对的呢？”',
    doors: {
      fen: {
        question: '先看清：两边各自定了什么日常习惯？',
        description: '看清楚两条日常习惯的不同，哪些是生活习惯，哪些是安全底线。'
      },
      tong: {
        question: '换位置看：为什么两边会有不同的生活安排？',
        description: '一边看重整洁作息，一边希望保留拼搭作品，各有不同的照顾方式。'
      },
      ze: {
        question: '面对不同的生活习惯，米米可以怎么选？',
        description: '可以看看日常提醒卡，也可以向大人温和表达自己的小愿望。'
      }
    },
    walkSteps: {
      fenContent: {
        fact: '事实：不同住处有不同的作息时间和玩具整理方式。',
        guess: '猜想：“他们定不一样，是不是故意让我为难？”',
        feeling: '刚换环境的时候有点手忙脚乱，不知道按哪个做。'
      },
      tongContent: {
        sideA: '妈妈这边的考虑：收纳整齐能让房间清爽，早睡让早晨精神饱满。',
        sideB: '爸爸这边的考虑：积木连着做不打断想法，喝牛奶能放松入睡。',
        whoseView: '两边有不同的生活习惯，不需要由小孩来评判谁对谁错。'
      },
      zeContent: {
        choiceA: {
          text: '用日程小卡片帮自己记住当前住处的作息习惯',
          benefit: '可能更容易记住当天的安排，减少手忙脚乱',
          cost: '需要转换环境时看一看提醒'
        },
        choiceB: {
          text: '温和地向大人表达：“如果也能留一点积木，我会很开心”',
          benefit: '表达自己的小小愿望，和大人一起商量',
          cost: '大人可能同意，也可能有他们的理由'
        },
        fenceReminder: '绝对围栏：身体保护、不许打人害人的安全底线，在任何地方都一样严格！'
      }
    },
    choices: [
      {
        id: 'rules-1',
        label: '看一看当前住处的小习惯卡片',
        description: '用小卡片提醒自己今天的作息。',
        benefit: '不用自己死记硬背，减少紧张',
        cost: '需要花一点时间适应'
      },
      {
        id: 'rules-2',
        label: '和大人商量一条睡前共同小习惯',
        description: '比如无论在哪里，睡前都可以抱抱自己的小玩偶。',
        benefit: '可能保留一件熟悉安心的睡前小事',
        cost: '需要和身边大人简单说一声'
      }
    ],
    offscreenTask: {
      action: '想一件你最喜欢的睡前安心小动作（比如抱抱玩偶或听故事），今天试着做一做。',
      tipForAdult: '尊重不同住处的合理习惯差异，不在孩子面前贬低另一方的生活习惯；核心安全底线保持一致。'
    },
    compareWithOtherLeaf: {
      otherLeafTitle: '一只杯子，是大还是小？',
      question: '不同地方的习惯不一样，和杯子在积木和水桶面前的样子有什么像？',
      keyAnalogy: '环境不同，日常习惯可以不同；只要安全底线守住，不需要评判哪边才唯一正确。'
    }
  },
  {
    id: 'rain-play',
    title: '下雨天出不了门，是好事还是坏事？',
    subtitle: '一事多面：普通客观事件，允许完整多视角与利弊权衡',
    category: '一事多面',
    weight: 'light',
    character: '小水獭',
    boundary: 'NONE',
    summary: '外面下起了大雨，原定去草地踢球的计划泡汤了。小水獭趴在窗前，脑子里想着下雨的好处与坏处……',
    doors: {
      fen: {
        question: '发生了什么？事实是怎样的？',
        description: '事实是天上下雨，地上湿漉漉，室外球赛改期。'
      },
      tong: {
        question: '换个眼睛看呢？小青蛙怎么看？草地怎么看？',
        description: '小青蛙喜欢雨天洗澡，草地正好喝饱水。'
      },
      ze: {
        question: '不出门的话，我们今天可以怎么选？',
        description: '在室内搭帐篷读绘本，还是先安静听听雨声？都可以。'
      }
    },
    walkSteps: {
      fenContent: {
        fact: '事实：今天下雨不能去球场。',
        guess: '小水獭猜：“下雨天太讨厌了，今天全毁了！”',
        feeling: '心里有点失望，腿想跑跑动动。'
      },
      tongContent: {
        sideA: '🪙 这一面：去不了球场踢球，确实有点可惜，允许自己感到失望。',
        sideB: '🪙 翻过来的另一面：也许可以在家里客厅搭一个毛毯城堡，换一种室内玩法。',
        whoseView: '雨水没有好坏之分，看我们怎样安排这一天。'
      },
      zeContent: {
        choiceA: {
          text: '在客厅搭建读书帐篷',
          benefit: '可能在室内也能玩出温馨的新花样',
          cost: '需要收拾一下沙发上的靠枕'
        },
        choiceB: {
          text: '去窗边听雨点打在玻璃上的声音',
          benefit: '安静观察雨滴，也让失望的心情慢慢缓一缓',
          cost: '鞋子不能踩进泥巴里'
        }
      }
    },
    choices: [
      {
        id: 'rain-1',
        label: '在室内搭毛毯城堡',
        description: '用沙发垫和毛毯搭一个属于自己的小天地。',
        benefit: '温暖好玩，还能听雨声',
        cost: '需要收拾一下沙发'
      },
      {
        id: 'rain-2',
        label: '在走廊跳格子或窗边看雨',
        description: '在室内做不吵到别人的小活动。',
        benefit: '舒展身体或安静休息',
        cost: '不能大喊大叫吵到邻居'
      }
    ],
    offscreenTask: {
      action: '走到窗前，用耳朵听 30 秒雨点或窗外的声音，数数能听到几种不一样的声音。',
      tipForAdult: '与孩子一起平静听雨，接纳孩子不能出门的失望感，陪伴完成室内游戏。'
    },
    compareWithOtherLeaf: {
      otherLeafTitle: '一只杯子，是大还是小？',
      question: '下雨天的心情，是不是也像杯子一样，换个角度就不一样？',
      keyAnalogy: '雨就是雨，我们可以先接纳失望，再选择手里的下一步行动！'
    }
  },
  {
    id: 'toy-share',
    title: '两个人想玩同一辆小火车',
    subtitle: '物与名 / 协作选择：同伴玩具冲突，允许正常利弊权衡与商量',
    category: '物与名',
    weight: 'light',
    character: '小刺猬与小浣熊',
    boundary: 'NONE',
    summary: '活动角只有一辆红色的小火车，小刺猬先拿到了，小浣熊也急着想玩。他们两个都抓着车头不放……',
    doors: {
      fen: {
        question: '发生了什么？谁想要小火车？',
        description: '事实是一辆小火车，两个人都在伸手，心里都想玩。'
      },
      tong: {
        question: '换位置看：站在对方的角度他现在急不急？',
        description: '对方也等了很久，对方也想体验开火车的感觉。'
      },
      ze: {
        question: '我们可以怎么商量这个小火车？',
        description: '轮流开、一起搭长轨道、或者请老师帮忙协调？'
      }
    },
    walkSteps: {
      fenContent: {
        fact: '事实：只有一辆小火车，两个人都想玩。',
        guess: '小刺猬猜：“他就是故意抢我的玩具！”',
        feeling: '两个人心里都有点急，怕自己玩不到。'
      },
      tongContent: {
        sideA: '🪙 站在小刺猬看：我先拿到的，我想先把这趟送完。',
        sideB: '🪙 站在小浣熊看：我也喜欢小火车，我带了车站积木想一起拼！',
        whoseView: '两个人都很想玩火车游戏，可以试试商量办法。'
      },
      zeContent: {
        choiceA: {
          text: '设一个5分钟小沙漏，商量轮流当司机',
          benefit: '如果对方同意，每个人都能轮流当司机；如果商量不下也可以请大人帮忙',
          cost: '需要等待沙漏漏完一轮'
        },
        choiceB: {
          text: '提议一个人当司机，另一个人搭车站和乘客',
          benefit: '可能两个人马上都能一起玩起来，把轨道搭得更大',
          cost: '其中一个人暂时不能直接握着车头'
        }
      }
    },
    choices: [
      {
        id: 'toy-1',
        label: '提议用沙漏轮流玩',
        description: '试试用沙漏计时，倒完一次换另一个人开。',
        benefit: '是一种公平商量的尝试',
        cost: '要先等一等，或者请大人帮忙计时'
      },
      {
        id: 'toy-2',
        label: '提议分工合作玩',
        description: '一个开火车，一个修铁轨和造火车站。',
        benefit: '可能让游戏变得更丰富有趣',
        cost: '需要商量谁先当司机'
      }
    ],
    offscreenTask: {
      action: '找身边的一件玩具，和大人或朋友练习一次“轮流玩一分钟”的商量话术。',
      tipForAdult: '肯定孩子尝试商量的做法，同时告诉孩子：如果同伴不肯商量甚至抢夺，可以随时找大人帮忙。'
    },
    compareWithOtherLeaf: {
      otherLeafTitle: '一只杯子，是大还是小？',
      question: '火车只有一辆，像不像杯子只有一只？',
      keyAnalogy: '看到两个人都想玩的心意，就能试试轮流或合作的不同办法！'
    }
  },
  {
    id: 'hitting-boundary',
    title: '他动手打了人，可以吗？',
    subtitle: '绝对红线围栏（需成人共读 · 待独立审查）：身体伤害绝不商量，先保护身体找大人',
    category: '对错与规则',
    weight: 'deep',
    character: '小野猪皮皮',
    boundary: 'PHYSICAL_HARM',
    summary: '积木城堡被撞倒了，皮皮非常生气，挥起拳头打了旁边的同伴。同伴哭了，皮皮也喘着粗气……',
    doors: {
      fen: {
        question: '先分清事实与情绪：发生了什么？',
        description: '事实是城堡倒了，皮皮心里极度生气，动手打了人。'
      },
      tong: {
        question: '他可能有原因吗？原因会改变红线吗？',
        description: '原因可以被理解（他真的委屈愤怒），但打人永远不可以！'
      },
      ze: {
        question: '绝对安全的做法是什么？',
        description: '后退保护身体，大声说停，立刻找身边的安全大人！'
      }
    },
    walkSteps: {
      fenContent: {
        fact: '事实：皮皮生气了，动手打了同伴。',
        guess: '皮皮脑子里想：“他撞我城堡，我就该打回去！”',
        feeling: '皮皮心里像火烧一样气愤，同伴身体受了疼很害怕。'
      },
      tongContent: {
        sideA: '承认原因与情绪：皮皮精心搭的城堡被弄坏，生气是完全可以理解的正常感受。',
        sideB: '边界绝对清楚：但动手打人伤害身体，是绝对不可以做的事！有原因不代表可以打人。',
        whoseView: '情绪都可以有，但伤害身体的拳头必须停下。'
      },
      zeContent: {
        choiceA: {
          text: '后退保护身体，走到安全大人身边求助',
          benefit: '优先保护自己的身体离开危险现场，请身边大人介入处理',
          cost: '需要先停下手脚离开冲突区'
        },
        choiceB: {
          text: '大声说“停下！不可以打人！”并离开现场找大人',
          benefit: '明确亮出红线并撤离，如果对方没停下就立刻跑向大人',
          cost: '需要深呼吸先离开现场'
        },
        fenceReminder: '绝对红线：身体伤害绝不能上小天平称好处！绝不能讨论打人有什么好处。'
      }
    },
    choices: [
      {
        id: 'hit-safe-1',
        label: '后退保护身体，找大人求助',
        description: '退后三步，走到老师或家人身边，说出刚才发生的事。',
        benefit: '优先保护身体安全，让安全大人来帮忙',
        cost: '需要先离开现场'
      },
      {
        id: 'hit-safe-2',
        label: '大声说停，离开现场并找大人',
        description: '两手护住身体大声说“停下！”，然后离开打人现场找大人。',
        benefit: '拉开安全距离，不让自己继续受伤',
        cost: '如果对方不听，不要缠斗，直接跑向大人'
      }
    ],
    offscreenTask: {
      action: '练习一次“后退三步”安全口诀：1后退护住身体、2大声说停、3走向身边的安全大人。',
      tipForAdult: '明确告诉孩子：“你可以非常非常生气，但打人绝对不行。如果有人要打你，不需要原谅或忍受，立刻离开并跑向大人！”'
    },
    compareWithOtherLeaf: {
      otherLeafTitle: '一只杯子，是大还是小？',
      question: '杯子大小可以换位置看，打人可不可以换位置说“有时候打人很好”？',
      keyAnalogy: '绝不可以！身体安全是一道结结实实的围栏，永远不能商量。'
    }
  }
];

export const INITIAL_PARENT_SCRIPTS: ParentScript[] = [
  {
    id: 'script-reunite',
    title: '孩子问：“你们还会和好住在一起吗？”',
    category: '真实与希望',
    scenario: '孩子在睡前或车上突然问起父母是否还能像以前一样生活在一个家里。',
    canSay: [
      '“我和爸爸/妈妈做了一个深思熟虑的决定，我们不会再住在同一个房子里了。”',
      '“大人的婚姻结束了，但是我们作为你的爸爸和妈妈，爱你的责任永远永远不会结束。”',
      '“不管我们住在哪里，我们都会一直一直陪伴你长大。”'
    ],
    shouldNotSay: [
      '“等你长大了就懂了。”（敷衍削弱信任）',
      '“都怪你爸/你妈脾气太差没办法过。”（推诿指责，制造忠诚冲突）',
      '“也许以后会吧……”（给孩子不切实际的重聚幻想，延缓适应期）'
    ],
    why: '6岁孩子具有字面思维和重聚幻想。明确且温和地澄清现实，能切断孩子内心的悬空感，将心理能量从“等待复合”转向“适应新生活”。'
  },
  {
    id: 'script-love',
    title: '孩子问：“爸爸/妈妈还爱我吗？”或担心另一方难过',
    category: '依恋、事实与猜测分离',
    scenario: '见不到另一方的一段日子，或孩子在一方玩得开心却突然担心另一方孤单、不确定对方的心意。',
    canSay: [
      '“我能确定地告诉你：我一直在这里照顾你。至于另一边的大人现在在想什么，我们没亲眼看到时只是猜测，下次见面或通话时可以直接问他/她。”',
      '“大人分开住是大人的决定，100%不是因为你；你在任何一边玩得开心，都不需要觉得对不起另一边。”',
      '“如果你同时想念两边，或者现在不想画画、不想写信、只想静一静，都完全可以。”'
    ],
    shouldNotSay: [
      '“他要是真爱你，怎么上周末不来接你？”（将大人的怨恨转嫁给孩子）',
      '“有我爱你还不够吗？”（把孩子推入二选一的内疚与背叛感中）',
      '“两个家一模一样好，你不许说不喜欢！”（强行替另一方做虚假保证或压抑孩子的真实感受）'
    ],
    why: '区分“当前可确定的照护事实”与“对另一方心理的猜测”，不替另一方做空洞承诺，同时把成人情绪责任交还给成人，能帮6岁孩子卸下忠诚冲突与讨好负担。'
  },
  {
    id: 'script-blame',
    title: '孩子自责说：“都怪我不乖……”',
    category: '责任圈重构',
    scenario: '孩子摔坏玩具、淘气或者大人争吵后，孩子表达是自己的问题导致了父母分开。',
    canSay: [
      '“宝贝，蹲下来看着妈妈的眼睛。分开100%是大人的决定，100%不是你的错。”',
      '“即便你把整个房间的积木都打翻，大人的决定也和你一点关系都没有。”',
      '“你只是一个6岁的小朋友，你的任务是尽情玩耍、好奇探索，大人的事由大人负责。”'
    ],
    shouldNotSay: [
      '“行了行了，别胡说八道。”（生硬打断，孩子会以为真被自己猜中了）',
      '“要是你少惹我们生气，我们心情还能好点。”（加重孩子的自责内疚，影响心理健康）'
    ],
    why: '6岁儿童处于自我中心思维阶段，容易用“魔法因果”把大人的变故归因于自己的小错误。必须用清晰的“责任圈”彻底卸下重担。'
  },
  {
    id: 'script-transition',
    title: '换家多维情境：双向不舍、不习惯、具体担忧或轻松出发',
    category: '换家多维支持与安全分流',
    scenario: '准备去另一边生活时，孩子可能同时舍不得两边、对一边不太习惯、因日程不清而担忧、说不清原因，也可能开开心心准备出发。',
    canSay: [
      '“【先问感受与具体原因】你现在是舍不得分开、不知道住几天、对那边的床铺规矩不习惯，还是暂时说不清楚？如果今天心情轻松，我们直接出发就好！”',
      '“【尊重边界与真实喜好】你可以同时想念两边，也可以对其中一个地方不太习惯，不需要强迫自己觉得两个地方一样好；不想拥抱或不想写卡片也没关系。”',
      '“【安全底线优先】如果是因为那边有人凶你、打人或让你害怕受伤害，一定要告诉我，我们不用装书包硬撑，你的安全永远排第一。”'
    ],
    shouldNotSay: [
      '“不想去就别去了，咱们再也不理他。”（在无安全风险时剥夺正常探视与关系连接）',
      '“必须抱一下、笑一个再走，两个家都一样爱你！”（强迫身体接触、强颜欢笑或用万能口号掩盖具体问题）',
      '“孩子高高兴兴出门时反复追问：你真的不害怕吗？你会不会不想我？”（在普通平稳转换中人为制造分离焦虑与忠诚内疚）'
    ],
    why: '换家并非只有“分离焦虑→塞玩偶”一条路径。先调查具体原因（分离不舍、日程不明、环境陌生、说不清或安全伤害），区分日常过渡与安全保护，才能真正支持孩子理解自我并尝试合适的行动。'
  },
  {
    id: 'script-messenger',
    title: '孩子替大人传话：“妈妈让我问你……”',
    category: '边界与孩子不夹在中间',
    scenario: '孩子从另一方回到家，传达关于生活费、日程或私事的询问。',
    canSay: [
      '“谢谢宝贝告诉我知道。但是记住哦，传话是大人的事，不应该让你当小邮递员。”',
      '“我会直接在手机上用文字跟妈妈/爸爸联系这件事，你现在可以放下书包去搭积木了。”'
    ],
    shouldNotSay: [
      '“回去告诉你妈，门都没有！”（把孩子变成发射炮弹的炮膛）',
      '“她还跟你说了我什么坏话？老实交代！”（把孩子当成刺探对方的间谍）'
    ],
    why: '让孩子承担传话、探听任务会给孩子带来不必要的心理压力。大人的沟通应由大人直接进行。'
  },
  {
    id: 'script-school-ask',
    title: '同学或老师问：“你爸爸/妈妈怎么没来？”',
    category: '同伴与披露（三句话工具箱）',
    scenario: '幼儿园开放日或放学时，同学无意中好奇询问。',
    canSay: [
      '“如果同学只是好奇问，我们可以挑自己舒服的话回答：”',
      '“说法一（轻描淡写）：‘他今天有事情，今天是我妈妈来接我。’‘你有带小彩笔吗？’”',
      '“说法二（简短事实）：‘我爸爸妈妈分开住，我有两个家。’”',
      '“说法三（礼貌边界）：‘这是我家的事，我现在想先去搭滑梯。’”',
      '“如果有人说让你不舒服的话，直接告诉老师或者爸爸妈妈，我们永远支持你。”'
    ],
    shouldNotSay: [
      '“千万别跟任何人说我们离婚了，太丢人了。”（植入耻感与自我贬抑）',
      '“逢人就告诉他们，没什么大不了的！”（强行逼迫孩子承担不可控的社交压力）'
    ],
    why: '披露没有标准答案，核心是赋予孩子自主感与应对能力。给孩子三句话工具箱，让其根据情境自由选择深浅度。'
  },
  {
    id: 'script-new-partner',
    title: '谈论新伴侣或家庭新变化',
    category: '家庭边界重构',
    scenario: '当生活中出现了新的叔叔或阿姨，孩子感到不安或产生忠诚冲突。',
    canSay: [
      '“他是妈妈/爸爸的好朋友。他不是来代替你亲生爸爸/妈妈的，没有人能代替你的亲生父母。”',
      '“你不需要立刻喜欢他，只要有基本的礼貌就可以；你的感受随时都可以告诉我。”',
      '“我们对你的爱永远不会因为多了一个人而减少哪怕一分。”'
    ],
    shouldNotSay: [
      '“以后管他叫新爸爸/新妈妈。”（强迫重塑称谓，引发剧烈心理防御）',
      '“你如果不喜欢他，就是不懂事。”（道德绑架）'
    ],
    why: '继家庭重组最大的雷区是催熟关系与替代焦虑。守住“生父生母地位唯一”的底线，孩子才能在安全感中逐渐接纳善意。'
  },
  {
    id: 'script-retaliation-hitting',
    title: '孩子说：“可是他是因为先被打才打回去！”',
    category: '身体边界与红线守则',
    scenario: '同伴冲突或打人事件后，孩子为还手辩解，认为“对方先动手，我就可以打回去”。',
    canSay: [
      '“我完全听懂了你的委屈，被人先动手打，心里肯定又疼又愤怒，想还手太正常了。”',
      '“但是听妈妈/爸爸说：打人和伤害身体永远是红线，即便别人先做错，打人也解决不了问题，还会让你陷入危险。”',
      '“第一要务永远是：后退一步护住身体，大声喊‘停下’，然后立刻跑向身边的老师或家长！”',
      '“保护自己绝不等于动手打人；寻求大人帮助才是最有力量的自我保护，大人一定会为你主持公道。”'
    ],
    shouldNotSay: [
      '“打得好！谁打你你就给我狠狠打回去！”（以暴制暴，破坏身体安全第一原则，诱发严重校园伤害）',
      '“你懂不懂礼貌？人家打你你就忍着！”（压抑委屈，剥夺儿童自我保护与求助意志）',
      '“苍蝇不叮无缝的蛋，他怎么不打别人就打你？”（归咎受害者，彻底摧毁亲子信任）'
    ],
    why: '儿童将“动机/被攻击的委屈”与“行为合法性”混淆。家长必须先100%肯定情绪与委屈，而后坚定立下“保护身体与找大人”的行动红线，杜绝动机合理化暴力。'
  }
];

// Phase 3 P1 #2: 默认观察记录全部为 0，仅在显式 Demo Mode 时注入演示数据
export const INITIAL_PARENT_OBSERVATIONS: ParentObservation[] = [
  {
    id: 'obs-frustration',
    dimension: '挫折之后的第一句话',
    oldBehavior: '常说“都怪我”或“都怪他把事情搞砸了”',
    targetBehavior: '会说“我再看看还有什么可能”或“刚才有点急，现在退后一步看看”',
    selfInitiatedCount: 0
  },
  {
    id: 'obs-others-action',
    dimension: '对别人举动的说法',
    oldBehavior: '常断定“他就是故意跟我过不去、故意抢我玩具”',
    targetBehavior: '能表达“他可能不是故意的，也可能是在着急，我不确定”',
    selfInitiatedCount: 0
  },
  {
    id: 'obs-after-choice',
    dimension: '做完选择之后',
    oldBehavior: '常说“反正没办法了”或“我选了又后悔”',
    targetBehavior: '能表达“我知道这个选择有代价，我愿意自己试试”',
    selfInitiatedCount: 0
  },
  {
    id: 'obs-person-label',
    dimension: '对人与事的区分（摘旗子）',
    oldBehavior: '常直接贴标签说“他是坏孩子、我是可怜的孩子”',
    targetBehavior: '能区分“他打人是不对的，但他还在学做朋友”',
    selfInitiatedCount: 0
  },
  {
    id: 'obs-own-emotion',
    dimension: '对自己的情绪命名',
    oldBehavior: '只会发脾气大喊大叫“我就是气死了！”',
    targetBehavior: '能主动说“我现在像一团红色的暴风雨，肚子里紧紧的”',
    selfInitiatedCount: 0
  }
];

export const INITIAL_WEEKLY_LESSONS: WeeklyLesson[] = [
  {
    week: 1,
    pillar: 'P1 安全与可预测性',
    title: '建立安全港：一致的日常与交接仪式',
    duration: '4 分钟微课',
    coreAction: '本周只做一件事：固定睡前15分钟相同的流程，不管在哪个家。',
    description: '在两处生活转换中，清晰的日程提示与可选的日常整理清单能提升生活可预测性，同时尊重孩子不同的感受与边界（不预设每次换家都必然焦虑）。'
  },
  {
    week: 2,
    pillar: 'P2 情绪接纳与共同调节',
    title: '情绪接纳三句话：在说理之前先抱抱',
    duration: '3 分钟微课',
    coreAction: '本周只做一件事：孩子发脾气时，先说“你现在很难过/生气，可以哭，我陪着你”，忍住不批评。',
    description: '情绪优先是底层法则。6岁孩子情绪中枢尚未发育成熟，先接住感受、共情身体感觉，理性思考才能重新上线。'
  },
  {
    week: 3,
    pillar: 'P3 责任圈与去中间人',
    title: '拆掉隐形炮筒：孩子绝不是信使',
    duration: '5 分钟微课',
    coreAction: '本周只做一件事：所有关于日程、开销与换家的沟通，只通过大人手机文字简短完成，绝不让孩子传半句话。',
    description: 'New Beginnings 循证干预的最高杠杆：减少父母冲突在孩子面前的暴露，彻底消除孩子的角色扩散与忠诚撕裂。'
  },
  {
    week: 4,
    pillar: 'P5 联结与胜任感',
    title: '“特别时光”：每周15分钟无条件陪伴',
    duration: '4 分钟微课',
    coreAction: '本周只做一件事：安排一次15分钟亲子特别时光，孩子主导，大人不提问不纠正，只跟随描述。',
    description: '源自亲子互动治疗（PCIT）的黄金法则，给予孩子确定性的安全感和掌控感，迅速修复亲子关系。'
  }
];

// Phase 3 P1 #2 & R3-01: 默认活动标记全部为 unlocked: false，仅作为客观活动计数，不代表心理能力
export const INITIAL_MEDALS: MedalRecord[] = [
  {
    id: 'sun-awareness',
    title: '晨光觉察徽章',
    type: 'sun',
    emoji: '☀️',
    category: 'weather',
    description: '记录了一次今天的心情天气！',
    meaning: '客观活动记录：完成了天气与身体感觉点选练习。',
    offscreenAction: '走出房门看看今天的天空，做一次深深的吸气！',
    unlocked: false
  },
  {
    id: 'breaker-master',
    title: '小锤粉碎徽章',
    type: 'sun',
    emoji: '🔨',
    category: 'breaker',
    description: '在大困难拆解台，把一块大石头拆解成 3 个小动作！',
    meaning: '客观活动记录：体验了把困难拆解为具体小动作的流程。',
    offscreenAction: '找一块家里的小积木，代表你的第一步小动作，握在手心3秒钟！',
    unlocked: false
  },
  {
    id: 'coin-flipper',
    title: '双面翻转徽章',
    type: 'sun',
    emoji: '🪙',
    category: 'leaves',
    description: '体验了翻转双面币，看看同一件事的不同面！',
    meaning: '客观活动记录：体验了换个位置观察信息的工具。',
    offscreenAction: '对今天陪你的大人说一句：“我刚才翻过硬币，看到了另一面哦！”',
    unlocked: false
  },
  {
    id: 'action-pioneer',
    title: '踏脚石小勇士',
    type: 'sun',
    emoji: '👣',
    category: 'breaker',
    description: '在故事里挑选了一个小动作！',
    meaning: '客观活动记录：体验了在可选行动中做出一次选择。',
    offscreenAction: '离开屏幕，去喝一小口温水！',
    unlocked: false
  },
  {
    id: 'rain-acceptance',
    title: '温柔接雨徽章',
    type: 'rain',
    emoji: '💧',
    category: 'weather',
    description: '记录了一次下雨或雷雨天，允许自己难过与流泪！',
    meaning: '客观活动记录：点选了一次阴雨或雷雨天气。',
    offscreenAction: '把双手轻轻放在心口，对自己小声说一句：“难过也没关系，我陪着自己。”',
    unlocked: false
  },
  {
    id: 'rain-flow',
    title: '晴雨流动徽章',
    type: 'rain',
    emoji: '🌧️',
    category: 'weather',
    description: '记录了 3 次天气变化！',
    meaning: '客观活动记录：累计完成了 3 次天气记录。',
    offscreenAction: '看看窗外今天的天空是什么颜色。',
    unlocked: false
  },
  {
    id: 'hug-courage',
    title: '温暖求助徽章',
    type: 'rain',
    emoji: '❤️',
    category: 'hug',
    description: '打开了本地找大人帮忙入口！',
    meaning: '客观活动记录：查看了找身边大人帮忙的指引。',
    offscreenAction: '抱一抱今天在身边的家人，数到 5 听听心跳声！',
    unlocked: false
  },
  {
    id: 'calm-breather',
    title: '绿草静心徽章',
    type: 'rain',
    emoji: '🌿',
    category: 'weather',
    description: '在绿草平静角完成了深呼吸与着陆练习！',
    meaning: '客观活动记录：完成了一次呼吸与感官着陆流程。',
    offscreenAction: '再吹灭一朵想象里的小蒲公英，把清风吹向身旁的大人！',
    unlocked: false
  }
];
