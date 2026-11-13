import { TestBed } from '@angular/core/testing';
import { defaultHolyViewerCodexConfig, defaultHolyViewerConfig } from './holy-viewer-model';
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

  it('defaults to prismatic with lexical tooltips and a single-verse scope', () => {
    expect(component.config.scope).toBe('verse');
    expect(component.config.displayMode).toBe('prismatic');
    expect(defaultHolyViewerCodexConfig.showOriginalLexicalTooltip).toBeTrue();
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

  it('renders a passage title and superscript verse numbers for each selected scope', () => {
    const fixture = TestBed.createComponent(HolyViewerComponent);
    const viewer = fixture.componentInstance;
    viewer.verses = component.verses;
    viewer.config = { ...component.config, scope: 'chapter' };
    viewer.configurable = true;
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const title = () => root.querySelector('.passageTitle')?.textContent?.trim();
    const numbers = () => Array.from(root.querySelectorAll('.holyVerse > sup'))
      .map(number => number.textContent?.trim());
    expect(title()).toBe('Genesis 1');
    expect(numbers()).toEqual(['1', '2', '3']);

    viewer.openSettings();
    viewer.draftConfig!.scope = 'range';
    viewer.draftConfig!.startVerse = 3;
    viewer.draftConfig!.endVerse = 2;
    viewer.saveSettings();
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(title()).toBe('Genesis 1:2-3');
    expect(numbers()).toEqual(['2', '3']);

    viewer.config = { ...viewer.config, scope: 'verse', verse: 2 };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(title()).toBe('Genesis 1:2');
    expect(numbers()).toEqual(['2']);

    viewer.config = { ...viewer.config, scope: 'range', startVerse: 2, endVerse: 2 };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(title()).toBe('Genesis 1:2');

    viewer.config = { ...viewer.config, scope: 'verse', verse: 99 };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(title()).toBeUndefined();
    expect(numbers()).toEqual([]);
    expect(root.textContent).toContain('No verses are available');
  });

  it('marks omitted range boundaries without assuming verses are ordered', () => {
    const fixture = TestBed.createComponent(HolyViewerComponent);
    const viewer = fixture.componentInstance;
    viewer.verses = [component.verses[2], component.verses[0], component.verses[1]];
    viewer.config = { ...component.config, scope: 'range', startVerse: 2, endVerse: 2 };
    fixture.detectChanges();
    const marks = () => fixture.nativeElement.querySelectorAll('.passageOmission').length;
    expect(marks()).toBe(2);
    viewer.config = { ...viewer.config, startVerse: 3, endVerse: 1 };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(marks()).toBe(0);
    viewer.config = { ...viewer.config, startVerse: 1, endVerse: 2 };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(marks()).toBe(1);
    expect(viewer.hasOmittedVersesBefore(viewer.visibleVerses)).toBeFalse();
    viewer.config = { ...viewer.config, scope: 'verse', verse: 2 };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(marks()).toBe(0);
    viewer.config = { ...viewer.config, scope: 'range', startVerse: 9, endVerse: 10 };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(marks()).toBe(0);
  });

  it('renders and edits individual spelling and numerology choices per codex and text size', async () => {
    const fixture = TestBed.createComponent(HolyViewerComponent);
    const viewer = fixture.componentInstance;
    const makeLine = (source: string, type: 'spelling' | 'numerology', id: string, label: string) =>
      ({ source, type, optionId: id, label, pieces: [{ text: label }] });
    const a = makeLine('a', 'spelling', 'one', 'First spelling');
    const b = makeLine('a', 'spelling', 'two', 'Second spelling');
    const n = makeLine('a', 'numerology', 'num', 'Number system');
    const n2 = makeLine('a', 'numerology', 'num2', 'Other number system');
    const other = makeLine('b', 'spelling', 'one', 'First spelling');
    viewer.verses = [{
      id: '1', bookName: 'Genesis', chapter: 1, verse: 1,
      lines: [
        { source: 'a', type: 'original', label: '', pieces: [{ text: 'original' }] },
        { source: 'b', type: 'interlinear', label: '', pieces: [{ text: 'related' }] },
        a, b, n, n2, other
      ]
    }];
    viewer.config = {
      ...structuredClone(defaultHolyViewerConfig),
      fontSize: 24,
      codices: { a: { ...structuredClone(defaultHolyViewerCodexConfig), selectedSpellings: ['two'], selectedNumerology: ['num'] } }
    };
    viewer.configurable = true;
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector<HTMLElement>('.holyViewer')!.style.fontSize).toBe('24px');
    expect(viewer.showLine(a)).toBeFalse();
    expect(viewer.showLine(b)).toBeTrue();
    expect(viewer.showLine(n)).toBeTrue();
    expect(viewer.showLine(other)).toBeFalse();

    viewer.openSettings();
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    await fixture.whenStable();
    const selectOption = (label: string) => {
      const item = Array.from(root.querySelectorAll('fieldset label')).find(el => el.textContent?.includes(label));
      item!.querySelector<HTMLInputElement>('input')!.click();
      fixture.detectChanges();
    };
    selectOption('First spelling');
    expect(viewer.optionSelected('a', 'spelling', 'one')).toBeTrue();
    expect(viewer.optionSelected('a', 'spelling', 'two')).toBeTrue();
    selectOption('Other number system');
    expect(viewer.optionSelected('a', 'numerology', 'num')).toBeTrue();
    expect(viewer.optionSelected('a', 'numerology', 'num2')).toBeTrue();
    selectOption('Second spelling');
    selectOption('Number system');
    const size = root.querySelector<HTMLInputElement>('input[name="fontSize"]')!;
    size.value = '32';
    size.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const apply = Array.from(root.querySelectorAll('button')).find(el => el.textContent?.trim() === 'Apply')!;
    apply.click();
    fixture.detectChanges();
    expect(viewer.config.fontSize).toBe(32);
    expect(root.querySelector<HTMLElement>('.holyViewer')!.style.fontSize).toBe('32px');
    expect(viewer.showLine(a)).toBeTrue();
    expect(viewer.showLine(b)).toBeFalse();
    expect(viewer.showLine(n)).toBeFalse();
    expect(viewer.showLine(n2)).toBeTrue();
    expect(viewer.showLine(other)).toBeFalse();
    expect(viewer.config.codices['a'].selectedSpellings).toEqual(['one']);
    expect(viewer.config.codices['a'].selectedNumerology).toEqual(['num2']);
  });

  it('renders spellings and numerology from all codices before any custom translation', () => {
    const fixture = TestBed.createComponent(HolyViewerComponent);
    const viewer = fixture.componentInstance;
    viewer.config = structuredClone(defaultHolyViewerConfig);
    viewer.config.codices['main'] = {
      ...structuredClone(defaultHolyViewerCodexConfig),
      selectedSpellings: ['spelling'],
      selectedNumerology: ['number']
    };
    viewer.config.codices['related'] = structuredClone(viewer.config.codices['main']);
    const line = (source: string, type: 'original' | 'interlinear' | 'customTranslation' | 'spelling' | 'numerology',
      text: string, optionId?: string) => ({ source, type, label: text, optionId, pieces: [{ text }] });
    const lines = [
      line('main', 'original', 'original'),
      line('main', 'customTranslation', 'translation A'),
      line('related', 'interlinear', 'related'),
      line('related', 'customTranslation', 'translation B'),
      line('related', 'spelling', 'spelling B', 'spelling'),
      line('related', 'numerology', 'number B', 'number'),
      line('main', 'spelling', 'spelling A', 'spelling'),
      line('main', 'numerology', 'number A', 'number')
    ];
    viewer.verses = [{ id: '1', bookName: 'Genesis', chapter: 1, verse: 1, lines }];
    fixture.detectChanges();

    const rendered = Array.from(fixture.nativeElement.querySelectorAll('.holyLine > span:last-child') as NodeListOf<HTMLElement>)
      .map(element => element.textContent?.trim());
    expect(rendered).toEqual([
      'original', 'related', 'spelling B', 'number B', 'spelling A', 'number A', 'translation A', 'translation B'
    ]);
    expect(lines[1].pieces[0].text).toBe('translation A');
    viewer.config.codices['related'].selectedNumerology = [];
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    const filtered = Array.from(fixture.nativeElement.querySelectorAll('.holyLine > span:last-child') as NodeListOf<HTMLElement>)
      .map(element => element.textContent?.trim());
    expect(filtered).toEqual([
      'original', 'related', 'spelling B', 'spelling A', 'number A', 'translation A', 'translation B'
    ]);
  });

  it('preserves legacy whole-category settings until individual choices are edited', () => {
    component.verses[0].lines = [
      { source: 'a', type: 'spelling', label: 'One', optionId: 'one', pieces: [] },
      { source: 'a', type: 'spelling', label: 'Two', optionId: 'two', pieces: [] }
    ];
    component.config.codices['a'] = structuredClone(defaultHolyViewerCodexConfig);
    component.config.codices['a'].sections.spelling = true;
    expect(component.showLine(component.verses[0].lines[0])).toBeTrue();
    component.configurable = true;
    component.openSettings();
    component.setOption('a', 'spelling', 'one', false);
    component.saveSettings();
    expect(component.showLine(component.verses[0].lines[0])).toBeFalse();
    expect(component.showLine(component.verses[0].lines[1])).toBeTrue();
  });

  it('uses the base font size for older configurations and rejects invalid dialog input', async () => {
    const fixture = TestBed.createComponent(HolyViewerComponent);
    const viewer = fixture.componentInstance;
    viewer.config = structuredClone(defaultHolyViewerConfig);
    delete viewer.config.fontSize;
    viewer.configurable = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.holyViewer').style.fontSize).toBe('20px');
    viewer.openSettings();
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input[name="fontSize"]') as HTMLInputElement;
    input.value = '0';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const apply = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.trim() === 'Apply')!;
    expect(apply.disabled).toBeTrue();
    viewer.saveSettings();
    expect(viewer.settingsOpen).toBeTrue();
    expect(viewer.config.fontSize).toBeUndefined();
  });

  it('applies and edits all text alignments, defaulting to left for old configurations', () => {
    const fixture = TestBed.createComponent(HolyViewerComponent);
    const viewer = fixture.componentInstance;
    viewer.config = structuredClone(defaultHolyViewerConfig);
    delete viewer.config.textAlignment;
    viewer.configurable = true;
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const content = root.querySelector<HTMLElement>('.holyViewer')!;
    expect(content.style.textAlign).toBe('left');

    viewer.openSettings();
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    for (const name of ['scope', 'displayMode']) {
      const select = root.querySelector<HTMLSelectElement>(`select[name="${name}"]`)!;
      expect(getComputedStyle(select.parentElement!).flexDirection).toBe('row');
    }
    for (const [label, alignment] of [
      ['Align left', 'left'], ['Align center', 'center'], ['Align right', 'right'], ['Justify', 'justify']
    ] as const) {
      const button = root.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
      button.click();
      fixture.detectChanges();
      expect(button.getAttribute('aria-pressed')).toBe('true');
      expect(viewer.draftConfig?.textAlignment).toBe(alignment);
    }
    viewer.saveSettings();
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(content.style.textAlign).toBe('justify');
    viewer.config = { ...viewer.config, textAlignment: 'right' };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(content.style.textAlign).toBe('right');
  });

  it('allows line labels to be hidden in settings and JSON without hiding passage titles', async () => {
    const fixture = TestBed.createComponent(HolyViewerComponent);
    const viewer = fixture.componentInstance;
    viewer.config = structuredClone(defaultHolyViewerConfig);
    delete viewer.config.showLineLabels;
    viewer.configurable = true;
    viewer.verses = [{
      id: '1', bookName: 'Genesis', chapter: 1, verse: 1,
      lines: [{ source: 'a', type: 'customTranslation', label: 'Translation', pieces: [{ text: 'text' }] }]
    }];
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('.holyLineLabel')?.textContent?.trim()).toBe('Translation');
    viewer.openSettings();
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    await fixture.whenStable();
    const checkbox = root.querySelector<HTMLInputElement>('input[name="showLineLabels"]')!;
    expect(checkbox.checked).toBeTrue();
    checkbox.click();
    fixture.detectChanges();
    Array.from(root.querySelectorAll('button')).find(button => button.textContent?.trim() === 'Apply')!.click();
    fixture.detectChanges();
    expect(viewer.config.showLineLabels).toBeFalse();
    expect(root.querySelector('.holyLineLabel')).toBeNull();
    expect(root.querySelector('.passageTitle')?.textContent).toContain('Genesis 1:1');
    expect(root.querySelector('.holyLine')?.textContent).toContain('text');
    viewer.config = { ...viewer.config, showLineLabels: true };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(root.querySelector('.holyLineLabel')).not.toBeNull();
  });

  it('scales colored and unassociated text proportionally to the configured font size', () => {
    const fixture = TestBed.createComponent(HolyViewerComponent);
    const viewer = fixture.componentInstance;
    viewer.config = { ...structuredClone(defaultHolyViewerConfig), fontSize: 30 };
    viewer.verses = [{
      id: '1', bookName: 'Genesis', chapter: 1, verse: 1,
      lines: [{ source: 'a', type: 'customTranslation', label: 'Translation', pieces: [
        { text: 'colored', color: '1' }, { text: 'plain', color: '' }
      ] }]
    }];
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const colored = root.querySelector<HTMLElement>('.prisma1')!;
    const plain = root.querySelector<HTMLElement>('.prisma')!;
    expect(getComputedStyle(colored).fontSize).toBe('30px');
    expect(getComputedStyle(plain).fontSize).toBe('24px');
    viewer.config = { ...viewer.config, fontSize: 40 };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(getComputedStyle(colored).fontSize).toBe('40px');
    expect(getComputedStyle(plain).fontSize).toBe('32px');
  });

  it('limits the settings dialog including padding and allows its content to scroll', () => {
    const fixture = TestBed.createComponent(HolyViewerComponent);
    const viewer = fixture.componentInstance;
    viewer.config = structuredClone(defaultHolyViewerConfig);
    viewer.configurable = true;
    viewer.openSettings();
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('.holyViewerDialog') as HTMLElement;
    const extraContent = document.createElement('div');
    extraContent.style.height = `${window.innerHeight * 2}px`;
    dialog.appendChild(extraContent);
    const rect = dialog.getBoundingClientRect();
    expect(rect.top).toBeGreaterThanOrEqual(0);
    expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight);
    expect(dialog.scrollHeight).toBeGreaterThan(dialog.clientHeight);
    expect(getComputedStyle(dialog).overflowY).toBe('auto');
  });

  it('updates available codices for the draft passage without losing individual settings', () => {
    component.verses[0].lines = [
      { type: 'original', source: 'hebrew', label: 'Original', pieces: [] },
      { type: 'interlinear', source: 'samaritan', label: 'Samaritan', pieces: [] }
    ];
    component.verses[1].lines = [
      { type: 'original', source: 'hebrew', label: 'Original', pieces: [] },
      { type: 'interlinear', source: 'greek', label: 'Greek', pieces: [] }
    ];
    component.verses[2].lines = [{ type: 'original', source: 'hebrew', label: 'Original', pieces: [] }];
    component.configurable = true;
    component.openSettings();
    expect(component.availableCodices).toEqual(['hebrew', 'samaritan']);
    component.draftCodexConfig('samaritan').showOriginal = false;
    expect(component.availableCodices).toEqual(['hebrew', 'samaritan']);

    component.draftConfig!.verse = 2;
    expect(component.availableCodices).toEqual(['hebrew', 'greek']);
    component.draftConfig!.scope = 'range';
    component.draftConfig!.startVerse = 2;
    component.draftConfig!.endVerse = 3;
    expect(component.availableCodices).toEqual(['hebrew', 'greek']);
    component.draftConfig!.scope = 'chapter';
    expect(component.availableCodices).toEqual(['hebrew', 'samaritan', 'greek']);
    expect(component.draftCodexConfig('samaritan').showOriginal).toBeFalse();
    expect(component.draftCodexConfig('greek').showOriginal).toBeTrue();
    component.saveSettings();
    expect(component.showLine(component.verses[0].lines[1])).toBeFalse();
    expect(component.showLine(component.verses[1].lines[1])).toBeTrue();
  });

  it('isolates variations even when codices share a translation target', () => {
    const piece = { text: 'base', variations: { singular: 'changed' } };
    const line = { type: 'customTranslation' as const, label: '', source: 'hebrew', variationTarget: 'target', pieces: [piece] };
    component.configurable = true;
    component.openSettings();
    component.setVariation({ source: 'hebrew', target: 'target', id: 'singular', name: 'Singular' }, true);
    component.saveSettings();
    expect(component.pieceText(line, piece)).toBe('changed');
    expect(component.pieceText({ ...line, source: 'greek' }, piece)).toBe('base');
  });

  it('only opens and emits editable settings when configurability is enabled', () => {
    expect(component.getCodexConfig('Source').showOriginalLexicalTooltip).toBeTrue();
    component.openSettings();
    expect(component.settingsOpen).toBeFalse();

    component.configurable = true;
    component.openSettings();
    expect(component.settingsOpen).toBeTrue();
    component.draftCodexConfig('Source').showOriginalLexicalTooltip = false;

    let updated = true;
    component.configChange.subscribe(config => updated = config.codices['Source'].showOriginalLexicalTooltip);
    component.saveSettings();

    expect(updated).toBeFalse();
    expect(component.settingsOpen).toBeFalse();
  });

  it('applies selected variations in selection order without changing their source pieces', () => {
    const line = {
      type: 'customTranslation' as const,
      label: 'Custom translation',
      source: 'Source',
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
        source: 'Source',
        label: 'Custom translation',
        pieces: [
          { text: 'linked', color: '2' },
          { text: ' ', separator: true },
          { text: 'unlinked', color: '' },
          { text: '.', color: '' }
        ]
      }]
    }];
    fixture.detectChanges();

    const textSpans = fixture.nativeElement.querySelectorAll('.holyLine > span:last-child > span') as NodeListOf<HTMLElement>;
    expect(textSpans[0].className).toBe('prisma2');
    expect(textSpans.length).toBe(3);
    expect(textSpans[1].className).toBe('prisma');
    expect(textSpans[1].hasAttribute('data-punctuation')).toBeFalse();
    expect(textSpans[2].className).toBe('prisma');
    expect(textSpans[2].hasAttribute('data-punctuation')).toBeTrue();

    fixture.componentInstance.config = { ...fixture.componentInstance.config, displayMode: 'wordOfGod' };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(textSpans[0].className).toBe('');
    expect(textSpans[2].className).toBe('');
    expect(textSpans[2].hasAttribute('data-punctuation')).toBeFalse();
  });

  it('renders separators as text but preserves uncolored nonempty segments as spans', () => {
    const fixture = TestBed.createComponent(HolyViewerComponent);
    fixture.componentInstance.config = structuredClone(defaultHolyViewerConfig);
    fixture.componentInstance.verses = [{
      id: '1', bookName: 'Genesis', chapter: 1, verse: 1,
      lines: [{
        type: 'interlinear', source: 'geez', label: 'Interlinear',
        pieces: [
          { text: '' },
          { text: 'ቃል', color: '', title: 'word' },
          { text: '፡ ', separator: true },
          { text: 'ሰላም' }
        ]
      }]
    }];
    fixture.detectChanges();

    const content = fixture.nativeElement.querySelector('.holyLine > span:last-child') as HTMLElement;
    expect(content.textContent).toBe('ቃል፡ ሰላም');
    expect(Array.from(content.children).map(child => child.textContent)).toEqual(['ቃል', 'ሰላም']);
    expect(content.children[0].className).toBe('prisma');
    expect(content.children[0].getAttribute('title')).toBe('word');
    expect(content.children[1].className).toBe('');
    expect(Array.from(content.childNodes).some(node => node.nodeType === Node.TEXT_NODE && node.textContent === '፡ '))
      .toBeTrue();
  });
});
