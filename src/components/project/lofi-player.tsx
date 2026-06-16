"use client";

import { useEffect, useRef, useState } from "react";
import { CloudRain, Disc, Flame, Volume2, VolumeX, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { playKeyboardTickSound } from "@/lib/sound";

// ─── Procedural Audio Generators ─────────────────────────────────────────────

function generateBrownNoiseBuffer(ctx: AudioContext) {
  const bufferSize = ctx.sampleRate * 2; // 2 seconds loop
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + 0.02 * white) / 1.02;
    lastOut = data[i];
    data[i] *= 3.5; // amplify presence
  }
  return buffer;
}

function generateVinylBuffer(ctx: AudioContext) {
  const bufferSize = ctx.sampleRate * 4; // 4 seconds loop
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    let sample = (Math.random() * 2 - 1) * 0.005; // background thermal hiss

    // dust snaps
    if (Math.random() < 0.00015) {
      const clickType = Math.random();
      if (clickType < 0.3) {
        sample += (Math.random() * 2 - 1) * 0.28;
      } else {
        sample += (Math.random() * 2 - 1) * 0.12;
      }
    }
    data[i] = sample;
  }
  return buffer;
}

function generateFireplaceBuffer(ctx: AudioContext) {
  const bufferSize = ctx.sampleRate * 3; // 3 seconds loop
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    // Pink/Brown rumble background
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + 0.05 * white) / 1.05;
    lastOut = data[i];
    data[i] *= 0.18;

    // Snapping embers
    if (Math.random() < 0.0006) {
      const popSize = Math.random();
      const duration = Math.floor(ctx.sampleRate * (0.002 + Math.random() * 0.003)); // 2-5ms
      for (let j = 0; j < duration && (i + j) < bufferSize; j++) {
        const t = j / duration;
        const snap = (Math.random() * 2 - 1) * Math.exp(-t * 8) * (popSize < 0.2 ? 0.35 : 0.12);
        data[i + j] += snap;
      }
    }
  }
  return buffer;
}

function generateCricketsBuffer(ctx: AudioContext) {
  const bufferSize = ctx.sampleRate * 5; // 5 seconds loop
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  const sampleRate = ctx.sampleRate;
  
  for (let i = 0; i < bufferSize; i++) {
    const sec = i / sampleRate;
    let val = 0;
    
    // Chirping rhythm: chirp cycles every 2 seconds
    const chirpTime = sec % 2.0;
    if (chirpTime < 0.25) {
      // 4 quick amplitude pulses inside the 0.25s chirp window
      const pulseIndex = Math.floor(chirpTime * 16);
      const pulseTime = (chirpTime * 16) % 1.0;
      if (pulseIndex < 4 && pulseTime < 0.6) {
        const carrier = Math.sin(2 * Math.PI * 4600 * sec);
        const env = Math.sin(Math.PI * pulseTime);
        val = carrier * env * 0.07;
      }
    }
    
    // Low background humming bugs
    val += Math.sin(2 * Math.PI * 3000 * sec) * 0.001;
    data[i] = val;
  }
  return buffer;
}

