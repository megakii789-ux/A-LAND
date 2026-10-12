import { describe, it, expect } from 'vitest';
import { OfflineHugController } from '../../src/domain/hug/offlineHugService';
import { HugRequestType as T, CommunicationStatus as C, CareResponsibility as R, CoPresenceStatus as P } from '../../src/domain/hug/types';
const input={isOnline:true,targetCaregiverName:'妈妈',requestType:T.INSTANT_HELP};
describe('Transport boundary unit tests — synthetic transport, not live delivery',()=>{
 it('online without a transport is not delivery',async()=>expect((await new OfflineHugController().submitHugRequest(input)).communication).toBe(C.SEND_FAILED));
 it('waits for a receipt and blocks duplicate pending submission',async()=>{
  let resolve!:(value:{accepted:boolean;requestId:string})=>void;
  const c=new OfflineHugController({send:()=>new Promise(r=>{resolve=r;})});
  const first=c.submitHugRequest(input);
  await expect(c.submitHugRequest(input)).rejects.toThrow(/DUPLICATE/);
  resolve({accepted:true,requestId:'synthetic-1'});
  expect((await first).communication).toBe(C.SENT);
  await expect(c.submitHugRequest(input)).rejects.toThrow(/ACTIVE_REQUEST/);
 });
 it('does not erase a prior receipt after network loss',()=>{
  const state={requestType:T.INSTANT_HELP,communication:C.SENT,care:R.UNASSIGNED,coPresence:P.UNCONFIRMED};
  expect(new OfflineHugController().handleNetworkLossDuringHug(state)).toEqual(state);
 });
 it.todo('Run the built service worker on a real browser: cold/warm offline, cache upgrade and stale page behavior');
});
