import { describe, it, expect } from 'vitest';
import {
  CRAYON_DETECTIVE_HOTSPOTS,
  SORTING_BASKETS,
  evaluateCluePlacement,
} from '../../src/domain/games/crayonDetectiveLogic';
import {
  FRIEND_ASKS_PATHWAYS,
  SAFETY_BYPASS_ACTIONS,
} from '../../src/domain/games/friendAsksHomeLogic';
import {
  NEGOTIATION_ITEMS,
  NEGOTIATION_PATHS_DETAILS,
  determineNegotiationPath,
} from '../../src/domain/games/toyBoatNegotiationLogic';
import {
  TRANSFER_SCENARIOS,
} from '../../src/domain/games/transferScenariosLogic';

describe('AG-03: 三组真实可玩互动体验 - 核心状态与安全规则单元测试', () => {
  // ================= 游戏一：《蜡笔侦探》 =================
  describe('游戏一：《蜡笔侦探》事实与猜测分离规则', () => {
    it('包含 5 个场景热点线索，且包含永久未知盲区', () => {
      expect(CRAYON_DETECTIVE_HOTSPOTS.length).toBe(5);
      const unknownClue = CRAYON_DETECTIVE_HOTSPOTS.find((h) => h.isPermanentUnknown);
      expect(unknownClue).toBeDefined();
      expect(unknownClue?.id).toBe('hs_backpack');
      expect(unknownClue?.category).toBe('UNKNOWN');
    });

    it('事实线索正确分类到“眼睛看到的”，错误时给予温和引导且不责备', () => {
      const correctEval = evaluateCluePlacement('FACT', 'EYES_OBSERVED');
      expect(correctEval.isMatch).toBe(true);
      expect(correctEval.spokenFeedback).toContain('找对啦');

      const wrongEval = evaluateCluePlacement('FACT', 'MIND_GUESSED');
      expect(wrongEval.isMatch).toBe(false);
      expect(wrongEval.spokenFeedback).toContain('眼睛清清楚楚看到');
      expect(wrongEval.spokenFeedback).not.toContain('错误');
      expect(wrongEval.spokenFeedback).not.toContain('扣分');
    });

    it('主观猜想正确分类到“脑子想到的”，严禁当作客观事实', () => {
      const correctEval = evaluateCluePlacement('INFERENCE', 'MIND_GUESSED');
      expect(correctEval.isMatch).toBe(true);
      expect(correctEval.spokenFeedback).toContain('猜想和念头');

      const wrongEval = evaluateCluePlacement('INFERENCE', 'EYES_OBSERVED');
      expect(wrongEval.isMatch).toBe(false);
      expect(wrongEval.spokenFeedback).toContain('眼睛没有拍到证据');
    });

    it('未知盲区分类到“还不知道的”，承认不知道是清醒理性的力量', () => {
      const correctEval = evaluateCluePlacement('UNKNOWN', 'STILL_UNKNOWN');
      expect(correctEval.isMatch).toBe(true);
      expect(correctEval.spokenFeedback).toContain('不知道就是不知道');
    });
  });

  // ================= 游戏二：《朋友问起我的家》 =================
  describe('游戏二：《朋友问起我的家》自主表达与安全围栏规则', () => {
    it('覆盖至少四类真实同伴反馈：理解、继续追问、误解、嘲笑起哄', () => {
      const pathways = Object.values(FRIEND_ASKS_PATHWAYS);
      const outcomeTypes = pathways.map((p) => p.outcome.type);

      expect(outcomeTypes).toContain('UNDERSTANDING');
      expect(outcomeTypes).toContain('FURTHER_QUESTION');
      expect(outcomeTypes).toContain('MISUNDERSTANDING');
      expect(outcomeTypes).toContain('BULLYING_RIDICULE');
    });

    it('遭遇嘲笑或起哄时，直接触发安全围栏 (isBoundaryTriggered: true)', () => {
      const bullying = FRIEND_ASKS_PATHWAYS['peer_bullying_encounter'];
      expect(bullying.outcome.isBoundaryTriggered).toBe(true);
      expect(bullying.outcome.type).toBe('BULLYING_RIDICULE');
    });

    it('安全保护动作提供 3 项明确现实求助或身体边界行动，绝不要求原谅施暴者', () => {
      expect(SAFETY_BYPASS_ACTIONS.length).toBe(3);
      const actionIds = SAFETY_BYPASS_ACTIONS.map((a) => a.id);
      expect(actionIds).toContain('say_stop_firmly');
      expect(actionIds).toContain('report_to_teacher');
      expect(actionIds).toContain('walk_away_to_safety');

      for (const action of SAFETY_BYPASS_ACTIONS) {
        expect(action.spokenText).not.toContain('原谅');
        expect(action.spokenText).not.toContain('忍耐');
      }
    });

    it('允许向信任家长或老师商量 (Co-regulation)，不强迫当场公开', () => {
      const adultPathway = FRIEND_ASKS_PATHWAYS['adult_co_regulation'];
      expect(adultPathway.target).toBe('TRUSTED_ADULT');
      expect(adultPathway.outcome.peerSpokenText).toContain('你想说就说，不想说完全可以不说');
    });
  });

  // ================= 游戏三：《小船协商》 =================
  describe('游戏三：《小船协商》选择、代价与利弊权衡规则', () => {
    it('提供三种不同的安全协商路径：轮流玩、合作载货、交换玩具', () => {
      const paths = Object.keys(NEGOTIATION_PATHS_DETAILS);
      expect(paths).toContain('TAKE_TURNS');
      expect(paths).toContain('COOPERATE_CARGO');
      expect(paths).toContain('TRADE_TOYS');
    });

    it('每种方案均包含清晰的收益 (Advantage) 与现实限制/代价 (Limitation)', () => {
      for (const key of ['TAKE_TURNS', 'COOPERATE_CARGO', 'TRADE_TOYS'] as const) {
        const details = NEGOTIATION_PATHS_DETAILS[key];
        expect(details.advantageGained).toContain('【收益】');
        expect(details.realisticLimitation).toContain('【现实限制】');
        expect(details.narrativeFeedback.length).toBeGreaterThan(0);
      }
    });

    it('放入沙漏计时器正确激活轮流方案，放入小黄鸭激活合作方案，放入挖掘机激活交换方案', () => {
      expect(determineNegotiationPath(['item_boat', 'item_timer'])).toBe('TAKE_TURNS');
      expect(determineNegotiationPath(['item_boat', 'item_duck'])).toBe('COOPERATE_CARGO');
      expect(determineNegotiationPath(['item_boat', 'item_digger'])).toBe('TRADE_TOYS');
      expect(determineNegotiationPath(['item_boat'])).toBeNull();
    });
  });

  // ================= 独立迁移情境 =================
  describe('独立迁移：未受训练情境逻辑与研究属性', () => {
    it('提供至少两个未受训练迁移情境（含《小客厅的饼干盒》、《公园的秋千与跷跷板》与证据不足情境）', () => {
      expect(TRANSFER_SCENARIOS.length).toBeGreaterThanOrEqual(2);
      expect(TRANSFER_SCENARIOS[0].id).toBe('transfer_biscuit_mystery');
      expect(TRANSFER_SCENARIOS[1].id).toBe('transfer_swing_seesaw');
    });

    it('迁移情境不泄露“双面币”、“小天平”等工具术语', () => {
      for (const sc of TRANSFER_SCENARIOS) {
        expect(sc.title).not.toContain('双面币');
        expect(sc.title).not.toContain('小天平');
        expect(sc.promptSpokenText).not.toContain('工具');
      }
    });
  });
});
