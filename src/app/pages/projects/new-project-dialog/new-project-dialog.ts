import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { languageList } from '@domain/language-list';
import { Language } from '@domain/language-model';
import { RepositoryRecord } from '@domain/repository-record';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';
import { SystemService } from '@shared/system/system-service';
import { firstValueFrom, Subject } from 'rxjs';

@Component({
  selector: 'app-new-project-dialog',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './new-project-dialog.html',
  styleUrl: './new-project-dialog.scss'
})
export class NewProjectDialog extends ModalableDirective<object, object> {

  readonly languages = languageList;
  readonly languageMeta: { [language: string]: Language } = languageMetadataRecord;

  override response = new Subject<object | void>();

  remoteCodex: Record<string, string> = {};

  newProject = {
    basicInfo: {
      name: '',
      language: '',
      destination: ''
    },

    repositories: [{
      alias: '',
      address: ''
    }],

    relatedCodex: [
      {
        key: '',
        name: '',
        type: 'disk',
        from: ''
      }
    ],

    targetBooks: [
      {
        key: '',
        name: ''
      }
    ],

    viewingCodex: [],
    metadataCodex: [
      {
        source: '',
        customTranslation: true,
        interlineares: [
          {
            source: '',
            customTranslation: true
          }
        ]
      }
    ]
  };

  constructor(
    private httpClient: HttpClient,
    private system: SystemService
  ) {
    super();
  }

  chooseDestination(): void {
    this.system.chooseFolder().then(destination => this.newProject.basicInfo.destination = destination);
  }

  addRepository(alias: HTMLInputElement, address: HTMLInputElement): void {
    if (alias.value && /^https:\/\/[^ ]*\/repository.json$/.test(address.value)) {
      firstValueFrom(this.httpClient.get<RepositoryRecord>(address.value))
        .then(repositoryData => {
          Object
            .keys(repositoryData)
            .map(language => Object.values(repositoryData[language].translations))
            .flat()
            .forEach(codex => this.remoteCodex[`${alias.value}/${codex.key}`] = codex.name);

          this.newProject.repositories.push({
            alias: alias.value,
            address: address.value
          });

          alias.value = '';
          address.value = '';
        });
    }
  }

  addRelatedCodexFromRepository(remoteCodex: HTMLInputElement): void {
    this.newProject.relatedCodex
  }

  addRelatedCodexFromDisk(): void {

  }
}
