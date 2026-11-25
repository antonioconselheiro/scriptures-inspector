import { ChangeDetectorRef } from '@angular/core';
import { CustomTranslationComponent } from './custom-translation-component';
import { ProjectCustomTranslationService } from '../shared/project/project-custom-translation-service';
import { ProjectDataService } from '../shared/project/project-data-service';
import { ProjectInterlinearService } from '../shared/project/project-interlinear-service';
import { ProjectMetadataService } from '../shared/project/project-metadata-service';
import { SystemService } from '@shared/system/system-service';
import { InterlinearToolsContextMenu } from '../../interlinear-tools-context-menu/interlinear-tools-context-menu';
import { BookTranslationTargetMetadata } from '@domain/book-translation-target-metadata-model';
import { InterlinearToolsContextMenuTrigger } from '../../interlinear-tools-context-menu/interlinear-tools-context-menu-trigger';
import { SegmentationChanges } from '../shared/segmentation-changes';

describe('CustomTranslationComponent Word of God selection', () => {
  it('updates every editable selected segment while leaving inherited metadata untouched', () => {
    const translations = jasmine.createSpyObj<ProjectCustomTranslationService>(
      'ProjectCustomTranslationService', ['setAsWordOfGodOverriding']
    );
    const component = new CustomTranslationComponent(
      jasmine.createSpyObj<ChangeDetectorRef>('ChangeDetectorRef', ['detectChanges']),
      jasmine.createSpyObj<ProjectDataService>('ProjectDataService', ['splitIntoMatrix']),
      jasmine.createSpyObj<ProjectMetadataService>('ProjectMetadataService', ['getScriptureMetadataWordOfGod']),
      translations,
      jasmine.createSpyObj<ProjectInterlinearService>('ProjectInterlinearService', ['getOriginWordIndex']),
      new SegmentationChanges()
    );
    spyOn(component, 'getScriptureMetadataWordOfGodOverriding').and.callFake(index => ({
      checked: index === 1,
      readonly: index === 1
    }));

    component.setAsWordOfGodOverriding(false, [0, 1, 2]);
    expect(translations.setAsWordOfGodOverriding.calls.count()).toBe(2);
    expect(translations.setAsWordOfGodOverriding.calls.argsFor(0)[5]).toBe(0);
    expect(translations.setAsWordOfGodOverriding.calls.argsFor(1)[5]).toBe(2);
    expect(translations.setAsWordOfGodOverriding.calls.allArgs().map(args => args[4])).toEqual([false, false]);
  });

  describe('CustomTranslationComponent interlinear tools', () => {
    let component: CustomTranslationComponent;
    let menu: InterlinearToolsContextMenu;
    let metadata: BookTranslationTargetMetadata[];
    let saves: jasmine.Spy;
    let interlinear: jasmine.SpyObj<ProjectInterlinearService>;

    beforeEach(() => {
      const dataService = jasmine.createSpyObj<ProjectDataService>('ProjectDataService', ['splitIntoMatrix']);
      const systemService = jasmine.createSpyObj<SystemService>('SystemService', ['triggerSaveCurrentBookTranslations']);
      saves = systemService.triggerSaveCurrentBookTranslations as jasmine.Spy;
      const translations = new ProjectCustomTranslationService(dataService, systemService);
      interlinear = jasmine.createSpyObj<ProjectInterlinearService>('ProjectInterlinearService', [
        'getOriginWordIndex', 'fillSequentiallyAllAssociationsToTheRight',
        'moveOneWordToAllAssociationsToTheRight', 'returnOneWordToAllAssociationsToTheRight'
      ]);
      component = new CustomTranslationComponent(
        jasmine.createSpyObj<ChangeDetectorRef>('ChangeDetectorRef', ['detectChanges']),
        dataService,
        jasmine.createSpyObj<ProjectMetadataService>('ProjectMetadataService', ['getScriptureMetadataWordOfGod']),
        translations,
        interlinear,
        new SegmentationChanges()
      );
      menu = new InterlinearToolsContextMenu(interlinear);
      component.interlinearToolsRef = menu;
      component.current = { book: 'GEN', chapter: 1 };
      component.sourceVerse = { verse: 1, text: 'a b c d' };
      component.sourceBook = { chapters: [{ chapter: 1, verses: [component.sourceVerse] }] };
      metadata = [
        { size: 2, value: '0-a', isWordOfGod: true },
        { size: 3, value: '1-b' },
        { size: 4, value: '2-c', isWordOfGod: false },
        { size: 5, value: '3-d' }
      ];
      component.customTranslation = {
        variations: {},
        chapters: [{ chapter: 1, verses: [{ verse: 1, text: 'aa bbb cccc ddddd', metadata, variations: {} }] }]
      };
      component.wordMatrix = ['a', 'b', 'c', 'd'].map((word, index) => ({
        segments: [{ index, word, morpheme: 'root' }]
      }));
      spyOn(component, 'castSegmentIntoMetadataIndex').and.callFake(segment => `${segment.index}-${segment.word}`);
    });

    function open(index: number, count = 4): void {
      const event = new MouseEvent('contextmenu', { cancelable: true, clientX: 20, clientY: 30 });
      component.openInterlinearTools(event, index, count);
      expect(event.defaultPrevented).toBeTrue();
      expect([menu.visible, menu.x, menu.y]).toEqual([true, 20, 30]);
    }

    it('clears only the selected association without prompting or changing sizes', () => {
      const confirmation = spyOn(window, 'confirm');
      component.onChangeCustomTranslationInterlinearMetadata('', 1);
      expect(metadata.map(item => item.value)).toEqual(['0-a', '', '2-c', '3-d']);
      expect(metadata.map(item => item.size)).toEqual([2, 3, 4, 5]);
      expect(confirmation).not.toHaveBeenCalled();
      expect(saves).toHaveBeenCalledWith(component.current);
    });

    it('moves and returns associations from any position without moving sizes or other metadata', () => {
      const original = structuredClone(metadata);
      open(1);
      menu.onClickMoveOneToRight();
      expect(metadata.map(item => item.value)).toEqual(['0-a', '1-b', '1-b', '2-c']);
      expect(metadata.map(item => item.size)).toEqual([2, 3, 4, 5]);
      expect(metadata.map(item => item.isWordOfGod)).toEqual([true, undefined, false, undefined]);

      menu.onClickReturnOneToRight();
      expect(metadata.map(item => item.value)).toEqual(['0-a', '1-b', '2-c', '']);
      expect(metadata.map(item => item.size)).toEqual(original.map(item => item.size));
      expect(saves.calls.count()).toBe(6);
    });

    it('fills sequentially from the selected association and honors overwrite cancellation', () => {
      metadata[1].value = '0-a';
      const confirmation = spyOn(window, 'confirm').and.returnValue(false);
      open(1);
      menu.onClickFillSequentially();
      expect(metadata.map(item => item.value)).toEqual(['0-a', '0-a', '2-c', '3-d']);
      expect(saves).not.toHaveBeenCalled();
      confirmation.and.returnValue(true);
      menu.onClickFillSequentially();
      expect(metadata.map(item => item.value)).toEqual(['0-a', '0-a', '1-b', '2-c']);
      expect(metadata.map(item => item.size)).toEqual([2, 3, 4, 5]);
    });

    it('fills from the corresponding source position when empty and clears beyond the source', () => {
      metadata[2].value = '';
      metadata[3].value = '';
      component.wordMatrix = component.wordMatrix.slice(0, 3);
      const confirmation = spyOn(window, 'confirm');
      open(2);
      menu.onClickFillSequentially();
      expect(metadata.map(item => item.value)).toEqual(['0-a', '1-b', '2-c', '']);
      expect(confirmation).not.toHaveBeenCalled();
    });

    it('moves an empty association and handles the last position', () => {
      metadata[1].value = '';
      open(1);
      menu.onClickMoveOneToRight();
      expect(metadata.map(item => item.value)).toEqual(['0-a', '', '', '2-c']);
      open(3);
      menu.onClickReturnOneToRight();
      expect(metadata.map(item => item.value)).toEqual(['0-a', '', '', '']);
      expect(metadata.map(item => item.size)).toEqual([2, 3, 4, 5]);
    });

    it('switches the shared menu back to the original interlinear actions', () => {
      open(1);
      const trigger = new InterlinearToolsContextMenuTrigger();
      trigger.contextMenu = menu;
      trigger.project = { name: 'test', path: '', target: { language: 'English' }, structures: [] };
      trigger.sourceLanguage = 'hebrew';
      trigger.interlinearTarget = {};
      trigger.originSource = 'source';
      trigger.sourceVerse = component.sourceVerse;
      trigger.wordMatrix = component.wordMatrix;
      trigger.originWordMatrix = component.wordMatrix;
      trigger.translationWordIndex = 0;
      trigger.translationWord = 'a';
      trigger.interlinearValue = '0-a';
      trigger.onRightClick(new MouseEvent('contextmenu', { cancelable: true }));
      menu.onClickMoveOneToRight();
      expect(metadata.map(item => item.value)).toEqual(['0-a', '1-b', '2-c', '3-d']);
      expect(saves).not.toHaveBeenCalled();
      expect(interlinear.moveOneWordToAllAssociationsToTheRight).toHaveBeenCalled();
      menu.onDocumentClick();
      expect(menu.visible).toBeFalse();
    });

    it('preserves the implicit final segment when an association creates its metadata', () => {
      metadata.pop();
      open(2);
      menu.onClickMoveOneToRight();
      expect(metadata.map(item => item.value)).toEqual(['0-a', '1-b', '2-c', '2-c']);
      expect(metadata.map(item => item.size)).toEqual([2, 3, 4, 5]);
      const verse = component.customTranslation.chapters[0].verses[0];
      expect(new ProjectCustomTranslationService(
        jasmine.createSpyObj<ProjectDataService>('ProjectDataService', ['splitIntoMatrix']),
        jasmine.createSpyObj<SystemService>('SystemService', ['triggerSaveCurrentBookTranslations'])
      ).splitCustomTranslation(verse).map(segment => segment.segment)).toEqual(['aa', 'bbb', 'cccc', 'ddddd']);
    });
  });
});
