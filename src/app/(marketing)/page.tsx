"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  Play,
  Pause,
  Music,
  CheckCircle2,
  Volume2,
  Menu,
  X,
  Tv,
  Coffee,
  Disc,
  ChevronLeft,
  ChevronRight,
  Check,
  Zap,
  ShieldCheck,
  Clock
} from "lucide-react";
import {
  HERO_TYPEWRITER_LINES,
  PAIN_POINT_TABS,
  WALKTHROUGH_SLIDES,
  SUITABLE_FOR_LIST,
  NOT_SUITABLE_FOR_LIST,
  BEFORE_AFTER_ROWS,
  COMPARISON_ROWS,
  FAQ_ROW_1,
  FAQ_ROW_2,
  COMMUNITY_TESTIMONIALS
} from "./landing-data";
import { WalkthroughMockupScreen } from "./walkthrough-mockup";

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

interface MarketingSessionUser {
  name?: string | null;
  email?: string | null;
}

// ── Retro Synthwave Visual Hero (Interactive Cockpit) ────────────────────
function SynthwaveHero({
  isPlaying,
  onPlayToggle
}: {
  isPlaying: boolean;
  onPlayToggle: () => void;
}) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: y * -8, ry: x * 10 });
  };
  const handleMouseLeave = () => setTilt({ rx: 0, ry: 0 });

  return (
    <div
      className="relative w-full h-full min-h-[420px] overflow-hidden select-none cursor-pointer rounded-3xl border-2 border-[#a9a2ff]/35 shadow-[8px_8px_0_rgba(169,162,255,0.22)]"
      style={{ perspective: "1200px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onPlayToggle}
    >
      {/* Sky gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #06040f 0%, #0e0728 38%, #1a0a3c 55%, #2d0d52 62%, #3d0f5a 65%, #1a0530 80%, #07061a 100%)"
        }}
      />

      {/* Deterministic Stars (Zero hydration mismatch) */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 48 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white synth-star"
            style={{
              width: i % 9 === 0 ? 2 : 1,
              height: i % 9 === 0 ? 2 : 1,
              left: `${(i * 37 + 11) % 100}%`,
              top: `${(i * 19 + 7) % 58}%`,
              opacity: 0.3 + ((i * 13) % 60) / 100,
              animationDelay: `${((i * 7) % 40) / 10}s`,
              animationDuration: `${2 + ((i * 11) % 30) / 10}s`
            }}
          />
        ))}
      </div>

      {/* Retro synthwave sun */}
      <div
        className="absolute"
        style={{ bottom: "38%", left: "54%", transform: "translateX(-50%)" }}
      >
        <div className="relative" style={{ width: 210, height: 105, overflow: "hidden" }}>
          <div
            className="absolute inset-0 rounded-t-full"
            style={{
              background:
                "linear-gradient(to bottom, #ff6ec7 0%, #ff9a3c 40%, #e5bd72 70%, #ffd700 100%)",
              boxShadow:
                "0 0 80px 30px rgba(255,110,199,0.35), 0 0 160px 60px rgba(229,189,114,0.18)"
            }}
          />
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 bg-[#06040f]"
              style={{ height: 3, top: `${15 + i * 9}%`, opacity: 0.55 }}
            />
          ))}
        </div>
      </div>

      {/* Horizon neon glow */}
      <div
        className="absolute"
        style={{
          bottom: "38%",
          left: 0,
          right: 0,
          height: 3,
          background:
            "linear-gradient(90deg, transparent, #ff6ec7 20%, #a9a2ff 50%, #ff6ec7 80%, transparent)",
          boxShadow:
            "0 0 24px 8px rgba(255,110,199,0.55), 0 0 60px 20px rgba(169,162,255,0.3)",
          animation: "synth-pulse 3s ease-in-out infinite"
        }}
      />

      {/* Perspective grid floor */}
      <div
        className="absolute bottom-0"
        style={{
          left: 0,
          right: 0,
          height: "41%",
          perspective: "300px",
          perspectiveOrigin: "50% 0%"
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(169,162,255,0.55) 1px, transparent 1px), linear-gradient(to right, rgba(169,162,255,0.35) 1px, transparent 1px)",
            backgroundSize: "10% 22%",
            transform: "rotateX(55deg)",
            transformOrigin: "top center",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%)"
          }}
        />
      </div>

      {/* Floating 3D Mission Board inside Hero */}
      <div className="relative z-10 flex items-center justify-center p-5 sm:p-7 h-full">
        <div
          className="w-full max-w-[440px] rounded-2xl border border-[#d8d4ff]/25 bg-[#050511]/85 p-4 backdrop-blur-md transition-transform duration-200 ease-out shadow-[0_32px_80px_rgba(0,0,0,0.75)]"
          style={{
            transform: `perspective(1000px) rotateX(${tilt.rx * 0.4}deg) rotateY(${tilt.ry * 0.4}deg)`
          }}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="relative w-7 h-7">
                <Image
                  src="/stickers/retro/retro-sticker-09-headphones.png"
                  alt="Retzlo Studio"
                  fill
                  sizes="28px"
                  className="object-contain"
                />
              </div>
              <div>
                <div className="text-[9px] font-mono uppercase tracking-[0.28em] text-[#e5bd72]">
                  RETZLO SECOND BRAIN
                </div>
                <div className="text-sm sm:text-base font-bold text-white">
                  Today Focus Cockpit
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-2.5 py-1">
              <span
                className={`h-2 w-2 rounded-full ${
                  isPlaying ? "bg-emerald-400 animate-pulse" : "bg-[#a9a2ff]"
                }`}
              />
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#e7e5e4]">
                {isPlaying ? "LOFI LIVE" : "READY"}
              </span>
            </div>
          </div>

          {/* 3 Mini Kanban Columns */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              {
                label: "INBOX / TODO",
                color: "#a9a2ff",
                cards: ["โยนงานออกจากหัว", "AI แตกขั้นตอน"]
              },
              {
                label: "DOING NOW",
                color: "#ff8a4c",
                cards: ["โฟกัสงานหลัก", "เปิดเพลง Lofi"]
              },
              {
                label: "DONE (+COINS)",
                color: "#34d399",
                cards: ["รับ +24 Coins 🪙", "แลกรางวัลพักใจ"]
              }
            ].map((column, columnIndex) => (
              <div
                key={column.label}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-2"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className="text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider truncate"
                    style={{ color: column.color }}
                  >
                    {column.label}
                  </span>
                  <span
                    className="h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ background: column.color }}
                  />
                </div>
                {column.cards.map((card, cardIndex) => (
                  <div
                    key={card}
                    className="mb-1.5 last:mb-0 rounded-lg border border-white/10 bg-[#09081a]/90 px-2 py-1.5 transition-transform duration-500"
                    style={{
                      transform:
                        isPlaying && columnIndex === 1 && cardIndex === 0
                          ? "translateY(-3px) scale(1.02)"
                          : "translateY(0)"
                    }}
                  >
                    <div
                      className="mb-1 h-1 w-8 rounded-full"
                      style={{ background: `${column.color}99` }}
                    />
                    <div className="text-[10px] sm:text-[11px] font-medium text-[#f5f5f4] leading-snug">
                      {card}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Bottom Interactive Audio Bar inside Hero Card */}
          <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-[#03030c]/90 px-3 py-2">
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#e5bd72]">
              {isPlaying ? (
                <Pause className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Play className="h-3.5 w-3.5 text-[#e5bd72]" />
              )}
              <span>
                {isPlaying
                  ? "กำลังบรรเลงเพลง Lofi สด (คลิกเพื่อพัก)"
                  : "คลิกที่นี่เพื่อเปิดเพลง Lofi & ขยับบอร์ด"}
              </span>
            </div>
            <div className="flex items-end gap-1 h-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <span
                  key={i}
                  className="w-1 rounded-full transition-all duration-300"
                  style={{
                    height: isPlaying ? `${6 + ((i * 7) % 12)}px` : `${4 + (i % 3) * 2}px`,
                    background: i > 6 ? "#e5bd72" : i > 3 ? "#89c7d6" : "#a9a2ff",
                    opacity: isPlaying ? 0.95 : 0.4
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top right status badge */}
      <div className="absolute top-3 right-3 z-20 pointer-events-none">
        <span
          className={`text-[10px] font-mono tracking-widest uppercase px-2.5 py-1 rounded-full border ${
            isPlaying
              ? "text-emerald-300 border-emerald-400/40 bg-emerald-500/20"
              : "text-[#e5bd72] border-[#e5bd72]/30 bg-[#080817]/80"
          }`}
        >
          {isPlaying ? "▶ LOFI SYNTH PLAYING" : "🎧 CLICK SCENE FOR SOUND"}
        </span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [announcementOpen, setAnnouncementOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<MarketingSessionUser | null>(null);
  const [defaultDestination, setDefaultDestination] = useState<string>("/projects");
  const [isPlaying, setIsPlaying] = useState(false);
  const [crtMode, setCrtMode] = useState(false);
  const [steamHovered, setSteamHovered] = useState(false);

  // Interactive states for Sloth-inspired sections
  const [activePainTabIndex, setActivePainTabIndex] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [checkedSuitability, setCheckedSuitability] = useState<number[]>([0, 1, 3, 5]);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Typewriter effect state
  const [typewriterText, setTypewriterText] = useState(HERO_TYPEWRITER_LINES[0]);
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Session check (Preserves auth-navigation.test.ts contract)
  useEffect(() => {
    let isMounted = true;
    setDefaultDestination("/projects");

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const session = (await response.json()) as { user?: MarketingSessionUser };

        if (!isMounted) return;

        if (session.user) {
          setCurrentUser(session.user);
          const searchParams = new URLSearchParams(window.location.search);
          if (!searchParams.get("stay")) {
            router.replace("/projects");
          }
        } else {
          setCurrentUser(null);
        }
      } catch {
        if (isMounted) {
          setCurrentUser(null);
        }
      }
    }

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Typewriter animation loop
  useEffect(() => {
    const currentFullLine = HERO_TYPEWRITER_LINES[lineIndex];
    const speed = isDeleting ? 22 : 42;

    const timer = setTimeout(() => {
      if (!isDeleting && charIndex < currentFullLine.length) {
        setTypewriterText(currentFullLine.slice(0, charIndex + 1));
        setCharIndex((c) => c + 1);
      } else if (!isDeleting && charIndex === currentFullLine.length) {
        setTimeout(() => setIsDeleting(true), 2200);
      } else if (isDeleting && charIndex > 0) {
        setTypewriterText(currentFullLine.slice(0, charIndex - 1));
        setCharIndex((c) => c - 1);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setLineIndex((l) => (l + 1) % HERO_TYPEWRITER_LINES.length);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, lineIndex]);

  // Scroll tracking for sticky bottom bar
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 520);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cursor sparkle trail particles
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdCounter = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (Math.random() > 0.28) return;
      const stars = ["✦", "✧", "★", "•"];
      const colors = ["#a9a2ff", "#e5bd72", "#89c7d6", "#ff8a4c"];
      const newParticle: Particle = {
        id: particleIdCounter.current++,
        x: e.clientX,
        y: e.clientY + window.scrollY,
        char: stars[Math.floor(Math.random() * stars.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.floor(Math.random() * 10) + 8,
        rot: Math.random() * 360,
        opacity: 1
      };
      setParticles((prev) => [...prev.slice(-24), newParticle]);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            y: p.y + 1.1,
            rot: p.rot + 1.5,
            opacity: p.opacity - 0.06
          }))
          .filter((p) => p.opacity > 0)
      );
    }, 45);
    return () => clearInterval(interval);
  }, []);

  // VU Meter & Web Audio Synthesizer
  const [vuLevelL, setVuLevelL] = useState(12);
  const [vuLevelR, setVuLevelR] = useState(18);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const startSynth = () => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;

      const masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.16, audioCtx.currentTime);

      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(460, audioCtx.currentTime);
      filter.Q.setValueAtTime(1, audioCtx.currentTime);

      filter.connect(masterGain);
      masterGain.connect(audioCtx.destination);

      const chords = [
        [130.81, 164.81, 196.0, 246.94], // Cmaj7
        [110.0, 130.81, 164.81, 196.0], // Am7
        [146.83, 174.61, 220.0, 261.63], // Dm7
        [98.0, 123.47, 146.83, 174.61] // G7
      ];

      const oscillators: OscillatorNode[] = [];
      const oscGains: GainNode[] = [];

      for (let i = 0; i < 4; i++) {
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();
        osc.type = "triangle";
        oscGain.gain.setValueAtTime(0, audioCtx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start();
        oscillators.push(osc);
        oscGains.push(oscGain);
      }

      const bufferSize = audioCtx.sampleRate * 2;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        let val = (Math.random() * 2 - 1) * 0.007;
        if (Math.random() > 0.9995) {
          val += Math.random() > 0.5 ? 0.3 : -0.3;
        }
        output[i] = val;
      }

      const noiseSource = audioCtx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      noiseSource.connect(noiseGain);
      noiseGain.connect(masterGain);
      noiseSource.start();

      let currentChordIdx = 0;
      const playChord = () => {
        const chord = chords[currentChordIdx];
        oscillators.forEach((osc, idx) => {
          osc.frequency.setValueAtTime(chord[idx], audioCtx.currentTime);
          osc.detune.setValueAtTime(Math.random() * 10 - 5, audioCtx.currentTime);
          oscGains[idx].gain.cancelScheduledValues(audioCtx.currentTime);
          oscGains[idx].gain.setValueAtTime(oscGains[idx].gain.value, audioCtx.currentTime);
          oscGains[idx].gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.8);
        });
        currentChordIdx = (currentChordIdx + 1) % chords.length;
      };

      playChord();
      const chordScheduler = setInterval(() => {
        if (audioCtx.state === "suspended") return;
        playChord();
      }, 4000);

      (audioCtx as unknown as { _chordScheduler: ReturnType<typeof setInterval> })._chordScheduler =
        chordScheduler;
    } catch (err) {
      console.error("Failed to start Web Audio Synthesizer:", err);
    }
  };

  const stopSynth = () => {
    if (audioCtxRef.current) {
      const ctxWithTimer = audioCtxRef.current as unknown as {
        _chordScheduler?: ReturnType<typeof setInterval>;
      };
      if (ctxWithTimer._chordScheduler) {
        clearInterval(ctxWithTimer._chordScheduler);
      }
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      stopSynth();
      setIsPlaying(false);
    } else {
      startSynth();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        const ctxWithTimer = audioCtxRef.current as unknown as {
          _chordScheduler?: ReturnType<typeof setInterval>;
        };
        if (ctxWithTimer._chordScheduler) {
          clearInterval(ctxWithTimer._chordScheduler);
        }
        audioCtxRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setVuLevelL(Math.floor(Math.random() * 45) + 12);
        setVuLevelR(Math.floor(Math.random() * 50) + 15);
      }, 110);
    } else {
      setVuLevelL(6);
      setVuLevelR(8);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const toggleSuitabilityItem = (idx: number) => {
    setCheckedSuitability((prev) =>
      prev.includes(idx) ? prev.filter((item) => item !== idx) : [...prev, idx]
    );
  };

  const activePainTab = PAIN_POINT_TABS[activePainTabIndex] ?? PAIN_POINT_TABS[0];
  const activeSlide = WALKTHROUGH_SLIDES[activeSlideIndex] ?? WALKTHROUGH_SLIDES[0];

  return (
    <main
      className={`min-h-screen bg-[#080817] text-[#f5efe6] font-sans relative overflow-x-hidden selection:bg-[#a9a2ff]/30 selection:text-white ${
        crtMode ? "crt-screen-overlay" : ""
      }`}
    >
      {/* ── Cursor Sparkles ── */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute pointer-events-none z-50 select-none font-mono"
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

      {/* ── 1. Top Dismissible Announcement Marquee Bar (Sloth-style) ── */}
      {announcementOpen && (
        <aside
          aria-label="ข้อความประกาศ"
          className="relative z-50 w-full bg-[#14122b] border-b border-[#a9a2ff]/25 py-2.5 pr-12 overflow-hidden"
        >
          <div className="retzlo-marquee-track flex items-center whitespace-nowrap text-xs sm:text-sm font-medium text-[#f5efe6]">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex items-center gap-8 pr-8" aria-hidden={dup === 1}>
                <span>
                  🔥 เปิดตัว <strong className="text-[#e5bd72]">Retzlo Second Brain & Lofi OS 2.0</strong> — ปลดล็อกสมองที่ล้า ให้ระบบช่วยจำและจัดระเบียบแทนคุณ
                </span>
                <span className="text-[#ff8a4c]">✳</span>
                <span>
                  ใช้งานฟรี 100% · มี <strong className="text-[#a9a2ff]">AI Breakdown</strong> ช่วยแตกโปรเจกต์เป็นงานย่อยในคลิกเดียว
                </span>
                <span className="text-[#ff8a4c]">✳</span>
                <span>
                  ทำงานเสร็จรับเหรียญ <strong className="text-[#34d399]">Coin แลกรางวัล</strong> พร้อมวิทยุ Lofi C-60 และสวนเซนบำบัดใจ
                </span>
                <span className="text-[#ff8a4c]">✳</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setAnnouncementOpen(false)}
            aria-label="ปิดแถบประกาศ"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#080817]/80 border border-white/15 text-[#d6d3d1] hover:text-white flex items-center justify-center text-base cursor-pointer"
          >
            ×
          </button>
        </aside>
      )}

      {/* ── 2. Sticky Editorial & Lofi Studio Pill Header ── */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080817]/90 backdrop-blur-xl px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left Brand + Tag */}
          <div className="flex items-center gap-3">
            <Link href="#cp-hero" className="flex items-center group">
              <div className="relative h-9 w-24 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/brand/retzlo-logo.png"
                  alt="Retzlo"
                  fill
                  priority
                  sizes="96px"
                  className="object-contain object-left select-none pointer-events-none"
                />
              </div>
            </Link>
            <span className="hidden xl:inline-block text-xs font-mono text-[#a8a29e]">
              · The Lofi Second Brain
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border-2 border-[#080817] bg-[#faf6ef] px-3 py-0.5 text-[11px] font-mono font-bold text-[#1c1917] shadow-[2px_2px_0_#a9a2ff]">
              <Sparkles className="w-3 h-3 text-[#ff8a4c]" />
              LIFE & WORK OS
            </span>
          </div>

          {/* Center Pill Navigation (Sloth cp-navpill style) */}
          <nav
            aria-label="เมนูนำทางหลัก"
            className="hidden lg:flex items-center gap-1 rounded-full border border-white/15 bg-[#13112c]/90 p-1 text-xs font-medium text-[#d6d3d1]"
          >
            <a
              href="#pain-tabs"
              className="rounded-full px-3.5 py-1.5 hover:bg-white/10 hover:text-white transition"
            >
              ทำไมต้องมีระบบ
            </a>
            <a
              href="#walkthrough"
              className="rounded-full px-3.5 py-1.5 hover:bg-white/10 hover:text-white transition"
            >
              ดูข้างใน (7 โมดูล)
            </a>
            <a
              href="#check-readiness"
              className="rounded-full px-3.5 py-1.5 hover:bg-white/10 hover:text-white transition"
            >
              เหมาะกับใคร
            </a>
            <a
              href="#lofi-focus"
              className="rounded-full px-3.5 py-1.5 hover:bg-white/10 hover:text-white transition"
            >
              วิทยุ Lofi
            </a>
            <a
              href="#offer"
              className="rounded-full px-3.5 py-1.5 hover:bg-white/10 hover:text-white transition"
            >
              เปรียบเทียบ
            </a>
            <a
              href="#faq"
              className="rounded-full px-3.5 py-1.5 hover:bg-white/10 hover:text-white transition"
            >
              คำถาม (FAQ)
            </a>
          </nav>

          {/* Right Audio Toggle + Auth Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePlayToggle}
              className={`px-3 py-1.5 rounded-full border text-xs font-mono flex items-center gap-1.5 cursor-pointer transition ${
                isPlaying
                  ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-300"
                  : "border-white/15 bg-white/[0.04] text-[#d6d3d1] hover:border-[#e5bd72]/50 hover:text-[#e5bd72]"
              }`}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isPlaying ? "Lofi: ON" : "Lofi Radio"}</span>
            </button>

            <button
              type="button"
              onClick={() => setCrtMode(!crtMode)}
              className={`px-2.5 py-1.5 text-xs font-mono rounded-full border flex items-center gap-1.5 cursor-pointer transition ${
                crtMode
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                  : "bg-white/5 border-white/10 text-[#a8a29e] hover:text-white"
              }`}
              title="สลับเอฟเฟกต์หน้าจอเรโทร CRT"
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">CRT</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/profile"
                  className="max-w-[160px] truncate px-2.5 py-1.5 text-xs font-medium text-[#d6d3d1] transition-colors hover:text-white"
                >
                  {currentUser.name || currentUser.email || "Workspace user"}
                </Link>
                <Link href={defaultDestination}>
                  <button className="rounded-full border-2 border-[#080817] bg-[#ff8a4c] px-4 py-1.5 text-xs font-bold text-[#080817] shadow-[3px_3px_0_#f5efe6] hover:translate-y-[-1px] transition cursor-pointer">
                    Enter Workspace
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs sm:text-sm text-[#d6d3d1] hover:text-white font-medium transition-colors"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link href={defaultDestination}>
                  <button className="rounded-full border-2 border-[#080817] bg-[#ff8a4c] px-4 py-1.5 text-xs font-bold text-[#080817] shadow-[3px_3px_0_#f5efe6] hover:translate-y-[-1px] transition cursor-pointer">
                    Enter Workspace
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            className="md:hidden p-2 text-[#d6d3d1] hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="เปิดเมนู"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 border-t border-white/10 bg-[#0d0c22] px-4 py-5 space-y-3 rounded-2xl">
            <a
              href="#pain-tabs"
              className="block text-sm text-[#f5efe6] py-1.5 border-b border-white/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              ทำไมต้องมีระบบ (6 ปัญหาคนทำงาน)
            </a>
            <a
              href="#walkthrough"
              className="block text-sm text-[#f5efe6] py-1.5 border-b border-white/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              ดูข้างในระบบ (7 โมดูล)
            </a>
            <a
              href="#check-readiness"
              className="block text-sm text-[#f5efe6] py-1.5 border-b border-white/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              เช็กความพร้อม
            </a>
            <a
              href="#lofi-focus"
              className="block text-sm text-[#f5efe6] py-1.5 border-b border-white/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              วิทยุ Lofi C-60
            </a>
            <a
              href="#faq"
              className="block text-sm text-[#f5efe6] py-1.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              คำถามที่พบบ่อย (FAQ)
            </a>
            <div className="pt-3 flex flex-col gap-2">
              {currentUser ? (
                <>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full py-2 text-xs text-[#d6d3d1]">
                      {currentUser.name || currentUser.email || "Workspace user"}
                    </button>
                  </Link>
                  <Link href={defaultDestination} onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full bg-[#ff8a4c] text-[#080817] font-bold py-2.5 rounded-full text-sm">
                      Enter Workspace
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full py-2 text-sm text-[#d6d3d1] border border-white/15 rounded-full">
                      เข้าสู่ระบบ (Sign In)
                    </button>
                  </Link>
                  <Link href={defaultDestination} onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full bg-[#ff8a4c] text-[#080817] font-bold py-2.5 rounded-full text-sm">
                      เริ่มต้นใช้งานฟรีทันที
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── 3. Hero Section (#cp-hero) — Sloth Storytelling × Retzlo Lofi Studio ── */}
      <section
        id="cp-hero"
        className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-16 md:pt-16 md:pb-24"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Storytelling Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tactile Pill Tag */}
            <div className="inline-flex items-center gap-2.5 rounded-full border-2 border-[#080817] bg-[#faf6ef] px-4 py-1.5 text-xs sm:text-sm font-bold text-[#1c1917] shadow-[4px_4px_0_#a9a2ff]">
              <div className="relative w-4 h-4">
                <Image
                  src="/stickers/retro/retro-sticker-20-sparkles.png"
                  alt=""
                  fill
                  sizes="16px"
                  className="object-contain"
                />
              </div>
              <span>All-in-One Second Brain · ใช้งานฟรีเต็มระบบ</span>
            </div>

            {/* Main Headline with Floating Handwritten Script Label */}
            <div className="relative pt-2">
              <span
                aria-hidden="true"
                className="hidden sm:inline-block absolute right-4 -top-4 font-serif italic text-2xl md:text-3xl text-[#e5bd72] -rotate-3 select-none pointer-events-none"
              >
                second brain · lofi studio
              </span>

              <h1 className="text-3xl sm:text-5xl md:text-[54px] font-extrabold tracking-tight text-white leading-[1.28]">
                <span className="block">คุณไม่ได้ “ขี้เกียจ”</span>
                <span className="block text-[#ff8a4c] mt-1">
                  คุณแค่ยังไม่มี “ระบบ”
                </span>
                <span className="block text-lg sm:text-2xl md:text-[26px] font-semibold text-[#e7e5e4] mt-3 leading-[1.5]">
                  ที่ช่วยให้จัดการทุกงาน โปรเจกต์ และชีวิตได้ด้วยตัวคนเดียว (หรือทำกับทีม) โดยไม่เหนื่อยล้าจนหมดไฟ
                </span>
              </h1>
            </div>

            {/* Live Typewriter Box */}
            <div className="rounded-2xl border border-white/15 bg-[#121029]/85 px-4 py-3.5 max-w-xl">
              <p className="text-sm sm:text-base text-[#d6d3d1] leading-relaxed min-h-[3rem]">
                <span>{typewriterText}</span>
                <span className="inline-block w-0.5 h-4 bg-[#ff8a4c] align-middle ml-1 animate-pulse" />
              </p>
            </div>

            {/* Neo-Retro Sticker CTA Button & Secondary Action */}
            <div className="pt-1 space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link href={defaultDestination} className="inline-block">
                  <button
                    type="button"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-[#080817] bg-[#ff8a4c] hover:bg-[#ff9b64] px-7 py-4 text-base sm:text-lg font-extrabold text-[#080817] shadow-[6px_6px_0_#faf6ef] hover:translate-y-[-2px] active:translate-y-[1px] transition-all cursor-pointer"
                  >
                    <span>เริ่มต้นจัดระเบียบชีวิต — ใช้งานฟรีทันที</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                <a
                  href="#walkthrough"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.05] hover:bg-white/[0.1] px-6 py-4 text-sm font-semibold text-[#f5efe6] transition"
                >
                  <span>ส่องข้างในระบบ (7 โมดูล)</span>
                </a>
              </div>

              {/* 5-Star Rating & Checkmarks */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-[#ff8a4c] text-sm tracking-widest">★★★★★</span>
                  <span className="text-xs sm:text-sm font-semibold text-[#f5efe6]">
                    4.9/5 จากนักพัฒนา ฟรีแลนซ์ และคนทำงานที่รักความสงบ
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#a8a29e]">
                  ✓ ไม่ต้องผูกบัตรเครดิต · ✓ มี AI ช่วยแตก Task อัตโนมัติ · ✓ มีวิทยุ Lofi & สวนเซนในตัว
                </p>
              </div>
            </div>
          </div>

          {/* Right Interactive Synthwave Cockpit Column (5 cols) */}
          <div className="lg:col-span-5">
            <SynthwaveHero isPlaying={isPlaying} onPlayToggle={handlePlayToggle} />
          </div>
        </div>
      </section>

      {/* ── 4. Eyebrow Showcase Banner ("THE LOFI SECOND BRAIN 2.0") ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-16">
        <div className="flex items-center gap-4 mb-5 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-[140px]">
            <span className="rounded-md bg-[#a9a2ff]/15 border border-[#a9a2ff]/30 px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-widest text-[#a9a2ff]">
              Life & Work OS
            </span>
            <div className="flex-1 h-px bg-white/15" />
          </div>
          <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white">
            Retzlo Second Brain <span className="text-[#ff8a4c]">2.0</span>
          </h2>
        </div>

        {/* All-in-One Module Strip Card */}
        <div className="rounded-3xl border-2 border-[#faf6ef]/20 bg-gradient-to-b from-[#151332] to-[#0d0c20] p-5 sm:p-7 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                title: "Kanban & Table",
                sub: "ลากวางงานไว 60fps",
                sticker: "/stickers/retro/retro-sticker-03-checklist.png",
                color: "#a9a2ff"
              },
              {
                title: "AI Breakdown",
                sub: "แตกงานใหญ่ใน 5 วิ",
                sticker: "/stickers/retro/retro-sticker-33-magic-wand.png",
                color: "#ff8a4c"
              },
              {
                title: "Sync Calendar",
                sub: "ปฏิทินรวมกำหนดส่ง",
                sticker: "/stickers/retro/retro-sticker-04-calendar.png",
                color: "#89c7d6"
              },
              {
                title: "Notes & Diary",
                sub: "สมองที่สองเก็บความรู้",
                sticker: "/stickers/retro/retro-sticker-12-paper-note.png",
                color: "#d59ab3"
              },
              {
                title: "Coin Rewards",
                sub: "ทำงานจบแลกรางวัล",
                sticker: "/stickers/retro/retro-sticker-01-coin-reward.png",
                color: "#e5bd72"
              },
              {
                title: "Lofi & Zen Garden",
                sub: "เพลงโฟกัส & สวนหิน",
                sticker: "/stickers/retro/retro-sticker-09-headphones.png",
                color: "#34d399"
              }
            ].map((mod) => (
              <div
                key={mod.title}
                className="rounded-2xl border border-white/10 bg-[#090819]/80 p-3.5 flex flex-col items-center text-center gap-2 hover:border-[#a9a2ff]/45 hover:translate-y-[-2px] transition"
              >
                <div className="relative w-11 h-11">
                  <Image
                    src={mod.sticker}
                    alt={mod.title}
                    fill
                    sizes="44px"
                    className="object-contain"
                  />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white">{mod.title}</div>
                  <div className="text-[11px] text-[#a8a29e] mt-0.5">{mod.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm sm:text-lg font-bold text-[#f5efe6] mt-6">
            ระบบจัดการงานและชีวิต All-in-One — รวมทุกเรื่องสำคัญไว้ในสตูดิโอเดียว ไม่ต้องสลับแอปไปมา
          </p>
        </div>
      </section>

      {/* ── 5. Interactive Browser Tab Window (#pain-tabs — "เคยไหม? วางแผนไว้ดิบดี… แต่สุดท้ายไม่ได้ทำ") ── */}
      <section id="pain-tabs" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#ff8a4c]">
              SOUND FAMILIAR? · ปัญหาที่คนทำงานเจอทุกวัน
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2 leading-snug">
              เคยไหม? วางแผนไว้ดิบดี…
              <br />
              แต่สุดท้าย <span className="text-[#ff8a4c]">“ไม่ได้ทำ”</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#a8a29e] font-mono">
            👇 ลองคลิกเลือกแท็บปัญหาที่คุณกำลังเผชิญอยู่ด้านล่างนี้:
          </p>
        </div>

        {/* Neo-Brutalist Cream Browser Window (Inspired by Sloth tbWin) */}
        <div className="rounded-2xl border-2 border-[#1c1917] bg-[#f7f3ea] text-[#1c1917] shadow-[8px_8px_0_#a9a2ff] overflow-hidden">
          {/* Browser Title Bar */}
          <div className="flex items-center gap-2 bg-[#ffffff] border-b border-[#e5dec9] px-4 py-2.5">
            <span className="w-3 h-3 rounded-full bg-[#FF5F57] inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#FEBC2E] inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#28C840] inline-block" />
            <span className="flex-1 text-center text-xs font-mono font-medium text-[#78716c]">
              Retzlo — The Lofi Second Brain OS
            </span>
          </div>

          {/* Browser URL Bar */}
          <div className="flex items-center gap-3 bg-[#ffffff] px-4 py-2 border-b border-[#e5dec9]">
            <span className="text-xs font-mono text-[#78716c]">← → ⟳</span>
            <div className="flex-1 rounded-full bg-[#f4efe3] px-4 py-1 text-xs font-mono text-[#292524] truncate">
              🔒 retzlo.studio/why-you-need-a-system/{activePainTab.id}
            </div>
          </div>

          {/* Browser Clickable Tabs Strip */}
          <div className="flex items-end gap-1.5 bg-[#ece6d7] px-3 pt-2.5 overflow-x-auto scrollbar-none">
            {PAIN_POINT_TABS.map((tab, idx) => {
              const isSelected = idx === activePainTabIndex;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePainTabIndex(idx)}
                  style={{ flex: isSelected ? "2.2 1 0%" : "1 1 0%" }}
                  className={`min-w-[125px] inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-t-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer border border-b-0 ${
                    isSelected
                      ? "bg-[#ff8a4c] text-[#ffffff] border-[#1c1917] shadow-xs"
                      : "bg-[#e2dac8]/70 text-[#57534e] border-transparent hover:bg-[#e2dac8] hover:text-[#1c1917]"
                  }`}
                >
                  <div className="relative w-4 h-4 shrink-0 rounded-full bg-white p-0.5">
                    <Image
                      src={tab.sticker}
                      alt=""
                      fill
                      sizes="16px"
                      className="object-contain"
                    />
                  </div>
                  <span className="truncate">{tab.tabLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Browser Tab Content Body */}
          <div className="border-t-2 border-[#1c1917] bg-[#f7f3ea] p-6 sm:p-9 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Problem & Solution Copy */}
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-block rounded-full bg-[#1c1917] px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-[#f7f3ea]">
                PROBLEM 0{activePainTabIndex + 1} · {activePainTab.badge}
              </span>
              <h3 className="text-xl sm:text-3xl font-extrabold text-[#1c1917] leading-snug">
                {activePainTab.title}
              </h3>
              <p className="text-sm sm:text-base text-[#44403c] leading-relaxed">
                {activePainTab.description}
              </p>

              {/* Solution Box inside Tab */}
              <div className="rounded-2xl border-2 border-[#1c1917] bg-[#ffffff] p-4 sm:p-5 shadow-[4px_4px_0_#1c1917]">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#15803d] mb-1">
                  ✓ วิธีที่ Retzlo แก้ปัญหานี้ให้คุณทันที:
                </div>
                <div className="text-base sm:text-lg font-extrabold text-[#1c1917]">
                  {activePainTab.solutionTitle}
                </div>
                <p className="text-xs sm:text-sm text-[#44403c] mt-1.5 leading-relaxed">
                  {activePainTab.solutionDesc}
                </p>
              </div>
            </div>

            {/* Right Interactive Visual Preview Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border-2 border-[#1c1917] bg-[#111029] text-[#f5efe6] p-5 shadow-[6px_6px_0_#1c1917] space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl bg-white/10 p-1.5 border border-white/15">
                      <Image
                        src={activePainTab.sticker}
                        alt={activePainTab.tabLabel}
                        fill
                        sizes="48px"
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <div
                        className="text-[10px] font-mono font-bold uppercase tracking-wider"
                        style={{ color: activePainTab.accentColor }}
                      >
                        RETZLO LIVE PREVIEW
                      </div>
                      <div className="text-sm font-bold text-white">
                        {activePainTab.tabLabel}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setActivePainTabIndex((prev) => (prev + 1) % PAIN_POINT_TABS.length)
                    }
                    className="rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 px-2.5 py-1 text-[11px] font-mono text-[#d6d3d1] cursor-pointer"
                  >
                    แท็บถัดไป →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {activePainTab.mockItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 ${
                            item.done
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-[#a9a2ff]/20 text-[#a9a2ff] border border-[#a9a2ff]/40"
                          }`}
                        >
                          {item.done ? "✓" : "•"}
                        </span>
                        <span className="text-xs font-medium text-[#f5efe6] truncate">
                          {item.label}
                        </span>
                      </div>
                      <span
                        className="shrink-0 rounded px-2 py-0.5 text-[9px] font-mono font-bold"
                        style={{
                          backgroundColor: `${activePainTab.accentColor}25`,
                          color: activePainTab.accentColor
                        }}
                      >
                        {item.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Philosophy Split Section ("ให้สมองทำหน้าที่คิด แล้วให้ระบบทำหน้าที่จำ") ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="border-t border-white/15 pt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-[1.35]">
              ให้สมองทำหน้าที่คิด
              <br />
              แล้ว
              <span
                className="px-1"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 58%, rgba(169, 162, 255, 0.38) 58%, rgba(169, 162, 255, 0.38) 95%, transparent 95%)"
                }}
              >
                ให้ระบบทำหน้าที่จำ
              </span>
            </h2>
          </div>
          <div className="lg:col-span-7 space-y-4 text-sm sm:text-lg text-[#d6d3d1] leading-relaxed">
            <p>
              <strong className="text-white">Retzlo Studio OS</strong> คือแพลตฟอร์มบริหารจัดการงาน ชีวิต ไอเดีย และสมาธิ ที่ออกแบบมาเพื่อให้คุณเปิดจอขึ้นมาแล้วรู้ทันทีว่าวันนี้ต้องโฟกัสอะไร โดยไม่ต้องเสียเวลาจัดตารางใหม่ทุกเช้า
            </p>
            <div className="space-y-2 text-sm sm:text-base text-[#e7e5e4]">
              <p>✓ ไม่ต้องสร้างฐานข้อมูลหรือเขียนสูตรเองให้ปวดหัว ทุกอย่างเชื่อมกันพร้อมใช้ทันที</p>
              <p>✓ ไม่ต้องพยายามจำ ทุกการ์ดงาน กำหนดส่ง และโน้ตมีบ้านชัดเจน ค้นหาเจอใน 3 วินาที</p>
              <p>✓ ไม่ต้องมีวินัยเหล็ก เพราะมีเพลง Lofi, นาฬิกาโฟกัส และเหรียญแลกรางวัลคอยเติมไฟให้ทุกวัน</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. 3-Step Neo-Retro Sticker Cards (#workflow-steps) ── */}
      <section id="workflow-steps" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="mb-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-snug">
            สร้างระบบที่เข้ากับชีวิตคุณจริง ๆ
            <br />
            <span className="text-[#ff8a4c]">
              แล้วเอาเวลาไปโฟกัสกับงานที่สร้างคุณค่าและรายได้
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "① โยนทุกเรื่องออกจากหัว (Brain Dump & AI)",
              desc: "มีไอเดียใหม่ งานด่วน หรือโปรเจกต์ใหญ่ที่ยังไม่รู้จะเริ่มยังไง โยนเข้าบอร์ดหรือกดปุ่มให้ AI แตกเป็นงานย่อยให้ทันทีโดยไม่ต้องเสียเวลาจัดหมวดหมู่เอง",
              note: "( จดให้เร็วที่สุด แล้วให้ AI ช่วยจัดระเบียบทีหลัง )",
              sticker: "/stickers/retro/retro-sticker-32-idea-lamp.png",
              accent: "#ff8a4c",
              previewTag: "AI Task Breakdown · 5 วินาที"
            },
            {
              step: "② จัดเก็บเข้าที่ เห็นงานชัด (Organize & Sync)",
              desc: "เปลี่ยนเรื่องที่จดไว้ให้กลายเป็นบอร์ด Kanban, ตารางงาน, ปฏิทินกำหนดส่ง และคลังโน้ตความรู้ที่ซิงก์หากันอัตโนมัติ เปิดมาตอนเช้ารู้ทันทีว่าต้องทำอะไร",
              note: "( ข้อมูลทุกชิ้นมีที่อยู่ชัดเจน ไม่หาย ไม่รกสมอง )",
              sticker: "/stickers/retro/retro-sticker-13-project-folder.png",
              accent: "#a9a2ff",
              previewTag: "Kanban ↔ Calendar Auto-Sync"
            },
            {
              step: "③ ทำงานเสร็จ รับเหรียญแลกรางวัล (Gamify & Zen)",
              desc: "เปิดวิทยุ Lofi C-60 และนาฬิกา Nixie Pomodoro ทำงานจนจบ รับเหรียญ Coin สะสมไปแลกรางวัลที่คุณตั้งไว้เอง หรือแวะพักใจรดน้ำบอนไซในสวนเซน",
              note: "( เปลี่ยนการทำงานที่น่าเบื่อ ให้สนุกเหมือนเล่นเกม )",
              sticker: "/stickers/retro/retro-sticker-01-coin-reward.png",
              accent: "#e5bd72",
              previewTag: "+Coins & Solitary Zen Garden"
            }
          ].map((card) => (
            <div
              key={card.step}
              className="rounded-3xl border-2 border-[#1c1917] bg-[#f7f3ea] text-[#1c1917] p-6 sm:p-7 shadow-[6px_6px_0_#a9a2ff] flex flex-col justify-between"
            >
              <div>
                {/* Illustration Well */}
                <div className="rounded-2xl border-2 border-[#1c1917] bg-[#121029] p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[170px]">
                  <div
                    className="absolute w-32 h-32 rounded-full blur-2xl opacity-35"
                    style={{ background: card.accent }}
                  />
                  <div className="relative w-20 h-20">
                    <Image
                      src={card.sticker}
                      alt={card.step}
                      fill
                      sizes="80px"
                      className="object-contain"
                    />
                  </div>
                  <span
                    className="mt-3 rounded-full px-3 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border"
                    style={{
                      color: card.accent,
                      borderColor: `${card.accent}55`,
                      backgroundColor: `${card.accent}18`
                    }}
                  >
                    {card.previewTag}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold text-[#1c1917] mt-5">
                  {card.step}
                </h3>
                <p className="text-sm sm:text-base text-[#292524] mt-2.5 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <p className="text-xs sm:text-sm font-mono text-[#78716c] mt-5 pt-3 border-t border-[#e5dec9]">
                {card.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 8. Interactive 7-Module Walkthrough Carousel (#walkthrough) ── */}
      <section id="walkthrough" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight">
          ไม่ใช่แค่บอร์ดที่จัดสวย{" "}
          <span className="text-[#a9a2ff]">แต่ทำงานเชื่อมกันทั้งระบบ</span>
        </h2>

        {/* Dark Studio Container with Perforated Ticket Divider (Inspired by Sloth wt-carousel-container) */}
        <div className="rounded-3xl border-2 border-white/15 bg-[#131129] p-5 sm:p-8 md:p-10 shadow-2xl overflow-hidden">
          {/* Top Pill Selector Bar */}
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <span className="rounded-md bg-[#f7f3ea] text-[#1c1917] px-3 py-1 text-xs font-mono font-bold">
              retzlo os · 7 core modules
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {WALKTHROUGH_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition cursor-pointer shrink-0 ${
                    idx === activeSlideIndex
                      ? "bg-[#ff8a4c] text-[#080817] font-bold shadow-xs"
                      : "bg-white/[0.06] text-[#d6d3d1] hover:bg-white/[0.12]"
                  }`}
                >
                  {s.tabName}
                </button>
              ))}
            </div>
          </div>

          {/* Tablet Bezel Frame + Prev/Next Buttons */}
          <div className="relative max-w-5xl mx-auto">
            <div className="rounded-2xl bg-[#f7f3ea] p-3 sm:p-5 border-2 border-[#1c1917]">
              <div className="relative rounded-2xl bg-[#1c1c1c] p-3 sm:p-4 shadow-2xl">
                {/* Camera Dot */}
                <span className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#4a4a4a]" />
                <WalkthroughMockupScreen
                  slide={activeSlide}
                  isPlaying={isPlaying}
                  onToggleAudio={handlePlayToggle}
                />
              </div>
            </div>

            {/* Prev Button */}
            <button
              type="button"
              aria-label="ก่อนหน้า"
              onClick={() =>
                setActiveSlideIndex(
                  (prev) => (prev - 1 + WALKTHROUGH_SLIDES.length) % WALKTHROUGH_SLIDES.length
                )
              }
              className="absolute -left-2 sm:-left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#f7f3ea] text-[#1c1917] border-2 border-[#1c1917] shadow-[3px_3px_0_#1c1917] hover:scale-105 transition flex items-center justify-center cursor-pointer z-20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Next Button */}
            <button
              type="button"
              aria-label="ถัดไป"
              onClick={() =>
                setActiveSlideIndex((prev) => (prev + 1) % WALKTHROUGH_SLIDES.length)
              }
              className="absolute -right-2 sm:-right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#f7f3ea] text-[#1c1917] border-2 border-[#1c1917] shadow-[3px_3px_0_#1c1917] hover:scale-105 transition flex items-center justify-center cursor-pointer z-20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Ticket Stub Dashed Perforation Line */}
          <div className="relative my-8 -mx-5 sm:-mx-8 md:-mx-10">
            <div className="border-t-2 border-dashed border-white/25" />
            <span className="absolute -left-3.5 -top-3.5 w-7 h-7 rounded-full bg-[#080817] border-r border-white/15" />
            <span className="absolute -right-3.5 -top-3.5 w-7 h-7 rounded-full bg-[#080817] border-l border-white/15" />
          </div>

          {/* Bottom Walkthrough Caption & CTA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-3">
              <span className="inline-block bg-[#f7f3ea] text-[#1c1917] px-3 py-1 text-xs font-mono font-bold rounded">
                {activeSlide.code}
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                {activeSlide.title}
              </h3>
              <p className="text-sm sm:text-base text-[#d6d3d1] leading-relaxed">
                {activeSlide.description}
              </p>
              <ul className="space-y-1.5 pt-2">
                {activeSlide.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-xs sm:text-sm text-[#e7e5e4]">
                    <CheckCircle2 className="w-4 h-4 text-[#34d399] shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between space-y-5 bg-[#0b0a1a] rounded-2xl p-5 border border-white/10">
              {/* Slide Indicator Dots */}
              <div className="flex items-center gap-2">
                {WALKTHROUGH_SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={`ไปยังสไลด์ที่ ${idx + 1}`}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      idx === activeSlideIndex
                        ? "w-7 bg-[#ff8a4c]"
                        : "w-2.5 bg-white/25 hover:bg-white/40"
                    }`}
                  />
                ))}
                <span className="ml-auto text-xs font-mono text-[#a8a29e]">
                  {activeSlideIndex + 1} / {WALKTHROUGH_SLIDES.length}
                </span>
              </div>

              <Link href={defaultDestination} className="block">
                <button
                  type="button"
                  className="w-full rounded-full border-2 border-[#080817] bg-[#ff8a4c] hover:bg-[#ff9b64] py-3.5 px-6 text-base font-extrabold text-[#080817] shadow-[4px_4px_0_#faf6ef] transition cursor-pointer"
                >
                  เข้าใช้งานระบบนี้ฟรีทันที →
                </button>
              </Link>

              <p className="text-xs text-[#a8a29e] text-center">
                ไม่ต้องติดตั้งโปรแกรมเสริม · เปิดใช้งานได้ครบทั้ง 7 โมดูลตั้งแต่วันแรก
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. The Real Problem (3-Column Contrast) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <span className="rounded-full bg-[#ff8a4c]/15 border border-[#ff8a4c]/30 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-widest text-[#ff8a4c]">
          THE REAL PROBLEM
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-4 leading-snug">
          ไม่ใช่ว่าคุณไม่มีวินัย…
          <br />
          <span className="text-[#ff8a4c]">แต่เครื่องมือที่คุณเคยใช้ มันซับซ้อนและแยกส่วนเกินไป</span>
        </h2>
        <p className="text-sm sm:text-base text-[#a8a29e] max-w-2xl mx-auto mt-3 mb-10">
          คนส่วนใหญ่ล้มเลิกการจัดระเบียบเพราะต้องคอยดูแลรักษาระบบที่ซับซ้อน Retzlo จึงรวมเฉพาะสิ่งที่ทำให้คุณทำงานเสร็จจริงไว้ในที่เดียว
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="rounded-2xl border border-rose-500/30 bg-[#1a1121] p-6 space-y-3">
            <span className="text-xs font-bold text-rose-300 bg-rose-500/15 px-3 py-1 rounded-full inline-block">
              ❌ วิธีเดิมที่คุ้นเคย
            </span>
            <h3 className="text-lg font-bold text-white">
              จดแยกหลายแอป (แชต, โน้ตมือถือ, สมุด, Trello)
            </h3>
            <p className="text-sm text-[#d6d3d1] leading-relaxed">
              ดูเหมือนสะดวกตอนจด แต่ข้อมูลกระจัดกระจาย พอจะหยิบมาทำงานจริงต้องนั่งค้นหาเป็นสิบนาที สุดท้ายลืมว่าจดไว้ที่ไหน
            </p>
          </div>

          <div className="rounded-2xl border border-rose-500/30 bg-[#1a1121] p-6 space-y-3">
            <span className="text-xs font-bold text-rose-300 bg-rose-500/15 px-3 py-1 rounded-full inline-block">
              ❌ พยายามสร้างระบบเองจากศูนย์
            </span>
            <h3 className="text-lg font-bold text-white">
              นั่งต่อตารางและผูกสูตร Database เองทีละหน้า
            </h3>
            <p className="text-sm text-[#d6d3d1] leading-relaxed">
              เสียเวลาลองผิดลองถูกกว่า 30–40 ชั่วโมง งงกับโครงสร้างที่ซับซ้อนเกินชีวิตจริง พอไม่ได้อัปเดต 2 วันระบบก็ร้างและถอดใจเลิกใช้
            </p>
          </div>

          <div className="rounded-2xl border-2 border-[#34d399] bg-[#0f2422] p-6 space-y-3 shadow-[6px_6px_0_#34d399]">
            <span className="text-xs font-bold text-[#080817] bg-[#34d399] px-3 py-1 rounded-full inline-block">
              ✓ ทางออกที่คนรักความสบายก็ใช้รอด
            </span>
            <h3 className="text-lg font-bold text-white">
              Retzlo Studio OS ที่พร้อมใช้งานทันทีใน 60 วินาที
            </h3>
            <p className="text-sm text-[#e7e5e4] leading-relaxed">
              มี AI ช่วยแตกงานย่อย เปิดเช้ามาเห็นเฉพาะงานที่ต้องทำวันนี้ ทำงานจบมีเหรียญแลกรางวัลและเพลง Lofi คลอเบา ๆ สร้างนิสัยดีได้แบบไม่ฝืนใจ
            </p>
          </div>
        </div>
      </section>

      {/* ── 10. Interactive Readiness Checklist (#check-readiness) ── */}
      <section id="check-readiness" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              <span className="text-[#ff8a4c]">เช็กความพร้อม</span> — ระบบนี้เหมาะกับคุณไหม?
            </h2>
            <p className="text-sm sm:text-base text-[#a8a29e] mt-2">
              ลองคลิกติ๊กข้อที่ตรงกับชีวิตคุณด้านล่าง หากตรงมากกว่า 3 ข้อขึ้นไป Retzlo จะเปลี่ยนการทำงานของคุณทันที
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#34d399]/40 bg-[#34d399]/15 px-4 py-2 text-xs font-mono font-bold text-[#34d399] self-start">
            <span>ตรงกับคุณแล้ว {checkedSuitability.length} / {SUITABLE_FOR_LIST.length} ข้อ</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left: Suitable For (Interactive Checkboxes!) */}
          <div className="rounded-2xl border-2 border-[#1c1917] bg-[#f7f3ea] text-[#1c1917] p-6 shadow-[6px_6px_0_#34d399]">
            <span className="inline-block rounded-full bg-[#dcfce7] text-[#14532d] px-3.5 py-1 text-xs sm:text-sm font-bold">
              ✓ เหมาะกับคุณมาก ถ้า… (คลิกเพื่อติ๊กเช็กได้)
            </span>
            <div className="mt-4 divide-y divide-[#e5dec9]">
              {SUITABLE_FOR_LIST.map((item, idx) => {
                const isChecked = checkedSuitability.includes(idx);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleSuitabilityItem(idx)}
                    className="w-full py-3.5 flex items-start gap-3 text-left cursor-pointer group"
                  >
                    <span
                      className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border-2 transition ${
                        isChecked
                          ? "bg-[#16a34a] border-[#1c1917] text-white"
                          : "bg-white border-[#a8a29e] text-transparent group-hover:border-[#16a34a]"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                    <span
                      className={`text-sm sm:text-base leading-relaxed ${
                        isChecked ? "font-bold text-[#1c1917]" : "text-[#44403c]"
                      }`}
                    >
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Not Suitable For */}
          <div className="rounded-2xl border border-white/15 bg-[#121028] p-6">
            <span className="inline-block rounded-full bg-white/10 text-[#d6d3d1] px-3.5 py-1 text-xs sm:text-sm font-bold">
              × อาจไม่เหมาะ ถ้า…
            </span>
            <div className="mt-4 divide-y divide-white/10">
              {NOT_SUITABLE_FOR_LIST.map((item) => (
                <div key={item} className="py-3.5 flex items-start gap-3">
                  <span className="mt-0.5 w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-xs font-mono text-[#a8a29e]">
                    ×
                  </span>
                  <span className="text-sm sm:text-base text-[#a8a29e] leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#78716c] mt-4 font-mono">
              * ถ้าตรงฝั่งขวานี้มากกว่า กดเปิดเพลง Lofi ฟังชิล ๆ อย่างเดียวก็ได้ครับ ไม่โกรธกัน 😄
            </p>
          </div>
        </div>

        {/* Dynamic Match Callout Banner */}
        <div className="mt-7 rounded-2xl border-2 border-[#ff8a4c] bg-[#161332] p-6 sm:p-7 shadow-[6px_6px_0_#ff8a4c] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-[#ff8a4c] text-[#080817] px-3 py-0.5 text-xs font-mono font-bold uppercase">
              {checkedSuitability.length >= 3
                ? `ตรงถึง ${checkedSuitability.length} ข้อ!`
                : "พร้อมเริ่มต้นหรือยัง?"}
            </span>
            <h3 className="text-lg sm:text-2xl font-extrabold text-white mt-2">
              งั้นไม่ต้องคิดนานแล้ว — ระบบนี้สร้างมาเพื่อปลดล็อกสมองของคุณ
            </h3>
            <p className="text-xs sm:text-sm text-[#d6d3d1] mt-1">
              เริ่มต้นใช้งานได้ฟรีทันที พร้อมฟีเจอร์ครบทุกโมดูลและคู่มือภาษาไทยในตัว
            </p>
          </div>
          <Link href={defaultDestination} className="shrink-0 w-full sm:w-auto">
            <button
              type="button"
              className="w-full sm:w-auto rounded-full border-2 border-[#080817] bg-[#ff8a4c] hover:bg-[#ff9b64] px-7 py-3.5 text-sm sm:text-base font-extrabold text-[#080817] shadow-[4px_4px_0_#faf6ef] transition cursor-pointer"
            >
              เข้าใช้งาน Retzlo ฟรีทันที →
            </button>
          </Link>
        </div>
      </section>

      {/* ── 11. Before vs After Transformation Grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            ชีวิตก่อนมีระบบ vs <span className="text-[#a9a2ff]">หลังจากใช้ Retzlo OS</span>
          </h2>
          <p className="text-sm sm:text-base text-[#a8a29e] mt-2">
            งานเดิม ภาระเดิม… แค่ย้ายจากในหัวไปอยู่ในที่ที่มันควรอยู่ แล้วคุณจะรู้สึกเบาสมองขึ้นทันที
          </p>
        </div>

        <div className="rounded-3xl border-2 border-[#1c1917] bg-[#f8f4eb] text-[#1c1917] overflow-hidden shadow-[8px_8px_0_#a9a2ff]">
          {/* Header Row */}
          <div className="grid grid-cols-12 items-center border-b-2 border-[#1c1917] text-xs sm:text-sm font-mono font-bold uppercase tracking-widest">
            <div className="col-span-5 py-4 px-4 text-center text-[#78716c]">BEFORE (ก่อนใช้)</div>
            <div className="col-span-2 py-4 text-center text-[#78716c]">→</div>
            <div className="col-span-5 py-4 px-4 text-center bg-[#e9e4ff] text-[#4338ca]">
              AFTER (หลังใช้ RETZLO OS)
            </div>
          </div>

          {/* Transformation Rows */}
          {BEFORE_AFTER_ROWS.map((row) => (
            <div
              key={row.moduleTag}
              className="grid grid-cols-12 items-center border-b border-[#e5dec9] last:border-b-0"
            >
              <div className="col-span-5 p-4 sm:p-5 text-xs sm:text-base text-[#57534e] text-center">
                {row.before}
              </div>
              <div className="col-span-2 text-center font-mono text-lg font-bold text-[#6366f1]">
                →
              </div>
              <div className="col-span-5 p-4 sm:p-5 bg-[#ffffff] text-center">
                <div className="text-xs sm:text-base font-bold text-[#1c1917]">{row.after}</div>
                <span className="inline-block mt-1.5 rounded-full bg-[#eef2ff] px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#4f46e5] uppercase tracking-wider">
                  {row.moduleTag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 12. Focus Station Interactive Cassette Player (#lofi-focus) ── */}
      <section id="lofi-focus" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-[#161432] to-[#0c0b1e] p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e5bd72]/35 bg-[#e5bd72]/10 px-3.5 py-1.5 text-xs text-[#e5bd72] font-mono uppercase tracking-widest">
                <Music className="w-3.5 h-3.5" />
                RETZLO SIGNATURE FOCUS STATION
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                เข้าสู่โซนสมาธิได้ทันทีด้วย{" "}
                <span className="text-[#e5bd72]">Retzlo Cassette Radio & Coffee Vibe</span>
              </h2>
              <p className="text-sm sm:text-base text-[#d6d3d1] leading-relaxed">
                ไม่ต้องเปิดแท็บ YouTube หาเพลงจนเผลอไถดูคลิปอื่น บนหัวเว็บของ Retzlo มีเครื่องเล่นเทป Lofi สังเคราะห์สด นาฬิกาหลอดไฟ Nixie Pomodoro และสวนเซนให้คุณกดเปิดได้ทุกเมื่อ
              </p>

              {/* Interactive Coffee Steam Box */}
              <div
                className="p-4 rounded-2xl border border-white/10 bg-[#0b0a1c] inline-flex items-center gap-4 select-none relative group"
                onMouseEnter={() => setSteamHovered(true)}
                onMouseLeave={() => setSteamHovered(false)}
              >
                <div className="relative">
                  <Coffee className="w-8 h-8 text-[#e5bd72] transition-transform duration-300 group-hover:scale-110" />
                  <svg
                    className="absolute -top-6 left-1.5 w-6 h-6 overflow-visible pointer-events-none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      className={`coffee-steam-path stroke-[#e5bd72] stroke-2 fill-none ${
                        steamHovered ? "running" : ""
                      }`}
                      d="M 6,24 C 6,18 10,14 10,10 C 10,6 6,4 6,0"
                      style={{ animationDuration: "3.5s" }}
                    />
                    <path
                      className={`coffee-steam-path stroke-[#a9a2ff] stroke-2 fill-none ${
                        steamHovered ? "running" : ""
                      }`}
                      d="M 12,24 C 12,19 8,16 8,11 C 8,6 12,4 12,0"
                      style={{ animationDuration: "5s", animationDelay: "1s" }}
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">
                    Mellow Focus Brew & Coffee Cheers
                  </p>
                  <p className="text-[11px] text-[#a8a29e] font-mono">
                    นำเมาส์มาวางเพื่อปล่อยไอร้อนกาแฟ · ส่งกาแฟให้เพื่อนร่วมทีมบนการ์ดได้จริง
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Vintage Cassette Deck */}
            <div className="flex justify-center">
              <div className="w-full max-w-md rounded-2xl border-2 border-[#e5bd72]/35 bg-[#090817] p-6 sm:p-7 shadow-[8px_8px_0_rgba(229,189,114,0.2)]">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[#e5bd72]" />
                    <span className="text-xs font-mono uppercase tracking-widest text-[#e5bd72]">
                      RETZLO DECK · C-60 SYNTH
                    </span>
                  </div>
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isPlaying
                        ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)] animate-pulse"
                        : "bg-[#57534e]"
                    }`}
                  />
                </div>

                <div className="my-6 bg-[#121026] border border-white/10 rounded-xl p-4">
                  <div className="relative h-32 bg-[#080716] rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
                    <div className="w-52 h-28 bg-[#1c1a36] border border-white/15 rounded-md flex flex-col justify-between p-2.5">
                      <div className="h-7 bg-gradient-to-r from-[#a9a2ff]/25 via-[#e5bd72]/25 to-[#ff8a4c]/25 border border-white/15 rounded flex items-center justify-center">
                        <span className="text-[10px] font-mono font-bold tracking-widest text-[#e5bd72]">
                          RETZLO LOFI STUDIO TAPE
                        </span>
                      </div>
                      <div className="flex justify-around items-center my-1">
                        <div className="w-9 h-9 rounded-full bg-[#090817] border border-white/15 flex items-center justify-center">
                          <Disc
                            className={`w-7 h-7 text-[#a9a2ff] ${
                              isPlaying ? "animate-spin [animation-duration:6s]" : ""
                            }`}
                          />
                        </div>
                        <div className="px-2 py-0.5 bg-[#090817] rounded border border-white/10 font-mono text-[9px] text-[#e5bd72]">
                          {isPlaying ? "PLAYING" : "PAUSED"}
                        </div>
                        <div className="w-9 h-9 rounded-full bg-[#090817] border border-white/15 flex items-center justify-center">
                          <Disc
                            className={`w-7 h-7 text-[#a9a2ff] ${
                              isPlaying ? "animate-spin [animation-duration:6s]" : ""
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VU Needles */}
                  <div className="flex gap-3 mt-3">
                    {[
                      { label: "VU-L", level: vuLevelL },
                      { label: "VU-R", level: vuLevelR }
                    ].map((vu) => (
                      <div
                        key={vu.label}
                        className="flex-1 bg-[#080716] border border-white/10 rounded p-2 relative h-9 overflow-hidden"
                      >
                        <div className="absolute left-2 top-1 font-mono text-[8px] text-[#a8a29e]">
                          {vu.label}
                        </div>
                        <div
                          className="absolute bottom-0 left-1/2 w-0.5 h-7 bg-[#ff8a4c] origin-bottom transition-transform duration-100"
                          style={{ transform: `translateX(-50%) rotate(${vu.level - 28}deg)` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePlayToggle}
                  className={`w-full py-3.5 rounded-full font-extrabold text-sm uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer border-2 border-[#080817] ${
                    isPlaying
                      ? "bg-[#34d399] text-[#080817] shadow-[4px_4px_0_#faf6ef]"
                      : "bg-[#e5bd72] text-[#080817] shadow-[4px_4px_0_#faf6ef] hover:translate-y-[-1px]"
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>หยุดเล่นวิทยุเทป (Stop Tape)</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>กดเล่นเพลงโฟกัส (Play Focus Beats)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 13. Community Voices (3 Detailed Story Cards) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            เสียงจากผู้ใช้งานจริง
          </h2>
          <p className="text-sm sm:text-base text-[#a8a29e] mt-2">
            จากคนที่เคยแบกงานไว้ในหัว มาเป็นคนที่วางใจให้ Retzlo ช่วยจำแทน
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COMMUNITY_TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border-2 border-white/15 bg-[#13112a] p-6 flex flex-col justify-between shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#ff8a4c] text-sm tracking-widest">★★★★★</span>
                  <div className="relative w-9 h-9">
                    <Image
                      src={t.avatarSticker}
                      alt={t.name}
                      fill
                      sizes="36px"
                      className="object-contain"
                    />
                  </div>
                </div>
                <div className="text-sm font-bold text-[#e5bd72]">{t.highlight}</div>
                <blockquote className="text-xs sm:text-sm text-[#d6d3d1] leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
              </div>
              <div className="pt-4 mt-5 border-t border-white/10">
                <div className="text-sm font-bold text-white">— {t.name}</div>
                <div className="text-xs text-[#a8a29e]">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 14. Comparison Table & Value Package Box (#offer & #cp-price-box) ── */}
      <section id="offer" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-8">
          เปรียบเทียบชัด ๆ: นั่งสร้างตารางเอง, ใช้หลายแอปแยกกัน หรือใช้{" "}
          <span className="text-[#ff8a4c]">Retzlo OS</span>?
        </h2>

        <div className="overflow-x-auto rounded-2xl border-2 border-[#1c1917] bg-[#f7f3ea] text-[#1c1917] shadow-[8px_8px_0_#a9a2ff]">
          <table className="w-full min-w-[680px] border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b-2 border-[#1c1917] bg-[#ece6d7]">
                <th className="p-4 font-extrabold text-[#1c1917]">หัวข้อเปรียบเทียบ</th>
                <th className="p-4 font-bold text-[#57534e]">สร้างระบบเอง</th>
                <th className="p-4 font-bold text-[#57534e]">ใช้หลายแอปแยกกัน</th>
                <th className="p-4 font-extrabold text-[#4338ca] bg-[#e0e7ff]">
                  ✦ Retzlo Studio OS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dfd8c8]">
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.feature}>
                  <td className="p-4 font-bold text-[#292524]">{row.feature}</td>
                  <td className="p-4 text-[#57534e]">{row.diy}</td>
                  <td className="p-4 text-[#57534e]">{row.multiApp}</td>
                  <td className="p-4 font-bold text-[#1e1b4b] bg-[#eef2ff]">{row.retzlo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Value Package Box (#cp-price-box) */}
        <div
          id="cp-price-box"
          className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          <div className="lg:col-span-5 space-y-4">
            <span className="rounded-full bg-[#e5bd72]/20 border border-[#e5bd72]/40 px-3.5 py-1 text-xs font-mono font-bold text-[#e5bd72]">
              ALL-IN-ONE STUDIO ACCESS
            </span>
            <h3 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              ปิด 47 แท็บในหัว
              <br />
              <span className="text-[#ff8a4c]">เริ่มต้นใช้งานได้ฟรีตั้งแต่วันนี้</span>
            </h3>
            <p className="text-sm sm:text-base text-[#d6d3d1] leading-relaxed">
              เราสร้าง Retzlo ขึ้นมาเพื่อให้ทุกคนมีพื้นที่ทำงานที่สงบ เป็นระเบียบ และมีความสุขกับการเคลียร์งานในทุก ๆ วัน
            </p>
            <div className="pt-2 flex items-center gap-4">
              <div className="relative w-16 h-16">
                <Image
                  src="/stickers/retro/retro-sticker-25-mascot-blob.png"
                  alt="Retzlo Mascot"
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </div>
              <div className="text-xs text-[#a8a29e] font-mono">
                <div>✓ ไม่ต้องลงโปรแกรมเสริม</div>
                <div>✓ ข้อมูลปลอดภัยตามมาตรฐาน PDPA</div>
                <div>✓ พร้อมคู่มือ Interactive ภาษาไทยในแอป</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-3xl border-2 border-[#1c1917] bg-[#f7f3ea] text-[#1c1917] p-6 sm:p-9 shadow-[10px_10px_0_#ff8a4c]">
            <div className="text-sm sm:text-base font-extrabold text-[#1c1917] mb-4">
              สิ่งที่คุณจะได้รับทั้งหมดในบัญชี Retzlo ของคุณ:
            </div>
            <div className="space-y-2.5 text-xs sm:text-sm border-b-2 border-[#1c1917] pb-4">
              {[
                { item: "📦 ระบบ Multi-Workspace + Kanban & Table Board ไม่จำกัด", val: "มูลค่า 1,490.-" },
                { item: "🤖 ผู้ช่วย AI Task Breakdown & AI Board Summary อัจฉริยะ", val: "มูลค่า 990.-" },
                { item: "📅 ปฏิทินรวมกำหนดส่งอัตโนมัติ + คลังโน้ต & ไดอารี่ส่วนตัว", val: "มูลค่า 690.-" },
                { item: "🎧 วิทยุ Lofi C-60 + นาฬิกา Nixie Pomodoro + สวนเซน 10 พันธุ์ไม้", val: "มูลค่า 590.-" },
                { item: "🎨 ชุดสติกเกอร์เรโทรลิขสิทธิ์ 40+ แบบ & ระบบเหรียญแลกรางวัล", val: "มูลค่า 390.-" }
              ].map((line) => (
                <div key={line.item} className="flex items-center justify-between gap-2">
                  <span className="font-medium text-[#292524]">{line.item}</span>
                  <span className="font-mono font-bold text-[#78716c] shrink-0 line-through">
                    {line.val}
                  </span>
                </div>
              ))}
            </div>

            <div className="my-5 flex items-baseline gap-3 flex-wrap">
              <span className="text-base text-[#78716c] line-through">รวมมูลค่า 4,150 บาท</span>
              <span className="text-4xl sm:text-6xl font-extrabold text-[#1c1917]">FREE</span>
              <span className="text-base sm:text-lg font-bold text-[#15803d]">
                (เปิดให้เข้าใช้งานฟรีทันที!)
              </span>
            </div>

            <Link href={defaultDestination} className="block">
              <button
                type="button"
                className="w-full rounded-full border-2 border-[#1c1917] bg-[#ff8a4c] hover:bg-[#ff9b64] py-4 px-6 text-base sm:text-xl font-extrabold text-[#1c1917] shadow-[5px_5px_0_#1c1917] hover:translate-y-[-2px] transition cursor-pointer"
              >
                สร้าง Workspace และเริ่มใช้งานทันที →
              </button>
            </Link>

            <div className="mt-5 rounded-2xl border-2 border-[#1c1917] bg-[#ffffff] p-4 flex items-center gap-3.5">
              <ShieldCheck className="w-8 h-8 text-[#16a34a] shrink-0" />
              <div className="text-xs sm:text-sm text-[#292524]">
                <strong>พร้อมใช้งานใน 60 วินาที:</strong> สมัครสมาชิกง่าย ๆ แล้วสร้างโปรเจกต์แรกของคุณได้ทันที มีโหมดทดลองเล่นในหน้า System Guide ให้ดูครบทุกส่วน
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 15. Dual-Row Auto-Scrolling FAQ Marquee (#faq) ── */}
      <section id="faq" className="py-16 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center mb-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            คำถามที่พบบ่อย (FAQ)
          </h2>
          <p className="text-sm sm:text-base text-[#a8a29e] mt-2">
            ตอบทุกข้อสงสัย เพื่อให้คุณเริ่มต้นจัดระเบียบชีวิตกับ Retzlo ได้อย่างมั่นใจ
          </p>
        </div>

        {/* Row 1 Marquee */}
        <div className="overflow-hidden py-2">
          <div className="retzlo-marquee-track flex gap-5 w-max">
            {[...FAQ_ROW_1, ...FAQ_ROW_1].map((faq, idx) => (
              <div
                key={`${faq.code}-${idx}`}
                className="w-[320px] sm:w-[360px] shrink-0 rounded-2xl border-2 border-[#1c1917] bg-[#f7f3ea] text-[#1c1917] p-5 shadow-[5px_5px_0_#a9a2ff] flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-mono font-bold text-[#ff8a4c]">{faq.code}</div>
                  <h3 className="text-base font-extrabold text-[#1c1917] mt-1">{faq.question}</h3>
                  <p className="text-xs sm:text-sm text-[#44403c] mt-2 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 Marquee */}
        <div className="overflow-hidden py-2 mt-4">
          <div
            className="retzlo-marquee-track flex gap-5 w-max"
            style={{ animationDirection: "reverse", animationDuration: "36s" }}
          >
            {[...FAQ_ROW_2, ...FAQ_ROW_2].map((faq, idx) => (
              <div
                key={`${faq.code}-${idx}`}
                className="w-[320px] sm:w-[360px] shrink-0 rounded-2xl border border-white/15 bg-[#14122d] text-[#f5efe6] p-5 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-mono font-bold text-[#e5bd72]">{faq.code}</div>
                  <h3 className="text-base font-extrabold text-white mt-1">{faq.question}</h3>
                  <p className="text-xs sm:text-sm text-[#d6d3d1] mt-2 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 16. Giant Display Typography + Final Night Sanctuary CTA ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-hidden select-none pointer-events-none">
        <div className="text-[54px] sm:text-[110px] lg:text-[155px] font-black leading-[0.82] tracking-tighter text-[#1b1838] whitespace-nowrap">
          second brain
        </div>
      </div>

      <section className="relative border-t border-white/10 bg-[#0c0a1f] py-20 md:py-28 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="mx-auto relative w-24 h-24">
            <Image
              src="/stickers/retro/retro-sticker-07-moon.png"
              alt="Peaceful Night"
              fill
              sizes="96px"
              className="object-contain"
            />
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            คืนนี้… ปล่อยให้สมองได้พักผ่อนจริง ๆ เสียที
          </h2>
          <p className="text-sm sm:text-lg text-[#d6d3d1] leading-relaxed">
            ย้ายงานที่คั่งค้าง ไอเดียที่กระจัดกระจาย และเรื่องที่กลัวลืม ออกจากหัวมาไว้ในสตูดิโอที่ปลอดภัย
            <br className="hidden sm:inline" />
            ให้คุณหลับสบายโดยไม่ต้องกังวล แล้วตื่นเช้ามาพร้อมลุยงานสำคัญได้ทันที
          </p>
          <div className="pt-2">
            <Link href={defaultDestination}>
              <button
                type="button"
                className="inline-flex items-center gap-2.5 rounded-full border-2 border-[#faf6ef] bg-[#ff8a4c] hover:bg-[#ff9b64] px-9 py-4 text-base sm:text-xl font-extrabold text-[#080817] shadow-[6px_6px_0_#faf6ef] hover:translate-y-[-2px] transition cursor-pointer"
              >
                <span>เริ่มต้นใช้งาน Retzlo ฟรีตอนนี้</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
          <p className="text-xs font-mono text-[#a8a29e]">
            พัฒนาสำหรับนักสร้างสรรค์และทีมยุคใหม่ · เมนูและคู่มือรองรับทั้งภาษาไทยและอังกฤษ
          </p>
        </div>
      </section>

      {/* ── 17. Footer ── */}
      <footer className="border-t border-white/10 bg-[#060613] px-6 py-12 pb-28 text-[#a8a29e] text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#f5efe6] text-sm tracking-wider">Retzlo</span>
            <span className="text-[#44403c]">|</span>
            <p>© {new Date().getFullYear()} Retzlo Platform. All rights reserved.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/help" className="hover:text-white transition-colors">
              System Guide (คู่มือการใช้งาน)
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
            <span className="font-mono text-[#78716c] tracking-wider">RETZLO_OS_V2</span>
          </div>
        </div>
      </footer>

      {/* ── 18. Sticky Bottom CTA Bar (Appears on Scroll like Sloth cp-sticky-cta-bar) ── */}
      {showStickyBar && (
        <div
          role="region"
          aria-label="แถบเข้าใช้งานด่วน"
          className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-6 z-40 max-w-4xl mx-auto rounded-2xl border-2 border-[#1c1917] bg-[#f7f3ea]/95 backdrop-blur-md px-4 py-2.5 shadow-[6px_6px_0_#080817] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-10 h-10 rounded-full border-2 border-[#1c1917] bg-white shrink-0 p-1">
              <Image
                src="/stickers/retro/retro-sticker-09-headphones.png"
                alt="Retzlo"
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-extrabold text-[#1c1917] truncate">
                ปลดล็อกสมอง ให้ระบบ Retzlo จำแทนคุณ
              </div>
              <div className="text-[11px] font-mono text-[#57534e] truncate">
                ใช้งานฟรีครบ 7 โมดูล · AI แตกงาน · วิทยุ Lofi & สวนเซน
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePlayToggle}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border-2 border-[#1c1917] bg-white px-3 py-1.5 text-xs font-mono font-bold text-[#1c1917] cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? "Pause Lofi" : "Play Lofi"}</span>
            </button>
            <Link href={defaultDestination}>
              <button
                type="button"
                className="rounded-full border-2 border-[#1c1917] bg-[#ff8a4c] hover:bg-[#ff9b64] px-4 sm:px-5 py-2 text-xs sm:text-sm font-extrabold text-[#1c1917] shadow-[3px_3px_0_#1c1917] cursor-pointer whitespace-nowrap"
              >
                เข้าใช้งานฟรีทันที →
              </button>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
