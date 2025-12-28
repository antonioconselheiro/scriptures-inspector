import { ProjectBook } from './project-book-model';
import { ProjectData } from './project-data-model';
import { ProjectStructure } from './project-structure-model';

export interface Project {
  name: string;
  /** traduções de apoio */
  referenceBooks: Array<string>;
  /** trabalho */
  workingBooks: Array<ProjectBook>;
  structure: ProjectStructure;
  data: Array<ProjectData>;
}
