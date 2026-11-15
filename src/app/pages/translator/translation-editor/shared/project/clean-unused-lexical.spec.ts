import { demassoretifierFn } from '@shared/language-metadata/demassoretifier-fn';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';
import { SystemService } from '@shared/system/system-service';
import { cleanUnusedLexical } from './clean-unused-lexical';
import { ProjectDataService } from './project-data-service';
import { ProjectMetadataService } from './project-metadata-service';

describe('cleanUnusedLexical', () => {
  it('retains normalized segments used in any verse and removes unused entries', () => {
    const data = new ProjectDataService();
    const metadataService = new ProjectMetadataService(data, new SystemService());
    const language = {
      ...languageMetadataRecord.hebrew,
      normalizeFn: demassoretifierFn
    };
    const metadata = {
      patterns: { prefix: [], suffix: [], lexeme: [] },
      lexical: {
        'ברא': { value: 'create' },
        'אלהים': { value: 'God' },
        'מים': { value: 'water' }
      }
    };
    const source = {
      chapters: [{ chapter: 1, verses: [
        { verse: 1, text: 'בָּרָ֣א' },
        { verse: 2, text: 'אֱלֹהִ֑ים' }
      ] }]
    };

    expect(cleanUnusedLexical(metadata, source, language, data, metadataService)).toEqual(['מים']);
    expect(Object.keys(metadata.lexical)).toEqual(['ברא', 'אלהים']);
  });
});
