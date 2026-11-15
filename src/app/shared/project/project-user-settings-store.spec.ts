import { Project } from '@domain/project-model';
import { ProjectUserSettingsStore } from './project-user-settings-store';

describe('ProjectUserSettingsStore', () => {
  const originalApi = Object.getOwnPropertyDescriptor(window, 'api');
  const project: Project = {
    name: 'Test',
    path: '/bible',
    target: { language: 'portuguese' },
    structures: []
  };
  let readOptionalJsonFile: jasmine.Spy;
  let writeJsonFile: jasmine.Spy;

  beforeEach(() => {
    readOptionalJsonFile = jasmine.createSpy('readOptionalJsonFile').and.resolveTo(null);
    writeJsonFile = jasmine.createSpy('writeJsonFile').and.resolveTo();
    Object.defineProperty(window, 'api', {
      configurable: true,
      value: { readOptionalJsonFile, writeJsonFile }
    });
  });

  afterEach(() => {
    if (originalApi) {
      Object.defineProperty(window, 'api', originalApi);
    } else {
      Reflect.deleteProperty(window, 'api');
    }
  });

  it('stores the preview setting in the project root without discarding other settings', async () => {
    readOptionalJsonFile.and.resolveTo({ otherFeature: { enabled: true } });
    const store = new ProjectUserSettingsStore();
    const config = { fontSize: 28, variationMode: 'merge' };

    await store.save(project, 'holyViewer', config);

    expect(readOptionalJsonFile).toHaveBeenCalledOnceWith('/bible/.scriptures-inspector');
    expect(writeJsonFile).toHaveBeenCalledOnceWith('/bible/.scriptures-inspector', {
      otherFeature: { enabled: true },
      holyViewer: config
    });
  });

  it('returns null when the project settings file does not exist', async () => {
    await expectAsync(new ProjectUserSettingsStore().load(project)).toBeResolvedTo(null);
  });

  it('reports an invalid non-object settings file', async () => {
    readOptionalJsonFile.and.resolveTo([]);
    await expectAsync(new ProjectUserSettingsStore().load(project)).toBeRejectedWithError(
      'Project user settings must contain a JSON object.'
    );
  });
});
