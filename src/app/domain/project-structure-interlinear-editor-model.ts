import { KeyInterlinear } from './key-interlinear-type';
import { KeyTranslation } from './key-translation-type';

export interface ProjectStructureInterlinearEditor {
  source: string;
  target: KeyInterlinear;
  customTranslationEditor: KeyTranslation | null;
}
