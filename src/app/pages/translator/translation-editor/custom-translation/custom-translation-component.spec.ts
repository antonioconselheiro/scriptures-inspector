import { ChangeDetectorRef } from '@angular/core';
import { CustomTranslationComponent } from './custom-translation-component';
import { ProjectCustomTranslationService } from '../shared/project/project-custom-translation-service';
import { ProjectDataService } from '../shared/project/project-data-service';
import { ProjectInterlinearService } from '../shared/project/project-interlinear-service';
import { ProjectMetadataService } from '../shared/project/project-metadata-service';

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
      jasmine.createSpyObj<ProjectInterlinearService>('ProjectInterlinearService', ['getOriginWordIndex'])
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
});
