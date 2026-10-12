/** Product-observation codes, NOT validated child ability scales. Never average supportLevel. */
export const FAILURE_CODES = {
  F1: '任务本身没被理解', F2: '理解任务，但需要视觉支架',
  F3: '能在角色上做，迁到自己时未观察到', F4: '能认出关系，但未主动调用',
  F5: '听到行为原因后撤掉安全边界', F6: '把送达误认为真人正在来',
  F7: '成人响应流程不能履行'
} as const;
export const SUPPORT_CODES = {
  P0: '未给额外提示', P1: '中性重述', P2: '提供本任务的视觉或选项支架', P3: '示范后另给新题'
} as const;
export const OUTCOMES = ['独立完成','支持下完成','尚未观察到','孩子退出','任务无效','未知'] as const;
export interface LocalObservation {
  task: string;
  failure: keyof typeof FAILURE_CODES | 'NONE';
  support: keyof typeof SUPPORT_CODES;
  promptDescription: string;
  promptCount: number;
  outcome: typeof OUTCOMES[number];
}
export function validObservation(x: LocalObservation): boolean {
  return typeof x.task === 'string' && x.task.trim().length > 0 && x.task.length <= 80 &&
    (x.failure === 'NONE' || Object.hasOwn(FAILURE_CODES,x.failure)) &&
    Object.hasOwn(SUPPORT_CODES,x.support) && typeof x.promptDescription === 'string' &&
    x.promptDescription.length <= 200 && Number.isInteger(x.promptCount) &&
    x.promptCount >= 0 && x.promptCount <= 20 && OUTCOMES.includes(x.outcome) &&
    (x.support === 'P0' ? x.promptCount === 0 : x.promptCount >= 1) &&
    (x.support === 'P0' || x.promptDescription.trim().length > 0);
}
