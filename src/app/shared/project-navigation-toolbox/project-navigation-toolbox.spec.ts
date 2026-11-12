import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionsStatefull } from '@shared/system/collections-statefull';
import { SystemService } from '@shared/system/system-service';
import { ToolboxVisibilityService } from '@shared/toolbox/toolbox-visibility-service';
import { BehaviorSubject, of } from 'rxjs';
import { ProjectNavigationToolbox } from './project-navigation-toolbox';

describe('ProjectNavigationToolbox', () => {
  let fixture: ComponentFixture<ProjectNavigationToolbox>;
  let component: ProjectNavigationToolbox;
  let titles: HTMLElement[];
  let scrollTo: jasmine.Spy;
  let router: jasmine.SpyObj<Router>;
  let systemService: jasmine.SpyObj<SystemService>;
  let routeParams: BehaviorSubject<Record<string, string | number>>;

  beforeEach(async () => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    router.navigate.and.resolveTo(true);
    systemService = jasmine.createSpyObj<SystemService>('SystemService', [
      'registerImmediateSaveHandler',
      'saveCurrentPageImmediately'
    ]);
    systemService.registerImmediateSaveHandler.and.returnValue(() => {});
    systemService.saveCurrentPageImmediately.and.resolveTo();
    spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify({
      name: 'Test', path: '', target: { language: 'en' }, structures: []
    }));
    routeParams = new BehaviorSubject<Record<string, string | number>>({ book: 'GEN', chapter: 1 });

    TestBed.configureTestingModule({
      imports: [ProjectNavigationToolbox],
      providers: [
        { provide: ActivatedRoute, useValue: { params: routeParams, queryParams: of({}) } },
        { provide: Router, useValue: router },
        { provide: SystemService, useValue: systemService },
        { provide: CollectionsStatefull, useValue: { currentValue: [], data$: of([]), update: () => {} } }
      ]
    });

    fixture = TestBed.createComponent(ProjectNavigationToolbox);
    component = fixture.componentInstance;
    titles = [1, 2, 3].map(verse => {
      const title = document.createElement('h2');
      title.className = 'verseTitle';
      title.dataset['verse'] = String(verse);
      document.body.appendChild(title);
      return title;
    });
    scrollTo = spyOn(window, 'scrollTo');
    spyOnProperty(window, 'scrollY', 'get').and.returnValue(100);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    titles.forEach(title => title.remove());
    fixture.destroy();
  });

  it('starts visible in the former verse navigator position', () => {
    expect(TestBed.inject(ToolboxVisibilityService).codexNavigationVisible$.value).toBeTrue();
    const toolbox = fixture.nativeElement.querySelector('.toolbox') as HTMLElement;
    expect(toolbox.classList.contains('bottom-left')).toBeTrue();
    expect(toolbox.hidden).toBeFalse();
  });

  it('scrolls immediately when the verse input changes without navigating', () => {
    spyOn(titles[1], 'getBoundingClientRect').and.returnValue(new DOMRect(0, 250));
    const input = fixture.nativeElement.querySelector('input[name="selectedVerse"]') as HTMLInputElement;
    input.value = '2';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('change'));

    expect(scrollTo).toHaveBeenCalledOnceWith({ top: 350, behavior: 'smooth' });
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('updates the verse input as the document scrolls', async () => {
    spyOn(titles[0], 'getBoundingClientRect').and.returnValue(new DOMRect(0, -400));
    spyOn(titles[1], 'getBoundingClientRect').and.returnValue(new DOMRect(0, 1));
    spyOn(titles[2], 'getBoundingClientRect').and.returnValue(new DOMRect(0, 100));

    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('input[name="selectedVerse"]') as HTMLInputElement;
    expect(component.formSelectedVerse).toBe(2);
    expect(input.value).toBe('2');
  });

  it('clears the current verse before the first title and ignores scroll in the transcriptor', () => {
    spyOn(titles[0], 'getBoundingClientRect').and.returnValue(new DOMRect(0, 100));
    component.onScroll();
    expect(component.formSelectedVerse).toBeNull();

    component.formSelectedVerse = 3;
    component.context = 'transcriptor';
    component.onScroll();
    expect(component.formSelectedVerse).toBe(3);
  });

  it('hides the verse field in the transcriptor', () => {
    component.context = 'transcriptor';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('input[name="selectedVerse"]')).toBeNull();
  });

  it('does not scroll for invalid or missing verses', () => {
    component.scrollToVerse(NaN);
    component.scrollToVerse(0);
    component.scrollToVerse(1.5);
    component.scrollToVerse(99);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('still saves and navigates to another chapter with the selected verse', async () => {
    component.formSelectedArtifactOrChapter = 2;
    component.formSelectedVerse = 3;
    spyOn(titles[2], 'getBoundingClientRect').and.returnValue(new DOMRect(0, 75));
    await component.open();
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

    expect(systemService.saveCurrentPageImmediately).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledOnceWith(
      ['/translator/book', 'GEN', 'chapter', '2'],
      { queryParams: { verse: 3 } }
    );
    expect(scrollTo).toHaveBeenCalledOnceWith({ top: 175, behavior: 'smooth' });
  });

  it('does not navigate when saving the current page fails', async () => {
    component.formSelectedArtifactOrChapter = 2;
    systemService.saveCurrentPageImmediately.and.rejectWith(new Error('Save failed'));
    spyOn(console, 'error');

    await component.open();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it('starts a selected collection at artifact zero and accepts zero in route parameters', async () => {
    component.collections = [{ name: 'Col1', folder: 'col1', order: ['first.png'] }];
    component.selectNavigationItem('collection-col1');
    expect(component.formSelectedArtifactOrChapter).toBe(0);
    await component.open();
    expect(router.navigate).toHaveBeenCalledOnceWith(
      ['/transcriptor/collection', 'col1', 'artifact', '0'], { queryParams: { verse: null } }
    );

    const emit = spyOn(component.onCurrentArtifact, 'emit');
    routeParams.next({ collection: 'col1', artifact: '0' });
    expect(emit).toHaveBeenCalledOnceWith({ collection: 'col1', artifact: 0 });
    expect(component.context).toBe('transcriptor');
    component.next();
    expect(component.formSelectedArtifactOrChapter).toBe(0);
  });

  it('rejects invalid collection indices before navigating', async () => {
    component.collections = [{ name: 'Col1', folder: 'col1', order: ['first.png'] }];
    component.selectNavigationItem('collection-col1');
    component.formSelectedArtifactOrChapter = 1;
    spyOn(window, 'alert');
    await component.open();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });
});
