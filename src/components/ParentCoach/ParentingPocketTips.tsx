import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  BookOpen,
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Compass,
  Boxes,
  Search
} from 'lucide-react';
import { Interactive3DCard } from '../common/Interactive3DCard';

export type ThinkingPosture = 'fen' | 'tong' | 'ze';

export interface ParentingTipItem {
  id: string;
  posture: ThinkingPosture;
  postureLabel: string;
  postureBadgeColor: string;
  title: string;
  scenario: string;
  developmentalRationale: string;
  coreScript: string;
  stepGuide: Array<{ step: string; content: string }>;
  avoidScript: string;
  offscreenActionTip: string;
}

export const PARENTING_POCKET_TIPS: ParentingTipItem[] = [
  // ================= 1. 分：区分事实与感受/推论 =================
  {
    id: 'tip-fen-mistake',
    posture: 'fen',
    postureLabel: '分 · 区分事实与猜测',
    postureBadgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
    title: '打翻水杯或弄坏物品时，孩子陷入恐慌自责',
    scenario: '果汁泼了一地、搭好的积木塌了，孩子大哭或吓得一动不动：“都怪我，我把所有事都搞砸了！”',
    developmentalRationale:
      '6岁儿童常处于“情绪推理（Emotional Reasoning）”与过度概括阶段。当感受到内疚或恐惧时，前额叶容易将单一突发意外放大为对自我人品的全面否定。家长此时若立即讲道理，孩子只会更防备，需要先用具象感官把“看得见的事实”从“脑子里的灾难猜测”中剥离。',
    coreScript:
      '“宝贝，我们先按下暂停键，用小眼睛看看：地上的事实只是水洒了。脑子里那个‘都怪我’的声音，只是在吓唬你。水擦干就好，你永远是安全的。”',
    stepGuide: [
      { step: '第1步：陈述客观事实', content: '“我们先看眼睛能看见的事实：杯子碰倒了，果汁流在地板上了。”' },
      { step: '第2步：命名并剥离脑中猜测', content: '“脑子里是不是在猜‘妈妈要发大火了’？那只是脑子在吓唬你，不是事实。”' },
      { step: '第3步：回归物理解决小行动', content: '“拿一块抹布，我们一起把水吸干。事情搞砸了不等于你不好。”' }
    ],
    avoidScript: '“你怎么这么不小心！早跟你说了拿稳点，现在好了吧！”（强化了孩子对意外的道德灾难化恐惧）',
    offscreenActionTip: '递给孩子一块抹布，握着孩子的手一起擦地，用身体动作传递“意外可以被修复”。'
  },
  {
    id: 'tip-fen-divorce',
    posture: 'fen',
    postureLabel: '分 · 区分事实与责任',
    postureBadgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
    title: '孩子暗暗怀疑：“爸爸妈妈分开是不是因为我不听话？”',
    scenario: '家庭结构变动、分两个家生活后，孩子变得格外小心翼翼或频繁试探大人底线。',
    developmentalRationale:
      '皮亚杰认知理论指出，6岁孩子具有强烈的“自我中心归因（Egocentric Causality）”倾向，容易把大人之间生活变故与分开决定，解释为自己某次打翻果酱或哭闹引起的惩罚。必须以斩钉截铁的事实为孩子卸下成年人的责任重担。',
    coreScript:
      '“大人不住在一个房子里，是大人之间做的大人决定。这件事百分之百不是因为你做了什么或没做什么。你的唯一任务，就是安心当个小孩被我们爱着。”',
    stepGuide: [
      { step: '第1步：明确责任边界', content: '“婚姻是大人之间的事情，大人的难题由大人自己承担，绝对不用你负责。”' },
      { step: '第2步：澄清不变的事实', content: '“房子形状变了，但爸爸妈妈爱你的心一丁点都没有分完。”' },
      { step: '第3步：给予身体拥抱确认', content: '“看着爸爸/妈妈的眼睛，伸出双手，要一个大大的抱抱。”' }
    ],
    avoidScript: '“要不是为了你，我们怎么会变成今天这样……”或“问你爸/妈去，都是Ta做的好事！”（将孩子置于责任绞肉机）',
    offscreenActionTip: '睡前温和重复三句话：“你永远是我们最爱的宝贝；分开是大人的事；这件事100%不是你的错”。'
  },
  {
    id: 'tip-fen-body-alarm',
    posture: 'fen',
    postureLabel: '分 · 区分身体信号与现实',
    postureBadgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
    title: '孩子发脾气握拳尖叫，身体处于高警报状态',
    scenario: '换家接送、遇到挫折或疲惫时，孩子突然尖叫发火、紧握拳头，甚至大口喘粗气。',
    developmentalRationale:
      '交感神经过度激活时，杏仁核劫持了理性思考。此时孩子的大脑处于“战斗或逃跑”模式。需要教孩子分清“身体内部的红绿灯警报”与“当下的现实安全”，用身体感知带回平静。',
    coreScript:
      '“我看到你的小拳头握得紧紧的，肚子里像有一团小火苗。这是身体在告诉你‘我好生气’。有这种感觉很正常，但在这个房间里你是安全的，我陪着你。”',
    stepGuide: [
      { step: '第1步：描述身体感受', content: '“小拳头握紧了、心跳咚咚跳，身体在亮黄灯提醒你。”' },
      { step: '第2步：接纳情绪合法性', content: '“可以生气、可以难过，每种感觉都可以来做客。”' },
      { step: '第3步：锚定当下现实', content: '“我们先坐下来摸摸小肚子，深吸一口气，等身体慢下来。”' }
    ],
    avoidScript: '“这有什么好哭/生气的？别嚎了，赶紧给我坐好！”（否定感受会促使神经系统更加警觉激惹）',
    offscreenActionTip: '引导孩子把手掌轻轻按在胸口，感受大人的均匀心跳与温暖呼吸。'
  },
  {
    id: 'tip-fen-task-overwhelm',
    posture: 'fen',
    postureLabel: '分 · 区分大困难与小切片',
    postureBadgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
    title: '面对大任务或挫折大哭：“太难了，我做不好！”',
    scenario: '遇到折纸、系鞋带或拼大积木卡住，孩子直接扔在地上大哭大闹并放弃。',
    developmentalRationale:
      '6岁儿童工作记忆容量有限（约为3-4个信息单元），当任务步骤过多时，容易造成“认知超载（Cognitive Overload）”，从而产生逃避与习得性无助。需要用“分”的思考姿态把一座大山切成可以一口吃掉的小切片。',
    coreScript:
      '“宝贝，大城堡确实看起来好大，把我们吓到了。但我们可以把它切成小土豆：现在我们不拼整座城堡，只挑出3块蓝色的积木。就找这3块，好不好？”',
    stepGuide: [
      { step: '第1步：接纳并确认任务难度', content: '“这确实挺有挑战的，换作大人第一次做也会觉得有点难。”' },
      { step: '第2步：物理分割大目标', content: '“把整座大城堡分成十个小台阶，现在我们只站上第一个台阶。”' },
      { step: '第3步：限定极小可达成的微动作', content: '“你来找红色的小螺丝，我帮你扶着底座，我们只试一次。”' }
    ],
    avoidScript: '“这有什么难的？别的小朋友早就会了，你就是太懒不想动脑筋！”（摧毁自我效能感）',
    offscreenActionTip: '在桌上用食指画一个圈：“现在我们的世界只有这个小圈圈这么大，只解决圈里的这一块”。'
  },
  {
    id: 'tip-fen-peer-words',
    posture: 'fen',
    postureLabel: '分 · 区别人言与自我本质',
    postureBadgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
    title: '听到同伴说“我不跟你玩了/你好笨”就全盘崩溃',
    scenario: '放学回家眼泪汪汪，或者大发雷霆：“小明说我很笨，他再也不跟我玩了，我什么都做不好！”',
    developmentalRationale:
      '6岁孩子对同伴评价极度敏感，且难以区分“他人此刻的冲动言语”与“自己的内在客观事实（Self-Concept vs Other Feedback）”。引导孩子将“别人的嘴巴发出的声音”与“事实真相”区分开来，建立坚韧的自我界限。',
    coreScript:
      '“小明嘴巴里说出来的话，是他此刻的情绪气球，不等于真实的你。事实是你今天把画画得特别用心。别人的嘴巴说了什么，决定不了你有多棒。”',
    stepGuide: [
      { step: '第1步：抱住孩子抚平委屈', content: '“听到好朋友这么说，心里一定像被小针扎了一下，特别疼，对不对？”' },
      { step: '第2步：区分‘他的嘴巴’与‘你的事实’', content: '“小明生气时吹了一个难听的气球，但那不是给你的标签，不能贴在你身上。”' },
      { step: '第3步：回忆一件真实确认的事实', content: '“事实是：昨天你还和他一起开心地开小火车。等明天气球消了我们再看看。”' }
    ],
    avoidScript: '“他说你你就信啊？你也去骂他笨！”或“肯定是你先招惹人家了！”（激发报复或受害者内疚）',
    offscreenActionTip: '做假装撕掉贴纸的动作从孩子衣服上撕下来扔掉：“把别人随便贴的坏贴纸撕掉扔进垃圾桶，你还是发光的小勇士”。'
  },

  // ================= 2. 通：换位理解与双重视角 =================
  {
    id: 'tip-tong-two-rules',
    posture: 'tong',
    postureLabel: '通 · 换位与双重视角',
    postureBadgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    title: '两个家规矩不一样，孩子感到混乱抗拒',
    scenario: '“在爸爸家可以9点睡，为什么妈妈家8点半就要收玩具关灯？你们谁才是对的？！”',
    developmentalRationale:
      '学龄前和学龄初期儿童习惯于单一规则思维（Moral Realism），容易以为世界上所有情境都只有唯一的“绝对正确答案”。引导孩子理解“不同房子有不同习惯”，就像适应学校和幼儿园的不同作息一样，是在培育心理弹性与情境适应力。',
    coreScript:
      '“妈妈家喜欢整洁安心，爸爸家喜欢自由探索。就像小鱼游在不同水池里，两个家规则不一样，但都在用心爱你。你很聪明，能掌握两个家的通行卡！”',
    stepGuide: [
      { step: '第1步：承认差异合理性', content: '“你观察得真仔细！妈妈家和爸爸家的作息和整理方式确实不同。”' },
      { step: '第2步：解释各自善意初衷', content: '“妈妈希望你睡饱精神好，爸爸希望你把积木留到明天继续玩，都是爱你的方式。”' },
      { step: '第3步：肯定孩子的适应能力', content: '“你拥有两张通行卡，在哪个家就按哪个家的习惯来，你做得特别棒。”' }
    ],
    avoidScript: '“他那叫放纵不管你！到我这儿必须按我的规矩来，听见没有？！”（诱发对抗性分裂）',
    offscreenActionTip: '在玄关或书包边贴一张“两个家通行卡”图画，画上不同房子的温馨小作息。'
  },
  {
    id: 'tip-tong-peer-conflict',
    posture: 'tong',
    postureLabel: '通 · 双面币视角',
    postureBadgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    title: '和小伙伴发生摩擦，孩子坚称对方“存心害我”',
    scenario: '小伙伴不小心碰倒了孩子的画，孩子大喊：“他讨厌我！他是大坏蛋！”',
    developmentalRationale:
      '6岁孩子由于心理理论（Theory of Mind）还在演进中，容易误将意外行为解读为敌意攻击（Hostile Attribution Bias）。用“双面币”具象隐喻，帮助孩子从受害者单视角跳出，看见对方的视角与局限。',
    coreScript:
      '“这件事就像一枚双面币。站在你的正面看，画画弄脏了好难过；翻到他的反面看，他刚才在追球没看路，吓得呆在原地。他可能不是故意的，他也慌了。”',
    stepGuide: [
      { step: '第1步：先认可孩子的委屈', content: '“辛辛苦苦画的画被蹭到了，心里肯定特别心疼，这完全可以理解。”' },
      { step: '第2步：翻转到对方的眼睛', content: '“我们换一副眼镜看看：对方刚才脚下绊了一下，他现在是什么表情？”' },
      { step: '第3步：从总判决转向具体行为', content: '“他不一定是大坏蛋，只是刚才太毛糙没看路。我们去听听他怎么说。”' }
    ],
    avoidScript: '“人家又不是故意的，你斤斤计较什么大惊小怪的！”（压抑了孩子的心疼，未能建立真正的同理心）',
    offscreenActionTip: '拿一枚真实的硬币在桌上翻转：“看，一面是字，一面是花，一件事有两张脸”。'
  },
  {
    id: 'tip-tong-unmet-promise',
    posture: 'tong',
    postureLabel: '通 · 非敌对性理解',
    postureBadgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    title: '另一方家长迟到或临时失约，孩子极度失落',
    scenario: '原本约好周末去游乐场，另一位家长因紧急工作失约，孩子低头抹眼泪不肯说话。',
    developmentalRationale:
      '孩子容易将失约直接推论为“爸爸/妈妈不爱我了、不想见我”。同住照顾者此时若借机指责对方，会加剧孩子的忠诚冲突（Loyalty Conflict）。应提供“真实事实 + 工作现实 + 不变的爱”的中立归因。',
    coreScript:
      '“爸爸/妈妈今天没能来，你特别盼望、特别失望，这很自然。但大人遇到了突发的紧急事情，这绝不代表他不爱你。失约很遗憾，但他心里一直想着你。”',
    stepGuide: [
      { step: '第1步：充分容纳失落', content: '“换作我也会很失落，过来，今天抱抱的时间不限时。”' },
      { step: '第2步：客观陈述外部阻碍', content: '“工作上出了紧急难题，他现在也一定很着急很遗憾。”' },
      { step: '第3步：把想念存进想念盒子', content: '“我们把你想说的话画下来放进盒子里，等见面时交给他。”' }
    ],
    avoidScript: '“你看吧，我就知道他靠不住！他心里根本没有你！”（避免在孩子面前否定另一位家长，这会加重孩子的心理负担）',
    offscreenActionTip: '陪孩子准备一张想念卡片或小折纸，把被动等待转化为主动安放感受。'
  },
  {
    id: 'tip-tong-parent-tired',
    posture: 'tong',
    postureLabel: '通 · 情绪去个人化',
    postureBadgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    title: '家长自身疲惫低落，孩子以为“爸爸/妈妈嫌弃我”',
    scenario: '家长下班很累不想说话、脸色沉重，孩子反复黏上来试探或者莫名哭闹发脾气。',
    developmentalRationale:
      '儿童的情绪雷达非常敏锐，能快速捕捉到家长的微表情和冷淡，但自我中心归因倾向会让他们以为“是我做错了事让大人不高兴了”。大人主动澄清自己的身心电量，是给孩子最好的安全感解药。',
    coreScript:
      '“宝贝，妈妈/爸爸今天脸色有点累，是因为工作跑了很久，身体电池只剩5%了。这百分之百不是因为你，我非常非常爱你。让我安静充10分钟电，满血了再来陪你玩。”',
    stepGuide: [
      { step: '第1步：主动澄清非孩子原因', content: '“看着妈妈的眼睛：妈妈不笑不是因为你，是因为妈妈身体很累。”' },
      { step: '第2步：使用电量比喻具体化', content: '“就像手机需要插上充电器，大人的身体现在需要安静充一会儿电。”' },
      { step: '第3步：约定清晰可见的充能倒计时', content: '“我们设定10分钟小闹钟，闹钟响了，妈妈就满血复活给你一个大拥抱。”' }
    ],
    avoidScript: '“你能不能让我安静会儿！成天烦死了，别过来粘着我！”（加剧被抛弃感与不安全依恋）',
    offscreenActionTip: '在沙漏或手表上指给孩子看：“等红色的指针走到这里，大人的电就充好啦”。'
  },
  {
    id: 'tip-tong-sibling-share',
    posture: 'tong',
    postureLabel: '通 · 换位轮流契约',
    postureBadgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    title: '抢玩具争执不休：“凭什么我要给他玩！”',
    scenario: '家里或游乐场里，两个孩子为了同一件玩具互不相让，大声哭喊甚至拉扯。',
    developmentalRationale:
      '6岁儿童对“所有权与公平（Distributive Justice）”产生强烈意识，强制要求“大的让小的”或“必须分享”会让孩子感到安全感被剥夺。通过通达换位与明确的“分时通行规则”，让孩子在感到被尊重的前提下自愿轮流。',
    coreScript:
      '“这件玩具你现在正玩得起劲，突然要拿走，心里一定特别不乐意。对面的小朋友眼睛也一直盯着它看，心里也很盼望。我们不用‘让’，我们用‘轮流沙漏’：你再玩5分钟，沙漏漏完交给他，好不好？”',
    stepGuide: [
      { step: '第1步：承认当下拥有的合理性', content: '“你先拿到并正在玩，我完全尊重你的游玩权利。”' },
      { step: '第2步：换位看见对方的渴望', content: '“看看对方的小眼睛，他也在眼巴巴地等呢。”' },
      { step: '第3步：设立客观中立的交接契约', content: '“把主动权给你：5分钟后由你亲手交给他，你就是有风度的小队长。”' }
    ],
    avoidScript: '“你都几岁了还不懂事！让给弟弟妹妹玩一下怎么了！”（破坏公平感，激化敌意）',
    offscreenActionTip: '拿出计时器或小沙漏放在两人中间，让客观时间作为中立裁判，大人不做道德法官。'
  },

  // ================= 3. 择：权衡选择与小行动 =================
  {
    id: 'tip-ze-two-options',
    posture: 'ze',
    postureLabel: '择 · 有限二选一自主权',
    postureBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    title: '孩子抵触抗拒，拒绝收拾或配合日常生活',
    scenario: '到了睡觉或换家出发时间，孩子赖在地板上不起来：“我不要收拾书包！我不要！”',
    developmentalRationale:
      '面对重大变化，孩子深感对生活失去掌控权，因而通过“微小日常的全面抗拒”来寻找控制感。大人若强行命令会陷入权力斗争；若完全放任则缺少安全边界。提供“有限且双赢的二选一”，能让孩子找回宝贵的掌控感。',
    coreScript:
      '“出发时间已经到了，这是既定的安排。但选择权在你手里：你是想先把小熊塞进书包，还是先把画笔放进去？你来做决定。”',
    stepGuide: [
      { step: '第1步：温和坚持底线', content: '“我们今晚确实要换家，这个大方向不会变。”' },
      { step: '第2步：给出两个具象小选项', content: '“我们可以选：A 先收拾小玩偶，或者 B 先穿上小外套。你选哪一个？”' },
      { step: '第3步：尊重执行孩子决定', content: '“好，你选了A，你说了算！我们现在就来装小玩偶。”' }
    ],
    avoidScript: '“数到三，你再不起身我就把你扔在这儿一个人走了！”（激发极度抛弃恐惧，破坏信任依恋）',
    offscreenActionTip: '在面临生活转折时，始终给孩子提供 2 个大人都能接受的微小选项，而非全盘开放或强加死命令。'
  },
  {
    id: 'tip-ze-scale-balance',
    posture: 'ze',
    postureLabel: '择 · 小天平掂量得失',
    postureBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    title: '孩子冲动想摔东西或大喊大叫时',
    scenario: '心爱的东西被弄乱，孩子举起小玩具想往地上砸，呼吸急促。',
    developmentalRationale:
      '6岁孩子的前额叶抑制控制（Inhibitory Control）较弱，冲动行为往往快于后果思考。引导孩子把大脑切换到“小天平模式”——掂一掂做法的好处与代价，把潜意识的发泄转化为意识层面的主动权衡。',
    coreScript:
      '“如果砸坏玩具，好处是气好像撒出来了，但代价是玩具坏了会心疼；如果用力跺三下脚或大声告诉大人‘我好生气’，虽然需要一点点控制，但玩具保住了。小天平掂一掂，你想选哪边？”',
    stepGuide: [
      { step: '第1步：物理拦阻危险动作', content: '温和握住孩子的手：“玩具不能砸，但我愿意听你肚子里的火。”' },
      { step: '第2步：把两边代价摊在天平上', content: '“砸玩具：气出了，但玩具碎了；踩脚深呼吸：玩具还在，火慢慢灭了。”' },
      { step: '第3步：把选择权交给孩子', content: '“哪一个办法能真正保护你心爱的东西？你比小天平更聪明。”' }
    ],
    avoidScript: '“你敢砸一下试试看？！砸了看我怎么收拾你！”（将注意力从情绪后果转移为外在对抗与叛逆）',
    offscreenActionTip: '用两只手掌模仿天平高低：“左手是冲动代价，右手是保护自己，哪边更划算？”'
  },
  {
    id: 'tip-ze-safe-fence',
    posture: 'ze',
    postureLabel: '择 · 安全红线围栏守护',
    postureBadgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    title: '涉及身体安全与底线时，明确不可妥协的围栏',
    scenario: '孩子因为愤怒打人、伤害自己的身体，或者答应了外人“保密不告诉大人的坏秘密”。',
    developmentalRationale:
      '必须严格区分“可以商量的小天平”与“绝对不可逾越的安全围栏”。自由只有在稳固的围栏内才有安全感。伤害身体、保守危险秘密是绝对围栏，成人必须清晰、平静且坚定地守护，绝不在红线上讨论讨价还价。',
    coreScript:
      '“所有的感受都是被允许的，你想哭、想生气都可以；但是打人、伤害身体、保守伤害秘密，这是安全围栏外的事，绝不上小天平。保护你的安全，是爸爸妈妈永远不妥协的任务。”',
    stepGuide: [
      { step: '第1步：无条件接纳情绪', content: '“你可以非常非常生气，生气的感受完全没有错。”' },
      { step: '第2步：坚定画下行为边界', content: '“但是小手不能打人，身体不能受伤，这是我们家的安全围栏。”' },
      { step: '第3步：提供合法的替代宣泄', content: '“你可以用力打枕头，可以踩大脚印，也可以在纸上狠狠画圈圈。”' }
    ],
    avoidScript: '“你再打人我就不要你了！”或反之完全放任“小孩子闹着玩，算了算了”（失去安全感围栏）',
    offscreenActionTip: '在家里明确划出“安全发泄角”（比如抱枕堆、涂鸦纸），让情绪有安全的宣泄出口。'
  },
  {
    id: 'tip-ze-ask-help',
    posture: 'ze',
    postureLabel: '择 · 呼叫盟友的小勇敢',
    postureBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    title: '遇到难题自己憋闷气哭，拒绝开口沟通',
    scenario: '拉链拉不上、作业题不会做，孩子咬着嘴唇自己硬憋，眼泪啪嗒啪嗒掉，问什么都不回答。',
    developmentalRationale:
      '部分儿童误把“向大人求助”等同于“我失败了/我不够强”，因而产生羞耻感（Shame-based Avoidance）。引导孩子认识到“选择开口求助，也是一种高级的智慧和勇敢”，赋能孩子安全的主动性。',
    coreScript:
      '“宝贝，厉害的探险家遇到大石头时，也都会呼叫队友一起搬。自己努力试过了很了不起；现在选择向爸爸/妈妈招手求助，是一件更聪明、更勇敢的事。需要我伸出一只手帮你扶一下吗？”',
    stepGuide: [
      { step: '第1步：肯定孩子前面的独立尝试', content: '“我看到你刚才自己试了好多次，特别有耐力。”' },
      { step: '第2步：重新定义‘求助’不是失败', content: '“求助不是认输，求助是召唤最强的盟友一起过关。”' },
      { step: '第3步：提供具体低门槛的协助选项', content: '“你来做主：是需要我做示范，还是我帮你扶着拉链头你自己拉上去？”' }
    ],
    avoidScript: '“不会就不会，哭什么哭！嘴巴长着是干嘛的，不会问啊？！”（加剧羞耻感，阻断沟通通道）',
    offscreenActionTip: '向孩子伸出一只摊开的手掌：“这是求助停机坪，把小手放上来，支援马上就到”。'
  },
  {
    id: 'tip-ze-win-win',
    posture: 'ze',
    postureLabel: '择 · 创造第三种双赢小步',
    postureBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    title: '两种想法冲突时的“既要又要”僵局',
    scenario: '“我想出去踢球，但又想把现在的乐高城堡搭完，我都要！现在就要！”孩子陷入焦躁。',
    developmentalRationale:
      '6岁儿童的去中心化（Decentration）正在萌芽，但仍容易陷入“全有或全无（All-or-Nothing）”的二元对立中。帮助孩子跳出一维时间线，找到“先后顺序组合”或“带走部分”的第三种双赢小选择，培养创造性问题解决能力。',
    coreScript:
      '“踢球和拼乐高都是特别棒的主意，你的脑袋太有创意了！但身体只有一个，没办法同时在两个地方。我们来做个聪明的‘双赢安排’：我们把城堡拍张照留作记号，带着一个心爱的乐高小人去踢球；回来后继续按照片搭。这样两个愿望都实现了！”',
    stepGuide: [
      { step: '第1步：肯定两个愿望的正当性', content: '“两个想法我都超级喜欢，你想做的事情都很有趣。”' },
      { step: '第2步：指出物理维度的现实规律', content: '“不过现在外面的太阳只有1个小时就下山了，而屋里的积木一直在等你。”' },
      { step: '第3步：创造第三种合并可能', content: '“我们做个连环计划：先踢30分钟球把汗流透，回来洗完澡把积木封顶！”' }
    ],
    avoidScript: '“贪心不足蛇吞象！只能选一个，赶紧选，不选就什么都别玩了！”（加剧匮乏感与焦虑）',
    offscreenActionTip: '拿出一张便利贴画上“第1站：足球场 ⚽”和“第2站：乐高基地 🏰”，让孩子在第1站打上小对勾。'
  }
];

