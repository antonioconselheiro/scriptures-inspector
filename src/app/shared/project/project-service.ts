import { Injectable } from '@angular/core';
import { ProjectData } from '@domain/project-data-model';
import { WordSegment } from '@domain/word-segment-model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  castSegmentIntoMetadataIndex(
    data: ProjectData,
    segment: WordSegment
  ): string {
    const word = data.lang.source.normalizeFn && data.lang.source.normalizeFn(segment.word) || segment.word;
    return `${segment.index}-${word}`;
  }
}
