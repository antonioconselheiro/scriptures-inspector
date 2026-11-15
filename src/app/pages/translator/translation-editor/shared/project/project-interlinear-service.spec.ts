import { InterlinearTarget } from '@domain/interlinear-target-model';
import { Language } from '@domain/language-model';
import { Word } from '@domain/word-model';
import { SystemService } from '@shared/system/system-service';
import { ProjectDataService } from './project-data-service';
import { ProjectInterlinearService } from './project-interlinear-service';

describe('ProjectInterlinearService association operations', () => {
  const language: Language = { name: 'English', label: 'English' };
  const current = { book: 'GEN', chapter: 1 };
  const verse = { verse: 1, text: 'a b c d' };
  const words: Word[] = ['a', 'b', 'c', 'd'].map((word, index) => ({
    segments: [{ index, word, morpheme: 'root' }]
  }));
  let service: ProjectInterlinearService;
  let target: InterlinearTarget;
  let system: jasmine.SpyObj<SystemService>;

  beforeEach(() => {
    system = jasmine.createSpyObj<SystemService>('SystemService', ['triggerSaveCurrentBookInterlinear']);
    service = new ProjectInterlinearService(new ProjectDataService(), system);
    target = {};
    words.forEach((word, index) =>
      service.saveInterlinearToBaseScripture(target, 'origin', current, verse, index, word.segments[0].word, `${index}-${word.segments[0].word}`)
    );
    system.triggerSaveCurrentBookInterlinear.calls.reset();
  });

  function values(): string[] {
    return words.map((_, index) =>
      service.getInterlinearWordSegmentSerialized(language, target, 'origin', current, verse, index)
    );
  }

  it('moves and returns associations without changing earlier segments', () => {
    service.moveOneWordToAllAssociationsToTheRight(language, target, 'origin', current, verse, words, 1, 'b', '1-b');
    expect(values()).toEqual(['0-a', '1-b', '1-b', '2-c']);
    service.returnOneWordToAllAssociationsToTheRight(language, target, 'origin', current, verse, words, 1);
    expect(values()).toEqual(['0-a', '1-b', '2-c', '']);
    expect(system.triggerSaveCurrentBookInterlinear.calls.count()).toBe(6);
  });

  it('retains the clicked select value and the clicked translation word when moving', () => {
    service.moveOneWordToAllAssociationsToTheRight(language, target, 'origin', current, verse, words, 1, 'selected', '0-a');
    expect(values()).toEqual(['0-a', '0-a', '1-b', '2-c']);
    expect(target['origin'].chapters[0].verses[0].words[1].translationWord).toBe('selected');
    expect(target['origin'].chapters[0].verses[0].words[2].translationWord).toBe('c');
  });

  it('fills from a selected source and honors overwrite cancellation', () => {
    const confirmation = spyOn(window, 'confirm').and.returnValue(false);
    service.fillSequentiallyAllAssociationsToTheRight(language, target, 'origin', current, verse, words, words, 1, '0-a');
    expect(values()).toEqual(['0-a', '1-b', '2-c', '3-d']);
    expect(system.triggerSaveCurrentBookInterlinear).not.toHaveBeenCalled();
    confirmation.and.returnValue(true);
    service.fillSequentiallyAllAssociationsToTheRight(language, target, 'origin', current, verse, words, words, 1, '0-a');
    expect(values()).toEqual(['0-a', '0-a', '1-b', '2-c']);
    expect(system.triggerSaveCurrentBookInterlinear.calls.count()).toBe(3);
  });

  it('uses the clicked position when its association is empty', () => {
    service.saveInterlinearToBaseScripture(target, 'origin', current, verse, 1, 'b', '');
    service.saveInterlinearToBaseScripture(target, 'origin', current, verse, 2, 'c', '');
    service.saveInterlinearToBaseScripture(target, 'origin', current, verse, 3, 'd', '');
    const confirmation = spyOn(window, 'confirm');
    service.fillSequentiallyAllAssociationsToTheRight(language, target, 'origin', current, verse, words, words.slice(0, 3), 1, '');
    expect(values()).toEqual(['0-a', '1-b', '2-c', '']);
    expect(confirmation).not.toHaveBeenCalled();
  });

  it('uses the segment position rather than its index when filling from an empty association', () => {
    const noncontiguousWords: Word[] = [2, 5, 9].map(index => ({
      segments: [{ index, word: `word${index}`, morpheme: 'root' }]
    }));
    target = {};
    const confirmation = spyOn(window, 'confirm');
    service.fillSequentiallyAllAssociationsToTheRight(
      language, target, 'origin', current, verse, noncontiguousWords, words, 5, ''
    );
    expect(service.getInterlinearWordSegmentSerialized(language, target, 'origin', current, verse, 2)).toBe('');
    expect(service.getInterlinearWordSegmentSerialized(language, target, 'origin', current, verse, 5)).toBe('1-b');
    expect(service.getInterlinearWordSegmentSerialized(language, target, 'origin', current, verse, 9)).toBe('2-c');
    expect(confirmation).not.toHaveBeenCalled();
  });
});
