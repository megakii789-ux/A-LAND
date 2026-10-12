/**
 * Only speaks through an available local Chinese voice.
 * No microphone, speech recognition, runtime text generation, or silent success.
 */
export type SpeechState='idle'|'speaking'|'muted'|'unavailable'|'error';
class SpeechNarrator {
  private speaking=false;
  private muted=false;
  private revision=0;
  private emit(state:SpeechState){
    if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('qingyu:speech',{detail:state}));
  }
  public setMuted(value:boolean){this.muted=value;if(value)this.stop();}
  public speak(text:string,onEnd?:()=>void){
    if(this.muted){this.emit('muted');onEnd?.();return;}
    if(typeof window==='undefined'||!('speechSynthesis' in window)){this.emit('unavailable');onEnd?.();return;}
    const voice=window.speechSynthesis.getVoices().find(v=>v.localService&&/^zh[-_]/i.test(v.lang));
    if(!voice){this.emit('unavailable');onEnd?.();return;}
    this.stop();
    const revision=++this.revision;
    const utterance=new SpeechSynthesisUtterance(text);
    utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=.88;utterance.pitch=1;
    utterance.onstart=()=>{if(revision===this.revision){this.speaking=true;this.emit('speaking');}};
    utterance.onend=()=>{if(revision===this.revision){this.speaking=false;this.emit('idle');onEnd?.();}};
    utterance.onerror=()=>{if(revision===this.revision){this.speaking=false;this.emit('error');onEnd?.();}};
    try{window.speechSynthesis.speak(utterance);}catch{this.emit('error');onEnd?.();}
  }
  public stop(){this.revision++;if(typeof window!=='undefined'&&'speechSynthesis' in window)window.speechSynthesis.cancel();this.speaking=false;this.emit('idle');}
  public getSpeaking(){return this.speaking;}
}
export const speechNarrator=new SpeechNarrator();
