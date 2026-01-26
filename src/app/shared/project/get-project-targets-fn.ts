import { KeyInterlinear } from '@domain/key-interlinear-type';
import { KeyMetadata } from '@domain/key-metadata-type';
import { KeyTranslation } from '@domain/key-translation-type';
import { Project } from '@domain/project-model';

export function getProjectTargetsFn(project: Project): Array<KeyMetadata | KeyInterlinear | KeyTranslation> {
  return project.structure.map(structure => {
    if (structure.interlinearEditor) {
      return [
        structure.metadataEditor.target,
        structure.metadataEditor.customTranslationEditor,
        ...structure.interlinearEditor.map(interlinear => [interlinear.target, interlinear.customTranslationEditor]).flat()
      ];
    }

    return [
      structure.metadataEditor.target,
      structure.metadataEditor.customTranslationEditor
    ];
  }).flat().filter(v => !!v);
}
