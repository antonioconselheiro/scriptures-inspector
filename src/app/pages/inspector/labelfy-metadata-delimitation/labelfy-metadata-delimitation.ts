import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AsyncModalModule, ModalService } from '@belomonte/async-modal-ngx';
import { ConfigDelimitationDialog } from '../config-delimitation-dialog/config-delimitation-dialog';
import { AbstractHolyScriptureModel } from '../domain/abstract-holy-scripture-model';
import { OldBook } from '../domain/old-book-enum';
import { ScriptureVerse } from '../domain/scripture-verse-model';
import { TranslationMetadataContextMenuTrigger } from '../translation-metadata-context-menu/translation-metadata-context-menu-trigger';
import { DelimitationSegment } from './delimitation-segment-model';

@Component({
  selector: 'app-labelfy-metadata-delimitation',
  imports: [
    AsyncModalModule,
    TranslationMetadataContextMenuTrigger
  ],
  templateUrl: './labelfy-metadata-delimitation.html',
  styleUrl: './labelfy-metadata-delimitation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelfyMetadataDelimitation {
  @Input() customTranslation!: AbstractHolyScriptureModel;
  @Input() book!: OldBook;
  @Input() chapter!: number;
  @Input() verse!: ScriptureVerse;
  @Input() lang!: 'hebraic' | 'geez' | 'greek';
  @Input() translationMetadataMenuRef!: any;

  @Output() emitSave = new EventEmitter<void>();

  segments: DelimitationSegment[] = [];

  constructor(
    private modalService: ModalService
  ) {}

  openConfig(verse: ScriptureVerse, segment: DelimitationSegment): void {
    this.modalService
      .createModal(ConfigDelimitationDialog)
      .setOutletName('main')
      .setData({
        verse,
        segment
      })
      .build()
      .subscribe({
        next: () => this.emitSave.emit()
      });
  }
}
