import { ProjectBook } from './project-book-model';
import { ProjectStructure } from './project-structure-model';

export interface Project {
  name: string;
  /** traduções de apoio */
  referenceBooks: Array<string>;
  /** trabalho */
  workingBooks: Array<ProjectBook>;
  structure: ProjectStructure;
}
