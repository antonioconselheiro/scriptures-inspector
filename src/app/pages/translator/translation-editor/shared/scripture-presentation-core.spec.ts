import { InterlinearTarget } from '@domain/interlinear-target-model';
import { Word } from '@domain/word-model';
import {
  getCustomTranslationPresentationColor,
  getInterlinearOriginIndex,
  getInterlinearPresentationColor,
  getPresentationColor,
  getSerializedSegmentIndex,
  isWordOfGod
} from './scripture-presentation-core';

describe('scripture presentation core', () => {
  it('uses the seven-color cycle for source segment indexes', () => {
    expect(getPresentationColor(0)).toBe('1');
    expect(getPresentationColor(6)).toBe('7');
    expect(getPresentationColor(7)).toBe('1');
  });

  it('uses the same color mapping for serialized custom-translation links', () => {
    expect(getSerializedSegmentIndex('6-root')).toBe(6);
    expect(getSerializedSegmentIndex('unlinked')).toBeNull();
    expect(getCustomTranslationPresentationColor('6-root')).toBe('7');
    expect(getCustomTranslationPresentationColor('', 7)).toBe('1');
    expect(getCustomTranslationPresentationColor('')).toBe('');
  });

  it('derives linked colors from the origin segment index', () => {
    const target: InterlinearTarget = {
      GEN: {
        chapters: [{
          origin: 1,
          chapter: 1,
          verses: [{
            originVerse: 2,
            verse: 2,
            words: [{
              originIndex: 5,
              originWord: 'word',
              translationIndex: 0,
              translationWord: 'translation'
            }]
          }]
        }]
      }
    };
    const current = { book: 'GEN', chapter: 1 };
    const verse = { verse: 2, text: 'translation' };

    expect(getInterlinearOriginIndex(target, 'GEN', current, verse, 0)).toBe(5);
    expect(getInterlinearPresentationColor(target, 'GEN', current, verse, 0)).toBe('6');
    expect(getInterlinearPresentationColor(target, 'GEN', current, verse, 1)).toBe('');
  });

  it('checks Word-of-God metadata using the caller-provided segment key', () => {
    const word: Word = {
      segments: [
        { index: 0, word: 'prefix', morpheme: 'prefix' },
        { index: 1, word: 'root', morpheme: 'root' }
      ]
    };

    expect(isWordOfGod(
      { '1-root': { isWordOfGod: true } },
      word,
      segment => `${segment.index}-${segment.word}`
    )).toBeTrue();
    expect(isWordOfGod(
      { '1-root': { isWordOfGod: false } },
      word,
      segment => `${segment.index}-${segment.word}`
    )).toBeFalse();
  });
});
