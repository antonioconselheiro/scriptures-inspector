import { KeyInterlinear } from './key-interlinear-type';
import { KeyMetadata } from './key-metadata-type';
import { LanguageUnionType } from './language-union-type';

export interface TargetMetadataDetail {
  source: string;
  languageSource: LanguageUnionType;
  languageTarget: string;
  target: KeyMetadata;
  interlinear?: KeyInterlinear;
}
