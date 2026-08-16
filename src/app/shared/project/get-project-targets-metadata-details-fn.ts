import { Codex } from '@domain/codex-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { ProjectStructureMetadata } from '@domain/project-structure-metadata-model';
import { ProjectTarget } from '@domain/project-target-model';
import { TargetMetadataDetail } from '@domain/target-metadata-detail-model';

export function getProjectTargetsMetadataDetailsFn(
  structures: Array<ProjectStructureMetadata>,
  target: ProjectTarget,
  codexMetadataRecord: Record<string, Codex<LanguageUnionType>>
): Array<TargetMetadataDetail> {
  const targetResultset: { [key: string]: TargetMetadataDetail } = {};

  structures.forEach(structure => {
    const { source, metadataTarget } = structure;

    targetResultset[source] = {
      source,
      target: metadataTarget,
      languageSource: codexMetadataRecord[source].language,
      languageTarget: target.language
    };

    if (structure.interlinear) {
      getProjectTargetsMetadataDetailsFn(structure.interlinear || [], target, codexMetadataRecord)
        .forEach(detail => targetResultset[detail.source] = detail);
    }
  });

  return Object.values(targetResultset);
}