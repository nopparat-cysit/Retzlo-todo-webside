/**
 * sound.ts
 * Procedural sound effects via Web Audio API — no external files required.
 * All functions are browser-safe and respect user opt-in preference.
 */

const STORAGE_KEY = "retrod-sound";
const VOLUME_STORAGE_KEY = "retrod-sound-volume";

// ─── Preference helpers ───────────────────────────────────────────────────────

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, String(enabled));
}

export function getSoundVolume(): number {
  if (typeof window === "undefined") return 0.5;
  const val = localStorage.getItem(VOLUME_STORAGE_KEY);
  if (val === null) return 0.5;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0.5 : Math.max(0, Math.min(1, parsed));
}

export function setSoundVolume(volume: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(VOLUME_STORAGE_KEY, String(Math.max(0, Math.min(1, volume))));
}

// ─── AudioContext singleton ───────────────────────────────────────────────────

type VendoredWindow = typeof window & {
  webkitAudioContext?: typeof AudioContext;
};

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctor =
      window.AudioContext ??
      (window as VendoredWindow).webkitAudioContext;
    if (!Ctor) return null;
    return new Ctor();
  } catch {
    return null;
  }
}

// ─── Low-level tone helper ────────────────────────────────────────────────────

function playTone(
  ctx: AudioContext,
  frequency: number,
  startAt: number,
  duration: number,
  volume: number,
  type: OscillatorType = "sine"
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const volumeFactor = getSoundVolume();
  const targetVolume = volume * volumeFactor;

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startAt);

  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(targetVolume, startAt + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startAt);
  osc.stop(startAt + duration + 0.01);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Soft 2-note chime: C5 (523 Hz) then E5 (659 Hz).
 * Each note: 80 ms sine wave at volume 0.18, with 120 ms between onsets.
 */
export function playCardDoneSound(): void {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    playTone(ctx, 523.25, now, 0.08, 0.18);        // C5
    playTone(ctx, 659.25, now + 0.12, 0.08, 0.18); // E5 (+120ms)

    setTimeout(() => void ctx.close(), 600);
  } catch {
    // Audio might be blocked — silently ignore
  }
}

/**
 * Single soft tick: 220 Hz, 40 ms, volume 0.08.
 */
export function playCardCreateSound(): void {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    playTone(ctx, 220, ctx.currentTime, 0.04, 0.08);

    setTimeout(() => void ctx.close(), 300);
  } catch {
    // Audio might be blocked — silently ignore
  }
}

/**
 * Low short buzz: 80 Hz, 60 ms, volume 0.06.
 */
export function playErrorSound(): void {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    playTone(ctx, 80, ctx.currentTime, 0.06, 0.06, "square");

    setTimeout(() => void ctx.close(), 300);
  } catch {
    // Audio might be blocked — silently ignore
  }
}

/**
 * Procedural mechanical typewriter keyboard sounds:
 * - Enter keys trigger a gorgeous vintage carriage return bell.
 * - Standard alphanumeric keys trigger a crisp, organic pop-tick sound.
 */
export function playKeyboardTickSound(isEnter = false): void {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    if (isEnter) {
      // Vintage carriage return bell
      playTone(ctx, 1600, now, 0.24, 0.16, "sine");
      playTone(ctx, 2040, now, 0.16, 0.08, "sine");
    } else {
      // Crisp mechanical tick
      playTone(ctx, 950 + Math.random() * 180, now, 0.012, 0.04, "triangle");
    }

    setTimeout(() => void ctx.close(), 350);
  } catch {
    // Audio might be blocked — silently ignore
  }
}
