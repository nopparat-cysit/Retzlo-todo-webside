export function sortProjectsByStarred<TProject extends { id: string }>(
  projects: TProject[],
  starredProjectIds: ReadonlySet<string>
) {
  return projects
    .map((project, index) => ({ project, index }))
    .sort((a, b) => {
      const aStarred = starredProjectIds.has(a.project.id);
      const bStarred = starredProjectIds.has(b.project.id);

      if (aStarred !== bStarred) {
        return aStarred ? -1 : 1;
      }

      return a.index - b.index;
    })
    .map(({ project }) => project);
}
