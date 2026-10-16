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
  ChevronDown,
  Check,
  XCircle,
  Layers
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
  FAQ_ROW_2
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

// ── 3D Projection Helpers for LofiCassette3D ──────────────────────────
interface Point3D {
  x: number;
  y: number;
  z: number;
}

function rotateX(p: Point3D, angle: number): Point3D {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: p.x,
    y: p.y * cos - p.z * sin,
    z: p.y * sin + p.z * cos
  };
}

function rotateY(p: Point3D, angle: number): Point3D {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: p.x * cos + p.z * sin,
    y: p.y,
    z: -p.x * sin + p.z * cos
  };
}

function project(
  p: Point3D,
  width: number,
  height: number,
  scale: number,
  distance: number
): { x: number; y: number; z: number } {
  const factor = scale / (distance + p.z);
  return {
    x: width / 2 + p.x * factor,
    y: height / 2 + p.y * factor,
    z: p.z
  };
}

// ── Interactive 3D Spinning Cassette Deck Component ──────────────────
function LofiCassette3D({
  isPlaying,
  onClick
}: {
  isPlaying: boolean;
  onClick: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ targetX: 0.25, targetY: 0.5 });
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 1.5;
      const y = (e.clientY / window.innerHeight - 0.5) * 1.5;
      mouseRef.current.targetX = y * 0.5 + 0.25;
      mouseRef.current.targetY = x * 0.5 + 0.5;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let autoAngle = 0;

    const halfW = 60;
    const halfH = 38;
    const halfD = 6;

    const vertices: Point3D[] = [
      { x: -halfW, y: -halfH, z: -halfD },
      { x: halfW, y: -halfH, z: -halfD },
      { x: halfW, y: halfH, z: -halfD },
      { x: -halfW, y: halfH, z: -halfD },
      { x: -halfW, y: -halfH, z: halfD },
      { x: halfW, y: -halfH, z: halfD },
      { x: halfW, y: halfH, z: halfD },
      { x: -halfW, y: halfH, z: halfD }
    ];

    const labelW = 44;
    const labelH = 22;
    const labelVertices: Point3D[] = [
      { x: -labelW, y: -labelH - 4, z: halfD + 0.5 },
      { x: labelW, y: -labelH - 4, z: halfD + 0.5 },
      { x: labelW, y: labelH - 4, z: halfD + 0.5 },
      { x: -labelW, y: labelH - 4, z: halfD + 0.5 }
    ];

    const leftSpoolCenter: Point3D = { x: -22, y: -2, z: halfD + 1 };
    const rightSpoolCenter: Point3D = { x: 22, y: -2, z: halfD + 1 };
    const spoolRadius = 10;

    const particles = Array.from({ length: 14 }, (_, i) => ({
      angle: (i / 14) * Math.PI * 2,
      radius: 72 + (i % 4) * 14,
      yOffset: ((i * 17) % 60) - 30,
      speed: 0.008 + (i % 3) * 0.004,
      size: 1.2 + (i % 3) * 0.6,
      color: i % 2 === 0 ? "#a9a2ff" : "#e5bd72"
    }));

    let currentRotX = 0.25;
    let currentRotY = 0.5;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      autoAngle += isPlaying ? 0.018 : 0.005;
      currentRotX += (mouseRef.current.targetX - currentRotX) * 0.08;
      currentRotY += (mouseRef.current.targetY + autoAngle - currentRotY) * 0.08;

      const rx = currentRotX;
      const ry = currentRotY;
      const scale = 2.1;
      const distance = 220;

      const projectPoint = (pt: Point3D) => {
        let rotated = rotateX(pt, rx);
        rotated = rotateY(rotated, ry);
        return project(rotated, w, h, scale * 100, distance);
      };

      particles.forEach((p) => {
        p.angle += p.speed * (isPlaying ? 2.2 : 0.7);
        const px = Math.cos(p.angle) * p.radius;
        const pz = Math.sin(p.angle) * p.radius;
        const pt: Point3D = { x: px, y: p.yOffset, z: pz };
        let rotated = rotateX(pt, rx);
        rotated = rotateY(rotated, ry);

        if (rotated.z < 0) {
          const projP = project(rotated, w, h, scale * 100, distance);
          ctx.beginPath();
          ctx.arc(projP.x, projP.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.35;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });

      const proj = vertices.map(projectPoint);

      const drawEdge = (i1: number, i2: number, color: string, width = 1) => {
        ctx.beginPath();
        ctx.moveTo(proj[i1].x, proj[i1].y);
        ctx.lineTo(proj[i2].x, proj[i2].y);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
      };

      drawEdge(0, 1, "rgba(169, 162, 255, 0.15)");
      drawEdge(1, 2, "rgba(169, 162, 255, 0.15)");
      drawEdge(2, 3, "rgba(169, 162, 255, 0.15)");
      drawEdge(3, 0, "rgba(169, 162, 255, 0.15)");

      drawEdge(0, 4, "rgba(169, 162, 255, 0.2)");
      drawEdge(1, 5, "rgba(169, 162, 255, 0.2)");
      drawEdge(2, 6, "rgba(169, 162, 255, 0.2)");
      drawEdge(3, 7, "rgba(169, 162, 255, 0.2)");

      ctx.fillStyle = "rgba(15, 14, 40, 0.85)";
      ctx.beginPath();
      ctx.moveTo(proj[4].x, proj[4].y);
      for (let i = 5; i < 8; i++) ctx.lineTo(proj[i].x, proj[i].y);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 10;
      ctx.shadowColor = "#a9a2ff";
      drawEdge(4, 5, "#a9a2ff", 1.5);
      drawEdge(5, 6, "#a9a2ff", 1.5);
      drawEdge(6, 7, "#a9a2ff", 1.5);
      drawEdge(7, 4, "#a9a2ff", 1.5);
      ctx.shadowBlur = 0;

      const projLabel = labelVertices.map(projectPoint);
      ctx.fillStyle = "rgba(229, 189, 114, 0.08)";
      ctx.beginPath();
      ctx.moveTo(projLabel[0].x, projLabel[0].y);
      for (let i = 1; i < 4; i++) ctx.lineTo(projLabel[i].x, projLabel[i].y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(229, 189, 114, 0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      const spoolAngle = autoAngle * (isPlaying ? 3.5 : 0.8);
      const drawSpool = (center: Point3D) => {
        const projCenter = projectPoint(center);

        ctx.beginPath();
        ctx.strokeStyle = "#e5bd72";
        ctx.lineWidth = 1;
        const numPoints = 12;
        for (let i = 0; i <= numPoints; i++) {
          const a = (i / numPoints) * Math.PI * 2;
          const px = center.x + Math.cos(a) * spoolRadius;
          const py = center.y + Math.sin(a) * spoolRadius;
          const projP = projectPoint({ x: px, y: py, z: center.z });
          if (i === 0) ctx.moveTo(projP.x, projP.y);
          else ctx.lineTo(projP.x, projP.y);
        }
        ctx.stroke();

        ctx.strokeStyle = "rgba(229, 189, 114, 0.5)";
        for (let i = 0; i < 4; i++) {
          const a = spoolAngle + (i * Math.PI) / 2;
          const px = center.x + Math.cos(a) * spoolRadius;
          const py = center.y + Math.sin(a) * spoolRadius;
          const projP = projectPoint({ x: px, y: py, z: center.z });
          ctx.beginPath();
          ctx.moveTo(projCenter.x, projCenter.y);
          ctx.lineTo(projP.x, projP.y);
          ctx.stroke();
        }
      };

      drawSpool(leftSpoolCenter);
      drawSpool(rightSpoolCenter);

      ctx.shadowBlur = 6;
      particles.forEach((p) => {
        const px = Math.cos(p.angle) * p.radius;
        const pz = Math.sin(p.angle) * p.radius;
        const pt: Point3D = { x: px, y: p.yOffset, z: pz };
        let rotated = rotateX(pt, rx);
        rotated = rotateY(rotated, ry);

        if (rotated.z >= 0) {
          const projP = project(rotated, w, h, scale * 100, distance);
          ctx.beginPath();
          ctx.arc(projP.x, projP.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.fill();
        }
      });
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMouseRef.current.x;
    const deltaY = e.clientY - prevMouseRef.current.y;
    mouseRef.current.targetY += deltaX * 0.008;
    mouseRef.current.targetX += deltaY * 0.008;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={180}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onClick={(e) => {
        if (Math.abs(e.clientX - prevMouseRef.current.x) < 2) {
          onClick();
        }
      }}
      className="max-w-full h-auto cursor-grab active:cursor-grabbing select-none pointer-events-auto"
    />
  );
}

// ── Retro Synthwave Visual Hero (HTML/CSS) ────────────────────────────
function SynthwaveHero({
  isPlaying,
  onPlayToggle
}: {
  isPlaying: boolean;
  onPlayToggle: () => void;
}) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: y * -8, ry: x * 10 });
  };
  const handleMouseLeave = () => setTilt({ rx: 0, ry: 0 });

  return (
    <div
      ref={heroRef}
      className="relative w-full h-full overflow-hidden select-none cursor-pointer"
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

      {/* Stars (deterministic) */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 55 }).map((_, i) => (
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

      {/* Retro synthwave sun (right-center) */}
      <div
        className="absolute"
        style={{ bottom: "40%", left: "62%", transform: "translateX(-50%)" }}
      >
        <div
          className="relative"
          style={{ width: 220, height: 110, overflow: "hidden" }}
        >
          <div
            className="absolute inset-0 rounded-t-full"
            style={{
              background:
                "linear-gradient(to bottom, #ff6ec7 0%, #ff9a3c 40%, #e5bd72 70%, #ffd700 100%)",
              boxShadow:
                "0 0 80px 30px rgba(255,110,199,0.35), 0 0 160px 60px rgba(229,189,114,0.18)"
            }}
          />
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 bg-[#06040f]"
              style={{ height: 3, top: `${15 + i * 8.5}%`, opacity: 0.55 }}
            />
          ))}
        </div>
      </div>

      {/* Horizon neon glow */}
      <div
        className="absolute"
        style={{
          bottom: "40%",
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
          height: "43%",
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
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%)"
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(169,162,255,0.05) 0%, transparent 60%)"
          }}
        />
      </div>

      {/* 3D Floating Mission Board Scene */}
      <div className="absolute inset-0 z-[1] hidden lg:block pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-[#06040f] via-[#06040f]/35 to-transparent" />
        <div
          className="absolute right-[6%] top-[12%] h-[510px] w-[580px] max-w-[45vw] transition-transform duration-200 ease-out"
          style={{
            transform: `perspective(1200px) rotateX(${tilt.rx * 0.2}deg) rotateY(${tilt.ry * 0.24}deg) translate3d(${tilt.ry * 0.45}px, ${tilt.rx * -0.4}px, 0)`,
            transformStyle: "preserve-3d"
          }}
        >
          <div className="absolute left-[46%] top-[52%] h-[330px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#a9a2ff]/18 blur-[76px]" />
          <div className="absolute left-[28%] top-[23%] h-40 w-40 rounded-full bg-[#e5bd72]/14 blur-[46px]" />
          <div className="absolute right-[12%] top-[26%] h-52 w-52 rounded-full bg-[#89c7d6]/13 blur-[62px]" />

          <div
            className="retzlo-hero-board-float absolute left-[8%] top-[18%] h-[345px] w-[405px] rounded-[28px] border border-[#d8d4ff]/22 bg-[#050511]/58 p-4 backdrop-blur-md"
            style={{
              clipPath: "polygon(5% 0, 100% 8%, 94% 100%, 0 90%)",
              transform: "translateZ(48px) rotateY(-13deg) rotateX(4deg)",
              boxShadow:
                "0 42px 110px rgba(0,0,0,0.68), 0 0 80px rgba(169,162,255,0.2), inset 0 1px 0 rgba(255,255,255,0.12)"
            }}
          >
            <div className="absolute -inset-px rounded-[26px] bg-[linear-gradient(135deg,rgba(229,189,114,0.38),transparent_28%,rgba(137,199,214,0.32)_72%,transparent)] opacity-60" />
            <div className="relative h-full overflow-hidden rounded-[18px] border border-[#a9a2ff]/15 bg-[#050511]/86">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_16%,rgba(137,199,214,0.24),transparent_34%),radial-gradient(circle_at_18%_86%,rgba(229,189,114,0.16),transparent_32%)]" />
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(to bottom, transparent, transparent 7px, rgba(255,255,255,0.09) 8px)"
                }}
              />

              <div className="absolute left-5 right-5 top-4 flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-[0.32em] text-[#e5bd72]">
                    Retzlo cockpit
                  </div>
                  <div className="mt-1 text-xl font-semibold text-white">
                    Mission board
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-[#a9a2ff]/20 bg-[#121026] px-2.5 py-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${isPlaying ? "bg-emerald-300" : "bg-[#a9a2ff]"}`}
                    style={{
                      boxShadow: isPlaying
                        ? "0 0 16px rgba(110,231,183,0.85)"
                        : "0 0 14px rgba(169,162,255,0.62)"
                    }}
                  />
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#d6d3d1]">
                    {isPlaying ? "live" : "ready"}
                  </span>
                </div>
              </div>

              <div className="absolute left-5 right-5 top-[86px] grid grid-cols-3 gap-3">
                {[
                  { label: "Todo", color: "#a9a2ff", cards: ["Map idea", "Invite team"] },
                  { label: "Doing", color: "#e5bd72", cards: ["Tune flow", "Ship UI"] },
                  { label: "Done", color: "#89c7d6", cards: ["Payout +24", "Focus loop"] }
                ].map((column, columnIndex) => (
                  <div
                    key={column.label}
                    className="min-h-[178px] rounded-[16px] border border-[#a9a2ff]/12 bg-[#0d0c22]/80 p-2.5"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span
                        className="text-[9px] font-mono uppercase tracking-[0.22em]"
                        style={{ color: column.color }}
                      >
                        {column.label}
                      </span>
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background: column.color,
                          boxShadow: `0 0 12px ${column.color}`
                        }}
                      />
                    </div>
                    {column.cards.map((card, cardIndex) => (
                      <div
                        key={card}
                        className="retzlo-hero-card-glow mb-2 rounded-[10px] border border-[#a9a2ff]/12 bg-[#08081a]/88 px-2.5 py-2 shadow-[0_12px_22px_rgba(0,0,0,0.22)] transition-transform duration-500"
                        style={{
                          transform:
                            isPlaying && columnIndex === 1 && cardIndex === 1
                              ? "translateY(-5px)"
                              : "translateY(0)",
                          boxShadow:
                            isPlaying && columnIndex === 2 && cardIndex === 0
                              ? `0 0 24px ${column.color}55`
                              : "0 12px 22px rgba(0,0,0,0.22)"
                        }}
                      >
                        <div
                          className="mb-2 h-1.5 w-10 rounded-full"
                          style={{ background: `${column.color}88` }}
                        />
                        <div className="text-[11px] font-medium text-[#f5f5f4]">
                          {card}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between rounded-[14px] border border-[#a9a2ff]/15 bg-[#03030c]/76 px-3 py-2">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#a8a29e]">
                  <Music className="h-3.5 w-3.5 text-[#e5bd72]" />
                  {isPlaying ? "lofi synth playing" : "click to play lofi"}
                </div>
                <div className="flex items-end gap-1">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <span
                      key={i}
                      className="retzlo-hero-vu-bar w-1 rounded-full transition-all duration-300"
                      style={{
                        height: isPlaying
                          ? `${9 + ((i * 9) % 26)}px`
                          : `${5 + (i % 5) * 2}px`,
                        background:
                          i > 9 ? "#e5bd72" : i > 5 ? "#89c7d6" : "#a9a2ff",
                        opacity: isPlaying ? 0.9 : 0.38
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            className="retzlo-hero-beam-pulse absolute left-[45%] top-[33%] h-[150px] w-[220px] opacity-70"
            style={{
              transform: "translateZ(82px) rotate(-10deg)",
              background:
                "linear-gradient(100deg, rgba(229,189,114,0.42), rgba(137,199,214,0.15) 55%, transparent 78%)",
              clipPath: "polygon(0 40%, 100% 0, 100% 100%, 0 60%)",
              filter: "blur(0.5px) drop-shadow(0 0 24px rgba(229,189,114,0.28))"
            }}
          />
          <div
            className="retzlo-hero-beam-pulse retzlo-hero-beam-delay absolute left-[50%] top-[48%] h-[108px] w-[190px] opacity-55"
            style={{
              transform: "translateZ(76px) rotate(8deg)",
              background:
                "linear-gradient(100deg, rgba(169,162,255,0.38), rgba(137,199,214,0.14) 54%, transparent 76%)",
              clipPath: "polygon(0 42%, 100% 4%, 100% 92%, 0 62%)",
              filter: "drop-shadow(0 0 22px rgba(169,162,255,0.26))"
            }}
          />
          <div
            className="absolute right-[11%] top-[56%] h-[104px] w-[104px] rounded-full border border-[#e5bd72]/35 bg-[#07030d]/54 p-0 backdrop-blur"
            style={{
              transform: "translateZ(118px)",
              boxShadow:
                "0 0 42px rgba(229,189,114,0.22), inset 0 0 28px rgba(229,189,114,0.1)"
            }}
          >
            <div className="retzlo-hero-coin-ring absolute inset-3 rounded-full border border-[#e5bd72]/30" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-xl font-semibold text-white">+24</div>
              <div className="text-[8px] font-mono uppercase tracking-widest text-[#e5bd72]">
                coins
              </div>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayToggle();
            }}
            className="pointer-events-auto absolute bottom-[17%] right-[26%] flex h-14 w-14 items-center justify-center rounded-full border transition-transform hover:scale-105"
            style={{
              transform: "translateZ(145px)",
              background: isPlaying
                ? "rgba(52,211,153,0.2)"
                : "rgba(169,162,255,0.18)",
              borderColor: isPlaying
                ? "rgba(52,211,153,0.5)"
                : "rgba(169,162,255,0.48)",
              boxShadow: isPlaying
                ? "0 0 34px rgba(52,211,153,0.42)"
                : "0 0 30px rgba(169,162,255,0.32)"
            }}
            aria-label={isPlaying ? "Pause Retzlo scene" : "Play Retzlo scene"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 text-emerald-200" />
            ) : (
              <Play className="h-5 w-5 text-[#ebe8ff]" />
            )}
          </button>

          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute rounded-full border border-[#a9a2ff]/22"
              style={{
                left: `${56 + i * 6}%`,
                top: `${22 + i * 11}%`,
                width: `${48 + i * 13}px`,
                height: `${48 + i * 13}px`,
                transform: `translateZ(${30 + i * 22}px) translate(${tilt.ry * (i + 1) * 0.7}px, ${tilt.rx * -(i + 1) * 0.7}px)`,
                boxShadow: "0 0 26px rgba(169,162,255,0.18)"
              }}
            />
          ))}
        </div>
      </div>

      {/* Scan line overlay */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)"
        }}
      />

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
        style={{
          background: "linear-gradient(to top, #070715, transparent)"
        }}
      />
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<MarketingSessionUser | null>(null);
  const [defaultDestination, setDefaultDestination] = useState<string>("/projects");
  const [isPlaying, setIsPlaying] = useState(false);
  const [crtMode, setCrtMode] = useState(true);
  const [steamHovered, setSteamHovered] = useState(false);

  // Typewriter state
  const [typewriterIdx, setTypewriterIdx] = useState(0);
  const [typewriterText, setTypewriterText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Interactive sections state
  const [activePainIndex, setActivePainIndex] = useState(0);
  const [activeWalkthroughIndex, setActiveWalkthroughIndex] = useState(0);
  const [walkthroughAutoPlay, setWalkthroughAutoPlay] = useState(true);
  const [checkedReadiness, setCheckedReadiness] = useState<number[]>([0, 1, 2]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // VU meter & cursor particles
  const [vuLevelL, setVuLevelL] = useState(5);
  const [vuLevelR, setVuLevelR] = useState(5);
  const [wiggleActive, setWiggleActive] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef(0);

  // Web Audio API refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{
    oscillators: OscillatorNode[];
    gainNode: GainNode;
    filterNode: BiquadFilterNode;
    noiseNode: AudioBufferSourceNode;
  } | null>(null);

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

  // Smooth typewriter effect
  useEffect(() => {
    const currentFullText = HERO_TYPEWRITER_LINES[typewriterIdx] || "";
    const speed = isDeleting ? 22 : 45;

    const timer = setTimeout(() => {
      if (!isDeleting && typewriterText === currentFullText) {
        setTimeout(() => setIsDeleting(true), 2400);
        return;
      }
      if (isDeleting && typewriterText === "") {
        setIsDeleting(false);
        setTypewriterIdx((prev) => (prev + 1) % HERO_TYPEWRITER_LINES.length);
        return;
      }
      setTypewriterText(
        currentFullText.substring(
          0,
          typewriterText.length + (isDeleting ? -1 : 1)
        )
      );
    }, speed);

    return () => clearTimeout(timer);
  }, [typewriterText, isDeleting, typewriterIdx]);

  // Auto-advance walkthrough carousel
  useEffect(() => {
    if (!walkthroughAutoPlay) return;
    const timer = setInterval(() => {
      setActiveWalkthroughIndex((prev) => (prev + 1) % WALKTHROUGH_SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [walkthroughAutoPlay]);

  // Sticky bar visibility on scroll
  useEffect(() => {
    const onScroll = () => {
      setShowStickyBar(window.scrollY > 520);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Subtle cursor sparkle trail
  useEffect(() => {
    let lastTime = 0;
    const chars = ["✦", "·", "✧", "◦"];
    const colors = ["#a9a2ff", "#e5bd72", "#89c7d6", "#d59ab3"];

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastTime < 90) return;
      lastTime = now;

      const id = ++particleIdRef.current;
      const newParticle: Particle = {
        id,
        x: e.clientX,
        y: e.clientY,
        char: chars[id % chars.length],
        color: colors[id % colors.length],
        size: 10 + (id % 6),
        rot: (id * 23) % 360,
        opacity: 0.75
      };

      setParticles((prev) => [...prev.slice(-10), newParticle]);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (particles.length === 0) return;
    const timer = setTimeout(() => {
      setParticles((prev) => prev.slice(1));
    }, 450);
    return () => clearTimeout(timer);
  }, [particles]);

  // Web Audio Synthesizer
  const startSynth = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;

      const masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);

      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(420, audioCtx.currentTime);
      filter.Q.setValueAtTime(1.2, audioCtx.currentTime);
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

      const bufferSize = audioCtx.sampleRate * 2;
      const noiseBuffer = audioCtx.createBuffer(
        1,
        bufferSize,
        audioCtx.sampleRate
      );
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const randomVal = Math.random() * 2 - 1;
        let val = randomVal * 0.008;
        if (Math.random() > 0.9995) {
          val += Math.random() > 0.5 ? 0.35 : -0.35;
        }
        output[i] = val;
      }

      const noiseSource = audioCtx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      noiseSource.connect(noiseGain);
      noiseGain.connect(masterGain);
      noiseSource.start();

      let currentChordIdx = 0;
      const playChord = () => {
        const chord = chords[currentChordIdx];
        const transitionTime = 0.8;

        oscillators.forEach((osc, idx) => {
          const freq = chord[idx];
          const detuneVal = Math.random() * 12 - 6;
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          osc.detune.setValueAtTime(detuneVal, audioCtx.currentTime);

          const targetVoiceGain = 0.28;
          oscGains[idx].gain.cancelScheduledValues(audioCtx.currentTime);
          oscGains[idx].gain.setValueAtTime(
            oscGains[idx].gain.value,
            audioCtx.currentTime
          );
          oscGains[idx].gain.linearRampToValueAtTime(
            targetVoiceGain,
            audioCtx.currentTime + transitionTime
          );
        });

        const nextSweepFreq = 380 + Math.random() * 140;
        filter.frequency.linearRampToValueAtTime(
          nextSweepFreq,
          audioCtx.currentTime + 3.5
        );

        currentChordIdx = (currentChordIdx + 1) % chords.length;
      };

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

      (
        audioCtx as AudioContext & {
          _chordScheduler?: ReturnType<typeof setInterval>;
        }
      )._chordScheduler = chordScheduler;
    } catch (err) {
      console.error("Failed to start Web Audio Synthesizer:", err);
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
      synthNodesRef.current = null;
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

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setVuLevelL(Math.floor(Math.random() * 45) + 12);
        setVuLevelR(Math.floor(Math.random() * 50) + 15);
      }, 100);
    } else if (wiggleActive) {
      interval = setInterval(() => {
        setVuLevelL(Math.floor(Math.random() * 32) + 8);
        setVuLevelR(Math.floor(Math.random() * 36) + 10);
      }, 100);
    } else {
      setVuLevelL(5);
      setVuLevelR(5);
    }
    return () => clearInterval(interval);
  }, [isPlaying, wiggleActive]);

  const toggleReadinessItem = (idx: number) => {
    setCheckedReadiness((prev) =>
      prev.includes(idx) ? prev.filter((item) => item !== idx) : [...prev, idx]
    );
  };

  const activePain = PAIN_POINT_TABS[activePainIndex] || PAIN_POINT_TABS[0];
  const activeSlide =
    WALKTHROUGH_SLIDES[activeWalkthroughIndex] || WALKTHROUGH_SLIDES[0];
  const combinedFaqs = [...FAQ_ROW_1.slice(0, 4), ...FAQ_ROW_2.slice(0, 4)];

  return (
    <main
      className={`min-h-screen bg-[#070715] text-[#f5efe6] font-sans relative overflow-hidden selection:bg-[#a9a2ff]/30 selection:text-white crt-screen-overlay ${
        crtMode ? "active" : ""
      }`}
      style={{ backgroundColor: "#070715", color: "#f5efe6" }}
    >
      {/* Subtle Cursor Sparkles */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute select-none transition-all duration-500"
            style={{
              left: p.x,
              top: p.y,
              color: p.color,
              fontSize: p.size,
              opacity: p.opacity,
              transform: `translate(-50%, -50%) rotate(${p.rot}deg)`
            }}
          >
            {p.char}
          </span>
        ))}
      </div>

      {/* Background Glow Orbs */}
      <div className="retzlo-hero-orb-1" />
      <div className="retzlo-hero-orb-2" />
      <div className="retzlo-hero-orb-3" />

      {/* Subtle 4rem Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(169,162,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(169,162,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Shooting Grid Beams */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="retzlo-grid-beam-x top-[18%] w-[200px]"
          style={{ animationDelay: "0s", animationDuration: "8s" }}
        />
        <div
          className="retzlo-grid-beam-x top-[58%] w-[150px]"
          style={{ animationDelay: "3s", animationDuration: "11s" }}
        />
        <div
          className="retzlo-grid-beam-y left-[25%] h-[200px]"
          style={{ animationDelay: "1.5s", animationDuration: "9s" }}
        />
      </div>

      {/* ── Top Navigation (.retzlo-nav) ────────────────────────────── */}
      <nav className="retzlo-nav">
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl border border-[#a9a2ff]/25 bg-[#a9a2ff]/10 flex items-center justify-center shadow-[0_0_20px_rgba(169,162,255,0.15)] group-hover:border-[#a9a2ff]/50 transition-colors">
              <Disc
                className={`w-4 h-4 text-[#a9a2ff] ${
                  isPlaying ? "animate-spin" : ""
                }`}
              />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white">
                Retzlo
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono uppercase tracking-widest text-[#a9a2ff] px-2 py-0.5 rounded-full border border-[#a9a2ff]/20 bg-[#a9a2ff]/10">
                Studio OS
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm text-[#d6d3d1]">
            <a
              href="#pain-tabs"
              className="hover:text-[#a9a2ff] transition-colors"
            >
              Why Retzlo
            </a>
            <a
              href="#walkthrough"
              className="hover:text-[#a9a2ff] transition-colors"
            >
              Walkthrough
            </a>
            <a
              href="#lofi-focus"
              className="hover:text-[#a9a2ff] transition-colors"
            >
              Lofi Studio
            </a>
            <a
              href="#comparison"
              className="hover:text-[#a9a2ff] transition-colors"
            >
              Compare
            </a>
            <a href="#faq" className="hover:text-[#a9a2ff] transition-colors">
              FAQ
            </a>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={handlePlayToggle}
              className={`px-3 py-2 text-xs font-mono rounded-lg border flex items-center gap-2 transition-all cursor-pointer ${
                isPlaying
                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                  : "border-[#a9a2ff]/20 bg-[#a9a2ff]/5 text-[#d6d3d1] hover:border-[#a9a2ff]/40"
              }`}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5 text-[#a9a2ff]" />
              )}
              <span>{isPlaying ? "Lofi: ON" : "Lofi Radio"}</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="px-3.5 py-2 text-xs font-mono text-[#d6d3d1] hover:text-white transition-colors truncate max-w-[150px]"
                >
                  {currentUser.name || currentUser.email || "Workspace user"}
                </Link>
                <Link href={defaultDestination}>
                  <button className="retzlo-cta-ghost px-5 py-2.5 text-xs font-semibold uppercase tracking-wider cursor-pointer">
                    Enter Workspace
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm text-[#d6d3d1] hover:text-white font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link href={defaultDestination}>
                  <button className="retzlo-cta-ghost px-5 py-2.5 text-xs font-semibold uppercase tracking-wider cursor-pointer">
                    Enter Workspace
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-[#d6d3d1] hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-[72px] left-0 right-0 border-b border-[#a9a2ff]/15 bg-[#0b0b20]/95 backdrop-blur-xl px-6 py-6 space-y-4">
            <a
              href="#pain-tabs"
              className="block text-[#e7e5e4] hover:text-[#a9a2ff] py-2 border-b border-[#a9a2ff]/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              Why Retzlo
            </a>
            <a
              href="#walkthrough"
              className="block text-[#e7e5e4] hover:text-[#a9a2ff] py-2 border-b border-[#a9a2ff]/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              Walkthrough
            </a>
            <a
              href="#lofi-focus"
              className="block text-[#e7e5e4] hover:text-[#a9a2ff] py-2 border-b border-[#a9a2ff]/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              Lofi Studio
            </a>
            <a
              href="#faq"
              className="block text-[#e7e5e4] hover:text-[#a9a2ff] py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQ
            </a>
            <div className="pt-4 flex flex-col gap-2">
              {currentUser ? (
                <>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full truncate text-center py-2.5 text-sm text-[#d6d3d1] hover:text-white transition-colors">
                      {currentUser.name || currentUser.email || "Workspace user"}
                    </button>
                  </Link>
                  <Link
                    href={defaultDestination}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <button className="w-full text-center bg-[#a9a2ff] text-[#080817] font-semibold py-2.5 rounded-lg text-sm">
                      Enter Workspace
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full text-center py-2.5 text-sm text-[#d6d3d1] hover:text-white transition-colors">
                      Sign In
                    </button>
                  </Link>
                  <Link
                    href={defaultDestination}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <button className="w-full text-center bg-[#a9a2ff] text-[#080817] font-semibold py-2.5 rounded-lg text-sm">
                      Start planning
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── Section 1: Hero — Synthwave Fullscreen BG ───────────────── */}
      <section
        id="cp-hero"
        className="relative min-h-[92vh] overflow-hidden flex flex-col"
      >
        <div className="absolute inset-0 z-0">
          <SynthwaveHero
            isPlaying={isPlaying}
            onPlayToggle={handlePlayToggle}
          />
        </div>

        {/* Left-to-right readability gradient */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(7,7,21,0.88) 0%, rgba(7,7,21,0.72) 32%, rgba(7,7,21,0.35) 55%, transparent 80%)"
          }}
        />

        {/* Floating CRT Toggle */}
        <div className="absolute top-24 right-6 z-30 hidden sm:block">
          <button
            type="button"
            onClick={() => setCrtMode(!crtMode)}
            className={`px-3.5 py-1.5 text-xs font-mono rounded-lg border flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer ${
              crtMode
                ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-300"
                : "bg-[#121026]/80 border-[#a9a2ff]/20 text-[#a8a29e]"
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            CRT Vibe: {crtMode ? "ON" : "OFF"}
          </button>
        </div>

        {/* Left-column Hero Content */}
        <div className="relative z-20 w-full max-w-7xl mx-auto flex-1 flex items-center px-6">
          <div className="w-full max-w-xl space-y-6 pt-28 pb-16">
            <div>
              <div className="retzlo-badge inline-flex">
                <span className="retzlo-badge-dot" />
                <span>Retzlo Second Brain & Work OS</span>
              </div>
            </div>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.12] retzlo-fade-up-d1"
              style={{ textShadow: "0 2px 30px rgba(0,0,0,0.9)" }}
            >
              Retzlo
              <span className="block retzlo-gradient-text mt-1">
                calm second brain &amp; workspaces.
              </span>
            </h1>

            {/* Smooth Typewriter Pill */}
            <div className="rounded-xl border border-[#a9a2ff]/20 bg-[#0d0c22]/85 backdrop-blur-md px-4 py-3 min-h-[54px] flex items-center retzlo-fade-up-d2">
              <p className="text-xs sm:text-sm font-mono text-[#e5bd72] leading-relaxed">
                <span className="text-[#a9a2ff] mr-2">&gt;</span>
                {typewriterText}
                <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-[#a9a2ff] animate-pulse" />
              </p>
            </div>

            <p
              className="text-sm sm:text-base text-[#d6d3d1] leading-relaxed retzlo-fade-up-d2"
              style={{ textShadow: "0 1px 12px rgba(0,0,0,0.9)" }}
            >
              จัดระเบียบทุกโปรเจกต์ ลากการ์ดบน Kanban, ซิงก์วันส่งขึ้นปฏิทิน,
              จดคลังความรู้ Second Brain และสะสมเหรียญแลกรางวัลในพื้นที่ทำงาน
              Retro Lofi ที่ออกแบบมาให้สมองคุณโฟกัสได้อย่างสงบ
            </p>

            {/* Primary & Ghost Actions */}
            <div className="flex flex-wrap gap-3 pt-1 retzlo-fade-up-d3">
              <Link href={defaultDestination}>
                <button className="retzlo-cta-primary px-7 py-3.5 flex items-center gap-2 group text-sm cursor-pointer">
                  เริ่มใช้งานฟรีทันที
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <a href="#walkthrough">
                <button className="retzlo-cta-ghost px-6 py-3.5 text-sm cursor-pointer">
                  ดูตัวอย่าง 7 โมดูล
                </button>
              </a>
            </div>

            {/* Clean Micro-Metrics */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-[#a8a29e] font-mono retzlo-fade-up-d4">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#a9a2ff]" />7 โมดูลในที่เดียว
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#e5bd72]" />AI Breakdown &amp; Summary
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#89c7d6]" />Lofi Radio &amp; Zen Garden
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow Marquee Strip ──────────────────────────────────── */}
      <section className="border-y border-[#a9a2ff]/10 bg-[#0b0a1f]/70 py-5 overflow-hidden select-none">
        <div className="max-w-7xl mx-auto px-6">
          <div className="retzlo-marquee-track">
            {[...Array(2)].map((_, groupIdx) => (
              <div key={groupIdx} className="flex items-center gap-10 pr-10">
                {[
                  { label: "01 · Multi-Workspace Hub", color: "#a9a2ff" },
                  { label: "02 · Kanban & Table Board", color: "#e5bd72" },
                  { label: "03 · Unified Due-Date Calendar", color: "#89c7d6" },
                  { label: "04 · Second Brain Notes", color: "#d59ab3" },
                  { label: "05 · Daily Diary & Habit Streaks", color: "#a9a2ff" },
                  { label: "06 · Coin Rewards & Coffee Cheers", color: "#e5bd72" },
                  { label: "07 · Lofi C-60 Radio & Zen Garden", color: "#89c7d6" }
                ].map((item) => (
                  <div
                    key={`${groupIdx}-${item.label}`}
                    className="flex items-center gap-2.5 text-xs font-mono text-[#d6d3d1] whitespace-nowrap"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: item.color,
                        boxShadow: `0 0 10px ${item.color}`
                      }}
                    />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 2: Pain Points Console (#pain-tabs) ─────────────── */}
      <section
        id="pain-tabs"
        className="max-w-6xl mx-auto px-6 py-24 md:py-32 space-y-12"
      >
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="retzlo-badge inline-flex">
            <span className="retzlo-badge-dot" />
            <span>Why Work Feels Chaotic</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            เคยเป็นแบบนี้ไหม? เวลาพยายามจัดระเบียบชีวิตและงาน
          </h2>
          <p className="text-sm sm:text-base text-[#a8a29e] leading-relaxed">
            คลิกเลือกอาการที่คุณเจอบ่อยที่สุด แล้วดูว่า Retzlo
            เปลี่ยนความวุ่นวายนั้นให้กลายเป็นระบบที่สงบและทำตามได้จริงอย่างไร
          </p>
        </div>

        {/* Clean Glassmorphic Browser Console */}
        <div className="retzlo-bento-card overflow-hidden">
          {/* Console Top Tab Bar */}
          <div className="border-b border-[#a9a2ff]/12 bg-[#0b0a1d]/90 px-4 pt-3 flex items-center gap-2 overflow-x-auto scrollbar-soft">
            <div className="hidden sm:flex items-center gap-1.5 pr-3 mr-1 border-r border-[#a9a2ff]/12 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d59ab3]/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#e5bd72]/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#89c7d6]/60" />
            </div>
            {PAIN_POINT_TABS.map((tab, idx) => {
              const isActive = idx === activePainIndex;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePainIndex(idx)}
                  className={`px-4 py-2.5 rounded-t-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer border-t border-x ${
                    isActive
                      ? "bg-[#171533] text-white border-[#a9a2ff]/30 shadow-[0_-4px_20px_rgba(169,162,255,0.1)]"
                      : "bg-transparent text-[#a8a29e] border-transparent hover:text-[#d6d3d1] hover:bg-[#121026]/50"
                  }`}
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full mr-2"
                    style={{ backgroundColor: tab.accentColor }}
                  />
                  {tab.tabLabel}
                </button>
              );
            })}
          </div>

          {/* Console Body */}
          <div className="p-6 sm:p-8 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 7 Cols: Problem & Retzlo Solution */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <span
                  className="inline-block text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border"
                  style={{
                    color: activePain.accentColor,
                    borderColor: `${activePain.accentColor}40`,
                    backgroundColor: `${activePain.accentColor}12`
                  }}
                >
                  {activePain.badge}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                  {activePain.title}
                </h3>
                <p className="text-sm text-[#a8a29e] leading-relaxed">
                  {activePain.description}
                </p>
              </div>

              <div className="rounded-xl border border-[#a9a2ff]/25 bg-[#121028]/90 p-5 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#a9a2ff]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>The Retzlo Solution</span>
                </div>
                <h4 className="text-base font-semibold text-white">
                  {activePain.solutionTitle}
                </h4>
                <p className="text-xs sm:text-sm text-[#d6d3d1] leading-relaxed">
                  {activePain.solutionDesc}
                </p>
              </div>
            </div>

            {/* Right 5 Cols: Clean Interactive Preview Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-[#a9a2ff]/15 bg-[#0b0a1d] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#a9a2ff]/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-8 h-8 shrink-0">
                      <Image
                        src={activePain.sticker}
                        alt={activePain.tabLabel}
                        fill
                        sizes="32px"
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        Retzlo Action Flow
                      </div>
                      <div className="text-[10px] font-mono text-[#a8a29e]">
                        พร้อมใช้งานทันทีในคลิกเดียว
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#e5bd72] bg-[#e5bd72]/10 border border-[#e5bd72]/25 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activePain.mockItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#a9a2ff]/10 bg-[#14122d]/80 px-3.5 py-2.5 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CheckCircle2
                          className="w-4 h-4 shrink-0"
                          style={{
                            color: item.done ? "#89c7d6" : activePain.accentColor
                          }}
                        />
                        <span className="text-[#f5efe6] truncate">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#a8a29e] shrink-0">
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

      <div className="retzlo-section-line" />

      {/* ── Section 3: 7-Module Interactive Walkthrough (#walkthrough) ── */}
      <section
        id="walkthrough"
        className="max-w-7xl mx-auto px-6 py-24 md:py-32 space-y-12"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="retzlo-badge inline-flex">
              <span className="retzlo-badge-dot" />
              <span>Interactive System Tour</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              ครบทุกมิติของงานและชีวิต ใน 7 โมดูลที่เชื่อมถึงกัน
            </h2>
            <p className="text-sm sm:text-base text-[#a8a29e]">
              ไม่ต้องคอยเปิดหลายแท็บให้สับสน เลือกดูการทำงานของแต่ละโมดูลด้านล่างได้เลย
            </p>
          </div>

          {/* Walkthrough Playback Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                setActiveWalkthroughIndex(
                  (prev) =>
                    (prev - 1 + WALKTHROUGH_SLIDES.length) %
                    WALKTHROUGH_SLIDES.length
                )
              }
              className="p-2.5 rounded-xl border border-[#a9a2ff]/20 bg-[#121026] text-[#d6d3d1] hover:text-white hover:border-[#a9a2ff]/40 transition cursor-pointer"
              aria-label="Previous module"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setWalkthroughAutoPlay(!walkthroughAutoPlay)}
              className="px-3.5 py-2 rounded-xl border border-[#a9a2ff]/20 bg-[#121026] text-xs font-mono text-[#d6d3d1] hover:text-white transition cursor-pointer"
            >
              {walkthroughAutoPlay ? "⏸ Auto-Play" : "▶ Paused"}
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveWalkthroughIndex(
                  (prev) => (prev + 1) % WALKTHROUGH_SLIDES.length
                )
              }
              className="p-2.5 rounded-xl border border-[#a9a2ff]/20 bg-[#121026] text-[#d6d3d1] hover:text-white hover:border-[#a9a2ff]/40 transition cursor-pointer"
              aria-label="Next module"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Module Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-soft">
          {WALKTHROUGH_SLIDES.map((slide, idx) => {
            const isActive = idx === activeWalkthroughIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => {
                  setActiveWalkthroughIndex(idx);
                  setWalkthroughAutoPlay(false);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? "bg-[#a9a2ff]/15 text-white border-[#a9a2ff]/45 shadow-[0_0_20px_rgba(169,162,255,0.15)]"
                    : "bg-[#121026]/60 text-[#a8a29e] border-[#a9a2ff]/12 hover:text-[#d6d3d1] hover:border-[#a9a2ff]/25"
                }`}
              >
                {slide.tabName}
              </button>
            );
          })}
        </div>

        {/* Walkthrough Split Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left 5 Cols: Description & Takeaways */}
          <div className="lg:col-span-5 retzlo-bento-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <span
                className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-md border"
                style={{
                  color: activeSlide.accent,
                  borderColor: `${activeSlide.accent}40`,
                  backgroundColor: `${activeSlide.accent}12`
                }}
              >
                {activeSlide.code}
              </span>
              <div className="relative w-9 h-9">
                <Image
                  src={activeSlide.sticker}
                  alt={activeSlide.tabName}
                  fill
                  sizes="36px"
                  className="object-contain"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                {activeSlide.title}
              </h3>
              <p className="text-sm text-[#a8a29e] leading-relaxed">
                {activeSlide.description}
              </p>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-[#a9a2ff]/12">
              {activeSlide.highlights.map((hl) => (
                <div
                  key={hl}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-[#d6d3d1]"
                >
                  <CheckCircle2
                    className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: activeSlide.accent }}
                  />
                  <span>{hl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right 7 Cols: Live Interactive Mockup */}
          <div className="lg:col-span-7">
            <WalkthroughMockupScreen
              slide={activeSlide}
              isPlaying={isPlaying}
              onToggleAudio={handlePlayToggle}
            />
          </div>
        </div>
      </section>

      <div className="retzlo-section-line" />

      {/* ── Section 4: Interactive Lofi Focus Studio (#lofi-focus) ──── */}
      <section
        id="lofi-focus"
        className="max-w-7xl mx-auto px-6 py-24 md:py-32"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left 6 Cols: Story & Steaming Coffee */}
          <div className="lg:col-span-6 space-y-6">
            <div className="retzlo-badge inline-flex">
              <span className="retzlo-badge-dot" />
              <span>Ambient Focus Sanctuary</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              พื้นที่ทำงานที่มีเพลง Lofi สังเคราะห์สด และสวนเซนในตัว
            </h2>

            <p className="text-sm sm:text-base text-[#a8a29e] leading-relaxed">
              เพราะความสงบคือหัวใจของการโฟกัส Retzlo จึงผสานเครื่องเล่นเทปคาสเซ็ต
              C-60 ที่สังเคราะห์เสียงคอร์ด Lofi อุ่น ๆ ผ่าน Web Audio API
              เข้ากับนาฬิกา Nixie Pomodoro และสวนหินญี่ปุ่น Solitary Zen Garden
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="retzlo-bento-card p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-[#a9a2ff]">
                  <Volume2 className="w-4 h-4" />
                  <span>Web Audio Lofi Synth</span>
                </div>
                <p className="text-xs text-[#a8a29e] leading-relaxed">
                  เสียงคอร์ดเปียโนอุ่น ๆ ผสมเสียงแผ่นเสียงไวนิลที่สร้างสดแบบเรียลไทม์
                  ช่วยตัดเสียงรบกวนรอบข้างทันที
                </p>
              </div>

              <div
                className="retzlo-bento-card p-4 space-y-2 cursor-pointer"
                onMouseEnter={() => {
                  setSteamHovered(true);
                  setWiggleActive(true);
                }}
                onMouseLeave={() => {
                  setSteamHovered(false);
                  setWiggleActive(false);
                }}
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#e5bd72]">
                  <span className="flex items-center gap-2">
                    <Coffee className="w-4 h-4" />
                    <span>Coffee Cheers &amp; Coins</span>
                  </span>
                  <span className="text-[10px] text-[#89c7d6]">
                    {steamHovered ? "Steaming ☕" : "Hover me"}
                  </span>
                </div>
                <p className="text-xs text-[#a8a29e] leading-relaxed">
                  ส่งแก้วกาแฟให้กำลังใจเพื่อนร่วมทีมบนการ์ดงาน พร้อมสะสมเหรียญไปแลกรางวัลใน
                  Arcade Store
                </p>
              </div>
            </div>
          </div>

          {/* Right 6 Cols: Interactive 3D Cassette Deck */}
          <div className="lg:col-span-6">
            <div className="retzlo-bento-card p-8 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#a9a2ff]/12 pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <Disc
                    className={`w-4 h-4 text-[#e5bd72] ${
                      isPlaying ? "animate-spin" : ""
                    }`}
                  />
                  <span className="font-mono text-xs uppercase tracking-widest text-[#d6d3d1]">
                    RETZLO DECK · C-60 CHILL SYNTH
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                    isPlaying
                      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                      : "border-[#a9a2ff]/20 bg-[#121026] text-[#a8a29e]"
                  }`}
                >
                  {isPlaying ? "ON AIR" : "STANDBY"}
                </span>
              </div>

              {/* 3D Cassette Canvas */}
              <div className="flex flex-col items-center justify-center py-2">
                <LofiCassette3D
                  isPlaying={isPlaying}
                  onClick={handlePlayToggle}
                />
                <p className="text-[11px] font-mono text-[#78716c] mt-2">
                  ลากเมาส์เพื่อหมุนดูเทป 3 มิติ หรือคลิกเพื่อเปิด/ปิดเสียงเพลง
                </p>
              </div>

              {/* Dual VU Meters */}
              <div className="grid grid-cols-2 gap-3 my-5">
                <div className="bg-[#0b0a1a] border border-[#a9a2ff]/12 rounded-lg p-2.5 relative h-11 overflow-hidden">
                  <div className="text-[9px] font-mono text-[#78716c]">VU-L</div>
                  <div
                    className="absolute bottom-0 left-1/2 w-0.5 h-8 bg-[#d59ab3] origin-bottom transition-transform duration-100"
                    style={{
                      transform: `translateX(-50%) rotate(${vuLevelL - 30}deg)`
                    }}
                  />
                </div>
                <div className="bg-[#0b0a1a] border border-[#a9a2ff]/12 rounded-lg p-2.5 relative h-11 overflow-hidden">
                  <div className="text-[9px] font-mono text-[#78716c]">VU-R</div>
                  <div
                    className="absolute bottom-0 left-1/2 w-0.5 h-8 bg-[#d59ab3] origin-bottom transition-transform duration-100"
                    style={{
                      transform: `translateX(-50%) rotate(${vuLevelR - 30}deg)`
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlayToggle}
                className={`w-full py-3.5 rounded-xl font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isPlaying
                    ? "bg-[#d59ab3]/15 border border-[#d59ab3]/35 text-[#d59ab3] hover:bg-[#d59ab3]/25"
                    : "retzlo-cta-primary"
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
            </div>
          </div>
        </div>
      </section>

      <div className="retzlo-section-line" />

      {/* ── Section 5: Readiness Check & Comparison (#comparison) ───── */}
      <section
        id="comparison"
        className="max-w-6xl mx-auto px-6 py-24 md:py-32 space-y-20"
      >
        {/* Part A: Interactive Readiness Check */}
        <div id="check-readiness" className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="retzlo-badge inline-flex">
              <span className="retzlo-badge-dot" />
              <span>Fit Check</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Retzlo เหมาะกับสไตล์การทำงานของคุณไหม?
            </h2>
            <p className="text-sm text-[#a8a29e]">
              ลองคลิกติ๊กข้อที่ตรงกับตัวคุณด้านล่าง — หากตรงเกิน 3 ข้อ
              ระบบนี้ออกแบบมาเพื่อคุณโดยเฉพาะ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Suitable For */}
            <div className="retzlo-bento-card p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-[#a9a2ff]/12 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#89c7d6]" />
                  <span>เหมาะมากสำหรับคุณ ถ้า...</span>
                </h3>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full border border-[#89c7d6]/30 bg-[#89c7d6]/10 text-[#89c7d6]">
                  ตรงกับคุณ {checkedReadiness.length}/{SUITABLE_FOR_LIST.length} ข้อ
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
                      className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
                        isChecked
                          ? "border-[#a9a2ff]/35 bg-[#a9a2ff]/10 text-white"
                          : "border-[#a9a2ff]/10 bg-[#0d0c20]/60 text-[#a8a29e] hover:border-[#a9a2ff]/25"
                      }`}
                    >
                      <span
                        className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                          isChecked
                            ? "bg-[#a9a2ff] border-[#a9a2ff] text-[#080817]"
                            : "border-[#78716c]"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <span className="text-xs sm:text-sm leading-relaxed">
                        {item}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Not Suitable For */}
            <div className="retzlo-bento-card p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-[#a9a2ff]/12 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-[#d59ab3]" />
                  <span>อาจยังไม่จำเป็น ถ้า...</span>
                </h3>
                <span className="text-xs font-mono text-[#78716c]">
                  Honest Checklist
                </span>
              </div>

              <div className="space-y-2.5">
                {NOT_SUITABLE_FOR_LIST.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 p-3 rounded-xl border border-[#a9a2ff]/10 bg-[#0d0c20]/40 text-[#a8a29e]"
                  >
                    <X className="w-4 h-4 text-[#d59ab3] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm leading-relaxed">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Part B: Clean Before vs After Highlights */}
        <div id="before-after" className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl font-bold text-white">
              ความเปลี่ยนแปลงที่คุณสัมผัสได้ตั้งแต่สัปดาห์แรก
            </h3>
            <p className="text-xs sm:text-sm text-[#a8a29e]">
              เปรียบเทียบการทำงานแบบเดิม กับการมี Second Brain &amp; Work OS ที่รวมศูนย์
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BEFORE_AFTER_ROWS.slice(0, 6).map((row) => (
              <div
                key={row.moduleTag}
                className="retzlo-bento-card p-5 flex flex-col justify-between gap-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border"
                    style={{
                      color: row.accentColor,
                      borderColor: `${row.accentColor}40`,
                      backgroundColor: `${row.accentColor}12`
                    }}
                  >
                    {row.moduleTag}
                  </span>
                </div>
                <p className="text-xs text-[#a8a29e] line-through">
                  {row.before}
                </p>
                <p className="text-xs sm:text-sm font-medium text-[#f5efe6] flex items-start gap-2">
                  <CheckCircle2
                    className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: row.accentColor }}
                  />
                  <span>{row.after}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Part C: 3-Way Comparison Matrix */}
        <div className="retzlo-bento-card overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-[#a9a2ff]/12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">
                เปรียบเทียบทางเลือกในการจัดระบบงาน
              </h3>
              <p className="text-xs text-[#a8a29e] mt-1">
                ทำไมการรวมศูนย์ใน Retzlo ถึงประหยัดเวลาและลดภาระสมองได้มากกว่า
              </p>
            </div>
            <span className="text-xs font-mono text-[#e5bd72] bg-[#e5bd72]/10 border border-[#e5bd72]/25 px-3 py-1 rounded-full self-start sm:self-auto">
              All-in-One Workspace
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#a9a2ff]/12 bg-[#0b0a1d]/80 text-[11px] font-mono uppercase tracking-wider text-[#a8a29e]">
                  <th className="py-4 px-5">หัวข้อเปรียบเทียบ</th>
                  <th className="py-4 px-5">สร้างระบบเองจากศูนย์</th>
                  <th className="py-4 px-5">ใช้หลายแอปแยกกัน</th>
                  <th className="py-4 px-5 text-[#a9a2ff]">Retzlo Studio OS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#a9a2ff]/10 text-xs sm:text-sm">
                {COMPARISON_ROWS.map((row) => (
                  <tr
                    key={row.feature}
                    className="hover:bg-[#a9a2ff]/[0.03] transition-colors"
                  >
                    <td className="py-4 px-5 font-medium text-white">
                      {row.feature}
                    </td>
                    <td className="py-4 px-5 text-[#a8a29e]">{row.diy}</td>
                    <td className="py-4 px-5 text-[#a8a29e]">{row.multiApp}</td>
                    <td className="py-4 px-5 font-medium text-[#f5efe6] bg-[#a9a2ff]/[0.05]">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#a9a2ff] shrink-0" />
                        <span>{row.retzlo}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="retzlo-section-line" />

      {/* ── Section 6: Community Reviews & Clean FAQ (#faq) ────────── */}
      <section
        id="faq"
        className="max-w-6xl mx-auto px-6 py-24 md:py-32 space-y-20"
      >
        {/* Community Quotes */}
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="retzlo-badge inline-flex">
              <span className="retzlo-badge-dot" />
              <span>Community Feedback</span>
            </div>
            <h2 className="text-3xl font-bold text-white">
              เสียงตอบรับจากผู้ใช้งานจริง
            </h2>
            <p className="text-[#a8a29e] text-sm">
              ความรู้สึกของนักพัฒนา ครีเอเตอร์ และทีมที่ย้ายมาจัดระบบงานบน Retzlo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "ชอบบรรยากาศ Retro Lofi มาก เปิดทำงานดึก ๆ แล้วสบายตา ไม่รู้สึกเครียดเหมือนโปรแกรมจัดการงานออฟฟิศทั่วไป ปฏิทินเชื่อมกับวันส่งของการ์ดให้เองเลย",
                author: "Nora V.",
                role: "Creative Director"
              },
              {
                quote:
                  "เมื่อก่อนสลับ Trello กับแอปจดโน้ตจนงง พอรวม Kanban, โน้ต, ไดอารี่ และ AI Breakdown ไว้ในที่เดียว งานเสร็จไวขึ้นเยอะ แถมมีเพลง Lofi ให้เปิดคลอด้วย",
                author: "Alex Chen",
                role: "Fullstack Engineer"
              },
              {
                quote:
                  "ระบบเหรียญรางวัลกับสวนเซนช่วยให้การเคลียร์งานรูทีนไม่น่าเบื่ออีกต่อไป ลากการ์ดเข้าช่อง Done ทีไรรู้สึกมีกำลังใจทำงานชิ้นต่อไปทันที",
                author: "Patsara M.",
                role: "Senior UX Designer"
              }
            ].map((item, i) => (
              <div
                key={i}
                className="retzlo-quote-card p-7 flex flex-col justify-between"
              >
                <p className="text-[#d6d3d1] text-sm leading-relaxed">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="pt-5 border-t border-[#a9a2ff]/10 mt-6 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {item.author}
                    </div>
                    <div className="text-xs text-[#78716c]">{item.role}</div>
                  </div>
                  <div className="w-6 h-6 rounded bg-[#14122d] border border-[#a9a2ff]/20 flex items-center justify-center text-[10px] text-[#a9a2ff] font-mono">
                    0{i + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clean 2-Column FAQ Accordion */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              คำถามที่พบบ่อย (FAQ)
            </h3>
            <p className="text-xs sm:text-sm text-[#a8a29e]">
              ข้อสงสัยเกี่ยวกับการใช้งาน ความเป็นส่วนตัว และการเริ่มต้นจัดระบบบน Retzlo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {combinedFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={faq.code} className="retzlo-bento-card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[10px] font-mono text-[#a9a2ff] px-2 py-0.5 rounded border border-[#a9a2ff]/25 bg-[#a9a2ff]/10 shrink-0">
                        {faq.code}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[#a8a29e] shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#a9a2ff]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#d6d3d1] leading-relaxed border-t border-[#a9a2ff]/10">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 7: Final Call to Action (#buy) ─────────────────── */}
      <section
        id="buy"
        className="relative border-t border-[#a9a2ff]/12 bg-gradient-to-b from-transparent to-[#0e0c26]/70 py-24 md:py-32"
      >
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
          <div className="retzlo-badge inline-flex">
            <span className="retzlo-badge-dot" />
            <span>Ready in 60 Seconds</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
            เริ่มต้นจัดระเบียบชีวิตและงานบน <br />
            <span className="retzlo-gradient-text py-1 inline-block">
              Retzlo วันนี้
            </span>
          </h2>

          <p className="text-[#d6d3d1] text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            สร้าง Workspace ฟรี ได้ครบทั้ง Kanban Board, มุมมองตาราง, ปฏิทิน,
            คลังโน้ต Second Brain, ไดอารี่, ร้านค้ารางวัล และวิทยุ Lofi
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link href={defaultDestination}>
              <button className="retzlo-cta-primary px-8 py-4 text-base flex items-center gap-2 group cursor-pointer">
                Enter Workspace
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/help">
              <button className="retzlo-cta-ghost px-7 py-4 text-base flex items-center gap-2 cursor-pointer">
                <Layers className="w-4 h-4 text-[#a9a2ff]" />
                คู่มือการใช้งาน (System Guide)
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-[#a9a2ff]/10 bg-[#060613] px-6 py-12 text-[#78716c] text-xs pb-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#d6d3d1] text-sm tracking-wider">
              Retzlo
            </span>
            <span className="text-[#44403c]">|</span>
            <p>© {new Date().getFullYear()} Retzlo Platform. All rights reserved.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/help"
              className="hover:text-[#d6d3d1] transition-colors"
            >
              System Guide
            </Link>
            <Link
              href="/privacy"
              className="hover:text-[#d6d3d1] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-[#d6d3d1] transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/contact"
              className="hover:text-[#d6d3d1] transition-colors"
            >
              Contact
            </Link>
            <span className="text-[#292524]">•</span>
            <span className="font-mono text-[#57534e] tracking-wider">
              SYSTEM_MARK_RETZLO_V2
            </span>
          </div>
        </div>
      </footer>

      {/* ── Subtle Floating Glassmorphic Bottom Bar ─────────────────── */}
      <div
        className={`fixed bottom-4 left-4 right-4 z-40 transition-all duration-300 pointer-events-none ${
          showStickyBar
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        <div className="max-w-2xl mx-auto rounded-2xl border border-[#a9a2ff]/25 bg-[#0b0a1f]/90 backdrop-blur-xl px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex items-center justify-between gap-4 pointer-events-auto">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={handlePlayToggle}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition cursor-pointer ${
                isPlaying
                  ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300"
                  : "border-[#a9a2ff]/25 bg-[#a9a2ff]/10 text-[#a9a2ff]"
              }`}
              aria-label="Toggle Lofi Radio"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                Retzlo Studio OS · 7 โมดูลในที่เดียว
              </div>
              <div className="text-[11px] font-mono text-[#a8a29e] truncate">
                {isPlaying
                  ? "♪ Playing live Lofi beats..."
                  : "คลิกปุ่มซ้ายเพื่อทดลองฟังเพลง Lofi ขณะอ่าน"}
              </div>
            </div>
          </div>

          <Link href={defaultDestination} className="shrink-0">
            <button className="retzlo-cta-primary px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer">
              <span>Enter Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
