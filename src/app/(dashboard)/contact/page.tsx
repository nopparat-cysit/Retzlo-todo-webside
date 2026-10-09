import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { ContactPageClient } from "@/components/contact/contact-page-client";

export const metadata = {
  title: "Contact & Support · Retzlo",
  description: "Send a message to our support team, report an issue, or suggest new features for Retzlo Platform.",
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
