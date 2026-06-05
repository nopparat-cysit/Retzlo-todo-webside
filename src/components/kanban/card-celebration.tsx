"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  color: string;
  el: HTMLDivElement;
}

const PARTICLE_COLORS = [
  "#a9a2ff", // dusk-lavender
  "#e5bd72", // dusk-amber
  "#d59ab3", // dusk-rose
  "#89c7d6", // dusk-cyan
  "#c4c0ff", // lighter lavender
  "#f0d494", // lighter amber
];

function spawnParticles(originX: number, originY: number, count = 18) {
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "celebrate-particle";

    const angle = (i / count) * 2 * Math.PI + Math.random() * 0.5;
    const speed = 60 + Math.random() * 90;
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed - 30; // bias upward
    const size = 4 + Math.random() * 6;
    const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];

    el.style.cssText = `
      left: ${originX}px;
      top: ${originY}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      box-shadow: 0 0 ${size * 2}px ${color}88;
      --dx: ${dx}px;
      --dy: ${dy}px;
    `;

    document.body.appendChild(el);
    particles.push({ x: originX, y: originY, dx, dy, size, color, el });
  }

  // Clean up after animation completes
  setTimeout(() => {
    particles.forEach((p) => {
      if (p.el.parentNode) {
        p.el.parentNode.removeChild(p.el);
      }
    });
  }, 900);
}

/**
 * Trigger celebration at a given screen position (e.g., center of the card).
 * Call this imperatively from board.tsx when a card is dragged to a "done" column.
 */
export function triggerCelebration(originX: number, originY: number) {
  spawnParticles(originX, originY, 20);
}

/**
 * Hook that listens for a "done" signal and triggers celebration.
 * Pass `trigger` = true momentarily to fire the animation.
 */
export function useCardCelebration(
  trigger: boolean,
  anchorRef: React.RefObject<HTMLElement | null>
) {
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (!trigger || hasTriggered.current) return;

    const el = anchorRef.current;
    if (!el) return;

    hasTriggered.current = true;
    const rect = el.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    triggerCelebration(originX, originY);

    // Reset so the next trigger can fire
    const timer = setTimeout(() => {
      hasTriggered.current = false;
    }, 1000);

    return () => clearTimeout(timer);
  }, [trigger, anchorRef]);
}
