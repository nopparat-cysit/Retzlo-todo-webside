"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BoardDangerTabProps {
  boardName: string;
  canManage: boolean;
  isDeleting: boolean;
  onDeleteClick: () => void;
}

export function BoardDangerTab({
  boardName,
  canManage,
  isDeleting,
  onDeleteClick
}: BoardDangerTabProps) {
  return (
    <div className="pt-3 mt-0">
      <div className="rounded-xl border border-red-300 bg-red-50/80 p-4 space-y-3 dark:border-red-500/30 dark:bg-red-500/10">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-red-300 bg-red-100 text-red-700 dark:border-red-500/40 dark:bg-red-500/20 dark:text-red-300">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-red-900 dark:text-red-200">Delete this Board</h4>
            <p className="text-xs text-red-700 dark:text-red-300/80 mt-1 leading-relaxed">
              Permanently remove &ldquo;{boardName}&rdquo; along with all its columns, cards, checklist items, and comments. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-red-200 dark:border-red-500/20 flex justify-end">
          <Button
            type="button"
            variant="danger"
            size="sm"
            className="text-xs font-semibold"
            disabled={!canManage || isDeleting}
            onClick={onDeleteClick}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete Board
          </Button>
        </div>
      </div>
    </div>
  );
}
