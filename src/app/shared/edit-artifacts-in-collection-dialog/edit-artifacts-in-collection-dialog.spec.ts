import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Project } from '@domain/project-model';
import { CollectionsStatefull } from '@shared/system/collections-statefull';
import { EditArtifactsInCollectionDialog } from './edit-artifacts-in-collection-dialog';

describe('EditArtifactsInCollectionDialog', () => {
  const project: Project = { name: 'Test', path: '/project', target: { language: 'en' }, structures: [] };
  let fixture: ComponentFixture<EditArtifactsInCollectionDialog>;
  let component: EditArtifactsInCollectionDialog;
  let api: jasmine.SpyObj<Window['api']>;
  let update: jasmine.Spy;
  let originalApi: PropertyDescriptor | undefined;

  beforeEach(async () => {
    originalApi = Object.getOwnPropertyDescriptor(window, 'api');
    api = jasmine.createSpyObj<Window['api']>('api', ['listDirectories', 'readJsonFile', 'writeJsonFile', 'importImages']);
    api.listDirectories.and.resolveTo(['first', 'second']);
    api.readJsonFile.and.callFake(async path => JSON.parse(JSON.stringify(path.includes('/first/')
      ? { name: 'First', order: ['old.png'] }
      : { name: 'Second', order: ['previous.png'] })));
    api.writeJsonFile.and.resolveTo();
    api.importImages.and.resolveTo();
    Object.defineProperty(window, 'api', { configurable: true, value: api });
    update = jasmine.createSpy('update');
    spyOn(window, 'alert');

    await TestBed.configureTestingModule({
      imports: [EditArtifactsInCollectionDialog],
      providers: [{ provide: CollectionsStatefull, useValue: { update } }]
    }).compileComponents();
    fixture = TestBed.createComponent(EditArtifactsInCollectionDialog);
    component = fixture.componentInstance;
    component.onInjectData({ project, fromFiles: ['/incoming/new.png'] });
    fixture.detectChanges();
    await new Promise<void>(resolve => setTimeout(resolve, 0));
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    if (originalApi) {
      Object.defineProperty(window, 'api', originalApi);
    } else {
      Reflect.deleteProperty(window, 'api');
    }
  });

  it('switches collections and copies only new images before saving the selected order', async () => {
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = 'second';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.selectedCollectionFiles).toEqual([
      '/project/artifacts/second/previous.png', '/incoming/new.png'
    ]);
    component.selectedCollectionFiles.reverse();
    const close = spyOn(component, 'close');
    component.importArtifacts('second');
    await new Promise<void>(resolve => setTimeout(resolve, 0));
    await fixture.whenStable();

    expect(api.importImages).toHaveBeenCalledOnceWith(['/incoming/new.png'], '/project/artifacts/second');
    expect(api.writeJsonFile).toHaveBeenCalledOnceWith('/project/artifacts/second/metadata.json', {
      name: 'Second', order: ['new.png', 'previous.png']
    });
    expect(api.importImages).toHaveBeenCalledBefore(api.writeJsonFile);
    expect(update).toHaveBeenCalledOnceWith(project);
    expect(close).toHaveBeenCalled();
  });

  it('does not save metadata or close if image copying fails', async () => {
    api.importImages.and.rejectWith(new Error('copy failed'));
    spyOn(console, 'error');
    const close = spyOn(component, 'close');

    component.importArtifacts('first');
    await new Promise<void>(resolve => setTimeout(resolve, 0));
    await fixture.whenStable();

    expect(api.writeJsonFile).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('An error occurred while importing the files.');
  });

  it('prevents importing without a valid collection', () => {
    component.collections = [];
    component.onCollectionChoose('');
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect((fixture.nativeElement.querySelector('.dialogActions button') as HTMLButtonElement).disabled).toBeTrue();
    component.importArtifacts('');
    expect(api.importImages).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Select an artifact collection before importing images.');
  });
});
