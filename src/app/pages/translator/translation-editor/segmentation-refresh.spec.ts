import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { Project } from '@domain/project-model';
import { ProjectData } from '@domain/project-data-model';
import { ProjectStructureMetadata } from '@domain/project-structure-metadata-model';
import { SourceBook } from '@domain/source-book-model';
import { SystemService } from '@shared/system/system-service';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';
import { AddPatternContextMenu } from '../add-pattern-context-menu/add-pattern-context-menu';
import { DefineFieldMorphemeRuleContextMenu } from '../define-field-morpheme-rule-context-menu/define-field-morpheme-rule-context-menu';
import { InterlinearToolsContextMenu } from '../interlinear-tools-context-menu/interlinear-tools-context-menu';
import { PatternsService } from '../patterns-service';
import { PinnedRowsService } from './pinned-rows-service';
import { ScriptureMetadataComponent } from './scripture-metadata/scripture-metadata-component';
import { ProjectDataService } from './shared/project/project-data-service';
import { ProjectMetadataService } from './shared/project/project-metadata-service';

@Component({
  imports: [ScriptureMetadataComponent, AddPatternContextMenu, DefineFieldMorphemeRuleContextMenu, InterlinearToolsContextMenu],
  template: `
    <app-add-pattern-context-menu #patterns [current]="current" [project]="project" />
    <app-define-field-morpheme-rule-context-menu #rules [current]="current" />
    <app-interlinear-tools-context-menu #tools [current]="current" />
    @for (verse of source.chapters[0].verses; track verse.verse; let i = $index) {
      <app-scripture-metadata-component
        [project]="project" [projectData]="projectData" [structure]="structure"
        [codexMetadataRecord]="codices" [sourceBookRecord]="sources" [sourceLanguage]="'geez'"
        [current]="current" [sourceBook]="source" [sourceVerse]="verse" [verseIndex]="i"
        [bookTarget]="metadata" [customTranslation]="translation"
        [addPatternMenuRef]="patterns" [defineMorphemeRef]="rules" [interlinearToolsRef]="tools" />
    }
  `
})
class SegmentationHost {
  current = { book: 'GEN', chapter: 1 };
  metadata: BookMetadataTarget = {
    chapters: [],
    patterns: { prefix: ['ለይ'], suffix: [], lexeme: [] },
    lexical: { 'ኩን': { value: 'be' } }
  };
  translation: BookTranslationTarget = {
    variations: {},
    chapters: [{ chapter: 1, verses: [
      { verse: 3, text: 'be', metadata: [{ size: 2, value: '' }], variations: {} },
      { verse: 6, text: 'be', metadata: [{ size: 2, value: '' }], variations: {} }
    ] }]
  };
  source: SourceBook = { chapters: [{ chapter: 1, verses: [
    { verse: 3, text: 'ለይኩን' }, { verse: 6, text: 'ለይኩን' }
  ] }] };
  linkedSource: SourceBook = { chapters: [{ chapter: 1, verses: [
    { verse: 3, text: 'אֲב' }, { verse: 6, text: 'אֲב' }
  ] }] };
  structure: ProjectStructureMetadata = {
    source: 'geez', metadataTarget: 'geez-metadata',
    interlinear: [{ source: 'hebrew', metadataTarget: 'hebrew-metadata', interlinearTarget: 'hebrew-interlinear' }]
  };
  project: Project = {
    name: 'Test', path: '/test', target: { language: 'portuguese' },
    normalization: { hebrew: ['demassoretify'] }, structures: [this.structure]
  };
  projectData: ProjectData = {
    'geez-metadata': this.metadata,
    'hebrew-metadata': {
      chapters: [], patterns: { prefix: [], suffix: [], lexeme: [] },
      lexical: { 'אב': { value: 'father' } }
    },
    'hebrew-interlinear': {}
  };
  sources = { geez: this.source, hebrew: this.linkedSource };
  codices = {
    geez: { name: 'Geez', language: 'geez' as const },
    hebrew: { name: 'Hebrew', language: 'hebrew' as const }
  };
}

