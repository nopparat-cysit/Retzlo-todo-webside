"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, type PointerEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Circle,
  Disc3,
  LayoutGrid,
  Menu,
  Pause,
  Play,
  RotateCcw,
  X,
  ChevronDown
} from "lucide-react";
import { MixtapeArtwork } from "@/components/auth/mixtape-artwork";
import { MixtapeLogoMark } from "@/components/auth/mixtape-logo-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  PAIN_POINT_TABS,
  WALKTHROUGH_SLIDES,
  SUITABLE_FOR_LIST,
  NOT_SUITABLE_FOR_LIST,
  COMPARISON_ROWS,
  FAQ_ITEMS
} from "./landing-data";
import { WalkthroughMockupScreen } from "./walkthrough-mockup";

interface MarketingSessionUser {
  name?: string | null;
  email?: string | null;
}

const HERO_STAGES = ["To do", "In progress", "Done"] as const;

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<MarketingSessionUser | null>(null);
  const [defaultDestination, setDefaultDestination] = useState<string>("/projects");

  // Interactive Hero state (matching MixtapeAuthScene)
  const artRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [heroStage, setHeroStage] = useState(0);

  // Interactive sections state
  const [activePainIndex, setActivePainIndex] = useState(0);
  const [activeWalkthroughIndex, setActiveWalkthroughIndex] = useState(0);
  const [checkedReadiness, setCheckedReadiness] = useState<number[]>([0, 1]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Web Audio API refs for warm Lofi chord player
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Session check (preserves auth-navigation.test.ts contract)
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

    loadSession();
    return () => {
      isMounted = false;
    };
  }, [router]);

  function moveArtwork(event: PointerEvent<HTMLDivElement>) {
    if (
      event.pointerType !== "mouse" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--scene-x", `${x * 8}px`);
    event.currentTarget.style.setProperty("--scene-y", `${y * 8}px`);
  }

  function resetArtwork() {
    artRef.current?.style.setProperty("--scene-x", "0px");
    artRef.current?.style.setProperty("--scene-y", "0px");
  }

  // Warm Web Audio Lofi Synthesizer
  const startSynth = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;

      const masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.07, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);

      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(400, audioCtx.currentTime);
      filter.Q.setValueAtTime(1.1, audioCtx.currentTime);
      filter.connect(masterGain);

      const chords = [
        [130.81, 164.81, 196.0, 246.94],
        [110.0, 130.81, 164.81, 196.0],
        [146.83, 174.61, 220.0, 261.63],
        [98.0, 123.47, 146.83, 174.61]
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

      let currentChordIdx = 0;
      const playChord = () => {
        const chord = chords[currentChordIdx];
        oscillators.forEach((osc, idx) => {
          osc.frequency.setValueAtTime(chord[idx], audioCtx.currentTime);
          osc.detune.setValueAtTime(Math.random() * 10 - 5, audioCtx.currentTime);
          oscGains[idx].gain.cancelScheduledValues(audioCtx.currentTime);
          oscGains[idx].gain.setValueAtTime(
            oscGains[idx].gain.value,
            audioCtx.currentTime
          );
          oscGains[idx].gain.linearRampToValueAtTime(
            0.25,
            audioCtx.currentTime + 0.8
          );
        });
        currentChordIdx = (currentChordIdx + 1) % chords.length;
      };

      playChord();
      const chordScheduler = setInterval(() => {
        if (audioCtx.state === "suspended") return;
        playChord();
      }, 4200);

      (
        audioCtx as AudioContext & {
          _chordScheduler?: ReturnType<typeof setInterval>;
        }
      )._chordScheduler = chordScheduler;
    } catch {
      // Ignore if browser blocks audio
    }
  };

  const stopSynth = () => {
    if (audioCtxRef.current) {
      const ctxWithTimer = audioCtxRef.current as AudioContext & {
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
        const ctxWithTimer = audioCtxRef.current as AudioContext & {
          _chordScheduler?: ReturnType<typeof setInterval>;
        };
        if (ctxWithTimer._chordScheduler) {
          clearInterval(ctxWithTimer._chordScheduler);
        }
        audioCtxRef.current.close();
      }
    };
  }, []);

  const toggleReadinessItem = (idx: number) => {
    setCheckedReadiness((prev) =>
      prev.includes(idx) ? prev.filter((item) => item !== idx) : [...prev, idx]
    );
  };

  const activePain = PAIN_POINT_TABS[activePainIndex] || PAIN_POINT_TABS[0];
  const activeSlide =
    WALKTHROUGH_SLIDES[activeWalkthroughIndex] || WALKTHROUGH_SLIDES[0];

  return (
    <main
      style={{
        minHeight: "100svh",
        background:
          "radial-gradient(ellipse at 10% 6%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 60%), var(--background)",
        color: "var(--foreground)"
      }}
    >
      {/* ── Top Navigation Bar ──────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid var(--border)",
          background: "color-mix(in srgb, var(--background) 88%, transparent)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)"
        }}
      >
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5"
            style={{
              fontSize: "26px",
              fontWeight: 750,
              letterSpacing: "-1.2px",
              color: "var(--foreground)"
            }}
          >
            <MixtapeLogoMark />
            <span>retzlo</span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-7"
            style={{ fontSize: "13px", color: "var(--muted)" }}
          >
            <a href="#pain-tabs" className="hover:opacity-100 transition-opacity">
              ปัญหาที่อยากแก้
            </a>
            <a href="#walkthrough" className="hover:opacity-100 transition-opacity">
              พาชมห้องทำงาน
            </a>
            <a href="#comparison" className="hover:opacity-100 transition-opacity">
              ความเหมาะสม
            </a>
            <a href="#faq" className="hover:opacity-100 transition-opacity">
              คำถามที่พบบ่อย
            </a>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle variant="icon" />

            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/profile"
                  style={{ fontSize: "13px", color: "var(--muted)" }}
                  className="px-3 py-1.5 truncate max-w-[150px]"
                >
                  {currentUser.name || currentUser.email || "Workspace user"}
                </Link>
                <Link href={defaultDestination}>
                  <button
                    style={{
                      padding: "9px 16px",
                      borderRadius: "10px",
                      border: "1px solid var(--accent)",
                      background: "var(--accent)",
                      color: "var(--background)",
                      fontSize: "12px",
                      fontWeight: 600
                    }}
                  >
                    Enter Workspace
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--muted)",
                    padding: "8px 12px"
                  }}
                >
                  Sign In
                </Link>
                <Link href={defaultDestination}>
                  <button
                    style={{
                      padding: "9px 16px",
                      borderRadius: "10px",
                      border: "1px solid var(--accent)",
                      background: "var(--accent)",
                      color: "var(--background)",
                      fontSize: "12px",
                      fontWeight: 600
                    }}
                  >
                    Enter Workspace
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle variant="icon" />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ padding: "8px", color: "var(--foreground)" }}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div
            className="md:hidden px-6 py-5 space-y-3"
            style={{
              borderTop: "1px solid var(--border)",
              background: "var(--panel-strong)"
            }}
          >
            <a
              href="#pain-tabs"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm"
            >
              ปัญหาที่อยากแก้
            </a>
            <a
              href="#walkthrough"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm"
            >
              พาชมห้องทำงาน
            </a>
            <a
              href="#comparison"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm"
            >
              ความเหมาะสม
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm"
            >
              คำถามที่พบบ่อย
            </a>
            <div
              className="pt-3 flex flex-col gap-2"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              {currentUser ? (
                <>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full py-2 text-sm text-left">
                      {currentUser.name || currentUser.email || "Workspace user"}
                    </button>
                  </Link>
                  <Link
                    href={defaultDestination}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <button
                      className="w-full py-2.5 rounded-lg text-sm font-semibold"
                      style={{
                        background: "var(--accent)",
                        color: "var(--background)"
                      }}
                    >
                      Enter Workspace
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full py-2 text-sm">Sign In</button>
                  </Link>
                  <Link
                    href={defaultDestination}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <button
                      className="w-full py-2.5 rounded-lg text-sm font-semibold"
                      style={{
                        background: "var(--accent)",
                        color: "var(--background)"
                      }}
                    >
                      Enter Workspace
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Section 1: Editorial Mixtape Hero (#cp-hero) ────────────── */}
      <section id="cp-hero" className="max-w-[1240px] mx-auto px-5 sm:px-8 pt-6 pb-16 sm:py-12">
        <div
          className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden"
          style={{
            border: "1px solid var(--border)",
            borderRadius: "28px",
            boxShadow: "var(--shadow-floating)",
            background: "var(--panel-strong)"
          }}
        >
          {/* Left 6 Cols: Editorial Copy */}
          <div className="lg:col-span-6 p-7 sm:p-12 md:p-14 flex flex-col justify-between gap-10">
            <div className="space-y-6">
              <span
                style={{
                  display: "inline-block",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "2px",
                  color: "var(--accent)"
                }}
              >
                A QUIET WORKSPACE FOR EVERYDAY FLOW
              </span>

              <h1
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "clamp(36px, 4.2vw, 54px)",
                  lineHeight: 1.12,
                  letterSpacing: "-1.8px",
                  fontWeight: 500,
                  color: "var(--foreground)"
                }}
              >
                จัดระเบียบงานและชีวิต
                <br />
                ในจังหวะที่ไม่เร่งรีบ
              </h1>

              <p
                style={{
                  fontSize: "15px",
                  lineHeight: 1.75,
                  color: "var(--muted)",
                  maxWidth: "46ch"
                }}
              >
                พื้นที่ทำงานที่รวมบอร์ดงาน ปฏิทินกำหนดส่ง สมุดโน้ต
                และบันทึกประจำวันไว้ในห้องเดียวกัน เปิดเพลงคลอเบาๆ
                แล้วค่อยๆ ขยับงานทีละชิ้นให้จบในแต่ละวันโดยไม่ต้องสลับหลายแอป
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href={defaultDestination}>
                  <button
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      height: "50px",
                      padding: "0 24px",
                      borderRadius: "12px",
                      border: "1px solid var(--accent)",
                      background: "var(--accent)",
                      color: "var(--background)",
                      fontSize: "14px",
                      fontWeight: 600
                    }}
                  >
                    <span>เริ่มจัดพื้นที่ของคุณ</span>
                    <ArrowRight size={15} />
                  </button>
                </Link>

                <a
                  href="#walkthrough"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: "50px",
                    padding: "0 20px",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    background: "var(--paper)",
                    color: "var(--foreground)",
                    fontSize: "14px",
                    fontWeight: 500
                  }}
                >
                  ดูห้องทำงานทั้ง 6 ส่วน
                </a>
              </div>
            </div>

            {/* Quiet Footnote */}
            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "18px",
                display: "flex",
                flexWrap: "wrap",
                gap: "20px",
                fontSize: "12px",
                color: "var(--muted)"
              }}
            >
              <span>บอร์ดงาน · ตาราง · ปฏิทิน · สมุดโน้ต · ไดอารี่</span>
              <span>·</span>
              <span>พร้อมใช้งานทันทีบนเว็บ</span>
            </div>
          </div>

          {/* Right 6 Cols: Interactive Mixtape Scene (Shared with Login/Register) */}
          <div
            ref={artRef}
            onPointerMove={moveArtwork}
            onPointerLeave={resetArtwork}
            className="lg:col-span-6 relative overflow-hidden flex flex-col justify-between p-7 sm:p-10 min-h-[460px] lg:min-h-[580px]"
            style={{
              background:
                "linear-gradient(180deg, #5942b8 0%, #7858d4 42%, #b184e7 65%, #ffb4d5 100%)",
              color: "#fff5ff",
              isolation: "isolate"
            }}
          >
            <MixtapeArtwork />

            {/* Top Scene Header */}
            <div className="relative z-10 flex items-center justify-between text-[10px] tracking-[2px] text-[#e4d2f8]">
              <span>SIDE A · YOUR DAILY MIX</span>
              <span>VOL. 01</span>
            </div>

            {/* Interactive Floating Board Card + Tilted Paper Sticker */}
            <div className="relative z-10 my-auto py-8 flex flex-col items-end">
              <div
                style={{
                  width: "min(270px, 100%)",
                  padding: "15px",
                  border: "1px solid rgba(231, 214, 255, 0.55)",
                  borderRadius: "14px",
                  background: "rgba(93, 59, 139, 0.9)",
                  boxShadow: "0 14px 36px rgba(26, 11, 69, 0.25)",
                  backdropFilter: "blur(16px)"
                }}
              >
                <div className="flex items-center justify-between text-[9px] tracking-[1px] mb-3 text-[#eadcf8]">
                  <span className="flex items-center gap-1.5">
                    <LayoutGrid size={12} /> MY DAILY BOARD
                  </span>
                  <span>TRY CLICKING</span>
                </div>

                <div className="flex justify-between gap-1 mb-3">
                  {HERO_STAGES.map((name, idx) => (
                    <span
                      key={name}
                      className="flex items-center gap-1 text-[9px]"
                      style={{
                        color: idx === heroStage ? "#fff5ff" : "#d7c1ec",
                        opacity: idx === heroStage ? 1 : 0.65
                      }}
                    >
                      <span
                        style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          background:
                            idx === 0
                              ? "#c4b5fd"
                              : idx === 1
                                ? "#f6c976"
                                : "#92d9bb"
                        }}
                      />
                      {name}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setHeroStage((current) => (current + 1) % HERO_STAGES.length)
                  }
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    textAlign: "left",
                    gap: "10px",
                    width: "100%",
                    padding: "14px 13px",
                    borderRadius: "9px",
                    border: "1px solid #f6e6ff",
                    background: "#fff5fc",
                    color: "#432369",
                    cursor: "pointer"
                  }}
                >
                  <span
                    style={{
                      fontSize: "8px",
                      letterSpacing: "1px",
                      color: "#9164a0"
                    }}
                  >
                    TODAY&apos;S FOCUS CARD
                  </span>
                  <strong style={{ fontSize: "13px", lineHeight: 1.35 }}>
                    {heroStage === 2
                      ? "เสร็จไปอีกหนึ่งชิ้น พักดื่มกาแฟได้เลย"
                      : "จัดลำดับ 3 งานสำคัญของวันนี้"}
                  </strong>
                  <span
                    className="flex items-center gap-1.5 text-[10px] mt-1"
                    style={{ color: "#846393" }}
                  >
                    {heroStage === 2 ? <Check size={12} /> : <Circle size={12} />}
                    <span>
                      {heroStage === 2
                        ? "Done for today"
                        : "คลิกเพื่อขยับสถานะการ์ด"}
                    </span>
                    <span className="ml-auto">
                      {heroStage === 2 ? (
                        <RotateCcw size={13} />
                      ) : (
                        <ArrowRight size={13} />
                      )}
                    </span>
                  </span>
                </button>
              </div>

              {/* Tilted Paper Callout Sticker */}
              <div
                className="mt-4 mr-4"
                style={{
                  transform: "rotate(-6deg)",
                  background: "#ffecb1",
                  border: "1px solid #54356b",
                  color: "#54356b",
                  padding: "10px 18px",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontStyle: "italic",
                  fontSize: "19px",
                  lineHeight: 1.15,
                  boxShadow: "4px 4px 0 rgba(84, 53, 107, 0.2)"
                }}
              >
                less rush,
                <br />
                <strong>more rhythm.</strong>
              </div>
            </div>

            {/* Bottom Audio Cassette Bar */}
            <div className="relative z-10 flex items-center justify-between gap-4 pt-2">
              <div>
                <span
                  style={{
                    display: "block",
                    fontSize: "9px",
                    letterSpacing: "1.8px",
                    color: "#4f3179",
                    fontWeight: 600
                  }}
                >
                  LOFI CHORD SYNTHESIZER
                </span>
                <span
                  className="flex items-center gap-2 mt-1.5 text-xs font-medium"
                  style={{ color: "#432369" }}
                >
                  <Disc3
                    size={15}
                    className={isPlaying ? "animate-spin" : undefined}
                  />
                  {isPlaying
                    ? "กำลังบรรเลงเสียงคอร์ด Lofi..."
                    : "กดปุ่มขวาเพื่อเปิดเสียงเพลงคลอเบาๆ"}
                </span>
              </div>

              <button
                type="button"
                onClick={handlePlayToggle}
                aria-label={isPlaying ? "Pause Lofi audio" : "Play Lofi audio"}
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  border: "1px solid rgba(101, 64, 143, 0.45)",
                  background: "rgba(255, 245, 255, 0.45)",
                  color: "#432369",
                  cursor: "pointer"
                }}
              >
                {isPlaying ? <Pause size={17} /> : <Play size={17} />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Everyday Friction Index (#pain-tabs) ─────────── */}
      <section
        id="pain-tabs"
        className="max-w-[1240px] mx-auto px-5 sm:px-8 py-16 sm:py-24"
      >
        <div className="max-w-2xl space-y-3 mb-10">
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "2px",
              color: "var(--accent)"
            }}
          >
            01 / EVERYDAY FRICTION
          </span>
          <h2
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "clamp(28px, 3.2vw, 40px)",
              lineHeight: 1.18,
              letterSpacing: "-1.2px",
              fontWeight: 500
            }}
          >
            ปัญหาเล็กๆ ในแต่ละวันที่ทำให้เราเหนื่อยกว่าที่ควร
          </h2>
          <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: 1.7 }}>
            หลายครั้งที่งานไม่เดิน ไม่ใช่เพราะเราไม่ตั้งใจ
            แต่เป็นเพราะข้อมูลและเครื่องมือกระจัดกระจายอยู่คนละที่
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 5 Cols: Vertical Index List */}
          <div className="lg:col-span-5 flex flex-col gap-2">
            {PAIN_POINT_TABS.map((tab, idx) => {
              const isSelected = idx === activePainIndex;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePainIndex(idx)}
                  className="text-left transition-colors"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "16px 18px",
                    borderRadius: "14px",
                    border: "1px solid var(--border)",
                    background: isSelected ? "var(--panel-strong)" : "transparent",
                    boxShadow: isSelected ? "var(--shadow-panel)" : "none"
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: isSelected ? "var(--accent)" : "var(--muted)"
                    }}
                  >
                    {tab.num}
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? "var(--foreground)" : "var(--muted)"
                    }}
                  >
                    {tab.tabLabel}
                  </span>
                  <ArrowRight
                    size={14}
                    className="ml-auto shrink-0"
                    style={{
                      opacity: isSelected ? 1 : 0,
                      color: "var(--accent)"
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* Right 7 Cols: Editorial Paper Sheet */}
          <div
            className="lg:col-span-7 p-6 sm:p-9 space-y-7"
            style={{
              border: "1px solid var(--border)",
              borderRadius: "20px",
              background: "var(--panel-strong)",
              boxShadow: "var(--shadow-panel)"
            }}
          >
            {/* Before */}
            <div className="space-y-2.5">
              <span
                style={{
                  fontSize: "10px",
                  letterSpacing: "1.6px",
                  color: "var(--muted)",
                  fontWeight: 600
                }}
              >
                ภาพที่คุ้นเคย
              </span>
              <h3
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "22px",
                  fontWeight: 500,
                  lineHeight: 1.3,
                  color: "var(--foreground)"
                }}
              >
                {activePain.title}
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  lineHeight: 1.7,
                  color: "var(--muted)"
                }}
              >
                {activePain.beforeText}
              </p>
            </div>

            {/* Divider */}
            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "22px"
              }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2.5">
                <div style={{ position: "relative", width: "22px", height: "22px" }}>
                  <Image
                    src={activePain.iconSrc}
                    alt=""
                    fill
                    sizes="22px"
                    className="object-contain"
                  />
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    letterSpacing: "1.6px",
                    color: "var(--accent)",
                    fontWeight: 600
                  }}
                >
                  เมื่อย้ายมาอยู่ใน RETZLO
                </span>
              </div>

              <h4
                style={{
                  fontSize: "17px",
                  fontWeight: 600,
                  color: "var(--foreground)"
                }}
              >
                {activePain.afterTitle}
              </h4>
              <p
                style={{
                  fontSize: "14px",
                  lineHeight: 1.7,
                  color: "var(--muted)"
                }}
              >
                {activePain.afterText}
              </p>

              {/* Mini Paper Preview */}
              <div
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "16px",
                  background: "var(--paper)",
                  marginTop: "12px"
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--muted)",
                    marginBottom: "10px"
                  }}
                >
                  {activePain.previewTitle}
                </div>
                <div className="space-y-2">
                  {activePain.previewItems.map((item) => (
                    <div
                      key={item.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        background: "var(--panel-strong)",
                        border: "1px solid var(--border)",
                        fontSize: "12px"
                      }}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        {item.done ? (
                          <Check size={14} style={{ color: "var(--accent)" }} />
                        ) : (
                          <Circle size={14} style={{ color: "var(--muted)" }} />
                        )}
                        <span className="truncate">{item.label}</span>
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--muted)",
                          flexShrink: 0
                        }}
                      >
                        {item.meta}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: A Tour of the Workspace (#walkthrough) ────────── */}
      <section
        id="walkthrough"
        className="max-w-[1240px] mx-auto px-5 sm:px-8 py-16 sm:py-24"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="max-w-2xl space-y-3 mb-8">
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "2px",
              color: "var(--accent)"
            }}
          >
            02 / INSIDE THE WORKSPACE
          </span>
          <h2
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "clamp(28px, 3.2vw, 40px)",
              lineHeight: 1.18,
              letterSpacing: "-1.2px",
              fontWeight: 500
            }}
          >
            ทุกอย่างที่จำเป็นสำหรับจัดการงาน อยู่ในห้องเดียวกัน
          </h2>
        </div>

        {/* Clean Chapter Tabs */}
        <div
          className="flex items-center gap-2 overflow-x-auto pb-4 mb-8"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {WALKTHROUGH_SLIDES.map((slide, idx) => {
            const isActive = idx === activeWalkthroughIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveWalkthroughIndex(idx)}
                style={{
                  padding: "9px 16px",
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  background: isActive ? "var(--foreground)" : "var(--paper)",
                  color: isActive ? "var(--background)" : "var(--foreground)",
                  fontSize: "12px",
                  fontWeight: isActive ? 600 : 500,
                  whiteSpace: "nowrap"
                }}
              >
                {slide.tabName}
              </button>
            );
          })}
        </div>

        {/* 5 / 7 Editorial Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-5">
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "1.8px",
                color: "var(--muted)"
              }}
            >
              {activeSlide.chapter}
            </span>

            <h3
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "26px",
                lineHeight: 1.25,
                fontWeight: 500
              }}
            >
              {activeSlide.title}
            </h3>

            <p
              style={{
                fontSize: "14px",
                lineHeight: 1.75,
                color: "var(--muted)"
              }}
            >
              {activeSlide.description}
            </p>

            <ul
              className="space-y-3 pt-4"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              {activeSlide.details.map((detail) => (
                <li
                  key={detail}
                  className="flex items-start gap-2.5"
                  style={{ fontSize: "13px", lineHeight: 1.6 }}
                >
                  <Check
                    size={15}
                    className="mt-1 shrink-0"
                    style={{ color: "var(--accent)" }}
                  />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            <WalkthroughMockupScreen
              slide={activeSlide}
              isPlaying={isPlaying}
              onToggleAudio={handlePlayToggle}
            />
          </div>
        </div>
      </section>

      {/* ── Section 4: Honest Fit & Ledger Comparison (#comparison) ──── */}
      <section
        id="comparison"
        className="max-w-[1240px] mx-auto px-5 sm:px-8 py-16 sm:py-24 space-y-16"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="max-w-2xl space-y-3">
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "2px",
              color: "var(--accent)"
            }}
          >
            03 / IS IT FOR YOU?
          </span>
          <h2
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "clamp(28px, 3.2vw, 40px)",
              lineHeight: 1.18,
              letterSpacing: "-1.2px",
              fontWeight: 500
            }}
          >
            ออกแบบมาให้พอดีกับคนที่อยากทำงานอย่างสบายใจ
          </h2>
        </div>

        {/* 2-Column Fit Check */}
        <div id="check-readiness" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "20px",
              padding: "28px",
              background: "var(--panel-strong)"
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "21px",
                  fontWeight: 500
                }}
              >
                เหมาะกับคุณ ถ้า...
              </h3>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--accent)",
                  fontWeight: 600
                }}
              >
                เลือกตรงกับคุณ {checkedReadiness.length}/
                {SUITABLE_FOR_LIST.length} ข้อ
              </span>
            </div>

            <div className="space-y-2.5">
              {SUITABLE_FOR_LIST.map((item, idx) => {
                const isChecked = checkedReadiness.includes(idx);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleReadinessItem(idx)}
                    className="w-full text-left flex items-start gap-3 p-3 rounded-xl transition-colors"
                    style={{
                      border: "1px solid var(--border)",
                      background: isChecked ? "var(--paper)" : "transparent"
                    }}
                  >
                    <span
                      className="mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0"
                      style={{
                        border: "1px solid var(--accent)",
                        background: isChecked ? "var(--accent)" : "transparent",
                        color: "var(--background)"
                      }}
                    >
                      {isChecked && <Check size={11} strokeWidth={3} />}
                    </span>
                    <span style={{ fontSize: "13px", lineHeight: 1.6 }}>
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "20px",
              padding: "28px",
              background: "var(--panel-strong)"
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "21px",
                  fontWeight: 500
                }}
              >
                อาจยังไม่จำเป็น ถ้า...
              </h3>
              <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                ตรงไปตรงมา
              </span>
            </div>

            <div className="space-y-3">
              {NOT_SUITABLE_FOR_LIST.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 p-3.5 rounded-xl"
                  style={{
                    border: "1px solid var(--border)",
                    background: "var(--paper)",
                    color: "var(--muted)"
                  }}
                >
                  <span style={{ fontSize: "13px", lineHeight: 1.6 }}>
                    — {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Clean Ledger Table */}
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "20px",
            overflow: "hidden",
            background: "var(--panel-strong)"
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: "var(--paper)",
                    fontSize: "11px",
                    color: "var(--muted)"
                  }}
                >
                  <th className="py-4 px-5 font-semibold">มุมมองเปรียบเทียบ</th>
                  <th className="py-4 px-5 font-semibold">สร้างตารางเองจากศูนย์</th>
                  <th className="py-4 px-5 font-semibold">ใช้หลายแอปแยกกัน</th>
                  <th
                    className="py-4 px-5 font-semibold"
                    style={{ color: "var(--foreground)" }}
                  >
                    Retzlo
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr
                    key={row.feature}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      fontSize: "13px"
                    }}
                  >
                    <td className="py-4 px-5 font-medium">{row.feature}</td>
                    <td
                      className="py-4 px-5"
                      style={{ color: "var(--muted)" }}
                    >
                      {row.diy}
                    </td>
                    <td
                      className="py-4 px-5"
                      style={{ color: "var(--muted)" }}
                    >
                      {row.multiApp}
                    </td>
                    <td className="py-4 px-5 font-medium">{row.retzlo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Section 5: Common Questions (#faq) ─────────────────────── */}
      <section
        id="faq"
        className="max-w-[1240px] mx-auto px-5 sm:px-8 py-16 sm:py-24"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-3">
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "2px",
                color: "var(--accent)"
              }}
            >
              04 / QUESTIONS &amp; ANSWERS
            </span>
            <h2
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "clamp(28px, 3vw, 36px)",
                lineHeight: 1.18,
                letterSpacing: "-1px",
                fontWeight: 500
              }}
            >
              คำถามที่พบบ่อย
            </h2>
            <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.7 }}>
              หากต้องการดูรายละเอียดของแต่ละฟีเจอร์เพิ่มเติม สามารถเปิดอ่านใน{" "}
              <Link
                href="/help"
                style={{
                  color: "var(--foreground)",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px"
                }}
              >
                คู่มือการใช้งาน (System Guide)
              </Link>{" "}
              ได้ตลอดเวลา
            </p>
          </div>

          <div className="lg:col-span-8">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.num}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full py-5 text-left flex items-center justify-between gap-4"
                  >
                    <div className="flex items-baseline gap-4">
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--muted)",
                          fontWeight: 600
                        }}
                      >
                        {faq.num}
                      </span>
                      <span style={{ fontSize: "15px", fontWeight: 500 }}>
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      style={{
                        color: "var(--muted)",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 180ms ease"
                      }}
                    />
                  </button>
                  {isOpen && (
                    <div
                      className="pb-5 pl-8 pr-4"
                      style={{
                        fontSize: "14px",
                        lineHeight: 1.75,
                        color: "var(--muted)"
                      }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 6: Closing Postcard CTA (#buy) ──────────────────── */}
      <section
        id="buy"
        className="max-w-[1240px] mx-auto px-5 sm:px-8 pb-20 pt-6"
      >
        <div
          className="p-8 sm:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
          style={{
            border: "1px solid var(--border)",
            borderRadius: "24px",
            background: "var(--panel-strong)",
            boxShadow: "var(--shadow-panel)"
          }}
        >
          <div className="space-y-3 max-w-xl">
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "2px",
                color: "var(--accent)"
              }}
            >
              MAKE SPACE FOR YOUR NEXT CHAPTER
            </span>
            <h2
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "clamp(28px, 3.4vw, 42px)",
                lineHeight: 1.15,
                letterSpacing: "-1.4px",
                fontWeight: 500
              }}
            >
              ลองจัดพื้นที่ทำงานในแบบที่สบายใจสำหรับคุณ
            </h2>
            <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: 1.7 }}>
              สร้างโปรเจกต์แรกได้ฟรี มีบอร์ดงาน ปฏิทิน สมุดโน้ต และบันทึกประจำวันพร้อมให้เริ่มทันที
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href={defaultDestination}>
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  height: "50px",
                  padding: "0 24px",
                  borderRadius: "12px",
                  border: "1px solid var(--accent)",
                  background: "var(--accent)",
                  color: "var(--background)",
                  fontSize: "14px",
                  fontWeight: 600
                }}
              >
                <span>Enter Workspace</span>
                <ArrowRight size={15} />
              </button>
            </Link>
            <Link href="/help">
              <button
                style={{
                  height: "50px",
                  padding: "0 20px",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  background: "var(--paper)",
                  color: "var(--foreground)",
                  fontSize: "14px",
                  fontWeight: 500
                }}
              >
                อ่านคู่มือระบบ
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "32px 0",
          fontSize: "12px",
          color: "var(--muted)"
        }}
      >
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <strong style={{ color: "var(--foreground)" }}>retzlo</strong>
            <span>·</span>
            <span>© {new Date().getFullYear()} Retzlo Workspace.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link href="/help">System Guide</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
