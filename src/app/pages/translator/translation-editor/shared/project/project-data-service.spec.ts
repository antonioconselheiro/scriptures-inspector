import { TestBed } from '@angular/core/testing';
import { ProjectDataService } from './project-data-service';
import { ParsedPatterns } from '@domain/parsed-patterns';
import { ProjectMetadataService } from './project-metadata-service';
import { BookMetadataAttributes } from '@domain/book-metadata-attributes-model';
import { PatternsSerialized } from '@domain/patterns-serialized';
import { Language } from '@domain/language-model';

describe('ProjectDataService', () => {
  let projectDataService: ProjectDataService,
    projectMetadataService: ProjectMetadataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    projectDataService = TestBed.inject(ProjectDataService);
    projectMetadataService = TestBed.inject(ProjectMetadataService);
  });

  it('should be created', () => {
    expect(projectDataService).toBeTruthy();
    expect(projectMetadataService).toBeTruthy();
  });

  const language: Language = {
    name: 'English',
    label: 'English'
  };

  const patterns: PatternsSerialized = {
    prefix: ['in', 'a'],
    suffix: ['el', 'iv'],
    lexeme: ['inablablivel']
  };

  const word = 'inablablivel';

  it('should split into prefix and full lexeme', () => {
    const result = projectDataService.splitByPatterns(
      projectMetadataService.parsePattern({ ...patterns, lexeme: ['ablablivel'] }, language), word
    );

    expect(result).toEqual(['in', 'ablablivel']);
  });

  it('should split into prefix, lexeme and suffix', () => {
    const result = projectDataService.splitByPatterns(
      projectMetadataService.parsePattern({ ...patterns, lexeme: ['ablabliv'] }, language), word
    );

    expect(result).toEqual(['in', 'ablabliv', 'el']);
  });

  it('should split into prefix, lexeme and two suffixes', () => {
    const result = projectDataService.splitByPatterns(
      projectMetadataService.parsePattern({ ...patterns, lexeme: ['ablabl'] }, language), word
    );

    expect(result).toEqual(['in', 'ablabl', 'iv', 'el']);
  });

  it('should split into two prefixes, lexeme and two suffixes', () => {
    const result = projectDataService.splitByPatterns(
      projectMetadataService.parsePattern({ ...patterns, lexeme: ['blabl'] }, language), word
    );

    expect(result).toEqual(['in', 'a', 'blabl', 'iv', 'el']);
  });

  it('should split many prefixes and suffixes around one internal lexeme', () => {
    const result = projectDataService.splitByPatterns(
      projectMetadataService.parsePattern({
        prefix: ['pre', 'anti', 'neo'],
        suffix: ['tion', 'ism', 'ly', 'ness'],
        lexeme: ['core']
      }, language),
      'preantineocoretionismlyness'
    );

    expect(result).toEqual(['pre', 'anti', 'neo', 'core', 'tion', 'ism', 'ly', 'ness']);
  });

  it('should split many prefixes and no suffix around one internal lexeme', () => {
    const result = projectDataService.splitByPatterns(
      projectMetadataService.parsePattern({
        prefix: ['re', 'un', 'pre', 'anti'],
        suffix: ['zz', 'yy'],
        lexeme: ['root']
      }, language),
      'reunpreantiroot'
    );

    expect(result).toEqual(['re', 'un', 'pre', 'anti', 'root']);
  });

  it('should split many suffixes and no prefix around one internal lexeme', () => {
    const result = projectDataService.splitByPatterns(
      projectMetadataService.parsePattern({
        prefix: ['xx', 'ww'],
        suffix: ['able', 'istic', 'ally', 'ness', 'less'],
        lexeme: ['root']
      }, language),
      'rootableisticallynessless'
    );

    expect(result).toEqual(['root', 'able', 'istic', 'ally', 'ness', 'less']);
  });

  it('should keep the largest internal lexeme when lexemes overlap', () => {
    const result = projectDataService.splitByPatterns(
      projectMetadataService.parsePattern({
        prefix: ['pre'],
        suffix: ['ly'],
        lexeme: ['core', 'supercore']
      }, language),
      'presupercorely'
    );

    expect(result).toEqual(['pre', 'supercore', 'ly']);
  });
});
