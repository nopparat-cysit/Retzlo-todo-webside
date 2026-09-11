import { describe, expect, it } from "vitest";
import { createSubmitLock } from "./submit-lock";

describe("createSubmitLock", () => {
  it("executes single action successfully", async () => {
    const lock = createSubmitLock();
    const result = await lock.runWithLock(async () => {
      return "done";
    });
    expect(result).toBe("done");
    expect(lock.isLocked()).toBe(false);
  });

  it("blocks concurrent executions invoked in the same event loop turn", async () => {
    const lock = createSubmitLock();
    let callCount = 0;

    const task = async () => {
      callCount++;
      await new Promise((resolve) => setTimeout(resolve, 50));
      return callCount;
    };

    // Simulate 3 rapid clicks fired concurrently
    const [p1, p2, p3] = await Promise.all([
      lock.runWithLock(task),
      lock.runWithLock(task),
      lock.runWithLock(task)
    ]);

    expect(p1).toBe(1);
    expect(p2).toBeUndefined();
    expect(p3).toBeUndefined();
    expect(callCount).toBe(1);
    expect(lock.isLocked()).toBe(false);
  });

  it("unlocks even if the action throws an error", async () => {
    const lock = createSubmitLock();

    await expect(
      lock.runWithLock(async () => {
        throw new Error("Network error");
      })
    ).rejects.toThrow("Network error");

    expect(lock.isLocked()).toBe(false);

    // Can run again
    const next = await lock.runWithLock(async () => "recovered");
    expect(next).toBe("recovered");
  });
});
