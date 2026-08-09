import { KeyInterlinear } from '@domain/key-interlinear-type';
import { KeyMetadata } from '@domain/key-metadata-type';
import { KeyTranslation } from '@domain/key-translation-type';
import { Project } from '@domain/project-model';

export function getProjectTargetsFn(project: Project): Array<KeyMetadata | KeyInterlinear | KeyTranslation> {
  return project.structure.map(structure => {
    if (structure.interlinear) {
      return [
        structure.metadata.target,
        structure.metadata.customTranslation,
        ...structure.interlinear.map(interlinear => [interlinear.target, interlinear.customTranslation]).flat()
      ];
    }

    return [
      structure.metadata.target,
      structure.metadata.customTranslation
    ];
  }).flat().filter(v => !!v);
}
