import { TestBed } from '@angular/core/testing';
import { Language } from '@domain/language-model';
import { PatternsSerialized } from '@domain/patterns-serialized-model';
import { demassoretifierFn } from '@shared/language-metadata/demassoretifier-fn';
import { massoretifierFn } from '@shared/language-metadata/massoretifier-fn';
import { transliterate as hebrewTransliterateFn } from "hebrew-transliteration";
import { ProjectDataService } from './project-data-service';
import { ProjectMetadataService } from './project-metadata-service';

const englishLanguage: Language = {
  name: 'English',
  label: 'English'
};

const hebrewLanguage: Language = {
  name: 'Hebrew',
  label: 'hebrew',
  direction: 'rtl',
  transliteration: (hebrew) => hebrewTransliterateFn(hebrew),
  wordSeparator: ['־', '׀', ' '],
  normalizeFn: (text: string) => demassoretifierFn(text),
  prefetchMatcherFn: (text: string) => massoretifierFn(text)
};

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

    expect(result).toEqual([{
      segments: [{
        word: 'in',
        index: 0,
        morpheme: 'prefix'
      },
      {
        word: 'ablablivel',
        index: 1,
        morpheme: 'root'
      }]
    }]);
  });

  it('should split into prefix, lexeme and suffix', () => {
    const result = dataService.splitIntoMatrix(
      englishLanguage, metadataService.parsePattern({ ...englishPatterns, lexeme: ['ablabliv'] }, englishLanguage), latinCharacteresWord
    );

    expect(result).toEqual([{
      segments: [{
        word: 'in',
        index: 0,
        morpheme: 'prefix'
      },
      {
        word: 'ablabliv',
        index: 1,
        morpheme: 'root'
      },
      {
        word: 'el',
        index: 2,
        morpheme: 'suffix'
      }]
    }]);
  });

  it('should split into prefix, lexeme and two suffixes', () => {
    const result = dataService.splitIntoMatrix(
      englishLanguage, metadataService.parsePattern({ ...englishPatterns, lexeme: ['ablabl'] }, englishLanguage), latinCharacteresWord
    );

    expect(result).toEqual([{
      segments: [{
        word: 'in',
        index: 0,
        morpheme: 'prefix'
      },
      {
        word: 'ablabl',
        index: 1,
        morpheme: 'root'
      },
      {
        word: 'iv',
        index: 2,
        morpheme: 'suffix'
      },
      {
        word: 'el',
        index: 3,
        morpheme: 'suffix'
      }]
    }]);
  });

  it('should split into two prefixes, lexeme and two suffixes', () => {
    const result = dataService.splitIntoMatrix(
      englishLanguage, metadataService.parsePattern({ ...englishPatterns, lexeme: ['blabl'] }, englishLanguage), latinCharacteresWord
    );

    expect(result).toEqual([{
      segments: [{
        word: 'in',
        index: 0,
        morpheme: 'prefix'
      },
      {
        word: 'a',
        index: 1,
        morpheme: 'prefix'
      },
      {
        word: 'blabl',
        index: 2,
        morpheme: 'root'
      },
      {
        word: 'iv',
        index: 3,
        morpheme: 'suffix'
      },
      {
        word: 'el',
        index: 4,
        morpheme: 'suffix'
      }]
    }]);
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

    expect(result).toEqual([{
      segments: [{
        word: 'pre',
        index: 0,
        morpheme: 'prefix'
      },
      {
        word: 'anti',
        index: 1,
        morpheme: 'prefix'
      },
      {
        word: 'neo',
        index: 2,
        morpheme: 'prefix'
      },
      {
        word: 'core',
        index: 3,
        morpheme: 'root'
      },
      {
        word: 'tion',
        index: 4,
        morpheme: 'suffix'
      },
      {
        word: 'ism',
        index: 5,
        morpheme: 'suffix'
      },
      {
        word: 'ly',
        index: 6,
        morpheme: 'suffix'
      },
      {
        word: 'ness',
        index: 7,
        morpheme: 'suffix'
      }]
    }]);
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

    expect(result).toEqual([{
      segments: [{
        word: 're',
        index: 0,
        morpheme: 'prefix'
      },
      {
        word: 'un',
        index: 1,
        morpheme: 'prefix'
      },
      {
        word: 'pre',
        index: 2,
        morpheme: 'prefix'
      },
      {
        word: 'anti',
        index: 3,
        morpheme: 'prefix'
      },
      {
        word: 'root',
        index: 4,
        morpheme: 'root'
      }]
    }]);
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

    expect(result).toEqual([{
      segments: [{
        word: 'root',
        index: 0,
        morpheme: 'root'
      },
      {
        word: 'able',
        index: 1,
        morpheme: 'suffix'
      },
      {
        word: 'istic',
        index: 2,
        morpheme: 'suffix'
      },
      {
        word: 'ally',
        index: 3,
        morpheme: 'suffix'
      },
      {
        word: 'ness',
        index: 4,
        morpheme: 'suffix'
      },
      {
        word: 'less',
        index: 5,
        morpheme: 'suffix'
      }]
    }]);
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

    expect(result).toEqual([{
      segments: [{
        word: 'pre',
        index: 0,
        morpheme: 'prefix'
      },
      {
        word: 'supercore',
        index: 1,
        morpheme: 'root'
      },
      {
        word: 'ly',
        index: 2,
        morpheme: 'suffix'
      }]
    }]);
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

    expect(result).toEqual([{
      segments: [{
        word: 'pre',
        index: 0,
        morpheme: 'prefix'
      },
      {
        word: 'supercore',
        index: 1,
        morpheme: 'root'
      },
      {
        word: 'ly',
        index: 2,
        morpheme: 'suffix'
      }]
    }]);
  });

  it('should group hebrew niqqud into prefixes and suffixes', () => {
    const hebrewWord = 'לְמִינֵ֑הוּ';
    const hebrewPatterns: PatternsSerialized = {
      prefix: ['ל', 'ו'],
      suffix: ['הו', 'ו'],
      lexeme: []
    };

    const result = dataService.splitIntoMatrix(
      hebrewLanguage, metadataService.parsePattern(hebrewPatterns, hebrewLanguage), hebrewWord
    );

    expect(result).toEqual([{
      segments: [{
        word: 'לְ',
        index: 0,
        morpheme: 'prefix'
      },
      {
        word: 'מִינֵ֑',
        index: 1,
        morpheme: 'root'
      },
      {
        word: 'הוּ',
        index: 2,
        morpheme: 'suffix'
      }]
    }]);
  });

  it('should respect lexemes', () => {
    const hebrewWord = 'וּרְב֗וּ';
    const hebrewPatterns: PatternsSerialized = {
      prefix: ['ו'],
      suffix: ['בו', 'ו'],
      lexeme: ['רב']
    };

    const result = dataService.splitIntoMatrix(
      hebrewLanguage, metadataService.parsePattern(hebrewPatterns, hebrewLanguage), hebrewWord
    );

    expect(result).toEqual([{
      segments: [{
        word: 'וּ',
        index: 0,
        morpheme: 'prefix'
      },
      {
        word: 'רְב֗',
        index: 1,
        morpheme: 'root'
      },
      {
        word: 'וּ',
        index: 2,
        morpheme: 'suffix'
      }]
    }]);
  });

  it('should choose the larger suffixes first and then move on to the shorter ones', () => {
    const hebrewWord = 'אֱלֹהִים֩';
    const hebrewPatterns: PatternsSerialized = {
      prefix: ['י'],
      suffix: ['ים'],
      lexeme: ['אלה']
    };

    const result = dataService.splitIntoMatrix(
      hebrewLanguage, metadataService.parsePattern(hebrewPatterns, hebrewLanguage), hebrewWord
    );

    expect(result).toEqual([{
      segments: [{
        word: 'אֱלֹהִ',
        index: 0,
        morpheme: 'root'
      },
      {
        word: 'ים֩',
        index: 1,
        morpheme: 'suffix'
      }]
    }]);
  });

  it('should never have a prefix in the end', () => {
    const hebrewWord = 'ב֖וֹ';
    const hebrewPatterns: PatternsSerialized = {
      prefix: ["ב", "ו"],
      suffix: ["ב", "ו"],
      lexeme: []
    };

    const result = dataService.splitIntoMatrix(
      hebrewLanguage, metadataService.parsePattern(hebrewPatterns, hebrewLanguage), hebrewWord
    );

    expect(result).toEqual([{
      segments: [{
        word: 'ב֖',
        index: 0,
        morpheme: 'prefix'
      },
      {
        word: 'וֹ',
        index: 1,
        morpheme: 'suffix'
      }]
    }]);
  });

  it('should never have a suffix in begin', () => {
    const word = "ababa";
    const patterns: PatternsSerialized = {
      prefix: [],
      suffix: ["a", "b"],
      lexeme: []
    };

    const result = dataService.splitIntoMatrix(
      englishLanguage, metadataService.parsePattern(patterns, englishLanguage), word
    );

    expect(result).toEqual([{
      segments: [{
        word: 'a',
        index: 0,
        morpheme: 'root'
      },
      {
        word: 'b',
        index: 1,
        morpheme: 'suffix'
      },
      {
        word: 'a',
        index: 2,
        morpheme: 'suffix'
      },
      {
        word: 'b',
        index: 3,
        morpheme: 'suffix'
      },
      {
        word: 'a',
        index: 4,
        morpheme: 'suffix'
      }]
    }]);
  });
});
