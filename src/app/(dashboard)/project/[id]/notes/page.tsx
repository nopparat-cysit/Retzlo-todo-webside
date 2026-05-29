import { NotesPanel } from "@/components/notes/notes-panel";
import { prisma } from "@/lib/prisma";
import { normalizeCardColor } from "@/lib/theme/card-colors";
import type { ProjectNote } from "@/types/note";

function toProjectNotes(notes: Array<{
  id: string;
  title: string;
  content: string;
  color: string;
  isStarred: boolean;
  dueDate: Date | null;
  dueDateAllDay: boolean;
  projectId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    name: string | null;
    email: string;
  };
}>): ProjectNote[] {
  return notes.map((note) => ({
    ...note,
    color: normalizeCardColor(note.color),
    dueDate: note.dueDate ? note.dueDate.toISOString() : null,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString()
  }));
}

export default async function NotesPage({ params }: { params: { id: string } }) {
  const notes = await prisma.note.findMany({
    where: { projectId: params.id },
    include: {
      author: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return <NotesPanel projectId={params.id} initialNotes={toProjectNotes(notes)} />;
}
