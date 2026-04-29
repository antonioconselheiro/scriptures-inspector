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
    const { source, customTranslationEditor } = structure.metadataEditor;
    const indexMetadata = targetResultset.findIndex(target => target.source === source);

    if (indexMetadata === indexNotFound && customTranslationEditor) {
      targetResultset.push({
        type: 'translation',
        source,
        target: customTranslationEditor,
        languageSource: codexMetadataRecord[source].language,
        languageTarget: project.target.language
      });
    }

    if (structure.interlinearEditor) {
      structure.interlinearEditor.forEach(interlinear => {
        const { source, customTranslationEditor } = interlinear;
        const indexInterlinear = targetResultset.findIndex(target => target.source === source);

        if (indexInterlinear === indexNotFound && customTranslationEditor) {
          targetResultset.push({
            type: 'translation',
            source,
            target: customTranslationEditor,
            languageSource: codexMetadataRecord[source].language,
            languageTarget: project.target.language
          });
        }
      });
    }
  });

  return targetResultset;
}