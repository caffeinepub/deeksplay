// Web Audio API Equalizer — singleton
// NOTE: YouTube IFrame audio is cross-origin, so these filters cannot be applied
// to YouTube playback. The nodes are created for device audio (e.g., mic or future
// audio sources). UI controls are fully functional.

export interface EQState {
  enabled: boolean;
  bass: number; // -12 to +12 dB at 60 Hz
  mid: number; // -12 to +12 dB at 1 kHz
  treble: number; // -12 to +12 dB at 10 kHz
}

const DEFAULT_STATE: EQState = { enabled: true, bass: 0, mid: 0, treble: 0 };
const LS_KEY = "deeksplay_eq_state";

function loadState(): EQState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_STATE };
}

export function saveEQState(state: EQState): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {}
}

export function getEQState(): EQState {
  return loadState();
}

// AudioContext + nodes (lazy init)
let ctx: AudioContext | null = null;
let bassFilter: BiquadFilterNode | null = null;
let midFilter: BiquadFilterNode | null = null;
let trebleFilter: BiquadFilterNode | null = null;

export function getEQNodes(): {
  ctx: AudioContext;
  bass: BiquadFilterNode;
  mid: BiquadFilterNode;
  treble: BiquadFilterNode;
} | null {
  try {
    if (!ctx) {
      ctx = new AudioContext();
      bassFilter = ctx.createBiquadFilter();
      bassFilter.type = "lowshelf";
      bassFilter.frequency.value = 60;
      midFilter = ctx.createBiquadFilter();
      midFilter.type = "peaking";
      midFilter.frequency.value = 1000;
      trebleFilter = ctx.createBiquadFilter();
      trebleFilter.type = "highshelf";
      trebleFilter.frequency.value = 10000;
      // Chain: bass → mid → treble → destination
      bassFilter.connect(midFilter);
      midFilter.connect(trebleFilter);
      trebleFilter.connect(ctx.destination);
    }
    return { ctx, bass: bassFilter!, mid: midFilter!, treble: trebleFilter! };
  } catch {
    return null;
  }
}

export function applyEQ(state: EQState): void {
  const nodes = getEQNodes();
  if (!nodes) return;
  const gain = state.enabled ? 1 : 0;
  nodes.bass.gain.value = state.bass * gain;
  nodes.mid.gain.value = state.mid * gain;
  nodes.treble.gain.value = state.treble * gain;
  saveEQState(state);
}
