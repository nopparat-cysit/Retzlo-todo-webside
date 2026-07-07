-- Add explicit default card status to each kanban column.
ALTER TABLE "Column" ADD COLUMN "defaultCardStatus" TEXT NOT NULL DEFAULT 'TODO';

UPDATE "Column"
SET "defaultCardStatus" = CASE
  WHEN "name" = 'Backlog' THEN 'TODO'
  WHEN "name" = 'In Progress' THEN 'DOING'
  WHEN "name" = 'Done' THEN 'DONE'
  ELSE 'TODO'
END;