export function LofiPlayer() {
  const [mounted, setMounted] = useState(false);
  
  // States
  const [rainOn, setRainOn] = useState(false);
  const [rainVol, setRainVol] = useState(0.4);
  const [vinylOn, setVinylOn] = useState(false);
  const [vinylVol, setVinylVol] = useState(0.3);
  const [fireOn, setFireOn] = useState(false);
  const [fireVol, setFireVol] = useState(0.3);
  const [cricketsOn, setCricketsOn] = useState(false);
  const [cricketsVol, setCricketsVol] = useState(0.2);

  // Audio Context Ref
  const ctxRef = useRef<AudioContext | null>(null);

  // Refs for nodes
  const rainNodesRef = useRef<{ source: AudioBufferSourceNode; volGain: GainNode; modulator: OscillatorNode } | null>(null);
  const vinylNodesRef = useRef<{ source: AudioBufferSourceNode; volGain: GainNode } | null>(null);
  const fireNodesRef = useRef<{ source: AudioBufferSourceNode; volGain: GainNode } | null>(null);
  const cricketsNodesRef = useRef<{ source: AudioBufferSourceNode; volGain: GainNode } | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (ctxRef.current) {
        void ctxRef.current.close();
      }
    };
  }, []);

  // Keyboard layout tick audio profile hook
  useEffect(() => {
    if (!mounted) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (active && (
        active.tagName === "INPUT" || 
        active.tagName === "TEXTAREA" || 
        (active as HTMLElement).isContentEditable
      )) {
        if (["Shift", "Control", "Alt", "Meta", "CapsLock", "Escape", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
          return;
        }
        const isEnter = e.key === "Enter";
        playKeyboardTickSound(isEnter);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mounted]);

  function initAudioContext(): AudioContext {
    if (!ctxRef.current) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new Ctor();
    }
    if (ctxRef.current.state === "suspended") {
      void ctxRef.current.resume();
    }
    return ctxRef.current;
  }

  // ─── Rain Management ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    if (rainOn) {
      try {
        const ctx = initAudioContext();
        const source = ctx.createBufferSource();
        source.buffer = generateBrownNoiseBuffer(ctx);
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 850;

        const windGain = ctx.createGain();
        windGain.gain.value = 0.8;

        const modulator = ctx.createOscillator();
        modulator.frequency.value = 0.06;
        const modulatorGain = ctx.createGain();
        modulatorGain.gain.value = 0.28;

        modulator.connect(modulatorGain);
        modulatorGain.connect(windGain.gain);
        modulator.start();

        const volGain = ctx.createGain();
        volGain.gain.value = rainVol;

        source.connect(filter);
        filter.connect(windGain);
        windGain.connect(volGain);
        volGain.connect(ctx.destination);

        source.start(0);
        rainNodesRef.current = { source, volGain, modulator };
      } catch (err) {
        console.error("Rain error:", err);
      }
    } else {
      if (rainNodesRef.current) {
        try {
          rainNodesRef.current.source.stop();
          rainNodesRef.current.modulator.stop();
        } catch {}
        rainNodesRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rainOn, mounted]);

  useEffect(() => {
    if (rainNodesRef.current) {
      rainNodesRef.current.volGain.gain.setValueAtTime(rainVol, initAudioContext().currentTime);
    }
  }, [rainVol]);

  // ─── Vinyl Management ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    if (vinylOn) {
      try {
        const ctx = initAudioContext();
        const source = ctx.createBufferSource();
        source.buffer = generateVinylBuffer(ctx);
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 1600;
        filter.Q.value = 0.4;

        const volGain = ctx.createGain();
        volGain.gain.value = vinylVol;

        source.connect(filter);
        filter.connect(volGain);
        volGain.connect(ctx.destination);

        source.start(0);
        vinylNodesRef.current = { source, volGain };
      } catch (err) {
        console.error("Vinyl error:", err);
      }
    } else {
      if (vinylNodesRef.current) {
        try {
          vinylNodesRef.current.source.stop();
        } catch {}
        vinylNodesRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vinylOn, mounted]);

  useEffect(() => {
    if (vinylNodesRef.current) {
      vinylNodesRef.current.volGain.gain.setValueAtTime(vinylVol, initAudioContext().currentTime);
    }
  }, [vinylVol]);

  // ─── Fireplace Management ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    if (fireOn) {
      try {
        const ctx = initAudioContext();
        const source = ctx.createBufferSource();
        source.buffer = generateFireplaceBuffer(ctx);
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 1200;

        const volGain = ctx.createGain();
        volGain.gain.value = fireVol;

        source.connect(filter);
        filter.connect(volGain);
        volGain.connect(ctx.destination);

        source.start(0);
        fireNodesRef.current = { source, volGain };
      } catch (err) {
        console.error("Fireplace error:", err);
      }
    } else {
      if (fireNodesRef.current) {
        try {
          fireNodesRef.current.source.stop();
        } catch {}
        fireNodesRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fireOn, mounted]);

  useEffect(() => {
    if (fireNodesRef.current) {
      fireNodesRef.current.volGain.gain.setValueAtTime(fireVol, initAudioContext().currentTime);
    }
  }, [fireVol]);

  // ─── Crickets Management ───────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    if (cricketsOn) {
      try {
        const ctx = initAudioContext();
        const source = ctx.createBufferSource();
        source.buffer = generateCricketsBuffer(ctx);
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 4500;
        filter.Q.value = 1.0;

        const volGain = ctx.createGain();
        volGain.gain.value = cricketsVol;

        source.connect(filter);
        filter.connect(volGain);
        volGain.connect(ctx.destination);

        source.start(0);
        cricketsNodesRef.current = { source, volGain };
      } catch (err) {
        console.error("Crickets error:", err);
      }
    } else {
      if (cricketsNodesRef.current) {
        try {
          cricketsNodesRef.current.source.stop();
        } catch {}
        cricketsNodesRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cricketsOn, mounted]);

  useEffect(() => {
    if (cricketsNodesRef.current) {
      cricketsNodesRef.current.volGain.gain.setValueAtTime(cricketsVol, initAudioContext().currentTime);
    }
  }, [cricketsVol]);

  if (!mounted) return null;

  const isPlayingAny = rainOn || vinylOn || fireOn || cricketsOn;

  return (
    <section className="lofi-panel flex flex-col rounded-lg p-3 bg-white/[0.015] border-white/5 mt-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-dusk-amber block select-none">Lofi Ambience</span>
          <span className="text-[9px] text-stone-500 block select-none">Procedural late-night deck</span>
        </div>

        {/* Small Audio Visualizer Animation */}
        {isPlayingAny ? (
          <div className="flex items-end gap-0.5 h-3.5 select-none shrink-0" aria-hidden="true">
            <span className="audio-bar-1 w-0.5 h-3 bg-dusk-amber rounded-full origin-bottom" />
            <span className="audio-bar-2 w-0.5 h-4 bg-dusk-lavender rounded-full origin-bottom" />
            <span className="audio-bar-3 w-0.5 h-2.5 bg-dusk-cyan rounded-full origin-bottom" />
          </div>
        ) : (
          <div className="flex items-end gap-0.5 h-3.5 select-none opacity-20 shrink-0" aria-hidden="true">
            <span className="w-0.5 h-1.5 bg-stone-500 rounded-full" />
            <span className="w-0.5 h-2 bg-stone-500 rounded-full" />
            <span className="w-0.5 h-1 bg-stone-500 rounded-full" />
          </div>
        )}
      </div>

      <div className="space-y-2.5 pt-1">
        {/* Rain Deck Item */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setRainOn(!rainOn)}
              className={cn(
                "flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded transition select-none active:scale-[0.98] transition-transform",
                rainOn 
                  ? "bg-dusk-amber/15 text-dusk-amber border border-dusk-amber/30" 
                  : "bg-white/5 text-stone-400 border border-transparent hover:bg-white/10"
              )}
            >
              <CloudRain className="h-3 w-3" />
              Rain Ambience
            </button>
            <span className="text-[10px] text-stone-600 font-mono select-none">
              {rainOn ? `${Math.round(rainVol * 100)}%` : "OFF"}
            </span>
          </div>
          {rainOn && (
            <div className="flex items-center gap-2 px-1">
              <VolumeX className="h-3 w-3 text-stone-600 shrink-0" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={rainVol}
                onChange={(e) => setRainVol(parseFloat(e.target.value))}
                className="retro-slider accent-amber w-full cursor-pointer outline-none transition"
              />
              <Volume2 className="h-3 w-3 text-dusk-amber shrink-0" />
            </div>
          )}
        </div>

        {/* Vinyl Deck Item */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setVinylOn(!vinylOn)}
              className={cn(
                "flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded transition select-none active:scale-[0.98] transition-transform",
                vinylOn 
                  ? "bg-dusk-lavender/15 text-dusk-lavender border border-dusk-lavender/30" 
                  : "bg-white/5 text-stone-400 border border-transparent hover:bg-white/10"
              )}
            >
              <Disc className="h-3 w-3 animate-spin" style={{ animationDuration: vinylOn ? "4s" : "0s" }} />
              Vinyl Crackle
            </button>
            <span className="text-[10px] text-stone-600 font-mono select-none">
              {vinylOn ? `${Math.round(vinylVol * 100)}%` : "OFF"}
            </span>
          </div>
          {vinylOn && (
            <div className="flex items-center gap-2 px-1">
              <VolumeX className="h-3 w-3 text-stone-600 shrink-0" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={vinylVol}
                onChange={(e) => setVinylVol(parseFloat(e.target.value))}
                className="retro-slider accent-lavender w-full cursor-pointer outline-none transition"
              />
              <Volume2 className="h-3 w-3 text-dusk-lavender shrink-0" />
            </div>
          )}
        </div>

        {/* Fireplace Deck Item */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setFireOn(!fireOn)}
              className={cn(
                "flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded transition select-none active:scale-[0.98] transition-transform",
                fireOn 
                  ? "bg-dusk-rose/15 text-dusk-rose border border-dusk-rose/30" 
                  : "bg-white/5 text-stone-400 border border-transparent hover:bg-white/10"
              )}
            >
              <Flame className="h-3 w-3" />
              Warm Fireplace
            </button>
            <span className="text-[10px] text-stone-600 font-mono select-none">
              {fireOn ? `${Math.round(fireVol * 100)}%` : "OFF"}
            </span>
          </div>
          {fireOn && (
            <div className="flex items-center gap-2 px-1">
              <VolumeX className="h-3 w-3 text-stone-600 shrink-0" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={fireVol}
                onChange={(e) => setFireVol(parseFloat(e.target.value))}
                className="retro-slider accent-rose w-full cursor-pointer outline-none transition"
              />
              <Volume2 className="h-3 w-3 text-dusk-rose shrink-0" />
            </div>
          )}
        </div>

        {/* Crickets Deck Item */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCricketsOn(!cricketsOn)}
              className={cn(
                "flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded transition select-none active:scale-[0.98] transition-transform",
                cricketsOn 
                  ? "bg-dusk-cyan/15 text-dusk-cyan border border-dusk-cyan/30" 
                  : "bg-white/5 text-stone-400 border border-transparent hover:bg-white/10"
              )}
            >
              <Leaf className="h-3 w-3" />
              Night Crickets
            </button>
            <span className="text-[10px] text-stone-600 font-mono select-none">
              {cricketsOn ? `${Math.round(cricketsVol * 100)}%` : "OFF"}
            </span>
          </div>
          {cricketsOn && (
            <div className="flex items-center gap-2 px-1">
              <VolumeX className="h-3 w-3 text-stone-600 shrink-0" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={cricketsVol}
                onChange={(e) => setCricketsVol(parseFloat(e.target.value))}
                className="retro-slider accent-cyan w-full cursor-pointer outline-none transition"
              />
              <Volume2 className="h-3 w-3 text-dusk-cyan shrink-0" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
