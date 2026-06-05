import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileClient } from "@/components/profile/profile-client";

export const metadata = {
  title: "Profile Settings · RETROD",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      avatar: true,
      bio: true,
      status: true,
      createdAt: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <ProfileClient
      user={{
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        status: user.status,
        createdAt: user.createdAt,
      }}
    />
  );
}
