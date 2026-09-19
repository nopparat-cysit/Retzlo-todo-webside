import { describe, expect, it } from "vitest";

export function formatDueDateAlert(cardTitle: string, isOverdue: boolean) {
  return {
    title: isOverdue ? "⚠️ Task Overdue" : "⏰ Task Due Soon",
    message: isOverdue
      ? `Card "${cardTitle}" is overdue!`
      : `Card "${cardTitle}" is due within 24 hours!`
  };
}

export function formatCommentNotification(
  projectTitle: string,
  cardId: string,
  cardTitle: string,
  senderName: string,
  content: string
) {
  const contentSnippet = content.length > 100 ? `${content.slice(0, 100)}...` : content;
  return {
    title: `💬 New message on "${cardTitle}"`,
    message: `${senderName}: ${contentSnippet}`,
    link: `/project/${projectTitle}/board?cardId=${cardId}`
  };
}

export function filterNotificationRecipients(assigneeIds: string[], currentUserId: string): string[] {
  return assigneeIds.filter((id) => id !== currentUserId);
}

describe("Notifications & Due Date Alert Helpers", () => {
  it("formats due date alerts correctly for overdue vs upcoming cards", () => {
    const overdue = formatDueDateAlert("Design Landing Page", true);
    expect(overdue.title).toBe("⚠️ Task Overdue");
    expect(overdue.message).toContain("is overdue!");

    const upcoming = formatDueDateAlert("Design Landing Page", false);
    expect(upcoming.title).toBe("⏰ Task Due Soon");
    expect(upcoming.message).toContain("is due within 24 hours!");
  });

  it("formats comment notification with snippet and board deep link", () => {
    const notif = formatCommentNotification(
      "proj-123",
      "card-456",
      "API Integration",
      "Alice",
      "Can we check the headers for authentication?"
    );

    expect(notif.title).toBe('💬 New message on "API Integration"');
    expect(notif.message).toBe("Alice: Can we check the headers for authentication?");
    expect(notif.link).toBe("/project/proj-123/board?cardId=card-456");
  });

  it("truncates long comment content exceeding 100 characters in notifications", () => {
    const longComment = "a".repeat(150);
    const notif = formatCommentNotification("p1", "c1", "Bug Fix", "Bob", longComment);

    expect(notif.message.length).toBeLessThan(120);
    expect(notif.message.endsWith("...")).toBe(true);
  });

  it("excludes the commenter from the notification recipient list", () => {
    const assignees = ["user-alice", "user-bob", "user-charlie"];
    const recipients = filterNotificationRecipients(assignees, "user-alice");

    expect(recipients).toEqual(["user-bob", "user-charlie"]);
    expect(recipients).not.toContain("user-alice");
  });
});
