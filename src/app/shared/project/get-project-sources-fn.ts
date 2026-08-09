import { Project } from '@domain/project-model';

export function getProjectSourcesFn(project: Project): Array<string> {
  return project.structure.map(structure => {
    if (structure.interlinear) {
      return [
        structure.metadata.source,
        ...structure.interlinear.map(interlinear => interlinear.source)
      ];
    }

    return [structure.metadata.source];
  }).flat();
}
