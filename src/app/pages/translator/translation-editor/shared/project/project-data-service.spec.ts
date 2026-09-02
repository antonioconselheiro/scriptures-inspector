import { TestBed } from '@angular/core/testing';
import { Language } from '@domain/language-model';
import { transliterate as hebrewTransliterateFn } from "hebrew-transliteration";
import { PatternsSerialized } from '@domain/patterns-serialized';
import { ProjectDataService } from './project-data-service';
import { ProjectMetadataService } from './project-metadata-service';
import { demassoretifierFn } from '@shared/language-metadata/demassoretifier-fn';
import { hebrewGematriaFn } from '@shared/language-metadata/hebrew-gematria-fn';
import { massoretifierFn } from '@shared/language-metadata/massoretifier-fn';
import { paleoHebrewSpellingFn } from '@shared/language-metadata/paleo-hebrew-spelling-fn';

describe('ProjectDataService', () => {
  let dataService: ProjectDataService,
    metadataService: ProjectMetadataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    dataService = TestBed.inject(ProjectDataService);
    metadataService = TestBed.inject(ProjectMetadataService);
  });

  it('should be created', () => {
    expect(dataService).toBeTruthy();
    expect(metadataService).toBeTruthy();
  });

  const englishLanguage: Language = {
    name: 'English',
    label: 'English'
  };

  const englishPatterns: PatternsSerialized = {
    prefix: ['in', 'a'],
    suffix: ['el', 'iv'],
    lexeme: ['inablablivel']
  };

  const latinCharacteresWord = 'inablablivel';

  it('should split into prefix and full lexeme', () => {
    const result = dataService.splitIntoMatrix(
      englishLanguage, metadataService.parsePattern({ ...englishPatterns, lexeme: ['ablablivel'] }, englishLanguage), latinCharacteresWord
    );

    expect(result).toEqual([{segments:[{ word: 'in', index: 0 }, { word: 'ablablivel', index: 1 }]}]);
  });

  it('should split into prefix, lexeme and suffix', () => {
    const result = dataService.splitIntoMatrix(
      englishLanguage, metadataService.parsePattern({ ...englishPatterns, lexeme: ['ablabliv'] }, englishLanguage), latinCharacteresWord
    );

    expect(result).toEqual([{segments:[{ word: 'in', index: 0 }, { word: 'ablabliv', index: 1 }, { word: 'el', index: 2 }]}]);
  });

  it('should split into prefix, lexeme and two suffixes', () => {
    const result = dataService.splitIntoMatrix(
      englishLanguage, metadataService.parsePattern({ ...englishPatterns, lexeme: ['ablabl'] }, englishLanguage), latinCharacteresWord
    );

    expect(result).toEqual([{segments:[{ word: 'in', index: 0 }, { word: 'ablabl', index: 1 }, { word: 'iv', index: 2 }, { word: 'el', index: 3 }]}]);
  });

  it('should split into two prefixes, lexeme and two suffixes', () => {
    const result = dataService.splitIntoMatrix(
      englishLanguage, metadataService.parsePattern({ ...englishPatterns, lexeme: ['blabl'] }, englishLanguage), latinCharacteresWord
    );

    expect(result).toEqual([{segments:[{ word: 'in', index: 0 }, { word: 'a', index: 1 }, { word: 'blabl', index: 2 }, { word: 'iv', index: 3 }, { word: 'el', index: 4 }]}]);
  });

  it('should split many prefixes and suffixes around one internal lexeme', () => {
    const result = dataService.splitIntoMatrix(
      englishLanguage, metadataService.parsePattern({
        prefix: ['pre', 'anti', 'neo'],
        suffix: ['tion', 'ism', 'ly', 'ness'],
        lexeme: ['core']
      }, englishLanguage),
      'preantineocoretionismlyness'
    );

    expect(result).toEqual([{segments:[{ word: 'pre', index: 0 }, { word: 'anti', index: 1 }, { word: 'neo', index: 2 }, { word: 'core', index: 3 }, { word: 'tion', index: 4 }, { word: 'ism', index: 5 }, { word: 'ly', index: 6 }, { word: 'ness', index: 7 }]}]);
  });

  it('should split many prefixes and no suffix around one internal lexeme', () => {
    const result = dataService.splitIntoMatrix(
      englishLanguage, metadataService.parsePattern({
        prefix: ['re', 'un', 'pre', 'anti'],
        suffix: ['zz', 'yy'],
        lexeme: ['root']
      }, englishLanguage),
      'reunpreantiroot'
    );

    expect(result).toEqual([{segments:[{ word: 're', index: 0 }, { word: 'un', index: 1 }, { word: 'pre', index: 2 }, { word: 'anti', index: 3 }, { word: 'root', index: 4 }]}]);
  });

  it('should split many suffixes and no prefix around one internal lexeme', () => {
    const result = dataService.splitIntoMatrix(
      englishLanguage, metadataService.parsePattern({
        prefix: ['xx', 'ww'],
        suffix: ['able', 'istic', 'ally', 'ness', 'less'],
        lexeme: ['root']
      }, englishLanguage),
      'rootableisticallynessless'
    );

    expect(result).toEqual([{segments:[{ word: 'root', index: 0 }, { word: 'able', index: 1 }, { word: 'istic', index: 2 }, { word: 'ally', index: 3 }, { word: 'ness', index: 4 }, { word: 'less', index: 5 }]}]);
  });

  it('should keep the largest internal lexeme when lexemes overlap', () => {
    const result = dataService.splitIntoMatrix(
      englishLanguage,
      metadataService.parsePattern({
        prefix: ['pre'],
        suffix: ['ly'],
        lexeme: ['core', 'supercore']
      }, englishLanguage),
      'presupercorely'
    );

    expect(result).toEqual([{segments:[{ word: 'pre', index: 0 }, { word: 'supercore', index: 1 }, { word: 'ly', index: 2 }]}]);
  });

  it('should keep the internal lexeme when prefix and suffix have part of it', () => {
    const result = dataService.splitIntoMatrix(
      englishLanguage,
      metadataService.parsePattern({
        prefix: ['pre', 'presu'],
        suffix: ['re', 'ly'],
        lexeme: ['core', 'supercore']
      }, englishLanguage),
      'presupercorely'
    );

    expect(result).toEqual([{segments:[{ word: 'pre', index: 0 }, { word: 'supercore', index: 1 }, { word: 'ly', index: 2 }]}]);
  });

  const hebrewLanguage: Language = {
    name: 'Hebrew',
    label: 'hebrew',
    direction: 'rtl',
    transliteration: (hebrew) => hebrewTransliterateFn(hebrew),
    wordSeparator: ['־', '׀', ' '],
    normalizeFn: (text: string) => demassoretifierFn(text),
    prefetchMatcherFn: (text: string) => massoretifierFn(text)
  };

  const hebrewWord = 'לְמִינֵ֑הוּ';
  const hebrewPatterns: PatternsSerialized = {
    prefix: ['ל', 'ו'],
    suffix: ['הו', 'ו'],
    lexeme: ['הו']
  };

  it('should group hebrew niqqud into prefixes and suffixes', () => {
    const result = dataService.splitIntoMatrix(
      hebrewLanguage, metadataService.parsePattern(hebrewPatterns, hebrewLanguage), hebrewWord
    );

    expect(result).toEqual([{segments:[{ word: 'לְ', index: 0 }, { word: 'מִינֵ֑', index: 1 }, { word: 'הוּ', index: 2 }]}]);
  });
});
