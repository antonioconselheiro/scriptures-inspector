import { Component, EventEmitter, Output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncModalModule, ModalService } from '@belomonte/async-modal-ngx';
import { CurrentArtifact } from '@domain/current-artifact-model';
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
});
