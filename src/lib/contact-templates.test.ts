import { describe, expect, it } from "vitest";
import { CONTACT_TEMPLATES } from "./contact-templates";

describe("Contact Templates System", () => {
  it("provides comprehensive contact templates with required properties", () => {
    expect(CONTACT_TEMPLATES.length).toBeGreaterThanOrEqual(6);

    const templateIds = CONTACT_TEMPLATES.map((t) => t.id);
    expect(templateIds).toContain("bug-report");
    expect(templateIds).toContain("feature-request");
    expect(templateIds).toContain("general-inquiry");
    expect(templateIds).toContain("partnership-feedback");
    expect(templateIds).toContain("gamification-rewards");
    expect(templateIds).toContain("security-privacy");
    expect(templateIds).toContain("custom");

    CONTACT_TEMPLATES.forEach((tpl) => {
      expect(tpl.id).toBeTruthy();
      expect(tpl.label).toBeTruthy();
      expect(tpl.shortName).toBeTruthy();
      expect(tpl.badge).toBeTruthy();
      expect(["low", "medium", "high", "urgent"]).toContain(tpl.defaultPriority);
    });
  });

  it("bug report template includes structured reproduction steps", () => {
    const bugTpl = CONTACT_TEMPLATES.find((t) => t.id === "bug-report");
    expect(bugTpl).toBeDefined();
    expect(bugTpl?.defaultSubject).toContain("[Bug]");
    expect(bugTpl?.templateBody).toContain("Steps to Reproduce");
    expect(bugTpl?.templateBody).toContain("Browser");
    expect(bugTpl?.defaultPriority).toBe("high");
  });

  it("feature request template includes structured benefits and workflow sections", () => {
    const featureTpl = CONTACT_TEMPLATES.find((t) => t.id === "feature-request");
    expect(featureTpl).toBeDefined();
    expect(featureTpl?.defaultSubject).toContain("[Feature Request]");
    expect(featureTpl?.templateBody).toContain("Expected Benefits");
  });
});
