/**
 * Synthesized SFX engine — Web Audio API, zero external files.
 * All sounds are procedurally generated to match the cyberpunk terminal aesthetic.
 */

let ctx: AudioContext | null = null;
let muted = false;
let userHasInteracted = false;

// Listen for the first user gesture to unlock audio
if (typeof window !== 'undefined') {
  const unlock = () => {
    userHasInteracted = true;
    window.removeEventListener('click', unlock);
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('touchstart', unlock);
  };
  window.addEventListener('click', unlock, { once: false });
  window.addEventListener('keydown', unlock, { once: false });
  window.addEventListener('touchstart', unlock, { once: false });
}

function getCtx(): AudioContext | null {
  if (!userHasInteracted) return null;
  if (!ctx) {
    ctx = new AudioContext();
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

export function isMuted(): boolean {
  return muted;
}

export function toggleMute(): boolean {
  muted = !muted;
  return muted;
}

// --- Sound: Keystroke tick ---
// Short noise burst with bandpass filter — mechanical keyboard click
export function playKeystroke(): void {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;

  const noise = ac.createBufferSource();
  const buf = ac.createBuffer(1, ac.sampleRate * 0.03, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  noise.buffer = buf;

  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 3000 + Math.random() * 1500;
  bp.Q.value = 2;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.06, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

  noise.connect(bp).connect(gain).connect(ac.destination);
  noise.start(t);
  noise.stop(t + 0.03);
}

// --- Sound: Message send ---
// Rising frequency sweep — whoosh feel
export function playSend(): void {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;

  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.exponentialRampToValueAtTime(800, t + 0.12);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

  // Add a subtle noise layer for texture
  const noise = ac.createBufferSource();
  const buf = ac.createBuffer(1, ac.sampleRate * 0.15, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2;
  }
  noise.buffer = buf;

  const hp = ac.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 2000;

  const noiseGain = ac.createGain();
  noiseGain.gain.setValueAtTime(0.03, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

  osc.connect(gain).connect(ac.destination);
  noise.connect(hp).connect(noiseGain).connect(ac.destination);

  osc.start(t);
  osc.stop(t + 0.15);
  noise.start(t);
  noise.stop(t + 0.15);
}

// --- Sound: Bot reply blip ---
// Descending two-tone terminal beep — musical and clean
export function playReceive(): void {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;

  // First tone
  const osc1 = ac.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(880, t);
  osc1.frequency.exponentialRampToValueAtTime(440, t + 0.1);

  const gain1 = ac.createGain();
  gain1.gain.setValueAtTime(0.1, t);
  gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

  // Second harmonic for richness
  const osc2 = ac.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(1320, t);
  osc2.frequency.exponentialRampToValueAtTime(660, t + 0.1);

  const gain2 = ac.createGain();
  gain2.gain.setValueAtTime(0.04, t);
  gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

  osc1.connect(gain1).connect(ac.destination);
  osc2.connect(gain2).connect(ac.destination);

  osc1.start(t);
  osc1.stop(t + 0.15);
  osc2.start(t);
  osc2.stop(t + 0.12);
}

// --- Sound: Scan line sweep ---
// Filtered noise sweep synced with the scan animation
export function playScan(duration: number = 0.8): void {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;

  const noise = ac.createBufferSource();
  const len = ac.sampleRate * duration;
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noise.buffer = buf;

  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(400, t);
  bp.frequency.exponentialRampToValueAtTime(2000, t + duration * 0.7);
  bp.frequency.exponentialRampToValueAtTime(600, t + duration);
  bp.Q.value = 5;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.04, t + 0.05);
  gain.gain.setValueAtTime(0.04, t + duration * 0.8);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

  noise.connect(bp).connect(gain).connect(ac.destination);
  noise.start(t);
  noise.stop(t + duration);
}

// --- Sound: Thinking hum ---
// Low oscillator with LFO modulation — runs continuously, returns stop function
let thinkingNodes: { stop: () => void } | null = null;

export function startThinkingHum(): void {
  if (muted || thinkingNodes) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;

  // Base low hum
  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 80;

  // LFO for subtle wobble
  const lfo = ac.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 3;
  const lfoGain = ac.createGain();
  lfoGain.gain.value = 8;
  lfo.connect(lfoGain).connect(osc.frequency);

  // Second harmonic
  const osc2 = ac.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = 120;

  const masterGain = ac.createGain();
  masterGain.gain.setValueAtTime(0, t);
  masterGain.gain.linearRampToValueAtTime(0.035, t + 0.3);

  const gain2 = ac.createGain();
  gain2.gain.value = 0.015;

  osc.connect(masterGain).connect(ac.destination);
  osc2.connect(gain2).connect(masterGain);
  lfo.start(t);
  osc.start(t);
  osc2.start(t);

  thinkingNodes = {
    stop: () => {
      const now = ac.currentTime;
      masterGain.gain.linearRampToValueAtTime(0, now + 0.3);
      setTimeout(() => {
        osc.stop();
        osc2.stop();
        lfo.stop();
        thinkingNodes = null;
      }, 350);
    }
  };
}

export function stopThinkingHum(): void {
  thinkingNodes?.stop();
}

// --- Sound: Toggle click ---
export function playToggle(): void {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;

  const osc = ac.createOscillator();
  osc.type = 'square';
  osc.frequency.value = 1200;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.06, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.04);
}

// --- Sound: Expand/collapse panel ---
export function playExpand(): void {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;

  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, t);
  osc.frequency.exponentialRampToValueAtTime(600, t + 0.08);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.06, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.1);
}

