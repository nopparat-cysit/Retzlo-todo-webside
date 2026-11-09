import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

describe("Skeleton Responsive Layout & Mobile Shift Contracts", () => {
  const skeletonSource = readFileSync(join(process.cwd(), "src/components/ui/skeleton.tsx"), "utf8");
  const boardLoadingSource = readFileSync(join(process.cwd(), "src/app/(dashboard)/project/[id]/board/loading.tsx"), "utf8");
  const projectsLoadingSource = readFileSync(join(process.cwd(), "src/app/(dashboard)/projects/loading.tsx"), "utf8");

  const diaryLoadingPath = join(process.cwd(), "src/app/(dashboard)/project/[id]/diary/loading.tsx");
  const notesLoadingPath = join(process.cwd(), "src/app/(dashboard)/project/[id]/notes/loading.tsx");

  it("ensures ColumnSkeleton uses adaptive mobile width matching column.tsx", () => {
    expect(skeletonSource).toContain("w-full sm:w-80 shrink-0");
  });

  it("renders mobile quick-jump column skeleton pills in BoardSkeleton", () => {
    expect(skeletonSource).toContain("Mobile segmented column tabs skeleton");
    expect(skeletonSource).toContain("sm:hidden flex items-center gap-1 p-1 rounded-xl");
  });

  it("updates ProjectCardSkeleton with responsive cover and launch action bar matching ProjectCard", () => {
    expect(skeletonSource).toContain("relative h-28 sm:h-32 w-full overflow-hidden border-b border-white/10");
    expect(skeletonSource).toContain("h-8.5 flex-1 rounded-lg");
    expect(skeletonSource).not.toContain("min-h-[420px]");
  });

  it("fits CalendarSkeleton month cells to mobile screen without cut-off", () => {
    expect(skeletonSource).toContain("min-h-[52px] sm:min-h-[120px]");
    expect(skeletonSource).toContain("flex sm:hidden items-center justify-center gap-1 mt-auto pt-1");
  });

  it("provides responsive grid layout in MembersSkeleton", () => {
    expect(skeletonSource).toContain("grid-cols-2 sm:grid-cols-3 lg:grid-cols-5");
    expect(skeletonSource).toContain("export function MembersSkeleton()");
  });

  it("exports DiarySkeleton matching diary-list-panel layout", () => {
    expect(skeletonSource).toContain("export function DiarySkeleton()");
    expect(skeletonSource).toContain("grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] lg:grid-rows-[auto_minmax(0,1fr)]");
    expect(skeletonSource).toContain("flex lg:hidden rounded-xl border border-white/10 bg-ink-950/40");
  });

  it("exports NotesSkeleton matching notes-panel layout", () => {
    expect(skeletonSource).toContain("export function NotesSkeleton()");
    expect(skeletonSource).toContain("grid min-h-0 gap-3 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]");
    expect(skeletonSource).toContain("hidden lg:flex min-h-0 flex-col rounded-2xl");
  });

  it("hides notes rail on mobile and uses responsive header in board/loading.tsx", () => {
    expect(boardLoadingSource).toContain("lofi-panel hidden xl:flex min-h-0 flex-col rounded-2xl");
    expect(boardLoadingSource).toContain("flex flex-col sm:flex-row sm:items-center justify-between");
  });

  it("prioritizes project cards over sidebar on mobile in projects/loading.tsx", () => {
    expect(projectsLoadingSource).toContain("order-2 lg:order-1");
    expect(projectsLoadingSource).toContain("order-1 lg:order-2");
  });

  it("creates streaming loading.tsx for diary and notes routes", () => {
    expect(existsSync(diaryLoadingPath)).toBe(true);
    expect(existsSync(notesLoadingPath)).toBe(true);

    const diarySource = readFileSync(diaryLoadingPath, "utf8");
    const notesSource = readFileSync(notesLoadingPath, "utf8");

    expect(diarySource).toContain("DiarySkeleton");
    expect(diarySource).toContain("export default function DiaryLoading()");

    expect(notesSource).toContain("NotesSkeleton");
    expect(notesSource).toContain("export default function NotesLoading()");
  });
});
