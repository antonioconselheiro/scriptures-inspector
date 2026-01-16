import { LanguageUnionType } from './language-union-type';

export type TargetMetadataDetail = {
  source: string;
  languageSource: LanguageUnionType;
  languageTarget: string;
} & ({
  type: 'metadata';
  target: `${string}-metadata`;
} | {
  type: 'interlinear';
  target: `${string}-interlinear`;
});
