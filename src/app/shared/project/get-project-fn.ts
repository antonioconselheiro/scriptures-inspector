import { Project } from "@domain/project-model";

export function getProjectFn(): Project | null {
  const session = sessionStorage.getItem('xenoglosproj');
  if (session) {
    try {
      return JSON.parse(session);
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  return null;
}
