import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { BookInterlinearTarget } from '@domain/book-interlinear-target-model';
import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { KeyInterlinear } from '@domain/key-interlinear-type';
import { KeyMetadata } from '@domain/key-metadata-type';
import { KeyTranslation } from '@domain/key-translation-type';
import { firstValueFrom } from 'rxjs';

export function loadTargetBookFn(target: KeyMetadata, book: string): Promise<BookMetadataTarget | null>;
export function loadTargetBookFn(target: KeyTranslation, book: string): Promise<BookTranslationTarget | null>;
export function loadTargetBookFn(target: KeyInterlinear, book: string): Promise<BookInterlinearTarget | null>;
export function loadTargetBookFn(target: KeyMetadata | KeyTranslation | KeyInterlinear, book: string): Promise<
  BookMetadataTarget | BookInterlinearTarget | BookTranslationTarget | null
>;
export async function loadTargetBookFn(target: KeyMetadata | KeyTranslation | KeyInterlinear, book: string): Promise<
  BookMetadataTarget | BookInterlinearTarget | BookTranslationTarget | null
> {
  const http = inject(HttpClient);
  const targetBook = await firstValueFrom(http.get<BookMetadataTarget | BookInterlinearTarget | BookTranslationTarget>(`/library/targets/${target}/${book}.json`))
    .catch(e => Promise.resolve(null));

  return targetBook;
}
