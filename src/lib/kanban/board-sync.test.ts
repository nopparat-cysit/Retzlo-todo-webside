import { afterEach, describe, expect, it, vi } from "vitest";
import { createBoardSyncGuard, runBoardReorder } from "./board-sync";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(yes => { resolve = yes; });
  return { promise, resolve };
}
afterEach(() => vi.useRealTimers());

describe("board sync guard", () => {
  it.each(["drag", "cancel", "save"] as const)("discards GET started before %s", async kind => {
    const guard = createBoardSyncGuard();
    const get = deferred<string>();
    const applied: string[] = [];
    const sync = guard.sync(() => get.promise, value => applied.push(value));
    guard.startDrag();
    if (kind !== "drag") guard.endDrag();
    if (kind === "save") { guard.startMutation(); guard.endMutation(); }
    get.resolve("old board");
    expect(await sync).toBe(false);
    expect(applied).toEqual([]);
    if (kind === "drag") guard.endDrag();
    expect(await guard.sync(async () => "fresh board", value => applied.push(value))).toBe(true);
    expect(applied).toEqual(["fresh board"]);
  });

  it("blocks GET during dragging and throughout a save longer than the polling interval", async () => {
    vi.useFakeTimers();
    const guard = createBoardSyncGuard();
    guard.startDrag();
    let fetches = 0;
    const fetch = async () => { fetches++; return "board"; };
    expect(await guard.sync(fetch, () => {})).toBe(false);
    guard.endDrag();
    const patch = deferred<{ ok: boolean }>();
    const outcomes: string[] = [];
    const saving = runBoardReorder(guard, () => patch.promise, () => outcomes.push("success"), () => outcomes.push("rollback"));
    await vi.advanceTimersByTimeAsync(7500);
    expect(guard.canSync()).toBe(false);
    expect(await guard.sync(fetch, () => {})).toBe(false);
    expect(fetches).toBe(0);
    patch.resolve({ ok: true });
    expect(await saving).toBe("success");
    expect(outcomes).toEqual(["success"]);
    expect(guard.canSync()).toBe(true);
  });

  it.each(["http", "network"])("rolls back %s failures exactly once and unlocks for fresh sync", async failure => {
    const guard = createBoardSyncGuard();
    const outcomes: string[] = [];
    const result = await runBoardReorder(guard, async () => {
      if (failure === "network") throw new Error("offline");
      return { ok: false };
    }, () => outcomes.push("history and success toast"), () => outcomes.push("rollback and error toast"));
    expect(result).toBe("failed");
    expect(outcomes).toEqual(["rollback and error toast"]);
    expect(guard.canSync()).toBe(true);
  });

  it("rejects a second reorder while the first is pending", async () => {
    const guard = createBoardSyncGuard();
    const patch = deferred<{ ok: boolean }>();
    const first = runBoardReorder(guard, () => patch.promise, () => {}, () => {});
    let requests = 0;
    expect(await runBoardReorder(guard, async () => { requests++; return { ok: true }; }, () => {}, () => {})).toBe("busy");
    expect(requests).toBe(0);
    patch.resolve({ ok: true });
    await first;
  });
});