export function playCollapse(): void {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;

  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, t);
  osc.frequency.exponentialRampToValueAtTime(300, t + 0.08);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.06, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.1);
}

// =====================================================
// PRELOADER SOUNDS
// =====================================================

// --- Sound: Reactive grid hum ---
// Short tones triggered by mouse movement, pitch/volume based on speed.
let lastGridTone = 0;
const GRID_THROTTLE = 50; // ms between tones

export function playGridTone(speed: number): void {
  if (muted) return;
  const now = Date.now();
  if (now - lastGridTone < GRID_THROTTLE) return;
  lastGridTone = now;

  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;

  const clampedSpeed = Math.min(speed, 35);
  const n = clampedSpeed / 35;
  if (n < 0.05) return; // ignore tiny movements

  const freq = 120 + n * 600;
  const vol = 0.008 + n * 0.035;
  const dur = 0.06 + n * 0.08;

  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.7, t + dur);

  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800 + n * 2500;
  filter.Q.value = 3;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

  osc.connect(filter).connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur);
}

// --- Sound: Type character (preloader) ---
// Slightly different from chat keystroke — more resonant, sci-fi feel
export function playTypeChar(): void {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;

  const osc = ac.createOscillator();
  osc.type = 'square';
  osc.frequency.value = 800 + Math.random() * 400;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.04, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 3000;

  osc.connect(filter).connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.05);
}

// --- Sound: Delete character (preloader) ---
// Softer, lower pitch version of type
export function playDeleteChar(): void {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;

  const osc = ac.createOscillator();
  osc.type = 'square';
  osc.frequency.value = 400 + Math.random() * 200;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.025, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 2000;

  osc.connect(filter).connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.04);
}

// --- Sound: Word cycle complete (name lands) ---
// Satisfying two-note chime
export function playWordLand(): void {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;

  const osc1 = ac.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = 523; // C5

  const osc2 = ac.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = 784; // G5

  const gain1 = ac.createGain();
  gain1.gain.setValueAtTime(0.08, t);
  gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

  const gain2 = ac.createGain();
  gain2.gain.setValueAtTime(0, t + 0.08);
  gain2.gain.linearRampToValueAtTime(0.06, t + 0.1);
  gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

  osc1.connect(gain1).connect(ac.destination);
  osc2.connect(gain2).connect(ac.destination);

  osc1.start(t);
  osc1.stop(t + 0.3);
  osc2.start(t + 0.08);
  osc2.stop(t + 0.4);
}

// --- Sound: Preloader dismiss ---
// Descending sweep with reverb-like tail — portal closing feel
export function playDismiss(): void {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;

  // Main sweep down
  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, t);
  osc.frequency.exponentialRampToValueAtTime(80, t + 0.5);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

  // Noise layer for texture
  const noise = ac.createBufferSource();
  const buf = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 1.5;
  }
  noise.buffer = buf;

  const noiseFilter = ac.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(2000, t);
  noiseFilter.frequency.exponentialRampToValueAtTime(200, t + 0.4);
  noiseFilter.Q.value = 3;

  const noiseGain = ac.createGain();
  noiseGain.gain.setValueAtTime(0.05, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

  osc.connect(gain).connect(ac.destination);
  noise.connect(noiseFilter).connect(noiseGain).connect(ac.destination);

  osc.start(t);
  osc.stop(t + 0.6);
  noise.start(t);
  noise.stop(t + 0.5);
}

// --- Sound: Pulse ring (periodic during preloader) ---
// Subtle low thump synced with visual pulse rings
export function playPulse(): void {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;

  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(100, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.3);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.06, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.4);
}
