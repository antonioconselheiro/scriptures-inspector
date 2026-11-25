import { Codex } from '@domain/codex-model';
import { Project } from '@domain/project-model';
import { ProjectData } from '@domain/project-data-model';
import { SystemService } from './system-service';

describe('SystemService book target saving', () => {
  const project: Project = {
    name: 'Documents', path: '/project', target: { language: 'en' },
    structures: [
      {
        source: 'a', metadataTarget: 'a-metadata', customTranslationTarget: 'a-translation',
        interlinear: [{
          source: 'b', metadataTarget: 'b-metadata', customTranslationTarget: 'b-translation',
          interlinearTarget: 'ab-interlinear',
          interlinear: [{ source: 'c', metadataTarget: 'c-metadata', customTranslationTarget: 'c-translation', interlinearTarget: 'bc-interlinear' }]
        }]
      },
      {
        source: 'd', metadataTarget: 'd-metadata',
        interlinear: [{ source: 'c', metadataTarget: 'c-metadata', customTranslationTarget: 'c-translation', interlinearTarget: 'dc-interlinear' }]
      }
    ]
  };
  const codices: Record<string, Codex> = {
    a: { name: 'A', language: 'x', books: { ONE: { name: 'One' } } },
    b: { name: 'B', language: 'x', books: { ONE: { name: 'One' }, TWO: { name: 'Two' } } },
    c: { name: 'C', language: 'x', books: { TWO: { name: 'Two' } } },
    d: { name: 'D', language: 'x', books: { TWO: { name: 'Two' } } }
  };
  const metadata = { chapters: [], patterns: { distinct: {}, prefix: [], suffix: [], lexeme: [] }, lexical: {} };
  const data: ProjectData = {
    'a-metadata': metadata, 'b-metadata': metadata, 'c-metadata': metadata, 'd-metadata': metadata,
    'a-translation': { chapters: [], variations: {} }, 'b-translation': { chapters: [], variations: {} },
    'c-translation': { chapters: [], variations: {} },
    'ab-interlinear': {}, 'bc-interlinear': {}, 'dc-interlinear': {}
  };
  let api: jasmine.SpyObj<Window['api']>;
  let originalApi: PropertyDescriptor | undefined;
  let service: SystemService;

  beforeEach(() => {
    originalApi = Object.getOwnPropertyDescriptor(window, 'api');
    api = jasmine.createSpyObj<Window['api']>('api', ['writeJsonFile']);
    api.writeJsonFile.and.resolveTo();
    Object.defineProperty(window, 'api', { configurable: true, value: api });
    service = new SystemService();
  });

  afterEach(() => {
    if (originalApi) Object.defineProperty(window, 'api', originalApi);
    else Reflect.deleteProperty(window, 'api');
  });

  function writtenBooks(): string[] {
    return api.writeJsonFile.calls.allArgs().map(args => args[0]).filter(path => path.includes('/targets/')).sort();
  }

  it('saves only associated books for automatic saves, including nested and shared sources', async () => {
    const current = { book: 'TWO' };
    await service.saveCurrentBookMetadata(project, current, data, codices);
    await service.saveCurrentBookInterlinear(project, project.structures, current, data, codices);
    await service.saveCurrentBookCustomTranslation(project, current, data, codices);
    expect(writtenBooks()).toEqual([
      '/project/targets/b-metadata/TWO.json', '/project/targets/b-translation/TWO.json',
      '/project/targets/bc-interlinear/TWO.json', '/project/targets/c-metadata/TWO.json',
      '/project/targets/c-translation/TWO.json', '/project/targets/d-metadata/TWO.json',
      '/project/targets/dc-interlinear/TWO.json'
    ]);
  });

  it('applies the same filtering to immediate saves', async () => {
    await service.saveProjectImmediately(project, { book: 'ONE' }, data, codices);
    expect(writtenBooks()).toEqual([
      '/project/targets/a-metadata/ONE.json', '/project/targets/a-translation/ONE.json',
      '/project/targets/ab-interlinear/ONE.json', '/project/targets/b-metadata/ONE.json',
      '/project/targets/b-translation/ONE.json'
    ]);
    expect(api.writeJsonFile.calls.allArgs().some(args => args[0] === '/project/index.xenoglosproj')).toBeTrue();
  });

  it('saves a shared interlinear target once when any association has both sources', async () => {
    const shared = {
      ...project,
      structures: [
        { source: 'a', metadataTarget: 'a-metadata' as const, interlinear: [
          { source: 'c', metadataTarget: 'c-metadata' as const, interlinearTarget: 'bc-interlinear' as const }
        ] },
        { source: 'b', metadataTarget: 'b-metadata' as const, interlinear: [
          { source: 'c', metadataTarget: 'c-metadata' as const, interlinearTarget: 'bc-interlinear' as const }
        ] }
      ]
    };
    await service.saveCurrentBookInterlinear(shared, shared.structures, { book: 'TWO' }, data, codices);
    expect(writtenBooks()).toEqual(['/project/targets/bc-interlinear/TWO.json']);
  });

  it('reports missing configurations and missing data rather than creating invalid files', async () => {
    await expectAsync(service.saveCurrentBookMetadata(project, { book: 'ONE' }, data, { ...codices, a: undefined }))
      .toBeRejectedWithError('Missing book configuration for source "a"');
    await expectAsync(service.saveCurrentBookCustomTranslation(project, { book: 'ONE' }, {}, codices))
      .toBeRejected();
    expect(writtenBooks()).toEqual([]);
  });
});
