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

interface HeroFocusTask {
  id: string;
  title: string;
  tag: string;
  coins: number;
}

const HERO_FOCUS_TASKS: HeroFocusTask[] = [
  {
    id: "hf-1",
    title: "จัดลำดับ 3 งานสำคัญที่สุดของวันนี้",
    tag: "TODAY'S FOCUS",
    coins: 25
  },
  {
    id: "hf-2",
    title: "เปิดโหมดโฟกัส 25 นาที เคลียร์งานหลัก",
    tag: "DEEP WORK",
    coins: 25
  },
  {
    id: "hf-3",
    title: "เขียนสรุปความคืบหน้าสั้นๆ ในสมุดโน้ต",
    tag: "DAILY SYNC",
    coins: 20
  }
];

const SAKURA_STAGES = [
  {
    level: 1,
    name: "Stage 1 · สวนทราย & ต้นอ่อนผลิใบ",
    desc: "สวนหินพร้อมต้นกล้าเล็กๆ รอรับน้ำและความใส่ใจ",
    imgSrc: "/images/landing/zen-stage-1.png",
    scale: 0.96,
    petals: 3
  },
  {
    level: 2,
    name: "Stage 2 · ต้นบอนไซเริ่มแตกกิ่งก้าน",
    desc: "ต้นไม้ค่อยๆ โตขึ้นตามภารกิจที่คุณเคลียร์ในแต่ละวัน",
    imgSrc: "/images/landing/zen-stage-2.png",
    scale: 1.0,
    petals: 6
  },
  {
    level: 3,
    name: "Stage 3 · ดอกตูมซากุระพร้อมสะพานไม้",
    desc: "บรรยากาศสวนเริ่มร่มรื่น ดอกตูมสีชมพูกำลังจะบาน",
    imgSrc: "/images/landing/zen-stage-3.png",
    scale: 1.03,
    petals: 10
  },
  {
    level: 4,
    name: "Stage 4 · ซากุระบานสะพรั่งคู่เสาโทริอิ!",
    desc: "สวนเซนสมบูรณ์แบบพร้อมเหรียญทองแห่งความสำเร็จ",
    imgSrc: "/images/landing/zen-stage-4.png",
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
  const [heroTaskIdx, setHeroTaskIdx] = useState(0);
  const [heroCompletedTasks, setHeroCompletedTasks] = useState<string[]>([]);

  // Interactive Playground & Live Coin Wallet state
  const [walletCoins, setWalletCoins] = useState<number>(45);
  const [coinBursts, setCoinBursts] = useState<CoinBurst[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(["task-brief"]);
  const [redeemedRewards, setRedeemedRewards] = useState<Record<string, number>>({});
  const [toastBanner, setToastBanner] = useState<string | null>(
    "ลองคลิกเคลียร์งานหรือแตะที่ภาพสวนหินญี่ปุ่นด้านล่างเพื่อสะสมเหรียญ!"
  );
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(true);
  const [ticketClaimed, setTicketClaimed] = useState<boolean>(false);

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
    setWalletCoins((prev) => Math.max(0, prev + amount));
    setCoinBursts((prev) => [...prev.slice(-3), { id: burstId, amount }]);
    if (amount > 0) {
      setToastBanner(`+${amount} Coins · ${message}`);
      playChime("coin");
    } else {
      setToastBanner(`${amount} Coins · ${message}`);
      playChime("click");
    }

    setTimeout(() => {
      setCoinBursts((prev) => prev.filter((b) => b.id !== burstId));
    }, 1200);
  };

  const handleTogglePlaygroundTask = (taskId: string, coins: number, title: string) => {
    const alreadyDone = completedTaskIds.includes(taskId);
    if (alreadyDone) {
      setCompletedTaskIds((prev) => prev.filter((id) => id !== taskId));
      triggerEarnCoin(-coins, `ยกเลิก "${title.slice(0, 18)}..."`);
    } else {
      setCompletedTaskIds((prev) => [...prev, taskId]);
      triggerEarnCoin(coins, `เคลียร์ "${title.slice(0, 18)}..." สำเร็จ!`);
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

  const TICKET_COST = 50;
  const handleClaimMixtapePass = () => {
    if (walletCoins < TICKET_COST) {
      setToastBanner(`ต้องการ ${TICKET_COST} Coins เพื่อแลกตั๋ว VIP (ขาดอีก ${TICKET_COST - walletCoins} Coins) · ลองกดเคลียร์งานด้านบนสิ!`);
      playChime("click");
      return;
    }
    setWalletCoins((prev) => Math.max(0, prev - TICKET_COST));
    setTicketClaimed(true);
    playChime("reward");
    setToastBanner("🎉 ปลดล็อกสิทธิ์ VIP Mixtape Pass สำเร็จ! รับสิทธิ์ทดลองใช้ฟรีเต็มระบบทันที");

    const burstId = Date.now() + Math.random();
    setCoinBursts((prev) => [...prev.slice(-3), { id: burstId, amount: -TICKET_COST }]);
    setTimeout(() => {
      setCoinBursts((prev) => prev.filter((b) => b.id !== burstId));
    }, 1200);
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
        setSakuraStageIdx((stage) => {
          const nextStage = (stage + 1) % SAKURA_STAGES.length;
          if (nextStage === 3) {
            triggerEarnCoin(20, "ซากุระบานสะพรั่งเต็มสวนเซน! 🌸");
          } else {
            triggerEarnCoin(10, `ซากุระเติบโตสู่ ${SAKURA_STAGES[nextStage].name}!`);
          }
          return nextStage;
        });
      } else {
        playChime("ripple");
      }
      return next;
    });
  };

  const currentHeroTask = HERO_FOCUS_TASKS[heroTaskIdx] || HERO_FOCUS_TASKS[0];
  const isHeroTaskAwarded = heroCompletedTasks.includes(currentHeroTask.id);

  const advanceHeroTask = () => {
    if (heroStage === 0) {
      setHeroStage(1);
      playChime("click");
    } else if (heroStage === 1) {
      setHeroStage(2);
      if (!isHeroTaskAwarded) {
        setHeroCompletedTasks((prev) => [...prev, currentHeroTask.id]);
        triggerEarnCoin(currentHeroTask.coins, `ทำภารกิจ "${currentHeroTask.title.slice(0, 18)}..." สำเร็จ!`);
      } else {
        playChime("reward");
        setToastBanner("ภารกิจนี้ทำเสร็จแล้ว · รับเหรียญไปแล้ว 🪙");
      }
    } else {
      setHeroTaskIdx((prev) => (prev + 1) % HERO_FOCUS_TASKS.length);
      setHeroStage(0);
      playChime("click");
    }
  };

  const resetHeroTask = () => {
    setHeroStage(0);
    playChime("click");
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
      className="relative overflow-x-hidden"
      style={{
        minHeight: "100svh",
        background: `
          /* 1. Visible retro graph drafting grid */
          linear-gradient(to right, rgba(120, 88, 212, 0.12) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(120, 88, 212, 0.12) 1px, transparent 1px),
          /* 2. Micro dot-matrix tactile drafting paper */
          radial-gradient(circle, rgba(120, 88, 212, 0.18) 1.2px, transparent 1.2px),
          /* 3. Deep radiant aurora glow blooms across entire page height */
          radial-gradient(circle at 10% 3%, rgba(120, 88, 212, 0.28) 0%, transparent 45rem),
          radial-gradient(circle at 90% 7%, rgba(255, 180, 213, 0.26) 0%, transparent 48rem),
          radial-gradient(circle at 50% 25%, rgba(246, 201, 118, 0.18) 0%, transparent 48rem),
          radial-gradient(circle at 8% 48%, rgba(120, 88, 212, 0.24) 0%, transparent 50rem),
          radial-gradient(circle at 92% 64%, rgba(219, 39, 119, 0.22) 0%, transparent 52rem),
          radial-gradient(circle at 35% 82%, rgba(52, 211, 153, 0.18) 0%, transparent 48rem),
          radial-gradient(circle at 85% 94%, rgba(120, 88, 212, 0.24) 0%, transparent 54rem),
          var(--background)
        `,
        backgroundSize: "48px 48px, 48px 48px, 24px 24px, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%",
        color: "var(--foreground)"
      }}
    >
      {/* ── Ambient Studio Atmospheric Elements & Floating Doodles ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 overflow-hidden z-0"
      >
        {/* Soft Ambient Aurora Gradient Blobs */}
        <div
          className="absolute -top-24 -left-24 w-[620px] h-[620px] rounded-full blur-[110px]"
          style={{ background: "rgba(120, 88, 212, 0.32)" }}
        />
        <div
          className="absolute top-28 -right-28 w-[680px] h-[680px] rounded-full blur-[120px]"
          style={{ background: "rgba(255, 180, 213, 0.28)" }}
        />
        <div
          className="absolute top-[1100px] left-1/2 -translate-x-1/2 w-[760px] h-[760px] rounded-full blur-[140px]"
          style={{ background: "rgba(246, 201, 118, 0.18)" }}
        />
        <div
          className="absolute top-[2000px] -left-32 w-[680px] h-[680px] rounded-full blur-[130px]"
          style={{ background: "rgba(120, 88, 212, 0.24)" }}
        />
        <div
          className="absolute top-[2900px] -right-32 w-[720px] h-[720px] rounded-full blur-[130px]"
          style={{ background: "rgba(219, 39, 119, 0.22)" }}
        />
        <div
          className="absolute top-[3800px] -left-28 w-[680px] h-[680px] rounded-full blur-[130px]"
          style={{ background: "rgba(52, 211, 153, 0.18)" }}
        />
        <div
          className="absolute bottom-20 -right-28 w-[720px] h-[720px] rounded-full blur-[130px]"
          style={{ background: "rgba(120, 88, 212, 0.26)" }}
        />

        {/* Ambient Corner Crosshairs & Studio Watermarks */}
        <div className="absolute top-20 left-4 text-xs font-mono text-purple-400/40 select-none hidden md:block">
          + RETZLO STUDIO · 2026 +
        </div>
        <div className="absolute top-20 right-4 text-xs font-mono text-pink-400/40 select-none hidden md:block">
          + 24/7 LOFI VIBES +
        </div>

        {/* Floating Sparkles, Notes, and Cassette Tags down the page */}
        <div className="absolute top-36 left-4 sm:left-8 text-2xl text-purple-400/50 lp-bg-sparkle hidden sm:block">
          ✦
        </div>
        <div
          className="absolute top-72 left-6 sm:left-12 text-base text-pink-400/50 lp-bg-drift hidden sm:block"
          style={{ "--lp-rot": "-8deg" } as CSSProperties}
        >
          ♪
        </div>
        <div
          className="absolute top-[520px] left-3 sm:left-8 p-1.5 px-3 rounded-md border border-purple-400/30 bg-purple-500/15 text-[10px] font-mono tracking-widest text-purple-300/70 lp-bg-drift hidden md:block"
          style={{ "--lp-rot": "-5deg" } as CSSProperties}
        >
          SIDE A · 45 MIN
        </div>

        <div
          className="absolute top-48 right-4 sm:right-10 text-2xl text-pink-400/55 lp-bg-sparkle hidden sm:block"
          style={{ animationDelay: "1.5s" }}
        >
          ✧
        </div>
        <div
          className="absolute top-96 right-6 sm:right-14 text-lg text-amber-400/50 lp-bg-drift hidden sm:block"
          style={{ "--lp-rot": "10deg", animationDelay: "1s" } as CSSProperties}
        >
          ♫
        </div>
        <div
          className="absolute top-[680px] right-3 sm:right-8 p-1.5 px-3 rounded-md border border-amber-400/30 bg-amber-500/15 text-[10px] font-mono tracking-widest text-amber-300/70 lp-bg-drift hidden md:block"
          style={{ "--lp-rot": "4deg", animationDelay: "2s" } as CSSProperties}
        >
          24/7 LOFI VIBES
        </div>

        <div
          className="absolute top-[1350px] left-4 sm:left-8 text-xl text-emerald-400/50 lp-bg-sparkle hidden sm:block"
          style={{ animationDelay: "2.5s" }}
        >
          ✦
        </div>
        <div
          className="absolute top-[1600px] left-3 sm:left-8 p-1.5 px-3 rounded-md border border-emerald-400/30 bg-emerald-500/15 text-[10px] font-mono tracking-widest text-emerald-300/70 lp-bg-drift hidden md:block"
          style={{ "--lp-rot": "-3deg", animationDelay: "1.2s" } as CSSProperties}
        >
          ZEN FOCUS · SAKURA
        </div>

        <div
          className="absolute top-[2200px] right-4 sm:right-10 text-xl text-purple-400/50 lp-bg-sparkle hidden sm:block"
          style={{ animationDelay: "3s" }}
        >
          ✧
        </div>
        <div
          className="absolute top-[2500px] right-3 sm:right-8 p-1.5 px-3 rounded-md border border-pink-400/30 bg-pink-500/15 text-[10px] font-mono tracking-widest text-pink-300/70 lp-bg-drift hidden md:block"
          style={{ "--lp-rot": "5deg", animationDelay: "2.8s" } as CSSProperties}
        >
          BPM: 72 · CHILL
        </div>

        <div
          className="absolute top-[3200px] left-4 sm:left-8 text-xl text-amber-400/50 lp-bg-sparkle hidden sm:block"
          style={{ animationDelay: "1.8s" }}
        >
          ✦
        </div>
        <div
          className="absolute top-[3500px] left-3 sm:left-8 p-1.5 px-3 rounded-md border border-purple-400/30 bg-purple-500/15 text-[10px] font-mono tracking-widest text-purple-300/70 lp-bg-drift hidden md:block"
          style={{ "--lp-rot": "-4deg", animationDelay: "3.5s" } as CSSProperties}
        >
          RETZLO STUDIO
        </div>

        <div
          className="absolute top-[4200px] right-4 sm:right-10 text-xl text-pink-400/50 lp-bg-sparkle hidden sm:block"
          style={{ animationDelay: "0.8s" }}
        >
          ✧
        </div>
        <div
          className="absolute top-[4500px] right-3 sm:right-8 p-1.5 px-3 rounded-md border border-emerald-400/30 bg-emerald-500/15 text-[10px] font-mono tracking-widest text-emerald-300/70 lp-bg-drift hidden md:block"
          style={{ "--lp-rot": "3deg", animationDelay: "1.5s" } as CSSProperties}
        >
          LESS RUSH · MORE RHYTHM
        </div>
      </div>

      {/* ── Top Navigation Bar with Live Coin Counter & Burst ─────────── */}
      {/* ── Tactile Studio Herobar with Live Coin Wallet & Equalizer (w-full) ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1.5px solid var(--border)",
          background: "color-mix(in srgb, var(--background) 86%, transparent)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)"
        }}
      >
        {/* Retro Multi-Color Accent Tape on top */}
        <div
          style={{
            height: "3px",
            background:
              "linear-gradient(90deg, #7858d4 0%, #db2777 35%, #f59e0b 70%, #10b981 100%)",
            opacity: 0.85
          }}
        />

        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-16 flex items-center justify-between gap-6">
          {/* Brand Logo */}
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 shrink-0"
            style={{
              fontSize: "24px",
              fontWeight: 800,
              letterSpacing: "-1px",
              color: "var(--foreground)"
            }}
          >
            <MixtapeLogoMark />
            <span>retzlo</span>
          </Link>

          {/* Clean Airy Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-[13.5px] font-medium text-[var(--muted)]">
            <a
              href="#walkthrough"
              className="transition-colors hover:text-[var(--foreground)]"
            >
              ฟีเจอร์เด่น
            </a>
            <a
              href="#pain-tabs"
              className="transition-colors hover:text-[var(--foreground)]"
            >
              ปัญหาที่แก้
            </a>
            <a
              href="#playground"
              className="transition-colors hover:text-[var(--foreground)] flex items-center gap-1.5"
            >
              <span>มินิเกมสะสมเหรียญ</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </a>
            <a
              href="#comparison"
              className="transition-colors hover:text-[var(--foreground)]"
            >
              เหมาะกับใคร
            </a>
            <a
              href="#faq"
              className="transition-colors hover:text-[var(--foreground)]"
            >
              คำถามพบบ่อย
            </a>
          </nav>

          {/* Right Actions: Compact, Spacious, Elegant */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {/* Live Interactive Coin Pill (Compact & Cute) */}
            <div className="relative">
              <a
                href="#playground"
                title="กระเป๋าเหรียญสะสมจากการทดลองกดเล่นบนหน้าเว็บ (คลิกเพื่อไปที่มินิเกม)"
                className="lp-press-btn inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold"
                style={{
                  background: "#ffecb1",
                  color: "#432369",
                  border: "1.5px solid #54356b",
                  boxShadow: "2px 2px 0 rgba(84, 53, 107, 0.22)"
                }}
              >
                <span>🪙</span>
                <span className="font-mono font-black">{walletCoins}</span>
              </a>

              {/* Floating +Coin / -Coin Burst Particles */}
              {coinBursts.map((b) => (
                <span
                  key={b.id}
                  className="lp-coin-burst pointer-events-none absolute -top-3.5 right-0 px-2.5 py-0.5 rounded-full text-[11px] font-black shadow-md"
                  style={{
                    background: b.amount > 0 ? "#10b981" : "#ef4444",
                    color: "#ffffff",
                    border: "1.5px solid rgba(255, 255, 255, 0.5)"
                  }}
                >
                  {b.amount > 0 ? `+${b.amount}c` : `${b.amount}c`}
                </span>
              ))}
            </div>

            {/* Compact Lofi Audio Synthesizer Icon Button */}
            <button
              type="button"
              onClick={handlePlayToggle}
              title={isPlaying ? "พักเสียงดนตรี Lofi" : "เปิดฟังเสียงคอร์ด Lofi สดจากเบราว์เซอร์"}
              className="lp-press-btn inline-flex items-center justify-center w-9 h-9 rounded-full"
              style={{
                border: isPlaying
                  ? "1.5px solid #7858d4"
                  : "1px solid var(--border)",
                background: isPlaying
                  ? "rgba(120, 88, 212, 0.15)"
                  : "var(--paper)",
                color: isPlaying ? "#7858d4" : "var(--muted)"
              }}
            >
              {isPlaying ? (
                <span className="flex items-center gap-0.5 h-3 text-[#7858d4]">
                  <span className="lp-eq-bar" />
                  <span className="lp-eq-bar" />
                  <span className="lp-eq-bar" />
                </span>
              ) : (
                <Disc3 size={16} />
              )}
            </button>

            <ThemeToggle variant="icon" />

            {/* Auth Buttons */}
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/profile"
                  style={{ fontSize: "13px", color: "var(--muted)" }}
                  className="px-2 py-1 truncate max-w-[130px] hover:text-[var(--foreground)] transition-colors"
                >
                  {currentUser.name || currentUser.email || "Workspace user"}
                </Link>
                <Link href={defaultDestination}>
                  <button
                    className="lp-press-btn"
                    style={{
                      height: "38px",
                      padding: "0 18px",
                      borderRadius: "12px",
                      border: "1.5px solid #54356b",
                      background: "var(--accent)",
                      color: "var(--background)",
                      fontSize: "12.5px",
                      fontWeight: 800,
                      boxShadow: "2.5px 2.5px 0 rgba(84, 53, 107, 0.25)"
                    }}
                  >
                    Enter Workspace
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--muted)"
                  }}
                  className="px-2 py-1 hover:text-[var(--foreground)] transition-colors"
                >
                  Sign In
                </Link>
                <Link href={defaultDestination}>
                  <button
                    className="lp-press-btn"
                    style={{
                      height: "38px",
                      padding: "0 18px",
                      borderRadius: "12px",
                      border: "1.5px solid #54356b",
                      background: "var(--accent)",
                      color: "var(--background)",
                      fontSize: "12.5px",
                      fontWeight: 800,
                      boxShadow: "2.5px 2.5px 0 rgba(84, 53, 107, 0.25)"
                    }}
                  >
                    Enter Workspace
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href="#playground"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black"
              style={{
                background: "#ffecb1",
                color: "#432369",
                border: "1.5px solid #54356b"
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
      <section id="cp-hero" className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-4 pb-12 sm:py-8">
        <div
          className="w-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden"
          style={{
            border: "2px solid var(--border-strong, var(--border))",
            borderRadius: "30px",
            boxShadow: "10px 10px 0 rgba(84, 53, 107, 0.14), var(--shadow-floating)",
            background: "var(--panel-strong)"
          }}
        >
          {/* Left 6 Cols: Tactile Studio Copy + Retro Sticker Dock */}
          <div className="lg:col-span-6 p-7 sm:p-10 lg:p-12 xl:p-14 flex flex-col justify-between gap-8">
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

          {/* Right 6 Cols: Dual-Panel Interactive Studio Workstation Showcase */}
          <div
            ref={artRef}
            onPointerMove={moveArtwork}
            onPointerLeave={resetArtwork}
            className="lg:col-span-6 relative overflow-hidden flex flex-col justify-between p-6 sm:p-8 lg:p-10 min-h-[520px] lg:min-h-[620px]"
            style={{
              background:
                "linear-gradient(180deg, #5942b8 0%, #7858d4 42%, #b184e7 68%, #ffb4d5 100%)",
              color: "#fff5ff",
              isolation: "isolate"
            }}
          >
            <MixtapeArtwork />

            {/* Top Scene Header */}
            <div className="relative z-10 flex items-center justify-between text-[11px] tracking-[1.8px] font-bold text-[#f3e8ff]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>SIDE A · YOUR DAILY MIXTAPE</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-black/30 border border-white/25 text-xs font-black shadow-sm">
                🪙 WALLET: {walletCoins} COINS
              </span>
            </div>

            {/* Center: Cohesive 2-Panel Studio Workstation Showcase */}
            <div className="relative z-10 my-auto py-5 sm:py-6 grid grid-cols-1 sm:grid-cols-12 gap-4 lg:gap-5 items-center">
              {/* Left Panel: Framed Cozy Studio Desk Monitor */}
              <div
                className="sm:col-span-5 flex flex-col lp-float-sticker"
                style={
                  {
                    "--lp-rot": "-2.5deg",
                    background: "#fffaf0",
                    color: "#432369",
                    padding: "10px",
                    borderRadius: "18px",
                    border: "2px solid #54356b",
                    boxShadow: "5px 5px 0 rgba(36, 15, 69, 0.32)"
                  } as CSSProperties
                }
              >
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-[#54356b]/20 bg-purple-900/10">
                  <Image
                    src="/images/landing/cozy-desk-hero.jpg"
                    alt="Cozy Lofi Desk Illustration"
                    fill
                    sizes="(max-width: 640px) 100vw, 240px"
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="mt-2.5 px-1 flex items-center justify-between text-[10px] font-black tracking-wide">
                  <span>🎨 Cozy Studio Desk</span>
                  <span className="text-pink-600 font-mono">SIDE A</span>
                </div>
                {/* Micro Tilted Tag */}
                <div
                  className="mt-2 p-1.5 rounded-lg text-center text-[10px] font-bold"
                  style={{
                    background: "#ffecb1",
                    color: "#54356b",
                    border: "1px dashed #54356b"
                  }}
                >
                  less rush, <strong>more rhythm.</strong>
                </div>
              </div>

              {/* Right Panel: Interactive Floating Board Card */}
              <div className="sm:col-span-7 flex flex-col">
                <div
                  className="lp-spring-card"
                  style={{
                    width: "100%",
                    padding: "18px",
                    border: "1.5px solid rgba(255, 240, 255, 0.78)",
                    borderRadius: "20px",
                    background: "rgba(85, 51, 133, 0.94)",
                    boxShadow: "0 18px 40px rgba(26, 11, 69, 0.34)",
                    backdropFilter: "blur(16px)"
                  }}
                >
                  <div className="flex items-center justify-between text-[11px] tracking-[1px] font-bold mb-3 text-[#f3e8ff]">
                    <span className="flex items-center gap-1.5">
                      <LayoutGrid size={13} /> MY DAILY BOARD
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#ffecb1] text-[#432369] text-[10px] font-extrabold shadow-sm">
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

                  <div
                    className="lp-spring-card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      textAlign: "left",
                      gap: "10px",
                      width: "100%",
                      padding: "16px",
                      borderRadius: "16px",
                      border: "2px solid #54356b",
                      background: heroStage === 2 ? "#f0fdf4" : "#fff7fc",
                      color: "#432369",
                      boxShadow: "4px 4px 0 rgba(43, 19, 77, 0.25)"
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 800,
                          letterSpacing: "1px",
                          color: heroStage === 2 ? "#15803d" : "#8b5cf6"
                        }}
                      >
                        {currentHeroTask.tag} · {heroTaskIdx + 1}/3
                      </span>
                      <span
                        className="text-[11px] font-black px-2.5 py-0.5 rounded-full"
                        style={{
                          background: heroStage === 2 ? "#dcfce7" : "#fff0b8",
                          color: heroStage === 2 ? "#166534" : "#78350f"
                        }}
                      >
                        {isHeroTaskAwarded && heroStage === 2
                          ? "✓ รับแล้ว +25c"
                          : `+${currentHeroTask.coins} Coins`}
                      </span>
                    </div>

                    <strong style={{ fontSize: "14.5px", lineHeight: 1.45 }}>
                      {heroStage === 2
                        ? `🎉 เสร็จเรียบร้อย! "${currentHeroTask.title}"`
                        : heroStage === 1
                          ? `กำลังทำ: ${currentHeroTask.title}`
                          : currentHeroTask.title}
                    </strong>

                    {heroStage === 2 ? (
                      <div className="flex items-center gap-2 pt-1.5 border-t border-black/10">
                        <button
                          type="button"
                          onClick={advanceHeroTask}
                          className="lp-press-btn flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                          style={{
                            background: "#54356b",
                            color: "#ffecb1",
                            border: "1px solid #432369"
                          }}
                        >
                          <span>งานถัดไป ({heroTaskIdx + 2 > 3 ? 1 : heroTaskIdx + 2}/3)</span>
                          <ArrowRight size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={resetHeroTask}
                          className="lp-press-btn py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
                          style={{
                            background: "#ffffff",
                            color: "#54356b",
                            border: "1px solid rgba(84, 53, 107, 0.3)"
                          }}
                          title="เริ่มขยับการ์ดใบนี้ใหม่อีกรอบ"
                        >
                          <RotateCcw size={13} />
                          <span>รีเซ็ต</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={advanceHeroTask}
                        className="lp-press-btn flex items-center justify-between w-full pt-1.5 text-xs font-extrabold"
                        style={{ color: "#6d4c7d" }}
                      >
                        <span className="flex items-center gap-2">
                          <Circle size={14} />
                          <span>
                            {heroStage === 0
                              ? "คลิกเพื่อเริ่มทำ (To do → In progress)"
                              : "คลิกเพื่อทำให้เสร็จ (In progress → Done ✓)"}
                          </span>
                        </span>
                        <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Audio Cassette Bar */}
            <div
              className="relative z-10 flex items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl"
              style={{
                background: "rgba(255, 245, 255, 0.38)",
                border: "1px solid rgba(84, 53, 107, 0.3)",
                backdropFilter: "blur(12px)"
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
                    size={16}
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
        className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 sm:py-16"
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
                  {/* Custom Hand-Drawn Zen Sakura 4-Stage Illustration */}
                  <div
                    className="absolute inset-0 flex items-center justify-center p-3 transition-transform duration-500 ease-out"
                    style={{
                      transform: `scale(${currentSakura.scale})`
                    }}
                  >
                    <Image
                      src={currentSakura.imgSrc}
                      alt={currentSakura.name}
                      fill
                      sizes="340px"
                      className="object-contain drop-shadow-lg"
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
                    setWaterDrops((prev) => prev + 1);
                    setSakuraStageIdx((s) => {
                      const nextStage = (s + 1) % SAKURA_STAGES.length;
                      if (nextStage === 3) {
                        triggerEarnCoin(20, "ซากุระบานสะพรั่งเต็มสวนเซน! 🌸");
                      } else {
                        triggerEarnCoin(10, `ซากุระเติบโตสู่ ${SAKURA_STAGES[nextStage].name}!`);
                      }
                      return nextStage;
                    });
                  }}
                  className="font-bold text-emerald-700 dark:text-emerald-400 underline hover:opacity-80"
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
        className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-14 sm:py-20"
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
                  className="relative w-36 h-36 rounded-2xl overflow-hidden p-2 flex items-center justify-center"
                  style={{
                    transform: "rotate(2deg)",
                    background: "#fffaf0",
                    border: "1.5px solid rgba(84, 53, 107, 0.25)",
                    boxShadow: "4px 4px 0 rgba(84, 53, 107, 0.12)"
                  }}
                >
                  <Image
                    src={activePain.beforeIllustSrc}
                    alt={`Before: ${activePain.title}`}
                    fill
                    sizes="144px"
                    className="object-contain p-1.5 drop-shadow-md"
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
                    className="relative w-36 h-36 rounded-2xl overflow-hidden p-2 flex items-center justify-center"
                    style={{
                      transform: "rotate(-2deg)",
                      background: "#fffaf0",
                      border: `2px solid ${activePain.accentColor}`,
                      boxShadow: "4px 4px 0 rgba(84, 53, 107, 0.14)"
                    }}
                  >
                    <Image
                      src={activePain.afterIllustSrc}
                      alt={`After: ${activePain.afterTitle}`}
                      fill
                      sizes="144px"
                      className="object-contain p-1.5 drop-shadow-md"
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
                            triggerEarnCoin(
                              -(item.coin || 15),
                              `ยกเลิก "${item.label.slice(0, 20)}..."`
                            );
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
        className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-14 sm:py-20"
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
        className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-14 sm:py-20 space-y-14"
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

              {/* Cozy Achiever Feature Spot Banner */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-purple-300/30 mb-4">
                <div className="relative w-16 h-16 shrink-0">
                  <Image
                    src="/images/landing/fit-cozy-achiever.png"
                    alt="Cozy Achiever Fit Illustration"
                    fill
                    sizes="64px"
                    className="object-contain drop-shadow-md"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold tracking-wider text-purple-600 dark:text-purple-300 uppercase">
                    COZY ACHIEVER · จังหวะที่พอดี
                  </span>
                  <div className="text-xs font-bold text-[var(--foreground)] mt-0.5">
                    ชอบความเรียบง่าย บอร์ดสะอาดตา มีสมุดโน้ตและเพลงคลอ
                  </div>
                </div>
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

              {/* Heavy ERP Scale Feature Spot Banner */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-amber-300/30 mb-4">
                <div className="relative w-16 h-16 shrink-0">
                  <Image
                    src="/images/landing/fit-heavy-erp.png"
                    alt="Heavy Enterprise Machine Illustration"
                    fill
                    sizes="64px"
                    className="object-contain drop-shadow-md"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold tracking-wider text-amber-600 dark:text-amber-400 uppercase">
                    ENTERPRISE SCALE · สูตรซับซ้อน
                  </span>
                  <div className="text-xs font-bold text-[var(--foreground)] mt-0.5">
                    ต้องการโรงงานสูตรหลายร้อยตารางหรือระบบ ERP ขนาดมหึมา
                  </div>
                </div>
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
        className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-14 sm:py-20"
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
        className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pb-20 pt-6"
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

            {/* Interactive Coin Redemption UI Terminal */}
            {ticketClaimed ? (
              <div className="p-4 sm:p-5 rounded-2xl border-2 border-[#ffecb1] bg-black/30 backdrop-blur-md space-y-3 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#ffecb1] text-[#432369] text-xs font-black tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} /> VIP MIXTAPE PASS ACTIVATED
                  </span>
                  <span className="text-xs font-bold text-[#ffecb1] flex items-center gap-1">
                    <Check size={14} /> ปลดล็อกสิทธิ์สำเร็จ
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
                  ยินดีด้วยครับ! คุณได้ใช้ <strong>50 Coins</strong> ที่สะสมจากการทดลองเล่นหน้าเว็บ แลกรับสิทธิ์ <strong>Retzlo VIP Mixtape Pass</strong> เรียบร้อยแล้ว พร้อมรับสิทธิ์ทดลองใช้งานฟรีทุกฟีเจอร์ + ธีมสตูดิโอย้อนยุคพิเศษ
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link href={defaultDestination}>
                    <button
                      className="lp-press-btn inline-flex items-center gap-2.5 h-12 px-6 rounded-xl font-black text-sm text-[#432369] bg-[#ffecb1] border-2 border-[#432369] shadow-[4px_4px_0_rgba(43,19,77,0.35)]"
                    >
                      <span>Enter Workspace (เริ่มใช้งานสิทธิ์ VIP ทันที)</span>
                      <ArrowRight size={16} />
                    </button>
                  </Link>
                  <Link href="/help">
                    <button
                      className="lp-press-btn h-12 px-4.5 rounded-xl text-xs font-semibold border border-white/40 bg-white/10 text-white"
                    >
                      อ่านคู่มือการใช้งาน
                    </button>
                  </Link>
                </div>
              </div>
            ) : walletCoins >= TICKET_COST ? (
              <div className="p-4 sm:p-5 rounded-2xl border-2 border-[#ffecb1] bg-black/25 backdrop-blur-md space-y-3 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#ffecb1] text-[#432369] text-xs font-black tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} /> แต้มของคุณพร้อมแลกรับสิทธิ์แล้ว!
                  </span>
                  <span className="text-xs font-mono font-black text-[#ffecb1]">
                    มีสะสม {walletCoins} Coins (ใช้ {TICKET_COST} Coins)
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
                  นำแต้มที่คุณได้ทดลองกดเล่นบนหน้าเว็บนี้ มาแลกรับ <strong>VIP Mixtape Pass ทดลองใช้งานฟรีเต็มระบบ</strong> ได้ทันทีตรงนี้!
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleClaimMixtapePass}
                    className="lp-press-btn inline-flex items-center gap-2 h-12 px-6 rounded-xl font-black text-sm text-[#432369] bg-[#ffecb1] border-2 border-[#432369] shadow-[4px_4px_0_rgba(43,19,77,0.35)] cursor-pointer"
                  >
                    <span>🎟️ ใช้ 50 Coins แลกรับสิทธิ์ VIP Pass ฟรี</span>
                    <Sparkles size={16} />
                  </button>
                  <Link href={defaultDestination}>
                    <button
                      className="lp-press-btn inline-flex items-center gap-2 h-12 px-5 rounded-xl font-bold text-xs text-white border border-white/40 bg-white/10"
                    >
                      <span>Enter Workspace</span>
                      <ArrowRight size={14} />
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-5 rounded-2xl border border-white/30 bg-black/20 backdrop-blur-md space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-[#ffecb1] flex items-center gap-1.5">
                    <span>🪙 แต้มสะสมของคุณ:</span>
                    <strong className="font-mono text-sm">{walletCoins} / {TICKET_COST} Coins</strong>
                  </span>
                  <span className="opacity-80">
                    ขาดอีก {TICKET_COST - walletCoins} Coins จะแลกตั๋ว VIP ฟรีได้!
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/20">
                  <div
                    className="h-full bg-gradient-to-r from-amber-300 to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((walletCoins / TICKET_COST) * 100))}%` }}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a href="#playground">
                    <button
                      type="button"
                      className="lp-press-btn inline-flex items-center gap-2 h-11 px-5 rounded-xl font-bold text-xs text-[#432369] bg-[#ffecb1] border border-[#54356b] shadow-[3px_3px_0_rgba(67,35,105,0.3)]"
                    >
                      <span>🎮 ย้อนไปกดเล่นเก็บแต้มให้ครบ {TICKET_COST}c</span>
                      <ArrowRight size={14} />
                    </button>
                  </a>
                  <Link href={defaultDestination}>
                    <button
                      className="lp-press-btn inline-flex items-center gap-2 h-11 px-5 rounded-xl font-bold text-xs text-white border border-white/30 bg-white/10"
                    >
                      <span>Enter Workspace (เข้าใช้แบบปกติ)</span>
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Ticket Stub with Cassette & Ink Stamp */}
          <div
            className={`lg:col-span-4 relative z-10 flex flex-col items-center justify-center p-6 rounded-3xl backdrop-blur-md transition-all duration-300 ${
              ticketClaimed
                ? "bg-black/35 border-2 border-[#ffecb1] shadow-[0_0_30px_rgba(255,236,177,0.35)]"
                : walletCoins >= TICKET_COST
                  ? "bg-white/20 border-2 border-[#ffecb1]/70 shadow-xl"
                  : "bg-white/10 border border-white/25"
            }`}
          >
            {/* Cassette Graphic with Die-Cut Stamp */}
            <div className="relative w-48 h-32 lp-float-sticker">
              <Image
                src="/images/login-cassette-cutout.png"
                alt="Retzlo Mixtape Pass"
                fill
                sizes="192px"
                className="object-contain drop-shadow-xl"
              />

              {/* Ink Stamp Overlay when Claimed */}
              {ticketClaimed && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <div
                    className="px-3.5 py-1.5 rounded-lg border-2 border-[#ffecb1] bg-[#432369]/90 text-[#ffecb1] text-xs font-black tracking-widest uppercase transform -rotate-12 shadow-2xl"
                    style={{ letterSpacing: "2px" }}
                  >
                    ★ CLAIMED VIP ★
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 text-center w-full space-y-1.5">
              <div className="text-xs font-black tracking-wider text-[#ffecb1]">
                RETZLO MIXTAPE EDITION
              </div>

              {ticketClaimed ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/40 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ปลดล็อกสิทธิ์ VIP สำเร็จแล้ว</span>
                </div>
              ) : walletCoins >= TICKET_COST ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/40 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>พร้อมแลกตั๋ว VIP (ครบ {TICKET_COST}c แล้ว!)</span>
                </div>
              ) : (
                <div className="text-[11px] text-white/80">
                  แต้มของคุณตอนนี้: <strong className="text-[#ffecb1] font-mono text-xs">{walletCoins} Coins</strong>
                </div>
              )}

              <div className="text-[10px] text-white/60 tracking-wider uppercase pt-1">
                ADMIT ONE · RETRO WORKSPACE PASS
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
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
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
