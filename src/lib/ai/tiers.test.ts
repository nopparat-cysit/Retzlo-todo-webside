import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { getTierConfig, AI_TIER_CONFIG } from "./tiers";

describe("AI Tiers Domain Model", () => {
  const originalPublicModel = process.env.AI_PUBLIC_MODEL;
  const originalWorkspaceModel = process.env.AI_WORKSPACE_MODEL;

  beforeEach(() => {
    delete process.env.AI_PUBLIC_MODEL;
    delete process.env.AI_WORKSPACE_MODEL;
  });

  afterEach(() => {
    if (originalPublicModel !== undefined) {
      process.env.AI_PUBLIC_MODEL = originalPublicModel;
    } else {
      delete process.env.AI_PUBLIC_MODEL;
    }
    if (originalWorkspaceModel !== undefined) {
      process.env.AI_WORKSPACE_MODEL = originalWorkspaceModel;
    } else {
      delete process.env.AI_WORKSPACE_MODEL;
    }
  });

  it("resolves default configuration for public tier", () => {
    const config = getTierConfig("public");
    expect(config.tier).toBe("public");
    expect(config.model).toBe("openai/gpt-oss-120b");
    expect(config.maxTokens).toBe(1000);
    expect(config.temperature).toBe(0.3);
    expect(config.maxInputChars).toBe(600);
    expect(config.historyLimit).toBe(4);
    expect(config.systemPrompt).toContain("official Retzlo Guide & Assistant");
    expect(config.systemPrompt).toContain("I am Retzlo's product guide");
  });

  it("resolves default configuration for workspace tier", () => {
    const config = getTierConfig("workspace");
    expect(config.tier).toBe("workspace");
    expect(config.model).toBe("openai/gpt-6-luna");
    expect(config.maxTokens).toBe(1200);
    expect(config.temperature).toBe(0.7);
    expect(config.maxInputChars).toBe(4000);
    expect(config.historyLimit).toBe(20);
    expect(config.systemPrompt).toContain("Retzlo AI");
  });

  it("respects AI_PUBLIC_MODEL environment variable override", () => {
    process.env.AI_PUBLIC_MODEL = "openai/gpt-oss-120b-override";
    const config = getTierConfig("public");
    expect(config.model).toBe("openai/gpt-oss-120b-override");
  });

  it("respects AI_WORKSPACE_MODEL environment variable override", () => {
    process.env.AI_WORKSPACE_MODEL = "openai/gpt-6-luna-medium-override";
    const config = getTierConfig("workspace");
    expect(config.model).toBe("openai/gpt-6-luna-medium-override");
  });

  it("AI_TIER_CONFIG dynamic getters reflect current environment state", () => {
    process.env.AI_PUBLIC_MODEL = "custom-public";
    process.env.AI_WORKSPACE_MODEL = "custom-workspace";

    expect(AI_TIER_CONFIG.public.model).toBe("custom-public");
    expect(AI_TIER_CONFIG.workspace.model).toBe("custom-workspace");
  });
});
