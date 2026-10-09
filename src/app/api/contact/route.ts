import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const { name, email, subject, message, templateId, priority } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return NextResponse.json(
        { error: "Subject is required." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message content is required." },
        { status: 400 }
      );
    }

    // Generate unique tracking ticket ID
    const ticketId = `RETZLO-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Log the contact ticket
    console.info(`[CONTACT_TICKET] Received ticket ${ticketId}`, {
      ticketId,
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      templateId: templateId || "custom",
      priority: priority || "medium",
      userId: session?.user?.id || null,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      ticketId,
      message: "Your message has been received. Our team will review and follow up as soon as possible.",
    });
  } catch (error) {
    console.error("[CONTACT_API_ERROR]", error);
    return NextResponse.json(
      { error: "An error occurred while sending your message. Please try again." },
      { status: 500 }
    );
  }
}
