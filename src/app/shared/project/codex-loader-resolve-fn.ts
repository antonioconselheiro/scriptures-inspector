import { ActivatedRouteSnapshot } from '@angular/router';
import { Codex } from '@domain/codex-model';
import { LanguageUnionType } from '@domain/language-union-type';

export function codexLoaderResolveFn(): () => Promise<Record<string, Codex<LanguageUnionType>>> {
  return async () => {
    // TODOING
  }
}
