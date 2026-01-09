import { Project } from "@domain/project-model";

export function getProjectTargetsFn(project: Project): Array<string> {
    return project.structure.map(structure => {
      const targetCustomInterlinear = project.target.language.map(language => `${structure.metadataEditor.source}-custom-${language}-interlinear`);
      const targetCustomTranslation = structure.metadataEditor.customTranslationEditor ? project.target.language.map(language => `${structure.metadataEditor.source}-custom-${language}-translation`) : [];

    if (structure.interlinearEditor) {
      const targetInterlinearesCustomTranslation = structure.interlinearEditor
        .filter(interlinear => interlinear.customTranslationEditor)
        .map(interlinear => project.target.language.map(language => `${interlinear.source}-custom-${language}-translation`))
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