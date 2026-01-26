import { Codex } from '@domain/codex-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { Project } from '@domain/project-model';
import { TargetMetadataDetail } from '@domain/target-metadata-detail-model';

export function getProjectTargetsMetadataDetailsFn(
  project: Project, codexMetadataRecord: Record<string, Codex<LanguageUnionType>>
): Array<TargetMetadataDetail> {
  const targetResultset: Array<TargetMetadataDetail> = [];

  project.structure.forEach(structure => {
    const { source, target } = structure.metadataEditor;
    console.info('source:', source);
    targetResultset.push({
      type: 'metadata',
      source,
      target,
      languageSource: codexMetadataRecord[source].language,
      languageTarget: project.target.language
    });

    if (structure.interlinearEditor) {
      structure.interlinearEditor.forEach(interlinear => {
        const { source, target } = interlinear;
        console.info('source:', source);
        targetResultset.push({
          type: 'interlinear',
          source,
          target,
          languageSource: codexMetadataRecord[source].language,
          languageTarget: project.target.language
        });
      });
    }
  });

  return targetResultset;
}