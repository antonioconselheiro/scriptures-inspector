import { KeyInterlinear } from './key-interlinear-type';
import { KeyTranslation } from './key-translation-type';

export interface ProjectStructureInterlinear {
  source: string;
  target: KeyInterlinear;
  customTranslation: KeyTranslation | null;
}
