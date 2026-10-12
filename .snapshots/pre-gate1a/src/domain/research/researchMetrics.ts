import {
  CoarseLatencyBucket,
  FailureCode,
  ExitType,
  CoarseEmotionalLoad,
} from './types';

/**
 * 将毫秒时间映射为隐私安全的粗粒度耗时区间
 * 避免精确按键级打点所造成的监控与测谎隐患
 */
export function mapMillisecondsToLatencyBucket(
  ms: number
): CoarseLatencyBucket {
  if (ms < 5000) {
    return CoarseLatencyBucket.FAST_UNDER_5S;
  }
  if (ms <= 30000) {
    return CoarseLatencyBucket.NORMAL_5_30S;
  }
  if (ms <= 90000) {
    return CoarseLatencyBucket.DELIBERATE_30_90S;
  }
  return CoarseLatencyBucket.EXTENDED_OVER_90S;
}
