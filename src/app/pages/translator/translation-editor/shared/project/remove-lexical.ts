import { BookMetadataAttributes } from '@domain/book-metadata-attributes-model';
import { MorphemeType } from '@domain/morpheme-type';

export function removeLexical(metadata: BookMetadataAttributes, key: string, type: MorphemeType): void {
  const entry = metadata.lexical[key];
  if (type === 'root') {
    if (entry.prefix) entry.value = entry.prefix;
    else if (entry.suffix) entry.value = entry.suffix;
    else delete metadata.lexical[key];
  } else {
    delete entry[type];
  }
}
