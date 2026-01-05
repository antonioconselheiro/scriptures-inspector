import { ProjectData } from './project-data-model';
import { ProjectStructure } from './project-structure-model';
import { ProjectTarget } from './project-target-model';

export interface Project {
  name: string;
  codex: Array<string>;
  target: ProjectTarget;
  structure: Array<ProjectStructure>;
  data?: Array<ProjectData>;
}
