import { z } from "zod";

function isValidCalendarDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const [, year, month, day] = match;
  const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return parsed.getUTCFullYear() === Number(year) &&
    parsed.getUTCMonth() === Number(month) - 1 &&
    parsed.getUTCDate() === Number(day);
}

const dateOnlySchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(isValidCalendarDate);

export const aiDateTimeSchema = z.string()
  .datetime({ offset: true })
  .refine((value) => isValidCalendarDate(value.slice(0, 10)));

const draftCardSchema = z.object({
  columnName: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.union([
    aiDateTimeSchema,
    dateOnlySchema
  ]).nullable().optional(),
  dueDateAllDay: z.boolean().optional()
}).strict();

const draftCardsSchema = z.array(draftCardSchema).min(1).max(10);

export interface AiCardColumn {
  id: string;
  name: string;
  defaultCardStatus: string;
}

export interface AiCreateCardProposal {
  projectId: string;
  boardId: string;
  boardName: string;
  cards: Array<{
    columnId: string;
    columnName: string;
    status: "TODO" | "DOING" | "WAITING" | "DONE";
    title: string;
    description: string | null;
    priority: "LOW" | "MEDIUM" | "HIGH";
    dueDate: string | null;
    dueDateAllDay: boolean;
  }>;
}

export function extractAiCreateCardProposal(
  reply: string,
  context: {
    projectId: string;
    boardId: string;
    boardName: string;
    columns: AiCardColumn[];
  } | null
): { reply: string; proposal: AiCreateCardProposal | null } {
  const markerPattern = /<retzlo_create_cards>([\s\S]*?)<\/retzlo_create_cards>/gi;
  const blocks = Array.from(reply.matchAll(markerPattern));
  if (blocks.length === 0) {
    return { reply, proposal: null };
  }

  const cleanReply = reply.replace(markerPattern, "").trim();
  const invalidReply = context
    ? "ผมจัดทำรายการสำหรับยืนยันไม่สำเร็จ ลองระบุชื่องานและคอลัมน์อีกครั้งนะครับ"
    : "การสร้างการ์ดต้องทำจากโปรเจกต์ที่มีบอร์ด กรุณาเปิดบอร์ดก่อนครับ";

  if (blocks.length !== 1 || !context || context.columns.length === 0) {
    return {
      reply: [cleanReply, invalidReply].filter(Boolean).join("\n\n"),
      proposal: null
    };
  }

  let parsedJson: unknown;
  try {
    const jsonText = blocks[0][1]
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "");
    parsedJson = JSON.parse(jsonText);
  } catch {
    return { reply: [cleanReply, invalidReply].filter(Boolean).join("\n\n"), proposal: null };
  }

  const parsedCards = draftCardsSchema.safeParse(parsedJson);
  if (!parsedCards.success) {
    return { reply: [cleanReply, invalidReply].filter(Boolean).join("\n\n"), proposal: null };
  }

  const columnByName = new Map(
    context.columns.map((column) => [column.name.trim().toLocaleLowerCase(), column])
  );
  const statuses = new Set(["TODO", "DOING", "WAITING", "DONE"]);
  const cards = [];

  for (const draft of parsedCards.data) {
    const column = columnByName.get(draft.columnName.trim().toLocaleLowerCase());
    if (!column) {
      return { reply: [cleanReply, invalidReply].filter(Boolean).join("\n\n"), proposal: null };
    }

    const dateOnly = Boolean(draft.dueDate && /^\d{4}-\d{2}-\d{2}$/.test(draft.dueDate));
    const dueDate = draft.dueDate
      ? dateOnly
        ? `${draft.dueDate}T00:00:00.000Z`
        : new Date(draft.dueDate).toISOString()
      : null;

    cards.push({
      columnId: column.id,
      columnName: column.name,
      status: statuses.has(column.defaultCardStatus)
        ? column.defaultCardStatus as AiCreateCardProposal["cards"][number]["status"]
        : "TODO" as const,
      title: draft.title,
      description: draft.description ?? null,
      priority: draft.priority,
      dueDate,
      dueDateAllDay: draft.dueDateAllDay ?? dateOnly
    });
  }

  return {
    reply: cleanReply || "เตรียมรายการให้แล้ว ตรวจรายละเอียดและยืนยันก่อนสร้างได้เลยครับ",
    proposal: {
      projectId: context.projectId,
      boardId: context.boardId,
      boardName: context.boardName,
      cards
    }
  };
}
