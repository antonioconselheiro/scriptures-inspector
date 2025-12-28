import { Component, Input } from '@angular/core';
import { CodexBookChapterVerseMetadata } from '@domain/codex-book-chapter-verse-metadata-model';
import { CodexBookChapterVerse } from '@domain/codex-book-chapter-verse-model';
import { CodexBook } from '@domain/codex-book-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { CustomTranslation } from '@domain/custom-translation-model';
import { Language } from '@domain/language-model';
import { SourceVerse } from '@domain/source-verse-model';
import { TranslationInterlinearVerse } from '@domain/translation-interlinear-verse-model';
import { SourceCodex } from '../../../../domain/source-codex-model';
import { HolyScriptureModel } from '../../domain/holy-scripture-model';
import { NewTestmentScriptures } from '../../domain/new-testment-scriptures-model';
import { OldTestmentScriptures } from '../../domain/old-testment-scriptures-model';
import { ProjectCustomTranslationService } from '@shared/project/project-custom-translation-service';
import { LiteralsPatternsService } from '../../literals-patterns-service';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { WordSegment } from '@domain/word-segment-model';
import { ProjectMetadataService } from '@shared/project/project-metadata-service';
import { ProjectData } from '@domain/project-data-model';
import { ProjectService } from '@shared/project/project-service';
import { CustomTranslationVerse } from '@domain/custom-translation-verse-model';

@Component({
  selector: 'app-custom-translation-component',
  imports: [],
  templateUrl: './custom-translation-component.html',
  styleUrl: './custom-translation-component.scss'
})
export class CustomTranslationComponent {

  @Input()
  pipeUpdaterController = 0;

  @Input()
  data!: ProjectData;

  @Input()
  sourceCodex!: SourceCodex;

  @Input()
  current!: CurrentChapter;

  @Input()
  sourceLang!: Language;

  @Input()
  target!: Language;

  @Input()
  parsedBook!: ParsedBookMetadata;

  @Input()
  sourceVerse!: SourceVerse;

  @Input()
  customTranslation!: CustomTranslation;

  constructor(
    private projectService: ProjectService,
    private projectMetadataService: ProjectMetadataService,
    private literalsPatternsService: LiteralsPatternsService,
    private projectCustomTranslationService: ProjectCustomTranslationService
  ) { }

  splitTextBySpacesAndPunctuation(value: string, pipeUpdaterController: number): string[] {
    pipeUpdaterController;
    return [...value.matchAll(/(\s*)(\S+?)(\.{3}|…|[.!?]+)?(?=\s|$)/g)]
      .flatMap(m => m[3] ? [`${m[1]}${m[2]}`, m[3]] : [`${m[1]}${m[2]}`])
      .map(m => m.trim());
  }

  splitIntoMatrix(text: string): Array<Array<WordSegment>> {
    let index = 0;
    return text.split(' ').map(word => this.literalsPatternsService.splitByPatterns(this.parsedBook.patterns, word).map(word => {
      return { index: index++, word };
    }));
  }

  private createCustomTranslationStructureIfNotExists(): string[] {
    if (!this.customTranslation[this.current.book]) {
      this.customTranslation[this.current.book] = {
        chapters: []
      };
    }

    if (!this.customTranslation[this.current.book].chapters[this.current.chapter]) {
      this.customTranslation[this.current.book].chapters[this.current.chapter] = [];
    }

    if (!this.customTranslation[this.current.book].chapters[this.current.chapter][this.sourceVerse.verse.index]) {
      this.customTranslation[this.current.book].chapters[this.current.chapter][this.sourceVerse.verse.index] = {
        ...this.sourceVerse
      };
    }

    const metadata = this.customTranslation[this.current.book].chapters[this.current.chapter][this.sourceVerse.verse.index].metadata || [];
    this.customTranslation[this.current.book].chapters[this.current.chapter][this.sourceVerse.verse.index].metadata = metadata;

    return metadata;
  }

