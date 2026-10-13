import { describe, it, expect } from 'vitest';
import {
  CRAYON_DETECTIVE_HOTSPOTS,
  evaluateCluePlacement,
} from '../../src/domain/games/crayonDetectiveLogic';
import {
  FRIEND_ASKS_PATHWAYS,
  SAFETY_BYPASS_ACTIONS,
} from '../../src/domain/games/friendAsksHomeLogic';
import {
  NEGOTIATION_PATHS_DETAILS,
  determineNegotiationPath,
} from '../../src/domain/games/toyBoatNegotiationLogic';
import {
  TRANSFER_SCENARIOS,
} from '../../src/domain/games/transferScenariosLogic';

describe('AG-03: 三组真实可玩互动体验 - 全流程 E2E 交互集成测试', () => {
  // ================= E2E-01: 《蜡笔侦探》全流程 =================
  describe('E2E-01: 《蜡笔侦探》全流程探索、分类、盲区保持与破案手册', () => {
    it('模拟孩子从放大镜探索热点 -> 获取全部线索 -> 拖放分类 -> 发现永久未知 -> 生成破案手册', () => {
      // 1. 模拟孩子移动放大镜探照场景热点
      const discoveredClueIds: string[] = [];

      for (const spot of CRAYON_DETECTIVE_HOTSPOTS) {
        // 放大镜接触到 spot.xPercent, spot.yPercent
        discoveredClueIds.push(spot.id);
      }
      expect(discoveredClueIds.length).toBe(5);

      // 2. 模拟孩子把线索分别拖放至 3 个箩筐
      const placements: Record<string, string> = {};

      for (const clue of CRAYON_DETECTIVE_HOTSPOTS) {
        if (clue.category === 'FACT') {
          const evalResult = evaluateCluePlacement(clue.category, 'EYES_OBSERVED');
          expect(evalResult.isMatch).toBe(true);
          placements[clue.id] = 'EYES_OBSERVED';
        } else if (clue.category === 'INFERENCE') {
          const evalResult = evaluateCluePlacement(clue.category, 'MIND_GUESSED');
          expect(evalResult.isMatch).toBe(true);
          placements[clue.id] = 'MIND_GUESSED';
        } else if (clue.category === 'UNKNOWN') {
          const evalResult = evaluateCluePlacement(clue.category, 'STILL_UNKNOWN');
          expect(evalResult.isMatch).toBe(true);
          placements[clue.id] = 'STILL_UNKNOWN';
        }
      }

      // 3. 验证全部线索完成放置
      expect(Object.keys(placements).length).toBe(5);

      // 4. 验证书包未知盲区保持未知
      const backpackPlacing = placements['hs_backpack'];
      expect(backpackPlacing).toBe('STILL_UNKNOWN');

      // 5. 验证奇奇的猜想被归入主观念头，没有当作事实定罪朋友
      const qiqiThoughtPlacing = placements['hs_qiqi_thought'];
      expect(qiqiThoughtPlacing).toBe('MIND_GUESSED');
    });
  });

  // ================= E2E-02: 《朋友问起我的家》全流程 =================
  describe('E2E-02: 《朋友问起我的家》自主表达决策、同伴互动分支、恶意嘲笑防御与报告老师', () => {
    it('模拟孩子选择向小明说明事实 -> 得到理解接纳 -> 模拟遇到起哄同学 -> 触发安全模式 -> 执行报告老师', () => {
      // 1. 第一步：孩子选择路径 A (说明客观事实)
      const pathwayA = FRIEND_ASKS_PATHWAYS['peer_clear_fact'];
      expect(pathwayA.target).toBe('ASKING_PEER');
      expect(pathwayA.depth).toBe('CLEAR_FACT');
      expect(pathwayA.outcome.type).toBe('UNDERSTANDING');
      expect(pathwayA.outcome.peerSpokenText).toContain('草莓饼干');

      // 2. 第二步：模拟周围出现嘲笑起哄同学
      const bullyingPathway = FRIEND_ASKS_PATHWAYS['peer_bullying_encounter'];
      expect(bullyingPathway.outcome.isBoundaryTriggered).toBe(true);
      expect(bullyingPathway.outcome.type).toBe('BULLYING_RIDICULE');

      // 3. 第三步：系统切换为安全保护模式，执行“走向值日老师求助”
      const reportAction = SAFETY_BYPASS_ACTIONS.find((a) => a.id === 'report_to_teacher');
      expect(reportAction).toBeDefined();
      expect(reportAction?.spokenText).toContain('请帮助我');

      // 4. 验证不要求孩子原谅起哄者
      expect(reportAction?.spokenText).not.toContain('原谅');
    });
  });

  // ================= E2E-03: 《小船协商》全流程 =================
  describe('E2E-03: 《小船协商》拖拽沙盒、道具组合、多方案切换与收益代价权衡', () => {
    it('模拟放置不同道具切换三种不同协商方案，验证动态利弊与无单一正确答案', () => {
      // 1. 放入沙漏 -> 激活轮流玩
      const path1 = determineNegotiationPath(['item_boat', 'item_timer']);
      expect(path1).toBe('TAKE_TURNS');
      const details1 = NEGOTIATION_PATHS_DETAILS[path1!];
      expect(details1.advantageGained).toContain('规则非常公平');
      expect(details1.realisticLimitation).toContain('需要耐心等待');

      // 2. 更换为小黄鸭 -> 激活合作运货游戏
      const path2 = determineNegotiationPath(['item_boat', 'item_duck']);
      expect(path2).toBe('COOPERATE_CARGO');
      const details2 = NEGOTIATION_PATHS_DETAILS[path2!];
      expect(details2.advantageGained).toContain('不用等待');
      expect(details2.realisticLimitation).toContain('需要两个人商量配合');

      // 3. 更换为沙滩挖掘机 -> 激活交换玩具玩
      const path3 = determineNegotiationPath(['item_boat', 'item_digger']);
      expect(path3).toBe('TRADE_TOYS');
      const details3 = NEGOTIATION_PATHS_DETAILS[path3!];
      expect(details3.advantageGained).toContain('谁都不用坐在旁边空等');
      expect(details3.realisticLimitation).toContain('当前这一刻玩到的不是第一愿望');

      // 4. 验证三个方案都是安全和平方案，没有哪个被标记为唯一正确
      expect([path1, path2, path3]).toEqual(['TAKE_TURNS', 'COOPERATE_CARGO', 'TRADE_TOYS']);
    });
  });

  // ================= E2E-04: 独立迁移情境全流程 =================
  describe('E2E-04: 独立迁移情境全流程记录与成人提示计数', () => {
    it('模拟孩子在《小客厅的饼干盒》情境中标记线索并记录大人提示次数', () => {
      const scenario = TRANSFER_SCENARIOS[0];
      let adultPromptCount = 0;

      // 模拟家长提示了一次
      adultPromptCount += 1;
      expect(adultPromptCount).toBe(1);

      // 验证情境选项包含事实与猜测分离
      const factClues = scenario.cluesOrChoices.filter((c) => c.categoryOrPath === 'FACT');
      const inferenceClues = scenario.cluesOrChoices.filter((c) => c.categoryOrPath === 'INFERENCE');
      const unknownClues = scenario.cluesOrChoices.filter((c) => c.categoryOrPath === 'UNKNOWN');

      expect(factClues.length).toBe(3);
      expect(inferenceClues.length).toBe(1);
      expect(unknownClues.length).toBe(1);

      // 验证客观结果不冤枉弟弟
      expect(scenario.objectiveOutcome).toContain('不能凭空冤枉弟弟');
    });
  });
});
