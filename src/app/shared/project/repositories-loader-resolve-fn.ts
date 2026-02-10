import { RepositoryRecord } from '@domain/repository-record';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { getProjectFn } from './get-project-fn';

export function repositoriesLoaderResolveFn(): () => Promise<RepositoryRecord> {
  return async () => {
    const http = inject(HttpClient);
    const project = getProjectFn();
    let mergedRepositories: RepositoryRecord = {};
    
    if (project) {
      //  TODO: preciso fazer validação do schema retornado para garantir a segurança
      //  TODO: preciso incluir o header de application/json para garantir o formato do json
      const allRepositories: { [repository: string]: RepositoryRecord } = {};
      const queeue = await Object
        .keys(project.repositories)
        .filter(repositoryKey => /^https:\/\/[^ ]+repository.json$/.test(project.repositories[repositoryKey]))
        .map(repositoryKey => firstValueFrom(http.get<RepositoryRecord>(project.repositories[repositoryKey])).then(data => [ repositoryKey, data ] as const));

      const resultset = await Promise.all(queeue);
      resultset.forEach(([key, data]) => allRepositories[key] = data);

      Object.keys(project.repositories).forEach(repositoryKey => {
        Object.keys(allRepositories[repositoryKey]).forEach(langKey => {
          if (mergedRepositories[langKey]) {
            mergedRepositories[langKey].translations = { ...mergedRepositories[langKey].translations, ...allRepositories[repositoryKey][langKey].translations };
          } else {
            mergedRepositories[langKey] = allRepositories[repositoryKey][langKey];
          }
        });
      });
    }

    return Promise.resolve(mergedRepositories);
  };
}
