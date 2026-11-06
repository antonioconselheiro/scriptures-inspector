import { Project } from '@domain/project-model';
import { languageMetadataRecord } from './language-metadata-record';
import { getProjectLanguageFn } from './get-project-language-fn';

describe('getProjectLanguageFn', () => {
  it('applies configured normalization and matching for Hebrew', () => {
    const project = {
      normalization: {
        hebrew: ['demassoretify']
      }
    } as Project;

    const language = getProjectLanguageFn(project, 'hebrew');

    expect(language.normalizeFn?.('לְמִינֵ֔הוּ')).toBe('למינהו');
    expect('בּ').toMatch(new RegExp(`^${language.prefetchMatcherFn?.('ב')}$`, 'u'));
  });

  it('does not normalize Hebrew when the project has no normalization setting', () => {
    const language = getProjectLanguageFn({} as Project, 'hebrew');

    expect(language.normalizeFn).toBeUndefined();
    expect(language.prefetchMatcherFn).toBeUndefined();
    expect(languageMetadataRecord.hebrew.normalizeFn).toBeUndefined();
  });
});
