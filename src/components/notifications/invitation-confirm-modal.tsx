"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, UserPlus, X, FolderKanban } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ModalPortal } from "@/components/ui/modal-portal";
import { useToast } from "@/components/ui/toast";

export interface InvitationData {
  token: string;
  projectName: string;
  projectId?: string;
  projectDescription?: string | null;
  inviterName?: string | null;
  inviterEmail: string;
  inviterAvatar?: string | null;
  role?: string;
}

interface InvitationConfirmModalProps {
  open: boolean;
  onClose: () => void;
  invitation: InvitationData;
  onAccepted?: (projectId: string) => void;
  onDeclined?: () => void;
}

export function InvitationConfirmModal({
  open,
  onClose,
  invitation,
  onAccepted,
  onDeclined
}: InvitationConfirmModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const isBackdropPointerDownRef = useRef(false);

  if (!open) return null;

  async function handleAccept() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/accept-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: invitation.token })
      });

      const data = (await response.json()) as {
        accepted?: boolean;
        projectId?: string;
        projectName?: string;
        error?: string;
      };

      if (!response.ok || !data.accepted || !data.projectId) {
        toast({
          message: data.error ?? "ไม่สามารถตอบรับคำเชิญได้",
          type: "error"
        });
        return;
      }

      toast({
        message: `เข้าร่วมโปรเจกต์ "${data.projectName ?? invitation.projectName}" เรียบร้อยแล้ว!`,
        type: "success"
      });

      onClose();
      if (onAccepted) {
        onAccepted(data.projectId);
      } else {
        router.push(`/project/${data.projectId}/board`);
      }
    } catch {
      toast({
        message: "เกิดข้อผิดพลาดในการตอบรับคำเชิญ กรุณาลองใหม่อีกครั้ง",
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDecline() {
    setIsDeclining(true);
    try {
      const response = await fetch("/api/auth/accept-invitation", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: invitation.token })
      });

      if (!response.ok) {
        toast({
          message: "ไม่สามารถปฏิเสธคำเชิญได้",
          type: "error"
        });
        return;
      }

      toast({
        message: "ปฏิเสธคำเชิญเรียบร้อยแล้ว",
        type: "info"
      });

      onClose();
      onDeclined?.();
    } catch {
      toast({
        message: "เกิดข้อผิดพลาดในการปฏิเสธคำเชิญ",
        type: "error"
      });
    } finally {
      setIsDeclining(false);
    }
  }

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[1200] grid place-items-center overflow-y-auto bg-ink-950/80 px-4 py-6 backdrop-blur-sm animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invitation-confirm-title"
      >
        <div
          className="absolute inset-0"
          aria-hidden="true"
          onPointerDown={(e) => {
            e.stopPropagation();
            isBackdropPointerDownRef.current = true;
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (isBackdropPointerDownRef.current && !isLoading && !isDeclining) onClose();
            isBackdropPointerDownRef.current = false;
          }}
        />

        <div
          className="lofi-panel relative w-full max-w-md rounded-2xl p-6 shadow-2xl border border-dusk-lavender/25 bg-ink-900/95"
          onPointerDown={() => {
            isBackdropPointerDownRef.current = false;
          }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading || isDeclining}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-stone-400 transition hover:bg-white/10 hover:text-stone-100 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-dusk-lavender/30 bg-dusk-lavender/15 text-dusk-lavender">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-dusk-amber">
                Project Invitation
              </p>
              <h2 id="invitation-confirm-title" className="text-xl font-bold text-stone-100">
                คำเชิญเข้าร่วมโปรเจกต์
              </h2>
            </div>
          </div>

          {/* Inviter & Project Details Card */}
          <div className="space-y-3 mb-6">
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
              <div className="flex items-center gap-2 text-xs text-stone-400 mb-2">
                <FolderKanban className="h-3.5 w-3.5 text-dusk-lavender" />
                <span>โปรเจกต์เป้าหมาย</span>
              </div>
              <h3 className="text-lg font-semibold text-white tracking-wide">
                {invitation.projectName}
              </h3>
              {invitation.projectDescription && (
                <p className="mt-1 text-xs text-stone-400 line-clamp-2">
                  {invitation.projectDescription}
                </p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-full border border-dusk-cyan/30 bg-dusk-cyan/10 px-2.5 py-0.5 text-[11px] font-medium text-dusk-cyan">
                  บทบาท: {invitation.role ?? "MEMBER"}
                </span>
              </div>
            </div>

            {/* Inviter profile */}
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
              <Avatar
                src={invitation.inviterAvatar}
                name={invitation.inviterName ?? invitation.inviterEmail}
                size={36}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-stone-400">เชิญโดย</p>
                <p className="truncate text-sm font-medium text-stone-200">
                  {invitation.inviterName || invitation.inviterEmail}
                </p>
                {invitation.inviterName && (
                  <p className="truncate text-[11px] text-stone-500">
                    {invitation.inviterEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-stone-400 mb-6 leading-relaxed">
            เมื่อคุณตอบรับคำเชิญ คุณจะสามารถเข้าถึงกระดาน Kanban, ปฏิทินงาน และระบบ Todo ของโปรเจกต์นี้ร่วมกับทีมได้ทันที
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              disabled={isLoading || isDeclining}
              onClick={handleDecline}
              className="text-stone-400 hover:text-red-400 hover:bg-red-500/10"
            >
              {isDeclining ? "กำลังปฏิเสธ..." : "ปฏิเสธ (Decline)"}
            </Button>
            <Button
              type="button"
              disabled={isLoading || isDeclining}
              onClick={handleAccept}
              className="bg-gradient-to-r from-dusk-lavender to-indigo-500 font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-dusk-lavender/90 hover:to-indigo-500/90"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-spin" />
                  กำลังเข้าร่วม...
                </span>
              ) : (
                "ยอมรับและเข้าร่วม (Accept & Join)"
              )}
            </Button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
