import { ProjectBook } from './project-book-model';
import { ProjectSchemas } from './project-schemas-model';

export interface Project {
  name: string;
  /** traduções de apoio */
  referenceBooks: Array<string>;
  /** trabalho */
  workingBooks: Array<ProjectBook>;
  schemes: ProjectSchemas;
}
