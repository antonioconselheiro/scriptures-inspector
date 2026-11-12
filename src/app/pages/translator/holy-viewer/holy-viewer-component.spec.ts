import { TestBed } from '@angular/core/testing';
import { defaultHolyViewerConfig } from './holy-viewer-model';
import { HolyViewerComponent } from './holy-viewer-component';

describe('HolyViewerComponent', () => {
  let component: HolyViewerComponent;

  beforeEach(() => {
    component = new HolyViewerComponent();
    component.config = structuredClone(defaultHolyViewerConfig);
    component.verses = [
      { id: 'GEN-1', bookName: 'Genesis', chapter: 1, verse: 1, lines: [] },
      { id: 'GEN-2', bookName: 'Genesis', chapter: 1, verse: 2, lines: [] },
      { id: 'GEN-3', bookName: 'Genesis', chapter: 1, verse: 3, lines: [] }
    ];
  });

  it('defaults to prismatic and lexical display while keeping a single-verse scope', () => {
    expect(component.config.scope).toBe('verse');
    expect(component.config.displayMode).toBe('prismatic');
    expect(component.config.sections.lexical).toBeTrue();
    expect(component.visibleVerses.map(verse => verse.verse)).toEqual([1]);
  });

  it('filters a single verse, a verse range, or the whole chapter by JSON configuration', () => {
    component.config = { ...component.config, scope: 'verse', verse: 2 };
    expect(component.visibleVerses.map(verse => verse.verse)).toEqual([2]);

    component.config = { ...component.config, scope: 'range', startVerse: 3, endVerse: 1 };
    expect(component.visibleVerses.map(verse => verse.verse)).toEqual([1, 2, 3]);

    component.config = { ...component.config, scope: 'chapter' };
    expect(component.visibleVerses.length).toBe(3);
  });

  it('only opens and emits editable settings when configurability is enabled', () => {
    expect(component.config.showOriginalLexicalTooltip).toBeFalse();
    component.openSettings();
    expect(component.settingsOpen).toBeFalse();

    component.configurable = true;
    component.openSettings();
    expect(component.settingsOpen).toBeTrue();
    component.draftConfig!.showOriginalLexicalTooltip = true;

    let updated = false;
    component.configChange.subscribe(config => updated = config.showOriginalLexicalTooltip);
    component.saveSettings();

    expect(updated).toBeTrue();
    expect(component.settingsOpen).toBeFalse();
  });

  it('applies selected variations in selection order without changing their source pieces', () => {
    const line = {
      type: 'customTranslation' as const,
      label: 'Custom translation',
      variationTarget: 'target',
      pieces: []
    };
    const piece = { text: 'Divos', color: '4', wordOfGod: true, variations: { singular: 'Deus', transliteration: 'Elohim' } };
    component.configurable = true;
    component.openSettings();
    component.setVariation({ target: 'target', source: 'Source', id: 'singular', name: 'Singular' }, true);
    component.setVariation({ target: 'target', source: 'Source', id: 'transliteration', name: 'Transliteration' }, true);
    component.saveSettings();

    expect(component.pieceText(line, piece)).toBe('Elohim');
    component.openSettings();
    component.setVariation({ target: 'target', source: 'Source', id: 'transliteration', name: 'Transliteration' }, false);
    component.saveSettings();
    expect(component.pieceText(line, piece)).toBe('Deus');
    expect(piece.color).toBe('4');
    expect(piece.wordOfGod).toBeTrue();
  });

  it('renders unlinked segments with prisma only in prismatic mode', () => {
    const fixture = TestBed.createComponent(HolyViewerComponent);
    fixture.componentInstance.config = structuredClone(defaultHolyViewerConfig);
    fixture.componentInstance.verses = [{
      id: 'GEN-1', bookName: 'Genesis', chapter: 1, verse: 1,
      lines: [{
        type: 'customTranslation',
        label: 'Custom translation',
        pieces: [
          { text: 'linked', color: '2' },
          { text: ' ' },
          { text: 'unlinked', color: '' },
          { text: '.', color: '' }
        ]
      }]
    }];
    fixture.detectChanges();

    const textSpans = fixture.nativeElement.querySelectorAll('.holyLine > span:last-child > span') as NodeListOf<HTMLElement>;
    expect(textSpans[0].className).toBe('prisma2');
    expect(textSpans[1].className).toBe('');
    expect(textSpans[2].className).toBe('prisma');
    expect(textSpans[2].hasAttribute('data-punctuation')).toBeFalse();
    expect(textSpans[3].className).toBe('prisma');
    expect(textSpans[3].hasAttribute('data-punctuation')).toBeTrue();

    fixture.componentInstance.config = { ...fixture.componentInstance.config, displayMode: 'wordOfGod' };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(textSpans[0].className).toBe('');
    expect(textSpans[2].className).toBe('');
    expect(textSpans[3].hasAttribute('data-punctuation')).toBeFalse();
  });
});
