class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.5;

  private customAudioPath = '/assets/aistudio/dragon-studio-button-press-382713_2af7e83b.mp3';
  private buttonPressBuffer: AudioBuffer | null = null;
  private isBufferLoading: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (!this.buttonPressBuffer && !this.isBufferLoading) {
      this.preloadCustomAudio();
    }
  }

  private preloadCustomAudio() {
    if (typeof window === 'undefined' || this.buttonPressBuffer || this.isBufferLoading) return;
    this.isBufferLoading = true;

    fetch(this.customAudioPath)
      .then((res) => res.arrayBuffer())
      .then((arrayBuffer) => {
        if (!this.ctx) {
          const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioCtx) {
            this.ctx = new AudioCtx();
          }
        }
        if (this.ctx) {
          return this.ctx.decodeAudioData(arrayBuffer);
        }
        throw new Error('AudioContext unavailable');
      })
      .then((decodedBuffer) => {
        this.buttonPressBuffer = decodedBuffer;
        this.isBufferLoading = false;
      })
      .catch(() => {
        this.isBufferLoading = false;
      });
  }

  private playCustomButtonPress(volMultiplier = 0.75): boolean {
    if (this.isMuted) return true;
    this.initCtx();

    if (this.ctx && this.buttonPressBuffer) {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = this.buttonPressBuffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(Math.min(1, Math.max(0, volMultiplier * this.masterVolume)), this.ctx.currentTime);
        source.connect(gain);
        gain.connect(this.ctx.destination);
        source.start(0);
        return true;
      } catch {
        // fallback below
      }
    }

    // HTMLAudioElement fast-path while buffer is loading or as fallback
    try {
      const audio = new Audio(this.customAudioPath);
      audio.volume = Math.min(1, Math.max(0, volMultiplier * this.masterVolume));
      audio.play().catch(() => {});
      return true;
    } catch {
      return false;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.playClick();
    }
    return this.isMuted;
  }

  // Click chime / button press using uploaded custom audio
  public playClick() {
    if (this.isMuted) return;
    if (this.playCustomButtonPress(0.65)) return;

    // Fallback synth if audio file cannot be loaded
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.07);

      gain.gain.setValueAtTime(0.08 * this.masterVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // ignore
    }
  }

  // Classical, solemn acoustic lyre/harp plucked string chord for serious story choices
  public playChoice() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Ancient Greek lyre / classical D-minor modal resonance:
      // D3 (146.83 Hz) deep body, A3 (220 Hz) fifth, D4 (293.66 Hz) octave, F4 (349.23 Hz) solemn minor third
      const strings = [
        { freq: 146.83, gain: 0.17, type: 'triangle' as OscillatorType, duration: 0.48, delay: 0.000 },
        { freq: 220.00, gain: 0.14, type: 'sine' as OscillatorType, duration: 0.42, delay: 0.008 },
        { freq: 293.66, gain: 0.10, type: 'triangle' as OscillatorType, duration: 0.36, delay: 0.016 },
        { freq: 349.23, gain: 0.06, type: 'sine' as OscillatorType, duration: 0.30, delay: 0.024 },
      ];

      // Subtle warm acoustic finger-pluck transient (low-pass filtered impulse)
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.02);
      const impulseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const channelData = impulseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const impulse = this.ctx.createBufferSource();
      impulse.buffer = impulseBuffer;

      const impulseFilter = this.ctx.createBiquadFilter();
      impulseFilter.type = 'lowpass';
      impulseFilter.frequency.setValueAtTime(650, now);

      const impulseGain = this.ctx.createGain();
      impulseGain.gain.setValueAtTime(0.06 * this.masterVolume, now);
      impulseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      impulse.connect(impulseFilter);
      impulseFilter.connect(impulseGain);
      impulseGain.connect(this.ctx.destination);
      impulse.start(now);

      // Resonant harmonic strings with staggered micro-arpeggiation for authentic acoustic pluck feel
      strings.forEach(({ freq, gain, type, duration, delay }) => {
        if (!this.ctx) return;
        const noteTime = now + delay;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, noteTime);

        // Acoustic dampening filter sweep (warm string damping)
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, noteTime);
        filter.frequency.exponentialRampToValueAtTime(280, noteTime + duration);

        gainNode.gain.setValueAtTime(0.001, noteTime);
        gainNode.gain.linearRampToValueAtTime(gain * this.masterVolume, noteTime + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, noteTime + duration);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + duration + 0.05);
      });
    } catch {
      // ignore
    }
  }

  // Dialogue advance - uses uploaded neat button press sound
  public playAdvance() {
    if (this.isMuted) return;
    if (this.playCustomButtonPress(0.75)) return;

    // Fallback synth
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Warm body tone (soft, calm wooden key / book page tap)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(230, now + 0.075);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(850, now);
      filter.frequency.exponentialRampToValueAtTime(260, now + 0.075);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.055 * this.masterVolume, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.085);

      // 2. Subtle soft warm body resonance
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(175, now);
      subOsc.frequency.exponentialRampToValueAtTime(135, now + 0.06);

      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.linearRampToValueAtTime(0.035 * this.masterVolume, now + 0.003);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);

      subOsc.start(now);
      subOsc.stop(now + 0.07);
    } catch {
      // ignore
    }
  }

  // Fast forward / Skip sound effect
  public playSkip() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.09); // D6

      gain.gain.setValueAtTime(0.12 * this.masterVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // ignore
    }
  }

  // Keyword acquired celestial golden chime
  public playKeywordChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [587.33, 739.99, 880, 1174.66, 1479.98]; // D5, F#5, A5, D6, F#6

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const noteTime = now + idx * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.18 * this.masterVolume, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.9);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.9);
      });
    } catch {
      // ignore
    }
  }

  // Clue combo success
  public playCombineSuccess() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73]; // A4, C#5, E5, A5, C#6

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const noteTime = now + idx * 0.09;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.15 * this.masterVolume, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 1.2);
      });
    } catch {
      // ignore
    }
  }

  // Clue combo failure
  public playCombineFail() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.3);

      gain.gain.setValueAtTime(0.1 * this.masterVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // ignore
    }
  }

  // Crowd reaction / murmur for court room
  public playCrowdMurmur() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Low rumble + minor dissonance
      const frequencies = [130.81, 155.56, 174.61, 220]; // C3, Eb3, F3, A3
      frequencies.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.9, now + 1.4);

        gain.gain.setValueAtTime(0.06 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 1.5);
      });
    } catch {
      // ignore
    }
  }

  // Open modal/fragment book
  public playBookOpen() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.15);

      gain.gain.setValueAtTime(0.1 * this.masterVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // ignore
    }
  }
}

export const soundManager = new SoundManager();
