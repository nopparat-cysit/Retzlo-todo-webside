"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { 
  ArrowRight, 
  Sparkles, 
  Kanban, 
  Calendar, 
  DollarSign, 
  Play, 
  Pause, 
  Music, 
  Layers, 
  ChevronRight, 
  CheckCircle2, 
  Volume2,
  Menu,
  X,
  Tv,
  Coffee,
  Disc
} from "lucide-react";

// Types for cursor particles
interface Particle {
  id: number;
  x: number;
  y: number;
  char: string;
  color: string;
  size: number;
  rot: number;
  opacity: number;
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [crtMode, setCrtMode] = useState(true); // Default CRT mode ON for lofi vibes
  const [steamHovered, setSteamHovered] = useState(false);

  // Parallax tilt states for elements
  const [heroTilt, setHeroTilt] = useState({ rx: 0, ry: 0 });
  const [bentoTilt1, setBentoTilt1] = useState({ rx: 0, ry: 0 });
  const [bentoTilt2, setBentoTilt2] = useState({ rx: 0, ry: 0 });
  const [bentoTilt3, setBentoTilt3] = useState({ rx: 0, ry: 0 });
  const [bentoTilt4, setBentoTilt4] = useState({ rx: 0, ry: 0 });

  // Cursor trails particles state
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdCounter = useRef(0);

  // VU Meter state
  const [vuLevelL, setVuLevelL] = useState(15);
  const [vuLevelR, setVuLevelR] = useState(25);

