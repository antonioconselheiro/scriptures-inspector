import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { Project } from '@domain/project-model';
import { SystemService } from '@shared/system/system-service';
import { PatternsService } from '../patterns-service';
import { AddPatternContextMenu } from './add-pattern-context-menu';
import { SegmentationChanges } from '../translation-editor/shared/segmentation-changes';

describe('AddPatternContextMenu', () => {
  it('adds a valid segment-specific suffix and saves the affected metadata', () => {
    const patterns: BookMetadataTarget = {
      chapters: [],
      patterns: { distinct: {}, prefix: [], suffix: [], lexeme: [] },
      lexical: {}
    };
    const current: CurrentChapter = { book: 'GEN', chapter: 3 };
    const project: Project = {
      name: 'Test',
      path: '/test',
      target: { language: 'portuguese' },
      normalization: { hebrew: ['demassoretify'] },
      structures: []
    };
    const systemService = jasmine.createSpyObj<SystemService>(
      'SystemService',
      ['triggerSaveCurrentBookMetadata', 'triggerSaveCurrentBookInterlinear']
    );
    const menu = new AddPatternContextMenu(new PatternsService(new SegmentationChanges()), systemService);
    menu.bookTarget = patterns;
    menu.current = current;
    menu.project = project;
    menu.sourceLanguage = 'hebrew';
    menu.selectedWord = 'גד';
    menu.selectedSegment = 'אבגד';

    expect(menu.canDefineDistinct('prefix')).toBeFalse();
    expect(menu.canDefineDistinct('suffix')).toBeTrue();
    menu.onAddDistinctPattern('suffix');

    expect(patterns.patterns.distinct).toEqual({
      'אבגד': { suffix: 'גד' }
    });
    expect(systemService.triggerSaveCurrentBookMetadata).toHaveBeenCalledOnceWith(current);
    expect(systemService.triggerSaveCurrentBookInterlinear).toHaveBeenCalledOnceWith(current);
  });

  it('defines whole-word rules independently and rejects overlapping edges', () => {
    const patterns: BookMetadataTarget = {
      chapters: [], patterns: { distinct: {}, prefix: [], suffix: [], lexeme: [] }, lexical: {}
    };
    const system = jasmine.createSpyObj<SystemService>('SystemService',
      ['triggerSaveCurrentBookMetadata', 'triggerSaveCurrentBookInterlinear']);
    const service = new PatternsService(new SegmentationChanges());
    const menu = new AddPatternContextMenu(service, system);
    menu.bookTarget = patterns;
    menu.current = { book: 'GEN', chapter: 1 };
    menu.project = {
      name: 'Test', path: '/test', target: { language: 'portuguese' },
      normalization: { hebrew: ['demassoretify'] }, structures: []
    };
    menu.sourceLanguage = 'hebrew';
    menu.selectedSegment = 'ם';
    menu.selectedFullWord = 'לָהֶ֜ם';
    menu.selectedWord = 'ם';
    menu.selectionAtWordEnd = true;
    expect(menu.canDefineDistinct('suffix')).toBeFalse();
    expect(menu.canDefineDistinct('suffix', 'word')).toBeTrue();
    menu.onAddDistinctPattern('suffix', 'word');
    expect(patterns.patterns.wordDistinct).toEqual({ 'לָהֶ֜ם': { suffix: 'ם' } });
    expect(patterns.patterns.distinct).toEqual({});
    expect(system.triggerSaveCurrentBookMetadata).toHaveBeenCalledOnceWith(menu.current);
    expect(system.triggerSaveCurrentBookInterlinear).toHaveBeenCalledOnceWith(menu.current);
    expect(() => service.addDistinctPattern(patterns.patterns, 'prefix',
      { name: 'Hebrew', label: 'hebrew' }, 'לָהֶ֜ם', 'לָהֶ֜ם', 'word'))
      .toThrowError();
  });
});
