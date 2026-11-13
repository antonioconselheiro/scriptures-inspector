import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  defaultHolyViewerCodexConfig,
  defaultHolyViewerConfig,
  HolyViewerCodexConfig,
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
  activeCodex: string | null = null;

  get visibleVerses(): HolyViewerVerse[] {
    return this.versesForConfig(this.config);
  }

  get fontSize(): number {
    return this.config.fontSize ?? defaultHolyViewerConfig.fontSize;
  }

  passageTitle(verse: HolyViewerVerse): string {
    const chapter = `${verse.bookName} ${verse.chapter}`;
    if (this.config.scope === 'chapter') {
      return chapter;
    }
    if (this.config.scope === 'verse') {
      return `${chapter}:${this.config.verse}`;
    }
    const start = Math.min(this.config.startVerse, this.config.endVerse);
    const end = Math.max(this.config.startVerse, this.config.endVerse);
    return `${chapter}:${start}${start === end ? '' : `-${end}`}`;
  }

  hasOmittedVersesBefore(displayed: HolyViewerVerse[]): boolean {
    return this.config.scope === 'range' && displayed.length > 0
      && Math.min(...displayed.map(verse => verse.verse)) > 1;
  }

  hasOmittedVersesAfter(displayed: HolyViewerVerse[]): boolean {
    return this.config.scope === 'range' && displayed.length > 0
      && Math.max(...displayed.map(verse => verse.verse)) < Math.max(...this.verses.map(verse => verse.verse));
  }

  private versesForConfig(config: HolyViewerConfig): HolyViewerVerse[] {
    if (config.scope === 'verse') {
      return this.verses.filter(verse => verse.verse === config.verse);
    }

    if (config.scope === 'range') {
      const start = Math.min(config.startVerse, config.endVerse);
      const end = Math.max(config.startVerse, config.endVerse);
      return this.verses.filter(verse => verse.verse >= start && verse.verse <= end);
    }

    return this.verses;
  }

  getCodexConfig(source: string): HolyViewerCodexConfig {
    return this.config.codices[source] ?? defaultHolyViewerCodexConfig;
  }

  showLine(line: HolyViewerLine): boolean {
    const config = this.getCodexConfig(line.source);
    if (line.type === 'original' || line.type === 'interlinear') {
      return config.showOriginal;
    }
    if (line.type === 'spelling' || line.type === 'numerology') {
      const selected = line.type === 'spelling' ? config.selectedSpellings : config.selectedNumerology;
      return selected ? selected.includes(line.optionId ?? line.label) : config.sections[line.type];
    }
    return config.sections[line.type];
  }

  codexOptions(source: string, type: 'spelling' | 'numerology'): Array<{ id: string; name: string }> {
    if (!this.draftConfig) {
      return [];
    }
    const options = new Map<string, string>();
    for (const verse of this.versesForConfig(this.draftConfig)) {
      for (const line of verse.lines) {
        if (line.source === source && line.type === type) {
          options.set(line.optionId ?? line.label, line.label);
        }
      }
    }
    return Array.from(options, ([id, name]) => ({ id, name }));
  }

  optionSelected(source: string, type: 'spelling' | 'numerology', id: string): boolean {
    const config = this.draftCodexConfig(source);
    const selected = type === 'spelling' ? config.selectedSpellings : config.selectedNumerology;
    return selected ? selected.includes(id) : config.sections[type];
  }

  setOption(source: string, type: 'spelling' | 'numerology', id: string, checked: boolean): void {
    const config = this.draftCodexConfig(source);
    const current = type === 'spelling' ? config.selectedSpellings : config.selectedNumerology;
    const selected = current ?? (config.sections[type] ? this.allCodexOptionIds(source, type) : []);
    const next = checked ? [...selected.filter(item => item !== id), id] : selected.filter(item => item !== id);
    if (type === 'spelling') {
      config.selectedSpellings = next;
    } else {
      config.selectedNumerology = next;
    }
  }

  private allCodexOptionIds(source: string, type: 'spelling' | 'numerology'): string[] {
    return [...new Set(this.verses.flatMap(verse => verse.lines
      .filter(line => line.source === source && line.type === type)
      .map(line => line.optionId ?? line.label)))];
  }

  get validFontSize(): boolean {
    const size = this.draftConfig?.fontSize;
    return typeof size === 'number' && Number.isFinite(size) && size > 0;
  }

  get availableCodices(): string[] {
    if (!this.draftConfig) {
      return [];
    }
    return [...new Set(this.versesForConfig(this.draftConfig).flatMap(verse =>
      verse.lines.filter(line => line.type === 'original' || line.type === 'interlinear')
        .map(line => line.source)
    ))];
  }

  get selectedCodex(): string | null {
    const sources = this.availableCodices;
    return this.activeCodex && sources.includes(this.activeCodex) ? this.activeCodex : sources[0] ?? null;
  }

  draftCodexConfig(source: string): HolyViewerCodexConfig {
    if (!this.draftConfig) {
      throw new Error('Cannot edit codex settings while the dialog is closed.');
    }
    return this.draftConfig.codices[source] ??= structuredClone(defaultHolyViewerCodexConfig);
  }

  codexVariations(source: string): HolyViewerVariationOption[] {
    return this.variationOptions.filter(option => option.source === source);
  }

  navigateCodexTabs(event: KeyboardEvent): void {
    const sources = this.availableCodices;
    if (!sources.length) {
      return;
    }
    const index = sources.indexOf(this.selectedCodex ?? '');
    let next: number;
    switch (event.key) {
      case 'ArrowRight': next = (index + 1) % sources.length; break;
      case 'ArrowLeft': next = (index - 1 + sources.length) % sources.length; break;
      case 'Home': next = 0; break;
      case 'End': next = sources.length - 1; break;
      default: return;
    }
    event.preventDefault();
    this.activeCodex = sources[next];
    const tabs = (event.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs[next]?.focus();
  }

  openSettings(): void {
    if (!this.configurable) {
      return;
    }
    this.draftConfig = structuredClone(this.config);
    this.draftConfig.fontSize ??= defaultHolyViewerConfig.fontSize;
    this.activeCodex = null;
    for (const source of new Set(this.verses.flatMap(verse => verse.lines.map(line => line.source)))) {
      this.draftCodexConfig(source);
    }
    this.settingsOpen = true;
  }

  closeSettings(): void {
    this.settingsOpen = false;
    this.draftConfig = null;
  }

  saveSettings(): void {
    if (!this.draftConfig || !this.validFontSize) {
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
    const config = this.draftCodexConfig(option.source);
    const selected = config.selectedVariations[option.target] ?? [];
    config.selectedVariations[option.target] = checked
      ? [...selected.filter(id => id !== option.id), option.id]
      : selected.filter(id => id !== option.id);
  }

  pieceText(line: HolyViewerLine, piece: HolyViewerPiece): string {
    if (!line.variationTarget || !piece.variations) {
      return piece.text;
    }
    const selected = this.getCodexConfig(line.source).selectedVariations[line.variationTarget] ?? [];
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
    { key: 'customTranslation', label: 'Custom translation' },
    { key: 'transliteration', label: 'Transliteration' }
  ];
}