describe('segmentation refresh in the translation editor', () => {
  let fixture: ComponentFixture<SegmentationHost>;
  let host: SegmentationHost;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SegmentationHost],
      providers: [
        provideZonelessChangeDetection(),
        PinnedRowsService,
        { provide: SystemService, useValue: jasmine.createSpyObj('SystemService', [
          'triggerSaveCurrentBookMetadata', 'triggerSaveCurrentBookInterlinear', 'triggerSaveCurrentBookTranslations'
        ]) }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(SegmentationHost);
    host = fixture.componentInstance;
    root = fixture.nativeElement;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  function geezFields(): HTMLInputElement[] {
    return Array.from(root.querySelectorAll<HTMLInputElement>(
      'app-scripture-metadata-component input[aria-label="Lexical for ኩን"]'
    ));
  }

  async function chooseRule(field: HTMLInputElement, label: string): Promise<void> {
    field.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    await fixture.whenStable();
    const option = Array.from(root.querySelectorAll('app-define-field-morpheme-rule-context-menu li'))
      .find(item => item.textContent?.includes(label));
    expect(option).toBeDefined();
    option?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 10));
    await fixture.whenStable();
  }

  it('opens the size menu from the rendered input and shifts only sizes', async () => {
    const verse = host.translation.chapters[0].verses[0];
    verse.text = 'aa bbb cccc';
    verse.metadata = [
      { size: 2, value: '0-a' },
      { size: 3, value: '1-b', isWordOfGod: true },
      { size: 4, value: '2-c' }
    ];
    fixture.detectChanges();
    const input = root.querySelector<HTMLInputElement>(
      'app-custom-translation-component input[aria-label="Word span for position 2"]'
    );
    expect(input).toBeTruthy();
    input?.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    const items = Array.from(root.querySelectorAll('app-interlinear-tools-context-menu li'));
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Move one to RIGHT');
    items[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(verse.metadata.map(item => item.size)).toEqual([2, 3, 3]);
    expect(verse.metadata.map(item => item.value)).toEqual(['0-a', '1-b', '2-c']);
    expect(verse.metadata[1].isWordOfGod).toBeTrue();
    expect(TestBed.inject(SystemService).triggerSaveCurrentBookTranslations).toHaveBeenCalledWith(host.current);
  });

  it('creates a whole-word suffix from a selected segment and refreshes repeated lexical fields', async () => {
    host.metadata.lexical['ኩን'] = { value: 'general', suffix: 'suffix value' };
    const text = root.querySelector<HTMLElement>(
      'span[data-pattern-word-index="0"][title="index:1"]'
    )?.firstChild;
    expect(text).toBeTruthy();
    if (!text) return;
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(text);
    selection?.removeAllRanges();
    selection?.addRange(range);
    text.parentElement?.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    await fixture.whenStable();

    const option = Array.from(root.querySelectorAll('app-add-pattern-context-menu li'))
      .find(item => item.textContent?.includes('suffix for whole word ለይኩን'));
    expect(option).toBeDefined();
    option?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    selection?.removeAllRanges();
    await fixture.whenStable();

    expect(host.metadata.patterns.wordDistinct).toEqual({ 'ለይኩን': { suffix: 'ኩን' } });
    expect(geezFields().map(field => [field.className, field.value]))
      .toEqual([['suffix', 'suffix value'], ['suffix', 'suffix value']]);
    const system = TestBed.inject(SystemService);
    expect(system.triggerSaveCurrentBookMetadata).toHaveBeenCalledWith(host.current);
    expect(system.triggerSaveCurrentBookInterlinear).toHaveBeenCalledWith(host.current);
  });

  it('offers whole-word prefix rules in the per-word row only at the word edge', async () => {
    const spans = root.querySelectorAll<HTMLElement>(
      'app-scripture-metadata-component span[data-pattern-word-index="0"][title="index:0"]'
    );
    const text = spans[1]?.firstChild;
    expect(text).toBeTruthy();
    if (!text) return;
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(text);
    selection?.removeAllRanges();
    selection?.addRange(range);
    text.parentElement?.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    await fixture.whenStable();
    expect(root.querySelector('app-add-pattern-context-menu')?.textContent)
      .toContain('prefix for whole word ለይኩን');

    range.setStart(text, 1);
    selection?.removeAllRanges();
    selection?.addRange(range);
    text.parentElement?.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    await fixture.whenStable();
    expect(root.querySelector('app-add-pattern-context-menu')?.textContent)
      .not.toContain('prefix for whole word');
    selection?.removeAllRanges();
  });

  it('does not offer a whole-word rule for a selection spanning different words', async () => {
    const spans = root.querySelectorAll<HTMLElement>(
      'app-scripture-metadata-component span[data-pattern-word-index="0"][title="index:1"]'
    );
    const first = spans[0]?.firstChild;
    const otherVerse = spans[2]?.firstChild;
    expect(first && otherVerse).toBeTruthy();
    if (!first || !otherVerse) return;
    const selection = window.getSelection();
    const range = document.createRange();
    range.setStart(first, 0);
    range.setEnd(otherVerse, otherVerse.textContent?.length ?? 0);
    selection?.removeAllRanges();
    selection?.addRange(range);
    first.parentElement?.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    await fixture.whenStable();
    expect(root.querySelector('app-add-pattern-context-menu')?.textContent).not.toContain('for whole word');
    selection?.removeAllRanges();
  });

  it('updates repeated lexical inputs and interlinear output without another interaction', async () => {
    const parsePatterns = spyOn(TestBed.inject(ProjectMetadataService), 'parsePattern').and.callThrough();
    const splitMatrix = spyOn(TestBed.inject(ProjectDataService), 'splitIntoMatrix').and.callThrough();
    const fields = geezFields();
    expect(fields.length).toBe(2);
    fields[0].value = 'haja|exista';
    fields[0].dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();

    expect(geezFields().map(field => field.value)).toEqual(['haja|exista', 'haja|exista']);
    const associationRow = root.querySelector('app-interlinear-component select')?.closest('tr');
    expect(associationRow?.previousElementSibling?.textContent).toContain('father');
    expect(parsePatterns).not.toHaveBeenCalled();
    expect(splitMatrix).not.toHaveBeenCalled();
  });

  it('clears the same lexical entries in other verses', async () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const firstField = geezFields()[0];
    const button = firstField.closest('tr')?.querySelector<HTMLButtonElement>(
      'button[aria-label="Clear lexical entries for verse"]'
    );
    expect(button).not.toBeNull();
    button?.click();
    await fixture.whenStable();
    expect(geezFields().map(field => field.value)).toEqual(['', '']);
  });

  it('updates the lexical row of a linked interlinear across verses', async () => {
    const fields = Array.from(root.querySelectorAll<HTMLInputElement>(
      'app-interlinear-component input[aria-label="Lexical for אֲב"]'
    ));
    expect(fields.length).toBe(2);
    fields[0].value = 'ancestor';
    fields[0].dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();

    expect(fields[1].value).toBe('ancestor');
    const rows = Array.from(root.querySelectorAll('app-interlinear-component select'))
      .map(select => select.closest('tr')?.previousElementSibling?.textContent);
    expect(rows.length).toBe(2);
    expect(rows.every(text => text?.includes('ancestor'))).toBeTrue();
  });

  it('updates prefix rules immediately and restores all-context values', async () => {
    const prefixFields = () => Array.from(root.querySelectorAll<HTMLInputElement>(
      'app-scripture-metadata-component input[aria-label="Lexical for ለይ"]'
    ));
    host.metadata.lexical['ለይ'] = { value: 'all' };
    await chooseRule(prefixFields()[0], 'Lexical only to prefix');
    expect(prefixFields().map(field => [field.className, field.value])).toEqual([['prefix', ''], ['prefix', '']]);

    prefixFields()[0].value = 'only prefix';
    prefixFields()[0].dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(prefixFields()[1].value).toBe('only prefix');

    await chooseRule(prefixFields()[0], 'Lexical only to prefix');
    expect(prefixFields()[1].value).toBe('only prefix');

    spyOn(window, 'confirm').and.returnValue(true);
    await chooseRule(prefixFields()[0], 'In all contexts');
    expect(prefixFields().map(field => [field.className, field.value])).toEqual([['root', 'all'], ['root', 'all']]);
  });

  it('updates suffix rules across verses and preserves them when removal is cancelled', async () => {
    TestBed.inject(PatternsService).addPattern(host.metadata.patterns, 'suffix', languageMetadataRecord.geez, 'ን');
    await fixture.whenStable();
    const suffixFields = () => Array.from(root.querySelectorAll<HTMLInputElement>(
      'app-scripture-metadata-component input[aria-label="Lexical for ን"]'
    ));
    await chooseRule(suffixFields()[0], 'Lexical only to suffix');
    expect(suffixFields().map(field => field.className)).toEqual(['suffix', 'suffix']);
    suffixFields()[0].value = 'suffix';
    suffixFields()[0].dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(suffixFields()[1].value).toBe('suffix');
    spyOn(window, 'confirm').and.returnValue(false);
    await chooseRule(suffixFields()[0], 'In all contexts');
    expect(suffixFields().map(field => [field.className, field.value])).toEqual([
      ['suffix', 'suffix'], ['suffix', 'suffix']
    ]);
  });

  it('refreshes segmentation in metadata, interlinear options and custom translation', async () => {
    const patterns = TestBed.inject(PatternsService);
    patterns.addPattern(host.metadata.patterns, 'suffix', languageMetadataRecord.geez, 'ን');
    await fixture.whenStable();

    const fields = root.querySelectorAll('input[aria-label="Lexical for ን"]');
    expect(fields.length).toBe(2);
    const interlinear = root.querySelector('app-interlinear-component select');
    expect(interlinear?.textContent).toContain('ን');
    const customSelect = root.querySelector('app-custom-translation-component select');
    expect(customSelect?.textContent).toContain('ን');

    patterns.deletePattern(host.metadata.patterns, 'suffix', 0);
    await fixture.whenStable();
    expect(root.querySelectorAll('input[aria-label="Lexical for ን"]').length).toBe(0);
    expect(root.querySelector('app-custom-translation-component select')?.textContent).not.toMatch(/\(\d+ - ን \)/);
  });
});
