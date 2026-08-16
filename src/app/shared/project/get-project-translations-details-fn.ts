import { Codex } from '@domain/codex-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { Project } from '@domain/project-model';

export function getProjectTranslationsDetailsFn(
  project: Project, codexMetadataRecord: Record<string, Codex<LanguageUnionType>>
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
  const indexNotFound = -1;

  project.structure.forEach(structure => {
    const { source, customTranslationTarget } = structure;
    const indexMetadata = targetResultset.findIndex(target => target.source === source);

    if (indexMetadata === indexNotFound && customTranslationTarget) {
      targetResultset.push({
        type: 'translation',
        source,
        target: customTranslationTarget,
        languageSource: codexMetadataRecord[source].language,
        languageTarget: project.target.language
      });
    }

    if (structure.interlinear) {
      structure.interlinear.forEach(interlinear => {
        const { source, customTranslationTarget } = interlinear;
        const indexInterlinear = targetResultset.findIndex(target => target.source === source);

        if (indexInterlinear === indexNotFound && customTranslationTarget) {
          targetResultset.push({
            type: 'translation',
            source,
            target: customTranslationTarget,
            languageSource: codexMetadataRecord[source].language,
            languageTarget: project.target.language
          });
        }
      });
    }
  });

  return targetResultset;
}