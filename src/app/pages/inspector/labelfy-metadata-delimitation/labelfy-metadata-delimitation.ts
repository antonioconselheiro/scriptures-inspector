import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from '@angular/core';
import { AbstractHolyScriptureModel } from '../domain/abstract-holy-scripture-model';
import { OldBook } from '../domain/old-book-enum';
import { ScriptureVerse } from '../domain/scripture-verse-model';
import { DelimitationSegment } from './delimitation-segment-model';
import { TranslationMetadataContextMenuTrigger } from '../translation-metadata-context-menu/translation-metadata-context-menu-trigger';

@Component({
  selector: 'app-labelfy-metadata-delimitation',
  imports: [
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

  segments: DelimitationSegment[] = [];

  constructor(
    private cdr: ChangeDetectorRef
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
}
