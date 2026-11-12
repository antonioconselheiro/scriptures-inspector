import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  HolyViewerConfig,
  HolyViewerSection,
  HolyViewerLine,
  HolyViewerPiece,
  HolyViewerVariationOption,
  HolyViewerVerse
} from './holy-viewer-model';

@Component({
  selector: 'app-holy-viewer',
  imports: [FormsModule],
  templateUrl: './holy-viewer-component.html',
  styleUrl: './holy-viewer-component.scss'
})
export class HolyViewerComponent {
  @Input({ required: true })
  verses: HolyViewerVerse[] = [];

  @Input()
  variationOptions: HolyViewerVariationOption[] = [];

  @Input({ required: true })
  config!: HolyViewerConfig;

  @Input()
  configurable = false;

  @Output()
  configChange = new EventEmitter<HolyViewerConfig>();

  settingsOpen = false;
  draftConfig: HolyViewerConfig | null = null;

  get visibleVerses(): HolyViewerVerse[] {
    if (this.config.scope === 'verse') {
      return this.verses.filter(verse => verse.verse === this.config.verse);
    }

    if (this.config.scope === 'range') {
      const start = Math.min(this.config.startVerse, this.config.endVerse);
      const end = Math.max(this.config.startVerse, this.config.endVerse);
      return this.verses.filter(verse => verse.verse >= start && verse.verse <= end);
    }

    return this.verses;
  }

  showLine(type: HolyViewerSection | 'original'): boolean {
    return type === 'original'
      ? this.config.showOriginal
      : this.config.sections[type];
  }

  openSettings(): void {
    if (!this.configurable) {
      return;
    }
    this.draftConfig = structuredClone(this.config);
    this.settingsOpen = true;
  }

  closeSettings(): void {
    this.settingsOpen = false;
    this.draftConfig = null;
  }

  saveSettings(): void {
    if (!this.draftConfig) {
      return;
    }
    this.config = structuredClone(this.draftConfig);
    this.configChange.emit(this.config);
    this.closeSettings();
  }

  setVariation(option: HolyViewerVariationOption, checked: boolean): void {
    if (!this.draftConfig) {
      return;
    }
    const selected = this.draftConfig.selectedVariations[option.target] ?? [];
    this.draftConfig.selectedVariations[option.target] = checked
      ? [...selected.filter(id => id !== option.id), option.id]
      : selected.filter(id => id !== option.id);
  }

  pieceText(line: HolyViewerLine, piece: HolyViewerPiece): string {
    if (!line.variationTarget || !piece.variations) {
      return piece.text;
    }
    const selected = this.config.selectedVariations[line.variationTarget] ?? [];
    for (let index = selected.length - 1; index >= 0; index--) {
      const value = piece.variations[selected[index]];
      if (value) {
        return value;
      }
    }
    return piece.text;
  }

  isPunctuation(text: string): boolean {
    return /^\p{General_Category=Punctuation}+$/u.test(text);
  }

  readonly sectionNames: Array<{ key: HolyViewerSection; label: string }> = [
    { key: 'interlinear', label: 'Interlinear' },
    { key: 'customTranslation', label: 'Custom translation' },
    { key: 'lexical', label: 'Lexical values' },
    { key: 'spelling', label: 'Alternative spelling' },
    { key: 'transliteration', label: 'Transliteration' },
    { key: 'numerology', label: 'Numerology' }
  ];
}
