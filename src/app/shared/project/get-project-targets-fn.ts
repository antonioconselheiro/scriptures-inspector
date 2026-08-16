import { KeyInterlinear } from '@domain/key-interlinear-type';
import { KeyMetadata } from '@domain/key-metadata-type';
import { KeyTranslation } from '@domain/key-translation-type';
import { Project } from '@domain/project-model';

export function getProjectTargetsFn(project: Project): Array<KeyMetadata | KeyInterlinear | KeyTranslation> {
  return project.structures.map(structure => {
    if (structure.interlinear) {
      return [
        structure.metadataTarget,
        structure.customTranslationTarget,
        ...structure.interlinear.map(interlinear => [interlinear.metadataTarget, interlinear.interlinearTarget, interlinear.customTranslationTarget]).flat()
      ];
    }

    return [
      structure.metadataTarget,
      structure.customTranslationTarget
    ];
  }).flat().filter(v => !!v);
}
