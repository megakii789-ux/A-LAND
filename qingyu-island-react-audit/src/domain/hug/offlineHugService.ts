import { HugRequestType, CommunicationStatus as C, CareResponsibility as R,
  CoPresenceStatus as P, HugDomainState } from './types';

export interface HugSubmitOptions { isOnline:boolean; targetCaregiverName:string; requestType:HugRequestType; }
export interface HugTransport {
  /** Only return accepted after a real server receipt. Must implement server-side idempotency too. */
  send(input:HugSubmitOptions & {idempotencyKey:string}):Promise<{accepted:boolean;requestId?:string}>;
}
export class OfflineHugController {
  private isSubmitting=false;
  private active:HugDomainState|null=null;
  constructor(private readonly transport?:HugTransport){}
  async submitHugRequest(options:HugSubmitOptions):Promise<HugDomainState>{
    if(this.isSubmitting)throw new Error('DUPLICATE_SUBMIT_BLOCKED');
    if(this.active)throw new Error('ACTIVE_REQUEST_REQUIRES_EXPLICIT_CLOSE');
    const initial:HugDomainState={requestType:options.requestType,communication:C.UNSENT,
      care:R.UNASSIGNED,coPresence:P.UNCONFIRMED,targetCaregiverName:options.targetCaregiverName};
    // Connectivity alone is not a message transport. No fake success.
    if(!options.isOnline||!this.transport)return {...initial,communication:C.SEND_FAILED};
    this.isSubmitting=true;
    try{
      const key=globalThis.crypto.randomUUID();
      const receipt=await this.transport.send({...options,idempotencyKey:key});
      if(!receipt.accepted||!receipt.requestId)return {...initial,communication:C.SEND_FAILED};
      this.active={...initial,communication:C.SENT,requestId:receipt.requestId};
      return this.active;
    }catch{return {...initial,communication:C.SEND_FAILED};}
    finally{this.isSubmitting=false;}
  }
  closeActiveRequest():void{this.active=null;}
  /** Network loss cannot erase a receipt already obtained. SENDING remains unknown. */
  handleNetworkLossDuringHug(state:HugDomainState):HugDomainState{return state;}
  handleReconnect(state:HugDomainState):{canRetry:boolean;promptText:string}{
    const canRetry=!!this.transport&&!this.active&&state.communication===C.SEND_FAILED;
    return {canRetry,promptText:canRetry?'连接恢复了。仍需要发送时，请重新确认。':'连接状态已改变；这里没有新的接应事实。'};
  }
  static serializeActiveState(state:HugDomainState|null):void{
    if(!state){sessionStorage.removeItem('active_open_hug_state');return;}
    // Minimal metadata only; no raw message or caregiver name.
    sessionStorage.setItem('active_open_hug_state',JSON.stringify({
      requestType:state.requestType,communication:state.communication,care:state.care,
      coPresence:P.UNCONFIRMED,requestId:state.requestId
    }));
  }
  static restoreActiveState():HugDomainState|null{
    try{
      const raw=sessionStorage.getItem('active_open_hug_state');
      if(!raw||raw.length>2048)return null;
      const s:unknown=JSON.parse(raw);
      if(!s||typeof s!=='object')return null;
      const v=s as Record<string,unknown>;
      if(Object.keys(v).some(k=>!['requestType','communication','care','coPresence','requestId'].includes(k)))return null;
      if(!Object.values(HugRequestType).includes(v.requestType as HugRequestType)||
        !Object.values(C).includes(v.communication as C)||!Object.values(R).includes(v.care as R))return null;
      if(v.requestId!==undefined&&(typeof v.requestId!=='string'||v.requestId.length>128))return null;
      return {requestType:v.requestType as HugRequestType,communication:v.communication as C,
        care:v.care as R,coPresence:P.UNCONFIRMED,requestId:v.requestId as string|undefined};
    }catch{return null;}
  }
}
