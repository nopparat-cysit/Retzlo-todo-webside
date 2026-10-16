"use client";

import Link from "next/link";
import Image from "next/image";
import {
  useState,
  useEffect,
  useRef,
  type PointerEvent,
  type MouseEvent,
  type CSSProperties
} from "react";
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
  ChevronDown,
  Sparkles,
  Volume2,
  VolumeX
} from "lucide-react";
import { MixtapeArtwork } from "@/components/auth/mixtape-artwork";
import { MixtapeLogoMark } from "@/components/auth/mixtape-logo-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  PAIN_POINT_TABS,
  WALKTHROUGH_SLIDES,
  PLAYGROUND_TASKS,
  PLAYGROUND_REWARDS,
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

interface ZenRipple {
  id: number;
  x: number;
  y: number;
}

interface CoinBurst {
  id: number;
  amount: number;
}

const HERO_STAGES = ["To do", "In progress", "Done"] as const;

const SAKURA_STAGES = [
  {
    level: 1,
    name: "Stage 1 · ต้นอ่อนเพิ่งผลิใบ",
    desc: "คลิกที่สวนหินเพื่อสร้างคลื่นน้ำและเติมพลังใจ",
    scale: 0.94,
    petals: 3
  },
  {
    level: 2,
    name: "Stage 2 · แตกกิ่งรับแสงเช้า",
    desc: "ต้นไม้เริ่มโตตามจังหวะงานที่คุณเคลียร์สำเร็จ",
    scale: 0.98,
    petals: 6
  },
  {
    level: 3,
    name: "Stage 3 · ดอกตูมสีชมพูอ่อน",
    desc: "อีกนิดเดียวซากุระก็จะบานเต็มต้นแล้ว!",
    scale: 1.02,
    petals: 10
  },
  {
    level: 4,
    name: "Stage 4 · ซากุระบานสะพรั่งเต็มสวน!",
    desc: "บรรยากาศโต๊ะทำงานสดชื่นพร้อมลุยวันต่อไป",
    scale: 1.06,
    petals: 16
  }
];

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<MarketingSessionUser | null>(null);
  const [defaultDestination, setDefaultDestination] = useState<string>("/projects");

  // Interactive Hero state
  const artRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [heroStage, setHeroStage] = useState(0);

  // Interactive Playground & Live Coin Wallet state
  const [walletCoins, setWalletCoins] = useState<number>(45);
  const [coinBursts, setCoinBursts] = useState<CoinBurst[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(["task-brief"]);
  const [redeemedRewards, setRedeemedRewards] = useState<Record<string, number>>({});
  const [toastBanner, setToastBanner] = useState<string | null>(
    "ลองคลิกเคลียร์งานหรือแตะที่ภาพสวนหินญี่ปุ่นด้านล่างเพื่อสะสมเหรียญ!"
  );
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(true);

  // Interactive Zen Garden state
  const [sakuraStageIdx, setSakuraStageIdx] = useState<number>(2);
  const [zenRipples, setZenRipples] = useState<ZenRipple[]>([]);
  const [waterDrops, setWaterDrops] = useState<number>(3);

  // Interactive sections state
  const [activePainIndex, setActivePainIndex] = useState(0);
  const [painCheckedMap, setPainCheckedMap] = useState<Record<string, boolean>>({
    "scattered-0": true,
    "morning-start-0": true,
    "deadlines-0": true,
    "burnout-0": true,
    "burnout-1": true,
    "setup-fatigue-0": true,
    "setup-fatigue-1": true
  });
  const [activeWalkthroughIndex, setActiveWalkthroughIndex] = useState(0);
  const [checkedReadiness, setCheckedReadiness] = useState<number[]>([0, 2, 3]);
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

  // Tactile Web Audio Chime for interactive clicks
  const playChime = (type: "coin" | "reward" | "ripple" | "click" = "coin") => {
    if (!sfxEnabled) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "coin") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.07);
        osc.frequency.setValueAtTime(783.99, now + 0.14);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (type === "reward") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.08);
        osc.frequency.setValueAtTime(659.25, now + 0.16);
        osc.frequency.setValueAtTime(880, now + 0.24);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.46);
      } else if (type === "ripple") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(620, now + 0.22);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.3);
      } else {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(380, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.1);
      }

      setTimeout(() => {
        ctx.close().catch(() => {});
      }, 600);
    } catch {
      // Ignore audio block
    }
  };

  const triggerEarnCoin = (amount: number, message: string) => {
    const burstId = Date.now() + Math.random();
    setWalletCoins((prev) => prev + amount);
    setCoinBursts((prev) => [...prev.slice(-3), { id: burstId, amount }]);
    setToastBanner(`+${amount} Coins · ${message}`);
    playChime("coin");
  };

  const handleTogglePlaygroundTask = (taskId: string, coins: number, title: string) => {
    const alreadyDone = completedTaskIds.includes(taskId);
    if (alreadyDone) {
      setCompletedTaskIds((prev) => prev.filter((id) => id !== taskId));
      playChime("click");
    } else {
      setCompletedTaskIds((prev) => [...prev, taskId]);
      triggerEarnCoin(coins, `เคลียร์ "${title.slice(0, 22)}..." สำเร็จ!`);
    }
  };

  const handleRedeemReward = (rewardId: string, cost: number, title: string) => {
    if (walletCoins < cost) {
      setToastBanner(`เหรียญยังไม่พอ (ขาดอีก ${cost - walletCoins} เหรียญ) · ลองติ๊กงานด้านซ้ายเพิ่มสิ!`);
      playChime("click");
      return;
    }
    setWalletCoins((prev) => prev - cost);
    setRedeemedRewards((prev) => ({
      ...prev,
      [rewardId]: (prev[rewardId] || 0) + 1
    }));
    setToastBanner(`แลกรางวัลสำเร็จ! 🎟️ "${title}"`);
    playChime("reward");
  };

  const handleZenPondClick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const id = Date.now() + Math.random();

    setZenRipples((prev) => [...prev.slice(-4), { id, x, y }]);
    setWaterDrops((prev) => {
      const next = prev + 1;
      if (next % 2 === 0) {
        setSakuraStageIdx((stage) => (stage + 1) % SAKURA_STAGES.length);
      }
      return next;
    });
    playChime("ripple");
  };

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
      filter.frequency.setValueAtTime(420, audioCtx.currentTime);
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
      setToastBanner("กำลังเล่นคอร์ดดนตรี Lofi สังเคราะห์สดจากเบราว์เซอร์ 🎵");
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
    playChime("click");
    setCheckedReadiness((prev) =>
      prev.includes(idx) ? prev.filter((item) => item !== idx) : [...prev, idx]
    );
  };

  const activePain = PAIN_POINT_TABS[activePainIndex] || PAIN_POINT_TABS[0];
  const activeSlide =
    WALKTHROUGH_SLIDES[activeWalkthroughIndex] || WALKTHROUGH_SLIDES[0];
  const currentSakura = SAKURA_STAGES[sakuraStageIdx] || SAKURA_STAGES[2];

  return (
    <main
      style={{
        minHeight: "100svh",
        background:
          "radial-gradient(circle at 12% 4%, rgba(120, 88, 212, 0.14), transparent 42%), radial-gradient(circle at 88% 18%, rgba(255, 180, 213, 0.16), transparent 45%), var(--background)",
        color: "var(--foreground)"
      }}
    >
      {/* ── Top Navigation Bar with Live Coin Counter & Burst ─────────── */}
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
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5"
            style={{
              fontSize: "26px",
              fontWeight: 800,
              letterSpacing: "-1.2px",
              color: "var(--foreground)"
            }}
          >
            <MixtapeLogoMark />
            <span>retzlo</span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center gap-6"
            style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--muted)" }}
          >
            <a href="#playground" className="hover:opacity-100 transition-opacity">
              ลองเล่นมินิเกม
            </a>
            <a href="#pain-tabs" className="hover:opacity-100 transition-opacity">
              ปัญหาที่อยากแก้
            </a>
            <a href="#walkthrough" className="hover:opacity-100 transition-opacity">
              ทัวร์ 6 ห้องทำงาน
            </a>
            <a href="#comparison" className="hover:opacity-100 transition-opacity">
              เหมาะกับใคร
            </a>
            <a href="#faq" className="hover:opacity-100 transition-opacity">
              คำถามพบบ่อย
            </a>
          </nav>

          {/* Right Actions + Live Interactive Coin Pill */}
          <div className="hidden md:flex items-center gap-2.5">
            <div className="relative">
              <a
                href="#playground"
                title="เหรียญสะสมจากการทดลองกดเล่นบนหน้าเว็บ"
                className="lp-press-btn inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold"
                style={{
                  background: "#fff3c4",
                  color: "#54356b",
                  border: "1.5px solid #54356b",
                  boxShadow: "2px 2px 0 rgba(84, 53, 107, 0.22)"
                }}
              >
                <div className="relative w-4 h-4">
                  <Image
                    src="/stickers/rewards/reward-icon-01-coin.png"
                    alt=""
                    fill
                    sizes="16px"
                    className="object-contain"
                  />
                </div>
                <span>{walletCoins} Coins</span>
              </a>

              {/* Floating +Coin Burst Particles */}
              {coinBursts.map((b) => (
                <span
                  key={b.id}
                  className="lp-coin-burst pointer-events-none absolute -top-2 right-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold shadow-sm"
                  style={{
                    background: "#10b981",
                    color: "#ffffff"
                  }}
                >
                  +{b.amount}c
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={handlePlayToggle}
              className="lp-press-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                border: "1px solid var(--border)",
                background: isPlaying ? "#ede9fe" : "var(--paper)",
                color: isPlaying ? "#5b21b6" : "var(--foreground)"
              }}
            >
              <Disc3 size={14} className={isPlaying ? "animate-spin" : undefined} />
              <span>{isPlaying ? "Lofi On" : "Lofi Radio"}</span>
            </button>

            <ThemeToggle variant="icon" />

            {currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  style={{ fontSize: "13px", color: "var(--muted)" }}
                  className="px-2.5 py-1.5 truncate max-w-[140px]"
                >
                  {currentUser.name || currentUser.email || "Workspace user"}
                </Link>
                <Link href={defaultDestination}>
                  <button
                    className="lp-press-btn"
                    style={{
                      padding: "9px 16px",
                      borderRadius: "12px",
                      border: "1.5px solid #54356b",
                      background: "var(--accent)",
                      color: "var(--background)",
                      fontSize: "12px",
                      fontWeight: 700,
                      boxShadow: "3px 3px 0 rgba(84, 53, 107, 0.2)"
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
                    fontWeight: 600,
                    color: "var(--muted)",
                    padding: "8px 10px"
                  }}
                >
                  Sign In
                </Link>
                <Link href={defaultDestination}>
                  <button
                    className="lp-press-btn"
                    style={{
                      padding: "9px 16px",
                      borderRadius: "12px",
                      border: "1.5px solid #54356b",
                      background: "var(--accent)",
                      color: "var(--background)",
                      fontSize: "12px",
                      fontWeight: 700,
                      boxShadow: "3px 3px 0 rgba(84, 53, 107, 0.2)"
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
            <a
              href="#playground"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={{
                background: "#fff3c4",
                color: "#54356b",
                border: "1px solid #54356b"
              }}
            >
              <span>🪙 {walletCoins}</span>
            </a>
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
              href="#playground"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold"
            >
              🎮 ลองเล่นมินิเกมสะสมเหรียญ
            </a>
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
              ทัวร์ 6 ห้องทำงาน
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

      {/* ── Section 1: Cozy Mixtape Studio Hero (#cp-hero) ──────────── */}
      <section id="cp-hero" className="max-w-[1240px] mx-auto px-5 sm:px-8 pt-6 pb-12 sm:py-10">
        <div
          className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden"
          style={{
            border: "2px solid var(--border-strong, var(--border))",
            borderRadius: "30px",
            boxShadow: "10px 10px 0 rgba(84, 53, 107, 0.14), var(--shadow-floating)",
            background: "var(--panel-strong)"
          }}
        >
          {/* Left 6 Cols: Tactile Studio Copy + Retro Sticker Dock */}
          <div className="lg:col-span-6 p-7 sm:p-11 md:p-14 flex flex-col justify-between gap-8">
            <div className="space-y-6">
              {/* Tilted Buttercream Tape Tag */}
              <div className="inline-flex items-center gap-2">
                <span
                  style={{
                    display: "inline-block",
                    transform: "rotate(-1.5deg)",
                    padding: "5px 12px",
                    borderRadius: "8px",
                    background: "#ffecb1",
                    border: "1.5px solid #54356b",
                    color: "#54356b",
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "1.2px",
                    boxShadow: "3px 3px 0 rgba(84, 53, 107, 0.2)"
                  }}
                >
                  SIDE A · COZY WORK &amp; LIFE STUDIO
                </span>
              </div>

              <h1
                className="lp-font-display"
                style={{
                  fontSize: "clamp(32px, 3.8vw, 48px)",
                  lineHeight: 1.24,
                  fontWeight: 700,
                  color: "var(--foreground)"
                }}
              >
                เปลี่ยนวันที่งานกองเต็มหัว
                <br />
                ให้เป็นจังหวะที่{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 58%, rgba(255, 180, 213, 0.58) 58%)",
                    padding: "0 6px",
                    borderRadius: "4px"
                  }}
                >
                  ค่อยๆ เคลียร์สนุกขึ้น
                </span>
                ทุกวัน
              </h1>

              <p
                style={{
                  fontSize: "15.5px",
                  lineHeight: 1.8,
                  color: "var(--muted)",
                  maxWidth: "48ch"
                }}
              >
                เคยไหม? เปิดคอมมาจะทำงาน แต่ต้องไล่หาบรีฟในแชต หาลิงก์ในโน้ต
                สลับหน้าจอไปมาจนหมดแรง... <strong>Retzlo</strong> รวมบอร์ดงาน ปฏิทิน
                สมุดโน้ต ไดอารี่ และเพลง Lofi ไว้ในห้องเดียว เคลียร์งานเสร็จรับเหรียญไปแลกรางวัลหรือปลูกซากุระต่อได้เลย!
              </p>

              {/* Tactile Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <Link href={defaultDestination}>
                  <button
                    className="lp-press-btn"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      height: "52px",
                      padding: "0 24px",
                      borderRadius: "14px",
                      border: "2px solid #54356b",
                      background: "#7858d4",
                      color: "#fff5ff",
                      fontSize: "14px",
                      fontWeight: 700,
                      boxShadow: "4px 4px 0 #54356b"
                    }}
                  >
                    <span>เริ่มจัดโต๊ะทำงานของคุณฟรี</span>
                    <ArrowRight size={16} />
                  </button>
                </Link>

                <a
                  href="#playground"
                  className="lp-press-btn"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    height: "52px",
                    padding: "0 20px",
                    borderRadius: "14px",
                    border: "2px solid var(--border-strong, var(--border))",
                    background: "var(--paper)",
                    color: "var(--foreground)",
                    fontSize: "14px",
                    fontWeight: 700,
                    boxShadow: "4px 4px 0 rgba(84, 53, 107, 0.12)"
                  }}
                >
                  <span>🎮 ลองกดเล่นลูปแลกรางวัล</span>
                </a>
              </div>
            </div>

            {/* Hand-Drawn Retro Sticker Strip */}
            <div
              style={{
                borderTop: "1px dashed var(--border)",
                paddingTop: "18px"
              }}
            >
              <div className="text-[11px] font-bold tracking-wider uppercase mb-3" style={{ color: "var(--muted)" }}>
                ครบทั้ง 5 มุมในโต๊ะทำงานเดียว (ไม่ต้องสลับแอป):
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {[
                  {
                    label: "Kanban & Table",
                    sticker: "/stickers/retro/retro-sticker-03-checklist.png",
                    rot: "-2deg"
                  },
                  {
                    label: "Unified Calendar",
                    sticker: "/stickers/retro/retro-sticker-04-calendar.png",
                    rot: "1.5deg"
                  },
                  {
                    label: "Side Notes",
                    sticker: "/stickers/retro/retro-sticker-12-paper-note.png",
                    rot: "-1deg"
                  },
                  {
                    label: "Private Diary",
                    sticker: "/stickers/retro/retro-sticker-02-diary-notebook.png",
                    rot: "2deg"
                  },
                  {
                    label: "Lofi & Rewards",
                    sticker: "/stickers/retro/retro-sticker-01-coin-reward.png",
                    rot: "-1.5deg"
                  }
                ].map((badge) => (
                  <div
                    key={badge.label}
                    className="lp-spring-card inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{
                      transform: `rotate(${badge.rot})`,
                      background: "var(--paper)",
                      border: "1px solid var(--border)",
                      boxShadow: "2px 2px 0 rgba(84, 53, 107, 0.1)"
                    }}
                  >
                    <div className="relative w-5 h-5 shrink-0">
                      <Image
                        src={badge.sticker}
                        alt=""
                        fill
                        sizes="20px"
                        className="object-contain"
                      />
                    </div>
                    <span>{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 6 Cols: Interactive Mixtape Scene + Hand-Drawn Polaroid Desk Art */}
          <div
            ref={artRef}
            onPointerMove={moveArtwork}
            onPointerLeave={resetArtwork}
            className="lg:col-span-6 relative overflow-hidden flex flex-col justify-between p-7 sm:p-10 min-h-[500px] lg:min-h-[610px]"
            style={{
              background:
                "linear-gradient(180deg, #5942b8 0%, #7858d4 42%, #b184e7 68%, #ffb4d5 100%)",
              color: "#fff5ff",
              isolation: "isolate"
            }}
          >
            <MixtapeArtwork />

            {/* Top Scene Header */}
            <div className="relative z-10 flex items-center justify-between text-[10px] tracking-[2px] font-bold text-[#f3e8ff]">
              <span>SIDE A · YOUR DAILY MIXTAPE</span>
              <span className="px-2.5 py-1 rounded-full bg-black/25 border border-white/25">
                🪙 WALLET: {walletCoins} COINS
              </span>
            </div>

            {/* Tilted Hand-Drawn Studio Polaroid Frame (Top-Left) */}
            <div
              className="hidden sm:block absolute top-14 left-6 z-10 p-2 pb-3 rounded-2xl lp-float-sticker"
              style={
                {
                  "--lp-rot": "-5deg",
                  width: "215px",
                  background: "#fffaf0",
                  color: "#432369",
                  border: "2px solid #54356b",
                  boxShadow: "6px 6px 0 rgba(36, 15, 69, 0.32)"
                } as CSSProperties
              }
            >
              <div className="relative w-full h-28 rounded-xl overflow-hidden border border-[#54356b]/20">
                <Image
                  src="/images/landing/cozy-desk-hero.jpg"
                  alt="Cozy Lofi Desk Illustration"
                  fill
                  sizes="215px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="mt-2 px-1 flex items-center justify-between text-[10px] font-extrabold">
                <span>🎨 Cozy Studio Desk</span>
                <span className="text-pink-600">Side A</span>
              </div>
            </div>

            {/* Interactive Floating Board Card + Tilted Paper Sticker */}
            <div className="relative z-10 my-auto py-8 flex flex-col items-end">
              <div
                className="lp-spring-card"
                style={{
                  width: "min(295px, 100%)",
                  padding: "16px",
                  border: "1.5px solid rgba(255, 240, 255, 0.78)",
                  borderRadius: "18px",
                  background: "rgba(85, 51, 133, 0.92)",
                  boxShadow: "0 18px 40px rgba(26, 11, 69, 0.34)",
                  backdropFilter: "blur(16px)"
                }}
              >
                <div className="flex items-center justify-between text-[10px] tracking-[1px] font-bold mb-3 text-[#f3e8ff]">
                  <span className="flex items-center gap-1.5">
                    <LayoutGrid size={13} /> MY DAILY BOARD
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#ffecb1] text-[#432369]">
                    ลองกดขยับการ์ด!
                  </span>
                </div>

                <div className="flex justify-between gap-1 mb-3">
                  {HERO_STAGES.map((name, idx) => (
                    <span
                      key={name}
                      className="flex items-center gap-1 text-[10px] font-semibold transition-opacity"
                      style={{
                        color: idx === heroStage ? "#fff5ff" : "#d7c1ec",
                        opacity: idx === heroStage ? 1 : 0.65
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background:
                            idx === 0
                              ? "#c4b5fd"
                              : idx === 1
                                ? "#f6c976"
                                : "#6ee7b7"
                        }}
                      />
                      {name}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const next = (heroStage + 1) % HERO_STAGES.length;
                    setHeroStage(next);
                    if (next === 2) {
                      triggerEarnCoin(25, "ขยับการ์ดหน้า Hero ไป Done สำเร็จ!");
                    } else {
                      playChime("click");
                    }
                  }}
                  className="lp-press-btn"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    textAlign: "left",
                    gap: "9px",
                    width: "100%",
                    padding: "14px",
                    borderRadius: "12px",
                    border: "2px solid #54356b",
                    background: "#fff7fc",
                    color: "#432369",
                    boxShadow: "4px 4px 0 rgba(43, 19, 77, 0.25)",
                    cursor: "pointer"
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: 800,
                        letterSpacing: "1px",
                        color: "#8b5cf6"
                      }}
                    >
                      TODAY&apos;S FOCUS CARD
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#fff0b8] text-[#78350f]">
                      +25 Coins
                    </span>
                  </div>
                  <strong style={{ fontSize: "14px", lineHeight: 1.4 }}>
                    {heroStage === 2
                      ? "🎉 เสร็จเรียบร้อย! รับ +25 เหรียญไปแลกกาแฟได้เลย"
                      : heroStage === 1
                        ? "กำลังโฟกัส: จัดลำดับ 3 งานสำคัญของวันนี้"
                        : "จัดลำดับ 3 งานสำคัญของวันนี้"}
                  </strong>
                  <span
                    className="flex items-center gap-1.5 text-[11px] font-semibold mt-0.5"
                    style={{ color: "#6d4c7d" }}
                  >
                    {heroStage === 2 ? (
                      <Check size={13} className="text-emerald-600" />
                    ) : (
                      <Circle size={13} />
                    )}
                    <span>
                      {heroStage === 2
                        ? "คลิกอีกครั้งเพื่อเริ่มรอบใหม่"
                        : "คลิกเพื่อขยับสถานะการ์ด →"}
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
                className="mt-4 mr-3 flex items-center gap-2.5 lp-float-sticker"
                style={
                  {
                    "--lp-rot": "-5deg",
                    background: "#ffecb1",
                    border: "2px solid #54356b",
                    color: "#54356b",
                    padding: "10px 18px",
                    borderRadius: "10px",
                    fontFamily: "var(--font-editorial)",
                    fontStyle: "italic",
                    fontSize: "21px",
                    lineHeight: 1.1,
                    boxShadow: "4px 4px 0 rgba(84, 53, 107, 0.28)"
                  } as CSSProperties
                }
              >
                <div className="relative w-7 h-7 not-italic">
                  <Image
                    src="/stickers/retro/retro-sticker-01-coin-reward.png"
                    alt=""
                    fill
                    sizes="28px"
                    className="object-contain"
                  />
                </div>
                <div>
                  less rush,
                  <br />
                  <strong>more rhythm.</strong>
                </div>
              </div>
            </div>

            {/* Bottom Audio Cassette Bar */}
            <div
              className="relative z-10 flex items-center justify-between gap-4 p-3.5 rounded-2xl"
              style={{
                background: "rgba(255, 245, 255, 0.36)",
                border: "1px solid rgba(84, 53, 107, 0.3)",
                backdropFilter: "blur(10px)"
              }}
            >
              <div>
                <span
                  style={{
                    display: "block",
                    fontSize: "9px",
                    letterSpacing: "1.8px",
                    color: "#3b1d61",
                    fontWeight: 800
                  }}
                >
                  BUILT-IN LOFI SYNTHESIZER
                </span>
                <span
                  className="flex items-center gap-2 mt-1 text-xs font-bold"
                  style={{ color: "#3b1d61" }}
                >
                  <Disc3
                    size={15}
                    className={isPlaying ? "animate-spin" : undefined}
                  />
                  {isPlaying
                    ? "กำลังบรรเลงคอร์ด Lofi อุ่นๆ..."
                    : "กดปุ่ม Play เพื่อเปิดเพลงคลอระหว่างดูเว็บ"}
                </span>
              </div>

              <button
                type="button"
                onClick={handlePlayToggle}
                aria-label={isPlaying ? "Pause Lofi audio" : "Play Lofi audio"}
                className="lp-press-btn"
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  border: "2px solid #432369",
                  background: "#ffecb1",
                  color: "#432369",
                  boxShadow: "3px 3px 0 rgba(67, 35, 105, 0.3)",
                  cursor: "pointer"
                }}
              >
                {isPlaying ? <Pause size={17} /> : <Play size={17} />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Interactive "Try the Retzlo Loop" Playground (#playground) ── */}
      <section
        id="playground"
        className="max-w-[1240px] mx-auto px-5 sm:px-8 py-12 sm:py-16"
      >
        <div
          style={{
            border: "2px solid var(--border-strong, var(--border))",
            borderRadius: "28px",
            padding: "28px 24px",
            background:
              "linear-gradient(135deg, rgba(120, 88, 212, 0.09) 0%, rgba(255, 236, 177, 0.18) 50%, rgba(255, 180, 213, 0.12) 100%), var(--panel-strong)",
            boxShadow: "8px 8px 0 rgba(84, 53, 107, 0.14)"
          }}
        >
          {/* Playground Header Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--border)]">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2">
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    letterSpacing: "1.4px",
                    padding: "4px 10px",
                    borderRadius: "999px",
                    background: "#7858d4",
                    color: "#fff"
                  }}
                >
                  INTERACTIVE MINI-PLAYGROUND
                </span>
                <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                  ไม่ต้องสมัครสมาชิกก็ลองกดเล่นได้เดี๋ยวนี้!
                </span>
              </div>
              <h2
                className="lp-font-display"
                style={{
                  fontSize: "clamp(24px, 2.8vw, 34px)",
                  fontWeight: 700
                }}
              >
                ทำไมคนใช้ Retzlo ถึงไม่เบื่อ? ลองเล่น &ldquo;ลูปความสุข 3 ขั้นตอน&rdquo; ดูสิ
              </h2>
            </div>

            {/* Live Wallet & Sound Toggle */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setSfxEnabled(!sfxEnabled)}
                className="lp-press-btn inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-[var(--border)] bg-[var(--paper)]"
              >
                {sfxEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                <span>{sfxEnabled ? "เสียงเอฟเฟกต์: เปิด" : "เสียงเอฟเฟกต์: ปิด"}</span>
              </button>

              <div
                className="relative inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-extrabold"
                style={{
                  background: "#ffecb1",
                  color: "#432369",
                  border: "2px solid #54356b",
                  boxShadow: "3px 3px 0 rgba(84, 53, 107, 0.22)"
                }}
              >
                <div className="relative w-5 h-5">
                  <Image
                    src="/stickers/rewards/reward-icon-01-coin.png"
                    alt=""
                    fill
                    sizes="20px"
                    className="object-contain"
                  />
                </div>
                <span>กระเป๋าเหรียญของคุณ: {walletCoins} Coins</span>
              </div>
            </div>
          </div>

          {/* Live Feedback Banner */}
          {toastBanner && (
            <div
              className="mt-4 px-4 py-2.5 rounded-xl flex items-center justify-between gap-2 text-xs font-bold"
              style={{
                background: "var(--paper)",
                border: "1.5px dashed #7858d4",
                color: "var(--foreground)"
              }}
            >
              <span className="flex items-center gap-2">
                <Sparkles size={14} style={{ color: "#7858d4" }} />
                {toastBanner}
              </span>
              <span className="text-[11px] opacity-70 hidden sm:inline">
                Interactive Demo
              </span>
            </div>
          )}

          {/* 3-Step Playable Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
            {/* STEP 1: Clear Tasks & Coffee Cheer */}
            <div
              style={{
                border: "1.5px solid var(--border)",
                borderRadius: "20px",
                padding: "20px",
                background: "var(--paper)",
                boxShadow: "4px 4px 0 rgba(84, 53, 107, 0.08)"
              }}
              className="flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      letterSpacing: "1.4px",
                      color: "#7858d4"
                    }}
                  >
                    STEP 01 · CLEAR &amp; CHEER
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCompletedTaskIds([]);
                      playChime("click");
                    }}
                    className="text-[11px] font-semibold underline opacity-75 hover:opacity-100"
                  >
                    รีเซ็ตภารกิจ
                  </button>
                </div>
                <h3 className="text-base font-bold">
                  1. คลิกเคลียร์งานเพื่อรับเหรียญรางวัล
                </h3>

                <div className="space-y-2.5 pt-1">
                  {PLAYGROUND_TASKS.map((task) => {
                    const isDone = completedTaskIds.includes(task.id);
                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() =>
                          handleTogglePlaygroundTask(task.id, task.coins, task.title)
                        }
                        className="lp-spring-card w-full text-left p-3 rounded-xl flex items-center justify-between gap-3"
                        style={{
                          border: isDone
                            ? "1.5px solid #10b981"
                            : "1px solid var(--border)",
                          background: isDone
                            ? "rgba(16, 185, 129, 0.1)"
                            : "var(--panel-strong)",
                          boxShadow: "2px 2px 0 rgba(84, 53, 107, 0.08)"
                        }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative w-7 h-7 shrink-0">
                            <Image
                              src={task.stickerSrc}
                              alt=""
                              fill
                              sizes="28px"
                              className="object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <div
                              className="text-xs font-bold truncate"
                              style={{
                                textDecoration: isDone ? "line-through" : "none",
                                opacity: isDone ? 0.65 : 1
                              }}
                            >
                              {task.title}
                            </div>
                            <span
                              style={{
                                fontSize: "9px",
                                fontWeight: 700,
                                color: task.tagColor
                              }}
                            >
                              {task.tag}
                            </span>
                          </div>
                        </div>

                        <span
                          className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-extrabold"
                          style={{
                            background: isDone ? "#10b981" : "#fff3c4",
                            color: isDone ? "#fff" : "#78350f",
                            border: "1px solid rgba(84, 53, 107, 0.2)"
                          }}
                        >
                          {isDone ? "✓ รับแล้ว" : `+${task.coins}c`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="text-[11px] pt-2 border-t border-[var(--border)]" style={{ color: "var(--muted)" }}>
                💡 ในแอปจริง ทุกการ์ดที่ลากไปช่อง Done จะได้เหรียญสะสมอัตโนมัติ
              </div>
            </div>

            {/* STEP 2: Redeem Rewards in the Mini Arcade Shop */}
            <div
              style={{
                border: "1.5px solid var(--border)",
                borderRadius: "20px",
                padding: "20px",
                background: "var(--paper)",
                boxShadow: "4px 4px 0 rgba(84, 53, 107, 0.08)"
              }}
              className="flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      letterSpacing: "1.4px",
                      color: "#db2777"
                    }}
                  >
                    STEP 02 · REWARD ARCADE
                  </span>
                  <span className="text-[11px] font-bold text-pink-600">
                    แลกแล้ว{" "}
                    {Object.values(redeemedRewards).reduce((a, b) => a + b, 0)}{" "}
                    ใบ
                  </span>
                </div>
                <h3 className="text-base font-bold">
                  2. นำเหรียญมาแลกตั๋วพักผ่อนที่คุณตั้งเอง
                </h3>

                <div className="space-y-2.5 pt-1">
                  {PLAYGROUND_REWARDS.map((reward) => {
                    const count = redeemedRewards[reward.id] || 0;
                    const canAfford = walletCoins >= reward.cost;
                    return (
                      <div
                        key={reward.id}
                        style={{
                          border: "1.5px dashed rgba(84, 53, 107, 0.3)",
                          borderRadius: "14px",
                          padding: "12px",
                          background: reward.bgTint,
                          color: "#3b1d61"
                        }}
                        className="lp-spring-card flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-9 h-9 shrink-0">
                            <Image
                              src={reward.iconSrc}
                              alt=""
                              fill
                              sizes="36px"
                              className="object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-extrabold truncate">
                              {reward.title}
                            </div>
                            <div className="text-[11px] opacity-75 truncate">
                              {reward.subtitle}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleRedeemReward(reward.id, reward.cost, reward.title)
                          }
                          className="lp-press-btn shrink-0 px-3 py-1.5 rounded-xl text-xs font-extrabold"
                          style={{
                            background: canAfford ? "#54356b" : "rgba(84, 53, 107, 0.2)",
                            color: canAfford ? "#ffecb1" : "#54356b",
                            cursor: "pointer"
                          }}
                        >
                          {count > 0
                            ? `แลกเพิ่ม (${reward.cost}c) · x${count}`
                            : `แลก ${reward.cost}c`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-[11px] pt-2 border-t border-[var(--border)]" style={{ color: "var(--muted)" }}>
                🎟️ ตั้งรางวัลร่วมกับทีมหรือตั้งรางวัลให้ตัวเองก็ได้ตามใจชอบ
              </div>
            </div>

            {/* STEP 3: Interactive Zen Sand Garden & Hand-Drawn Sakura Terrarium */}
            <div
              style={{
                border: "1.5px solid var(--border)",
                borderRadius: "20px",
                padding: "20px",
                background: "var(--paper)",
                boxShadow: "4px 4px 0 rgba(84, 53, 107, 0.08)"
              }}
              className="flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      letterSpacing: "1.4px",
                      color: "#059669"
                    }}
                  >
                    STEP 03 · MINI ZEN GARDEN
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700">
                    รดน้ำแล้ว {waterDrops} ครั้ง
                  </span>
                </div>
                <h3 className="text-base font-bold">
                  3. แตะที่สวนหินญี่ปุ่นเพื่อสร้างคลื่นน้ำ &amp; ปลูกซากุระ
                </h3>

                {/* Clickable Hand-Drawn Zen Terrarium Box */}
                <div
                  onClick={handleZenPondClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSakuraStageIdx((s) => (s + 1) % SAKURA_STAGES.length);
                      playChime("ripple");
                    }
                  }}
                  className="relative overflow-hidden rounded-2xl cursor-pointer select-none flex flex-col justify-end p-3.5 min-h-[215px]"
                  style={{
                    border: "2px solid #c9b293",
                    boxShadow: "inset 0 2px 12px rgba(92, 68, 38, 0.18)"
                  }}
                >
                  {/* Custom Hand-Drawn Zen Sakura Terrarium Illustration */}
                  <div
                    className="absolute inset-0 transition-transform duration-500 ease-out"
                    style={{
                      transform: `scale(${currentSakura.scale})`
                    }}
                  >
                    <Image
                      src="/images/landing/zen-sakura-terrarium.jpg"
                      alt="Japanese Zen Sand Garden & Sakura Bonsai"
                      fill
                      sizes="360px"
                      className="object-cover"
                    />
                  </div>

                  {/* Dynamic Click Ripples */}
                  {zenRipples.map((r) => (
                    <span
                      key={r.id}
                      className="lp-ripple-ring pointer-events-none"
                      style={{
                        position: "absolute",
                        left: `${r.x}%`,
                        top: `${r.y}%`,
                        width: "52px",
                        height: "52px",
                        marginLeft: "-26px",
                        marginTop: "-26px",
                        borderRadius: "50%",
                        border: "2.5px solid rgba(120, 88, 212, 0.85)",
                        boxShadow: "0 0 12px rgba(255, 180, 213, 0.8)"
                      }}
                    />
                  ))}

                  {/* Stage Status Overlay Pill */}
                  <div
                    className="relative z-10 px-3 py-2 rounded-xl text-center backdrop-blur-md"
                    style={{
                      background: "rgba(255, 251, 245, 0.9)",
                      border: "1.5px solid rgba(84, 53, 107, 0.28)",
                      color: "#3b1d61"
                    }}
                  >
                    <div className="text-xs font-extrabold">{currentSakura.name}</div>
                    <div className="text-[11px] opacity-80">{currentSakura.desc}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[var(--border)]">
                <span style={{ color: "var(--muted)" }}>
                  🌸 แตะที่ภาพสวนหินเพื่อสร้างคลื่นน้ำ
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSakuraStageIdx((s) => (s + 1) % SAKURA_STAGES.length);
                    triggerEarnCoin(10, "ดูแลต้นซากุระในสวนหิน!");
                  }}
                  className="font-bold text-emerald-700 underline"
                >
                  +รดน้ำซากุระ (+10c)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: Everyday Friction Folder-Tabs (#pain-tabs) ─────── */}
      <section
        id="pain-tabs"
        className="max-w-[1240px] mx-auto px-5 sm:px-8 py-14 sm:py-20"
      >
        <div className="max-w-2xl space-y-3 mb-10">
          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "2px",
              color: "var(--accent)"
            }}
          >
            01 / EVERYDAY FRICTION
          </span>
          <h2
            className="lp-font-display"
            style={{
              fontSize: "clamp(26px, 3vw, 38px)",
              fontWeight: 700
            }}
          >
            5 อาการปวดหัวของคนทำงานหน้าจอ ที่ Retzlo ตั้งใจมาแก้ให้จบ
          </h2>
          <p style={{ fontSize: "14.5px", color: "var(--muted)", lineHeight: 1.75 }}>
            ลองกดเลือกอาการที่คุณเจอบ่อยที่สุดจากแถบด้านซ้าย แล้วดูว่าเมื่อย้ายเข้ามาอยู่ในสตูดิโอของ Retzlo ชีวิตจะเบาลงอย่างไร
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 5 Cols: Tactile Folder Tabs */}
          <div className="lg:col-span-5 flex flex-col gap-2.5">
            {PAIN_POINT_TABS.map((tab, idx) => {
              const isSelected = idx === activePainIndex;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActivePainIndex(idx);
                    playChime("click");
                  }}
                  className="lp-spring-card text-left"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 16px",
                    borderRadius: "16px",
                    border: isSelected
                      ? `2px solid ${tab.accentColor}`
                      : "1px solid var(--border)",
                    background: isSelected ? "var(--panel-strong)" : "var(--paper)",
                    boxShadow: isSelected
                      ? "5px 5px 0 rgba(84, 53, 107, 0.14)"
                      : "none"
                  }}
                >
                  <div className="relative w-8 h-8 shrink-0">
                    <Image
                      src={tab.stickerSrc}
                      alt=""
                      fill
                      sizes="32px"
                      className="object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      style={{
                        fontSize: "9px",
                        fontWeight: 800,
                        letterSpacing: "1.2px",
                        color: tab.accentColor
                      }}
                    >
                      CASE {tab.num} · {tab.badgeText}
                    </div>
                    <div
                      style={{
                        fontSize: "13.5px",
                        fontWeight: isSelected ? 700 : 500,
                        color: "var(--foreground)",
                        marginTop: "2px"
                      }}
                    >
                      {tab.tabLabel}
                    </div>
                  </div>
                  <ArrowRight
                    size={15}
                    className="shrink-0"
                    style={{
                      opacity: isSelected ? 1 : 0.3,
                      color: tab.accentColor
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* Right 7 Cols: Before vs After Collage Board with Hand-Drawn Illustrations */}
          <div
            key={activePain.id}
            className="lg:col-span-7 p-6 sm:p-8 space-y-6 lp-tab-stage"
            style={{
              border: `2px solid ${activePain.accentColor}`,
              borderRadius: "24px",
              background: "var(--panel-strong)",
              boxShadow: "8px 8px 0 rgba(84, 53, 107, 0.14)"
            }}
          >
            {/* Before Box with Hand-Drawn Chaos Illustration & Tilted Quote Sticker */}
            <div
              className="p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-12 gap-5 items-center"
              style={{
                background: "var(--paper)",
                border: "1px dashed var(--border)"
              }}
            >
              <div className="sm:col-span-8 space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    style={{
                      fontSize: "10px",
                      letterSpacing: "1.4px",
                      fontWeight: 800,
                      padding: "3px 9px",
                      borderRadius: "6px",
                      background: "rgba(239, 68, 68, 0.12)",
                      color: "#dc2626"
                    }}
                  >
                    BEFORE · ภาพที่คุ้นเคย
                  </span>

                  <span
                    style={{
                      transform: "rotate(-1deg)",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: "8px",
                      background: "#ffecb1",
                      color: "#54356b",
                      border: "1px solid rgba(84, 53, 107, 0.3)"
                    }}
                  >
                    {activePain.beforeQuote}
                  </span>
                </div>

                <h3
                  className="lp-font-display"
                  style={{
                    fontSize: "19px",
                    fontWeight: 700,
                    lineHeight: 1.35,
                    color: "var(--foreground)"
                  }}
                >
                  {activePain.title}
                </h3>
                <p
                  style={{
                    fontSize: "13.5px",
                    lineHeight: 1.7,
                    color: "var(--muted)"
                  }}
                >
                  {activePain.beforeText}
                </p>
              </div>

              {/* Hand-Drawn "Before Chaos" Spot Illustration */}
              <div className="sm:col-span-4 flex justify-center">
                <div
                  className="relative w-36 h-36 rounded-2xl overflow-hidden p-1.5"
                  style={{
                    transform: "rotate(2deg)",
                    background: "#fffaf0",
                    border: "1.5px solid rgba(84, 53, 107, 0.25)",
                    boxShadow: "4px 4px 0 rgba(84, 53, 107, 0.12)"
                  }}
                >
                  <Image
                    src="/images/landing/before-chaos-desk.jpg"
                    alt="Before Retzlo Chaos Desk"
                    fill
                    sizes="144px"
                    className="object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* After Box with Hand-Drawn Flow Illustration & Interactive Checklist */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                {/* Hand-Drawn "After Flow" Spot Illustration */}
                <div className="sm:col-span-4 flex justify-center order-2 sm:order-1">
                  <div
                    className="relative w-36 h-36 rounded-2xl overflow-hidden p-1.5"
                    style={{
                      transform: "rotate(-2deg)",
                      background: "#fffaf0",
                      border: `2px solid ${activePain.accentColor}`,
                      boxShadow: "4px 4px 0 rgba(84, 53, 107, 0.14)"
                    }}
                  >
                    <Image
                      src="/images/landing/after-flow-desk.jpg"
                      alt="After Retzlo Calm Flow Desk"
                      fill
                      sizes="144px"
                      className="object-cover rounded-xl"
                    />
                  </div>
                </div>

                <div className="sm:col-span-8 space-y-2 order-1 sm:order-2">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-7 h-7 shrink-0">
                      <Image
                        src={activePain.stickerSrc}
                        alt=""
                        fill
                        sizes="28px"
                        className="object-contain"
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "10px",
                        letterSpacing: "1.5px",
                        color: activePain.accentColor,
                        fontWeight: 800
                      }}
                    >
                      AFTER · เมื่อย้ายมาอยู่ใน RETZLO
                    </span>
                  </div>

                  <h4
                    className="lp-font-display"
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "var(--foreground)"
                    }}
                  >
                    {activePain.afterTitle}
                  </h4>

                  <p
                    style={{
                      fontSize: "13.5px",
                      lineHeight: 1.7,
                      color: "var(--muted)"
                    }}
                  >
                    {activePain.afterText}
                  </p>
                </div>
              </div>

              {/* Clickable Mini Preview */}
              <div
                style={{
                  border: "1.5px solid var(--border)",
                  borderRadius: "16px",
                  padding: "16px",
                  background: "var(--paper)"
                }}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--foreground)"
                    }}
                  >
                    {activePain.previewTitle}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: activePain.accentColor
                    }}
                  >
                    ลองกดติ๊กเพื่อรับเหรียญ!
                  </span>
                </div>
                <div className="space-y-2">
                  {activePain.previewItems.map((item, itemIdx) => {
                    const mapKey = `${activePain.id}-${itemIdx}`;
                    const isDone = Boolean(painCheckedMap[mapKey]);
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          const nextState = !isDone;
                          setPainCheckedMap((prev) => ({
                            ...prev,
                            [mapKey]: nextState
                          }));
                          if (nextState) {
                            triggerEarnCoin(
                              item.coin || 15,
                              `เคลียร์ "${item.label.slice(0, 20)}..."`
                            );
                          } else {
                            playChime("click");
                          }
                        }}
                        className="lp-spring-card w-full text-left flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl"
                        style={{
                          background: isDone
                            ? "rgba(16, 185, 129, 0.1)"
                            : "var(--panel-strong)",
                          border: "1px solid var(--border)",
                          fontSize: "12.5px"
                        }}
                      >
                        <span className="flex items-center gap-2.5 min-w-0 font-medium">
                          {isDone ? (
                            <Check size={14} className="text-emerald-600 shrink-0" />
                          ) : (
                            <Circle size={14} className="opacity-50 shrink-0" />
                          )}
                          <span
                            className="truncate"
                            style={{
                              textDecoration: isDone ? "line-through" : "none",
                              opacity: isDone ? 0.7 : 1
                            }}
                          >
                            {item.label}
                          </span>
                        </span>
                        <span
                          className="text-[11px] font-bold shrink-0 px-2 py-0.5 rounded-full"
                          style={{
                            background: isDone ? "#10b981" : "#fff3c4",
                            color: isDone ? "#fff" : "#78350f"
                          }}
                        >
                          {isDone ? "✓ เสร็จแล้ว" : item.meta}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: Interactive 6-Room Studio Tour (#walkthrough) ──── */}
      <section
        id="walkthrough"
        className="max-w-[1240px] mx-auto px-5 sm:px-8 py-14 sm:py-20"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="max-w-2xl space-y-3 mb-8">
          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "2px",
              color: "var(--accent)"
            }}
          >
            02 / INSIDE THE WORKSPACE
          </span>
          <h2
            className="lp-font-display"
            style={{
              fontSize: "clamp(26px, 3vw, 38px)",
              fontWeight: 700
            }}
          >
            พาชม 6 ห้องทำงานใน Retzlo (กดทดลองเล่นได้ทุกห้อง!)
          </h2>
        </div>

        {/* Tactile Room Tabs with Sticker Icons */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-8">
          {WALKTHROUGH_SLIDES.map((slide, idx) => {
            const isActive = idx === activeWalkthroughIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => {
                  setActiveWalkthroughIndex(idx);
                  playChime("click");
                }}
                className="lp-press-btn inline-flex items-center gap-2"
                style={{
                  padding: "10px 16px",
                  borderRadius: "14px",
                  border: isActive
                    ? `2px solid ${slide.accentColor}`
                    : "1px solid var(--border)",
                  background: isActive ? "var(--panel-strong)" : "var(--paper)",
                  color: "var(--foreground)",
                  fontSize: "12.5px",
                  fontWeight: isActive ? 800 : 600,
                  whiteSpace: "nowrap",
                  boxShadow: isActive
                    ? "4px 4px 0 rgba(84, 53, 107, 0.15)"
                    : "none"
                }}
              >
                <div className="relative w-5 h-5 shrink-0">
                  <Image
                    src={slide.stickerSrc}
                    alt=""
                    fill
                    sizes="20px"
                    className="object-contain"
                  />
                </div>
                <span>{slide.tabName}</span>
              </button>
            );
          })}
        </div>

        {/* 5 / 7 Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div key={activeSlide.id} className="lg:col-span-5 space-y-5 lp-tab-stage">
            <div className="inline-flex items-center gap-2">
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  letterSpacing: "1.6px",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  background: `${activeSlide.accentColor}18`,
                  color: activeSlide.accentColor
                }}
              >
                {activeSlide.chapter}
              </span>
            </div>

            <h3
              className="lp-font-display"
              style={{
                fontSize: "24px",
                lineHeight: 1.32,
                fontWeight: 700
              }}
            >
              {activeSlide.title}
            </h3>

            <p
              style={{
                fontSize: "14.5px",
                lineHeight: 1.75,
                color: "var(--muted)"
              }}
            >
              {activeSlide.description}
            </p>

            {/* Try Hint Callout */}
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                background: "#ffecb1",
                border: "1.5px solid #54356b",
                color: "#54356b",
                fontSize: "12.5px",
                fontWeight: 700,
                boxShadow: "3px 3px 0 rgba(84, 53, 107, 0.16)"
              }}
            >
              ✨ {activeSlide.tryHint}
            </div>

            <ul
              className="space-y-3 pt-4"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              {activeSlide.details.map((detail) => (
                <li
                  key={detail}
                  className="flex items-start gap-2.5"
                  style={{ fontSize: "13.5px", lineHeight: 1.65 }}
                >
                  <Check
                    size={15}
                    className="mt-1 shrink-0"
                    style={{ color: activeSlide.accentColor }}
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
              onEarnCoin={triggerEarnCoin}
            />
          </div>
        </div>
      </section>

      {/* ── Section 5: Interactive Fit Check & Comparison (#comparison) ── */}
      <section
        id="comparison"
        className="max-w-[1240px] mx-auto px-5 sm:px-8 py-14 sm:py-20 space-y-14"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="max-w-2xl space-y-3">
          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "2px",
              color: "var(--accent)"
            }}
          >
            03 / FIT CHECK &amp; COMPARISON
          </span>
          <h2
            className="lp-font-display"
            style={{
              fontSize: "clamp(26px, 3vw, 38px)",
              fontWeight: 700
            }}
          >
            เช็กดูว่า Retzlo เข้ากับสไตล์การทำงานของคุณไหม?
          </h2>
        </div>

        {/* 2-Column Fit Check */}
        <div id="check-readiness" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            style={{
              border: "2px solid #7858d4",
              borderRadius: "24px",
              padding: "26px",
              background: "var(--panel-strong)",
              boxShadow: "6px 6px 0 rgba(120, 88, 212, 0.16)"
            }}
            className="flex flex-col justify-between gap-5"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-7 h-7">
                    <Image
                      src="/stickers/retro/retro-sticker-03-checklist.png"
                      alt=""
                      fill
                      sizes="28px"
                      className="object-contain"
                    />
                  </div>
                  <h3
                    className="lp-font-display"
                    style={{
                      fontSize: "19px",
                      fontWeight: 700
                    }}
                  >
                    เหมาะกับคุณมาก ถ้า... (ลองคลิกติ๊กดู)
                  </h3>
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    padding: "4px 10px",
                    borderRadius: "999px",
                    background: "#ede9fe",
                    color: "#5b21b6",
                    fontWeight: 800
                  }}
                >
                  ตรง {checkedReadiness.length}/{SUITABLE_FOR_LIST.length} ข้อ
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
                      className="lp-spring-card w-full text-left flex items-start gap-3 p-3 rounded-xl"
                      style={{
                        border: isChecked
                          ? "1.5px solid #7858d4"
                          : "1px solid var(--border)",
                        background: isChecked ? "var(--paper)" : "transparent"
                      }}
                    >
                      <span
                        className="mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0"
                        style={{
                          border: "1.5px solid #7858d4",
                          background: isChecked ? "#7858d4" : "transparent",
                          color: "#fff"
                        }}
                      >
                        {isChecked && <Check size={11} strokeWidth={3} />}
                      </span>
                      <span style={{ fontSize: "13.5px", lineHeight: 1.6, fontWeight: isChecked ? 600 : 400 }}>
                        {item}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Fit Score Badge */}
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "14px",
                background: "#ffecb1",
                border: "1.5px solid #54356b",
                color: "#432369",
                fontSize: "12.5px",
                fontWeight: 700
              }}
            >
              {checkedReadiness.length >= 3
                ? `🎯 ตรงถึง ${checkedReadiness.length} ข้อ! คุณคือสาย Cozy Achiever ที่เหมาะกับ Retzlo สุดๆ`
                : "💡 ลองติ๊กข้อที่ตรงกับนิสัยการทำงานของคุณเพื่อดูผลลัพธ์"}
            </div>
          </div>

          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "24px",
              padding: "26px",
              background: "var(--panel-strong)"
            }}
            className="flex flex-col justify-between gap-5"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-7 h-7">
                    <Image
                      src="/stickers/retro/retro-sticker-47-sleepy-cloud.png"
                      alt=""
                      fill
                      sizes="28px"
                      className="object-contain"
                    />
                  </div>
                  <h3
                    className="lp-font-display"
                    style={{
                      fontSize: "19px",
                      fontWeight: 700
                    }}
                  >
                    อาจยังไม่จำเป็นต้องใช้ ถ้า...
                  </h3>
                </div>
                <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600 }}>
                  บอกกันตรงไปตรงมา
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
                    <span style={{ fontSize: "13.5px", lineHeight: 1.65 }}>
                      — {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="p-3.5 rounded-xl text-xs"
              style={{
                background: "var(--paper)",
                border: "1px dashed var(--border)",
                color: "var(--muted)"
              }}
            >
              เราตั้งใจออกแบบ Retzlo ให้เป็นพื้นที่ทำงานที่อบอุ่นและพอดีตัว ไม่ใช่โปรแกรมองค์กรขนาดยักษ์ที่ซับซ้อนเกินจำเป็น
            </div>
          </div>
        </div>

        {/* Highlighted Comparison Table */}
        <div
          style={{
            border: "2px solid var(--border-strong, var(--border))",
            borderRadius: "24px",
            overflow: "hidden",
            background: "var(--panel-strong)",
            boxShadow: "6px 6px 0 rgba(84, 53, 107, 0.1)"
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: "var(--paper)",
                    fontSize: "12.5px",
                    color: "var(--muted)"
                  }}
                >
                  <th className="py-4 px-5 font-bold">มุมมองเปรียบเทียบ</th>
                  <th className="py-4 px-5 font-semibold">สร้างหน้าเพจผูกสูตรเอง</th>
                  <th className="py-4 px-5 font-semibold">ใช้ 4–5 แอปแยกกัน</th>
                  <th
                    className="py-4 px-5 font-extrabold"
                    style={{
                      background: "rgba(120, 88, 212, 0.12)",
                      color: "var(--foreground)"
                    }}
                  >
                    ✨ Retzlo Studio
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr
                    key={row.feature}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      fontSize: "13.5px"
                    }}
                  >
                    <td className="py-4 px-5 font-bold">{row.feature}</td>
                    <td className="py-4 px-5" style={{ color: "var(--muted)" }}>
                      {row.diy}
                    </td>
                    <td className="py-4 px-5" style={{ color: "var(--muted)" }}>
                      {row.multiApp}
                    </td>
                    <td
                      className="py-4 px-5 font-bold"
                      style={{
                        background: "rgba(120, 88, 212, 0.07)",
                        color: "var(--foreground)"
                      }}
                    >
                      {row.retzlo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Section 6: Smooth Accordion Questions (#faq) ─────────────── */}
      <section
        id="faq"
        className="max-w-[1240px] mx-auto px-5 sm:px-8 py-14 sm:py-20"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-4">
            <span
              style={{
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "2px",
                color: "var(--accent)"
              }}
            >
              04 / QUESTIONS &amp; ANSWERS
            </span>
            <h2
              className="lp-font-display"
              style={{
                fontSize: "clamp(26px, 2.8vw, 34px)",
                fontWeight: 700
              }}
            >
              คำถามที่พบบ่อย
            </h2>
            <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: 1.75 }}>
              อยากดูวิธีใช้งานแต่ละฟีเจอร์แบบละเอียด สามารถเปิดอ่านใน{" "}
              <Link
                href="/help"
                style={{
                  color: "var(--foreground)",
                  fontWeight: 700,
                  textDecoration: "underline",
                  textUnderlineOffset: "3px"
                }}
              >
                คู่มือการใช้งาน (System Guide)
              </Link>{" "}
              ได้ตลอดเวลา
            </p>
          </div>

          <div className="lg:col-span-8 space-y-2.5">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.num}
                  className="transition-colors duration-200"
                  style={{
                    border: isOpen
                      ? "1.5px solid #7858d4"
                      : "1px solid var(--border)",
                    borderRadius: "16px",
                    background: isOpen ? "var(--panel-strong)" : "var(--paper)",
                    padding: "0 18px"
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOpenFaqIndex(isOpen ? null : idx);
                      playChime("click");
                    }}
                    className="w-full py-4 text-left flex items-center justify-between gap-4"
                  >
                    <div className="flex items-baseline gap-3.5">
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--accent)",
                          fontWeight: 800
                        }}
                      >
                        {faq.num}
                      </span>
                      <span style={{ fontSize: "15px", fontWeight: 600 }}>
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      style={{
                        color: "var(--muted)",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 260ms cubic-bezier(0.22, 1, 0.36, 1)"
                      }}
                    />
                  </button>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateRows: isOpen ? "1fr" : "0fr",
                      transition: "grid-template-rows 280ms cubic-bezier(0.22, 1, 0.36, 1)"
                    }}
                  >
                    <div className="overflow-hidden">
                      <div
                        className="pb-4 pl-7 pr-4"
                        style={{
                          fontSize: "14px",
                          lineHeight: 1.75,
                          color: "var(--muted)"
                        }}
                      >
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 7: Mixtape Studio Pass Closing Ticket CTA (#buy) ── */}
      <section
        id="buy"
        className="max-w-[1240px] mx-auto px-5 sm:px-8 pb-20 pt-6"
      >
        <div
          className="relative overflow-hidden p-8 sm:p-12 md:p-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          style={{
            border: "2px solid #54356b",
            borderRadius: "28px",
            background:
              "linear-gradient(125deg, #5942b8 0%, #7858d4 48%, #b184e7 82%, #ffb4d5 100%)",
            color: "#fff5ff",
            boxShadow: "10px 10px 0 rgba(84, 53, 107, 0.22)"
          }}
        >
          <div className="lg:col-span-8 space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2">
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "999px",
                  background: "#ffecb1",
                  color: "#432369",
                  fontSize: "10px",
                  fontWeight: 800,
                  letterSpacing: "1.4px"
                }}
              >
                ADMIT ONE · YOUR COZY WORKSPACE PASS
              </span>
            </div>

            <h2
              className="lp-font-display"
              style={{
                fontSize: "clamp(26px, 3.2vw, 40px)",
                fontWeight: 700
              }}
            >
              พร้อมเปลี่ยนโต๊ะทำงานที่วุ่นวาย ให้กลายเป็นมุมโปรดของคุณหรือยัง?
            </h2>

            <p
              style={{
                fontSize: "15px",
                color: "rgba(255, 245, 255, 0.9)",
                lineHeight: 1.75,
                maxWidth: "54ch"
              }}
            >
              เข้ามาสร้างโปรเจกต์แรกได้ฟรี มีบอร์ดงาน ตาราง ปฏิทิน สมุดโน้ต ไดอารี่
              เครื่องเล่นเทป Lofi และสวนหินญี่ปุ่นรอให้คุณเข้ามาจัดจังหวะชีวิตในแบบของตัวเอง
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link href={defaultDestination}>
                <button
                  className="lp-press-btn"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    height: "52px",
                    padding: "0 26px",
                    borderRadius: "14px",
                    border: "2px solid #432369",
                    background: "#ffecb1",
                    color: "#432369",
                    fontSize: "14px",
                    fontWeight: 800,
                    boxShadow: "4px 4px 0 rgba(43, 19, 77, 0.35)"
                  }}
                >
                  <span>Enter Workspace</span>
                  <ArrowRight size={16} />
                </button>
              </Link>

              <Link href="/help">
                <button
                  className="lp-press-btn"
                  style={{
                    height: "52px",
                    padding: "0 20px",
                    borderRadius: "14px",
                    border: "1.5px solid rgba(255, 255, 255, 0.45)",
                    background: "rgba(255, 255, 255, 0.14)",
                    color: "#fff5ff",
                    fontSize: "14px",
                    fontWeight: 600
                  }}
                >
                  อ่านคู่มือการใช้งาน
                </button>
              </Link>
            </div>
          </div>

          {/* Right Ticket Stub with Cassette & Stickers */}
          <div className="lg:col-span-4 relative z-10 flex flex-col items-center justify-center p-5 rounded-2xl bg-white/15 border border-white/30 backdrop-blur-md">
            <div className="relative w-44 h-28 lp-float-sticker">
              <Image
                src="/images/login-cassette-cutout.png"
                alt="Retzlo Mixtape Pass"
                fill
                sizes="176px"
                className="object-contain drop-shadow-xl"
              />
            </div>
            <div className="mt-3 text-center">
              <div className="text-xs font-extrabold tracking-wider text-[#ffecb1]">
                RETZLO MIXTAPE EDITION
              </div>
              <div className="text-[11px] opacity-85 mt-0.5">
                ที่คุณทดลองสะสมไว้บนหน้านี้: <strong>{walletCoins} Coins</strong>
              </div>
            </div>
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
