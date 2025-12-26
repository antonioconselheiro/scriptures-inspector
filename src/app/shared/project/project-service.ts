import { Injectable } from '@angular/core';
import { CurrentVerseIndex } from '@domain/current-verse-index-model';
import { Language } from '@domain/language-model';
import { ProjectData } from '@domain/project-data-model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  project!: ProjectData;

  getScriptureMetadataWordOfGod(
    current: CurrentVerseIndex,
    segments: Array<{ index: number; word: string; }>
  ): boolean {
    if (
      !this.project.metadata[current.book] ||
      !this.project.metadata[current.book].chapters ||
      !this.project.metadata[current.book].chapters[current.chapter] ||
      !this.project.metadata[current.book].chapters[current.chapter][current.verseIndex]
    ) {
      return false;
    }

    const metadata = this.project.metadata[current.book].chapters[current.chapter][current.verseIndex].metadata;
    if (!metadata || !segments[0]) {
      return false;
    }

    const segment = this.castSegmentIntoMetadataIndex(segments[0]);
    const data = metadata[segment];
    if (!data) {
      return false;
    }

    return data.isWordOfGod || false;
  }

  castSegmentIntoMetadataIndex(segment: { index: number; word: string; }, lang: Language): string {
    const word = lang.normalizeFn && lang.normalizeFn(segment.word) || segment.word;
    return `${segment.index}-${word}`;
  }
}
