import { Codex } from '@domain/codex-model';
import { KeyInterlinear } from '@domain/key-interlinear-type';
import { KeyMetadata } from '@domain/key-metadata-type';
import { KeyTranslation } from '@domain/key-translation-type';
import { ProjectStructureMetadata } from '@domain/project-structure-metadata-model';

export type BookTarget = KeyMetadata | KeyInterlinear | KeyTranslation;
export type BookTargetKind = 'metadata' | 'interlinear' | 'translation';

export interface BookTargetAssociation {
  target: BookTarget;
  sources: string[];
}

export function getBookTargetAssociationsFn(
  structures: ProjectStructureMetadata[], kind: BookTargetKind
): BookTargetAssociation[] {
  const associations: BookTargetAssociation[] = [];
  const visit = (items: ProjectStructureMetadata[]): void => {
    for (const item of items) {
      if (kind === 'metadata') {
        associations.push({ target: item.metadataTarget, sources: [item.source] });
      } else if (kind === 'translation' && item.customTranslationTarget) {
        associations.push({ target: item.customTranslationTarget, sources: [item.source] });
      }
      for (const child of item.interlinear ?? []) {
        if (kind === 'interlinear') {
          associations.push({ target: child.interlinearTarget, sources: [item.source, child.source] });
        }
      }
      visit(item.interlinear ?? []);
    }
  };
  visit(structures);
  return associations;
}

export function getBookTargetsFn(
  associations: BookTargetAssociation[], codices: Record<string, Codex | undefined>, book: string
): BookTarget[] {
  for (const source of new Set(associations.flatMap(association => association.sources))) {
    if (!codices[source]?.books) {
      throw new Error(`Missing book configuration for source "${source}"`);
    }
  }
  return [...new Set(associations
    .filter(association => association.sources.every(source => Object.hasOwn(codices[source]!.books!, book)))
    .map(association => association.target))];
}
