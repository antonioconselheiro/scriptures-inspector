import { Component, EventEmitter, Output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncModalModule, ModalService } from '@belomonte/async-modal-ngx';
import { CurrentArtifact } from '@domain/current-artifact-model';
import { ArtifactFragment } from '@domain/artifact-fragment-model';
import { Project } from '@domain/project-model';
import { ProjectNavigationToolbox } from '@shared/project-navigation-toolbox/project-navigation-toolbox';
import { CollectionsStatefull } from '@shared/system/collections-statefull';
import { Subject } from 'rxjs';
import { TranscriptionEditorComponent } from './transcription-editor-component';

@Component({ selector: 'app-project-navigation-toolbox', template: '' })
class NavigationStub {
  @Output() onProject = new EventEmitter<Project>();
  @Output() onCurrentArtifact = new EventEmitter<CurrentArtifact>();
}

describe('TranscriptionEditorComponent SVG rendering', () => {
  const project: Project = { name: 'Test', path: '/project', target: { language: 'en' }, structures: [] };
  const vector = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0h10v10z" onload="alert(1)"/></svg>';
  let originalApi: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalApi = Object.getOwnPropertyDescriptor(window, 'api');
  });

  afterEach(() => {
    if (originalApi) {
      Object.defineProperty(window, 'api', originalApi);
    } else {
      Reflect.deleteProperty(window, 'api');
    }
  });

  it('renders loaded and newly generated vectors without unsafe attributes', async () => {
    const results = new Subject<{ vector: string }>();
    const modal = {
      setBindToRoute() { return this; },
      setData() { return this; },
      setOutletName() { return this; },
      build() { return results; }
    };
    const state = {
      currentValue: [{ name: 'Mani', folder: 'mani', order: ['M101c.png'] }],
      data$: new Subject()
    };
    const readOptionalJsonFile = jasmine.createSpy().and.resolveTo({
      language: 'middle-persian', spelling: '', vector, transcription: '', positions: [], bookSchema: []
    });
    Object.defineProperty(window, 'api', { configurable: true, value: { readOptionalJsonFile } });
    TestBed.configureTestingModule({
      imports: [TranscriptionEditorComponent],
      providers: [
        { provide: Router, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: ModalService, useValue: { createModal: () => modal } },
        { provide: CollectionsStatefull, useValue: state }
      ]
    }).overrideComponent(TranscriptionEditorComponent, {
      remove: { imports: [ProjectNavigationToolbox, AsyncModalModule] },
      add: { imports: [NavigationStub] }
    });

    const fixture = TestBed.createComponent(TranscriptionEditorComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.onProjectChange(project);
    component.onCurrentArtifactChange({ collection: 'mani', artifact: 0 });
    await fixture.whenStable();
    fixture.detectChanges();
    const wrapper: HTMLElement = fixture.nativeElement.querySelector('.svgWrapper');
    expect(wrapper.querySelector('svg path')?.getAttribute('d')).toBe('M0 0h10v10z');
    expect(wrapper.querySelector('path')?.hasAttribute('onload')).toBeFalse();
    expect(component.artifact?.vector).toBe(vector);

    const toggle: HTMLInputElement = fixture.nativeElement.querySelector('#transcriptionEditorShowVector');
    expect(toggle.checked).toBeTrue();
    toggle.click();
    fixture.detectChanges();
    expect(wrapper.style.visibility).toBe('hidden');
    toggle.click();
    fixture.detectChanges();
    expect(wrapper.style.visibility).toBe('visible');

    component.openDialogDefineVector(component.artifact!);
    results.next({ vector: '<svg><path d="M1 1L2 2"/><script>alert(1)</script></svg>' });
    fixture.detectChanges();
    expect(wrapper.querySelector('svg path')?.getAttribute('d')).toBe('M1 1L2 2');
    expect(wrapper.querySelector('script')).toBeNull();
    fixture.destroy();
  });

  it('passes positioning helpers to the transcription dialog and applies only saved changes', () => {
    const results = new Subject<{ transcription: string; positions: { start: number; length: number; x: number; y: number; flip: number }[];
      bookSchema: { book: string; chapter: number; verse: number; start: number; length: number }[] } | void>();
    const modal = {
      setBindToRoute() { return this; },
      setData: jasmine.createSpy().and.callFake(() => modal),
      setOutletName() { return this; },
      build() { return results; }
    };
    TestBed.configureTestingModule({
      imports: [TranscriptionEditorComponent],
      providers: [
        { provide: Router, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: ModalService, useValue: { createModal: () => modal } },
        { provide: CollectionsStatefull, useValue: { currentValue: [], data$: new Subject() } }
      ]
    }).overrideComponent(TranscriptionEditorComponent, {
      remove: { imports: [ProjectNavigationToolbox, AsyncModalModule] },
      add: { imports: [NavigationStub] }
    });
    const fixture = TestBed.createComponent(TranscriptionEditorComponent);
    const component = fixture.componentInstance;
    const artifact: ArtifactFragment = {
      language: 'hebrew' as const, spelling: '', vector: '<svg width="200" height="100"></svg>',
      transcription: 'abc', positions: [{ start: 0, length: 1, x: 10, y: 10, flip: 0 }], bookSchema: []
    };
    component.artifact = artifact;
    component.project = { name: 'Test', path: '/project', structures: [],
      target: { language: 'en', books: { GEN: { name: 'Genesis' } } } };
    component.showVector = false;
    spyOn(component, 'getImage').and.returnValue('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==');
    fixture.detectChanges();
    component.openDialogEditTranscription(artifact);
    expect(modal.setData).toHaveBeenCalledWith(jasmine.objectContaining({
      transcription: artifact.transcription, positions: artifact.positions, spelling: component.artifactSpelling,
      bookSchema: [], books: { GEN: { name: 'Genesis' } },
      validatePositions: jasmine.any(Function), deletePositions: jasmine.any(Function)
    }));
    results.next();
    expect(artifact.transcription).toBe('abc');
    expect(artifact.positions.length).toBe(1);
    const bookSchema = [{ book: 'GEN', chapter: 1, verse: 1, start: 0, length: 7 }];
    results.next({ transcription: 'changed', positions: [], bookSchema });
    expect(artifact.transcription).toBe('changed');
    expect(artifact.positions).toEqual([]);
    expect(artifact.bookSchema).toEqual(bookSchema);
    fixture.destroy();
  });

  it('keeps visible checkboxes synchronized with their layers across artifact changes', () => {
    TestBed.configureTestingModule({
      imports: [TranscriptionEditorComponent],
      providers: [
        { provide: Router, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: ModalService, useValue: {} },
        { provide: CollectionsStatefull, useValue: { currentValue: [], data$: new Subject() } }
      ]
    }).overrideComponent(TranscriptionEditorComponent, {
      remove: { imports: [ProjectNavigationToolbox, AsyncModalModule] },
      add: { imports: [NavigationStub] }
    });

    const fixture = TestBed.createComponent(TranscriptionEditorComponent);
    const component = fixture.componentInstance;
    const artifact = {
      language: 'hebrew' as const, spelling: '', vector: '<svg></svg>',
      transcription: '', positions: [], bookSchema: []
    };
    component.artifact = artifact;
    spyOn(component, 'getImage').and.returnValue('data:image/png;base64,');
    fixture.detectChanges();

    const controls = [
      { id: 'transcriptionEditorShowImage', property: 'showImage', layer: 'img[alt="Fragment Image"]' },
      { id: 'transcriptionEditorShowVector', property: 'showVector', layer: '.svgWrapper' },
      { id: 'transcriptionEditorShowTranscriptionPositioning', property: 'showTranscriptionPositioning', layer: '.transcriptionPositioningWrapper' }
    ] as const;

    for (const { id, property, layer } of controls) {
      const input: HTMLInputElement = fixture.nativeElement.querySelector(`#${id}`);
      const target: HTMLElement = fixture.nativeElement.querySelector(layer);
      expect(input.checked).withContext(id).toBe(component[property]);
      expect(input.checked).withContext(id).toBeTrue();
      expect(target.style.visibility).withContext(id).toBe('visible');
      const style = getComputedStyle(input);
      expect(style.opacity).withContext(id).toBe('1');
      expect(style.position).withContext(id).not.toBe('absolute');
      expect(input.getBoundingClientRect().width).withContext(id).toBeGreaterThan(1);

      input.click();
      fixture.detectChanges();
      expect(component[property]).withContext(id).toBeFalse();
      expect(target.style.visibility).withContext(id).toBe('hidden');
      if (property === 'showTranscriptionPositioning') {
        expect(getComputedStyle(fixture.nativeElement.querySelector('.transcription-edits-toolbox .toolbox')).visibility).toBe('hidden');
      }
    }

    component.artifact = null;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    component.artifact = artifact;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    for (const { id, property, layer } of controls) {
      const input: HTMLInputElement = fixture.nativeElement.querySelector(`#${id}`);
      const target: HTMLElement = fixture.nativeElement.querySelector(layer);
      expect(input.checked).withContext(id).toBeFalse();
      expect(input.checked).withContext(id).toBe(component[property]);
      expect(target.style.visibility).withContext(id).toBe('hidden');
      input.click();
      fixture.detectChanges();
      expect(component[property]).withContext(id).toBeTrue();
      expect(target.style.visibility).withContext(id).toBe('visible');
    }
    fixture.destroy();
  });

  it('hides and restores positioned and unpositioned text with the transcription toggle', () => {
    TestBed.configureTestingModule({
      imports: [TranscriptionEditorComponent],
      providers: [
        { provide: Router, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: ModalService, useValue: {} },
        { provide: CollectionsStatefull, useValue: { currentValue: [], data$: new Subject() } }
      ]
    }).overrideComponent(TranscriptionEditorComponent, {
      remove: { imports: [ProjectNavigationToolbox, AsyncModalModule] },
      add: { imports: [NavigationStub] }
    });
    const fixture = TestBed.createComponent(TranscriptionEditorComponent);
    const positions = [
      { id: 'parent', start: 0, length: 5, x: 10, y: 10, flip: 0 },
      { id: 'child', parentId: 'parent', start: 1, length: 3, x: 5, y: 5, flip: 0 }
    ];
    fixture.componentInstance.artifact = {
      language: 'hebrew', spelling: '', vector: '<svg width="200" height="100"></svg>',
      transcription: 'First second', positions, bookSchema: []
    };
    fixture.detectChanges();

    const baseline: HTMLElement = fixture.nativeElement.querySelector('.baseline [data-segment-start="5"]');
    const parentText: HTMLElement = fixture.nativeElement.querySelector('[data-fragment-index="0"] > [data-segment-start="0"]');
    const childText: HTMLElement = fixture.nativeElement.querySelector('[data-fragment-index="1"] > [data-segment-start="1"]');
    const toggle: HTMLInputElement = fixture.nativeElement.querySelector('#transcriptionEditorShowTranscriptionPositioning');
    const covered: HTMLElement = fixture.nativeElement.querySelector('.baseline [data-segment-start="0"]');
    const textElements = [baseline, parentText, childText];
    for (const text of textElements) expect(getComputedStyle(text).visibility).toBe('visible');
    expect(getComputedStyle(covered).visibility).toBe('hidden');

    toggle.click();
    fixture.detectChanges();
    for (const text of textElements) expect(getComputedStyle(text).visibility).toBe('hidden');
    expect(fixture.componentInstance.artifact.positions).toEqual(positions);

    toggle.click();
    fixture.detectChanges();
    for (const text of textElements) expect(getComputedStyle(text).visibility).toBe('visible');
    expect(getComputedStyle(covered).visibility).toBe('hidden');
    fixture.destroy();
  });

  it('aligns the transcription canvas and SVG with the image while the edit toolbox floats', async () => {
    TestBed.configureTestingModule({
      imports: [TranscriptionEditorComponent],
      providers: [
        { provide: Router, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: ModalService, useValue: {} },
        { provide: CollectionsStatefull, useValue: { currentValue: [], data$: new Subject() } }
      ]
    }).overrideComponent(TranscriptionEditorComponent, {
      remove: { imports: [ProjectNavigationToolbox, AsyncModalModule] },
      add: { imports: [NavigationStub] }
    });
    const fixture = TestBed.createComponent(TranscriptionEditorComponent);
    fixture.componentInstance.artifact = {
      language: 'hebrew', spelling: '', vector: '<svg width="10" height="10" viewBox="0 0 10 10"></svg>', transcription: 'אבג', positions: [], bookSchema: []
    };
    spyOn(fixture.componentInstance, 'getImage').and.returnValue('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==');
    fixture.detectChanges();
    const image: HTMLElement = fixture.nativeElement.querySelector('img');
    image.style.width = '400px';
    image.style.height = '300px';
    fixture.detectChanges();
    const canvas: HTMLElement = fixture.nativeElement.querySelector('.artifact-canvas');
    const toolbox: HTMLElement = fixture.nativeElement.querySelector('.transcription-edits-toolbox .toolbox');
    await new Promise<void>(resolve => setTimeout(resolve, 50));
    fixture.detectChanges();
    const vector: SVGElement = fixture.nativeElement.querySelector('.svgWrapper svg');
    expect(canvas.getBoundingClientRect().left).toBe(image.getBoundingClientRect().left);
    expect(canvas.getBoundingClientRect().top).toBe(image.getBoundingClientRect().top);
    expect(canvas.getBoundingClientRect().width).toBe(image.getBoundingClientRect().width);
    expect(canvas.getBoundingClientRect().height).toBe(image.getBoundingClientRect().height);
    expect(vector.getBoundingClientRect().width).toBe(image.getBoundingClientRect().width);
    expect(vector.getBoundingClientRect().height).toBe(image.getBoundingClientRect().height);
    expect(toolbox.classList.contains('bottom-right')).toBeTrue();
    expect(getComputedStyle(toolbox).position).toBe('fixed');
    expect(toolbox.getBoundingClientRect().right).toBeCloseTo(document.documentElement.clientWidth - 16, 0);
    expect(toolbox.getBoundingClientRect().bottom).toBeCloseTo(document.documentElement.clientHeight - 16, 0);
    image.style.width = '200px';
    fixture.detectChanges();
    expect(canvas.getBoundingClientRect().width).toBe(image.getBoundingClientRect().width);
    image.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    await new Promise<void>(resolve => setTimeout(resolve, 50));
    fixture.detectChanges();
    expect(vector.getBoundingClientRect().width).toBe(10);
    expect(canvas.getBoundingClientRect().width).toBe(vector.getBoundingClientRect().width);
    expect(canvas.getBoundingClientRect().height).toBe(vector.getBoundingClientRect().height);
    fixture.destroy();
  });
});
