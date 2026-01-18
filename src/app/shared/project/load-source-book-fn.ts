import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { SourceBook } from '@domain/source-book-model';
import { firstValueFrom } from 'rxjs';

//  TODO: precisa carregar utilizando sistema de arquivos
export async function loadSourceBookFn(source: string, book: string): Promise<SourceBook> {
  const http = inject(HttpClient);
  return firstValueFrom(http.get<SourceBook>(`/library/sources/${source}/${book}.json`));
}
