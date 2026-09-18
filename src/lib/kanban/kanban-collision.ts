import { closestCorners, getFirstCollision, pointerWithin, rectIntersection, type CollisionDetection } from "@dnd-kit/core";
import type { CardCollisionTarget } from "./drag-session";

export interface ColumnSummary { id: string; cards: { id: string }[] }
interface Point { x: number; y: number }
interface Bounds { left: number; right: number; top: number; bottom: number }
interface FrameScheduler {
  requestFrame: (callback: () => void) => number;
  cancelFrame: (frame: number) => void;
}
export type KanbanCollisionDetection = CollisionDetection & {
  getCardTarget: () => CardCollisionTarget | null;
  getColumnTarget: () => string | null;
  clearIfOutside: (point: Point) => void;
  reset: () => void;
};
const contains = (rect: Bounds, point: Point) =>
  point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;

/** Card collisions belong to a receiving zone; column sorting is a separate mode. */
export function createKanbanCollisionDetection(
  getColumns: () => ColumnSummary[],
  frames: FrameScheduler = {
    requestFrame: callback => typeof requestAnimationFrame === "undefined" ? 0 : requestAnimationFrame(callback),
    cancelFrame: frame => { if (typeof cancelAnimationFrame !== "undefined") cancelAnimationFrame(frame); }
  }
): KanbanCollisionDetection {
  let target: CardCollisionTarget | null = null;
  let columnTarget: string | null = null;
  let cached: { id: string; zoneId: string; bounds: Bounds } | null = null;
  let expiry: number | null = null;
  const reset = () => {
    if (expiry !== null) frames.cancelFrame(expiry);
    expiry = null;
    target = null;
    columnTarget = null;
    cached = null;
  };

  const detect: CollisionDetection = args => {
    if (args.active.data.current?.type === "column") {
      reset();
      const columnArgs = { ...args, droppableContainers: args.droppableContainers.filter(item => item.data.current?.type === "column") };
      const pointerHits = args.pointerCoordinates ? pointerWithin(columnArgs) : [];
      if (args.pointerCoordinates && pointerHits.length === 0) return [];
      const hits = closestCorners(columnArgs);
      const hitId = getFirstCollision(hits, "id");
      const containingId = getFirstCollision(pointerHits, "id") ?? hitId;
      const bounds = containingId == null ? null : args.droppableRects.get(containingId);
      if (hitId != null && bounds) {
        columnTarget = String(hitId);
        cached = { id: String(hitId), zoneId: String(containingId), bounds };
      }
      return hits;
    }
    const zones = args.droppableContainers.filter(item => item.data.current?.type === "card-container");
    const zoneArgs = { ...args, droppableContainers: zones };
    // A pointer outside all zones must not fall back to a neighboring column.
    const hits = args.pointerCoordinates ? pointerWithin(zoneArgs) : rectIntersection(zoneArgs);
    const zoneId = getFirstCollision(hits, "id");
    if (zoneId == null) {
      const measuringCachedZone = cached && !args.droppableRects.has(cached.zoneId);
      if (measuringCachedZone && args.pointerCoordinates && contains(cached!.bounds, args.pointerCoordinates)) {
        if (expiry === null) expiry = frames.requestFrame(reset);
        return [{ id: cached!.id }];
      }
      reset();
      return [];
    }

    const zone = zones.find(item => item.id === zoneId)!;
    const bounds = args.droppableRects.get(zoneId)!;
    const columnId = zone.data.current?.columnId;
    const column = getColumns().find(item => item.id === columnId);
    if (!column || typeof columnId !== "string") { reset(); return []; }
    if (expiry !== null) frames.cancelFrame(expiry);
    expiry = null;

    const point = args.pointerCoordinates ?? {
      x: args.collisionRect.left + args.collisionRect.width / 2,
      y: args.collisionRect.top + args.collisionRect.height / 2
    };
    const cards = zone.data.current?.collapsed ? [] : column.cards
      .filter(card => `card:${card.id}` !== String(args.active.id))
      .map(card => ({ card, rect: args.droppableRects.get(`card:${card.id}`) }))
      .filter((item): item is { card: { id: string }; rect: NonNullable<typeof item.rect> } => Boolean(item.rect));
    const direct = cards.find(item => contains(item.rect, point));
    const next = direct ?? cards.find(item => point.y < item.rect.top + item.rect.height / 2);
    if (next) {
      const placement = point.y < next.rect.top + next.rect.height / 2 ? "before" : "after";
      target = { columnId, cardId: next.card.id, placement };
      cached = { id: `card:${next.card.id}`, zoneId: String(zoneId), bounds };
    } else {
      target = { columnId, placement: "append" };
      cached = { id: String(zoneId), zoneId: String(zoneId), bounds };
    }
    return [{ id: cached.id }];
  };
  return Object.assign(detect, {
    getCardTarget: () => target,
    getColumnTarget: () => columnTarget,
    clearIfOutside: (point: Point) => { if (!cached || !contains(cached.bounds, point)) reset(); },
    reset
  });
}
