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
      "target": {
        "language": [
          "portuguese",
          "english",
          "spanish"
        ],
        "books": {
          "portuguese": {
            "EN1": {
              "name": "Enoque"
            },
            "JUB": {
              "name": "Jubileus"
            },
            "GEN": {
              "name": "Gênesis"
            },
            "EXO": {
              "name": "Êxodo"
            },
            "LEV": {
              "name": "Levítico"
            },
            "NUM": {
              "name": "Números"
            },
            "DEU": {
              "name": "Deuteronômio"
            },
            "JOS": {
              "name": "Josué"
            },
            "JUI": {
              "name": "Juízes"
            },
            "RUT": {
              "name": "Rute"
            },
            "1SM": {
              "name": "1 Samuel"
            },
            "2SM": {
              "name": "2 Samuel"
            },
            "1RS": {
              "name": "1 Reis"
            },
            "2RS": {
              "name": "2 Reis"
            },
            "1CR": {
              "name": "1 Crônicas"
            },
            "2CR": {
              "name": "2 Crônicas"
            },
            "1ED": {
              "name": "Esdras"
            },
            "2ED": {
              "name": "Neemias"
            },
            "1ET": {
              "name": "Ester"
            },
            "JOB": {
              "name": "Jó"
            },
            "1SL": {
              "name": "Salmos"
            },
            "PRO": {
              "name": "Provérbios"
            },
            "ECL": {
              "name": "Eclesiastes"
            },
            "CAN": {
              "name": "Cânticos"
            },
            "ISA": {
              "name": "Isaías"
            },
            "1JE": {
              "name": "Jeremias"
            },
            "2JE": {
              "name": "Lamentações"
            },
            "EZE": {
              "name": "Ezequiel"
            },
            "1DA": {
              "name": "Daniel"
            },
            "OSE": {
              "name": "Oséias"
            },
            "JOE": {
              "name": "Joel"
            },
            "AMO": {
              "name": "Amós"
            },
            "OBA": {
              "name": "Obadias"
            },
            "JON": {
              "name": "Jonas"
            },
            "MIQ": {
              "name": "Miquéias"
            },
            "NAU": {
              "name": "Naum"
            },
            "HAB": {
              "name": "Habacuque"
            },
            "SOF": {
              "name": "Sofonias"
            },
            "AGE": {
              "name": "Ageu"
            },
            "ZAC": {
              "name": "Zacarias"
            },
            "MAL": {
              "name": "Malaquias"
            },
            "MAT": {
              "name": "Mateus"
            },
            "MAR": {
              "name": "Marcos"
            },
            "LUC": {
              "name": "Lucas"
            },
            "JOA": {
              "name": "João"
            },
            "ATO": {
              "name": "Atos"
            },
            "ROM": {
              "name": "Romanos"
            },
            "1CO": {
              "name": "1 Coríntios"
            },
            "2CO": {
              "name": "2 Coríntios"
            },
            "GAL": {
              "name": "Gálatas"
            },
            "EFE": {
              "name": "Efésios"
            },
            "FIL": {
              "name": "Filipenses"
            },
            "COL": {
              "name": "Colossenses"
            },
            "1TS": {
              "name": "1 Tessalonicenses"
            },
            "2TS": {
              "name": "2 Tessalonicenses"
            },
            "1TM": {
              "name": "1 Timóteo"
            },
            "2TM": {
              "name": "2 Timóteo"
            },
            "TIT": {
              "name": "Tito"
            },
            "FLM": {
              "name": "Filemom"
            },
            "HEB": {
              "name": "Hebreus"
            },
            "TIA": {
              "name": "Tiago"
            },
            "1PE": {
              "name": "1 Pedro"
            },
            "2PE": {
              "name": "2 Pedro"
            },
            "1JO": {
              "name": "1 João"
            },
            "2JO": {
              "name": "2 João"
            },
            "3JO": {
              "name": "3 João"
            },
            "JUD": {
              "name": "Judas"
            },
            "APO": {
              "name": "Apocalipse"
            }
          },
          "english": {
            "EN1": {
              "name": "Enoch"
            },
            "JUB": {
              "name": "Jubilee"
            },
            "GEN": {
              "name": "Genesis"
            },
            "EXO": {
              "name": "Exodus"
            },
            "LEV": {
              "name": "Leviticus"
            },
            "NUM": {
              "name": "Numbers"
            },
            "DEU": {
              "name": "Deuteronomy"
            },
            "JOS": {
              "name": "Joshua"
            },
            "JUI": {
              "name": "Judges"
            },
            "RUT": {
              "name": "Ruth"
            },
            "1SM": {
              "name": "I Samuel"
            },
            "2SM": {
              "name": "II Samuel"
            },
            "1RS": {
              "name": "I Kings"
            },
            "2RS": {
              "name": "II Kings"
            },
            "1CR": {
              "name": "I Chronicles"
            },
            "2CR": {
              "name": "II Chronicles"
            },
            "1ED": {
              "name": "Ezra"
            },
            "2ED": {
              "name": "Nehemiah"
            },
            "1ET": {
              "name": "Esther"
            },
            "JOB": {
              "name": "Job"
            },
            "1SL": {
              "name": "Psalms"
            },
            "PRO": {
              "name": "Proverbs"
            },
            "ECL": {
              "name": "Ecclesiastes"
            },
            "CAN": {
              "name": "Song of Solomon"
            },
            "ISA": {
              "name": "Isaiah"
            },
            "1JE": {
              "name": "Jeremiah"
            },
            "2JE": {
              "name": "Lamentations"
            },
            "EZE": {
              "name": "Ezekiel"
            },
            "1DA": {
              "name": "Daniel"
            },
            "OSE": {
              "name": "Hosea"
            },
            "JOE": {
              "name": "Joel"
            },
            "AMO": {
              "name": "Amos"
            },
            "OBA": {
              "name": "Obadiah"
            },
            "JON": {
              "name": "Jonah"
            },
            "MIQ": {
              "name": "Micah"
            },
            "NAU": {
              "name": "Nahum"
            },
            "HAB": {
              "name": "Habakkuk"
            },
            "SOF": {
              "name": "Zephaniah"
            },
            "AGE": {
              "name": "Haggai"
            },
            "ZAC": {
              "name": "Zechariah"
            },
            "MAL": {
              "name": "Malachi"
            },
            "MAT": {
              "name": "Matthew"
            },
            "MAR": {
              "name": "Mark"
            },
            "LUC": {
              "name": "Luke"
            },
            "JOA": {
              "name": "John"
            },
            "ATO": {
              "name": "Acts"
            },
            "ROM": {
              "name": "Romans"
            },
            "1CO": {
              "name": "I Corinthians"
            },
            "2CO": {
              "name": "II Corinthians"
            },
            "GAL": {
              "name": "Galatians"
            },
            "EFE": {
              "name": "Ephesians"
            },
            "FIL": {
              "name": "Philippians"
            },
            "COL": {
              "name": "Colossians"
            },
            "1TS": {
              "name": "I Thessalonians"
            },
            "2TS": {
              "name": "II Thessalonians"
            },
            "1TM": {
              "name": "I Timothy"
            },
            "2TM": {
              "name": "II Timothy"
            },
            "TIT": {
              "name": "Titus"
            },
            "FLM": {
              "name": "Philemon"
            },
            "HEB": {
              "name": "Hebrews"
            },
            "TIA": {
              "name": "James"
            },
            "1PE": {
              "name": "I Peter"
            },
            "2PE": {
              "name": "II Peter"
            },
            "1JO": {
              "name": "I John"
            },
            "2JO": {
              "name": "II John"
            },
            "3JO": {
              "name": "III John"
            },
            "JUD": {
              "name": "Jude"
            },
            "APO": {
              "name": "Apocalypse"
            }
          },
          "spanish": {
            "EN1": {
              "name": "Enoc"
            },
            "JUB": {
              "name": "Jubileos"
            },
            "GEN": {
              "name": "Génesis"
            },
            "EXO": {
              "name": "Éxodo"
            },
            "LEV": {
              "name": "Levítico"
            },
            "NUM": {
              "name": "Números"
            },
            "DEU": {
              "name": "Deuteronomio"
            },
            "JOS": {
              "name": "Josué"
            },
            "JUI": {
              "name": "Jueces"
            },
            "RUT": {
              "name": "Rut"
            },
            "1SM": {
              "name": "1 Samuel"
            },
            "2SM": {
              "name": "2 Samuel"
            },
            "1RS": {
              "name": "1 Reyes"
            },
            "2RS": {
              "name": "2 Reyes"
            },
            "1CR": {
              "name": "1 Crónicas"
            },
            "2CR": {
              "name": "2 Crónicas"
            },
            "1ED": {
              "name": "Esdras"
            },
            "2ED": {
              "name": "Nehemías"
            },
            "1ET": {
              "name": "Ester"
            },
            "JOB": {
              "name": "Job"
            },
            "1SL": {
              "name": "Salmos"
            },
            "PRO": {
              "name": "Proverbios"
            },
            "ECL": {
              "name": "Eclesiastés"
            },
            "CAN": {
              "name": "Cantar de los Cantares"
            },
            "ISA": {
              "name": "Isaías"
            },
            "1JE": {
              "name": "Jeremías"
            },
            "2JE": {
              "name": "Lamentaciones"
            },
            "EZE": {
              "name": "Ezequiel"
            },
            "1DA": {
              "name": "Daniel"
            },
            "OSE": {
              "name": "Oseas"
            },
            "JOE": {
              "name": "Joel"
            },
            "AMO": {
              "name": "Amós"
            },
            "OBA": {
              "name": "Abdías"
            },
            "JON": {
              "name": "Jonás"
            },
            "MIQ": {
              "name": "Miqueas"
            },
            "NAU": {
              "name": "Nahúm"
            },
            "HAB": {
              "name": "Habacuc"
            },
            "SOF": {
              "name": "Sofonías"
            },
            "AGE": {
              "name": "Ageo"
            },
            "ZAC": {
              "name": "Zacarías"
            },
            "MAL": {
              "name": "Malaquías"
            },
            "MAT": {
              "name": "Mateo"
            },
            "MAR": {
              "name": "Marcos"
            },
            "LUC": {
              "name": "Lucas"
            },
            "JOA": {
              "name": "Juan"
            },
            "ATO": {
              "name": "Hechos"
            },
            "ROM": {
              "name": "Romanos"
            },
            "1CO": {
              "name": "1 Corintios"
            },
            "2CO": {
              "name": "2 Corintios"
            },
            "GAL": {
              "name": "Gálatas"
            },
            "EFE": {
              "name": "Efesios"
            },
            "FIL": {
              "name": "Filipenses"
            },
            "COL": {
              "name": "Colosenses"
            },
            "1TS": {
              "name": "1 Tesalonicenses"
            },
            "2TS": {
              "name": "2 Tesalonicenses"
            },
            "1TM": {
              "name": "1 Timoteo"
            },
            "2TM": {
              "name": "2 Timoteo"
            },
            "TIT": {
              "name": "Tito"
            },
            "FLM": {
              "name": "Filemón"
            },
            "HEB": {
              "name": "Hebreos"
            },
            "TIA": {
              "name": "Santiago"
            },
            "1PE": {
              "name": "1 Pedro"
            },
            "2PE": {
              "name": "2 Pedro"
            },
            "1JO": {
              "name": "1 Juan"
            },
            "2JO": {
              "name": "2 Juan"
            },
            "3JO": {
              "name": "3 Juan"
            },
            "JUD": {
              "name": "Judas"
            },
            "APO": {
              "name": "Apocalipsis"
            }
          }
        }
      },
      "structure": [
        {
          "translationViewer": {
            "portuguese": [],
            "english": [],
            "spanish": []
          },
          "metadataEditor": {
            "source": "hebrew-stuttgartensia",
            "customTranslationEditor": true,
            "translationInterlinearEditor": [
              {
                "source": "geez-mashafa-qeddus",
                "customTranslationEditor": true
              }
            ]
          }
        },
        {
          "target": [
            "portuguese",
            "english",
            "spanish"
          ],
          "translationViewer": {
            "portuguese": [],
            "english": [],
            "spanish": []
          },
          "metadataEditor": {
            "source": "greek-elzeviriana",
            "customTranslationEditor": true,
            "translationInterlinearEditor": [
              {
                "source": "geez-mashafa-qeddus",
                "customTranslationEditor": true
              }
            ]
          }
        }
      ]
    });
  }

  async loadBook(path: string, book: string): Promise<string> {
    if (/^http/.test(path)) {
      return this.httpClient.get(`${path}${book}.json`);
    } else {
      return Promise.resolve('');
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
