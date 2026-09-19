import { describe, expect, it } from "vitest";

import { canAccessBoard } from "./project-auth";

describe("canAccessBoard", () => {
  it("allows project owners to access any board even if private", () => {
    const privateBoard = {
      isPrivate: true,
      members: []
    };

    expect(canAccessBoard(privateBoard, "user-owner", "OWNER")).toBe(true);
  });

  it("allows regular members to access public boards", () => {
    const publicBoard = {
      isPrivate: false,
      members: []
    };

    expect(canAccessBoard(publicBoard, "user-member", "MEMBER")).toBe(true);
  });

  it("denies regular members access to private boards if not assigned", () => {
    const privateBoard = {
      isPrivate: true,
      members: [{ userId: "other-user" }]
    };

    expect(canAccessBoard(privateBoard, "user-member", "MEMBER")).toBe(false);
  });

  it("allows assigned members access to private boards", () => {
    const privateBoard = {
      isPrivate: true,
      members: [{ userId: "user-member" }, { userId: "other-user" }]
    };

    expect(canAccessBoard(privateBoard, "user-member", "MEMBER")).toBe(true);
  });
});
