import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { BookInterlinearTarget } from '@domain/book-interlinear-target-model';
import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { firstValueFrom } from 'rxjs';

export async function loadTargetBookFn(target: string, book: string): Promise<BookMetadataTarget | BookInterlinearTarget | BookTranslationTarget> {
  const http = inject(HttpClient);
  return firstValueFrom(http.get<BookMetadataTarget | BookInterlinearTarget | BookTranslationTarget>(`/library/targets/${target}/${book}.json`));
}