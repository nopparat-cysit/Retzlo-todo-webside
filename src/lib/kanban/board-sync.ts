/** Per-board synchronous interaction state. Revisions invalidate in-flight reads. */
export function createBoardSyncGuard() {
  let revision = 0;
  let dragging = false;
  let saving = false;
  const canSync = () => !dragging && !saving;
  return {
    canSync,
    isSaving: () => saving,
    startDrag() { dragging = true; revision++; },
    endDrag() { dragging = false; revision++; },
    startMutation() {
      if (saving || dragging) return false;
      saving = true;
      revision++;
      return true;
    },
    endMutation() { saving = false; revision++; },
    async sync<T>(read: () => Promise<T>, apply: (value: T) => void): Promise<boolean> {
      if (!canSync()) return false;
      const requestRevision = revision;
      const data = await read();
      if (!canSync() || requestRevision !== revision) return false;
      apply(data);
      return true;
    }
  };
}

export type BoardSyncGuard = ReturnType<typeof createBoardSyncGuard>;

export async function runBoardReorder(
  guard: BoardSyncGuard,
  request: () => Promise<{ ok: boolean }>,
  onSuccess: () => void,
  onFailure: () => void
): Promise<"success" | "failed" | "busy"> {
  if (!guard.startMutation()) return "busy";
  try {
    let ok = false;
    try { ok = (await request()).ok; } catch { /* Network failures use the same rollback path. */ }
    if (!ok) { onFailure(); return "failed"; }
    onSuccess();
    return "success";
  } finally {
    guard.endMutation();
  }
}
