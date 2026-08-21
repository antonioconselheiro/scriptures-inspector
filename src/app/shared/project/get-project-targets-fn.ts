import { KeyInterlinear } from '@domain/key-interlinear-type';
import { KeyMetadata } from '@domain/key-metadata-type';
import { KeyTranslation } from '@domain/key-translation-type';
import { ProjectStructureInterlinear } from '@domain/project-structure-interlinear-model';
import { ProjectStructureMetadata } from '@domain/project-structure-metadata-model';

export function getProjectTargetsFn(structures: Array<ProjectStructureMetadata | ProjectStructureInterlinear>): Array<KeyMetadata | KeyInterlinear | KeyTranslation> {
  let targets: Array<KeyMetadata | KeyInterlinear | KeyTranslation> = [];
  structures.forEach(structure => {
    targets.push(structure.metadataTarget);
    
    if (structure.customTranslationTarget) {
      targets.push(structure.customTranslationTarget);
    }

    if ('interlinearTarget' in structure && structure.interlinearTarget) {
      targets.push(structure.interlinearTarget);
    }

    if (structure.interlinear) {
      targets = [...targets, ...getProjectTargetsFn(structure.interlinear)];
    }
  });

  return [...new Set(targets)];
}
