"use client";

import { useRouter } from "next/navigation";
import { User } from "lucide-react";

import { SettingsRow, SettingsSection } from "@/components/settings/settings-section";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { BackButton } from "@/components/ui/back-button";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { ProfileForm } from "@/components/profile/profile-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { formatMediumDate } from "@/lib/date-format";

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
    <div className="min-h-screen w-full overflow-x-hidden bg-theme-background text-theme-foreground">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-theme-border bg-theme-panel/85 px-4 backdrop-blur-md sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <BackButton className="border-theme-border bg-theme-paper text-theme-muted hover:border-theme-primary/45 hover:bg-theme-paper-strong hover:text-theme-foreground" />
          <div className="h-4 w-px bg-theme-border" />
          <div className="flex min-w-0 items-center gap-2">
            <User className="h-4 w-4 shrink-0 text-theme-primary" />
            <h1 className="truncate text-sm font-semibold text-theme-foreground">Profile Settings</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle variant="icon" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        <SettingsSection
          title="Account"
          description="Your profile photo, verified email, and membership details"
        >
          <SettingsRow
            label="Profile photo"
            description="JPG, PNG, WebP or GIF · Max 4 MB"
          >
            <AvatarUpload
              currentAvatar={user.avatar}
              userName={displayName}
              onUploaded={() => router.refresh()}
            />
          </SettingsRow>

          <SettingsRow
            label="Email address"
            description="Primary account email used for sign-in and notifications"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="max-w-full break-all rounded-md border border-theme-border bg-theme-paper px-3 py-1.5 text-xs text-theme-muted">
                {user.email}
              </span>
              <span className="rounded-full border border-theme-success-border bg-theme-success-surface px-2 py-0.5 text-[10px] font-medium text-theme-success">
                verified
              </span>
            </div>
          </SettingsRow>

          <SettingsRow
            label="Member since"
            description="Date your workspace account was created"
          >
            <span className="text-sm font-medium text-theme-foreground">
              {formatMediumDate(user.createdAt)}
            </span>
          </SettingsRow>
        </SettingsSection>

        <ProfileForm
          user={{
            name: user.name,
            username: user.username,
            bio: user.bio,
            status: user.status,
          }}
        />

        <ChangePasswordForm />
      </main>
    </div>
  );
}
