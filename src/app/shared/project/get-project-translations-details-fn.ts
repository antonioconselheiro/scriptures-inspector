import { Codex } from '@domain/codex-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { ProjectStructureMetadata } from '@domain/project-structure-metadata-model';
import { ProjectTarget } from '@domain/project-target-model';

export function getProjectTranslationsDetailsFn(
  structures: Array<ProjectStructureMetadata>,
  target: ProjectTarget,
  codexMetadataRecord: Record<string, Codex<LanguageUnionType>>
): Array<{
  type: 'translation';
  source: string;
  languageSource: LanguageUnionType;
  languageTarget: string;
  target: `${string}-translation`;
}> {
  const targetResultset: Array<{
    type: 'translation';
    source: string;
    languageSource: LanguageUnionType;
    languageTarget: string;
    target: `${string}-translation`;
  }> = [];
  const results: { [key: string]: typeof targetResultset[0] } = {};

  structures.forEach(structure => {
    const { source, customTranslationTarget } = structure;

    if (customTranslationTarget) {
      results[customTranslationTarget] = {
        type: 'translation',
        source,
        target: customTranslationTarget,
        languageSource: codexMetadataRecord[source].language,
        languageTarget: target.language
      };
    }

    getProjectTranslationsDetailsFn(structure.interlinear || [], target, codexMetadataRecord)
      .forEach(detail => results[detail.target] = detail);
  });

  return Object.values(results);
}