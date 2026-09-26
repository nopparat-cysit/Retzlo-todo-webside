"use client";

import { useState, useEffect } from "react";
import { KanbanBoard } from "@/components/kanban/board";
import { BoardNotesRail } from "@/components/notes/board-notes-rail";
import type { CardAssignee, ColumnWithCards } from "@/types/kanban";
import type { ProjectNote } from "@/types/note";

interface BoardViewContainerProps {
  board: {
    id: string;
    name: string;
    projectId?: string;
    columns: ColumnWithCards[];
  };
  members: CardAssignee[];
  currentUserId: string;
  notesEnabled: boolean;
  initialNotes: ProjectNote[];
  availableBoards: Array<{ id: string; name: string }>;
  projectId: string;
}

export function BoardViewContainer({
  board,
  members,
  currentUserId,
  notesEnabled,
  initialNotes,
  availableBoards,
  projectId
}: BoardViewContainerProps) {
  const [mounted, setMounted] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");

  useEffect(() => {
    setMounted(true);
    const savedNotesState = localStorage.getItem("kanban_notes_open");
    if (savedNotesState !== null) {
      setIsNotesOpen(savedNotesState === "true");
    }

    const savedDensity = localStorage.getItem("kanban_card_density");
    if (savedDensity === "compact" || savedDensity === "comfortable") {
      setDensity(savedDensity);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined" && board.id) {
      document.cookie = `project_${projectId}_last_board=${board.id}; path=/; max-age=31536000; SameSite=Lax`;
      try {
        localStorage.setItem(`project_${projectId}_last_board`, board.id);
      } catch {}
    }
  }, [projectId, board.id]);

  const handleToggleNotes = () => {
    setIsNotesOpen((prev) => {
      const next = !prev;
      localStorage.setItem("kanban_notes_open", String(next));
      return next;
    });
  };

  const handleToggleDensity = () => {
    setDensity((prev) => {
      const next = prev === "comfortable" ? "compact" : "comfortable";
      localStorage.setItem("kanban_card_density", next);
      return next;
    });
  };

  const showNotesRail = notesEnabled && isNotesOpen;

  return (
    <div
      className={
        showNotesRail
          ? "board-page-grid grid flex-1 min-h-0 min-w-0 max-w-full gap-3 xl:grid-cols-[minmax(0,1fr)_340px]"
          : "board-page-grid flex flex-1 min-h-0 min-w-0 max-w-full"
      }
    >
      <div className="flex-1 min-h-0 min-w-0 max-w-full overflow-hidden">
        <KanbanBoard
          key={`board-${board.id}`}
          board={board}
          members={members}
          currentUserId={currentUserId}
          notesEnabled={notesEnabled}
          isNotesOpen={isNotesOpen}
          notesCount={initialNotes.length}
          onToggleNotes={handleToggleNotes}
          density={density}
          onToggleDensity={handleToggleDensity}
        />
      </div>

      {showNotesRail ? (
        <aside className="hidden xl:flex min-h-0 w-[340px] flex-col overflow-hidden animate-in fade-in slide-in-from-right-2 duration-200">
          <BoardNotesRail
            key={`notes-${board.id}`}
            projectId={projectId}
            activeBoardId={board.id}
            activeBoardName={board.name}
            availableBoards={availableBoards}
            initialNotes={initialNotes}
            onClose={() => {
              setIsNotesOpen(false);
              localStorage.setItem("kanban_notes_open", "false");
            }}
          />
        </aside>
      ) : null}
    </div>
  );
}
