import { describe, it, expect } from 'vitest';
import {
  Boundary,
  evaluateBoundaryAction,
  ProposedAction,
} from '../../src/domain/safety';
import { INITIAL_LEAF_SCENARIOS, INITIAL_PARENT_SCRIPTS } from '../../src/data/mockData';

describe('PHASE H — Boundary First, Not Boundary Everywhere Contract', () => {
  // 1. 测试内容级 Boundary Metadata: 三个典型测试场景
  describe('Content-Level Boundary Metadata (三片代表性测试叶)', () => {
    const rainLeaf = INITIAL_LEAF_SCENARIOS.find(l => l.id === 'rain-play');
    const toyLeaf = INITIAL_LEAF_SCENARIOS.find(l => l.id === 'toy-share');
    const hitLeaf = INITIAL_LEAF_SCENARIOS.find(l => l.id === 'hitting-boundary');

    it('场景 1: 下雨天出不了门 (rain-play) -> boundary 为 NONE', () => {
      expect(rainLeaf).toBeDefined();
      expect(rainLeaf?.boundary).toBe('NONE');
    });

    it('场景 2: 两人想玩同一玩具 (toy-share) -> boundary 为 NONE', () => {
      expect(toyLeaf).toBeDefined();
      expect(toyLeaf?.boundary).toBe('NONE');
    });

    it('场景 3: 动手打人 (hitting-boundary) -> boundary 为 PHYSICAL_HARM', () => {
      expect(hitLeaf).toBeDefined();
      expect(hitLeaf?.boundary).toBe('PHYSICAL_HARM');
    });
  });

  // 2. 契约规则：boundary === NONE 时允许普通视角/权衡流
  describe('boundary === NONE: 允许普通 perspective / tradeoff flow', () => {
    it('普通客观与同伴协商事件允许使用双面币与小天平', () => {
      const result = evaluateBoundaryAction(Boundary.NONE);
      expect(result.boundary).toBe(Boundary.NONE);
      expect(result.canEnterTradeoffEvaluation).toBe(true);
      expect(result.isPermitted).toBe(true);
      expect(result.safeActionRecommendations).toContain('用双面币看看另一面');
      expect(result.safeActionRecommendations).toContain('用小天平称一称');
    });
  });

  // 3. 契约规则：boundary != NONE 时禁止对 prohibited behavior 显示 double-sided coin 或 balance
  describe('boundary != NONE: 禁止对违规行为显示 double-sided coin 或 balance', () => {
    it('PHYSICAL_HARM 触发时，绝对禁止进入利弊权衡 (canEnterTradeoffEvaluation 必须为 false)', () => {
      const harmAction: ProposedAction = {
        actionId: 'hit_back',
        description: '动手打人或还手',
        isTradeoffEvaluation: true,
        category: 'HARM',
      };

      const result = evaluateBoundaryAction(Boundary.PHYSICAL_HARM, harmAction);
      expect(result.canEnterTradeoffEvaluation).toBe(false);
      expect(result.isPermitted).toBe(false);
    });
  });

  // 4. 契约流程：
  // 1. emotion/reason can be acknowledged
  // 2. boundary stated clearly
  // 3. safe alternatives
  // 4. adult help / leave / protect body
  // 5. later motive understanding may happen
  // 6. motive never reopens boundary
  describe('打人场景规范 6 步流程', () => {
    const hitLeaf = INITIAL_LEAF_SCENARIOS.find(l => l.id === 'hitting-boundary')!;

    it('第 1 步 & 第 5 步：允许承认情绪与原因（例如城堡被撞倒委屈愤怒，对方可能有原因）', () => {
      const tongSideA = hitLeaf.walkSteps.tongContent.sideA;
      expect(tongSideA).toContain('承认原因与情绪');
      expect(tongSideA).toContain('精心搭的城堡被弄坏，生气是完全可以理解的正常感受');
    });

    it('第 2 步 & 第 6 步：边界清楚说明，动机绝不能重新打开红线（有原因打人也不行）', () => {
      const tongSideB = hitLeaf.walkSteps.tongContent.sideB;
      const whoseView = hitLeaf.walkSteps.tongContent.whoseView;
      expect(tongSideB).toContain('边界绝对清楚');
      expect(tongSideB).toContain('动手打人伤害身体，是绝对不可以做的事！有原因不代表可以打人');
      expect(whoseView).toContain('伤害身体的拳头必须停下');
    });

    it('第 3 步 & 第 4 步：安全替代行动必须包含“保护身体 / 离开 / 找大人求助”', () => {
      const safeActionA = hitLeaf.walkSteps.zeContent.choiceA.text;
      const safeActionB = hitLeaf.walkSteps.zeContent.choiceB.text;
      const choices = hitLeaf.choices.map(c => c.label).join(' ');

      // 验证包含保护身体
      expect(safeActionA + safeActionB + choices).toContain('保护身体');
      // 验证包含离开现场
      expect(safeActionA + safeActionB + choices).toContain('离开');
      // 验证包含找大人求助
      expect(safeActionA + safeActionB + choices).toContain('找大人');

      // 验证围栏警示绝不上小天平
      expect(hitLeaf.walkSteps.zeContent.fenceReminder).toContain('身体伤害绝不能上小天平称好处');
    });
  });

  // 5. 家长端 follow-up 应对脚本：“可是他是因为先被打才打回去”
  describe('家长端具体 Follow-Up 脚本 (script-retaliation-hitting)', () => {
    const script = INITIAL_PARENT_SCRIPTS.find(s => s.id === 'script-retaliation-hitting');

    it('家长脚本库中收录“先被打才打回去”专属辅导脚本', () => {
      expect(script).toBeDefined();
      expect(script?.title).toContain('可是他是因为先被打才打回去');
    });

    it('脚本明确肯定委屈与想还手的冲动，但坚定重申身体安全红线', () => {
      const canSayJoined = script?.canSay.join(' ') || '';
      expect(canSayJoined).toContain('被人先动手打，心里肯定又疼又愤怒');
      expect(canSayJoined).toContain('打人和伤害身体永远是红线');
      expect(canSayJoined).toContain('后退一步护住身体，大声喊‘停下’，然后立刻跑向身边的老师或家长');
      expect(canSayJoined).toContain('寻求大人帮助才是最有力量的自我保护');
    });

    it('禁止家长教唆以暴制暴或压抑委屈', () => {
      const shouldNotJoined = script?.shouldNotSay.join(' ') || '';
      expect(shouldNotJoined).toContain('打得好！谁打你你就给我狠狠打回去');
      expect(shouldNotJoined).toContain('人家打你你就忍着');
      expect(shouldNotJoined).toContain('苍蝇不叮无缝的蛋');
    });
  });

  // 6. 严禁把围栏作为每片叶子的第一问
  describe('非普遍围栏原则 (Not Boundary Everywhere)', () => {
    it('门 1 (fen) 必须是关于事实与事件，绝不得默认是围栏安全盘问', () => {
      for (const leaf of INITIAL_LEAF_SCENARIOS) {
        // 门 1 的问题是发生了什么 / 事实
        expect(leaf.doors.fen.question).not.toContain('你是不是违规了');
        expect(leaf.doors.fen.question).not.toContain('这有没有犯错');
      }
    });
  });
});