export const ParentingPocketTips: React.FC = () => {
  const [filter, setFilter] = useState<'all' | ThinkingPosture>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedTipId, setExpandedTipId] = useState<string | null>('tip-fen-mistake');

  // Interactive quick template builder state
  const [builderFact, setBuilderFact] = useState<string>('杯子倒了水洒在地上了');
  const [builderGuess, setBuilderGuess] = useState<string>('妈妈肯定要发火怪我了');
  const [builderPerspective, setBuilderPerspective] = useState<string>('妈妈只是担心别滑倒');
  const [builderAction, setBuilderAction] = useState<string>('拿一块抹布一起把水吸干');
  const [builderCopied, setBuilderCopied] = useState<boolean>(false);

  const fenCount = PARENTING_POCKET_TIPS.filter(t => t.posture === 'fen').length;
  const tongCount = PARENTING_POCKET_TIPS.filter(t => t.posture === 'tong').length;
  const zeCount = PARENTING_POCKET_TIPS.filter(t => t.posture === 'ze').length;

  const filteredTips = PARENTING_POCKET_TIPS.filter(tip => {
    const matchesFilter = filter === 'all' || tip.posture === filter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      tip.title.toLowerCase().includes(q) ||
      tip.scenario.toLowerCase().includes(q) ||
      tip.coreScript.toLowerCase().includes(q) ||
      tip.developmentalRationale.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const handleCopyText = async (id: string, text: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId(null);
      }, 2500);
    } catch {
      // Fallback
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const assembledBuilderScript = `“宝贝，我们先看眼睛能看见的事实：${builderFact}。脑子里那个‘${builderGuess}’的声音，只是在猜，那不是真的。换个角度想：${builderPerspective}。现在我们迈出可以控制的一小步：${builderAction}，我们一起做！”`;

  const handleCopyBuilderScript = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(assembledBuilderScript);
      }
      setBuilderCopied(true);
      setTimeout(() => setBuilderCopied(false), 2500);
    } catch {
      setBuilderCopied(true);
      setTimeout(() => setBuilderCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* 顶部概念引入横幅 */}
      <div className="bg-linear-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-2 border-amber-300/80 p-5 sm:p-6 rounded-3xl shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-200/90 px-3 py-1 rounded-full">
                💡 养育小锦囊 · 分通择话术库
              </span>
              <span className="text-xs text-stone-600 font-medium">
                基于 6 岁儿童认知发展科学 · 简短可复制 · 即拿即用
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              孩子的大脑在发展，话术是可迁移的脚手架
            </h2>
            <p className="text-sm text-stone-700 font-medium leading-relaxed max-w-3xl">
              6岁儿童正处于<strong>从自我中心向逻辑推理过渡</strong>的关键期。当大情绪来临时，孩子的前额叶容易瘫痪。
              这些话术模板不是要求孩子变乖的指令，而是帮孩子<strong>区分事实（分）、换位看世界（通）、权衡并迈出小步（择）</strong>的心理把手。
            </p>
          </div>

          <div className="bg-white/90 p-3 rounded-2xl border border-amber-200 shadow-2xs shrink-0 text-xs space-y-1">
            <div className="font-black text-stone-800 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>话术黄金三法则：</span>
            </div>
            <p className="text-stone-600">1. 先接纳大情绪，再说事实</p>
            <p className="text-stone-600">2. 用具象观察代替抽象评价</p>
            <p className="text-stone-600">3. 始终给孩子一个可控的小选择</p>
          </div>
        </div>
      </div>

      {/* 搜索与筛选标签栏 */}
      <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* 筛选姿态 Tab */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                setFilter('all');
              }}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-stone-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              全部锦囊 ({PARENTING_POCKET_TIPS.length})
            </button>

            <button
              onClick={() => {
                setFilter('fen');
              }}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                filter === 'fen'
                  ? 'bg-sky-600 text-white shadow-xs'
                : 'text-sky-800 hover:bg-sky-50'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>分 · 区分事实与猜测 ({fenCount})</span>
            </button>

            <button
              onClick={() => {
                setFilter('tong');
              }}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                filter === 'tong'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>通 · 换位与双重视角 ({tongCount})</span>
            </button>

            <button
              onClick={() => {
                setFilter('ze');
              }}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                filter === 'ze'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>择 · 权衡选择与小行动 ({zeCount})</span>
            </button>
          </div>

          {/* 关键词快速检索 */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜场景：打翻、失约、收拾..."
              className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-500 font-medium px-1">
          <span>共找到 {filteredTips.length} 条高频话术</span>
          <span>支持一键复制到剪贴板</span>
        </div>
      </div>

      {/* 话术卡片流 */}
      <div className="grid gap-4 sm:gap-5">
        {filteredTips.map((tip) => {
          const isCopied = copiedId === tip.id;
          const isExpanded = expandedTipId === tip.id;

          return (
            <Interactive3DCard
              key={tip.id}
              maxTilt={4}
              perspective={1100}
              className="bg-white rounded-3xl border-2 border-stone-200/90 shadow-sm hover:shadow-xl transition-all p-5 sm:p-6 space-y-4"
            >
              {/* 卡片顶栏：分类标签 + 标题 + 快捷操作 */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black px-3 py-0.5 rounded-full border ${tip.postureBadgeColor}`}
                    >
                      {tip.postureLabel}
                    </span>
                    <span className="text-xs text-stone-400">·</span>
                    <span className="text-xs text-stone-500 font-medium">高频场景模板</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-stone-900 leading-snug">
                    {tip.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {/* 一键复制核心金句 */}
                  <button
                    onClick={() => handleCopyText(tip.id, tip.coreScript)}
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                    aria-label={`复制${tip.title}的话术`}
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{isCopied ? '已复制到剪贴板！' : '复制核心话术'}</span>
                  </button>
                </div>
              </div>

              {/* 典型情境描述 */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs sm:text-sm text-stone-600 font-medium flex items-start gap-2">
                <span className="text-base shrink-0">📍</span>
                <p><strong>孩子当下状态：</strong>{tip.scenario}</p>
              </div>

              {/* 核心话术高亮展示区 (可直接脱口而出) */}
              <div className="p-4 sm:p-5 bg-linear-to-r from-amber-50/90 to-orange-50/90 border-2 border-amber-300 rounded-2xl shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>家长直接开口示范（请用温和、不催促、低平稳的语调）：</span>
                  </span>
                  <button
                    onClick={() => handleCopyText(tip.id, tip.coreScript)}
                    className="text-xs text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
                  >
                    点击单独复制
                  </button>
                </div>
                <blockquote className="text-base sm:text-lg font-bold text-stone-900 leading-relaxed border-l-4 border-amber-500 pl-3.5 my-1">
                  {tip.coreScript}
                </blockquote>
              </div>

              {/* 折叠/展开详情：3步微引导流程 + 发展心理学依据 + 避坑雷区 */}
              <div className="pt-1">
                <button
                  onClick={() => setExpandedTipId(isExpanded ? null : tip.id)}
                  className="text-xs sm:text-sm font-bold text-amber-900 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                  aria-expanded={isExpanded}
                >
                  <span>{isExpanded ? '收起认知规律与三步微流程' : '查看背后的儿童认知规律与三步细化引导'}</span>
                  <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-stone-200 space-y-4 animate-in fade-in duration-200">
                    {/* 发展心理学依据 */}
                    <div className="p-3.5 bg-sky-50/80 rounded-2xl border border-sky-200 text-xs sm:text-sm text-sky-950 space-y-1">
                      <span className="font-black text-sky-900 flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-sky-600" />
                        <span>为什么这么说有效？（儿童认知发展依据）</span>
                      </span>
                      <p className="leading-relaxed font-medium text-stone-700">
                        {tip.developmentalRationale}
                      </p>
                    </div>

                    {/* 三步微流程 */}
                    <div className="space-y-2">
                      <span className="text-xs font-black text-stone-700 uppercase tracking-wider block">
                        三步引导小梯子：
                      </span>
                      <div className="grid sm:grid-cols-3 gap-2.5">
                        {tip.stepGuide.map((stepItem, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-3 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-1"
                          >
                            <span className="text-xs font-black text-amber-800 block">
                              {stepItem.step}
                            </span>
                            <p className="text-xs text-stone-700 font-medium leading-relaxed">
                              {stepItem.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 避坑雷区与离屏小动作 */}
                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-rose-50/80 rounded-2xl border border-rose-200 text-rose-950 space-y-1">
                        <span className="font-black text-rose-800 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>常见避坑（千万别说）：</span>
                        </span>
                        <p className="font-medium text-stone-700 leading-relaxed">{tip.avoidScript}</p>
                      </div>

                      <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-emerald-950 space-y-1">
                        <span className="font-black text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>带走一个离屏肢体动作：</span>
                        </span>
                        <p className="font-medium text-stone-700 leading-relaxed">{tip.offscreenActionTip}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Interactive3DCard>
          );
        })}
      </div>

      {/* 底部交互式“句式积木组合器” (Custom Script Builder) */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-amber-300 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black bg-amber-100 text-amber-900 px-3 py-0.5 rounded-full">
                🧩 互动工具
              </span>
              <h3 className="text-lg sm:text-xl font-black text-stone-900">
                个性化分通择话术组合器
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              根据你家今天发生的具体小事，点选或修改四个积木，一键拼出符合分通择姿态的高情商回应：
            </p>
          </div>

          <button
            onClick={handleCopyBuilderScript}
            className={`min-h-[44px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              builderCopied
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
            aria-label="复制定制话术"
          >
            {builderCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{builderCopied ? '已复制组合话术！' : '一键复制组合话术'}</span>
          </button>
        </div>

        {/* 四块积木编辑区 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 积木 1: 分·客观事实 */}
          <div className="p-3.5 bg-sky-50/80 rounded-2xl border-2 border-sky-200 space-y-1.5">
            <span className="text-xs font-black text-sky-900 block">
              1.【分】眼睛看到的事实：
            </span>
            <input
              type="text"
              value={builderFact}
              onChange={(e) => setBuilderFact(e.target.value)}
              className="w-full p-2 bg-white rounded-xl border border-sky-300 text-xs font-bold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-sky-400"
              placeholder="例如：地上的水洒了"
            />
          </div>

          {/* 积木 2: 分·脑中猜测 */}
          <div className="p-3.5 bg-rose-50/80 rounded-2xl border-2 border-rose-200 space-y-1.5">
            <span className="text-xs font-black text-rose-900 block">
              2.【分】脑子里被吓唬的猜测：
            </span>
            <input
              type="text"
              value={builderGuess}
              onChange={(e) => setBuilderGuess(e.target.value)}
              className="w-full p-2 bg-white rounded-xl border border-rose-300 text-xs font-bold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
              placeholder="例如：大人要发火怪我了"
            />
          </div>

          {/* 积木 3: 通·换位视角 */}
          <div className="p-3.5 bg-emerald-50/80 rounded-2xl border-2 border-emerald-200 space-y-1.5">
            <span className="text-xs font-black text-emerald-900 block">
              3.【通】换位/大人的真正想法：
            </span>
            <input
              type="text"
              value={builderPerspective}
              onChange={(e) => setBuilderPerspective(e.target.value)}
              className="w-full p-2 bg-white rounded-xl border border-emerald-300 text-xs font-bold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
              placeholder="例如：大人只是担心你滑倒"
            />
          </div>

          {/* 积木 4: 择·可以做的一小步 */}
          <div className="p-3.5 bg-amber-50/80 rounded-2xl border-2 border-amber-200 space-y-1.5">
            <span className="text-xs font-black text-amber-900 block">
              4.【择】迈出可以控制的一小步：
            </span>
            <input
              type="text"
              value={builderAction}
              onChange={(e) => setBuilderAction(e.target.value)}
              className="w-full p-2 bg-white rounded-xl border border-amber-300 text-xs font-bold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              placeholder="例如：拿抹布一起吸干"
            />
          </div>
        </div>

        {/* 组合话术实时预览 */}
        <div className="p-4 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-300 text-sm sm:text-base font-bold text-stone-800 leading-relaxed">
          <p>{assembledBuilderScript}</p>
        </div>
      </div>
    </div>
  );
};
