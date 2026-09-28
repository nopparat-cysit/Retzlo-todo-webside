import {
  TASK_BREAKDOWN_SYSTEM_PROMPT,
  PROJECT_SUMMARY_SYSTEM_PROMPT
} from "./prompts";

export interface DeepSeekChatOptions {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  timeoutMs?: number;
}

export interface TaskBreakdownResult {
  items: string[];
  suggestedDifficulty?: 1 | 3 | 5 | 8;
  suggestedPriority?: "LOW" | "MEDIUM" | "HIGH";
  summary?: string;
}

export interface ProjectSummaryResult {
  healthStatus: "HEALTHY" | "ATTENTION" | "CRITICAL";
  completionRatePercent: number;
  overview: string;
  currentFocus: string[];
  bottlenecks: string[];
  recommendations: string[];
}

function cleanJsonString(raw: string): string {
  let text = raw.trim();
  // Strip markdown code fences if present
  if (text.startsWith("```json")) {
    text = text.slice(7);
  } else if (text.startsWith("```")) {
    text = text.slice(3);
  }
  if (text.endsWith("```")) {
    text = text.slice(0, -3);
  }
  return text.trim();
}

/**
 * Executes a call to the DeepSeek Chat Completions API.
 */
export async function callDeepSeekChat(
  options: DeepSeekChatOptions
): Promise<string> {
  const apiKey =
    process.env.DEEPSEEK_API_KEY ||
    process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY ||
    "";
  const baseUrl = (
    process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com"
  ).replace(/\/+$/, "");
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";

  // Transparent error when API key is missing in production/dev
  if (!apiKey || apiKey.trim() === "" || apiKey === "undefined") {
    if (process.env.NODE_ENV === "test" || process.env.VITEST) {
      return generateFallbackResponse(options);
    }
    throw new Error(
      "ไม่พบการตั้งค่า DEEPSEEK_API_KEY กรุณาตรวจสอบไฟล์ .env แล้ว restart server"
    );
  }

  const timeoutMs = options.timeoutMs ?? 20000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const messages: Array<{ role: "system" | "user"; content: string }> = [];
  if (options.systemPrompt) {
    messages.push({ role: "system", content: options.systemPrompt });
  }
  messages.push({ role: "user", content: options.userPrompt });

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 1500,
        response_format: options.jsonMode ? { type: "json_object" } : undefined
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(
        `DeepSeek API error (${response.status}): ${errText || response.statusText}`
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("DeepSeek returned an empty response.");
    }

    return content;
  } finally {
    clearTimeout(timer);
  }
}

function sanitizeChecklistItem(raw: string): string {
  return raw
    .trim()
    .replace(/^(\d+[\.\)]|[-*•]|\[[ xX]?\])\s*/, "")
    .trim();
}

/**
 * Breakdown a task title/description into structured checklist items.
 */
export async function generateTaskBreakdown(params: {
  title: string;
  description?: string | null;
  customGoal?: string | null;
  depth?: "standard" | "detailed";
}): Promise<TaskBreakdownResult> {
  const { title, description, customGoal, depth = "detailed" } = params;

  const userPrompt = `Task Title: "${title}"
${description ? `Task Description: "${description}"` : ""}
${customGoal ? `User Custom Note/Goal: "${customGoal}"` : ""}
Requested Depth: ${depth === "standard" ? "standard (5-6 steps)" : "detailed (8-10 actionable, sequential checklist items)"}

Generate high-quality, practical, sequential checklist todos starting with action verbs.`;

  const rawJson = await callDeepSeekChat({
    systemPrompt: TASK_BREAKDOWN_SYSTEM_PROMPT,
    userPrompt,
    jsonMode: true,
    temperature: 0.35
  });

  const cleaned = cleanJsonString(rawJson);
  const parsed = JSON.parse(cleaned) as Partial<TaskBreakdownResult>;

  const rawItems = Array.isArray(parsed.items)
    ? parsed.items.map((i) => sanitizeChecklistItem(String(i))).filter(Boolean)
    : [];

  const validDifficulties: Array<1 | 3 | 5 | 8> = [1, 3, 5, 8];
  const suggestedDifficulty = validDifficulties.includes(
    parsed.suggestedDifficulty as any
  )
    ? (parsed.suggestedDifficulty as 1 | 3 | 5 | 8)
    : rawItems.length > 6
      ? 5
      : 3;

  const validPriorities = ["LOW", "MEDIUM", "HIGH"] as const;
  const suggestedPriority = validPriorities.includes(
    parsed.suggestedPriority as any
  )
    ? (parsed.suggestedPriority as "LOW" | "MEDIUM" | "HIGH")
    : "MEDIUM";

  return {
    items: rawItems.length > 0 ? rawItems : [`เริ่มดำเนินการ: ${title}`],
    suggestedDifficulty,
    suggestedPriority,
    summary: parsed.summary || `แตกงาน ${rawItems.length} ขั้นตอนสำหรับ "${title}"`
  };
}

