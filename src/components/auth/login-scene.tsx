"use client";

import { MixtapeArtwork } from "./mixtape-artwork";
import Link from "next/link";
import { useRef, useState, type PointerEvent, type ReactNode, type SyntheticEvent } from "react";
import { ArrowLeft, ArrowRight, Check, Circle, Disc3, LayoutGrid, Pause, Play, RotateCcw } from "lucide-react";
import styles from "./login-scene.module.css";
import { MixtapeLogoMark } from "./mixtape-logo-mark";

const stages = ["To do", "In progress", "Done"] as const;

type AuthMode = "login" | "register" | "forgot-password";

const formCopy = {
  login: {
    eyebrow: "PRESS PLAY ON YOUR DAY",
    title: "Welcome back.",
    description: "Your next little win starts here.",
    footer: "New around here?",
    link: "Create an account",
    href: "/register",
  },
  register: {
    eyebrow: "MAKE SPACE FOR YOUR NEXT CHAPTER",
    title: "Find your flow.",
    description: "A little space for everything you want to do.",
    footer: "Already have an account?",
    link: "Sign in",
    href: "/login",
  },
  "forgot-password": {
    eyebrow: "LET'S GET YOU BACK IN THE GROOVE",
    title: "Lost your password?",
    description: "Enter your email and we'll send a code to help you get back in.",
    footer: "Remember your password?",
    link: "Back to sign in",
    href: "/login",
  },
} as const;

export function MixtapeAuthScene({ children, mode = "login" }: { children: ReactNode; mode?: AuthMode }) {
  const copy = formCopy[mode];
  const artRef = useRef<HTMLElement>(null);
  const taskRef = useRef<HTMLButtonElement>(null);
  const [playing, setPlaying] = useState(false);
  const [stage, setStage] = useState(0);

  function moveArtwork(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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

  function freezeBoard(event: SyntheticEvent<HTMLDivElement>) {
    const board = event.currentTarget;
    if (board.dataset.frozen === "true") return;
    board.style.transform = window.getComputedStyle(board).transform;
    board.dataset.frozen = "true";
  }

  function resumeBoard(event: SyntheticEvent<HTMLDivElement>) {
    const board = event.currentTarget;
    if (board.matches(":hover, :focus-within")) return;
    board.style.removeProperty("transform");
    delete board.dataset.frozen;
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section ref={artRef} className={styles.art} data-playing={playing} onPointerMove={moveArtwork} onPointerLeave={resetArtwork}>
          <MixtapeArtwork />
          <div className={styles.shade} />
          <div className={styles.musicAmbience} aria-hidden="true"><span className={styles.noteOne}>♪</span><span className={styles.noteTwo}>♫</span></div>
          <header className={styles.brandRow}><Link href="/" className={styles.brand} aria-label="Retzlo home"><MixtapeLogoMark /><span>retzlo</span></Link><span>YOUR DAILY MIX</span></header>
          <div className={styles.headline}><span className={styles.eyebrow}>A LITTLE FOCUS. A GOOD FLOW.</span><h1>Life has a rhythm.<br />Find yours.</h1><p>A fresh mix of plans, ideas, and little wins.<br />All together in your own workspace.</p></div>
          <div className={styles.board} onPointerEnter={freezeBoard} onPointerLeave={resumeBoard} onFocusCapture={freezeBoard} onBlurCapture={resumeBoard}>
            <div className={styles.boardHeader}>
              <span><LayoutGrid size={13} /> MY DAILY BOARD</span>
              <span className={styles.demoBadge}>TRY IT</span>
            </div>
            <div className={styles.columns} aria-hidden="true">
              {stages.map((name, index) => (
                <span key={name} className={styles.columnTitle} data-active={index === stage}>
                  <span className={styles.statusDot} data-stage={index} />{name}
                </span>
              ))}
            </div>
            <button
              ref={taskRef}
              type="button"
              className={styles.task}
              onClick={() => setStage((current) => (current + 1) % stages.length)}
              aria-label={stage === 2 ? "Reset demo card to To do" : `Move demo card to ${stages[stage + 1]}`}
            >
              <span className={styles.taskTag}>A LITTLE EVERYDAY MAGIC</span>
              <strong>{stage === 2 ? "One little win. Nice work!" : "Make room for ideas."}</strong>
              <span className={styles.taskFooter}>
                {stage === 2 ? <Check size={13} /> : <Circle size={13} />}
                <span>{stage === 2 ? "Done for today" : "One step at a time"}</span>
                {stage === 2 ? <RotateCcw size={15} /> : <ArrowRight size={15} />}
              </span>
            </button>
            <span className={styles.srOnly} role="status" aria-live="polite">Demo card: {stages[stage]}</span>
          </div>
          <div className={styles.sticker}>less rush,<br /><strong>more rhythm.</strong></div>
          <footer className={styles.artFooter}><div><span className={styles.trackLabel}>VOL. 01 / THE EVERYDAY MIX</span><span className={styles.trackTitle}><Disc3 size={16} className={playing ? styles.spinning : undefined} />{playing ? "Finding your flow" : "A space to begin"}</span></div><button type="button" className={styles.playButton} aria-label={playing ? "Pause visual animation" : "Play visual animation"} aria-pressed={playing} onClick={() => setPlaying((current) => !current)}>{playing ? <Pause size={17} /> : <Play size={17} />}</button></footer>
          <div className={styles.equalizer} data-playing={playing} aria-hidden="true">{Array.from({ length: 16 }, (_, index) => <i key={index} style={{ animationDelay: `${index * -0.13}s` }} />)}</div>
        </section>
        <section className={styles.formPanel} data-mode={mode}>
          <Link href="/" className={styles.back}><ArrowLeft size={14} /> Back to home</Link>
          <div className={styles.formContent}><span className={styles.formEyebrow}>{copy.eyebrow}</span><h2>{copy.title}</h2><p className={styles.intro}>{copy.description}</p>{children}<p className={styles.signup}>{copy.footer} <Link href={copy.href}>{copy.link} <ArrowRight size={12} /></Link></p></div>
          <p className={styles.legal}>{mode === "forgot-password" ? <>Your privacy matters. Read our <Link href="/privacy">Privacy Policy</Link>.</> : <>By {mode === "register" ? "creating an account" : "signing in"}, you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.</>}</p>
        </section>
      </div>
    </main>
  );
}
