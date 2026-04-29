import { LanguageUnionType } from './language-union-type';

export type TargetTranslationMetadataDetail = {
  type: 'translation';
  source: string;
  languageSource: LanguageUnionType;
  languageTarget: string;
  target: `${string}-translation`;
}
