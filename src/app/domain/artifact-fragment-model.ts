import { ArtifactFragmentBookSchema } from './artifact-fragment-book-schema-model';
import { ArtifactFragmentWordPosition } from './artifact-fragment-word-position-model';
import { LanguageUnionType } from './language-union-type';

export interface ArtifactFragment {
  vector: string;
  transcription: string;
  language: LanguageUnionType;
  spelling: string;
  positions: Array<ArtifactFragmentWordPosition>
  bookSchema: Array<ArtifactFragmentBookSchema>;
}
