import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
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
export class LabelfyMetadataDelimitation  implements OnChanges {
  @Input() customTranslation!: AbstractHolyScriptureModel;
  @Input() book!: OldBook;
  @Input() chapter!: number;
  @Input() verse!: ScriptureVerse;
  @Input() lang!: 'hebraic' | 'geez' | 'greek';
  @Input() translationMetadataMenuRef!: any;

  @Output() emitSave = new EventEmitter<void>();

  segments: DelimitationSegment[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private modalService: ModalService
  ) {}

  ngOnChanges(): void {
    this.segments = this.computeSegments();
    this.cdr.markForCheck();
  }

  private computeSegments(): DelimitationSegment[] {
    const verse = this.getCustomTranslationVerse();
    if (!verse) return [{ text: '\u00A0' }];

    if (!verse.metadata || verse.metadata.length === 0) {
      return [{ text: verse.text }];
    }

    const segments: DelimitationSegment[] = [];
    let currentIndex = verse.text.length;

    const sortedMetadata = [...verse.metadata].sort((a, b) => b.start - a.start);

    sortedMetadata.forEach(m => {
      if (m.end < currentIndex) {
        segments.unshift({ text: verse.text.slice(m.end, currentIndex) });
      }

      segments.unshift({
        text: verse.text.slice(m.start, m.end),
        type: m.type,
        start: m.start,
        end: m.end
      });

      currentIndex = m.start;
    });

    if (currentIndex > 0) {
      segments.unshift({ text: verse.text.slice(0, currentIndex) });
    }

    return segments;
  }

  private getCustomTranslationVerse(): ScriptureVerse | null {
    return this.customTranslation?.[this.book]?.[this.chapter]?.[this.verse.verse.index] ?? null;
  }

  deleteDelimitation(segment: DelimitationSegment): void {
    const confirmDeletion = confirm('Confirm deletion?');

    if (confirmDeletion) {
      const indexNotFound = -1;
      const metadata = this.verse.metadata || [];
      const index = metadata.findIndex(data => data.start === segment.start && data.end === segment.end);
      if (index != indexNotFound) {
        metadata.splice(index, 1);
      }
  
      this.emitSave.emit();
    }
  }

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
