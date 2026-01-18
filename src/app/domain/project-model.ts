import { ProjectStructure } from './project-structure-model';
import { ProjectTarget } from './project-target-model';

export interface Project {
  name: string;
  readonly path: string;
  repositories: { [alias: string]: string };
  codex: Array<string>;
  target: ProjectTarget;
  translationViewer: Array<string>;
  structure: Array<ProjectStructure>;
}
