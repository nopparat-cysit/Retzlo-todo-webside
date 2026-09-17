"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FolderKanban,
  LogIn,
  UserPlus,
  XCircle
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast";

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

function ProjectPreviewCard({
  project,
  inviter
}: {
  project: { name: string; description?: string | null };
  inviter: { name?: string | null; email: string; avatar?: string | null };
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left shadow-[0_12px_32px_rgba(0,0,0,0.2)]">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-dusk-lavender/30 bg-dusk-lavender/15 text-dusk-lavender shadow-inner">
          <FolderKanban className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-dusk-amber">โครงการที่ได้รับเชิญ</p>
          <h2 className="mt-0.5 truncate text-base font-bold text-stone-100 tracking-tight">{project.name}</h2>
          {project.description ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-400">{project.description}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-3.5 flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-stone-300">
        <Avatar src={inviter.avatar} name={inviter.name ?? inviter.email} size={24} />
        <span className="truncate">
          เชิญโดย <strong className="font-medium text-stone-100">{inviter.name ?? inviter.email}</strong>
        </span>
      </div>
    </div>
  );
}

export function AcceptInvitation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InvitationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [isDeclineConfirmOpen, setIsDeclineConfirmOpen] = useState(false);

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
          setError(result.error ?? "คำเชิญนี้ไม่ถูกต้องหรืออาจถูกยกเลิกแล้ว");
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

  async function handleAccept() {
    if (!token) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/accept-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });

      const resData = (await response.json()) as {
        accepted?: boolean;
        projectId?: string;
        projectName?: string;
        error?: string;
      };

      if (!response.ok || !resData.accepted || !resData.projectId) {
        toast({
          message: resData.error ?? "ไม่สามารถตอบรับคำเชิญได้",
          type: "error"
        });
        return;
      }

      toast({
        message: `เข้าร่วมโปรเจกต์ "${resData.projectName ?? data?.invitation?.project.name}" เรียบร้อยแล้ว!`,
        type: "success"
      });

      router.push(`/project/${resData.projectId}/board`);
      router.refresh();
    } catch {
      toast({
        message: "เกิดข้อผิดพลาดในการตอบรับคำเชิญ กรุณาลองใหม่อีกครั้ง",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDecline() {
    if (!token) return;
    setIsDeclining(true);
    setIsDeclineConfirmOpen(false);
    try {
      const response = await fetch("/api/auth/accept-invitation", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
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

      router.push("/projects");
      router.refresh();
    } catch {
      toast({
        message: "เกิดข้อผิดพลาดในการปฏิเสธคำเชิญ",
        type: "error"
      });
    } finally {
      setIsDeclining(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-stone-400">
        <div className="mb-3 h-7 w-7 animate-spin rounded-full border-2 border-dusk-lavender border-t-transparent" />
        <p className="text-xs text-stone-400">กำลังตรวจสอบข้อมูลคำเชิญ...</p>
      </div>
    );
  }

  // Error / Invalid Token
  if (error || !data?.invitation) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-dusk-rose/30 bg-dusk-rose/15 text-dusk-rose shadow-[0_0_24px_rgba(213,154,179,0.18)]">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-stone-100">ไม่พบข้อมูลคำเชิญ</h2>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-stone-400">
            {error ?? "ลิงก์คำเชิญนี้ไม่ถูกต้อง หรืออาจถูกยกเลิกไปแล้ว"}
          </p>
        </div>

        <div className="pt-2">
          <Link href="/projects" className="block w-full">
            <Button variant="secondary" className="w-full text-xs">
              กลับสู่หน้ารวมโครงการ (Go to Projects)
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { invitation, currentUser, isLoggedIn, isEmailMatch } = data;
  const callbackUrl = `/accept-invitation?token=${token}`;

  // State: Already Accepted
  if (invitation.status === "ACCEPTED") {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-dusk-cyan/30 bg-dusk-cyan/15 text-dusk-cyan shadow-[0_0_24px_rgba(137,199,214,0.2)]">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-stone-100">คำเชิญนี้ได้รับการตอบรับแล้ว</h2>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-stone-400">
            คุณหรือสมาชิกในทีมได้เข้าร่วมโปรเจกต์นี้เรียบร้อยแล้ว สามารถเข้าสู่หน้าจัดการโครงการได้ทันที
          </p>
        </div>

        {invitation.project ? (
          <ProjectPreviewCard project={invitation.project} inviter={invitation.inviter} />
        ) : null}

        <div className="space-y-2 pt-2">
          <Link href={`/project/${invitation.project.id}/board`} className="block w-full">
            <Button className="w-full flex items-center justify-center gap-1.5 bg-dusk-lavender text-ink-950 font-semibold hover:bg-dusk-amber transition-all shadow-md">
              <span>เข้าสู่หน้าโครงการ (Open Project)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Link href="/projects" className="block pt-1 text-center text-xs text-stone-400 hover:text-stone-200 transition-colors">
            กลับสู่หน้ารวมโครงการทั้งหมด
          </Link>
        </div>
      </div>
    );
  }

  // State: Declined
  if (invitation.status === "DECLINED") {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-stone-400">
          <XCircle className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-stone-100">คำเชิญนี้ถูกปฏิเสธแล้ว</h2>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-stone-400">
            คำเชิญนี้ถูกปฏิเสธไปก่อนหน้านี้ หากต้องการเข้าร่วม กรุณาขอรับคำเชิญใหม่จากผู้ดูแลโครงการ
          </p>
        </div>

        {invitation.project ? (
          <ProjectPreviewCard project={invitation.project} inviter={invitation.inviter} />
        ) : null}

        <div className="pt-2">
          <Link href="/projects" className="block w-full">
            <Button variant="secondary" className="w-full text-xs">
              กลับสู่หน้ารวมโครงการ (Go to Projects)
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // State: Expired
  if (invitation.isExpired) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-dusk-amber/30 bg-dusk-amber/15 text-dusk-amber shadow-[0_0_24px_rgba(229,189,114,0.18)]">
          <Clock className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-stone-100">คำเชิญหมดอายุแล้ว</h2>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-stone-400">
            ลิงก์คำเชิญนี้มีอายุ 7 วันและหมดเวลาใช้งานแล้ว กรุณาติดต่อผู้ดูแลโครงการเพื่อขอรับคำเชิญใหม่
          </p>
        </div>

        {invitation.project ? (
          <ProjectPreviewCard project={invitation.project} inviter={invitation.inviter} />
        ) : null}

        <div className="pt-2">
          <Link href="/projects" className="block w-full">
            <Button variant="secondary" className="w-full text-xs">
              กลับสู่หน้ารวมโครงการ (Go to Projects)
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Case 1: Not logged in
  if (!isLoggedIn) {
    return (
      <div className="space-y-4 text-left">
        <ProjectPreviewCard project={invitation.project} inviter={invitation.inviter} />

        <div className="rounded-xl border border-dusk-amber/30 bg-dusk-amber/10 p-3 text-xs text-stone-300">
          <p className="font-semibold text-dusk-amber mb-0.5">คำเชิญสำหรับ: {invitation.email}</p>
          <p className="text-stone-400">กรุณาเข้าสู่ระบบหรือสร้างบัญชีด้วยอีเมลนี้เพื่อตอบรับคำเชิญเข้าร่วมโครงการ</p>
        </div>

        <div className="space-y-2 pt-1">
          <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="block w-full">
            <Button className="w-full flex items-center justify-center gap-2 bg-dusk-lavender text-ink-950 font-semibold hover:bg-dusk-amber transition-all">
              <LogIn className="h-4 w-4" />
              <span>เข้าสู่ระบบ (Sign in)</span>
            </Button>
          </Link>
          <Link href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="block w-full">
            <Button variant="ghost" className="w-full text-xs text-stone-300 hover:text-stone-100">
              สร้างบัญชีใหม่ (Create account)
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Case 2: Logged in with different email
  if (!isEmailMatch) {
    return (
      <div className="space-y-4 text-left">
        <ProjectPreviewCard project={invitation.project} inviter={invitation.inviter} />

        <div className="space-y-1.5 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3.5 text-xs text-stone-300">
          <div className="flex items-center gap-2 text-amber-300 font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>เข้าสู่ระบบด้วยบัญชีอื่น</span>
          </div>
          <p className="text-stone-300 leading-relaxed">
            ปัจจุบันคุณกำลังเข้าสู่ระบบด้วย <strong>{currentUser?.email}</strong> แต่คำเชิญนี้ถูกส่งมายัง <strong>{invitation.email}</strong>
          </p>
        </div>

        <div className="space-y-2 pt-1">
          <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="block w-full">
            <Button className="w-full bg-dusk-lavender text-ink-950 font-semibold hover:bg-dusk-amber transition-all">
              สลับบัญชีผู้ใช้ (Switch Account)
            </Button>
          </Link>
          <Link href="/projects" className="block w-full">
            <Button variant="ghost" className="w-full text-xs text-stone-400">
              ยกเลิกและกลับสู่หน้าโครงการ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Case 3: Logged in with matching email - Ready to Accept!
  return (
    <div className="space-y-4 text-left">
      <ProjectPreviewCard project={invitation.project} inviter={invitation.inviter} />

      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-stone-300">
        <span className="text-stone-400">บทบาทที่ได้รับมอบหมาย</span>
        <span className="inline-flex items-center gap-1 rounded-full border border-dusk-amber/30 bg-dusk-amber/10 px-2.5 py-0.5 font-semibold text-dusk-amber text-[11px]">
          <UserPlus className="h-3 w-3" />
          <span>สมาชิก (Member)</span>
        </span>
      </div>

      <div className="space-y-2 pt-1">
        <Button
          onClick={handleAccept}
          disabled={isSubmitting || isDeclining}
          className="w-full flex items-center justify-center gap-1.5 bg-dusk-lavender text-ink-950 font-semibold hover:bg-dusk-amber transition-all shadow-[0_4px_20px_rgba(169,162,255,0.25)] h-10 text-sm"
        >
          <UserPlus className="h-4 w-4" />
          <span>{isSubmitting ? "กำลังเข้าร่วมโครงการ..." : "ตอบรับคำเชิญ (Accept & Join)"}</span>
        </Button>

        <Button
          variant="ghost"
          onClick={() => setIsDeclineConfirmOpen(true)}
          disabled={isSubmitting || isDeclining}
          className="w-full text-xs text-stone-400 hover:text-dusk-rose hover:bg-dusk-rose/10"
        >
          ปฏิเสธคำเชิญ (Decline)
        </Button>
      </div>

      <ConfirmModal
        open={isDeclineConfirmOpen}
        title="ปฏิเสธคำเชิญ"
        message={`คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธคำเชิญเข้าร่วมโปรเจกต์ "${invitation.project.name}"?`}
        confirmLabel="ปฏิเสธคำเชิญ"
        variant="danger"
        isLoading={isDeclining}
        onConfirm={handleDecline}
        onClose={() => setIsDeclineConfirmOpen(false)}
      />
    </div>
  );
}
