import { ArtifactFragmentWordPosition } from '@domain/artifact-fragment-word-position-model';

export interface ArtifactFragmentView extends ArtifactFragmentWordPosition {
  text: string;
  index: number;
}
