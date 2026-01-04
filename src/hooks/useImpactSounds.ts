import { useRef, useCallback, useEffect } from 'react';

type AudioContextType = typeof AudioContext;

// Get cross-browser AudioContext
const getAudioContext = (): AudioContextType | null => {
  return window.AudioContext || (window as any).webkitAudioContext || null;
};

export const useImpactSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<AudioNode[]>([]);

  // Initialize audio context on first user interaction
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = getAudioContext();
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    activeNodesRef.current.forEach(node => {
      try {
        node.disconnect();
      } catch (e) {
        // Node already disconnected
      }
    });
    activeNodesRef.current = [];
  }, []);

  // Atmospheric entry sound - whooshing with increasing intensity
  const playAtmosphericEntry = useCallback((duration: number = 2) => {
    const ctx = initAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Create filtered noise for whoosh
    const bufferSize = ctx.sampleRate * duration;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    // Bandpass filter for whooshing sound
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(200, now);
    bandpass.frequency.exponentialRampToValueAtTime(2000, now + duration);
    bandpass.Q.value = 2;

    // Low frequency rumble oscillator
    const rumbleOsc = ctx.createOscillator();
    rumbleOsc.type = 'sine';
    rumbleOsc.frequency.setValueAtTime(30, now);
    rumbleOsc.frequency.linearRampToValueAtTime(80, now + duration);

    // Gain envelope
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.3, now + duration * 0.3);
    noiseGain.gain.linearRampToValueAtTime(0.5, now + duration * 0.8);
    noiseGain.gain.linearRampToValueAtTime(0.1, now + duration);

    const rumbleGain = ctx.createGain();
    rumbleGain.gain.setValueAtTime(0, now);
    rumbleGain.gain.linearRampToValueAtTime(0.4, now + duration * 0.5);
    rumbleGain.gain.linearRampToValueAtTime(0.6, now + duration);

    // Connect nodes
    noiseSource.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    rumbleOsc.connect(rumbleGain);
    rumbleGain.connect(ctx.destination);

    // Start and stop
    noiseSource.start(now);
    noiseSource.stop(now + duration);
    rumbleOsc.start(now);
    rumbleOsc.stop(now + duration);

    activeNodesRef.current.push(noiseSource, rumbleOsc, bandpass, noiseGain, rumbleGain);
  }, [initAudioContext]);

  // Explosion sound - white noise burst with low frequency punch
  const playExplosion = useCallback((intensity: number = 1) => {
    const ctx = initAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 1.5 * intensity;

    // Create noise for explosion
    const bufferSize = ctx.sampleRate * duration;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    // Lowpass filter - starts high and drops
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(8000, now);
    lowpass.frequency.exponentialRampToValueAtTime(200, now + duration);

    // Explosion gain envelope - sharp attack, long decay
    const explosionGain = ctx.createGain();
    explosionGain.gain.setValueAtTime(0, now);
    explosionGain.gain.linearRampToValueAtTime(0.8 * intensity, now + 0.01);
    explosionGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    // Low frequency punch
    const punchOsc = ctx.createOscillator();
    punchOsc.type = 'sine';
    punchOsc.frequency.setValueAtTime(150, now);
    punchOsc.frequency.exponentialRampToValueAtTime(20, now + 0.3);

    const punchGain = ctx.createGain();
    punchGain.gain.setValueAtTime(1 * intensity, now);
    punchGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    // Secondary rumble
    const rumbleOsc = ctx.createOscillator();
    rumbleOsc.type = 'triangle';
    rumbleOsc.frequency.setValueAtTime(40, now);
    rumbleOsc.frequency.linearRampToValueAtTime(25, now + duration);

    const rumbleGain = ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.5 * intensity, now + 0.1);
    rumbleGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    // Distortion for extra crunch
    const distortion = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i / 128) - 1;
      curve[i] = Math.tanh(x * 3);
    }
    distortion.curve = curve;

    // Connect explosion chain
    noiseSource.connect(lowpass);
    lowpass.connect(distortion);
    distortion.connect(explosionGain);
    explosionGain.connect(ctx.destination);

    // Connect punch
    punchOsc.connect(punchGain);
    punchGain.connect(ctx.destination);

    // Connect rumble
    rumbleOsc.connect(rumbleGain);
    rumbleGain.connect(ctx.destination);

    // Start and stop
    noiseSource.start(now);
    noiseSource.stop(now + duration);
    punchOsc.start(now);
    punchOsc.stop(now + 0.5);
    rumbleOsc.start(now);
    rumbleOsc.stop(now + duration);

    activeNodesRef.current.push(noiseSource, punchOsc, rumbleOsc, lowpass, distortion, explosionGain, punchGain, rumbleGain);
  }, [initAudioContext]);

  // Rumble/aftermath sound - sustained low frequency
  const playRumble = useCallback((duration: number = 1.5) => {
    const ctx = initAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Multiple low frequency oscillators for rich rumble
    const freqs = [25, 35, 50, 70];
    const gains: GainNode[] = [];
    const oscs: OscillatorNode[] = [];

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      // Slight frequency wobble
      osc.frequency.setValueAtTime(freq * 0.95, now + duration * 0.3);
      osc.frequency.setValueAtTime(freq * 1.05, now + duration * 0.6);
      osc.frequency.setValueAtTime(freq * 0.9, now + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3 / freqs.length, now);
      gain.gain.linearRampToValueAtTime(0.4 / freqs.length, now + duration * 0.3);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);

      oscs.push(osc);
      gains.push(gain);
    });

    activeNodesRef.current.push(...oscs, ...gains);
  }, [initAudioContext]);

  // Impact flash sound - quick transient
  const playImpact = useCallback(() => {
    const ctx = initAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Very short noise burst
    const bufferSize = ctx.sampleRate * 0.1;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 2000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    noiseSource.connect(highpass);
    highpass.connect(gain);
    gain.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + 0.1);

    activeNodesRef.current.push(noiseSource, highpass, gain);
  }, [initAudioContext]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [cleanup]);

  return {
    playAtmosphericEntry,
    playExplosion,
    playRumble,
    playImpact,
    initAudioContext,
  };
};
