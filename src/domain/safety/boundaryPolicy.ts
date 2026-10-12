import {
  Boundary,
  ProposedAction,
  BoundaryEvaluationResult,
} from './types';

/**
 * 边界优先仲裁策略 (Boundary Precedence Policy)
 * 严格遵循 docs/SAFETY_MODEL.md:
 * 1. 只有当 boundary === Boundary.NONE 时，才允许进入双面币/天平等多视角与利弊权衡。
 * 2. boundary !== Boundary.NONE 时，禁止在违规行为上寻找“好处”或“两面性”，canEnterTradeoffEvaluation 强制为 false。
 * 3. 认可情绪与原因，但绝不放开安全红线。
 * 4. 对行为清楚（明确说明不可行），对人不贴总判决标签（不判定为“坏人/坏孩子”）。
 * 5. 始终提供明确的安全行动：保护身体、后退离开、大声说不、寻求现实安全大人支持。
 */
export function evaluateBoundaryAction(
  boundary: Boundary,
  action?: ProposedAction
): BoundaryEvaluationResult {
  // 无边界红线冲突：允许正常探索与思考工具
  if (boundary === Boundary.NONE) {
    return {
      boundary: Boundary.NONE,
      isPermitted: true,
      canEnterTradeoffEvaluation: true,
      spokenGuidance: '我们可以退后一步，看看这件事情的不同角度，找找好办法。',
      objectiveReason: '当前没有触及安全红线，可以使用思考工具。',
      safeActionRecommendations: ['用双面币看看另一面', '用小天平称一称', '把大困难拆成小动作'],
    };
  }

  // 关键铁律：只要 boundary !== Boundary.NONE，绝不允许进入利弊权衡/双面币/天平讨论！
  const canEnterTradeoffEvaluation = false;

  // 针对被允许的安全行动类别进行裁决
  const isSafeAction =
    action?.category === 'SAFE_STEP_BACK' ||
    action?.category === 'SEEK_HELP' ||
    action?.category === 'EXPRESS_BOUND';

  switch (boundary) {
    case Boundary.PHYSICAL_SAFETY:
    case Boundary.PHYSICAL_HARM:
      return {
        boundary,
        isPermitted: isSafeAction,
        canEnterTradeoffEvaluation,
        spokenGuidance:
          '我们非常理解你现在可能很生气或难过，但这会伤害到身体，不可以这样做哦。请保护好自己，走到身边安全的大人那里。',
        objectiveReason: '身体安全是第一道防线，伤害自己或别人的行为不能被权衡或商量。即便对方有原因、或者自己有原因，打人也不可以。',
        safeActionRecommendations: [
          '身体往后退三步，找个安全开阔的角落',
          '双手抱住胸口，深呼吸三次',
          '立刻走向老师或身边的家人求助',
        ],
      };

    case Boundary.PSYCHOLOGICAL_SAFETY:
      return {
        boundary,
        isPermitted: isSafeAction,
        canEnterTradeoffEvaluation,
        spokenGuidance:
          '如果你感到非常害怕或心很疼，不要一个人硬撑。这不是你的错，请直接找身边能看到的大人。',
        objectiveReason: '心理严重过载需要现实中的成人共同调节，不能仅靠数字工具。',
        safeActionRecommendations: [
          '抱紧身边柔软的玩偶或靠垫',
          '大声呼唤现实中的抚养人',
          '喝一口温水，慢慢呼气',
        ],
      };

    case Boundary.SECRECY_COERCION:
      return {
        boundary,
        isPermitted: isSafeAction,
        canEnterTradeoffEvaluation,
        spokenGuidance:
          '任何让你感觉不舒服、害怕或要瞒着家人的秘密，都不是好秘密。你完全可以说给信任的大人听。',
        objectiveReason: '儿童不应被胁迫保守带来恐惧或身体不适的秘密。',
        safeActionRecommendations: [
          '勇敢把事情原原本本告诉信任的爸爸、妈妈或老师',
          '直接大声说：“我不喜欢这个秘密，我要告诉大人”',
          '走到大人身边牵住大人的手',
        ],
      };

    case Boundary.ADULT_RESPONSIBILITY_CROSSING:
      return {
        boundary,
        isPermitted: isSafeAction,
        canEnterTradeoffEvaluation,
        spokenGuidance:
          '大人的决定、钱和住处是大人的事情。你只是个 6 岁的孩子，负责好好吃饭、玩耍和安心长大，这些不需要你来承担。',
        objectiveReason: '成人抚养纠纷与责任不可转嫁给儿童。',
        safeActionRecommendations: [
          '对自己说：“这是大人的事，不是我的错”',
          '离开大人的争论房间，去玩自己的积木或看书',
          '找信任的家长抱一抱',
        ],
      };

    case Boundary.PRIVACY_BOUNDARY:
      return {
        boundary,
        isPermitted: isSafeAction,
        canEnterTradeoffEvaluation,
        spokenGuidance:
          '你的身体是属于你自己的，任何不舒服的触碰或要求都不可以。大声说停，并马上告诉安全大人。',
        objectiveReason: '身体隐私权具有最高防线。',
        safeActionRecommendations: [
          '坚定大声说：“请停下！不可以这样！”',
          '立刻转身离开，走到人多安全的地方',
          '一秒钟也不要等，直接告诉主要抚养人',
        ],
      };

    default: {
      // 详尽性检查
      const _exhaustiveCheck: never = boundary;
      throw new Error(`Unhandled boundary: ${_exhaustiveCheck}`);
    }
  }
}
