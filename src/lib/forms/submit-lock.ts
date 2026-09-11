/**
 * Pure synchronous lock helper to guard against rapid double-clicks,
 * repeated Enter keys, and concurrent duplicate submissions.
 */
export function createSubmitLock() {
  let isLocked = false;

  async function runWithLock<T>(action: () => Promise<T>): Promise<T | undefined> {
    if (isLocked) {
      return undefined;
    }

    isLocked = true;
    try {
      return await action();
    } finally {
      isLocked = false;
    }
  }

  return {
    runWithLock,
    isLocked: () => isLocked
  };
}
