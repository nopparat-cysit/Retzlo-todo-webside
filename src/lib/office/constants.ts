export const OFFICE_TASK_STATUSES = ["QUEUED", "WORKING", "NEEDS_YOU", "DONE", "FAILED"] as const;
export type OfficeTaskStatus = (typeof OFFICE_TASK_STATUSES)[number];

export const OFFICE_AGENT_KEYS = ["chief", "researcher", "planner", "writer"] as const;
export type OfficeAgentKey = (typeof OFFICE_AGENT_KEYS)[number];

export const DEFAULT_OFFICE_AGENTS = [
  {
    key: "chief",
    name: "Chief",
    role: "Overview lead",
    description: "Summarizes the workspace, spots what needs attention, and keeps the dashboard useful.",
    accent: "AMBER",
    systemPrompt: "Summarize project state first, then suggest the next useful action. Keep decisions visible."
  },
  {
    key: "researcher",
    name: "Researcher",
    role: "Research and briefs",
    description: "Turns information into compact briefs, comparisons, and source-aware reports.",
    accent: "CYAN",
    systemPrompt: "Be careful with facts, state uncertainty, and format reports with TLDR, key points, and actions."
  },
  {
    key: "planner",
    name: "Planner",
    role: "Tasks and plans",
    description: "Breaks fuzzy requests into tasks, checklists, owners, and next steps.",
    accent: "LAVENDER",
    systemPrompt: "Convert ideas into clear tasks with scope, order, and visible blockers."
  },
  {
    key: "writer",
    name: "Writer",
    role: "Writing and docs",
    description: "Drafts reports, docs, summaries, and polished copy from chat context.",
    accent: "ROSE",
    systemPrompt: "Write clear summaries with a strong opening and practical structure."
  }
] as const;

export function makeAgentProfileMarkdown(agent: (typeof DEFAULT_OFFICE_AGENTS)[number]) {
  return `# ${agent.name}\n\n## Role\n${agent.role}\n\n## Strengths\n- ${agent.description}\n\n## Rules\n- Work only inside this web workspace in V1.\n- Ask for approval before saving durable memory or skills.\n- Keep outputs connected to tasks, reports, or threads.`;
}

export function makeDefaultSkillMarkdown(agentName: string) {
  return `# ${agentName} Starter Skill\n\n## Trigger\nWhen the user asks this agent to turn chat into useful work.\n\n## Steps\n1. Clarify the outcome.\n2. Create a short task or report draft.\n3. Surface anything that needs user review.\n\n## Output Format\n- Summary\n- Work item\n- Suggested next action`;
}

export function buildMockAssistantReply(agentName: string, message: string) {
  const trimmed = message.trim();
  return `${agentName} noted this: "${trimmed}"\n\nI can keep this as chat context, turn it into a task, or draft a report from it. For V1 I will stay inside Office and wait for your approval before saving durable memory or skills.`;
}