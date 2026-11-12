import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { Project } from '@domain/project-model';
import { HolyViewerPageComponent } from './holy-viewer-page-component';

describe('HolyViewerPageComponent', () => {
  it('renders the custom translation and combines selected variations instead of reference translations', () => {
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
        }]
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
                    { verse: 1, text: 'אב' }, { verse: 2, text: 'גד' }
                  ] }] },
                  related: { chapters: [{ chapter: 1, verses: [{ verse: 1, text: 'גד' }] }] },
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
                    lexical: {}
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
                    portuguese: { name: 'Português', language: 'portuguese' },
                    greek: { name: 'Grego', language: 'greek' }
                  }
                }
              }
            }
          }
        },
        { provide: Router, useValue: {} }
      ]
    });

    const fixture = TestBed.createComponent(HolyViewerPageComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.config.scope).toBe('chapter');
    expect(fixture.componentInstance.config.verse).toBe(2);
    expect(fixture.componentInstance.config.displayMode).toBe('prismatic');
    expect(fixture.componentInstance.config.sections.lexical).toBeTrue();
    expect(fixture.nativeElement.querySelectorAll('.holyVerse').length).toBe(2);
    expect(fixture.nativeElement.querySelector('[aria-label="Configure Holy Viewer"] svg')).not.toBeNull();
    const verse = fixture.componentInstance.verses[0];
    expect(verse.lines.find(line => line.type === 'original')?.pieces.map(piece => piece.text).join('')).toBe('אב');
    expect(verse.lines.filter(line => line.type === 'customTranslation').length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('No princípio criou Divos AZ os céus e AZ a terra.');
    expect(fixture.nativeElement.textContent).toContain('Pai');
    expect(fixture.nativeElement.textContent).not.toContain('Texto de referência');
    expect(fixture.nativeElement.textContent).not.toContain('πατήρ');
    expect(fixture.nativeElement.textContent).not.toContain('No verses are available');

    const root: HTMLElement = fixture.nativeElement;
    root.querySelector<HTMLButtonElement>('[aria-label="Configure Holy Viewer"]')!.click();
    fixture.detectChanges();
    const selectVariation = (labelText: string): void => {
      const label = Array.from(root.querySelectorAll('fieldset label'))
        .find(item => item.textContent?.includes(labelText));
      expect(label).toBeDefined();
      label!.querySelector<HTMLInputElement>('input')!.click();
      fixture.detectChanges();
    };
    selectVariation('Original · Elohim no singular');
    selectVariation('Original · Aleph e Taw como ➜');
    selectVariation('Related · Related variation');
    const mode = root.querySelector<HTMLSelectElement>('select[name="displayMode"]')!;
    mode.value = 'prismatic';
    mode.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    Array.from(root.querySelectorAll('button')).find(button => button.textContent?.trim() === 'Apply')!.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No princípio criou Deus ➜ os céus e ➜ a terra.');
    expect(fixture.nativeElement.textContent).toContain('Unido');
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
  });
});
