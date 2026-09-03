import { prisma } from "@/lib/prisma";
import {
  DEFAULT_OFFICE_AGENTS,
  makeAgentProfileMarkdown,
  makeDefaultSkillMarkdown
} from "@/lib/office/constants";

export async function ensureOfficeAgents(projectId: string) {
  const agents = [];

  for (const agent of DEFAULT_OFFICE_AGENTS) {
    const savedAgent = await prisma.officeAgent.upsert({
      where: { projectId_key: { projectId, key: agent.key } },
      create: {
        projectId,
        key: agent.key,
        name: agent.name,
        role: agent.role,
        description: agent.description,
        accent: agent.accent,
        systemPrompt: agent.systemPrompt,
        documents: {
          create: {
            type: "PROFILE",
            title: "agent.md",
            content: makeAgentProfileMarkdown(agent)
          }
        },
        skills: {
          create: {
            name: `${agent.name} Starter Skill`,
            description: "Default V1 skill for turning chat into useful Office work.",
            trigger: "User asks the agent to create work from chat.",
            content: makeDefaultSkillMarkdown(agent.name),
            approvedAt: new Date()
          }
        }
      },
      update: {
        name: agent.name,
        role: agent.role,
        description: agent.description,
        accent: agent.accent,
        systemPrompt: agent.systemPrompt,
        isActive: true
      },
      include: {
        documents: { orderBy: { updatedAt: "desc" } },
        skills: { orderBy: { updatedAt: "desc" } },
        diaryEntries: { take: 6, orderBy: { entryDate: "desc" } },
        memories: { take: 6, orderBy: { updatedAt: "desc" } }
      }
    });
    agents.push(savedAgent);
  }

  return agents;
}

export async function assertOfficeProjectAccess(projectId: string, userId: string) {
  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } }
  });

  return membership;
}

export async function getOfficePayload(projectId: string) {
  await ensureOfficeAgents(projectId);

  const [agents, threads, tasks, reports, routines, diaryEntries, memories] = await Promise.all([
    prisma.officeAgent.findMany({
      where: { projectId, isActive: true },
      include: {
        documents: { orderBy: { updatedAt: "desc" } },
        skills: { orderBy: { updatedAt: "desc" } },
        diaryEntries: { take: 6, orderBy: { entryDate: "desc" } },
        memories: { take: 6, orderBy: { updatedAt: "desc" } }
      },
      orderBy: { createdAt: "asc" }
    }),
    prisma.officeThread.findMany({
      where: { projectId },
      include: {
        agent: { select: { id: true, name: true, key: true } },
        messages: { take: 12, orderBy: { createdAt: "asc" } },
        _count: { select: { messages: true, tasks: true, reports: true } }
      },
      orderBy: { updatedAt: "desc" },
      take: 20
    }),
    prisma.officeTask.findMany({
      where: { projectId },
      include: { agent: { select: { id: true, name: true, key: true } } },
      orderBy: { updatedAt: "desc" },
      take: 20
    }),
    prisma.officeReport.findMany({
      where: { projectId },
      include: { agent: { select: { id: true, name: true, key: true } } },
      orderBy: { createdAt: "desc" },
      take: 12
    }),
    prisma.officeRoutine.findMany({
      where: { projectId },
      include: { agent: { select: { id: true, name: true, key: true } } },
      orderBy: { updatedAt: "desc" },
      take: 12
    }),
    prisma.officeAgentDiaryEntry.findMany({
      where: { projectId },
      include: { agent: { select: { id: true, name: true, key: true } } },
      orderBy: { entryDate: "desc" },
      take: 12
    }),
    prisma.officeAgentMemory.findMany({
      where: { projectId },
      include: { agent: { select: { id: true, name: true, key: true } } },
      orderBy: { updatedAt: "desc" },
      take: 12
    })
  ]);

  return {
    agents: agents.map((agent) => ({
      ...agent,
      createdAt: agent.createdAt.toISOString(),
      updatedAt: agent.updatedAt.toISOString(),
      documents: agent.documents.map((document) => ({ ...document, createdAt: document.createdAt.toISOString(), updatedAt: document.updatedAt.toISOString() })),
      skills: agent.skills.map((skill) => ({ ...skill, approvedAt: skill.approvedAt?.toISOString() ?? null, createdAt: skill.createdAt.toISOString(), updatedAt: skill.updatedAt.toISOString() })),
      diaryEntries: agent.diaryEntries.map((entry) => ({ ...entry, entryDate: entry.entryDate.toISOString(), createdAt: entry.createdAt.toISOString(), updatedAt: entry.updatedAt.toISOString() })),
      memories: agent.memories.map((memory) => ({ ...memory, approvedAt: memory.approvedAt?.toISOString() ?? null, createdAt: memory.createdAt.toISOString(), updatedAt: memory.updatedAt.toISOString() }))
    })),
    threads: threads.map((thread) => ({
      ...thread,
      createdAt: thread.createdAt.toISOString(),
      updatedAt: thread.updatedAt.toISOString(),
      messages: thread.messages.map((message) => ({ ...message, createdAt: message.createdAt.toISOString() }))
    })),
    tasks: tasks.map((task) => ({ ...task, createdAt: task.createdAt.toISOString(), updatedAt: task.updatedAt.toISOString() })),
    reports: reports.map((report) => ({ ...report, createdAt: report.createdAt.toISOString(), updatedAt: report.updatedAt.toISOString() })),
    routines: routines.map((routine) => ({ ...routine, lastRunAt: routine.lastRunAt?.toISOString() ?? null, createdAt: routine.createdAt.toISOString(), updatedAt: routine.updatedAt.toISOString() })),
    diaryEntries: diaryEntries.map((entry) => ({ ...entry, entryDate: entry.entryDate.toISOString(), createdAt: entry.createdAt.toISOString(), updatedAt: entry.updatedAt.toISOString() })),
    memories: memories.map((memory) => ({ ...memory, approvedAt: memory.approvedAt?.toISOString() ?? null, createdAt: memory.createdAt.toISOString(), updatedAt: memory.updatedAt.toISOString() }))
  };
}

export type OfficePayload = Awaited<ReturnType<typeof getOfficePayload>>;