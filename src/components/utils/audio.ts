// Sound Design Utility using native Web Audio API

let audioCtx: AudioContext | null = null;
let pacingOscillator: OscillatorNode | null = null;
let pacingGainNode: GainNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    // Standard AudioContext initialization
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

/**
 * Plays a soft, clear chime (sine wave with exponential decay).
 * Frequency defaults to 880Hz (A5), which matches the spec's preference for soft, clear cues.
 */
export function playChime(frequency: number = 880, duration: number = 0.8) {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if suspended (browser security policies)
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);

  // Soft envelope: fast attack, exponential decay
  gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05); // low volume to prevent shocking the user
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

/**
 * Starts a rhythmic pacing tone.
 * @param type 'inhale' | 'exhale'
 * @param duration seconds
 */
export function startPacingTone(type: "inhale" | "exhale", duration: number) {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  // Stop any active pacing tones first
  stopPacingTone();

  pacingOscillator = ctx.createOscillator();
  pacingGainNode = ctx.createGain();

  pacingOscillator.type = "sine";

  const now = ctx.currentTime;

  if (type === "inhale") {
    // Inhale is a rising tone/swell (e.g. A3 to C#4: 220Hz to 277Hz)
    pacingOscillator.frequency.setValueAtTime(220, now);
    pacingOscillator.frequency.linearRampToValueAtTime(277, now + duration);

    // Swell gain
    pacingGainNode.gain.setValueAtTime(0.001, now);
    pacingGainNode.gain.linearRampToValueAtTime(0.08, now + duration);
  } else {
    // Exhale is a falling tone/fade out (e.g. D4 to A3: 293Hz to 220Hz)
    pacingOscillator.frequency.setValueAtTime(293.66, now);
    pacingOscillator.frequency.linearRampToValueAtTime(220, now + duration);

    // Fade out gain
    pacingGainNode.gain.setValueAtTime(0.08, now);
    pacingGainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
  }

  pacingOscillator.connect(pacingGainNode);
  pacingGainNode.connect(ctx.destination);

  pacingOscillator.start(now);
}

/**
 * Stops any playing pacing tone.
 */
export function stopPacingTone() {
  if (pacingOscillator) {
    try {
      pacingOscillator.stop();
      pacingOscillator.disconnect();
    } catch (e) {
      // already stopped or not started
    }
    pacingOscillator = null;
  }
  if (pacingGainNode) {
    pacingGainNode.disconnect();
    pacingGainNode = null;
  }
}
