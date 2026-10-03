import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { HelpCenterClient } from "@/components/help/help-center-client";

export const metadata = {
  title: "ข้อมูลระบบ & คู่มือการใช้งาน (System Guide & Help) · Retzlo",
};

export default async function HelpPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return <HelpCenterClient />;
}
