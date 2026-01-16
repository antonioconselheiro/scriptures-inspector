import { KeyInterlinear } from './key-interlinear-type';
import { KeyTranslation } from './key-translation-type';

export interface TranslationInterlinear {
  target: KeyInterlinear;
  customTranslation?: KeyTranslation;
}
