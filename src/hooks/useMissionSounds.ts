import { useRef, useCallback, useEffect } from 'react';

type AudioContextType = typeof AudioContext;

const getAudioContext = (): AudioContextType | null => {
  return window.AudioContext || (window as any).webkitAudioContext || null;
};

export const useMissionSounds = () => {
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

  // Spacecraft Launch - powerful rocket ignition with increasing roar
  const playLaunch = useCallback(() => {
    const ctx = initAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Engine ignition rumble
    const rumbleBuffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const rumbleData = rumbleBuffer.getChannelData(0);
    for (let i = 0; i < rumbleData.length; i++) {
      rumbleData[i] = Math.random() * 2 - 1;
    }

    const rumbleSource = ctx.createBufferSource();
    rumbleSource.buffer = rumbleBuffer;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(200, now);
    lowpass.frequency.linearRampToValueAtTime(800, now + 1.5);
    lowpass.frequency.linearRampToValueAtTime(400, now + 3);

    const rumbleGain = ctx.createGain();
    rumbleGain.gain.setValueAtTime(0, now);
    rumbleGain.gain.linearRampToValueAtTime(0.3, now + 0.5);
    rumbleGain.gain.setValueAtTime(0.3, now + 2);
    rumbleGain.gain.linearRampToValueAtTime(0.05, now + 3);

    rumbleSource.connect(lowpass);
    lowpass.connect(rumbleGain);
    rumbleGain.connect(ctx.destination);

    // High-frequency thrust
    const thrustBuffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const thrustData = thrustBuffer.getChannelData(0);
    for (let i = 0; i < thrustData.length; i++) {
      thrustData[i] = Math.random() * 2 - 1;
    }

    const thrustSource = ctx.createBufferSource();
    thrustSource.buffer = thrustBuffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1000, now);
    bandpass.frequency.linearRampToValueAtTime(3000, now + 1);
    bandpass.frequency.linearRampToValueAtTime(1500, now + 3);
    bandpass.Q.value = 2;

    const thrustGain = ctx.createGain();
    thrustGain.gain.setValueAtTime(0, now);
    thrustGain.gain.linearRampToValueAtTime(0.15, now + 0.3);
    thrustGain.gain.setValueAtTime(0.15, now + 2.5);
    thrustGain.gain.linearRampToValueAtTime(0, now + 3);

    thrustSource.connect(bandpass);
    bandpass.connect(thrustGain);
    thrustGain.connect(ctx.destination);

    rumbleSource.start(now);
    rumbleSource.stop(now + 3);
    thrustSource.start(now);
    thrustSource.stop(now + 3);

    activeNodesRef.current.push(rumbleSource, lowpass, rumbleGain, thrustSource, bandpass, thrustGain);
  }, [initAudioContext]);

  // Impact Collision - metallic crash with debris
  const playImpact = useCallback(() => {
    const ctx = initAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Initial metallic hit
    const impactOsc = ctx.createOscillator();
    impactOsc.type = 'triangle';
    impactOsc.frequency.setValueAtTime(1200, now);
    impactOsc.frequency.exponentialRampToValueAtTime(100, now + 0.3);

    const impactGain = ctx.createGain();
    impactGain.gain.setValueAtTime(0.5, now);
    impactGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    impactOsc.connect(impactGain);
    impactGain.connect(ctx.destination);

    // Debris noise burst
    const debrisBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.8, ctx.sampleRate);
    const debrisData = debrisBuffer.getChannelData(0);
    for (let i = 0; i < debrisData.length; i++) {
      debrisData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.2));
    }

    const debrisSource = ctx.createBufferSource();
    debrisSource.buffer = debrisBuffer;

    const debrisFilter = ctx.createBiquadFilter();
    debrisFilter.type = 'bandpass';
    debrisFilter.frequency.setValueAtTime(2000, now);
    debrisFilter.frequency.exponentialRampToValueAtTime(500, now + 0.5);
    debrisFilter.Q.value = 1;

    const debrisGain = ctx.createGain();
    debrisGain.gain.setValueAtTime(0.4, now);
    debrisGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

    debrisSource.connect(debrisFilter);
    debrisFilter.connect(debrisGain);
    debrisGain.connect(ctx.destination);

    // Low frequency boom
    const boomOsc = ctx.createOscillator();
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(80, now);
    boomOsc.frequency.exponentialRampToValueAtTime(30, now + 0.6);

    const boomGain = ctx.createGain();
    boomGain.gain.setValueAtTime(0.4, now);
    boomGain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

    boomOsc.connect(boomGain);
    boomGain.connect(ctx.destination);

    impactOsc.start(now);
    impactOsc.stop(now + 0.5);
    debrisSource.start(now);
    debrisSource.stop(now + 0.8);
    boomOsc.start(now);
    boomOsc.stop(now + 0.7);

    activeNodesRef.current.push(impactOsc, impactGain, debrisSource, debrisFilter, debrisGain, boomOsc, boomGain);
  }, [initAudioContext]);

  // Nuclear Detonation - massive deep explosion
  const playNuclearExplosion = useCallback(() => {
    const ctx = initAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Initial flash/crack
    const crackBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
    const crackData = crackBuffer.getChannelData(0);
    for (let i = 0; i < crackData.length; i++) {
      crackData[i] = Math.random() * 2 - 1;
    }

    const crackSource = ctx.createBufferSource();
    crackSource.buffer = crackBuffer;

    const crackGain = ctx.createGain();
    crackGain.gain.setValueAtTime(0.5, now);
    crackGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    crackSource.connect(crackGain);
    crackGain.connect(ctx.destination);

    // Massive low boom
    const boomOsc = ctx.createOscillator();
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(60, now + 0.05);
    boomOsc.frequency.exponentialRampToValueAtTime(15, now + 2);

    const boomGain = ctx.createGain();
    boomGain.gain.setValueAtTime(0, now);
    boomGain.gain.linearRampToValueAtTime(0.6, now + 0.1);
    boomGain.gain.exponentialRampToValueAtTime(0.01, now + 2.5);

    boomOsc.connect(boomGain);
    boomGain.connect(ctx.destination);

    // Explosion rumble
    const rumbleBuffer = ctx.createBuffer(1, ctx.sampleRate * 2.5, ctx.sampleRate);
    const rumbleData = rumbleBuffer.getChannelData(0);
    for (let i = 0; i < rumbleData.length; i++) {
      rumbleData[i] = Math.random() * 2 - 1;
    }

    const rumbleSource = ctx.createBufferSource();
    rumbleSource.buffer = rumbleBuffer;

    const rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(500, now);
    rumbleFilter.frequency.exponentialRampToValueAtTime(100, now + 2);

    const rumbleGain = ctx.createGain();
    rumbleGain.gain.setValueAtTime(0, now);
    rumbleGain.gain.linearRampToValueAtTime(0.35, now + 0.15);
    rumbleGain.gain.exponentialRampToValueAtTime(0.01, now + 2.5);

    rumbleSource.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(ctx.destination);

    crackSource.start(now);
    crackSource.stop(now + 0.1);
    boomOsc.start(now + 0.05);
    boomOsc.stop(now + 2.5);
    rumbleSource.start(now);
    rumbleSource.stop(now + 2.5);

    activeNodesRef.current.push(crackSource, crackGain, boomOsc, boomGain, rumbleSource, rumbleFilter, rumbleGain);
  }, [initAudioContext]);

  // Laser Beam - continuous electrical beam with pulsing
  const playLaserBeam = useCallback(() => {
    const ctx = initAudioContext();
    if (!ctx) return;

    cleanup();
    loopingRef.current = true;

    const now = ctx.currentTime;

    // High frequency beam tone
    const beamOsc = ctx.createOscillator();
    beamOsc.type = 'sawtooth';
    beamOsc.frequency.value = 1800;

    const beamFilter = ctx.createBiquadFilter();
    beamFilter.type = 'bandpass';
    beamFilter.frequency.value = 2000;
    beamFilter.Q.value = 8;

    const beamGain = ctx.createGain();
    beamGain.gain.value = 0.08;

    // Pulse modulation
    const pulseOsc = ctx.createOscillator();
    pulseOsc.type = 'sine';
    pulseOsc.frequency.value = 15;

    const pulseGain = ctx.createGain();
    pulseGain.gain.value = 0.04;

    pulseOsc.connect(pulseGain);
    pulseGain.connect(beamGain.gain);

    beamOsc.connect(beamFilter);
    beamFilter.connect(beamGain);
    beamGain.connect(ctx.destination);

    // Base electrical hum
    const humOsc = ctx.createOscillator();
    humOsc.type = 'square';
    humOsc.frequency.value = 100;

    const humFilter = ctx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.value = 200;

    const humGain = ctx.createGain();
    humGain.gain.value = 0.05;

    humOsc.connect(humFilter);
    humFilter.connect(humGain);
    humGain.connect(ctx.destination);

    beamOsc.start(now);
    pulseOsc.start(now);
    humOsc.start(now);

    activeNodesRef.current.push(beamOsc, beamFilter, beamGain, pulseOsc, pulseGain, humOsc, humFilter, humGain);
  }, [initAudioContext, cleanup]);

  // Mission Success - triumphant ascending chime
  const playSuccess = useCallback(() => {
    const ctx = initAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Ascending chord progression
    const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.15 + 0.1);
      gain.gain.setValueAtTime(0.2, now + i * 0.15 + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 1.5);

      // Add harmonics
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.value = freq * 2;

      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0, now + i * 0.15);
      gain2.gain.linearRampToValueAtTime(0.08, now + i * 0.15 + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 1.5);
      osc2.start(now + i * 0.15);
      osc2.stop(now + i * 0.15 + 1);

      activeNodesRef.current.push(osc, gain, osc2, gain2);
    });

    // Sparkle effect
    for (let i = 0; i < 5; i++) {
      const sparkleOsc = ctx.createOscillator();
      sparkleOsc.type = 'sine';
      sparkleOsc.frequency.value = 2000 + Math.random() * 2000;

      const sparkleGain = ctx.createGain();
      const startTime = now + 0.8 + i * 0.1;
      sparkleGain.gain.setValueAtTime(0.1, startTime);
      sparkleGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

      sparkleOsc.connect(sparkleGain);
      sparkleGain.connect(ctx.destination);

      sparkleOsc.start(startTime);
      sparkleOsc.stop(startTime + 0.15);

      activeNodesRef.current.push(sparkleOsc, sparkleGain);
    }
  }, [initAudioContext]);

  // Mission Failure - descending alarm with low drone
  const playFailure = useCallback(() => {
    const ctx = initAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Descending alarm tone
    const alarmOsc = ctx.createOscillator();
    alarmOsc.type = 'square';
    alarmOsc.frequency.setValueAtTime(880, now);
    alarmOsc.frequency.exponentialRampToValueAtTime(220, now + 1.5);

    const alarmGain = ctx.createGain();
    alarmGain.gain.setValueAtTime(0.2, now);
    alarmGain.gain.setValueAtTime(0.2, now + 1.2);
    alarmGain.gain.exponentialRampToValueAtTime(0.01, now + 1.8);

    alarmOsc.connect(alarmGain);
    alarmGain.connect(ctx.destination);

    // Low ominous drone
    const droneOsc = ctx.createOscillator();
    droneOsc.type = 'sawtooth';
    droneOsc.frequency.value = 55;

    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 200;

    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0, now);
    droneGain.gain.linearRampToValueAtTime(0.25, now + 0.5);
    droneGain.gain.setValueAtTime(0.25, now + 1.5);
    droneGain.gain.exponentialRampToValueAtTime(0.01, now + 2.5);

    droneOsc.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(ctx.destination);

    // Impact thud
    const thudOsc = ctx.createOscillator();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(60, now + 1);
    thudOsc.frequency.exponentialRampToValueAtTime(20, now + 1.5);

    const thudGain = ctx.createGain();
    thudGain.gain.setValueAtTime(0, now);
    thudGain.gain.setValueAtTime(0.4, now + 1);
    thudGain.gain.exponentialRampToValueAtTime(0.01, now + 1.8);

    thudOsc.connect(thudGain);
    thudGain.connect(ctx.destination);

    alarmOsc.start(now);
    alarmOsc.stop(now + 1.8);
    droneOsc.start(now);
    droneOsc.stop(now + 2.5);
    thudOsc.start(now + 1);
    thudOsc.stop(now + 1.8);

    activeNodesRef.current.push(alarmOsc, alarmGain, droneOsc, droneFilter, droneGain, thudOsc, thudGain);
  }, [initAudioContext]);

  // Space Ambience - subtle background hum for atmosphere
  const playSpaceAmbience = useCallback(() => {
    const ctx = initAudioContext();
    if (!ctx) return;

    cleanup();
    loopingRef.current = true;

    const now = ctx.currentTime;

    // Deep space drone
    const droneOsc = ctx.createOscillator();
    droneOsc.type = 'sine';
    droneOsc.frequency.value = 40;

    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.03;

    // Slow modulation
    const modOsc = ctx.createOscillator();
    modOsc.type = 'sine';
    modOsc.frequency.value = 0.1;

    const modGain = ctx.createGain();
    modGain.gain.value = 5;

    modOsc.connect(modGain);
    modGain.connect(droneOsc.frequency);

    droneOsc.connect(droneGain);
    droneGain.connect(ctx.destination);

    droneOsc.start(now);
    modOsc.start(now);

    activeNodesRef.current.push(droneOsc, droneGain, modOsc, modGain);
  }, [initAudioContext, cleanup]);

  // Stop all sounds
  const stopAllSounds = useCallback(() => {
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
    playLaunch,
    playImpact,
    playNuclearExplosion,
    playLaserBeam,
    playSuccess,
    playFailure,
    playSpaceAmbience,
    stopAllSounds,
    initAudioContext,
  };
};
