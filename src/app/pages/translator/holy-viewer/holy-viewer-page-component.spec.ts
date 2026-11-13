import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { Project } from '@domain/project-model';
import { HolyViewerPageComponent } from './holy-viewer-page-component';

describe('HolyViewerPageComponent', () => {
  const originalApi = Object.getOwnPropertyDescriptor(window, 'api');
  let menuAction: (action: 'return-to-editor') => void;
  let removeMenuListener: jasmine.Spy;
  let setPreviewActive: jasmine.Spy;

  beforeEach(() => {
    removeMenuListener = jasmine.createSpy('removeMenuListener');
    setPreviewActive = jasmine.createSpy('setPreviewActive').and.resolveTo();
    Object.defineProperty(window, 'api', {
      configurable: true,
      value: {
        setPreviewActive,
        onOpenProjectMenuAction: (callback: (action: 'return-to-editor') => void) => {
          menuAction = callback;
          return removeMenuListener;
        }
      }
    });
  });

  afterEach(() => {
    if (originalApi) {
      Object.defineProperty(window, 'api', originalApi);
    } else {
      Reflect.deleteProperty(window, 'api');
    }
  });

  it('renders the custom translation and combines selected variations instead of reference translations', async () => {
    const router = { navigateByUrl: jasmine.createSpy('navigateByUrl').and.resolveTo(true) };
    const project: Project = {
      name: 'Test',
      path: '/test',
      target: { language: 'portuguese' },
      structures: [{
        source: 'original',
        metadataTarget: 'original-metadata',
        customTranslationTarget: 'original-translation',
        interlinear: [{
          source: 'related',
          metadataTarget: 'related-metadata',
          interlinearTarget: 'related-interlinear',
          customTranslationTarget: 'related-translation'
        }, {
          source: 'geez',
          metadataTarget: 'geez-metadata',
          interlinearTarget: 'geez-interlinear'
        }]
      }, {
        source: 'another-chapter',
        metadataTarget: 'original-metadata'
      }],
      translationViewer: [
        { translation: 'portuguese', associatedTo: ['original'] },
        { translation: 'greek', associatedTo: ['original'] }
      ]
    };
    spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify(project));

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ book: 'GEN', chapter: '1' }),
              queryParamMap: convertToParamMap({ verse: '2' }),
              data: {
                sources: {
                  original: { chapters: [{ chapter: 1, verses: [
                    { verse: 1, text: 'אב' }, { verse: 2, text: 'גד־אב' }
                  ] }] },
                  related: { chapters: [{ chapter: 1, verses: [{ verse: 1, text: 'גד' }] }] },
                  geez: { chapters: [{ chapter: 1, verses: [{ verse: 1, text: 'ቃል፡ ሰላም።' }] }] },
                  'another-chapter': { chapters: [{ chapter: 2, verses: [{ verse: 1, text: 'אב' }] }] },
                  portuguese: { chapters: [{ chapter: 1, verses: [{ verse: 1, text: 'Texto de referência' }] }] },
                  greek: { chapters: [{ chapter: 1, verses: [{ verse: 1, text: 'πατήρ' }] }] }
                },
                targets: {
                  'original-metadata': {
                    chapters: [{
                      chapter: 1,
                      verses: [{ verse: 1, metadata: { '0-אב': { segment: 'אב', isWordOfGod: true } } }]
                    }],
                    patterns: { prefix: [], suffix: [], lexeme: [] },
                    lexical: { 'אב': { value: 'Pai' } }
                  },
                  'related-metadata': {
                    chapters: [],
                    patterns: { prefix: [], suffix: [], lexeme: [] },
                    lexical: { 'גד': { value: 'relacionado' } }
                  },
                  'geez-metadata': {
                    chapters: [],
                    patterns: { prefix: [], suffix: [], lexeme: [] },
                    lexical: { 'ቃል': { value: 'palavra' } }
                  },
                  'geez-interlinear': {
                    original: {
                      chapters: [{
                        chapter: 1, origin: 1,
                        verses: [{
                          chapter: 1, verse: 1, originVerse: 1,
                          words: [{ originIndex: 0, originWord: 'אב', translationIndex: 0, translationWord: 'ቃል' }]
                        }]
                      }]
                    }
                  },
                  'related-interlinear': {
                    original: {
                      chapters: [{
                        chapter: 1, origin: 1,
                        verses: [{
                          chapter: 1, verse: 1, originVerse: 1,
                          words: [{ originIndex: 0, originWord: 'אב', translationIndex: 0, translationWord: 'גד' }]
                        }]
                      }]
                    }
                  },
                  'related-translation': {
                    variations: { singular: { name: 'Related variation' } },
                    chapters: [{
                      chapter: 1,
                      verses: [{
                        verse: 1, text: 'Ligado', metadata: [{ size: 6, value: '0-גד' }],
                        variations: { singular: { '0': { value: 'Unido' } } }
                      }]
                    }]
                  },
                  'original-translation': {
                    variations: {
                      singular: { name: 'Elohim no singular' },
                      arrow: { name: 'Aleph e Taw como ➜' },
                      transliteration: { name: 'Palavras-chave transliteradas' },
                      numbers: { name: 'Números como Algarismos' }
                    },
                    chapters: [{
                      chapter: 1,
                      verses: [{
                        verse: 1,
                        text: 'No princípio criou Divos AZ os céus e AZ a terra.',
                        metadata: [
                          { size: 2, value: '0-ב' },
                          { size: 9, value: '1-ראשית' },
                          { size: 5, value: '2-ברא' },
                          { size: 5, value: '3-אלהים' },
                          { size: 2, value: '4-את' },
                          { size: 2, value: '5-ה' },
                          { size: 4, value: '6-שמים' },
                          { size: 1, value: '7-ו' },
                          { size: 2, value: '8-את' },
                          { size: 1, value: '9-ה' },
                          { size: 5, value: '10-ארץ' },
                          { size: 1, value: '11-׃' }
                        ],
                        variations: {
                          singular: { '3': { value: 'Deus' } },
                          arrow: { '4': { value: '➜' }, '8': { value: '➜' } },
                          transliteration: { '3': { value: 'Elohim' } }
                        }
                      }]
                    }]
                  }
                }
              }
            },
            parent: {
              snapshot: {
                data: {
                  codex: {
                    original: { name: 'Original', language: 'hebrew' },
                    related: { name: 'Related', language: 'hebrew' },
                    geez: { name: 'Geez', language: 'geez' },
                    'another-chapter': { name: 'Other', language: 'hebrew' },
                    portuguese: { name: 'Português', language: 'portuguese' },
                    greek: { name: 'Grego', language: 'greek' }
                  }
                }
              }
            }
          }
        },
        { provide: Router, useValue: router }
      ]
    });

    const fixture = TestBed.createComponent(HolyViewerPageComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.config.scope).toBe('chapter');
    expect(fixture.componentInstance.config.verse).toBe(2);
    expect(fixture.componentInstance.config.displayMode).toBe('prismatic');
    expect(fixture.componentInstance.config.fontSize).toBe(28);
    expect(setPreviewActive).toHaveBeenCalledOnceWith(true);
    menuAction('return-to-editor');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/translator/book/GEN/chapter/1');
    router.navigateByUrl.calls.reset();
    fixture.nativeElement.querySelector('.returnToEditor').click();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/translator/book/GEN/chapter/1');
    expect(fixture.nativeElement.querySelectorAll('.holyVerse').length).toBe(2);
    expect(fixture.nativeElement.querySelector('.passageTitle').textContent.trim()).toBe('GEN 1');
    expect(fixture.nativeElement.querySelector('.returnToEditor svg')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="Configure Holy Viewer"] svg')).not.toBeNull();
    const verse = fixture.componentInstance.verses[0];
    expect(verse.lines.find(line => line.type === 'original')?.pieces.map(piece => piece.text).join('')).toBe('אב');
    expect(verse.lines.filter(line => line.type === 'customTranslation').length).toBe(2);
    expect(verse.lines.some(line => line.type === 'transliteration' && line.source === 'related')).toBeTrue();
    expect(verse.lines.some(line => line.type === 'numerology' && line.source === 'related')).toBeTrue();
    expect(verse.lines.find(line => line.type === 'spelling' && line.source === 'original')?.optionId)
      .toBe('hypothetical-paleo');
    expect(verse.lines.find(line => line.type === 'numerology' && line.source === 'related')?.optionId)
      .toBe('gematria');
    expect(fixture.nativeElement.textContent).toContain('No princípio criou Divos AZ os céus e AZ a terra.');
    expect(fixture.nativeElement.textContent).not.toContain('Pai');
    expect(fixture.nativeElement.textContent).not.toContain('Texto de referência');
    expect(fixture.nativeElement.textContent).not.toContain('πατήρ');
    expect(fixture.nativeElement.textContent).not.toContain('No verses are available');
    const geezLine = fixture.nativeElement.querySelector('.holyLine [lang="geez"]') as HTMLElement;
    expect(geezLine.textContent).toBe('ቃል፡ ሰላም።');
    expect(Array.from(geezLine.children).map(child => child.textContent)).toEqual(['ቃል', 'ሰላም።']);
    expect(Array.from(geezLine.childNodes).some(node => node.nodeType === Node.TEXT_NODE && node.textContent === '፡ '))
      .toBeTrue();
    expect(geezLine.children[0].classList.contains('prisma1')).toBeTrue();
    expect(geezLine.children[0].getAttribute('title')).toBe('palavra');
    expect(geezLine.children[1].classList.contains('prisma')).toBeTrue();
    const hebrewLine = fixture.nativeElement.querySelectorAll('.holyVerse')[1]
      .querySelector('.holyLine [lang="hebrew"]') as HTMLElement;
    expect(hebrewLine.textContent).toBe('גד־אב');
    expect(Array.from(hebrewLine.children).map(child => child.textContent)).toEqual(['גד', 'אב']);
    expect(Array.from(hebrewLine.childNodes).some(node => node.nodeType === Node.TEXT_NODE && node.textContent === '־'))
      .toBeTrue();

    const root: HTMLElement = fixture.nativeElement;
    root.querySelector<HTMLButtonElement>('[aria-label="Configure Holy Viewer"]')!.click();
    fixture.detectChanges();
    expect(Array.from(root.querySelectorAll('[role="tab"]')).map(tab => tab.textContent?.trim()))
      .toEqual(['original', 'related', 'geez']);
    expect(root.textContent).not.toContain('Lexical values');
    const selectVariation = (labelText: string): void => {
      const label = Array.from(root.querySelectorAll('fieldset label'))
        .find(item => item.textContent?.includes(labelText));
      expect(label).toBeDefined();
      label!.querySelector<HTMLInputElement>('input')!.click();
      fixture.detectChanges();
    };
    selectVariation('Elohim no singular');
    selectVariation('Aleph e Taw como ➜');
    const relatedTab = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'))
      .find(tab => tab.textContent?.trim() === 'related')!;
    relatedTab.click();
    fixture.detectChanges();
    await fixture.whenStable();
    const relatedTooltip = root.querySelector<HTMLInputElement>('input[name="showOriginalLexicalTooltip"]')!;
    expect(relatedTooltip.checked).toBeTrue();
    relatedTooltip.click();
    selectVariation('Related variation');
    const mode = root.querySelector<HTMLSelectElement>('select[name="displayMode"]')!;
    mode.value = 'prismatic';
    mode.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    Array.from(root.querySelectorAll('button')).find(button => button.textContent?.trim() === 'Apply')!.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No princípio criou Deus ➜ os céus e ➜ a terra.');
    expect(fixture.nativeElement.textContent).toContain('Unido');
    const originalText = Array.from(root.querySelectorAll('.holyVerse'))[0].querySelectorAll('[title="Pai"]');
    const relatedText = Array.from(root.querySelectorAll('[title="relacionado"]'));
    expect(originalText.length).toBe(1);
    expect(relatedText.length).toBe(0);
    const lines = Array.from(fixture.nativeElement.querySelectorAll('.holyLine')) as HTMLElement[];
    const translationLine = lines.find(line => line.textContent?.includes('No princípio'))!;
    const translatedSpans = Array.from(translationLine.querySelectorAll('span'));
    expect(translatedSpans.find(span => span.textContent === 'Deus')?.classList.contains('prisma4')).toBeTrue();
    expect(translatedSpans.find(span => span.textContent === '➜')?.classList.contains('prisma5')).toBeTrue();
    expect(fixture.componentInstance.variationOptions.map(option => option.id))
      .toEqual(['singular', 'arrow', 'transliteration', 'numbers', 'singular']);
    const relatedLine = verse.lines.find(line => line.variationTarget === 'related-translation');
    expect(relatedLine?.pieces[0].wordOfGod).toBeTrue();
    expect(relatedLine?.pieces[0].color).toBe('1');
    fixture.componentInstance.config = { ...fixture.componentInstance.config, displayMode: 'wordOfGod' };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(geezLine.children[0].classList.contains('godsaid')).toBeTrue();
    expect(Array.from(geezLine.childNodes).some(node => node.nodeType === Node.TEXT_NODE && node.textContent === '፡ '))
      .toBeTrue();
    fixture.destroy();
    expect(removeMenuListener).toHaveBeenCalledTimes(1);
    expect(setPreviewActive).toHaveBeenCalledWith(false);
  });
});
