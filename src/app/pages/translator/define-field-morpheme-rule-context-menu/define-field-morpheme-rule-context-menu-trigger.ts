import { Directive, HostListener, Input } from '@angular/core';
import { DefineFieldMorphemeRuleContextMenu } from './define-field-morpheme-rule-context-menu';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { Project } from '@domain/project-model';
import { getProjectLanguageFn } from '@shared/language-metadata/get-project-language-fn';
import { MorphemeType } from '@domain/morpheme-type';

@Directive({
  selector: '[appDefineFieldMorphemeRuleContextMenuTrigger]',
})
export class DefineFieldMorphemeRuleContextMenuTrigger {

  @Input({ alias: 'appDefineFieldMorphemeRuleContextMenuTrigger', required: true })
  contextMenu!: DefineFieldMorphemeRuleContextMenu;

  @Input()
  morphemePosition: MorphemeType = 'root';

  @Input()
  morphemeConfigured: MorphemeType = 'root';

  @Input({ required: true })
  sourceLanguage!: LanguageUnionType;

  @Input({ required: true })
  project!: Project;

  @Input({ required: true })
  word!: string;

  @Input({ required: true })
  parsedBook!: ParsedBookMetadata;

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault();

    if (this.morphemePosition !== 'root') {
      const normalizeFn = getProjectLanguageFn(this.project, this.sourceLanguage).normalizeFn || (w => w);
      this.contextMenu.x = event.clientX;
      this.contextMenu.y = event.clientY;
      this.contextMenu.visible = true;
      this.contextMenu.word = normalizeFn(this.word);
      this.contextMenu.morphemePosition = this.morphemePosition;
      this.contextMenu.morphemeConfigured = this.morphemeConfigured;
      this.contextMenu.parsedBook = this.parsedBook;
    }
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.contextMenu) {
      this.contextMenu.visible = false;
    }
  }
}
