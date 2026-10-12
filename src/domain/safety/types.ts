/**
 * 安全边界域类型定义
 * 遵循 docs/SAFETY_MODEL.md: 围栏优先级高于任何思考工具，红线绝不妥协
 */

export enum Boundary {
  NONE = 'NONE',                                         // 无安全冲突，允许进入正常多视角思考
  PHYSICAL_SAFETY = 'PHYSICAL_SAFETY',                   // 身体伤害、危险环境、打人、伤人、高处跌落
  PHYSICAL_HARM = 'PHYSICAL_HARM',                       // 身体伤害 / 打人明确边界 (Phase H canonical key)
  PSYCHOLOGICAL_SAFETY = 'PSYCHOLOGICAL_SAFETY',         // 严重恐吓、诱导自残、极端绝望
  SECRECY_COERCION = 'SECRECY_COERCION',                 // 强迫保守不可告人的秘密
  ADULT_RESPONSIBILITY_CROSSING = 'ADULT_RESPONSIBILITY_CROSSING', // 让孩子承担大人抚养纷争、间谍刺探、法律财务责任
  PRIVACY_BOUNDARY = 'PRIVACY_BOUNDARY',                 // 拍摄私密部位、不当身体接触
}

export interface ProposedAction {
  readonly actionId: string;
  readonly description: string;
  /** 是否企图将红线行为拿来“权衡利弊”或“寻找好处” */
  readonly isTradeoffEvaluation?: boolean;
  /** 行为类别 */
  readonly category: 'HARM' | 'SECRECY' | 'ADULT_BURDEN' | 'SAFE_STEP_BACK' | 'SEEK_HELP' | 'EXPRESS_BOUND';
}

export interface BoundaryEvaluationResult {
  readonly boundary: Boundary;
  readonly isPermitted: boolean;
  /** 是否允许进入双面币/天平/权衡讨论（当 boundary !== NONE 时铁律为 false） */
  readonly canEnterTradeoffEvaluation: boolean;
  /** 适合朗读给 6 岁儿童的清晰边界语言 */
  readonly spokenGuidance: string;
  /** 对行为清楚、不给人定罪的客观原因陈述 */
  readonly objectiveReason: string;
  /** 允许执行的安全微行动 */
  readonly safeActionRecommendations: ReadonlyArray<string>;
}
