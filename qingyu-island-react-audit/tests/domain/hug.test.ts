import { describe, it, expect } from 'vitest';
import { HugRequestType as T, CommunicationStatus as C, CareResponsibility as R,
  CoPresenceStatus as P, mapHugStateToChildPresentation as map } from '../../src/domain/hug';
const base={requestType:T.INSTANT_HELP,communication:C.UNSENT,care:R.UNASSIGNED,coPresence:P.UNCONFIRMED};
describe('Evidence-aware hug projection, not delivery validation',()=>{
 it('never promotes any of 200 legacy states to observed arrival without evidence',()=>{
  for(const requestType of Object.values(T))for(const communication of Object.values(C))
   for(const care of Object.values(R))for(const coPresence of Object.values(P)){
    const v=map({requestType,communication,care,coPresence});
    expect(v.shouldStepBack).toBe(false);
    expect(v.spokenText).not.toMatch(/马上|正在路上|还没到|还没有打开|失约/);
   }
 });
 it('separates unsent from sending',()=>expect(map(base).displayText).toContain('还没有发出'));
 it('separates device receipt from human opening',()=>{
  expect(map({...base,communication:C.ACKNOWLEDGED,acknowledgementEvidence:'DEVICE_RECEIVED'}).displayText).toContain('还没有收到');
  expect(map({...base,communication:C.ACKNOWLEDGED,acknowledgementEvidence:'HUMAN_OPENED'}).displayText).toContain('确认看到');
 });
 it('separates a request to delegate from acceptance',()=>{
  expect(map({...base,communication:C.SENT,care:R.ASSIGNED_OTHER,careEvidence:'REQUESTED_OTHER'}).spokenText).toContain('还没有收到对方接受');
 });
 it('self report is not independent confirmation',()=>{
  const v=map({...base,coPresence:P.ARRIVED_CONFIRMED,meetingEvidence:'ADULT_SELF_REPORT'});
  expect(v.shouldStepBack).toBe(false);expect(v.spokenText).toContain('反馈');
 });
 it('local flow closure does not claim a named person is present',()=>{
  const v=map({...base,coPresence:P.ARRIVED_CONFIRMED,meetingEvidence:'LOCAL_CLOSE'});
  expect(v.shouldStepBack).toBe(true);expect(v.spokenText).not.toContain('已在身边');
 });
});
