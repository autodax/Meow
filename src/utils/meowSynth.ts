import { MeowVoiceProfile } from '../data/cats';

class MeowSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private volume = 0.8;
  private muted = false;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;

      this.ctx = new AudioCtx();
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-16, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(18, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.004, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);

      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.noiseBuffer = this.createNoiseBuffer(this.ctx);
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    return this.ctx;
  }

  private createNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * 1.5);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  public setVolume(value: number): void {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this.muted ? 0 : this.volume,
        this.ctx.currentTime,
        0.02
      );
    }
  }

  public setMuted(isMuted: boolean): void {
    this.muted = isMuted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this.muted ? 0 : this.volume,
        this.ctx.currentTime,
        0.02
      );
    }
  }

  /**
   * Plays a formant-synthesized feline meow and returns the actual duration in ms.
   */
  public play(voice: MeowVoiceProfile, pitchScale = 1): number {
    const ctx = this.ensureContext();
    if (!ctx || !this.compressor) {
      return Math.round(voice.duration * 1000);
    }

    // Subtle organic micro-variation on each click so repeats feel alive
    const pitchJitter = (0.96 + Math.random() * 0.08) * pitchScale;
    const durationJitter = 0.94 + Math.random() * 0.12;
    const dur = voice.duration * durationJitter;
    const now = ctx.currentTime + 0.01;

    if (voice.doubleSyllable) {
      // Short playful opening chirrup followed immediately by the main upward chirp
      this.renderSyllable(
        ctx,
        {
          ...voice,
          startHz: voice.startHz * 0.85,
          peakHz: voice.startHz * 1.15,
          endHz: voice.startHz * 1.05,
          duration: 0.11,
          peakTimeRatio: 0.65,
        },
        now,
        pitchJitter,
        0.55
      );
      this.renderSyllable(ctx, { ...voice, duration: dur }, now + 0.1, pitchJitter, 1.0);
      return Math.round((dur + 0.12) * 1000);
    }

    this.renderSyllable(ctx, { ...voice, duration: dur }, now, pitchJitter, 1.0);
    return Math.round((dur + 0.06) * 1000);
  }

  private renderSyllable(
    ctx: AudioContext,
    voice: MeowVoiceProfile,
    startTime: number,
    pitchScale: number,
    level: number
  ): void {
    if (!this.compressor) return;

    const dur = voice.duration;
    const endTime = startTime + dur;
    const peakTime = startTime + dur * voice.peakTimeRatio;
    const holdTime = startTime + dur * Math.min(voice.peakTimeRatio + 0.18, 0.82);

    const startHz = voice.startHz * pitchScale;
    const peakHz = voice.peakHz * pitchScale;
    const endHz = voice.endHz * pitchScale;

    // 1. Glottal oscillator stack (warm harmonic source)
    const oscMain = ctx.createOscillator();
    oscMain.type = 'sawtooth';

    const oscDetune = ctx.createOscillator();
    oscDetune.type = 'sawtooth';
    oscDetune.detune.setValueAtTime(5, startTime);

    const oscSub = ctx.createOscillator();
    oscSub.type = 'triangle';

    // Pitch contour across all oscillators
    for (const osc of [oscMain, oscDetune]) {
      osc.frequency.setValueAtTime(startHz, startTime);
      osc.frequency.exponentialRampToValueAtTime(Math.max(80, peakHz), peakTime);
      osc.frequency.linearRampToValueAtTime(Math.max(80, peakHz * 0.96), holdTime);
      osc.frequency.exponentialRampToValueAtTime(Math.max(80, endHz), endTime);
    }

    oscSub.frequency.setValueAtTime(startHz * 0.5, startTime);
    oscSub.frequency.exponentialRampToValueAtTime(Math.max(60, peakHz * 0.5), peakTime);
    oscSub.frequency.exponentialRampToValueAtTime(Math.max(60, endHz * 0.5), endTime);

    // 2. Natural vocal vibrato LFO
    const vibOsc = ctx.createOscillator();
    const vibGain = ctx.createGain();
    vibOsc.type = 'sine';
    vibOsc.frequency.setValueAtTime(voice.vibratoHz, startTime);
    vibGain.gain.setValueAtTime(voice.vibratoDepth * 0.3, startTime);
    vibGain.gain.linearRampToValueAtTime(voice.vibratoDepth, peakTime);
    vibGain.gain.linearRampToValueAtTime(voice.vibratoDepth * 0.5, endTime);
    vibOsc.connect(vibGain);
    vibGain.connect(oscMain.frequency);
    vibGain.connect(oscDetune.frequency);

    // 3. Optional feline purr-trill modulation ("mrrr-ow" / "mrrp")
    let trillOsc: OscillatorNode | null = null;
    if (voice.trillHz > 0 && voice.trillDepth > 0) {
      trillOsc = ctx.createOscillator();
      const trillGain = ctx.createGain();
      trillOsc.type = 'sine';
      trillOsc.frequency.setValueAtTime(voice.trillHz, startTime);
      trillGain.gain.setValueAtTime(voice.trillDepth, startTime);
      trillGain.gain.exponentialRampToValueAtTime(1.5, startTime + dur * 0.65);
      trillOsc.connect(trillGain);
      trillGain.connect(oscMain.frequency);
      trillGain.connect(oscDetune.frequency);
      trillOsc.start(startTime);
      trillOsc.stop(endTime + 0.05);
    }

    // Mix glottal sources
    const glottalMix = ctx.createGain();
    const mainGain = ctx.createGain();
    const detuneGain = ctx.createGain();
    const subGain = ctx.createGain();

    mainGain.gain.setValueAtTime(0.55, startTime);
    detuneGain.gain.setValueAtTime(0.32, startTime);
    subGain.gain.setValueAtTime(0.18, startTime);

    oscMain.connect(mainGain);
    oscDetune.connect(detuneGain);
    oscSub.connect(subGain);

    mainGain.connect(glottalMix);
    detuneGain.connect(glottalMix);
    subGain.connect(glottalMix);

    // Soften raw sawtooth edges (mouth opening from closed "m" -> open vowel)
    const mouthFilter = ctx.createBiquadFilter();
    mouthFilter.type = 'lowpass';
    mouthFilter.frequency.setValueAtTime(900, startTime);
    mouthFilter.frequency.exponentialRampToValueAtTime(3600, startTime + Math.min(0.08, dur * 0.2));
    mouthFilter.frequency.exponentialRampToValueAtTime(1500, endTime);
    glottalMix.connect(mouthFilter);

    // 4. Parallel vocal-tract formant filters (F1, F2, F3) for genuine "M-EE-AA-OO-WW" vowel shape
    const formantSum = ctx.createGain();

    const f1 = ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.Q.setValueAtTime(4.8, startTime);
    f1.frequency.setValueAtTime(voice.f1[0], startTime);
    f1.frequency.exponentialRampToValueAtTime(voice.f1[1], peakTime);
    f1.frequency.exponentialRampToValueAtTime(voice.f1[2], endTime);
    const f1Gain = ctx.createGain();
    f1Gain.gain.setValueAtTime(1.45, startTime);

    const f2 = ctx.createBiquadFilter();
    f2.type = 'bandpass';
    f2.Q.setValueAtTime(6.8, startTime);
    f2.frequency.setValueAtTime(voice.f2[0], startTime);
    f2.frequency.exponentialRampToValueAtTime(voice.f2[1], peakTime * 0.92 + startTime * 0.08);
    f2.frequency.exponentialRampToValueAtTime(voice.f2[2], endTime);
    const f2Gain = ctx.createGain();
    f2Gain.gain.setValueAtTime(1.15, startTime);

    const f3 = ctx.createBiquadFilter();
    f3.type = 'bandpass';
    f3.Q.setValueAtTime(8.5, startTime);
    f3.frequency.setValueAtTime(voice.f3, startTime);
    const f3Gain = ctx.createGain();
    f3Gain.gain.setValueAtTime(voice.nasality * 1.2, startTime);

    mouthFilter.connect(f1);
    mouthFilter.connect(f2);
    mouthFilter.connect(f3);

    f1.connect(f1Gain);
    f2.connect(f2Gain);
    f3.connect(f3Gain);

    f1Gain.connect(formantSum);
    f2Gain.connect(formantSum);
    f3Gain.connect(formantSum);

    // 5. Optional airy breath layer
    let noiseSource: AudioBufferSourceNode | null = null;
    if (this.noiseBuffer && voice.breathiness > 0) {
      noiseSource = ctx.createBufferSource();
      noiseSource.buffer = this.noiseBuffer;

      const breathFilter = ctx.createBiquadFilter();
      breathFilter.type = 'bandpass';
      breathFilter.frequency.setValueAtTime(2400, startTime);
      breathFilter.Q.setValueAtTime(1.8, startTime);

      const breathGain = ctx.createGain();
      breathGain.gain.setValueAtTime(voice.breathiness, startTime);

      noiseSource.connect(breathFilter);
      breathFilter.connect(breathGain);
      breathGain.connect(formantSum);
      noiseSource.start(startTime);
      noiseSource.stop(endTime + 0.05);
    }

    // 6. Amplitude envelope (smooth click-free feline swell and decay)
    const env = ctx.createGain();
    const attack = Math.min(0.055, dur * 0.16);
    const peakAmp = 0.72 * level;

    env.gain.setValueAtTime(0.0001, startTime);
    env.gain.linearRampToValueAtTime(peakAmp * 0.65, startTime + attack);
    env.gain.linearRampToValueAtTime(peakAmp, peakTime);
    env.gain.linearRampToValueAtTime(peakAmp * 0.78, holdTime);
    env.gain.exponentialRampToValueAtTime(0.0001, endTime);

    formantSum.connect(env);
    env.connect(this.compressor);

    oscMain.start(startTime);
    oscDetune.start(startTime);
    oscSub.start(startTime);
    vibOsc.start(startTime);

    const stopAt = endTime + 0.05;
    oscMain.stop(stopAt);
    oscDetune.stop(stopAt);
    oscSub.stop(stopAt);
    vibOsc.stop(stopAt);
  }
}

export const meowSynth = new MeowSynthesizer();
