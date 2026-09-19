import { describe, expect, it } from "vitest";
import { z } from "zod";
import { canAccessBoard, isOwnerRole } from "./project-auth";

const createCommentSchema = z.object({
  content: z.string().trim().min(1, "Comment cannot be empty.").max(2000, "Comment is too long (max 2000 characters).")
});

export function canDeleteComment(
  membershipRole: string,
  currentUserId: string,
  commentAuthorId: string
): boolean {
  return isOwnerRole(membershipRole) || currentUserId === commentAuthorId;
}

describe("Card Comment Payload Validation", () => {
  it("accepts valid comment text and trims whitespace", () => {
    const result = createCommentSchema.safeParse({ content: "  Hello team, status is updated!  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe("Hello team, status is updated!");
    }
  });

  it("rejects empty string", () => {
    const result = createCommentSchema.safeParse({ content: "" });
    expect(result.success).toBe(false);
  });

  it("rejects whitespace only strings", () => {
    const result = createCommentSchema.safeParse({ content: "    \n\t   " });
    expect(result.success).toBe(false);
  });

  it("rejects comment exceeding 2000 characters", () => {
    const longString = "a".repeat(2001);
    const result = createCommentSchema.safeParse({ content: longString });
    expect(result.success).toBe(false);
  });
});

describe("Card Comment & Board Privacy Authorization", () => {
  it("allows members of a private board to access card comments", () => {
    const privateBoard = {
      isPrivate: true,
      members: [{ userId: "user-alice" }]
    };

    expect(canAccessBoard(privateBoard, "user-alice", "MEMBER")).toBe(true);
  });

  it("denies non-members of a private board from accessing card comments", () => {
    const privateBoard = {
      isPrivate: true,
      members: [{ userId: "user-alice" }]
    };

    expect(canAccessBoard(privateBoard, "user-bob", "MEMBER")).toBe(false);
  });

  it("allows project owner to access card comments on any board", () => {
    const privateBoard = {
      isPrivate: true,
      members: [{ userId: "user-alice" }]
    };

    expect(canAccessBoard(privateBoard, "user-owner", "OWNER")).toBe(true);
  });
});

describe("Comment Deletion Permissions", () => {
  it("allows the comment author to delete their own comment", () => {
    expect(canDeleteComment("MEMBER", "user-alice", "user-alice")).toBe(true);
  });

  it("allows project owner to delete any user's comment", () => {
    expect(canDeleteComment("OWNER", "user-owner", "user-alice")).toBe(true);
  });

  it("denies another non-owner member from deleting someone else's comment", () => {
    expect(canDeleteComment("MEMBER", "user-bob", "user-alice")).toBe(false);
  });
});
