"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";

import { Panel } from "@/components/ui/panel";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { ProfileForm } from "@/components/profile/profile-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";

interface ProfileClientProps {
  user: {
    name: string | null;
    username: string | null;
    email: string;
    avatar: string | null;
    bio: string | null;
    status: string;
    createdAt: Date;
  };
}

export function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter();
  const displayName = user.name ?? user.username ?? user.email.split("@")[0];

  return (
    <main className="min-h-screen w-screen overflow-x-hidden px-4 py-6 sm:px-6">
      {/* Back nav */}
      <div className="mb-6">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-dusk-amber transition-opacity hover:opacity-70"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to projects
        </Link>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md border border-dusk-lavender/40 bg-dusk-lavender/15 text-dusk-lavender">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-dusk-amber">Account</p>
            <h1 className="text-2xl font-semibold text-stone-100">Profile Settings</h1>
          </div>
        </div>

        {/* Avatar + Info */}
        <Panel className="p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {/* Avatar column */}
            <div className="shrink-0">
              <AvatarUpload
                currentAvatar={user.avatar}
                userName={displayName}
                onUploaded={() => router.refresh()}
              />
            </div>

            {/* Info column */}
            <div className="w-full min-w-0">
              {/* Email read-only badge */}
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-stone-400">
                  {user.email}
                </span>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  verified
                </span>
              </div>

              <ProfileForm
                user={{
                  name: user.name,
                  username: user.username,
                  bio: user.bio,
                  status: user.status,
                }}
              />
            </div>
          </div>
        </Panel>

        {/* Change password */}
        <Panel className="p-6">
          <ChangePasswordForm />
        </Panel>

        {/* Account info */}
        <Panel className="p-4">
          <p className="text-xs text-stone-600">
            Member since{" "}
            <span className="text-stone-400">
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </p>
        </Panel>
      </div>
    </main>
  );
}
