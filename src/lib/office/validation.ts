import { z } from "zod";

import { OFFICE_TASK_STATUSES } from "@/lib/office/constants";

export const officeIdSchema = z.string().uuid();

export const createOfficeThreadSchema = z.object({
  agentId: officeIdSchema,
  title: z.string().trim().min(1).max(120)
});

export const createOfficeMessageSchema = z.object({
  agentId: officeIdSchema,
  threadId: officeIdSchema.optional(),
  content: z.string().trim().min(1).max(4000)
});

export const createOfficeTaskSchema = z.object({
  agentId: officeIdSchema,
  threadId: officeIdSchema.optional(),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(4000),
  status: z.enum(OFFICE_TASK_STATUSES).default("QUEUED")
});

export const createOfficeReportSchema = z.object({
  agentId: officeIdSchema,
  threadId: officeIdSchema.optional(),
  taskId: officeIdSchema.optional(),
  title: z.string().trim().min(1).max(180),
  summary: z.string().trim().min(1).max(800),
  content: z.string().trim().min(1).max(12000)
});

export const createOfficeRoutineSchema = z.object({
  agentId: officeIdSchema,
  title: z.string().trim().min(1).max(160),
  prompt: z.string().trim().min(1).max(4000),
  scheduleLabel: z.string().trim().min(1).max(120).default("Daily"),
  timeOfDay: z.string().trim().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  enabled: z.boolean().default(true)
});

export const createOfficeKnowledgeSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("DIARY"),
    agentId: officeIdSchema,
    threadId: officeIdSchema.optional(),
    taskId: officeIdSchema.optional(),
    content: z.string().trim().min(1).max(6000),
    tags: z.array(z.string().trim().min(1).max(40)).max(8).optional()
  }),
  z.object({
    kind: z.literal("MEMORY"),
    agentId: officeIdSchema,
    title: z.string().trim().min(1).max(160),
    content: z.string().trim().min(1).max(6000)
  }),
  z.object({
    kind: z.literal("SKILL"),
    agentId: officeIdSchema,
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(400),
    trigger: z.string().trim().min(1).max(400),
    content: z.string().trim().min(1).max(12000)
  })
]);