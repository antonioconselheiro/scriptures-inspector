import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalService } from '@belomonte/async-modal-ngx';
import { ArtifactFragment } from '@domain/artifact-fragment-model';
import { Project } from '@domain/project-model';
import { CollectionsStatefull } from '@shared/system/collections-statefull';
import { Subject } from 'rxjs';
import { TranscriptionEditorComponent } from './transcription-editor-component';

describe('TranscriptionEditorComponent artifact loading', () => {
  const project: Project = { name: 'Test', path: '/project', target: { language: 'en' }, structures: [] };
  const imageName = 'Plate 673\nB-506806 – 1Q.png';
  let component: TranscriptionEditorComponent;
  let state: { currentValue: CollectionsStatefull['currentValue']; data$: Subject<CollectionsStatefull['currentValue']> };
  let api: jasmine.SpyObj<Window['api']>;
  let originalApi: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalApi = Object.getOwnPropertyDescriptor(window, 'api');
    api = jasmine.createSpyObj<Window['api']>('api', ['readOptionalJsonFile', 'writeJsonFile']);
    api.readOptionalJsonFile.and.resolveTo(null);
    api.writeJsonFile.and.resolveTo();
    Object.defineProperty(window, 'api', { configurable: true, value: api });
    state = { currentValue: [], data$: new Subject() };
    TestBed.configureTestingModule({
      imports: [TranscriptionEditorComponent],
      providers: [
        { provide: Router, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: ModalService, useValue: {} },
        { provide: CollectionsStatefull, useValue: state }
      ]
    }).overrideComponent(TranscriptionEditorComponent, { set: { template: '' } });
    component = TestBed.createComponent(TranscriptionEditorComponent).componentInstance;
    component.ngOnInit();
    component.onProjectChange(project);
  });

  afterEach(() => {
    component?.ngOnDestroy();
    if (originalApi) {
      Object.defineProperty(window, 'api', originalApi);
    } else {
      Reflect.deleteProperty(window, 'api');
    }
  });

  it('loads image zero when collection details arrive and permits metadata creation', async () => {
    component.onCurrentArtifactChange({ collection: 'col1', artifact: 0 });
    expect(api.readOptionalJsonFile).not.toHaveBeenCalled();
    state.currentValue = [{ name: 'Col1', folder: 'col1', order: [imageName] }];
    state.data$.next(state.currentValue);
    await new Promise<void>(resolve => setTimeout(resolve, 0));

    expect(component.getImage()).toBe(`local:///${encodeURIComponent(`/project/artifacts/col1/${imageName}`)}`);
    expect(api.readOptionalJsonFile.calls.allArgs()).toEqual([
      [`/project/artifacts/col1/${imageName.slice(0, -4)}.json`],
      [`/project/artifacts/col1/${imageName}.json`]
    ]);
    expect(component.metadataReady).toBeTrue();
    component.artifactForm.controls.language.setValue('hebrew');
    component.onArtifactSubmit();
    spyOn(window, 'alert');
    component.saveArtifactData();
    expect(api.writeJsonFile.calls.mostRecent().args[0]).toBe(`/project/artifacts/col1/${imageName.slice(0, -4)}.json`);
  });

  it('loads existing metadata with the original image basename', async () => {
    const metadata: ArtifactFragment = { language: 'middle-persian', spelling: 'middle-persian', vector: '', transcription: '', positions: [], bookSchema: [] };
    api.readOptionalJsonFile.and.resolveTo(JSON.parse(JSON.stringify(metadata)));
    state.currentValue = [{ name: 'Mani', folder: 'mani', order: ['M101c.png'] }];
    component.onCurrentArtifactChange({ collection: 'mani', artifact: 0 });
    await new Promise<void>(resolve => setTimeout(resolve, 0));
    expect(api.readOptionalJsonFile).toHaveBeenCalledOnceWith('/project/artifacts/mani/M101c.json');
    expect(component.artifact).toEqual(metadata);
    expect(component.artifactForm.controls.spelling.value).toBe('middle-persian');
  });

  it('does not read undefined metadata or display a folder for an out-of-range index', () => {
    state.currentValue = [{ name: 'Col1', folder: 'col1', order: [imageName] }];
    component.onCurrentArtifactChange({ collection: 'col1', artifact: 1 });
    expect(component.getImage()).toBe('');
    expect(api.readOptionalJsonFile).not.toHaveBeenCalled();
    expect(component.metadataReady).toBeFalse();
  });

  it('ignores a metadata response from a previously selected image', async () => {
    let resolveFirst!: (value: ArtifactFragment | null) => void;
    const first = new Promise<ArtifactFragment | null>(resolve => resolveFirst = resolve);
    api.readOptionalJsonFile.and.returnValues(first, Promise.resolve(null), Promise.resolve(null));
    state.currentValue = [{ name: 'Col1', folder: 'col1', order: ['first.png', 'second.png'] }];
    component.onCurrentArtifactChange({ collection: 'col1', artifact: 0 });
    component.onCurrentArtifactChange({ collection: 'col1', artifact: 1 });
    await new Promise<void>(resolve => setTimeout(resolve, 0));
    resolveFirst({ language: 'hebrew', spelling: '', vector: '', transcription: '', positions: [], bookSchema: [] });
    await new Promise<void>(resolve => setTimeout(resolve, 0));
    expect(component.getImage()).toBe(`local:///${encodeURIComponent('/project/artifacts/col1/second.png')}`);
    expect(component.artifact).toBeNull();
    expect(component.metadataReady).toBeTrue();
  });

  it('keeps unsaved metadata when a different collection changes', async () => {
    state.currentValue = [{ name: 'Col1', folder: 'col1', order: [imageName] }];
    component.onCurrentArtifactChange({ collection: 'col1', artifact: 0 });
    await new Promise<void>(resolve => setTimeout(resolve, 0));
    component.artifactForm.controls.language.setValue('hebrew');
    component.onArtifactSubmit();
    const artifact = component.artifact;
    state.data$.next(state.currentValue);
    expect(component.artifact).toBe(artifact);
    expect(component.metadataReady).toBeTrue();
  });
});
