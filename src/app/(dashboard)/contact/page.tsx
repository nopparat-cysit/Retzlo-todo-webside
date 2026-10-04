import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { ContactPageClient } from "@/components/contact/contact-page-client";

export const metadata = {
  title: "ติดต่อเรา & ศูนย์ช่วยเหลือ (Contact & Support) · Retzlo",
  description: "แบบฟอร์มส่งข้อความติดต่อทีมงาน แจ้งปัญหาการใช้งาน หรือแนะนำฟีเจอร์ใหม่สำหรับ Retzlo Platform",
};

export default async function ContactPage() {
  const session = await getServerSession(authOptions);

  return (
    <ContactPageClient
      initialUser={
        session?.user
          ? {
              name: session.user.name,
              email: session.user.email,
            }
          : null
      }
    />
  );
}
