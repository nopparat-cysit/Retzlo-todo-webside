'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, Heart, Laptop, Moon, Move, Sparkles, User, Wand2 } from 'lucide-react';

import {
  DEFAULT_AVATAR_CONFIG,
  drawAvatar,
  type AvatarAnimation,
  type AvatarConfig,
  type AvatarDirection,
} from '@/lib/office/avatar-catalog';
import { AvatarCustomizerModal } from './avatar-customizer-modal';

export interface OfficeMember {
  id: string;
  name: string;
  role?: string;
  status?: string;
  isCurrentUser?: boolean;
}

interface PixelOfficeProps {
  members?: OfficeMember[];
  agents?: Array<{ id: string; name: string; status: 'idle' | 'working' | 'thinking' | 'waiting'; currentTask?: string; color?: string }>;
  projectId?: string;
  onAgentClick?: (agent: any) => void;
}

export function PixelOffice({ members = [], projectId, onAgentClick }: PixelOfficeProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [selectedTeammate, setSelectedTeammate] = useState<OfficeMember | null>(null);

  // Find current user's name from members list if available
  const currentUserMember = members.find((m) => m.isCurrentUser);
  const teammates = members.filter((m) => !m.isCurrentUser);

  // Player custom avatar configuration
  const [playerConfig, setPlayerConfig] = useState<AvatarConfig>(() => {
    let initial = DEFAULT_AVATAR_CONFIG;
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem('retrod:avatar-config');
        if (saved) initial = JSON.parse(saved) as AvatarConfig;
      } catch {}
    }
    return {
      ...initial,
      name: currentUserMember?.name || initial.name || 'You',
    };
  });

  // Update name if member name loaded
  useEffect(() => {
    if (currentUserMember?.name) {
      setPlayerConfig((prev) => (prev.name === 'You' ? { ...prev, name: currentUserMember.name } : prev));
    }
  }, [currentUserMember?.name]);

  // Player movement and animation states
  const playerPosRef = useRef({ x: 390, y: 310 });
  const targetPosRef = useRef<{ x: number; y: number } | null>(null);
  const playerDirRef = useRef<AvatarDirection>('down');
  const playerAnimRef = useRef<AvatarAnimation>('idle');
  const keysPressedRef = useRef<Set<string>>(new Set());
  const nearbyDeskRef = useRef<{ label: string; path: string } | null>(null);

  const [currentEmote, setCurrentEmote] = useState<AvatarAnimation>('idle');
  const teammatesRef = useRef(teammates);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    teammatesRef.current = teammates;
  }, [teammates]);

  // Keyboard controls listener (W, A, S, D, Arrow Keys, and E for interact)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault();
        keysPressedRef.current.add(key);
      } else if (key === 'e') {
        // Interact with nearby desk
        const desk = nearbyDeskRef.current;
        if (desk && projectId) {
          router.push(`/project/${projectId}/${desk.path}`);
        }
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
  }, [projectId, router]);

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

      // Wall with vertical panel lines
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
        { x: 65, y: 225, w: 125, label: 'NOTES BOARD', path: 'notes', color: '#d59ab3' },
        { x: 260, y: 200, w: 135, label: 'KANBAN DESK', path: 'board', color: '#e5bd72' },
        { x: 480, y: 245, w: 115, label: 'DIARY STATION', path: 'diary', color: '#89c7d6' },
        { x: 670, y: 215, w: 125, label: 'LO-FI LOUNGE', path: 'rewards', color: '#a9a2ff' },
      ];

      desks.forEach((desk) => {
        ctx.fillStyle = '#3a2f5c';
        ctx.fillRect(desk.x, desk.y, desk.w, 36);
        ctx.fillStyle = '#1f1a38';
        ctx.fillRect(desk.x + 18, desk.y + 34, 9, 48);
        ctx.fillRect(desk.x + desk.w - 28, desk.y + 34, 9, 48);

        ctx.fillStyle = desk.color;
        ctx.font = 'bold 11px monospace';
        ctx.fillText(desk.label, desk.x + 16, desk.y + 24);
      });

      // 6. Draw Teammates in the room
      teammatesRef.current.forEach((member, i) => {
        const x = 110 + ((i * 180) % 520);
        const y = 245 + Math.floor(i / 3) * 85;

        // Create a distinct procedural avatar style for each teammate
        const teammateConfig: AvatarConfig = {
          skinToneId: i % 2 === 0 ? 'fair' : 'warm_ivory',
          hairstyleId: ['clean_part', 'messy_anime', 'samurai_bun', 'classic_bob', 'wavy_curls'][i % 5] || 'clean_part',
          hairColorId: ['cocoa_brown', 'honey_blonde', 'jet_black', 'indigo_violet'][i % 4] || 'jet_black',
          outfitId: ['lofi_hoodie', 'business_suit', 'knit_sweater', 'graphic_tee', 'bomber_jacket'][i % 5] || 'lofi_hoodie',
          outfitColorId: ['dusk_amber', 'dusk_cyan', 'dusk_rose', 'dusk_lavender', 'forest_emerald'][i % 5] || 'dusk_amber',
          accessoryId: i % 2 === 0 ? 'headphones' : 'wire_glasses',
          petId: 'none',
          name: member.name,
        };

        const isWorking = member.status === 'BUSY';
        const anim: AvatarAnimation = isWorking ? 'work' : 'idle';

        drawAvatar(ctx, x, y, teammateConfig, anim, 'down', frame, 1.1);

        // Teammate Nameplate
        ctx.fillStyle = '#e5bd72';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(member.name, x + 16, y - 5);

        // Status badge
        ctx.font = '7px monospace';
        ctx.fillStyle = member.status === 'OFFLINE' ? '#666' : '#89c7d6';
        ctx.fillText((member.status || 'ONLINE').toUpperCase(), x + 16, y + 48);
        ctx.textAlign = 'left';
      });

      // If user is solo in project:
      if (teammatesRef.current.length === 0) {
        ctx.fillStyle = 'rgba(169, 162, 255, 0.45)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('OPEN DESK • INVITE TEAMMATES FROM MEMBERS TAB', 430, 175);
        ctx.textAlign = 'left';
      }

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

      // Player Nameplate & Glow
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#a9a2ff';
      ctx.shadowBlur = 8;
      ctx.fillText(playerConfig.name || 'YOU', px + 17, py - 6);
      ctx.shadowBlur = 0;
      ctx.textAlign = 'left';

      // 8. Check Proximity to Desks
      let nearDesk: (typeof desks)[number] | null = null;
      for (const desk of desks) {
        const deskCenterX = desk.x + desk.w / 2;
        const deskCenterY = desk.y + 20;
        const dist = Math.hypot(px - deskCenterX, py - deskCenterY);
        if (dist < 65) {
          nearDesk = desk;
          break;
        }
      }
      nearbyDeskRef.current = nearDesk ? { label: nearDesk.label, path: nearDesk.path } : null;

      // Draw interactive floating balloon if near desk
      if (nearDesk) {
        const promptText = `กด E เพื่อเปิด ${nearDesk.label}`;
        ctx.font = 'bold 10px monospace';
        const textWidth = ctx.measureText(promptText).width + 16;
        ctx.fillStyle = 'rgba(9, 8, 23, 0.92)';
        ctx.fillRect(px + 17 - textWidth / 2, py - 30, textWidth, 18);
        ctx.strokeStyle = nearDesk.color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px + 17 - textWidth / 2, py - 30, textWidth, 18);

        ctx.fillStyle = nearDesk.color;
        ctx.textAlign = 'center';
        ctx.fillText(promptText, px + 17, py - 17);
        ctx.textAlign = 'left';
      }

      // 9. Vinyl Record Player
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
      ctx.fillText('GATHER VIRTUAL OFFICE', 280, 78);
      ctx.shadowBlur = 0;

      ctx.font = '10px monospace';
      ctx.fillStyle = '#89c7d6';
      ctx.fillText('TEAM CO-WORKING • WALK & CHILL', 345, 108);

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

      // Click on Teammate
      const clickedTeammate = teammatesRef.current.find((_, i) => {
        const tx = 110 + ((i * 180) % 520);
        const ty = 245 + Math.floor(i / 3) * 85;
        return clickX > tx - 25 && clickX < tx + 45 && clickY > ty - 10 && clickY < ty + 55;
      });

      if (clickedTeammate) {
        setSelectedTeammate(clickedTeammate);
        return;
      }

      // Click to walk on floor
      if (clickY >= 195) {
        targetPosRef.current = { x: clickX - 16, y: clickY - 25 };
      }
    };

    canvas?.addEventListener('click', handleClick as EventListener);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      canvas?.removeEventListener('click', handleClick as EventListener);
    };
  }, [playerConfig, currentEmote]);

  return (
    <div className="relative mx-auto w-full max-w-[880px]">
      {/* Top Bar with Controls */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs uppercase tracking-[3px] text-dusk-amber">GATHER VIRTUAL OFFICE</span>
          </div>
          <div className="mt-0.5 text-[10px] text-stone-400">
            เดินด้วย WASD / ลูกศร / คลิก • เดินใกล้โต๊ะเพื่อเปิดโมดูล • คลิกตัวละครเพื่อแต่งตัว
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

      {/* Teammate tooltip if selected */}
      {selectedTeammate && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-[#111025] px-4 py-2.5 text-xs text-stone-300">
          <div>
            <span className="font-semibold text-white">{selectedTeammate.name}</span>
            <span className="ml-2 text-[11px] text-stone-400">({selectedTeammate.role || 'Member'})</span>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] text-emerald-400">
            {selectedTeammate.status || 'ONLINE'}
          </span>
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