  // Synthesizer Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{
    oscillators: OscillatorNode[];
    gainNode: GainNode;
    filterNode: BiquadFilterNode;
    noiseNode: AudioWorkletNode | ScriptProcessorNode | AudioBufferSourceNode | null;
  } | null>(null);

  // Track Mouse Trail
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (Math.random() > 0.35) return; // Limit particles density

      const stars = ["✦", "✧", "★", "•"];
      const colors = ["#a9a2ff", "#e5bd72", "#89c7d6", "#d59ab3"];
      const newParticle: Particle = {
        id: particleIdCounter.current++,
        x: e.clientX,
        y: e.clientY,
        char: stars[Math.floor(Math.random() * stars.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.floor(Math.random() * 12) + 8,
        rot: Math.random() * 360,
        opacity: 1
      };

      setParticles((prev) => [...prev.slice(-35), newParticle]); // Cap at 35 particles
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Update particles fade out
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) => 
        prev
          .map((p) => ({
            ...p,
            y: p.y + 1.2, // Drift downward
            rot: p.rot + 1.5,
            opacity: p.opacity - 0.05
          }))
          .filter((p) => p.opacity > 0)
      );
    }, 45);
    return () => clearInterval(interval);
  }, []);

  // Parallax Tilt Function
  const handleTilt = (
    e: React.MouseEvent<HTMLDivElement>, 
    setTilt: React.Dispatch<React.SetStateAction<{ rx: number; ry: number }>>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Rotate max 8 degrees
    const rx = -(y / (rect.height / 2)) * 8;
    const ry = (x / (rect.width / 2)) * 8;
    setTilt({ rx, ry });
  };

  const resetTilt = (setTilt: React.Dispatch<React.SetStateAction<{ rx: number; ry: number }>>) => {
    setTilt({ rx: 0, ry: 0 });
  };

  // Web Audio Lofi Synth Loop
  const startSynth = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;

      // Master output volume control
      const masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.18, audioCtx.currentTime); // Low output level for background lofi

      // Lowpass Filter node for cozy muffled vibe
      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, audioCtx.currentTime); // Cutoff 450Hz
      filter.Q.setValueAtTime(1, audioCtx.currentTime);

      filter.connect(masterGain);
      masterGain.connect(audioCtx.destination);

      // Play tape click sound effect
      const clickOsc = audioCtx.createOscillator();
      const clickGain = audioCtx.createGain();
      clickOsc.type = "sine";
      clickOsc.frequency.setValueAtTime(120, audioCtx.currentTime);
      clickOsc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.08);
      clickGain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      clickGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.08);
      clickOsc.connect(clickGain);
      clickGain.connect(audioCtx.destination);
      clickOsc.start();
      clickOsc.stop(audioCtx.currentTime + 0.08);

      // Create warm lofi chord oscillators
      // Mellow chord progression (Cmaj7 -> Am7 -> Dm7 -> G7)
      const chords = [
        [130.81, 164.81, 196.00, 246.94], // C3, E3, G3, B3 (Cmaj7)
        [110.00, 130.81, 164.81, 196.00], // A2, C3, E3, G3 (Am7)
        [146.83, 174.61, 220.00, 261.63], // D3, F3, A3, C4 (Dm7)
        [98.00,  123.47, 146.83, 174.61]  // G2, B2, D3, F3 (G7)
      ];

      const oscillators: OscillatorNode[] = [];
      const oscGains: GainNode[] = [];

      // Create 4 oscillators for the 4 voices of a chord
      for (let i = 0; i < 4; i++) {
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();
        
        // Triangle wave for smooth, warm flute-like tones
        osc.type = "triangle";
        oscGain.gain.setValueAtTime(0, audioCtx.currentTime); // Start quiet

        osc.connect(oscGain);
        oscGain.connect(filter);
        
        osc.start();

        oscillators.push(osc);
        oscGains.push(oscGain);
      }

      // Vinyl crackle noise buffer
      const bufferSize = audioCtx.sampleRate * 2; // 2 seconds buffer
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      // Generate vinyl pops and rain crackle math-wise
      for (let i = 0; i < bufferSize; i++) {
        const randomVal = Math.random() * 2 - 1;
        // White noise base
        let val = randomVal * 0.008;
        
        // Random pops
        if (Math.random() > 0.9995) {
          // Sharp impulse pop
          val += (Math.random() > 0.5 ? 0.35 : -0.35);
        }
        output[i] = val;
      }

      const noiseSource = audioCtx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.12, audioCtx.currentTime); // soft volume
      noiseSource.connect(noiseGain);
      noiseGain.connect(masterGain);
      noiseSource.start();

      let currentChordIdx = 0;

      // Function to trigger chord transitions
      const playChord = () => {
        const chord = chords[currentChordIdx];
        const transitionTime = 0.8; // smooth fade in/out

        oscillators.forEach((osc, idx) => {
          const freq = chord[idx];
          // Detune slightly for lofi chorus/wow-flutter effect
          const detuneVal = (Math.random() * 12) - 6;

          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          osc.detune.setValueAtTime(detuneVal, audioCtx.currentTime);

          // Voice fade-in
          const targetVoiceGain = 0.28;
          oscGains[idx].gain.cancelScheduledValues(audioCtx.currentTime);
          oscGains[idx].gain.setValueAtTime(oscGains[idx].gain.value, audioCtx.currentTime);
          oscGains[idx].gain.linearRampToValueAtTime(targetVoiceGain, audioCtx.currentTime + transitionTime);
        });

        // Modulate filter cutoff slowly over time (warm sweeps)
        const nextSweepFreq = 380 + Math.random() * 140;
        filter.frequency.linearRampToValueAtTime(nextSweepFreq, audioCtx.currentTime + 3.5);

        currentChordIdx = (currentChordIdx + 1) % chords.length;
      };

      // Loop chord scheduling
      playChord();
      const chordScheduler = setInterval(() => {
        if (audioCtx.state === "suspended") return;
        playChord();
      }, 4000);

      synthNodesRef.current = {
        oscillators,
        gainNode: masterGain,
        filterNode: filter,
        noiseNode: noiseSource
      };

      // Store scheduler interval on the context object so we can clear it
      (audioCtx as any)._chordScheduler = chordScheduler;

    } catch (err) {
      console.error("Failed to start Web Audio Synthesizer:", err);
    }
  };

  const stopSynth = () => {
    if (audioCtxRef.current) {
      // Play stop mechanical click
      try {
        const clickOsc = audioCtxRef.current.createOscillator();
        const clickGain = audioCtxRef.current.createGain();
        clickOsc.type = "sine";
        clickOsc.frequency.setValueAtTime(90, audioCtxRef.current.currentTime);
        clickOsc.frequency.linearRampToValueAtTime(20, audioCtxRef.current.currentTime + 0.05);
        clickGain.gain.setValueAtTime(0.3, audioCtxRef.current.currentTime);
        clickGain.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 0.05);
        clickOsc.connect(clickGain);
        clickGain.connect(audioCtxRef.current.destination);
        clickOsc.start();
        clickOsc.stop(audioCtxRef.current.currentTime + 0.05);
      } catch (e) {}

      // Clear progression timer
      if ((audioCtxRef.current as any)._chordScheduler) {
        clearInterval((audioCtxRef.current as any)._chordScheduler);
      }

      // Close context
      audioCtxRef.current.close();
      audioCtxRef.current = null;
      synthNodesRef.current = null;
    }
  };

  // Toggle Synthesizer play state
  const handlePlayToggle = () => {
    if (isPlaying) {
      stopSynth();
      setIsPlaying(false);
    } else {
      startSynth();
      setIsPlaying(true);
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        if ((audioCtxRef.current as any)._chordScheduler) {
          clearInterval((audioCtxRef.current as any)._chordScheduler);
        }
        audioCtxRef.current.close();
      }
    };
  }, []);

  // VU needle animation loop when active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setVuLevelL(Math.floor(Math.random() * 45) + 12);
        setVuLevelR(Math.floor(Math.random() * 50) + 15);
      }, 100);
    } else {
      setVuLevelL(5);
      setVuLevelR(5);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <main className="min-h-screen bg-[#080817] text-stone-100 font-sans relative overflow-hidden selection:bg-[#a9a2ff]/30 selection:text-white">
      
      {/* ── Background Glow Orbs ────────────────────────────────────────── */}
      <div className="retzlo-hero-orb-1" />
      <div className="retzlo-hero-orb-2" />
      <div className="retzlo-hero-orb-3" />
      
      {/* ── Grid Pattern Overlay ────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* ── Background Shooting Grid Beams ─────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="retzlo-grid-beam-x top-[20%] w-[200px]" style={{ animationDelay: "0s", animationDuration: "8s" }} />
        <div className="retzlo-grid-beam-x top-[60%] w-[150px]" style={{ animationDelay: "3s", animationDuration: "11s" }} />
        <div className="retzlo-grid-beam-y left-[30%] h-[180px]" style={{ animationDelay: "1s", animationDuration: "10s" }} />
        <div className="retzlo-grid-beam-y left-[75%] h-[220px]" style={{ animationDelay: "5s", animationDuration: "13s" }} />
      </div>

      {/* ── Floating Cursor Sparkle Trail Elements ────────────────────── */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute pointer-events-none z-50 select-none transition-opacity duration-300 font-mono"
          style={{
            left: p.x,
            top: p.y,
            color: p.color,
            fontSize: `${p.size}px`,
            transform: `translate(-50%, -50%) rotate(${p.rot}deg)`,
            opacity: p.opacity,
            textShadow: `0 0 10px ${p.color}`
          }}
        >
          {p.char}
        </span>
      ))}

      {/* ── Navigation Bar ────────────────────────────────────────────── */}
      <nav className="retzlo-nav px-6 py-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div 
                className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#a9a2ff] to-[#e5bd72] flex items-center justify-center font-bold text-[#080817] text-sm shadow-md transition-transform duration-300 group-hover:rotate-[360deg] group-hover:scale-110"
                style={{ transformStyle: "preserve-3d" }}
              >
                R
              </div>
              <span className="font-bold text-xl tracking-wider text-white relative">
                Retzlo
                <span className="absolute -top-1 -right-2 w-1.5 h-1.5 rounded-full bg-[#e5bd72] animate-pulse" />
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6 text-sm text-stone-300 font-medium">
              <a href="#features" className="hover:text-[#a9a2ff] transition-colors">Features</a>
              <a href="#lofi-focus" className="hover:text-[#a9a2ff] transition-colors">Focus Station</a>
              <a href="#tech" className="hover:text-[#a9a2ff] transition-colors">Stack</a>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="px-4 py-2 text-sm text-stone-300 hover:text-white font-medium transition-colors">
              Sign In
            </Link>
            <Link href="/select-module">
              <button className="retzlo-cta-ghost px-5 py-2.5 text-xs font-semibold uppercase tracking-wider">
                Enter Workspace
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-stone-300 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-[73px] left-0 right-0 border-b border-white/5 bg-[#0b0b20]/95 backdrop-blur-xl px-6 py-6 space-y-4 animate-fade-in">
            <a 
              href="#features" 
              className="block text-stone-200 hover:text-[#a9a2ff] py-2 border-b border-white/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#lofi-focus" 
              className="block text-stone-200 hover:text-[#a9a2ff] py-2 border-b border-white/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              Focus Station
            </a>
            <a 
              href="#tech" 
              className="block text-stone-200 hover:text-[#a9a2ff] py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Stack
            </a>
            <div className="pt-4 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full text-center py-2.5 text-sm text-stone-300 hover:text-white transition-colors">
                  Sign In
                </button>
              </Link>
              <Link href="/select-module" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full text-center bg-[#a9a2ff] text-[#080817] font-semibold py-2.5 rounded-lg text-sm">
                  Enter Workspace
                </button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 pt-32 pb-20 md:pt-40 md:pb-28">
        
        {/* Floating CRT Toggle Button */}
        <div className="absolute top-28 right-6 z-20 hidden sm:block">
          <button 
            onClick={() => setCrtMode(!crtMode)}
            className={`px-4 py-2 text-xs font-mono rounded-lg border flex items-center gap-2 backdrop-blur-md transition-all ${
              crtMode 
                ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400" 
                : "bg-white/5 border-white/10 text-stone-400"
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            CRT Vibe: {crtMode ? "ON" : "OFF"}
          </button>
        </div>

        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex justify-center">
            <div className="retzlo-badge">
              <span className="retzlo-badge-dot" />
              <span>Introducing Retzlo 1.0</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight retzlo-fade-up-d1">
            The calm workspace for <br className="hidden sm:inline" />
            <span className="retzlo-gradient-text py-1 inline-block">work &amp; finance.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-stone-300 max-w-xl mx-auto leading-relaxed retzlo-fade-up-d2">
            A nostalgic retro-lofi command center. Manage project tasks in Kanban boards, sync key dates in Calendar, and budget ledger records in one harmonized interface.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 retzlo-fade-up-d3">
            <Link href="/select-module">
              <button className="retzlo-cta-primary px-8 py-3.5 flex items-center gap-2 group text-sm">
                Enter Workspace
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/register">
              <button className="retzlo-cta-ghost px-6 py-3.5 text-sm">
                Create Free Account
              </button>
            </Link>
          </div>
        </div>

        {/* Dashboard Mockup 3D Perspective Preview */}
        <div 
          className="mt-16 md:mt-24 max-w-5xl mx-auto px-4 retzlo-fade-up-d4"
          onMouseMove={(e) => handleTilt(e, setHeroTilt)}
          onMouseLeave={() => resetTilt(setHeroTilt)}
        >
          <div 
            className="perspective-3d-card border-beam-wrapper rounded-2xl"
            style={{
              transform: `perspective(1000px) rotateX(${heroTilt.rx}deg) rotateY(${heroTilt.ry}deg) scale3d(1.008, 1.008, 1.008)`,
              boxShadow: isPlaying 
                ? "0 45px 120px rgba(169, 162, 255, 0.22), 0 0 100px rgba(229, 189, 114, 0.08)"
                : "0 35px 100px rgba(0,0,0,0.6)"
            }}
          >
            {/* Shimmer Border Beam */}
            <div className="absolute inset-0 bg-[#080817] z-[-1] rounded-2xl" />
            
            <div className={`crt-screen-overlay rounded-2xl ${crtMode ? "active" : ""}`}>
              <div className="bg-[#111029]/90 px-4 py-3 border-b border-white/5 flex items-center gap-2 select-none">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="mx-auto text-xs text-stone-500 font-mono tracking-wider">
                  retzlo-dashboard-v1.0.exe {crtMode ? "[CRT Mode Active]" : ""}
                </div>
              </div>
              <div className={`relative aspect-[16/9] w-full bg-[#0a091a] crt-screen-chromatic ${crtMode ? "active" : ""}`}>
                <Image
                  src="/brand/retzlo-hero-mockup.png"
                  alt="Retzlo Platform Dashboard Mockup"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech Stack Infinite Marquee ───────────────────────────────── */}
      <section id="tech" className="border-y border-white/[0.04] bg-white/[0.01] py-8 overflow-hidden select-none">
        <div className="max-w-7xl mx-auto px-6">
          <div className="retzlo-marquee-track">
            {/* Slide block 1 */}
            <div className="flex items-center gap-12 text-xs font-mono tracking-widest text-stone-500 uppercase">
              <span>Next.js 14 App Router</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#a9a2ff]" />
              <span>Prisma ORM Database Schema</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#e5bd72]" />
              <span>Supabase PostgreSQL Engine</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#89c7d6]" />
              <span>Tailwind CSS Styling</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#d59ab3]" />
              <span>NextAuth Credentials</span>
              <span className="w-1.5 h-1.5 rounded-full bg-stone-700" />
              <span>Cozy Lofi Customizations</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#a9a2ff]" />
            </div>
            {/* Duplicate slide block for infinite animation */}
            <div className="flex items-center gap-12 text-xs font-mono tracking-widest text-stone-500 uppercase pl-12">
              <span>Next.js 14 App Router</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#a9a2ff]" />
              <span>Prisma ORM Database Schema</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#e5bd72]" />
              <span>Supabase PostgreSQL Engine</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#89c7d6]" />
              <span>Tailwind CSS Styling</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#d59ab3]" />
              <span>NextAuth Credentials</span>
              <span className="w-1.5 h-1.5 rounded-full bg-stone-700" />
              <span>Cozy Lofi Customizations</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#a9a2ff]" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Bento Grid with 3D Tilt and Border Beams ────────── */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 md:py-32 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Designed for the <span className="text-[#a9a2ff]">late-night builder</span>
          </h2>
          <p className="text-stone-400 text-sm md:text-base leading-relaxed">
            Beautifully modular workspaces that feel organic, cozy, and completely tailored to your daily focus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Kanban Board */}
          <div 
            className="border-beam-wrapper rounded-2xl md:col-span-2"
            onMouseMove={(e) => handleTilt(e, setBentoTilt1)}
            onMouseLeave={() => resetTilt(setBentoTilt1)}
            style={{ transform: `perspective(800px) rotateX(${bentoTilt1.rx}deg) rotateY(${bentoTilt1.ry}deg)` }}
          >
            <div className="bg-[#111029]/80 h-full p-8 flex flex-col justify-between min-h-[320px] rounded-2xl border border-white/5 relative z-10">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#a9a2ff]/10 border border-[#a9a2ff]/20 flex items-center justify-center text-[#a9a2ff] group-hover:scale-110 transition-transform">
                  <Kanban className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-2xl font-semibold text-white">Interactive Kanban Boards</h3>
                <p className="text-stone-400 text-sm leading-relaxed max-w-xl">
                  Organize projects with zero friction. Create boards, drag-and-drop tasks, set status lanes, assign priorities, and watch updates persist instantly via optimistic client-side UI cycles.
                </p>
              </div>
              <div className="pt-6 flex items-center gap-2 text-xs font-mono text-[#a9a2ff] cursor-pointer group">
                <span>EXPLORE WORK MODULE</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 2: Calendar Engine */}
          <div 
            className="border-beam-wrapper rounded-2xl"
            onMouseMove={(e) => handleTilt(e, setBentoTilt2)}
            onMouseLeave={() => resetTilt(setBentoTilt2)}
            style={{ transform: `perspective(800px) rotateX(${bentoTilt2.rx}deg) rotateY(${bentoTilt2.ry}deg)` }}
          >
            <div className="bg-[#111029]/80 h-full p-8 flex flex-col justify-between min-h-[320px] rounded-2xl border border-white/5 relative z-10">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#e5bd72]/10 border border-[#e5bd72]/20 flex items-center justify-center text-[#e5bd72] group-hover:-rotate-6 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white">Sync Due Dates</h3>
                <p className="text-stone-400 text-sm leading-relaxed">
                  A unified calendar view. Task due dates mapped out across a tidy grid, giving you visual perspective on what&apos;s due tomorrow, next week, or deep in memory lane.
                </p>
              </div>
              <div className="pt-6 flex items-center gap-2 text-xs font-mono text-[#e5bd72] cursor-pointer group">
                <span>VIEW SCHEDULES</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 3: Personal Finance */}
          <div 
            className="border-beam-wrapper rounded-2xl"
            onMouseMove={(e) => handleTilt(e, setBentoTilt3)}
            onMouseLeave={() => resetTilt(setBentoTilt3)}
            style={{ transform: `perspective(800px) rotateX(${bentoTilt3.rx}deg) rotateY(${bentoTilt3.ry}deg)` }}
          >
            <div className="bg-[#111029]/80 h-full p-8 flex flex-col justify-between min-h-[320px] rounded-2xl border border-white/5 relative z-10">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#89c7d6]/10 border border-[#89c7d6]/20 flex items-center justify-center text-[#89c7d6] group-hover:translate-y-[-2px] transition-transform">
                  <DollarSign className="w-6 h-6 animate-bounce" />
                </div>
                <h3 className="text-xl font-semibold text-white">Double-Entry Ledgers</h3>
                <p className="text-stone-400 text-sm leading-relaxed">
                  Log income, track recurring subscriptions, set budgets, and display balances. Curated to look like a physical accounting booklet with tactile pastel colors.
                </p>
              </div>
              <div className="pt-6 flex items-center gap-2 text-xs font-mono text-[#89c7d6] cursor-pointer group">
                <span>EXPLORE FINANCE MODULE</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 4: Retro Aesthetics / Customizations */}
          <div 
            className="border-beam-wrapper rounded-2xl md:col-span-2"
            onMouseMove={(e) => handleTilt(e, setBentoTilt4)}
            onMouseLeave={() => resetTilt(setBentoTilt4)}
            style={{ transform: `perspective(800px) rotateX(${bentoTilt4.rx}deg) rotateY(${bentoTilt4.ry}deg)` }}
          >
            <div className="bg-[#111029]/80 h-full p-8 flex flex-col justify-between min-h-[320px] rounded-2xl border border-white/5 relative z-10">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#d59ab3]/10 border border-[#d59ab3]/20 flex items-center justify-center text-[#d59ab3] group-hover:scale-105 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-semibold text-white">Retro Lofi Theme Engine</h3>
                <p className="text-stone-400 text-sm leading-relaxed max-w-xl">
                  Cozy design tokens built for developers, designers, and late-night enthusiasts. Soft gradients, glass panels, subtle border trims, and glow effects that make typing a satisfying habit.
                </p>
              </div>
              <div className="pt-6 flex items-center gap-2 text-xs font-mono text-[#d59ab3] cursor-pointer group">
                <span>DISCOVER PALETTES</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

        </div>
      </section>

      <div className="retzlo-section-line" />

      {/* ── Focus Station Interactive Cassette Player ─────────────────── */}
      <section id="lofi-focus" className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#a9a2ff]/20 bg-[#a9a2ff]/5 px-3 py-1.5 text-xs text-[#a9a2ff] font-mono uppercase tracking-widest">
              <Music className="w-3.5 h-3.5" />
              Focus Companion
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Get in the zone with <br />
              <span className="text-[#e5bd72]">Retzlo Cassette Radio</span>
            </h2>
            <p className="text-stone-400 text-sm md:text-base leading-relaxed">
              Every productive session needs a calm soundtrack. Retzlo integrates ambient audio support directly inside your header tools. Toggle focus mode and work with synthesized background rhythms.
            </p>
            
            {/* Interactive Coffee Steam Entity */}
            <div 
              className="p-4 rounded-xl border border-white/5 bg-[#14122d]/65 backdrop-blur-md inline-flex items-center gap-4 cursor-default select-none relative group"
              onMouseEnter={() => setSteamHovered(true)}
              onMouseLeave={() => setSteamHovered(false)}
            >
              <div className="relative">
                <Coffee className="w-8 h-8 text-[#e5bd72] transition-transform duration-300 group-hover:scale-110" />
                
                {/* SVG Steam Wave Particles */}
                <svg className="absolute -top-6 left-1.5 w-6 h-6 overflow-visible pointer-events-none" viewBox="0 0 24 24">
                  <path 
                    className={`coffee-steam-path stroke-[#e5bd72] stroke-2 fill-none ${steamHovered ? "running" : ""}`} 
                    d="M 6,24 C 6,18 10,14 10,10 C 10,6 6,4 6,0" 
                    style={{ animationDuration: "3.5s" }}
                  />
                  <path 
                    className={`coffee-steam-path stroke-[#a9a2ff] stroke-2 fill-none ${steamHovered ? "running" : ""}`} 
                    d="M 12,24 C 12,19 8,16 8,11 C 8,6 12,4 12,0" 
                    style={{ animationDuration: "5s", animationDelay: "1s" }}
                  />
                  <path 
                    className={`coffee-steam-path stroke-[#89c7d6] stroke-2 fill-none ${steamHovered ? "running" : ""}`} 
                    d="M 18,24 C 18,17 14,14 14,9 C 14,4 18,3 18,0" 
                    style={{ animationDuration: "4s", animationDelay: "0.5s" }}
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-white uppercase tracking-wider">Mellow Focus Brew</p>
                <p className="text-[10px] text-stone-500 font-mono">Hover to release hot lofi steam</p>
              </div>
            </div>

            <ul className="space-y-3 pt-2">
              {[
                "Synthesized chord loop player (Web Audio API)",
                "Soft crackle vinyl tape noise filter",
                "Fully interactive spinning spools cassette animation",
                "Needle VU meters bouncing in sync"
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-stone-300">
                  <CheckCircle2 className="w-5 h-5 text-[#89c7d6] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Player Showcase Cassette Card */}
          <div className="flex justify-center">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-[#1d1a37]/80 to-[#121024]/90 p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              
              <div className="flex items-center justify-between pb-6 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-stone-500" />
                  <span className="text-xs font-mono uppercase tracking-widest text-stone-500">Focus Channel</span>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isPlaying ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse" : "bg-stone-600"}`} />
              </div>

              {/* ── Vintage Cassette Deck HTML Illustration ────────────────── */}
              <div className="my-8 bg-[#090817] border-2 border-white/10 rounded-xl p-4 relative overflow-hidden">
                {/* Cassette Slot Window */}
                <div className="relative h-32 bg-[#121022] rounded-lg border border-white/5 overflow-hidden flex items-center justify-center">
                  
                  {/* Backdrop lights */}
                  <div className={`absolute inset-0 transition-opacity duration-500 bg-[#a9a2ff]/5 ${isPlaying ? "opacity-100" : "opacity-0"}`} />

                  {/* Cassette Tape itself */}
                  <div className={`w-48 h-28 bg-[#18172e] border border-white/10 rounded-md relative flex flex-col justify-between p-2 shadow-inner transition-transform duration-700 ${
                    isPlaying ? "translate-y-0 scale-100" : "translate-y-4 scale-95 opacity-80"
                  }`}>
                    {/* Cassette Label */}
                    <div className="h-10 bg-gradient-to-r from-[#a9a2ff]/20 via-[#e5bd72]/20 to-[#d59ab3]/20 border border-white/10 rounded flex items-center justify-center">
                      <span className="text-[10px] font-mono tracking-widest text-[#a9a2ff] uppercase">RETZLO TAPE C-60</span>
                    </div>

                    {/* Spool Windows */}
                    <div className="flex justify-around items-center my-1.5">
                      {/* Left Spool */}
                      <div className="w-10 h-10 rounded-full bg-[#090817] border border-white/10 flex items-center justify-center relative">
                        <Disc className={`w-8 h-8 text-stone-500 ${isPlaying ? "animate-spin [animation-duration:8s]" : ""}`} />
                        <div className="absolute w-2 h-2 rounded-full bg-[#121022]" />
                      </div>

                      {/* Center window */}
                      <div className="w-12 h-6 bg-[#090817]/80 rounded border border-white/5 flex items-center justify-center font-mono text-[9px] text-stone-600">
                        {isPlaying ? "PLAYING" : "STOPPED"}
                      </div>

                      {/* Right Spool */}
                      <div className="w-10 h-10 rounded-full bg-[#090817] border border-white/10 flex items-center justify-center relative">
                        <Disc className={`w-8 h-8 text-stone-500 ${isPlaying ? "animate-spin [animation-duration:8s]" : ""}`} />
                        <div className="absolute w-2 h-2 rounded-full bg-[#121022]" />
                      </div>
                    </div>

                    {/* Bottom tape teeth holes */}
                    <div className="h-4 bg-[#0d0c1b] rounded flex justify-center gap-4 items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#090817]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#090817]" />
                    </div>
                  </div>
                </div>

                {/* Analog needle VU Meters */}
                <div className="flex gap-4 mt-4 px-2">
                  {/* Left VU */}
                  <div className="flex-1 bg-[#121022] border border-white/5 rounded p-2 relative h-10 overflow-hidden">
                    <div className="absolute left-2 top-1 font-mono text-[8px] text-stone-500">VU-L</div>
                    {/* Needle */}
                    <div 
                      className="absolute bottom-0 left-1/2 w-0.5 h-8 bg-rose-500 origin-bottom transition-transform duration-100"
                      style={{ transform: `translateX(-50%) rotate(${vuLevelL - 30}deg)` }}
                    />
                  </div>
                  {/* Right VU */}
                  <div className="flex-1 bg-[#121022] border border-white/5 rounded p-2 relative h-10 overflow-hidden">
                    <div className="absolute left-2 top-1 font-mono text-[8px] text-stone-500">VU-R</div>
                    {/* Needle */}
                    <div 
                      className="absolute bottom-0 left-1/2 w-0.5 h-8 bg-rose-500 origin-bottom transition-transform duration-100"
                      style={{ transform: `translateX(-50%) rotate(${vuLevelR - 30}deg)` }}
                    />
                  </div>
                </div>
              </div>

              {/* Player control button */}
              <button 
                onClick={handlePlayToggle}
                className={`w-full py-4 rounded-xl font-semibold text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                  isPlaying 
                    ? "bg-rose-500/10 border border-rose-500/25 text-rose-300 hover:bg-rose-500/20" 
                    : "bg-[#a9a2ff] text-[#080817] hover:scale-[1.02] shadow-lg shadow-[#a9a2ff]/10"
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Stop Tape Radio</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play Focus Beats</span>
                  </>
                )}
              </button>
              
              <p className="text-center text-[10px] text-stone-500 font-mono mt-4">
                {isPlaying 
                  ? "Playing live synthesized warm Lofi pads & vinyl pops..." 
                  : "Requires Web Audio. Synthesizes sounds dynamically."}
              </p>
            </div>
          </div>

        </div>
      </section>

      <div className="retzlo-section-line" />

      {/* ── Testimonials Section ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24 md:py-32 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl font-bold text-white">Focus reviews from our community</h2>
          <p className="text-stone-400 text-sm">What designers and developers are saying about their modular lofi workspace.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "The interface makes me actually want to log in and organize. The retro design combined with the snappy due date calendar hits a sweet spot that regular corporate tools miss.",
              author: "Nora V.",
              role: "Creative Director"
            },
            {
              quote: "Having double-entry style ledger books next to my project boards saves so much cognitive load. The lofi look is easy on my eyes during long coding sessions.",
              author: "Alex Chen",
              role: "Fullstack Engineer"
            },
            {
              quote: "Beautiful colors, smooth animations, and no useless clutter. Optimistic updates are super fast. Retzlo has become my quiet default homepage.",
              author: "Patsara M.",
              role: "Senior UX Designer"
            }
          ].map((item, i) => (
            <div key={i} className="retzlo-quote-card p-8 flex flex-col justify-between">
              <p className="text-stone-300 text-sm leading-relaxed italic">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="pt-6 border-t border-white/5 mt-6 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">{item.author}</div>
                  <div className="text-xs text-stone-500">{item.role}</div>
                </div>
                <div className="w-6 h-6 rounded bg-stone-800 flex items-center justify-center text-[10px] text-stone-400 font-mono">
                  0{i + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final Call to Action Section ──────────────────────────────── */}
      <section className="relative border-t border-white/[0.04] bg-gradient-to-b from-transparent to-[#0e0c26]/60 py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
            Build your space on <br />
            <span className="retzlo-gradient-text py-1 inline-block">Retzlo today.</span>
          </h2>
          <p className="text-stone-300 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            Free workspace. Modular boards, calendars, diary notes, and ledger accounts. Set up in less than 60 seconds.
          </p>
          <div className="flex justify-center pt-2">
            <Link href="/select-module">
              <button className="retzlo-cta-primary px-8 py-4 text-base flex items-center gap-2 group">
                Get Started Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 bg-[#060613] px-6 py-12 text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-bold text-stone-300 text-sm tracking-wider">Retzlo</span>
            <span className="text-stone-700">|</span>
            <p>© {new Date().getFullYear()} Retzlo Platform. All rights reserved.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-stone-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-stone-300 transition-colors">Terms of Service</a>
            <span className="text-stone-800">•</span>
            <span className="font-mono text-stone-600 tracking-wider">SYSTEM_MARK_RETZLO_V1</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
