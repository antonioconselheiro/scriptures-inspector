import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { ActivatedRouteSnapshot } from "@angular/router";
import { LanguageUnionType } from "../../domain/language-union-type";
import { newTestamentBookList } from "../../domain/new-testament-books-list";
import { oldTestamentBookList } from "../../domain/old-testament-books-list";

export function scriptureLoaderResolveFn(lang: LanguageUnionType) {
  return (route: ActivatedRouteSnapshot) => {
    const oldList: string[] = oldTestamentBookList;
    const newList: string[] = newTestamentBookList;
    const http = inject(HttpClient);
    const book = route.paramMap.get('book')!.toUpperCase();
    const langMap: { [lang: string]: string } = {
      'hebraic': 'hebrew-stuttgartensia',
      'geez': 'geez-mashafa-qeddus',
      'greek': 'graece-elzeviriana'
    };

    if (lang === 'hebraic' && !oldList.includes(book)) {
      return Promise.resolve([]);
    } else if (lang === 'greek' && !newList.includes(book)) {
      return Promise.resolve([]);
    }

    return http.get(`/library/${langMap[lang]}/${book}.json`);
  };
}
