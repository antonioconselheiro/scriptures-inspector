import { ProjectData } from './project-data-model';
import { ProjectStructure } from './project-structure-model';

export interface Project {
  name: string;
  codex: Array<string>;
  structure: Array<ProjectStructure>;
  data?: Array<ProjectData>;
}
