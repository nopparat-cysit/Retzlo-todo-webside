'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

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
  const frameRef = useRef(0);
  const agentsRef = useRef(agents);

  useEffect(() => {
    agentsRef.current = agents;
  }, [agents]);

  const drawPixelCharacter = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, agent: OfficeAgent, frame: number) => {
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

    // Hair/headband
    ctx.fillStyle = '#1a162f';
    ctx.fillRect(x + 10, y + 6, 16, 5);

    // Eyes
    ctx.fillStyle = '#0f0c23';
    ctx.fillRect(x + 14, y + 10, 3, 4);
    ctx.fillRect(x + 21, y + 10, 3, 4);

    // Eye highlight when thinking
    if (agent.status === 'thinking') {
      ctx.fillStyle = '#e5bd72';
      ctx.fillRect(x + 15, y + 11, 1, 1);
    }

    // Mouth / expression
    ctx.fillStyle = '#1a162f';
    if (agent.status === 'working') {
      ctx.fillRect(x + 16, y + 18, 6, 2);
    } else {
      ctx.fillRect(x + 17, y + 19, 4, 1);
    }

    // Tool indicator
    if (isActive) {
      ctx.fillStyle = '#e5bd72';
      ctx.fillRect(x + 26, y + 14, 5, 8);
      ctx.fillStyle = '#111025';
      ctx.fillRect(x + 27, y + 16, 3, 2);
    }

    // Name
    ctx.fillStyle = '#e5bd72';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(agent.name, x + 17, y - 3);

    // Status
    ctx.font = '7px monospace';
    ctx.fillStyle = isActive ? '#89c7d6' : '#666';
    ctx.fillText(agent.status.toUpperCase(), x + 17, y + 48);

    ctx.textAlign = 'left';
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 860;
    canvas.height = 520;

    let frame = 0;
    let particles: Array<{x: number; y: number; life: number; vx: number; vy: number}> = [];

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep ink background
      ctx.fillStyle = '#090817';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Wall with paper texture
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

      // Floor with lofi tiles
      ctx.fillStyle = '#1a162f';
      ctx.fillRect(0, 185, canvas.width, canvas.height - 185);

      ctx.fillStyle = '#2a2540';
      for (let x = 25; x < canvas.width; x += 44) {
        for (let y = 205; y < canvas.height; y += 44) {
          ctx.fillRect(x, y, 21, 21);
        }
      }

      // Desks with labels (your modules)
      const desks = [
        {x: 65, y: 225, w: 125, label: "VITAL HUB", color: "#a9a2ff"},
        {x: 260, y: 200, w: 135, label: "KANBAN", color: "#e5bd72"},
        {x: 480, y: 245, w: 115, label: "DIARY", color: "#89c7d6"},
        {x: 670, y: 215, w: 125, label: "LO-FI", color: "#d59ab3"}
      ];

      desks.forEach(desk => {
        ctx.fillStyle = '#3a2f5c';
        ctx.fillRect(desk.x, desk.y, desk.w, 36);
        ctx.fillStyle = '#1f1a38';
        ctx.fillRect(desk.x + 18, desk.y + 34, 9, 48);
        ctx.fillRect(desk.x + desk.w - 28, desk.y + 34, 9, 48);

        ctx.fillStyle = desk.color;
        ctx.font = 'bold 11px monospace';
        ctx.fillText(desk.label, desk.x + 24, desk.y + 24);
      });

      // Draw agents
      const currentAgents = agentsRef.current.length > 0 ? agentsRef.current : [
        { id: '1', name: 'HERMES', status: 'working' as const, currentTask: 'Building UI' },
        { id: '2', name: 'VITAL', status: 'thinking' as const, currentTask: 'Tracking progress' },
        { id: '3', name: 'LOFI', status: 'idle' as const, currentTask: 'Playing beats' }
      ];

      currentAgents.forEach((agent, i) => {
        const x = 95 + (i * 165) % 520;
        const y = 225 + Math.floor(i / 3) * 95 + (i % 2 === 0 ? 12 : 0);
        drawPixelCharacter(ctx, x, y, agent, frame);
      });

      // Vinyl record
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

      // Soft lofi glow
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

    const canvas = canvasRef.current;
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Rough hit detection
      const clicked = agentsRef.current.find((_, i) => {
        const agentX = 95 + (i * 165) % 520;
        return clickX > agentX - 30 && clickX < agentX + 50 && clickY > 200 && clickY < 380;
      });

      if (clicked && onAgentClick) onAgentClick(clicked);
    };

    canvas?.addEventListener('click', handleClick as EventListener);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      canvas?.removeEventListener('click', handleClick as EventListener);
    };
  }, [drawPixelCharacter, onAgentClick]);

  return (
    <div className="relative w-full max-w-[880px] mx-auto">
      <div className="mb-3 flex items-center justify-between px-1">
        <div>
          <div className="text-xs uppercase tracking-[3px] text-dusk-amber">PIXEL OFFICE</div>
          <div className="text-[10px] text-stone-500 -mt-0.5">LIVE • ANIMATED • YOUR AGENTS</div>
        </div>
        <div className="text-right text-[10px] text-stone-500">
          click characters<br/>real data coming soon
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="rounded-3xl border-2 border-white/10 shadow-2xl bg-black cursor-crosshair"
        style={{ imageRendering: 'pixelated' }}
      />

      {selectedAgent && (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-[#111025] border border-[#a9a2ff] px-5 py-2 text-xs text-stone-300 rounded">
          Selected: {selectedAgent.name} — {selectedAgent.currentTask || selectedAgent.status}
        </div>
      )}
    </div>
  );
}
