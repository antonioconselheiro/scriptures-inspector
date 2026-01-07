import { Project } from "@domain/project-model";

export function getProjectSourcesFn(project: Project): Array<string> {
  return project.structure.map(structure => {
    if (structure.interlinearEditor) {
      return [
        structure.metadataEditor.source,
        ...structure.interlinearEditor.map(interlinear => interlinear.source)
      ];
    }

    return [structure.metadataEditor.source];
  }).flat();
}