/**
 * Generate an executive progress summary for a Kanban board snapshot.
 */
export async function generateProjectSummary(params: {
  projectName: string;
  boardName: string;
  totalCards: number;
  todoCount: number;
  doingCount: number;
  waitingCount: number;
  doneCount: number;
  overdueCards: Array<{ title: string; priority: string; dueDate?: string | null }>;
  inProgressCards: Array<{ title: string; priority: string }>;
  doneCards: Array<{ title: string }>;
}): Promise<ProjectSummaryResult> {
  const userPrompt = `Project: "${params.projectName}" (Board: "${params.boardName}")
Metrics:
- Total Cards: ${params.totalCards}
- Completed (DONE): ${params.doneCount}
- In Progress (DOING): ${params.doingCount}
- Waiting/Review (WAITING): ${params.waitingCount}
- Backlog/To-Do (TODO): ${params.todoCount}

In Progress Cards:
${params.inProgressCards.map((c) => `- [${c.priority}] ${c.title}`).join("\n") || "None"}

Overdue / Critical Risk Cards:
${params.overdueCards.map((c) => `- [${c.priority}] ${c.title} (Due: ${c.dueDate || "Past due"})`).join("\n") || "None"}

Recently Completed Cards:
${params.doneCards.slice(0, 5).map((c) => `- ${c.title}`).join("\n") || "None"}

Generate an insightful executive summary in JSON format.`;

  const rawJson = await callDeepSeekChat({
    systemPrompt: PROJECT_SUMMARY_SYSTEM_PROMPT,
    userPrompt,
    jsonMode: true,
    temperature: 0.3
  });

  const cleaned = cleanJsonString(rawJson);
  const parsed = JSON.parse(cleaned) as Partial<ProjectSummaryResult>;

  return {
    healthStatus:
      parsed.healthStatus === "CRITICAL" || parsed.healthStatus === "ATTENTION"
        ? parsed.healthStatus
        : "HEALTHY",
    completionRatePercent:
      typeof parsed.completionRatePercent === "number"
        ? parsed.completionRatePercent
        : params.totalCards > 0
          ? Math.round((params.doneCount / params.totalCards) * 100)
          : 0,
    overview:
      parsed.overview ||
      `บอร์ด "${params.boardName}" ปัจจุบันมีความคืบหน้า ${params.doneCount}/${params.totalCards} การ์ด`,
    currentFocus: Array.isArray(parsed.currentFocus) ? parsed.currentFocus : [],
    bottlenecks: Array.isArray(parsed.bottlenecks) ? parsed.bottlenecks : [],
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations
      : ["โฟกัสงานในคอลัมน์ DOING ให้เสร็จก่อนเปิดงานใหม่"]
  };
}

/**
 * Fallback generator for tests or offline local environments.
 */
function generateFallbackResponse(options: DeepSeekChatOptions): string {
  if (
    options.systemPrompt === TASK_BREAKDOWN_SYSTEM_PROMPT ||
    options.systemPrompt?.includes("Productivity Specialist")
  ) {
    return JSON.stringify({
      items: [
        "เตรียมวัตถุดิบและเครื่องมือให้ครบถ้วน",
        "จัดระเบียบพื้นที่และเตรียมขั้นตอนล่วงหน้า",
        "ลงมือทำตามขั้นตอนหลักทีละขั้นอย่างแม่นยำ",
        "ปรุงรสหรือปรับแต่งตามความต้องการ",
        "ตรวจสอบความเรียบร้อยและพร้อมเสิร์ฟ/ส่งมอบ"
      ],
      suggestedDifficulty: 3,
      suggestedPriority: "MEDIUM",
      summary: "แตกงานเป็นขั้นตอนมาตรฐาน"
    });
  }

  return JSON.stringify({
    healthStatus: "HEALTHY",
    completionRatePercent: 50,
    overview: "ความคืบหน้าโครงการเป็นไปอย่างต่อเนื่อง งานส่วนใหญ่อยู่ในสถานะพร้อมส่งมอบ",
    currentFocus: ["กำลังดำเนินการงานสำคัญใน Sprint"],
    bottlenecks: [],
    recommendations: ["รักษาความต่อเนื่องในการส่งมอบงาน"]
  });
}
