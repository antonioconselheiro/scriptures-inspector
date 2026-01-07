import { Project } from "@domain/project-model";

export function setProjectFn(project: Project): void {
  sessionStorage.setItem('xenoglosproj', JSON.stringify(project))
}
