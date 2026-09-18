import { ArtifactFragmentBookSchema } from './artifact-fragment-book-schema-model';
import { ArtifactFragmentWordPosition } from './artifact-fragment-word-position-model';
import { LanguageUnionType } from './language-union-type';

export interface ArtifactFragment {
  language: LanguageUnionType;
  spelling: string;
  vector: string;
  transcription: string;
  positions: Array<ArtifactFragmentWordPosition>
  bookSchema: Array<ArtifactFragmentBookSchema>;
}
