import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { Translation } from "./domain/translation.model";

export const translationResolver: ResolveFn<Translation> = (route: ActivatedRouteSnapshot) => {
  const language = route.params['language'];
  const translation = route.params['translation'];

  return fetch(`https://antonioconselheiro.github.io/bible/src/bible-${language}-${translation}.json`)
    .then(res => res.json())
};