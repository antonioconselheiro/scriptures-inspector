import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { SourceBook } from '@domain/source-book-model';
import { firstValueFrom } from 'rxjs';

export async function loadBookFn(source: string, book: string): Promise<SourceBook> {
  const http = inject(HttpClient);
  return firstValueFrom(http.get<SourceBook>(`/library/sources/${source}/${book}.json`));
}
