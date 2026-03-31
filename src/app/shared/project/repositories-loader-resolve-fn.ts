import { RepositoryRecord } from '@domain/repository-record';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { getProjectFn } from './get-project-fn';
import { RepositoryTranslationRecord } from '@domain/repository-translation-record';

export function repositoriesLoaderResolveFn(): () => Promise<RepositoryRecord> {
  return async () => {
    const http = inject(HttpClient);
    const project = getProjectFn();
    let mergedRepositories: RepositoryRecord = {};
    
    if (project && project.repositories) {
      //  TODO: preciso fazer validação do schema retornado para garantir a segurança
      const allRepositories: { [repository: string]: RepositoryRecord } = {};
      const httpOptions = {
        headers: {
          'Accept': 'application/json'
        }
      };
      const queeue = await Object
        .keys(project.repositories)
        .filter(repositoryKey => /^https:\/\/[^ ]+repository.json$/.test(project.repositories && project.repositories[repositoryKey] || ''))
        .map(repositoryKey => firstValueFrom(http
          .get<RepositoryRecord>(project.repositories && project.repositories[repositoryKey] || '', httpOptions))
          .then(data => [ repositoryKey, data ] as const)
        );

      const resultset = await Promise.all(queeue);
      resultset.forEach(([key, data]) => allRepositories[key] = data);

      Object.keys(project.repositories).forEach(repositoryKey => {
        Object.keys(allRepositories[repositoryKey]).forEach(langKey => {
          const langTranslations = allRepositories[repositoryKey][langKey];
          const translations: RepositoryTranslationRecord = {};
          Object.keys(langTranslations.translations).forEach(translationKey => {
            translations[`@${repositoryKey}/${translationKey}`] = langTranslations.translations[translationKey];
          });

          langTranslations.translations = translations;
          if (mergedRepositories[langKey]) {
            mergedRepositories[langKey].translations = {
              ...mergedRepositories[langKey].translations,
              ...langTranslations.translations
            };
          } else {
            mergedRepositories[langKey] = langTranslations;
          }
        });
      });
    }

    return Promise.resolve(mergedRepositories);
  };
}
