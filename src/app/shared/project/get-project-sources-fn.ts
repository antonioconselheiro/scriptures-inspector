import { ProjectStructureInterlinear } from '@domain/project-structure-interlinear-model';
import { ProjectStructureMetadata } from '@domain/project-structure-metadata-model';

export function getProjectSourcesFn(structures: Array<ProjectStructureMetadata | ProjectStructureInterlinear>): Array<string> {
  let sources: Array<string> = [];
  structures.forEach(structure => {
    sources.push(structure.source);

    if (structure.interlinear) {
      sources = [...sources, ...getProjectSourcesFn(structure.interlinear)];
    }
  });

  return [...new Set(sources)];
}