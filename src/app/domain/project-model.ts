import { ProjectBook } from './project-book-model';
import { ProjectData } from './project-data-model';
import { ProjectStructure } from './project-structure-model';

export interface Project {
  name: string;
  /** traduções de apoio */
  referenceCodex: Array<string>;
  /** trabalho */
  workingCodex: Array<ProjectBook>;
  structure: ProjectStructure;
  data: Array<ProjectData>;
}
