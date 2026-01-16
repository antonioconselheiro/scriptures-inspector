import { Codex } from "@domain/codex-model";
import { LanguageUnionType } from "@domain/language-union-type";
import { Project } from "@domain/project-model";

export function getProjectTargetsFn(project: Project, codexMetadataRecord: Record<string, Codex<LanguageUnionType>>): Array<{
  source: string,
  target: string,
  langSource: LanguageUnionType,
  langTarget: string
}> {
  const indexNotFound = -1;
  const targetResultset: Array<{ source: string, target: string, langSource: LanguageUnionType, langTarget: string }> = [];
  project.structure.forEach(structure => {
    const { source, target } = structure.metadataEditor;
    targetResultset.push({
      source, target,
      langSource: codexMetadataRecord[source].lang,
      langTarget: project.target.language
    });

    if (structure.metadataEditor.customTranslationEditor) {
      targetResultset.push({
        source, target: structure.metadataEditor.customTranslationEditor,
        langSource: codexMetadataRecord[source].lang,
        langTarget: project.target.language
      });
    }

    if (structure.interlinearEditor) {
      structure.interlinearEditor.forEach(interlinear => {
        const { source, target } = interlinear;
        targetResultset.push({
          source, target,
          langSource: codexMetadataRecord[source].lang,
          langTarget: project.target.language
        });

        if (interlinear.customTranslationEditor) {
          const index = targetResultset.findIndex(resultset => interlinear.customTranslationEditor === resultset.target);
          if (index === indexNotFound) {
            targetResultset.push({
              source,
              target: interlinear.customTranslationEditor,
              langSource: codexMetadataRecord[source].lang,
              langTarget: project.target.language
            });
          }
        }
      });
    }
  });

  return targetResultset;
}