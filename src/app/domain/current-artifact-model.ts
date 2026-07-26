import { CurrentCollection } from './current-collection-model';

export interface CurrentArtifact extends CurrentCollection {
  artifact: number;
}