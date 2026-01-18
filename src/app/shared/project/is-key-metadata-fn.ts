import { KeyMetadata } from '@domain/key-metadata-type';

export function isKeyMetadataFn(key: string): key is KeyMetadata {
  return /-metadata$/.test(key);
}
