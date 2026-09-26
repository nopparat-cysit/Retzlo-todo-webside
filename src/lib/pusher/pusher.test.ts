import { describe, expect, it, vi } from "vitest";
import { sanitizePusherChannel, triggerPusherEvent } from "./server";
import { sanitizePusherChannel as sanitizeClientChannel } from "./client";

describe("Pusher Channel Sanitization", () => {
  it("sanitizes colons and unsupported characters into hyphens", () => {
    expect(sanitizePusherChannel("board:cl12345")).toBe("board-cl12345");
    expect(sanitizePusherChannel("project:pr67890:comments")).toBe("project-pr67890-comments");
    expect(sanitizeClientChannel("notes:project$123")).toBe("notes-project-123");
  });

  it("preserves valid Pusher characters", () => {
    expect(sanitizePusherChannel("valid_channel-123.name@cluster")).toBe("valid_channel-123.name@cluster");
  });
});

describe("Pusher Server Resilience", () => {
  it("never throws unhandled exception when triggering event with invalid or empty channels", async () => {
    const result = await triggerPusherEvent("", "retzlo:sync", { action: "TEST" });
    expect(result).toBe(false);
  });
});
