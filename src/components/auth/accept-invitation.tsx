"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, FolderKanban, LogIn, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { InvitationConfirmModal, type InvitationData } from "@/components/notifications/invitation-confirm-modal";

interface InvitationResponse {
  invitation?: {
    id: string;
    token: string;
    email: string;
    status: string;
    isExpired: boolean;
    expiresAt: string;
    project: {
      id: string;
      name: string;
      description: string | null;
    };
    inviter: {
      id: string;
      name: string | null;
      email: string;
      avatar: string | null;
    };
  };
  currentUser?: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  } | null;
  isLoggedIn: boolean;
  isEmailMatch: boolean;
  error?: string;
}

export function AcceptInvitation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InvitationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);

  useEffect(() => {
    async function fetchInvitation() {
      if (!token) {
        setError("ไม่พบรหัสคำเชิญ (Missing invitation token)");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/auth/accept-invitation?token=${token}`);
        const result = (await res.json()) as InvitationResponse;

        if (!res.ok || !result.invitation) {
          setError(result.error ?? "คำเชิญนี้ไม่ถูกต้องหรือหมดอายุแล้ว");
          setLoading(false);
          return;
        }

        if (result.invitation.status === "ACCEPTED") {
          setError("คำเชิญนี้ได้รับการตอบรับไปแล้ว");
          setLoading(false);
          return;
        }

        if (result.invitation.status === "DECLINED") {
          setError("คำเชิญนี้ถูกปฏิเสธไปแล้ว");
          setLoading(false);
          return;
        }

        if (result.invitation.isExpired) {
          setError("คำเชิญนี้หมดอายุแล้ว (มีอายุ 7 วันหลังจากส่งคำเชิญ)");
          setLoading(false);
          return;
        }

        setData(result);
      } catch {
        setError("ไม่สามารถโหลดข้อมูลคำเชิญได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setLoading(false);
      }
    }

    void fetchInvitation();
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-stone-400">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-dusk-lavender border-t-transparent mb-3" />
        <p className="text-sm">กำลังตรวจสอบข้อมูลคำเชิญ...</p>
      </div>
    );
  }

  if (error || !data?.invitation) {
    return (
      <div className="space-y-4 rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-stone-200">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="font-semibold text-red-300">เกิดข้อผิดพลาด</p>
        </div>
        <p className="text-sm text-stone-300">{error ?? "คำเชิญนี้ไม่ถูกต้องหรือหมดอายุแล้ว"}</p>
        <div className="pt-2">
          <Link href="/projects">
            <Button variant="secondary" size="sm">
              กลับสู่หน้าโครงการ (Go to Projects)
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { invitation, currentUser, isLoggedIn, isEmailMatch } = data;
  const callbackUrl = `/accept-invitation?token=${token}`;

  // Case 1: Not logged in
  if (!isLoggedIn) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-dusk-lavender/30 bg-dusk-lavender/15 text-dusk-lavender">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-stone-400">โปรเจกต์ที่ได้รับเชิญ</p>
              <h2 className="text-xl font-bold text-stone-100">{invitation.project.name}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs text-stone-300">
            <Avatar src={invitation.inviter.avatar} name={invitation.inviter.name ?? invitation.inviter.email} size={28} />
            <span>
              เชิญโดย <strong>{invitation.inviter.name ?? invitation.inviter.email}</strong>
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-dusk-amber/30 bg-dusk-amber/10 p-4 text-xs text-stone-300">
          <p className="font-semibold text-dusk-amber mb-1">คำเชิญสำหรับ: {invitation.email}</p>
          <p>กรุณาเข้าสู่ระบบหรือสร้างบัญชีด้วยอีเมลข้างต้นเพื่อกดยืนยันและเข้าร่วมโปรเจกต์</p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
            <Button className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              <span>เข้าสู่ระบบ (Sign in)</span>
            </Button>
          </Link>
          <Link href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
            <Button variant="ghost">สร้างบัญชีใหม่ (Create account)</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Case 2: Logged in with different email
  if (!isEmailMatch) {
    return (
      <div className="space-y-5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-5 text-stone-200">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
          <p className="font-semibold text-amber-300">เข้าสู่ระบบด้วยบัญชีอื่น</p>
        </div>
        <p className="text-sm text-stone-300 leading-relaxed">
          ปัจจุบันคุณกำลังเข้าสู่ระบบด้วยอีเมล <strong>{currentUser?.email}</strong> แต่คำเชิญนี้ถูกส่งมายัง <strong>{invitation.email}</strong>
        </p>
        <div className="flex gap-3 pt-2">
          <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
            <Button variant="secondary" size="sm">
              สลับบัญชีผู้ใช้ (Switch Account)
            </Button>
          </Link>
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              ยกเลิก
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Case 3: Logged in with matching email - Show Confirmation Modal & details!
  const modalInvitationData: InvitationData = {
    token: invitation.token,
    projectName: invitation.project.name,
    projectId: invitation.project.id,
    projectDescription: invitation.project.description,
    inviterName: invitation.inviter.name,
    inviterEmail: invitation.inviter.email,
    inviterAvatar: invitation.inviter.avatar,
    role: "MEMBER"
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-dusk-lavender/30 bg-dusk-lavender/15 text-dusk-lavender">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-stone-400">คำเชิญเข้าร่วมโปรเจกต์</p>
            <h2 className="text-xl font-bold text-stone-100">{invitation.project.name}</h2>
          </div>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed mb-4">
          คุณได้รับคำเชิญเข้าร่วมทำงานในโปรเจกต์นี้ กรุณากดยืนยันเพื่อเข้าร่วมกระดานงาน
        </p>

        <Button onClick={() => setIsModalOpen(true)} className="w-full">
          เปิดหน้าต่างยืนยันคำเชิญ (Review Invitation)
        </Button>
      </div>

      <InvitationConfirmModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        invitation={modalInvitationData}
        onAccepted={(projectId) => {
          router.push(`/project/${projectId}/board`);
        }}
        onDeclined={() => {
          router.push("/projects");
        }}
      />
    </div>
  );
}
