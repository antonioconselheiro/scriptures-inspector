export interface ProjectStructureMetadata {
  source: string;
  target: `${string}-metadata`;
  customTranslation: `${string}-translation` | null;
}
