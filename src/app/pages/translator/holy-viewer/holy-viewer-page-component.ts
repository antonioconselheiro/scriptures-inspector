import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { Codex } from '@domain/codex-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { InterlinearTarget } from '@domain/interlinear-target-model';
import { KeyTranslation } from '@domain/key-translation-type';
import { languageList } from '@domain/language-list';
import { LanguageUnionType } from '@domain/language-union-type';
import { ProjectData } from '@domain/project-data-model';
import { Project } from '@domain/project-model';
import { ProjectStructureInterlinear } from '@domain/project-structure-interlinear-model';
import { ProjectStructureMetadata } from '@domain/project-structure-metadata-model';
import { SourceBook } from '@domain/source-book-model';
import { SourceVerse } from '@domain/source-verse-model';
import { Word } from '@domain/word-model';
import { getProjectLanguageFn } from '@shared/language-metadata/get-project-language-fn';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';
import { getProjectFn } from '@shared/project/get-project-fn';
import { ProjectCustomTranslationService } from '../translation-editor/shared/project/project-custom-translation-service';
import { ProjectDataService } from '../translation-editor/shared/project/project-data-service';
import { ProjectInterlinearService } from '../translation-editor/shared/project/project-interlinear-service';
import { ProjectMetadataService } from '../translation-editor/shared/project/project-metadata-service';
import {
  getCustomTranslationPresentationColor,
  getPresentationColor,
  getSerializedSegmentIndex
} from '../translation-editor/shared/scripture-presentation-core';
import { HolyViewerComponent } from './holy-viewer-component';
import {
  defaultHolyViewerConfig,
  HolyViewerConfig,
  HolyViewerLine,
  HolyViewerPiece,
  HolyViewerVariationOption,
  HolyViewerVerse
} from './holy-viewer-model';

function isSupportedLanguage(language: string): language is LanguageUnionType {
  return languageList.some(supported => supported === language);
}

