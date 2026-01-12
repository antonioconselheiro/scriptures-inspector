import { ProjectData } from './project-data-model';
import { ProjectRepositoryModel } from './project-repository-model';
import { ProjectStructure } from './project-structure-model';
import { ProjectTarget } from './project-target-model';

export interface Project {
  name: string;
  readonly path: string;
  repositories: Array<ProjectRepositoryModel>
  codex: Array<string>;
  target: ProjectTarget;
  structure: Array<ProjectStructure>;
  data?: Array<ProjectData>;
}
