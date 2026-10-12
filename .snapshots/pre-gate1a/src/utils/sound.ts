// Web Audio API pure organic acoustic synthesizer for 6-year-old child friendly feedback
// Replaces cold digital 8-bit synthetic PC beeps with warm, tactile, physical acoustic resonance:
// - Low-pass biquad filter (filtering out harsh electronic treble spikes)
// - Dual harmonic overtone layering (simulating cedar wood marimba, brass singing bowl, and soft felt mallets)
// - 100% offline & zero network latency

class SoundPlayer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Helper to create a warm low-pass acoustic filter
   * Cuts off harsh high frequencies above 2800Hz to remove digital edge
   */
  private createWarmFilter(ctx: AudioContext, cutoff: number = 2600): BiquadFilterNode {
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, ctx.currentTime);
    filter.Q.setValueAtTime(0.7, ctx.currentTime);
    return filter;
  }

  // Soft wooden marimba tap (button click / selection)
  // Fundamental + soft 2nd harmonic simulating physical wood striking
  public playClick() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const filter = this.createWarmFilter(ctx, 2200);

      // Fundamental tone (marimba bar)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(460, now);
      osc1.frequency.exponentialRampToValueAtTime(380, now + 0.08);

      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      // Soft upper wood harmonic
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(920, now);

      gain2.gain.setValueAtTime(0.04, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc1.connect(gain1);
      osc2.connect(gain2);
      gain1.connect(filter);
      gain2.connect(filter);
      filter.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.1);
      osc2.stop(now + 0.06);
    } catch {}
  }

  // Gentle bell tone (achieving a step / choosing a tool)
  // Soft celestial chime with warm decaying resonance
  public playBell() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const filter = this.createWarmFilter(ctx, 2800);

      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.07, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.65);

        osc.connect(gain);
        gain.connect(filter);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.65);
      });

      filter.connect(ctx.destination);
    } catch {}
  }

  // Warm hug resonance (low soft warm chord, like a cello or singing bowl)
  public playWarmHug() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const filter = this.createWarmFilter(ctx, 1800);

      // Low soothing chord (C3, G3, C4, E4)
      [130.81, 196.00, 261.63, 329.63].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.02, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

        osc.connect(gain);
        gain.connect(filter);
        osc.start(now);
        osc.stop(now + 2.0);
      });

      filter.connect(ctx.destination);
    } catch {}
  }

  // Coin flip metallic swish
  public playCoinFlip() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const filter = this.createWarmFilter(ctx, 2500);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.26);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(filter);
      filter.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  // Balance scale clink (soft tactile wooden click)
  public playScaleClink() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const filter = this.createWarmFilter(ctx, 2000);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.15);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(filter);
      filter.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  // Soft breathing chime (for calm corner)
  public playBreathe(isInhale: boolean) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const filter = this.createWarmFilter(ctx, 1600);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      if (isInhale) {
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(310, now + 3.0);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 2.5);
        gain.gain.linearRampToValueAtTime(0.03, now + 3.0);
      } else {
        osc.frequency.setValueAtTime(310, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 3.0);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 2.8);
      }

      osc.connect(gain);
      gain.connect(filter);
      filter.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 3.0);
    } catch {}
  }

  // Kalimba bloom (warm ascending thumb-piano chord for achievements / discoveries)
  public playWarmBloom() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const filter = this.createWarmFilter(ctx, 2400);

      // C4, E4, G4, C5 gentle kalimba arpeggio
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, idx) => {
        const time = now + idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.06, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

        osc.connect(gain);
        gain.connect(filter);
        osc.start(time);
        osc.stop(time + 0.5);
      });

      filter.connect(ctx.destination);
    } catch {}
  }

  // Nature breeze chime (soft windchime rustle)
  public playNatureChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const filter = this.createWarmFilter(ctx, 3000);
      const frequencies = [659.25, 783.99, 880.00, 1046.50];

      frequencies.forEach((freq, idx) => {
        const time = now + idx * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.04, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.7);

        osc.connect(gain);
        gain.connect(filter);
        osc.start(time);
        osc.stop(time + 0.7);
      });

      filter.connect(ctx.destination);
    } catch {}
  }

  // Kalimba bloom alias for tactile 3D interactions
  public playKalimbaBloom() {
    this.playWarmBloom();
  }

  // Tactile wood clack for 3D tokens and blocks
  public playWoodClack() {
    this.playScaleClink();
  }
}

export const sounds = new SoundPlayer();
