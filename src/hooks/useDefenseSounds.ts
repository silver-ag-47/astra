import { useRef, useCallback, useEffect } from 'react';

type AudioContextType = typeof AudioContext;

const getAudioContext = (): AudioContextType | null => {
  return window.AudioContext || (window as any).webkitAudioContext || null;
};

export const useDefenseSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<AudioNode[]>([]);
  const loopingRef = useRef<boolean>(false);

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

  const cleanup = useCallback(() => {
    loopingRef.current = false;
    activeNodesRef.current.forEach(node => {
      try {
        node.disconnect();
      } catch (e) {
        // Node already disconnected
      }
    });
    activeNodesRef.current = [];
  }, []);

  // Kinetic Impactor - thruster whoosh followed by metallic impact
  const playKineticImpactor = useCallback(() => {
    const ctx = initAudioContext();
    if (!ctx) return;

    cleanup();
    loopingRef.current = true;

    const playSequence = () => {
      if (!loopingRef.current) return;
      
      const now = ctx.currentTime;

      // Thruster sound - filtered noise
      const thrusterDuration = 2.5;
      const bufferSize = ctx.sampleRate * thrusterDuration;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        noiseData[i] = Math.random() * 2 - 1;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(800, now);
      bandpass.frequency.linearRampToValueAtTime(2000, now + thrusterDuration * 0.8);
      bandpass.Q.value = 3;

      const thrusterGain = ctx.createGain();
      thrusterGain.gain.setValueAtTime(0, now);
      thrusterGain.gain.linearRampToValueAtTime(0.15, now + 0.3);
      thrusterGain.gain.setValueAtTime(0.15, now + thrusterDuration * 0.9);
      thrusterGain.gain.linearRampToValueAtTime(0, now + thrusterDuration);

      noiseSource.connect(bandpass);
      bandpass.connect(thrusterGain);
      thrusterGain.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + thrusterDuration);

      // Impact sound at collision point
      const impactTime = now + 3;
      
      // Metallic clang
      const impactOsc = ctx.createOscillator();
      impactOsc.type = 'triangle';
      impactOsc.frequency.setValueAtTime(800, impactTime);
      impactOsc.frequency.exponentialRampToValueAtTime(200, impactTime + 0.3);

      const impactGain = ctx.createGain();
      impactGain.gain.setValueAtTime(0, impactTime);
      impactGain.gain.linearRampToValueAtTime(0.4, impactTime + 0.01);
      impactGain.gain.exponentialRampToValueAtTime(0.01, impactTime + 0.5);

      // Impact noise burst
      const impactNoiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const impactNoiseData = impactNoiseBuffer.getChannelData(0);
      for (let i = 0; i < impactNoiseData.length; i++) {
        impactNoiseData[i] = Math.random() * 2 - 1;
      }

      const impactNoise = ctx.createBufferSource();
      impactNoise.buffer = impactNoiseBuffer;

      const impactFilter = ctx.createBiquadFilter();
      impactFilter.type = 'lowpass';
      impactFilter.frequency.setValueAtTime(4000, impactTime);
      impactFilter.frequency.exponentialRampToValueAtTime(500, impactTime + 0.3);

      const impactNoiseGain = ctx.createGain();
      impactNoiseGain.gain.setValueAtTime(0.3, impactTime);
      impactNoiseGain.gain.exponentialRampToValueAtTime(0.01, impactTime + 0.3);

      impactOsc.connect(impactGain);
      impactGain.connect(ctx.destination);
      impactNoise.connect(impactFilter);
      impactFilter.connect(impactNoiseGain);
      impactNoiseGain.connect(ctx.destination);

      impactOsc.start(impactTime);
      impactOsc.stop(impactTime + 0.5);
      impactNoise.start(impactTime);
      impactNoise.stop(impactTime + 0.3);

      activeNodesRef.current.push(noiseSource, bandpass, thrusterGain, impactOsc, impactGain, impactNoise, impactFilter, impactNoiseGain);

      // Loop after 5 seconds
      setTimeout(() => {
        if (loopingRef.current) {
          playSequence();
        }
      }, 5000);
    };

    playSequence();
  }, [initAudioContext, cleanup]);

  // Gravity Tractor - low hum with periodic ion pulses
  const playGravityTractor = useCallback(() => {
    const ctx = initAudioContext();
    if (!ctx) return;

    cleanup();
    loopingRef.current = true;

    const now = ctx.currentTime;

    // Continuous low hum
    const humOsc = ctx.createOscillator();
    humOsc.type = 'sine';
    humOsc.frequency.value = 60;

    const humGain = ctx.createGain();
    humGain.gain.value = 0.1;

    // Add subtle modulation
    const modOsc = ctx.createOscillator();
    modOsc.type = 'sine';
    modOsc.frequency.value = 0.5;

    const modGain = ctx.createGain();
    modGain.gain.value = 10;

    modOsc.connect(modGain);
    modGain.connect(humOsc.frequency);

    humOsc.connect(humGain);
    humGain.connect(ctx.destination);

    humOsc.start(now);
    modOsc.start(now);

    activeNodesRef.current.push(humOsc, humGain, modOsc, modGain);

    // Periodic ion thruster pulses
    const playPulse = () => {
      if (!loopingRef.current) return;
      
      const pulseTime = ctx.currentTime;
      
      const pulseOsc = ctx.createOscillator();
      pulseOsc.type = 'sawtooth';
      pulseOsc.frequency.setValueAtTime(2000, pulseTime);
      pulseOsc.frequency.exponentialRampToValueAtTime(500, pulseTime + 0.3);

      const pulseGain = ctx.createGain();
      pulseGain.gain.setValueAtTime(0, pulseTime);
      pulseGain.gain.linearRampToValueAtTime(0.08, pulseTime + 0.05);
      pulseGain.gain.exponentialRampToValueAtTime(0.01, pulseTime + 0.3);

      const pulseFilter = ctx.createBiquadFilter();
      pulseFilter.type = 'bandpass';
      pulseFilter.frequency.value = 1000;
      pulseFilter.Q.value = 5;

      pulseOsc.connect(pulseFilter);
      pulseFilter.connect(pulseGain);
      pulseGain.connect(ctx.destination);

      pulseOsc.start(pulseTime);
      pulseOsc.stop(pulseTime + 0.3);

      activeNodesRef.current.push(pulseOsc, pulseFilter, pulseGain);

      setTimeout(() => {
        if (loopingRef.current) {
          playPulse();
        }
      }, 1500 + Math.random() * 500);
    };

    playPulse();
  }, [initAudioContext, cleanup]);

  // Nuclear Deflection - alarm, launch, and massive explosion
  const playNuclearDeflection = useCallback(() => {
    const ctx = initAudioContext();
    if (!ctx) return;

    cleanup();
    loopingRef.current = true;

    const playSequence = () => {
      if (!loopingRef.current) return;

      const now = ctx.currentTime;

      // Warning alarm beeps
      for (let i = 0; i < 3; i++) {
        const beepOsc = ctx.createOscillator();
        beepOsc.type = 'square';
        beepOsc.frequency.value = 880;

        const beepGain = ctx.createGain();
        beepGain.gain.setValueAtTime(0.1, now + i * 0.3);
        beepGain.gain.setValueAtTime(0, now + i * 0.3 + 0.15);

        beepOsc.connect(beepGain);
        beepGain.connect(ctx.destination);

        beepOsc.start(now + i * 0.3);
        beepOsc.stop(now + i * 0.3 + 0.15);

        activeNodesRef.current.push(beepOsc, beepGain);
      }

      // Launch whoosh
      const launchTime = now + 1;
      const launchBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const launchData = launchBuffer.getChannelData(0);
      for (let i = 0; i < launchData.length; i++) {
        launchData[i] = Math.random() * 2 - 1;
      }

      const launchNoise = ctx.createBufferSource();
      launchNoise.buffer = launchBuffer;

      const launchFilter = ctx.createBiquadFilter();
      launchFilter.type = 'bandpass';
      launchFilter.frequency.setValueAtTime(500, launchTime);
      launchFilter.frequency.exponentialRampToValueAtTime(3000, launchTime + 1.5);
      launchFilter.Q.value = 2;

      const launchGain = ctx.createGain();
      launchGain.gain.setValueAtTime(0, launchTime);
      launchGain.gain.linearRampToValueAtTime(0.2, launchTime + 0.5);
      launchGain.gain.linearRampToValueAtTime(0, launchTime + 2);

      launchNoise.connect(launchFilter);
      launchFilter.connect(launchGain);
      launchGain.connect(ctx.destination);

      launchNoise.start(launchTime);
      launchNoise.stop(launchTime + 2);

      // Detonation
      const detonationTime = now + 2.5;
      
      // Massive low frequency boom
      const boomOsc = ctx.createOscillator();
      boomOsc.type = 'sine';
      boomOsc.frequency.setValueAtTime(80, detonationTime);
      boomOsc.frequency.exponentialRampToValueAtTime(20, detonationTime + 1);

      const boomGain = ctx.createGain();
      boomGain.gain.setValueAtTime(0, detonationTime);
      boomGain.gain.linearRampToValueAtTime(0.5, detonationTime + 0.02);
      boomGain.gain.exponentialRampToValueAtTime(0.01, detonationTime + 1.5);

      // Explosion noise
      const explosionBuffer = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
      const explosionData = explosionBuffer.getChannelData(0);
      for (let i = 0; i < explosionData.length; i++) {
        explosionData[i] = Math.random() * 2 - 1;
      }

      const explosionNoise = ctx.createBufferSource();
      explosionNoise.buffer = explosionBuffer;

      const explosionFilter = ctx.createBiquadFilter();
      explosionFilter.type = 'lowpass';
      explosionFilter.frequency.setValueAtTime(8000, detonationTime);
      explosionFilter.frequency.exponentialRampToValueAtTime(200, detonationTime + 1.5);

      const explosionGain = ctx.createGain();
      explosionGain.gain.setValueAtTime(0, detonationTime);
      explosionGain.gain.linearRampToValueAtTime(0.4, detonationTime + 0.02);
      explosionGain.gain.exponentialRampToValueAtTime(0.01, detonationTime + 1.5);

      boomOsc.connect(boomGain);
      boomGain.connect(ctx.destination);
      explosionNoise.connect(explosionFilter);
      explosionFilter.connect(explosionGain);
      explosionGain.connect(ctx.destination);

      boomOsc.start(detonationTime);
      boomOsc.stop(detonationTime + 1.5);
      explosionNoise.start(detonationTime);
      explosionNoise.stop(detonationTime + 1.5);

      activeNodesRef.current.push(launchNoise, launchFilter, launchGain, boomOsc, boomGain, explosionNoise, explosionFilter, explosionGain);

      // Loop after 5 seconds
      setTimeout(() => {
        if (loopingRef.current) {
          playSequence();
        }
      }, 5000);
    };

    playSequence();
  }, [initAudioContext, cleanup]);

  // Ion Beam - continuous electrical hum with crackling
  const playIonBeam = useCallback(() => {
    const ctx = initAudioContext();
    if (!ctx) return;

    cleanup();
    loopingRef.current = true;

    const now = ctx.currentTime;

    // Base electrical hum
    const humOsc = ctx.createOscillator();
    humOsc.type = 'sawtooth';
    humOsc.frequency.value = 120;

    const humFilter = ctx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.value = 400;

    const humGain = ctx.createGain();
    humGain.gain.value = 0.08;

    humOsc.connect(humFilter);
    humFilter.connect(humGain);
    humGain.connect(ctx.destination);

    humOsc.start(now);

    // High frequency beam tone
    const beamOsc = ctx.createOscillator();
    beamOsc.type = 'sine';
    beamOsc.frequency.value = 2400;

    const beamGain = ctx.createGain();
    beamGain.gain.value = 0.05;

    // Tremolo modulation for beam
    const tremoloOsc = ctx.createOscillator();
    tremoloOsc.type = 'sine';
    tremoloOsc.frequency.value = 8;

    const tremoloGain = ctx.createGain();
    tremoloGain.gain.value = 0.03;

    tremoloOsc.connect(tremoloGain);
    tremoloGain.connect(beamGain.gain);

    beamOsc.connect(beamGain);
    beamGain.connect(ctx.destination);

    beamOsc.start(now);
    tremoloOsc.start(now);

    activeNodesRef.current.push(humOsc, humFilter, humGain, beamOsc, beamGain, tremoloOsc, tremoloGain);

    // Random crackling
    const playCrackle = () => {
      if (!loopingRef.current) return;

      const crackleTime = ctx.currentTime;
      const crackleBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const crackleData = crackleBuffer.getChannelData(0);
      for (let i = 0; i < crackleData.length; i++) {
        crackleData[i] = (Math.random() * 2 - 1) * Math.random();
      }

      const crackleNoise = ctx.createBufferSource();
      crackleNoise.buffer = crackleBuffer;

      const crackleFilter = ctx.createBiquadFilter();
      crackleFilter.type = 'highpass';
      crackleFilter.frequency.value = 3000;

      const crackleGain = ctx.createGain();
      crackleGain.gain.setValueAtTime(0.15, crackleTime);
      crackleGain.gain.exponentialRampToValueAtTime(0.01, crackleTime + 0.05);

      crackleNoise.connect(crackleFilter);
      crackleFilter.connect(crackleGain);
      crackleGain.connect(ctx.destination);

      crackleNoise.start(crackleTime);
      crackleNoise.stop(crackleTime + 0.05);

      activeNodesRef.current.push(crackleNoise, crackleFilter, crackleGain);

      setTimeout(() => {
        if (loopingRef.current) {
          playCrackle();
        }
      }, 100 + Math.random() * 300);
    };

    playCrackle();
  }, [initAudioContext, cleanup]);

  // Stop all sounds
  const stopSound = useCallback(() => {
    loopingRef.current = false;
    cleanup();
  }, [cleanup]);

  useEffect(() => {
    return () => {
      cleanup();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [cleanup]);

  return {
    playKineticImpactor,
    playGravityTractor,
    playNuclearDeflection,
    playIonBeam,
    stopSound,
    initAudioContext,
  };
};
