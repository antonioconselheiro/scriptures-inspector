import { Project } from "@domain/project-model";

export function getProjectTargetsFn(project: Project): Array<string> {
    return project.structure.map(structure => {
      const targetCustomInterlinear = `${structure.metadataEditor.source}-custom-${project.target.language}-interlinear`;
      const targetCustomTranslation = structure.metadataEditor.customTranslationEditor ? [`${structure.metadataEditor.source}-custom-${project.target.language}-translation`] : [];

    if (structure.interlinearEditor) {
      const targetInterlinearesCustomTranslation = structure.interlinearEditor
        .filter(interlinear => interlinear.customTranslationEditor)
        .map(interlinear => `${interlinear.source}-custom-${project.target.language}-translation`)
        .flat();

      return [
        ...targetCustomInterlinear,
        ...targetCustomTranslation,
        ...structure.interlinearEditor.map(interlinear => `${structure.metadataEditor.source}-${interlinear.source}-interlinear`),
        ...targetInterlinearesCustomTranslation
      ];
    }

    return [
      ...targetCustomTranslation,
      ...targetCustomInterlinear
    ];
  }).flat();
}