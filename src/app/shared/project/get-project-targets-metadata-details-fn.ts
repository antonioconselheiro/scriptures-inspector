import { Codex } from '@domain/codex-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { Project } from '@domain/project-model';
import { TargetMetadataDetail } from '@domain/target-metadata-detail-model';

export function getProjectTargetsMetadataDetailsFn(
  project: Project, codexMetadataRecord: Record<string, Codex<LanguageUnionType>>
): Array<TargetMetadataDetail> {
  const targetResultset: Array<TargetMetadataDetail> = [];
  const indexNotFound = -1;

  project.structure.forEach(structure => {
    const { source, metadataTarget: target } = structure;
    const indexMetadata = targetResultset.findIndex(target => target.source === source);

    if (indexMetadata === indexNotFound) {
      targetResultset.push({
        source,
        target,
        languageSource: codexMetadataRecord[source].language,
        languageTarget: project.target.language
      });
    }
  });

  return targetResultset;
}