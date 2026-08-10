import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { BookVerse } from '@domain/book-verse-model';
import { SourceBook } from '@domain/source-book-model';
import { TranslationViewing } from '@domain/translation-viewing-model';
import { AbstractInspectorDiretive } from './abstract-inspector-directive';
import { ProjectStructureMetadata } from '@domain/project-structure-metadata-model';
import { Project } from '@domain/project-model';
import { SystemService } from '@shared/system/system-service';

@Directive()
export abstract class AbstractTranslatableDirective extends AbstractInspectorDiretive {

  protected readonly indexNotFound = -1;

  @Input()
  abstract project: Project;

  @Input()
  abstract structure: ProjectStructureMetadata;

  @Input()
  abstract sourceBook: SourceBook;

  @Input()
  abstract sourceVerse: BookVerse<{ text: string; }>;

  @Input()
  abstract viewingTranslationBookRecord: { [source: string]: TranslationViewing; };

  protected abstract systemService: SystemService;

  getViewingTranslations(): Array<{
    source: string;
    name: string;
    verses: Array<BookVerse<{ text: string; }>>;
  }> {
    return Object.keys(this.viewingTranslationBookRecord).map(source => {
      const translationViewing = this.viewingTranslationBookRecord[source];
      if (translationViewing.associatedTo.includes(this.structure.source)) {
        const chapterIndex = this.viewingTranslationBookRecord[source].chapters.findIndex(chapter => chapter.chapter === this.current.chapter);
        const name = this.viewingTranslationBookRecord[source].name;

        if (chapterIndex !== this.indexNotFound) {
          const verses = this.viewingTranslationBookRecord[source].chapters[chapterIndex].verses;

          return {
            source,
            name,
            verses
          }
        } else {
          return {
            source,
            name,
            verses: []
          }
        }
      }

      return null;
    }).filter(has => !!has);
  }

  onRemoveTranslation(source: string): void {
    if (confirm('Confirm removing this translation viewing?')) {
      delete this.viewingTranslationBookRecord[source];

      if (this.viewingTranslationBookRecord[source]) {
        const indexOf = this.viewingTranslationBookRecord[source].associatedTo.indexOf(this.structure.source);
        if (indexOf !== this.indexNotFound) {
          this.viewingTranslationBookRecord[source].associatedTo.splice(indexOf, 1);
        }

        if (this.viewingTranslationBookRecord[source].associatedTo.length === 0) {
          delete this.viewingTranslationBookRecord[source];
        }
      }

      if (this.project.translationViewer) {
        const translationIndex = this.project.translationViewer.findIndex(item => item.translation === source);
        if (this.project.translationViewer[translationIndex]) {
          this.project.translationViewer[translationIndex].associatedTo = this.project
            .translationViewer[translationIndex]
            .associatedTo
            .filter(item => item !== this.structure.source);

          if (this.project.translationViewer[translationIndex].associatedTo.length === 0) {
            this.project.translationViewer.splice(translationIndex, 1);
          }
        }
      }

      this.systemService.triggerSaveCurrentProject();
    }
  }
}
