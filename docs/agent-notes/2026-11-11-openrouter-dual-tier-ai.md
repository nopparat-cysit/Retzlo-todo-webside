# OpenRouter Dual-Tier AI Engine & Perimeter Guardrails

Date: 2026-11-11
Author: poteto-agent (Dual-Tier AI Architect & Security Specialist)
Scope: AI Assistant Core, API Route Guardrails, OpenRouter Integration

---

## 1. Architectural Overview

Retzlo adopts a dual-tier AI topology powered by OpenRouter:

| Dimension | Public Tier | Workspace Tier |
|:---|:---|:---|
| Target Surfaces | Landing page, `/docs`, `/help` | Kanban boards, project planning, diaries, notes |
| Default Model | `openai/gpt-oss-120b` (`AI_PUBLIC_MODEL`) | `openai/gpt-6-luna-medium` (`AI_WORKSPACE_MODEL`) |
| Temperature | 0.3 (deterministic, focused) | 0.7 (creative, synthesis, breakdowns) |
| Max Response Tokens | 350 tokens | 1200 tokens |
| Max Input Length | 600 characters | 4000 characters |
| Message History Limit | 4 turns (token economy pruner) | 20 turns (deep project dialogue) |
| Authentication | Anonymous / Unauthenticated allowed | Strict project membership required |
| Billing & Quota | Free public guide (IP rate-limited) | AI Credit ledger deduction (1 credit/turn) |
| Card Actions | Disabled (no write actions) | Kanban card proposal extraction enabled |

---

## 2. Security & Perimeter Guardrails

### 2.1 Sliding-Window IP Rate Limiter
- 6 requests per minute per IP address.
- 30 requests per 24 hours per IP address.
- HTTP 429 response when limits are exceeded.

### 2.2 Prompt Injection Defense
- Rejects jailbreak markers, developer mode activations, and system prompt extraction queries.
- Polite refusal response: "I am Retzlo's product guide. I can only assist with questions regarding Retzlo and its features."

### 2.3 Token Economy Pruner
- Preserves the system prompt while keeping at most the last 4 messages.
- Normalizes whitespace and trims redundant newlines.

---

## 3. Configuration & Secrets Policy

Environment keys are configured via `.env` and `.env.example`:
- `OPENROUTER_API_KEY`: High-priority API key for OpenRouter completions.
- `AI_BASE_URL`: Endpoint set to `https://openrouter.ai/api/v1`.
- `AI_PUBLIC_MODEL`: Default set to `openai/gpt-oss-120b`.
- `AI_WORKSPACE_MODEL`: Default set to `openai/gpt-6-luna-medium`.

Security Note: Under no circumstance are secret tokens or API credentials committed to repository documentation or logs.

---

## 4. Verification Checkpoints

1. Unit Tests:
   - `src/lib/ai/tiers.test.ts`
   - `src/lib/ai/guardrails.test.ts`
2. Static Analysis:
   - `npm run lint`
3. Database Schema Verification:
   - `npx prisma validate`
4. Production Build:
   - `cmd.exe /c "npm run build"`
