import { KeyInterlinear } from '@domain/key-interlinear-type';
import { KeyMetadata } from '@domain/key-metadata-type';
import { KeyTranslation } from '@domain/key-translation-type';
import { Project } from '@domain/project-model';

export function getProjectTargetsFn(project: Project): Array<KeyMetadata | KeyInterlinear | KeyTranslation> {
  return project.structure.map(structure => {
    if (structure.interlinear) {
      return [
        structure.metadata.metadataTarget,
        structure.metadata.customTranslationTarget,
        ...structure.interlinear.map(interlinear => [interlinear.interlinearTarget, interlinear.customTranslation]).flat()
      ];
    }

    return [
      structure.metadata.metadataTarget,
      structure.metadata.customTranslationTarget
    ];
  }).flat().filter(v => !!v);
}
