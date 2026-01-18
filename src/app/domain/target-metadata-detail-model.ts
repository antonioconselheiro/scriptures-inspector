import { KeyInterlinear } from './key-interlinear-type';
import { KeyMetadata } from './key-metadata-type';
import { LanguageUnionType } from './language-union-type';

export type TargetMetadataDetail = {
  source: string;
  languageSource: LanguageUnionType;
  languageTarget: string;
} & ({
  type: 'metadata';
  target: KeyMetadata;
} | {
  type: 'interlinear';
  target: KeyInterlinear;
});