  private derivateTranslationToCustom(verse: SourceVerse): void {
    this.createCustomTranslationStructureIfNotExists();
    this.customTranslation[this.current.book].chapters[this.current.chapter][this.sourceVerse.verse.index].text = this.splitIntoMatrix(verse.text)
      .flat()
      .map(word => this.getLexical(word.word))
      .join(' ');

    this.saveCustomTranslation();
  }

  getLexical(word: string): string {
    return this.projectMetadataService.getLexical(this.data, this.current.book, word);
  }

  private derivateInterlinearToCustom(verse: SourceVerse): void {
    const metadata = this.createCustomTranslationStructureIfNotExists();
    metadata.splice(0, metadata.length);
    const custom = this.customTranslation[this.current.book].chapters[this.current.chapter][this.sourceVerse.verse.index].text.split(' ');
    this.splitIntoMatrix(verse.text).flat().forEach(word => {
      if (custom[word.index] === this.getLexical(word.word)) {
        metadata.push(this.projectService.castSegmentIntoMetadataIndex(this.data, word));
      }
    });

    this.saveCustomTranslation();
  }

  derivateAllToCustom(): void {
    const current = confirm('overwrite verse translation and interlineares?');
    if (current) {
      this.derivateTranslationToCustom(this.sourceVerse);
      setTimeout(() => this.derivateInterlinearToCustom(this.sourceVerse));
    }
  }

  getCustomTranslationVerse(): CustomTranslationVerse | null {
    return this.customTranslation[this.current.book] &&
      this.customTranslation[this.current.book].chapters[this.current.chapter] &&
      this.customTranslation[this.current.book].chapters[this.current.chapter][this.sourceVerse.verse.index] || null;
  }

  updateCustomTranslation(input: HTMLInputElement): void {
    this.createCustomTranslationStructureIfNotExists();
    const chapter = this.customTranslation[this.current.book].chapters[this.current.chapter];

    if (chapter[this.sourceVerse.verse.index]) {
      if (input.value) {
        chapter[this.sourceVerse.verse.index].text = input.value;
      } else {
        chapter[this.sourceVerse.verse.index] = {
          ...this.sourceVerse,
          text: ''
        };
      }
    } else {
      chapter[this.sourceVerse.verse.index] = {
        ...this.sourceVerse,
        text: input.value
      };
    }

    this.saveCustomTranslation();
  }

  cleanCustomTranslation(input: HTMLInputElement): void {
    if (!confirm('clean custom translation on this verse?')) {
      return;
    }

    input.value = '';

    if (
      !this.customTranslation[this.current.book] ||
      !this.customTranslation[this.current.book].chapters[this.current.chapter] ||
      !this.customTranslation[this.current.book].chapters[this.current.chapter][this.sourceVerse.verse.index]
    ) {
      return;
    }

    this.customTranslation[this.current.book].chapters[this.current.chapter][this.sourceVerse.verse.index] = {
      ...this.sourceVerse,
      metadata: [],
      text: ''
    };

    this.saveCustomTranslation();
    this.pipeUpdaterController++;
  }

  getCustomTranslationColor(wordIndex: number): string {
    if (
      !this.customTranslation[this.current.book] ||
      !this.customTranslation[this.current.book].chapters[this.current.chapter] ||
      !this.customTranslation[this.current.book].chapters[this.current.chapter][this.sourceVerse.verse.index]
    ) {
      return '';
    }

    const translationMetadata = this.customTranslation[this.current.book].chapters[this.current.chapter][this.sourceVerse.verse.index].metadata;
    if (!translationMetadata) {
      return '';
    }

    const matches = translationMetadata[wordIndex] && translationMetadata[wordIndex].match(/^\d+/);
    if (matches) {
      return String(Number(Array.from(matches)[0]) % 7 + 1);
    }

    return '';
  }

