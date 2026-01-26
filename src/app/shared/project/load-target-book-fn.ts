import { BookInterlinearTarget } from '@domain/book-interlinear-target-model';
import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { KeyInterlinear } from '@domain/key-interlinear-type';
import { KeyMetadata } from '@domain/key-metadata-type';
import { KeyTranslation } from '@domain/key-translation-type';
import { Project } from '@domain/project-model';
import { readFileFn } from './read-file-fn';

export function loadTargetBookFn(project: Project, target: KeyMetadata, book: string): Promise<BookMetadataTarget | null>;
export function loadTargetBookFn(project: Project, target: KeyTranslation, book: string): Promise<BookTranslationTarget | null>;
export function loadTargetBookFn(project: Project, target: KeyInterlinear, book: string): Promise<BookInterlinearTarget | null>;
export function loadTargetBookFn(project: Project, target: KeyMetadata | KeyTranslation | KeyInterlinear, book: string): Promise<
  BookMetadataTarget | BookInterlinearTarget | BookTranslationTarget | null
>;
export async function loadTargetBookFn(project: Project, target: KeyMetadata | KeyTranslation | KeyInterlinear, book: string): Promise<
  BookMetadataTarget | BookInterlinearTarget | BookTranslationTarget | null
> {
  return readFileFn<BookMetadataTarget | BookInterlinearTarget | BookTranslationTarget>(
    `${project.path}/targets/${target}/${book}.json`
  );
}
