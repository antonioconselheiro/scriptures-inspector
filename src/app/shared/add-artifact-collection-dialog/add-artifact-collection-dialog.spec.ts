import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Project } from '@domain/project-model';
import { CollectionsStatefull } from '@shared/system/collections-statefull';
import { Subject } from 'rxjs';
import { AddArtifactCollectionDialog } from './add-artifact-collection-dialog';

describe('AddArtifactCollectionDialog', () => {
  const project: Project = { name: 'Test', path: '/project', target: { language: 'en' }, structures: [] };
  let fixture: ComponentFixture<AddArtifactCollectionDialog>;
  let api: jasmine.SpyObj<Window['api']>;
  let originalApi: PropertyDescriptor | undefined;
  let update: jasmine.Spy;

  const field = (selector: string): HTMLInputElement | HTMLTextAreaElement =>
    fixture.nativeElement.querySelector(selector);
  const enter = (selector: string, value: string): void => {
    const element = field(selector);
    element.value = value;
    element.dispatchEvent(new Event('input'));
  };
  const name = '#projectCreateArtifactCollections';
  const description = '#projectCreateArtifactCollectionsDescription';
  const sources = '#projectCreateArtifactCollectionSources';
  const folder = '#projectCreateArtifactCollectionFolder';

  beforeEach(async () => {
    originalApi = Object.getOwnPropertyDescriptor(window, 'api');
    api = jasmine.createSpyObj<Window['api']>('api', ['readOptionalJsonFile', 'writeJsonFile']);
    api.readOptionalJsonFile.and.resolveTo({ name: 'Existing', description: 'Original', order: ['first.png'], extra: 'preserved' });
    api.writeJsonFile.and.resolveTo();
    Object.defineProperty(window, 'api', { configurable: true, value: api });
    update = jasmine.createSpy('update');
    TestBed.configureTestingModule({
      imports: [AddArtifactCollectionDialog],
      providers: [{ provide: CollectionsStatefull, useValue: {
        currentValue: [{ name: 'Existing', description: 'Original', sources: ['Old book'], folder: 'existing', order: ['old.png'] }],
        data$: new Subject(), update
      } }]
    });
    fixture = TestBed.createComponent(AddArtifactCollectionDialog);
    fixture.componentInstance.onInjectData({ project });
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    if (originalApi) Object.defineProperty(window, 'api', originalApi);
    else Reflect.deleteProperty(window, 'api');
  });

  it('creates a collection with free-form references as separate strings', async () => {
    enter(name, 'New Collection');
    enter(description, 'Description');
    enter(sources, ' https://example.org/item \n\n Book, volume 1 \r\n');
    fixture.detectChanges();
    expect(field(folder).value).toBe('new-collection');
    fixture.nativeElement.querySelector('.dialogActions button').click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(api.writeJsonFile).toHaveBeenCalledOnceWith('/project/artifacts/new-collection/metadata.json', {
      name: 'New Collection', description: 'Description', order: [],
      sources: ['https://example.org/item', 'Book, volume 1']
    });
    expect(field(name).value).toBe('');
    expect(field(sources).value).toBe('');
    expect(update).toHaveBeenCalledWith(project);
  });

  it('edits all fields in the creation form and preserves the folder, order and other metadata', async () => {
    fixture.nativeElement.querySelector('[aria-label="Edit collection Existing"]').click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(field(name).value).toBe('Existing');
    expect(field(description).value).toBe('Original');
    expect(field(sources).value).toBe('Old book');
    expect(field(folder).value).toBe('existing');
    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('.dialogActions button');
    expect(Array.from(buttons, button => button.textContent?.trim())).toEqual(['Cancel', 'Save']);
    enter(name, 'Renamed');
    enter(description, 'Updated description');
    enter(sources, 'Book citation\nhttps://example.org');
    fixture.detectChanges();
    expect(field(folder).value).toBe('existing');
    buttons[1].click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(api.readOptionalJsonFile).toHaveBeenCalledOnceWith('/project/artifacts/existing/metadata.json');
    expect(api.writeJsonFile).toHaveBeenCalledOnceWith('/project/artifacts/existing/metadata.json', {
      name: 'Renamed', description: 'Updated description', order: ['first.png'], extra: 'preserved',
      sources: ['Book citation', 'https://example.org']
    });
    expect(fixture.nativeElement.querySelector('.dialogActions button').textContent.trim()).toBe('Create');
    expect(field(name).value).toBe('');
    expect(field(description).value).toBe('');
    expect(field(sources).value).toBe('');
    expect(fixture.nativeElement.querySelector('[aria-label="Edit collection Renamed"]')).not.toBeNull();
    expect(TestBed.inject(CollectionsStatefull).currentValue[0].name).toBe('Existing');
    expect(update).toHaveBeenCalledWith(project);
  });

  it('cancels editing and returns to an empty creation form without writing', async () => {
    fixture.nativeElement.querySelector('[aria-label="Edit collection Existing"]').click();
    fixture.detectChanges();
    await fixture.whenStable();
    enter(name, 'Unsaved name');
    fixture.nativeElement.querySelector('.dialogActions button').click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(field(name).value).toBe('');
    expect(field(description).value).toBe('');
    expect(field(sources).value).toBe('');
    expect(fixture.nativeElement.querySelector('.dialogActions button').textContent.trim()).toBe('Create');
    expect(api.writeJsonFile).not.toHaveBeenCalled();
  });

  it('keeps unsaved fields available if writing fails', async () => {
    api.writeJsonFile.and.rejectWith(new Error('write failed'));
    spyOn(window, 'alert');
    spyOn(console, 'error');
    const component = fixture.componentInstance;
    component.editCollection(component.collections[0]);
    component.collectionName = 'New name';
    component.collectionSources = 'Book';
    await component.saveCollection();
    expect(component.editingFolder).toBe('existing');
    expect(component.collectionName).toBe('New name');
    expect(component.collectionSources).toBe('Book');
    expect(component.collections[0].name).toBe('Existing');
    expect(update).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });

  it('does not recreate missing metadata when saving', async () => {
    api.readOptionalJsonFile.and.resolveTo(null);
    spyOn(window, 'alert');
    spyOn(console, 'error');
    const component = fixture.componentInstance;
    component.editCollection(component.collections[0]);
    await component.saveCollection();
    expect(api.writeJsonFile).not.toHaveBeenCalled();
    expect(component.editingFolder).toBe('existing');
    expect(window.alert).toHaveBeenCalled();
  });

  it('supports old metadata without references and saving an empty list', async () => {
    const component = fixture.componentInstance;
    component.collections[0].sources = undefined;
    component.editCollection(component.collections[0]);
    expect(component.collectionSources).toBe('');
    component.collectionSources = ' \n ';
    await component.saveCollection();
    expect(api.writeJsonFile).toHaveBeenCalledOnceWith('/project/artifacts/existing/metadata.json', {
      name: 'Existing', description: 'Original', order: ['first.png'], extra: 'preserved', sources: []
    });
  });

  it('keeps unsaved changes when switching collections is declined', () => {
    const component = fixture.componentInstance;
    component.editCollection(component.collections[0]);
    component.collectionDescription = 'Unsaved description';
    spyOn(window, 'confirm').and.returnValue(false);
    component.editCollection({ name: 'Other', folder: 'other', order: [] });
    expect(component.editingFolder).toBe('existing');
    expect(component.collectionDescription).toBe('Unsaved description');
  });

  it('protects an unfinished creation form when entering edit mode', () => {
    const component = fixture.componentInstance;
    component.collectionName = 'Draft';
    spyOn(window, 'confirm').and.returnValue(false);
    component.editCollection(component.collections[0]);
    expect(component.editingFolder).toBeNull();
    expect(component.collectionName).toBe('Draft');
  });

  it('does not save a blank collection name', async () => {
    const component = fixture.componentInstance;
    component.editCollection(component.collections[0]);
    component.collectionName = '  ';
    spyOn(window, 'alert');
    await component.saveCollection();
    expect(api.writeJsonFile).not.toHaveBeenCalled();
    expect(component.editingFolder).toBe('existing');
    expect(window.alert).toHaveBeenCalled();
  });
});
