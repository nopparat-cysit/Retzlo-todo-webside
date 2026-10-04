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
        { error: "กรุณาระบุชื่อผู้ติดต่อ (Name is required)" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "กรุณาระบุอีเมลที่ถูกต้อง (Valid email is required)" },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return NextResponse.json(
        { error: "กรุณาระบุหัวข้อเรื่อง (Subject is required)" },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อความหรือรายละเอียด (Message is required)" },
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
      message: "เราได้รับข้อความติดต่อของคุณเรียบร้อยแล้ว ทีมงานจะดำเนินการตรวจสอบและติดต่อกลับโดยเร็วที่สุด",
    });
  } catch (error) {
    console.error("[CONTACT_API_ERROR]", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
