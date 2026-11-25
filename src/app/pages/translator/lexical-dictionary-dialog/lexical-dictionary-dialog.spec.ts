import { TestBed } from '@angular/core/testing';
import { ProjectDataService } from '../translation-editor/shared/project/project-data-service';
import { ProjectMetadataService } from '../translation-editor/shared/project/project-metadata-service';
import { SegmentationChanges } from '../translation-editor/shared/segmentation-changes';
import { LexicalDictionaryDialog } from './lexical-dictionary-dialog';

describe('LexicalDictionaryDialog', () => {
  it('confirms the specific lexical entry before deleting and refreshing it', () => {
    const confirmation = spyOn(window, 'confirm').and.returnValue(false);
    const changes = new SegmentationChanges();
    const changed = spyOn(changes, 'lexicalChanged').and.callThrough();
    TestBed.configureTestingModule({
      providers: [
        { provide: ProjectDataService, useValue: {} },
        { provide: ProjectMetadataService, useValue: {} },
        { provide: SegmentationChanges, useValue: changes }
      ]
    });
    const fixture = TestBed.createComponent(LexicalDictionaryDialog);
    const dialog = fixture.componentInstance;
    dialog.bookMetadata = {
      chapters: [],
      patterns: { prefix: [], suffix: [], lexeme: [] },
      lexical: { first: { value: 'one', prefix: 'pre' }, second: { value: 'two' } }
    };
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('[aria-label="Delete lexical for first"]') as HTMLButtonElement;
    button.click();
    expect(confirmation).toHaveBeenCalledWith('Delete the root lexical entry for "first"?');
    expect(dialog.bookMetadata.lexical['first'].value).toBe('one');
    expect(dialog.lexicals.length).toBe(3);
    expect(changed).not.toHaveBeenCalled();

    confirmation.and.returnValue(true);
    button.click();
    expect(dialog.bookMetadata.lexical['first'].value).toBe('pre');
    expect(dialog.bookMetadata.lexical['second'].value).toBe('two');
    expect(changed).toHaveBeenCalledOnceWith(dialog.bookMetadata.lexical);
    expect(dialog.lexicals.length).toBe(3);
  });
});
