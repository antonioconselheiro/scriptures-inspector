import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Project } from '@domain/project-model';
import { Subject } from 'rxjs';

// TODO: integrar com tauri
@Injectable({
  providedIn: 'root'
})
export class SystemService {

  static autoSaveCurrentProject = new Subject<void>();

  constructor(
    private httpClient: HttpClient
  ) { }

  loadProject(): Promise<Project> {
    return Promise.resolve({
      "name": "Bible Translation",
      "codex": [
        "hebrew-stuttgartensia",
        "greek-elzeviriana",
        "geez-mashafa-qeddus",
        "https://raw.githubusercontent.com/antonioconselheiro/bible/refs/heads/master/src/bible-pt-aa",
        "https://raw.githubusercontent.com/antonioconselheiro/bible/refs/heads/master/src/bible-pt-acf",
        "https://raw.githubusercontent.com/antonioconselheiro/bible/refs/heads/master/src/bible-pt-kja",
        "https://raw.githubusercontent.com/antonioconselheiro/bible/refs/heads/master/src/bible-pt-nvi",
        "https://raw.githubusercontent.com/antonioconselheiro/bible/refs/heads/master/src/bible-pt-tb",
        "https://raw.githubusercontent.com/antonioconselheiro/bible/refs/heads/master/src/bible-pt-vc",
        "https://raw.githubusercontent.com/antonioconselheiro/bible/refs/heads/master/src/bible-en-niv",
        "https://raw.githubusercontent.com/antonioconselheiro/bible/refs/heads/master/src/bible-en-leb",
        "https://raw.githubusercontent.com/antonioconselheiro/bible/refs/heads/master/src/bible-en-rnt",
        "https://raw.githubusercontent.com/antonioconselheiro/bible/refs/heads/master/src/bible-en-kjv",
        "https://raw.githubusercontent.com/antonioconselheiro/bible/refs/heads/master/src/bible-es-rv",
        "https://raw.githubusercontent.com/antonioconselheiro/bible/refs/heads/master/src/bible-es-sev"
      ],
      "structure": [
        {
          "target": [
            "portuguese",
            "english",
            "spanish"
          ],
          "translationViewer": {
            "portuguese": [
              "bible-pt-acf",
              "bible-pt-kja"
            ],
            "english": [
              "bible-en-niv",
              "bible-en-leb",
              "bible-en-rnt",
              "bible-en-kjv"
            ],
            "spanish": [
              "bible-es-rv",
              "bible-es-sev"
            ]
          },
          "metadataEditor": {
            "source": "hebrew-stuttgartensia",
            "customTranslationEditor": true,
            "translationInterlinearEditor": {
              "source": "geez-mashafa-qeddus",
              "customTranslationEditor": true
            }
          }
        },
        {
          "target": [
            "portuguese",
            "english",
            "spanish"
          ],
          "translationViewer": {
            "portuguese": [
              "bible-pt-acf",
              "bible-pt-kja"
            ],
            "english": [
              "bible-en-niv",
              "bible-en-leb",
              "bible-en-rnt",
              "bible-en-kjv"
            ],
            "spanish": [
              "bible-es-rv",
              "bible-es-sev"
            ]
          },
          "metadataEditor": {
            "source": "greek-elzeviriana",
            "customTranslationEditor": true,
            "translationInterlinearEditor": {
              "source": "geez-mashafa-qeddus",
              "customTranslationEditor": true
            }
          }
        }
      ]
    });
  }

  async loadBook(path: string, book: string): Promise<string> {
    if (/^http/.test(path)) {
      return this.httpClient.get(`${path}${book}.json`);
    } else {

    }
  }

  chooseFolder(): Promise<string> {
    return Promise.resolve('~/project');
  }

  saveProject(): Promise<void> {
    return Promise.resolve();
  }

  autoSaveCurrentProject(): void {
    SystemService.autoSaveCurrentProject.next();
  }
}