  getCustomTranslationStyleRole(wordIndex: number): string {
    const book = this.currentBook;
    let verseMetadata: CodexBookChapterVerse<CodexBookChapterVerseMetadata> | null, customTranslationMetadataKey = '';

    if (lang === 'hebraic' && this.isOldBookGuard(book)) {
      const scriptureChapterMetadata = this.hebraicMetadata[book] && this.hebraicMetadata[book][this.currentChapter] || [];
      verseMetadata = scriptureChapterMetadata[verse.verse.index] || null;
      const translationChapterMetadata = this.customHebraicTranslation[book][this.currentChapter] || [];
      customTranslationMetadataKey = ((translationChapterMetadata[verse.verse.index]?.metadata || [])?.[wordIndex] || '');
    } else if (lang === 'greek' && this.isNewBookGuard(book)) {
      const scriptureChapterMetadata = this.greekMetadata[book] && this.greekMetadata[book][this.currentChapter] || [];
      verseMetadata = scriptureChapterMetadata[verse.verse.index] || null;
      const translationChapterMetadata = this.customGreekTranslation[book][this.currentChapter] || [];
      customTranslationMetadataKey = ((translationChapterMetadata[verse.verse.index]?.metadata || [])?.[wordIndex] || '');
    } else if (lang === 'geez') {
      let interlinearMetadata: { [book: string]: TranslationInterlinearVerse[][][] } = {};
      let scriptureChapterMetadata: CodexBookChapterVerse<CodexBookChapterVerseMetadata>[] = [];

      const geezMetadata = this.customGeezTranslation[book] &&
        this.customGeezTranslation[book][this.currentChapter] &&
        this.customGeezTranslation[book][this.currentChapter][verse.verse.index]?.metadata?.[wordIndex] || '';

      if (this.isOldBookGuard(book)) {
        scriptureChapterMetadata = this.hebraicMetadata[book] && this.hebraicMetadata[book][this.currentChapter] || [];
        interlinearMetadata = this.interlinearGeezHebraic;
      } else if (this.isNewBookGuard(book)) {
        scriptureChapterMetadata = this.greekMetadata[book] && this.greekMetadata[book][this.currentChapter] || [];
        interlinearMetadata = this.interlinearGeezGreek;
      }

      const [geezWordIndex] = Array.from(geezMetadata.match(/^\d+/) || ['']);
      if (!geezWordIndex) {
        return '';
      }

      const scriptureWordOrigin = interlinearMetadata[this.currentBook][this.currentChapter][verse.verse.index][Number(geezWordIndex)]?.origin || null;
      if (!scriptureWordOrigin) {
        return '';
      }

      customTranslationMetadataKey = this.projectService.castSegmentIntoMetadataIndex(this.data, scriptureWordOrigin);
      verseMetadata = scriptureChapterMetadata && scriptureChapterMetadata[verse.verse.index];
    } else {
      throw new Error('language not found');
    }

    if (!verseMetadata || !customTranslationMetadataKey) {
      return '';
    }

    const metadata = verseMetadata.metadata || {};
    const data = metadata[customTranslationMetadataKey];
    if (!data) {
      return '';
    }

    return [data.kind, data.isWordOfGod ? 'godsaid' : ''].filter(t => t).map(d => `meta${d}`).join(' ');
  }

  getCustomTranslationInterlinearValue(
    customTranslation: SourceCodex<{ metadata?: string[] }>, verse: SourceVerse, wordIndex: number
  ): string {
    const chapter = this.customTranslation[this.current.book].chapters[this.current.chapter];
    if (chapter && chapter[verse.verse.index] && chapter[verse.verse.index].metadata) {
      const metadata = chapter[verse.verse.index].metadata;
      return metadata && metadata[wordIndex] || '';
    }

    return '';
  }

  saveCustomTranslationInterlinearMetadata(value: string, wordIndex: number): void {
    const metadata = this.createCustomTranslationStructureIfNotExists();
    metadata[wordIndex] = value;

    this.saveCustomTranslation();
  }

  cleanInterlinear(): void {
    if (
      !this.customTranslation[this.current.book] ||
      !this.customTranslation[this.current.book].chapters[this.current.chapter] ||
      !this.customTranslation[this.current.book].chapters[this.current.chapter][this.sourceVerse.verse.index]
    ) {
      return;
    }

    delete this.customTranslation[this.current.book].chapters[this.current.chapter][this.sourceVerse.verse.index].metadata;
    this.pipeUpdaterController++;
  }
}
