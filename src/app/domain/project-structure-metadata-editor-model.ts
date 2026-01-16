export interface ProjectStructureMetadataEditor {
  source: string;
  target: `${string}-metadata`;
  customTranslationEditor: `${string}-translation` | null;
}

