'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Coffee, Heart, Laptop, Moon, Move, Sparkles, User, Wand2 } from 'lucide-react';

import {
  DEFAULT_AVATAR_CONFIG,
  drawAvatar,
  type AvatarAnimation,
  type AvatarConfig,
  type AvatarDirection,
} from '@/lib/office/avatar-catalog';
import { AvatarCustomizerModal } from './avatar-customizer-modal';

interface OfficeAgent {
  id: string;
  name: string;
  status: 'idle' | 'working' | 'thinking' | 'waiting';
  currentTask?: string;
  color?: string;
}

interface PixelOfficeProps {
  agents?: OfficeAgent[];
  onAgentClick?: (agent: OfficeAgent) => void;
}

export function PixelOffice({ agents = [], onAgentClick }: PixelOfficeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedAgent, setSelectedAgent] = useState<OfficeAgent | null>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Player custom avatar configuration
  const [playerConfig, setPlayerConfig] = useState<AvatarConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem('retrod:avatar-config');
        if (saved) return JSON.parse(saved) as AvatarConfig;
      } catch {}
    }
    return DEFAULT_AVATAR_CONFIG;
  });

  // Player movement and animation states
  const playerPosRef = useRef({ x: 390, y: 310 });
  const targetPosRef = useRef<{ x: number; y: number } | null>(null);
  const playerDirRef = useRef<AvatarDirection>('down');
  const playerAnimRef = useRef<AvatarAnimation>('idle');
  const keysPressedRef = useRef<Set<string>>(new Set());

  const [currentEmote, setCurrentEmote] = useState<AvatarAnimation>('idle');
  const agentsRef = useRef(agents);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    agentsRef.current = agents;
  }, [agents]);

  // Keyboard controls listener (W, A, S, D and Arrow Keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault();
        keysPressedRef.current.add(key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressedRef.current.delete(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const triggerEmote = (emote: AvatarAnimation) => {
    setCurrentEmote(emote);
    playerAnimRef.current = emote;
  };

  // Main Canvas Render & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 860;
    canvas.height = 520;

    let frame = 0;

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Update Player Movement from Keyboard
      const speed = 2.8;
      const keys = keysPressedRef.current;
      let isMoving = false;

      if (keys.has('w') || keys.has('arrowup')) {
        playerPosRef.current.y = Math.max(200, playerPosRef.current.y - speed);
        playerDirRef.current = 'up';
        isMoving = true;
      }
      if (keys.has('s') || keys.has('arrowdown')) {
        playerPosRef.current.y = Math.min(canvas.height - 70, playerPosRef.current.y + speed);
        playerDirRef.current = 'down';
        isMoving = true;
      }
      if (keys.has('a') || keys.has('arrowleft')) {
        playerPosRef.current.x = Math.max(45, playerPosRef.current.x - speed);
        playerDirRef.current = 'left';
        isMoving = true;
      }
      if (keys.has('d') || keys.has('arrowright')) {
        playerPosRef.current.x = Math.min(canvas.width - 65, playerPosRef.current.x + speed);
        playerDirRef.current = 'right';
        isMoving = true;
      }

      // 2. Update Click-to-Move Target
      if (!isMoving && targetPosRef.current) {
        const dx = targetPosRef.current.x - playerPosRef.current.x;
        const dy = targetPosRef.current.y - playerPosRef.current.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 4) {
          isMoving = true;
          playerPosRef.current.x += (dx / dist) * speed;
          playerPosRef.current.y += (dy / dist) * speed;

          if (Math.abs(dx) > Math.abs(dy)) {
            playerDirRef.current = dx > 0 ? 'right' : 'left';
          } else {
            playerDirRef.current = dy > 0 ? 'down' : 'up';
          }
        } else {
          targetPosRef.current = null;
        }
      }

      if (isMoving) {
        playerAnimRef.current = 'walk';
      } else if (playerAnimRef.current === 'walk') {
        playerAnimRef.current = currentEmote;
      }

      // 3. Draw Background & Wall
      ctx.fillStyle = '#090817';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Wall with paper texture lines
      ctx.fillStyle = '#111025';
      ctx.fillRect(0, 0, canvas.width, 195);
      ctx.strokeStyle = '#2a2540';
      ctx.lineWidth = 2;
      for (let x = 35; x < canvas.width - 30; x += 58) {
        ctx.beginPath();
        ctx.moveTo(x, 25);
        ctx.lineTo(x, 180);
        ctx.stroke();
      }

      // 4. Floor with Lofi Tiles
      ctx.fillStyle = '#1a162f';
      ctx.fillRect(0, 185, canvas.width, canvas.height - 185);

      ctx.fillStyle = '#2a2540';
      for (let x = 25; x < canvas.width; x += 44) {
        for (let y = 205; y < canvas.height; y += 44) {
          ctx.fillRect(x, y, 21, 21);
        }
      }

      // 5. Interactive Desks (Modules)
      const desks = [
        { x: 65, y: 225, w: 125, label: 'VITAL HUB', color: '#a9a2ff' },
        { x: 260, y: 200, w: 135, label: 'KANBAN', color: '#e5bd72' },
        { x: 480, y: 245, w: 115, label: 'DIARY', color: '#89c7d6' },
        { x: 670, y: 215, w: 125, label: 'LO-FI', color: '#d59ab3' },
      ];

      desks.forEach((desk) => {
        ctx.fillStyle = '#3a2f5c';
        ctx.fillRect(desk.x, desk.y, desk.w, 36);
        ctx.fillStyle = '#1f1a38';
        ctx.fillRect(desk.x + 18, desk.y + 34, 9, 48);
        ctx.fillRect(desk.x + desk.w - 28, desk.y + 34, 9, 48);

        ctx.fillStyle = desk.color;
        ctx.font = 'bold 11px monospace';
        ctx.fillText(desk.label, desk.x + 24, desk.y + 24);
      });

      // 6. Draw AI Agents
      const currentAgents =
        agentsRef.current.length > 0
          ? agentsRef.current
          : [
              { id: '1', name: 'HERMES', status: 'working' as const, currentTask: 'Building UI' },
              { id: '2', name: 'VITAL', status: 'thinking' as const, currentTask: 'Tracking progress' },
              { id: '3', name: 'LOFI', status: 'idle' as const, currentTask: 'Playing beats' },
            ];

      currentAgents.forEach((agent, i) => {
        const x = 95 + ((i * 165) % 520);
        const y = 225 + Math.floor(i / 3) * 95 + (i % 2 === 0 ? 12 : 0);

        // Render Agent Character
        const isActive = agent.status === 'working' || agent.status === 'thinking';
        const bob = Math.sin(frame / 6) * (isActive ? 1.5 : 0.8);
        const color = agent.color || (agent.name.includes('HERMES') ? '#a9a2ff' : '#89c7d6');

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(x + 5, y + 37, 24, 9);

        // Legs
        ctx.fillStyle = '#241d3d';
        const legSwing = isActive ? Math.sin(frame / 3.5) * 3 : 0;
        ctx.fillRect(x + 9, y + 29, 6, 17 + legSwing);
        ctx.fillRect(x + 19, y + 29, 6, 17 - legSwing);

        // Body
        ctx.fillStyle = color;
        ctx.fillRect(x + 8, y + 13, 19, 18);

        // Head
        ctx.fillStyle = '#f5e8c7';
        ctx.fillRect(x + 11, y + 5, 14, 13);

        // Hair
        ctx.fillStyle = '#1a162f';
        ctx.fillRect(x + 10, y + 6, 16, 5);

        // Eyes
        ctx.fillStyle = '#0f0c23';
        ctx.fillRect(x + 14, y + 10, 3, 4);
        ctx.fillRect(x + 21, y + 10, 3, 4);

        // Nameplate
        ctx.fillStyle = '#e5bd72';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(agent.name, x + 17, y - 3);

        // Status badge
        ctx.font = '7px monospace';
        ctx.fillStyle = isActive ? '#89c7d6' : '#666';
        ctx.fillText(agent.status.toUpperCase(), x + 17, y + 52);
        ctx.textAlign = 'left';
      });

      // 7. Draw Player's Customized Character
      const px = playerPosRef.current.x;
      const py = playerPosRef.current.y;

      drawAvatar(
        ctx,
        px,
        py,
        playerConfig,
        playerAnimRef.current,
        playerDirRef.current,
        frame,
        1.15
      );

      // Player Nameplate & Halo badge
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#a9a2ff';
      ctx.shadowBlur = 8;
      ctx.fillText(playerConfig.name || 'YOU', px + 17, py - 6);
      ctx.shadowBlur = 0;
      ctx.textAlign = 'left';

      // 8. Vinyl Record Player
      ctx.save();
      ctx.translate(785, 88);
      ctx.rotate(frame * 0.045);
      ctx.fillStyle = '#111025';
      ctx.beginPath();
      ctx.arc(0, 0, 31, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e5bd72';
      ctx.beginPath();
      ctx.arc(0, 0, 19, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a162f';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Soft Lofi Ambient Glow
      ctx.fillStyle = 'rgba(169, 162, 255, 0.07)';
      ctx.fillRect(40, 35, 780, 110);

      ctx.fillStyle = '#e5bd72';
      ctx.font = 'bold 26px monospace';
      ctx.shadowColor = '#a9a2ff';
      ctx.shadowBlur = 22;
      ctx.fillText('RETZLO', 355, 78);
      ctx.shadowBlur = 0;

      ctx.font = '10px monospace';
      ctx.fillStyle = '#89c7d6';
      ctx.fillText('INDIGO • LO-FI • OFFICE', 362, 108);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Click on Player to open customizer
      const px = playerPosRef.current.x;
      const py = playerPosRef.current.y;
      if (clickX >= px - 10 && clickX <= px + 45 && clickY >= py - 10 && clickY <= py + 55) {
        setIsCustomizerOpen(true);
        return;
      }

      // Click on Agent
      const clicked = agentsRef.current.find((_, i) => {
        const agentX = 95 + ((i * 165) % 520);
        return clickX > agentX - 30 && clickX < agentX + 50 && clickY > 200 && clickY < 380;
      });

      if (clicked && onAgentClick) {
        onAgentClick(clicked);
        return;
      }

      // Click to walk on floor
      if (clickY >= 200) {
        targetPosRef.current = { x: clickX - 16, y: clickY - 25 };
      }
    };

    canvas?.addEventListener('click', handleClick as EventListener);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      canvas?.removeEventListener('click', handleClick as EventListener);
    };
  }, [onAgentClick, playerConfig, currentEmote]);

  return (
    <div className="relative mx-auto w-full max-w-[880px]">
      {/* Top Bar with Controls */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs uppercase tracking-[3px] text-dusk-amber">PIXEL VIRTUAL OFFICE</span>
          </div>
          <div className="mt-0.5 text-[10px] text-stone-500">
            WASD หรือคลิกเพื่อเดิน • คลิกตัวละครเพื่อแต่งตัว
          </div>
        </div>

        {/* Action button to open Avatar Customizer */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCustomizerOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-dusk-lavender/30 bg-dusk-lavender/15 px-3.5 py-1.5 text-xs font-semibold text-dusk-lavender transition hover:border-dusk-lavender/60 hover:bg-dusk-lavender/25 active:scale-95"
          >
            <Wand2 className="h-3.5 w-3.5 text-dusk-amber" />
            <span>👗 แต่งตัว (Customize)</span>
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-white/10 bg-black shadow-2xl">
        <canvas
          ref={canvasRef}
          className="w-full cursor-crosshair"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Floating Quick Emote Bar */}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/15 bg-[#090817]/90 px-3 py-1.5 shadow-xl backdrop-blur-md">
          <span className="mr-1 text-[10px] uppercase tracking-wider text-stone-500">Emote:</span>
          {[
            { id: 'wave', label: '👋 โบกมือ', title: 'Wave' },
            { id: 'coffee', label: '☕ จิบกาแฟ', title: 'Coffee' },
            { id: 'work', label: '💻 ทำงาน', title: 'Work' },
            { id: 'cheer', label: '✨ ดีใจ', title: 'Cheer' },
            { id: 'sleep', label: '💤 งีบหลับ', title: 'Sleep' },
            { id: 'idle', label: '🧘 นิ่ง', title: 'Idle' },
          ].map(({ id, label, title }) => (
            <button
              key={id}
              type="button"
              title={title}
              onClick={() => triggerEmote(id as AvatarAnimation)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                currentEmote === id
                  ? 'bg-dusk-amber text-ink-950 font-bold'
                  : 'text-stone-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Agent detail tooltip if selected */}
      {selectedAgent && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-[#111025] px-4 py-2.5 text-xs text-stone-300">
          <div>
            <span className="font-semibold text-white">{selectedAgent.name}</span> —{' '}
            <span className="text-stone-400">{selectedAgent.currentTask || selectedAgent.status}</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-dusk-amber">Active Agent</span>
        </div>
      )}

      {/* Avatar Customizer Modal */}
      {isCustomizerOpen && (
        <AvatarCustomizerModal
          open={isCustomizerOpen}
          onClose={() => setIsCustomizerOpen(false)}
          initialConfig={playerConfig}
          onSave={(newConfig) => {
            setPlayerConfig(newConfig);
          }}
        />
      )}
    </div>
  );
}
