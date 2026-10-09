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
    <div className="lofi-panel rounded-2xl p-4 text-left shadow-[0_12px_32px_rgba(0,0,0,0.2)]">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-dusk-lavender/30 bg-dusk-lavender/15 text-dusk-lavender shadow-inner">
          <FolderKanban className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-theme-warning">Invited Project</p>
          <h2 className="mt-0.5 truncate text-base font-bold tracking-tight text-theme-foreground">{project.name}</h2>
          {project.description ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-theme-muted">{project.description}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-3.5 flex items-center gap-2.5 rounded-xl border border-theme-border bg-theme-paper px-3 py-2 text-xs text-theme-muted">
        <Avatar src={inviter.avatar} name={inviter.name ?? inviter.email} size={24} />
        <span className="truncate">
          Invited by <strong className="font-medium text-theme-foreground">{inviter.name ?? inviter.email}</strong>
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
        setError("Missing invitation token");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/auth/accept-invitation?token=${token}`);
        const result = (await res.json()) as InvitationResponse;

        if (!res.ok || !result.invitation) {
          setError(result.error ?? "Invalid invitation link or invitation has been cancelled");
          setLoading(false);
          return;
        }

        setData(result);
      } catch {
        setError("Failed to load invitation. Please try again.");
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
          message: resData.error ?? "Failed to accept invitation",
          type: "error"
        });
        return;
      }

      toast({
        message: `Joined project "${resData.projectName ?? data?.invitation?.project.name}" successfully!`,
        type: "success"
      });

      router.push(`/project/${resData.projectId}/board`);
      router.refresh();
    } catch {
      toast({
        message: "Failed to accept invitation. Please try again.",
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
          message: "Failed to decline invitation",
          type: "error"
        });
        return;
      }

      toast({
        message: "Invitation declined successfully",
        type: "info"
      });

      router.push("/projects");
      router.refresh();
    } catch {
      toast({
        message: "Failed to decline invitation",
        type: "error"
      });
    } finally {
      setIsDeclining(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-theme-muted">
        <div className="mb-3 h-7 w-7 animate-spin rounded-full border-2 border-theme-accent border-t-transparent" />
        <p className="text-xs text-theme-muted">Verifying invitation details...</p>
      </div>
    );
  }

  // Error / Invalid Token
  if (error || !data?.invitation) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-theme-danger-border bg-theme-danger-surface text-theme-danger">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-theme-foreground">Invitation Not Found</h2>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-theme-muted">
            {error ?? "This invitation link is invalid or has been cancelled."}
          </p>
        </div>

        <div className="pt-2">
          <Link href="/projects" className="block w-full">
            <Button variant="secondary" className="w-full text-xs">
              Go to Projects
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
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-theme-success-border bg-theme-success-surface text-theme-success">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-theme-foreground">This invitation has already been accepted</h2>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-theme-muted">
            You or a teammate have already joined this project. You can access the workspace right away.
          </p>
        </div>

        {invitation.project ? (
          <ProjectPreviewCard project={invitation.project} inviter={invitation.inviter} />
        ) : null}

        <div className="space-y-2 pt-2">
          <Link href={`/project/${invitation.project.id}/board`} className="block w-full">
            <Button className="w-full flex items-center justify-center gap-1.5 bg-dusk-lavender text-ink-950 font-semibold hover:bg-dusk-amber transition-all shadow-md">
              <span>Open Project</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Link href="/projects" className="block pt-1 text-center text-xs text-theme-muted hover:text-theme-foreground transition-colors">
            Back to all projects
          </Link>
        </div>
      </div>
    );
  }

  // State: Declined
  if (invitation.status === "DECLINED") {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-theme-border bg-theme-paper text-theme-muted">
          <XCircle className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-theme-foreground">This invitation has been declined</h2>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-theme-muted">
            This invitation was declined previously. If you wish to join, please request a new invite from the project manager.
          </p>
        </div>

        {invitation.project ? (
          <ProjectPreviewCard project={invitation.project} inviter={invitation.inviter} />
        ) : null}

        <div className="pt-2">
          <Link href="/projects" className="block w-full">
            <Button variant="secondary" className="w-full text-xs">
              Go to Projects
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
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-theme-warning-border bg-theme-warning-surface text-theme-warning">
          <Clock className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-theme-foreground">Invitation Expired</h2>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-theme-muted">
            This invitation link was valid for 7 days and has expired. Please contact the project administrator for a new invite.
          </p>
        </div>

        {invitation.project ? (
          <ProjectPreviewCard project={invitation.project} inviter={invitation.inviter} />
        ) : null}

        <div className="pt-2">
          <Link href="/projects" className="block w-full">
            <Button variant="secondary" className="w-full text-xs">
              Go to Projects
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

        <div className="rounded-xl border border-theme-info-border bg-theme-info-surface p-3 text-xs text-theme-info">
          <p className="mb-0.5 font-semibold">Invitation for: {invitation.email}</p>
          <p className="text-theme-muted">Please sign in or create an account with this email address to accept the invitation.</p>
        </div>

        <div className="space-y-2 pt-1">
          <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="block w-full">
            <Button className="w-full flex items-center justify-center gap-2 bg-dusk-lavender text-ink-950 font-semibold hover:bg-dusk-amber transition-all">
              <LogIn className="h-4 w-4" />
              <span>Sign in</span>
            </Button>
          </Link>
          <Link href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="block w-full">
            <Button variant="ghost" className="w-full text-xs text-theme-muted hover:text-theme-foreground">
              Create account
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

        <div className="space-y-1.5 rounded-xl border border-theme-warning-border bg-theme-warning-surface p-3.5 text-xs text-theme-foreground">
          <div className="flex items-center gap-2 font-semibold text-theme-warning">
            <AlertCircle className="h-4 w-4 shrink-0 text-theme-warning" />
            <span>Signed in with a different account</span>
          </div>
          <p className="leading-relaxed text-theme-foreground">
            You are currently signed in as <strong>{currentUser?.email}</strong>, but this invitation was sent to <strong>{invitation.email}</strong>.
          </p>
        </div>

        <div className="space-y-2 pt-1">
          <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="block w-full">
            <Button className="w-full bg-dusk-lavender text-ink-950 font-semibold hover:bg-dusk-amber transition-all">
              Switch Account
            </Button>
          </Link>
          <Link href="/projects" className="block w-full">
            <Button variant="ghost" className="w-full text-xs text-theme-muted">
              Cancel and return to projects
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

      <div className="flex items-center justify-between rounded-xl border border-theme-border bg-theme-paper px-3.5 py-2.5 text-xs text-theme-muted">
        <span>Assigned Role</span>
        <span className="inline-flex items-center gap-1 rounded-full border border-theme-warning-border bg-theme-warning-surface px-2.5 py-0.5 text-[11px] font-semibold text-theme-warning">
          <UserPlus className="h-3 w-3" />
          <span>Member</span>
        </span>
      </div>

      <div className="space-y-2 pt-1">
        <Button
          onClick={handleAccept}
          disabled={isSubmitting || isDeclining}
          className="w-full flex items-center justify-center gap-1.5 bg-dusk-lavender text-ink-950 font-semibold hover:bg-dusk-amber transition-all shadow-[0_4px_20px_rgba(169,162,255,0.25)] h-10 text-sm"
        >
          <UserPlus className="h-4 w-4" />
          <span>{isSubmitting ? "Joining workspace..." : "Accept & Join"}</span>
        </Button>

        <Button
          variant="ghost"
          onClick={() => setIsDeclineConfirmOpen(true)}
          disabled={isSubmitting || isDeclining}
          className="w-full text-xs text-theme-muted hover:bg-theme-danger-surface hover:text-theme-danger"
        >
          Decline
        </Button>
      </div>

      <ConfirmModal
        open={isDeclineConfirmOpen}
        title="Decline Invitation"
        message={`Are you sure you want to decline the invitation to join "${invitation.project.name}"?`}
        confirmLabel="Decline Invitation"
        variant="danger"
        isLoading={isDeclining}
        onConfirm={handleDecline}
        onClose={() => setIsDeclineConfirmOpen(false)}
      />
    </div>
  );
}
