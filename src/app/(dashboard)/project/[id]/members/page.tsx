import { redirect } from "next/navigation";

export default function MembersPage({ params }: { params: { id: string } }) {
  redirect(`/project/${params.id}/board`);
}
