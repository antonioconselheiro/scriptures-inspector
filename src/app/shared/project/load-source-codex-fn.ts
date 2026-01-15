import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Codex } from '@domain/codex-model';
import { firstValueFrom } from 'rxjs';

export async function loadSourceCodexFn(source: string): Promise<Codex> {
  const http = inject(HttpClient);
  return firstValueFrom(http.get<Codex>(`/library/sources/${source}/_.codex`));
}
