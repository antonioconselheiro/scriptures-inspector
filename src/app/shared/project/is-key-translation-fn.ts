import { KeyTranslation } from '@domain/key-translation-type';

export function isKeyTranslationFn(key: string): key is KeyTranslation {
  return /-translation$/.test(key);
}
