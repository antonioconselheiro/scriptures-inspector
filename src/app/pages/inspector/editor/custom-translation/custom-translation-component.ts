import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodexBookChapterVerseMetadata } from '@domain/codex-book-chapter-verse-metadata-model';
import { CodexBookVerse } from '@domain/codex-book-verse-model';
import { Codex } from '@domain/codex-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { CustomTranslation } from '@domain/custom-translation-model';
import { CustomTranslationVerse } from '@domain/custom-translation-verse-model';
import { Language } from '@domain/language-model';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { ProjectData } from '@domain/project-data-model';
import { SourceBook } from '@domain/source-book-model';
import { SourceVerse } from '@domain/source-verse-model';
import { TranslationInterlinear } from '@domain/translation-interlinear-model';
import { TranslationInterlinearVerse } from '@domain/translation-interlinear-verse-model';
import { ProjectCustomTranslationService } from '@shared/project/project-custom-translation-service';
import { ProjectMetadataService } from '@shared/project/project-metadata-service';
import { ProjectService } from '@shared/project/project-service';
import { LiteralsPatternsService } from '../../literals-patterns-service';
import { AbstractInspectorDiretive } from '../abstract-inspector-directive';

@Component({
  selector: 'app-custom-translation-component',
  imports: [
    FormsModule
  ],
  templateUrl: './custom-translation-component.html',
  styleUrl: './custom-translation-component.scss'
})
export class CustomTranslationComponent extends AbstractInspectorDiretive {

  @Input()
  data!: ProjectData;

  //  se está propriedade for inclusa, então é considerada uma tradução de uma tradução,
  // se não a tradução considera apenas o escrito original na propriedade 'data'
  @Input()
  translation?: TranslationInterlinear;

  @Input()
  current!: CurrentChapter;

  @Input()
  sourceBook!: SourceBook;

  @Input()
  sourceLang!: Language;

  @Input()
  target!: Language;

  @Input()
  parsedBook!: ParsedBookMetadata;

  @Input()
  sourceVerse!: SourceVerse;

  customTranslation: CustomTranslation = {};

  pipeUpdaterController = 0;

  constructor(
    private projectService: ProjectService,
    protected projectMetadataService: ProjectMetadataService,
    protected literalsPatternsService: LiteralsPatternsService,
    private projectCustomTranslationService: ProjectCustomTranslationService
  ) {
    super();
  }

  splitTextBySpacesAndPunctuation(value: string, pipeUpdaterController: number): string[] {
    pipeUpdaterController;
    return [...value.matchAll(/(\s*)(\S+?)(\.{3}|…|[.!?]+)?(?=\s|$)/g)]
      .flatMap(m => m[3] ? [`${m[1]}${m[2]}`, m[3]] : [`${m[1]}${m[2]}`])
      .map(m => m.trim());
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

  private derivateInterlinearToCustom(verse: SourceVerse): void {
    const metadata = this.createCustomTranslationStructureIfNotExists();
    metadata.splice(0, metadata.length);
    const custom = this.customTranslation[this.current.book].chapters[this.current.chapter][this.sourceVerse.verse.index].text.split(' ');
    this.splitIntoMatrix(verse.text).flat().forEach(segment => {
      if (custom[segment.index] === this.getLexical(segment.word)) {
        metadata.push(this.projectService.castSegmentIntoMetadataIndex(this.data, segment));
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
    let verseMetadata: CodexBookVerse<CodexBookChapterVerseMetadata> | null, customTranslationMetadataKey = '';

    if (this.translation) {
      let interlinearMetadata: Codex<object, Array<TranslationInterlinearVerse>> = {};
      let scriptureChapterMetadata: CodexBookVerse<CodexBookChapterVerseMetadata>[] = [];

      const translationMetadata = this.customTranslation[this.current.book] &&
        this.customTranslation[this.current.book].chapters[this.current.chapter] &&
        this.customTranslation[this.current.book].chapters[this.current.chapter][this.sourceVerse.verse.index]?.metadata?.[wordIndex] || '';

        scriptureChapterMetadata = this.data.metadata[this.current.book] && this.data.metadata[this.current.book].chapters[this.current.chapter] || [];
        interlinearMetadata = this.translation.codex;

      const [translationWordIndex] = Array.from(translationMetadata.match(/^\d+/) || ['']);
      if (!translationWordIndex) {
        return '';
      }

      const scriptureSegmentOrigin = interlinearMetadata[this.current.book].chapters[this.current.chapter][this.sourceVerse.verse.index][Number(translationWordIndex)]?.origin || null;
      if (!scriptureSegmentOrigin) {
        return '';
      }

      customTranslationMetadataKey = this.projectService.castSegmentIntoMetadataIndex(this.data, scriptureSegmentOrigin);
      verseMetadata = scriptureChapterMetadata && scriptureChapterMetadata[this.sourceVerse.verse.index];
    } else {
      const scriptureChapterMetadata = this.data.metadata[this.current.book] && this.data.metadata[this.current.book].chapters[this.current.chapter] || [];
      verseMetadata = scriptureChapterMetadata[this.sourceVerse.verse.index] || null;
      const translationChapterMetadata = this.customTranslation[this.current.book].chapters[this.current.chapter] || [];
      customTranslationMetadataKey = ((translationChapterMetadata[this.sourceVerse.verse.index]?.metadata || [])?.[wordIndex] || '');
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

  getCustomTranslationInterlinearValue(wordIndex: number): string {
    const chapter = this.customTranslation[this.current.book].chapters[this.current.chapter];
    if (chapter && chapter[this.sourceVerse.verse.index] && chapter[this.sourceVerse.verse.index].metadata) {
      const metadata = chapter[this.sourceVerse.verse.index].metadata;
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
