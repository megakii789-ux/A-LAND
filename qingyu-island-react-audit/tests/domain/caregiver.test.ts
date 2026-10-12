import { describe, it, expect } from 'vitest';
import { resolveCaregiverChoice, evaluateReliabilityReview, DEFAULT_RELIABILITY_CONFIG } from '../../src/domain/caregiver/caregiverResponseService';
import { CareResponsibility } from '../../src/domain/hug/types';
describe('Caregiver actions and explicit review configuration',()=>{
 it('self commitment is only responsibility, not arrival',()=>expect(resolveCaregiverChoice('I_CAN_GO_NOW').responsibility).toBe(CareResponsibility.ASSIGNED_SELF));
 it('delegation requires a selected contact',()=>expect(()=>resolveCaregiverChoice('I_DELEGATE_TO_TRUSTED')).toThrow());
 it('automatic reliability thresholds are disabled by default',()=>{
  expect(DEFAULT_RELIABILITY_CONFIG.enabled).toBe(false);
  expect(evaluateReliabilityReview([]).shouldRecommendReview).toBe(false);
 });
 it('explicit exploratory configuration can count self-reported misses',()=>{
  const at=new Date('2026-10-09T12:00:00Z');
  const rows=[{id:'r1',hugRequestId:'x',timestamp:'2026-10-08T12:00:00Z',outcome:'I_COULD_NOT_GO' as const}];
  expect(evaluateReliabilityReview(rows,{enabled:true,rollingWindowDays:7,missThreshold:1},at).shouldRecommendReview).toBe(true);
 });
 it('does not count future records',()=>{
  const rows=[{id:'future',hugRequestId:'x',timestamp:'2030-01-01T00:00:00Z',outcome:'I_COULD_NOT_GO' as const}];
  expect(evaluateReliabilityReview(rows,{enabled:true,rollingWindowDays:7,missThreshold:1},new Date('2026-10-09')).shouldRecommendReview).toBe(false);
 });
});
