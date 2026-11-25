import { Injectable, signal, WritableSignal } from '@angular/core';
import { BookMetadataAttributes } from '@domain/book-metadata-attributes-model';

@Injectable({ providedIn: 'root' })
export class SegmentationChanges {
  private readonly lexicalRevisions = new WeakMap<BookMetadataAttributes['lexical'], WritableSignal<number>>();
  private readonly patternsVersion = signal(0);
  readonly patternsRevision = this.patternsVersion.asReadonly();

  lexicalRevision(lexical: BookMetadataAttributes['lexical']): number {
    return this.getLexicalRevision(lexical)();
  }

  lexicalChanged(lexical: BookMetadataAttributes['lexical']): void {
    this.getLexicalRevision(lexical).update(revision => revision + 1);
  }

  patternsChanged(): void {
    this.patternsVersion.update(revision => revision + 1);
  }

  private getLexicalRevision(lexical: BookMetadataAttributes['lexical']): WritableSignal<number> {
    let revision = this.lexicalRevisions.get(lexical);
    if (!revision) {
      revision = signal(0);
      this.lexicalRevisions.set(lexical, revision);
    }
    return revision;
  }
}