@Component({
  selector: 'app-holy-viewer-page',
  imports: [HolyViewerComponent],
  template: `
    <button type="button" class="returnToEditor" (click)="returnToEditor()">Return to editor</button>
    <app-holy-viewer [verses]="verses" [config]="config" [variationOptions]="variationOptions" [configurable]="true"
      (configChange)="config = $event"></app-holy-viewer>
  `
})
export class HolyViewerPageComponent implements OnInit {
  project: Project | null = null;
  config: HolyViewerConfig = { ...structuredClone(defaultHolyViewerConfig), scope: 'chapter' };
  verses: HolyViewerVerse[] = [];
  variationOptions: HolyViewerVariationOption[] = [];
  private current: CurrentChapter | null = null;
  private sourceBooks: Record<string, SourceBook> = {};
  private codices: Record<string, Codex> = {};
  private projectData: ProjectData = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: ProjectDataService,
    private metadataService: ProjectMetadataService,
    private interlinearService: ProjectInterlinearService,
    private customTranslationService: ProjectCustomTranslationService
  ) { }

  ngOnInit(): void {
    this.project = getProjectFn();
    const book = this.route.snapshot.paramMap.get('book')?.toUpperCase();
    const chapter = Number(this.route.snapshot.paramMap.get('chapter'));
    if (!this.project || !book || !Number.isInteger(chapter) || chapter < 1) {
      throw new Error('Holy Viewer requires an open project and a valid book and chapter.');
    }

    this.current = { book, chapter };
    const data = this.route.snapshot.data;
    this.sourceBooks = data['sources'] ?? {};
    this.codices = this.route.parent?.snapshot.data['codex'] ?? data['codex'] ?? {};
    this.projectData = data['targets'] ?? {};
    this.variationOptions = this.collectVariationOptions(this.project.structures);
    this.config = {
      ...structuredClone(defaultHolyViewerConfig),
      scope: 'chapter',
      verse: 1,
      startVerse: 1,
      endVerse: 1
    };
    this.buildVerses();
    const requestedVerse = Number(this.route.snapshot.queryParamMap.get('verse'));
    if (Number.isInteger(requestedVerse) && this.verses.some(verse => verse.verse === requestedVerse)) {
      this.config = {
        ...this.config,
        verse: requestedVerse,
        startVerse: requestedVerse,
        endVerse: requestedVerse
      };
    }
  }

  returnToEditor(): void {
    if (!this.current) {
      return;
    }
    void this.router.navigateByUrl(
      `/translator/book/${encodeURIComponent(this.current.book)}/chapter/${this.current.chapter}`
    );
  }

  private buildVerses(): void {
    if (!this.project || !this.current) {
      return;
    }
    this.verses = this.project.structures.flatMap(structure => this.buildStructureVerses(structure));
    const firstVerse = this.verses[0]?.verse ?? 1;
    this.config = {
      ...this.config,
      verse: firstVerse,
      startVerse: firstVerse,
      endVerse: this.verses.at(-1)?.verse ?? firstVerse
    };
  }

  private buildStructureVerses(
    structure: Project['structures'][number]
  ): HolyViewerVerse[] {
    const project = this.project;
    const current = this.current;
    if (!project || !current) {
      return [];
    }

    const sourceBook = this.sourceBooks[structure.source];
    const metadata = this.projectData[structure.metadataTarget] as BookMetadataTarget | undefined;
    const codex = this.codices[structure.source];
    if (!sourceBook) {
      return [];
    }
    if (!metadata || !codex) {
      throw new Error(`Holy Viewer data is incomplete for source "${structure.source}".`);
    }
    const languageName = codex.language;
    if (!isSupportedLanguage(languageName)) {
      throw new Error(`Unsupported source language "${languageName}" for "${structure.source}".`);
    }

    const language = getProjectLanguageFn(project, languageName);
    const parsedPatterns = this.metadataService.parsePattern(metadata.patterns, language);
    const bookName = codex.books?.[current.book]?.name ?? current.book;
    const chapter = sourceBook.chapters.find(item => item?.chapter === current.chapter);
    if (!chapter) {
      throw new Error(`Chapter ${current.chapter} was not found in "${structure.source}".`);
    }

    return chapter.verses.map(verse => {
      const matrix = this.dataService.splitIntoMatrix(language, parsedPatterns, verse.text);
      const lines: HolyViewerLine[] = [
        {
          type: 'original',
          label: 'Original',
          language: languageMetadataRecord[languageName].label,
          pieces: matrix.flatMap(word => [
            ...word.segments.map(segment => {
              const lexical = this.dataService.getLexical(metadata, language, segment.word, segment.morpheme);
              return {
                text: segment.word,
                title: lexical.value,
                color: getPresentationColor(segment.index),
                wordOfGod: this.metadataService.getScriptureMetadataWordOfGod(
                  metadata, language, current, verse.verse, { segments: [segment] }
                )
              };
            }),
            ...(word.separator ? [{ text: word.separator }] : [])
          ])
        }
      ];

      this.addCustomTranslationLines(
        lines, structure.customTranslationTarget, sourceBook, current, verse, matrix, metadata, language,
        'Custom translation'
      );
      this.addInterlinearLines(
        lines, structure.interlinear ?? [], structure.source, current, verse, matrix, metadata, language
      );
      this.addLexicalLines(lines, matrix, metadata, language);
      this.addSpellingLines(lines, matrix, languageName);
      this.addTransliterationLine(lines, matrix, languageName);
      this.addNumerologyLines(lines, matrix, languageName);

      return {
        id: `${structure.source}-${verse.verse}`,
        bookName,
        chapter: current.chapter,
        verse: verse.verse,
        lines
      };
    });
  }

  private matrixPieces(
    matrix: Word[],
    getAttributes: (segment: Word['segments'][number]) => { color?: string; wordOfGod?: boolean } = () => ({})
  ): HolyViewerPiece[] {
    return matrix.flatMap(word => [
      ...word.segments.map(segment => ({ text: segment.word, ...getAttributes(segment) })),
      ...(word.separator ? [{ text: word.separator }] : [])
    ]);
  }

  private collectVariationOptions(structures: ProjectStructureMetadata[]): HolyViewerVariationOption[] {
    const options: HolyViewerVariationOption[] = [];
    const seen = new Set<string>();
    const visit = (structure: ProjectStructureMetadata): void => {
      const target = structure.customTranslationTarget;
      if (target && !seen.has(target)) {
        seen.add(target);
        const translation = this.projectData[target];
        if (translation) {
          for (const [id, variation] of Object.entries(translation.variations ?? {})) {
            options.push({
              target, id, name: variation.name,
              source: this.codices[structure.source]?.name ?? structure.source
            });
          }
        }
      }
      structure.interlinear?.forEach(visit);
    };
    structures.forEach(visit);
    return options;
  }

  private addInterlinearLines(
    lines: HolyViewerLine[],
    interlinearStructures: ProjectStructureInterlinear[],
    source: string,
    current: CurrentChapter,
    verse: SourceVerse,
    baseWordMatrix: Word[],
    baseMetadata: BookMetadataTarget,
    baseLanguage: ReturnType<typeof getProjectLanguageFn>,
    inheritedWordOfGod: (segmentIndex: number) => boolean = () => false,
    inheritedColor: (segmentIndex: number) => string = getPresentationColor
  ): void {
    for (const interlinear of interlinearStructures) {
      const interlinearBook = this.sourceBooks[interlinear.source];
      const interlinearMetadata = this.projectData[interlinear.metadataTarget] as BookMetadataTarget | undefined;
      const target = this.projectData[interlinear.interlinearTarget] as InterlinearTarget | undefined;
      const codex = this.codices[interlinear.source];
      const mappedChapter = target?.[source]?.chapters.find(item => item?.origin === current.chapter);
      const mappedVerse = mappedChapter?.verses?.find(item =>
        item?.originVerse === verse.verse
        && (item.originChapter === undefined || item.originChapter === current.chapter)
      );
      if (!interlinearBook || !interlinearMetadata || !target || !codex) {
        continue;
      }
      if (!isSupportedLanguage(codex.language)) {
        throw new Error(`Unsupported source language "${codex.language}" for "${interlinear.source}".`);
      }

      const interlinearChapter = mappedVerse?.chapter ?? current.chapter;
      const interlinearCurrent = { ...current, chapter: mappedChapter?.chapter ?? current.chapter };
      const sourceChapter = interlinearBook.chapters.find(item => item?.chapter === interlinearChapter);
      const interlinearVerse = sourceChapter?.verses?.find(item => item?.verse === (mappedVerse?.verse ?? verse.verse));
      if (!interlinearVerse) {
        continue;
      }

      const language = getProjectLanguageFn(this.project!, codex.language);
      const patterns = this.metadataService.parsePattern(interlinearMetadata.patterns, language);
      const matrix = this.dataService.splitIntoMatrix(language, patterns, interlinearVerse.text);
      const relatedWordOfGod = (segmentIndex: number): boolean => {
        const originIndex = this.interlinearService.getOriginWordIndex(
          target, source, interlinearCurrent, interlinearVerse, segmentIndex
        );
        const baseWord = baseWordMatrix.find(word => word.segments.some(segment => segment.index === originIndex));
        return Boolean(baseWord && (
          this.metadataService.getScriptureMetadataWordOfGod(baseMetadata, baseLanguage, current, verse.verse, baseWord)
          || baseWord.segments.some(segment => inheritedWordOfGod(segment.index))
        ));
      };
      const relatedColor = (segmentIndex: number): string => {
        const originIndex = this.interlinearService.getOriginWordIndex(
          target, source, interlinearCurrent, interlinearVerse, segmentIndex
        );
        return originIndex === null ? '' : inheritedColor(originIndex);
      };
      lines.push({
        type: 'interlinear',
        label: `Interlinear · ${codex.name}`,
        language: languageMetadataRecord[codex.language].label,
        pieces: this.matrixPieces(matrix, segment => {
          return {
            color: relatedColor(segment.index),
            wordOfGod: relatedWordOfGod(segment.index) || this.metadataService.getScriptureMetadataWordOfGod(
              interlinearMetadata, language, interlinearCurrent, interlinearVerse.verse, { segments: [segment] }
            )
          };
        })
      });
      this.addCustomTranslationLines(
        lines, interlinear.customTranslationTarget, interlinearBook, interlinearCurrent, interlinearVerse,
        matrix, interlinearMetadata, language, `Custom translation · ${codex.name}`, relatedWordOfGod, relatedColor
      );
      this.addInterlinearLines(
        lines, interlinear.interlinear ?? [], interlinear.source, interlinearCurrent, interlinearVerse,
        matrix, interlinearMetadata, language, relatedWordOfGod, relatedColor
      );
    }
  }

  private addCustomTranslationLines(
    lines: HolyViewerLine[],
    targetKey: KeyTranslation | undefined,
    sourceBook: SourceBook,
    current: CurrentChapter,
    verse: SourceVerse,
    matrix: Word[],
    bookMetadata: BookMetadataTarget,
    language: ReturnType<typeof getProjectLanguageFn>,
    label: string,
    relatedWordOfGod: (segmentIndex: number) => boolean = () => false,
    relatedColor?: (segmentIndex: number) => string
  ): void {
    if (!targetKey) {
      return;
    }
    const customTranslation = this.projectData[targetKey] as BookTranslationTarget | undefined;
    if (!customTranslation) {
      return;
    }
    const indexes = this.customTranslationService.getTranslationIndexes(sourceBook, current, verse);
    const customVerse = customTranslation.chapters[indexes.chapterIndex]?.verses[indexes.verseIndex];
    if (!customVerse?.text) {
      return;
    }
    const originalSegments = this.customTranslationService.splitCustomTranslation(customVerse);
    const makePiece = (text: string, index: number): HolyViewerPiece => {
      const metadata = customVerse.metadata[index];
      const linkedIndex = getSerializedSegmentIndex(metadata?.value ?? '');
      const sourceWord = matrix.find(word => word.segments.some(segment => segment.index === linkedIndex));
      const variations: Record<string, string> = {};
      for (const [variationId, changes] of Object.entries(customVerse.variations ?? {})) {
        const value = changes[String(index)]?.value;
        if (value) {
          variations[variationId] = value;
        }
      }
      return {
        text,
        variations,
        color: relatedColor && linkedIndex !== null
          ? relatedColor(linkedIndex)
          : getCustomTranslationPresentationColor(metadata?.value ?? ''),
        wordOfGod: Boolean(metadata?.isWordOfGod)
          || Boolean(sourceWord && this.metadataService.getScriptureMetadataWordOfGod(
            bookMetadata, language, current, verse.verse, sourceWord
          ))
          || (linkedIndex !== null && relatedWordOfGod(linkedIndex))
      };
    };
    const pieces: HolyViewerPiece[] = [];
    originalSegments.forEach((segment, index) => {
      pieces.push(makePiece(segment.segment, index));
      if (segment.hasTrailingSpace) {
        pieces.push({ text: ' ' });
      }
    });
    lines.push({ type: 'customTranslation', label, variationTarget: targetKey, pieces });
  }

  private addLexicalLines(
    lines: HolyViewerLine[],
    matrix: Word[],
    metadata: BookMetadataTarget,
    language: ReturnType<typeof getProjectLanguageFn>
  ): void {
    const pieces = matrix.flatMap(word => [
      ...word.segments.map(segment => ({
        text: this.dataService.getLexical(metadata, language, segment.word, segment.morpheme).value,
        color: getPresentationColor(segment.index)
      })),
      ...(word.separator ? [{ text: word.separator }] : [])
    ]).filter(piece => piece.text.length > 0);
    lines.push({ type: 'lexical', label: 'Lexical values', pieces });
  }

  private addSpellingLines(lines: HolyViewerLine[], matrix: Word[], language: LanguageUnionType): void {
    for (const spelling of languageMetadataRecord[language].alternativeSpelling ?? []) {
      lines.push({
        type: 'spelling',
        label: spelling.name,
        pieces: this.matrixPieces(matrix, segment => ({
          color: getPresentationColor(segment.index)
        })).map(piece => ({
          ...piece,
          text: spelling.parse ? spelling.parse(piece.text) : piece.text
        }))
      });
    }
  }

  private addNumerologyLines(lines: HolyViewerLine[], matrix: Word[], language: LanguageUnionType): void {
    for (const algorithm of languageMetadataRecord[language].numerology ?? []) {
      lines.push({
        type: 'numerology',
        label: algorithm.name,
        pieces: matrix.flatMap(word => [
          ...word.segments.map(segment => ({
            text: String(algorithm.calc(segment.word)),
            color: getPresentationColor(segment.index)
          })),
          ...(word.separator ? [{ text: word.separator }] : [])
        ])
      });
    }
  }

  private addTransliterationLine(lines: HolyViewerLine[], matrix: Word[], language: LanguageUnionType): void {
    const transliteration = languageMetadataRecord[language].transliteration;
    if (!transliteration) {
      return;
    }

    lines.push({
      type: 'transliteration',
      label: 'Transliteration',
      pieces: matrix.flatMap(word => [
        ...word.segments.map(segment => ({
          text: transliteration(segment.word),
          color: getPresentationColor(segment.index)
        })),
        ...(word.separator ? [{ text: word.separator }] : [])
      ])
    });
  }
}
