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
