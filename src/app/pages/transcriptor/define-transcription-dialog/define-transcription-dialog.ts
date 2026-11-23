import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Subject } from 'rxjs';
import { ArtifactFragmentWordPosition } from '@domain/artifact-fragment-word-position-model';
import { ArtifactFragmentBookSchema } from '@domain/artifact-fragment-book-schema-model';
import { LanguageAlternativeSpelling } from '@domain/language-alternative-spelling-model';
import { addNestedPosition, rebasePositions, rebaseRanges, validNestedUpdate, validPosition } from '../transcription-positions';

interface BookDraft {
  book: string;
  chapter: number | null;
  verse: number | null;
  start: number | null;
  end: number | null;
}

interface TranscriptionResult {
  transcription: string;
  positions: ArtifactFragmentWordPosition[];
  bookSchema: ArtifactFragmentBookSchema[];
}

interface TranscriptionDialogData {
  title: string;
  transcription: string;
  positions: ArtifactFragmentWordPosition[];
  bookSchema?: ArtifactFragmentBookSchema[];
  books?: { [key: string]: { name: string } };
  spelling?: LanguageAlternativeSpelling;
  validatePositions?: (text: string, positions: ArtifactFragmentWordPosition[]) => string | null;
  deletePositions?: (text: string, positions: ArtifactFragmentWordPosition[], deleted: Set<number>) => ArtifactFragmentWordPosition[] | null;
}

@Component({
  selector: 'app-define-transcription-dialog',
  imports: [
    FormsModule
  ],
  templateUrl: './define-transcription-dialog.html',
  styleUrl: './define-transcription-dialog.scss',
})
export class DefineTranscriptionDialog extends ModalableDirective<TranscriptionDialogData, TranscriptionResult> {

  @ViewChild('source') source?: ElementRef<HTMLTextAreaElement>;
  transcription = '';
  pendingText = '';
  positions: ArtifactFragmentWordPosition[] = [];
  bookSchema: ArtifactFragmentBookSchema[] = [];
  books: { key: string; name: string }[] = [];
  activeTab: 'transcription' | 'positioning' | 'book' = 'transcription';
  selectedRange: { start: number; end: number } | null = null;
  bookDraft: BookDraft = this.newBookDraft();
  selectedBookIndex: number | null = null;
  bookError = '';
  selectedIndex: number | null = null;
  draft: ArtifactFragmentWordPosition = this.newDraft();
  error = '';
  spelling?: LanguageAlternativeSpelling;
  checked = new Set<number>();
  pendingDeletion: number[] = [];
  private validatePositions?: (text: string, positions: ArtifactFragmentWordPosition[]) => string | null;
  private deletePositions?: TranscriptionDialogData['deletePositions'];
  override response = new Subject<TranscriptionResult | void>();

  override onInjectData(data: TranscriptionDialogData): void {
    this.transcription = data.transcription;
    this.pendingText = data.transcription;
    this.positions = (data.positions ?? []).map(position => ({ ...position }));
    this.bookSchema = (data.bookSchema ?? []).map(entry => ({ ...entry }));
    this.books = Object.entries(data.books ?? {}).map(([key, book]) => ({ key, name: book.name }));
    this.validatePositions = data.validatePositions;
    this.spelling = data.spelling;
    this.deletePositions = data.deletePositions;
  }

  syncText(): boolean {
    if (this.pendingText === this.transcription) return true;
    const result = rebasePositions(this.transcription, this.pendingText, this.positions);
    const bookResult = rebaseRanges(this.transcription, this.pendingText, this.bookSchema);
    if ((result.affected.length || bookResult.affected.length) &&
      !confirm('This change affects positioning edits or book associations. Discard the affected entries and nested edits?')) {
      this.pendingText = this.transcription;
      return false;
    }
    this.positions = result.positions;
    this.bookSchema = bookResult.ranges;
    this.transcription = this.pendingText;
    this.checked.clear();
    this.pendingDeletion = [];
    this.selectedRange = null;
    this.newEdit();
    this.newBookEdit();
    return true;
  }

  selectRange(input: HTMLTextAreaElement): void {
    if (this.pendingDeletion.length) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    if (start === end || !this.syncText()) {
      this.selectedRange = null;
      return;
    }
    this.selectedRange = { start, end };
  }

  onTextInput(): void {
    this.selectedRange = null;
    if (!this.pendingText.trim()) this.activeTab = 'transcription';
  }

  useSelection(tab: 'positioning' | 'book'): void {
    const range = this.selectedRange;
    if (!range || !this.syncText()) return;
    if (tab === 'book') {
      this.newBookEdit();
      this.bookDraft.start = range.start;
      this.bookDraft.end = range.end;
    } else {
      this.newEdit();
      this.draft.start = range.start;
      this.draft.length = range.end - range.start;
    }
    this.activeTab = tab;
  }

  newBookEdit(): void {
    this.selectedBookIndex = null;
    this.bookDraft = this.newBookDraft();
    this.bookError = '';
  }

  selectBookEdit(index: number): void {
    const mapped = this.rebasedBookIndex(index);
    if (!this.syncText()) return;
    if (mapped < 0) return;
    const entry = this.bookSchema[mapped];
    if (!entry) return;
    this.selectedBookIndex = mapped;
    this.bookDraft = { book: entry.book, chapter: entry.chapter, verse: entry.verse,
      start: entry.start, end: entry.start + entry.length };
    this.bookError = '';
  }

  applyBookEdit(): void {
    if (!this.syncText()) return;
    const { book, start, end, chapter, verse } = this.bookDraft;
    if (!/^[a-zA-Z0-9]{3}$/.test(book) || start === null || end === null ||
      !Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end <= start || end > this.transcription.length ||
      chapter === null || verse === null || !Number.isSafeInteger(chapter) || !Number.isSafeInteger(verse) ||
      chapter < 0 || verse < 0) {
      this.bookError = 'Enter a three-character book key, a valid text range, and non-negative whole chapter and verse numbers.';
      return;
    }
    const entry: ArtifactFragmentBookSchema = { book, chapter, verse, start, length: end - start };
    if (this.selectedBookIndex === null) {
      this.bookSchema = [...this.bookSchema, entry];
      this.selectedBookIndex = this.bookSchema.length - 1;
    } else {
      this.bookSchema = this.bookSchema.map((item, index) => index === this.selectedBookIndex ? entry : item);
    }
    this.bookError = '';
  }

  deleteBookEdit(index: number): void {
    const mapped = this.rebasedBookIndex(index);
    if (!this.syncText()) return;
    if (mapped < 0) return;
    const entry = this.bookSchema[mapped];
    if (!entry || !confirm(`Delete the association ${entry.book} ${entry.chapter}:${entry.verse}?`)) return;
    this.bookSchema = this.bookSchema.filter((_, itemIndex) => itemIndex !== mapped);
    this.newBookEdit();
  }

  private rebasedBookIndex(index: number): number {
    if (this.pendingText === this.transcription) return index;
    const affected = rebaseRanges(this.transcription, this.pendingText, this.bookSchema).affected;
    return this.bookSchema.map((entry, itemIndex) => ({ entry, itemIndex }))
      .filter(({ entry }) => !affected.includes(entry)).findIndex(({ itemIndex }) => itemIndex === index);
  }

  newEdit(): void {
    this.selectedIndex = null;
    this.draft = this.newDraft();
    this.error = '';
  }

  selectEdit(index: number): void {
    if (!this.syncText()) return;
    if (!this.positions[index]) {
      this.newEdit();
      return;
    }
    this.selectedIndex = index;
    this.draft = { ...this.positions[index] };
    this.error = '';
  }

  editText(index: number): string {
    const position = this.positions[index];
    const text = this.transcription.slice(position.start, position.start + position.length);
    return this.spelling?.parse ? this.spelling.parse(text) : text;
  }

  editExcerpt(index: number): string {
    let excerpt = '';
    let count = 0;
    for (const character of this.editText(index)) {
      if (count++ === 60) return excerpt + '…';
      excerpt += character;
    }
    return excerpt;
  }

  toggleChecked(index: number, checked: boolean): void {
    if (checked) this.checked.add(index);
    else this.checked.delete(index);
  }

  requestDelete(indices: number[]): void {
    const rebased = this.pendingText === this.transcription ? null :
      rebasePositions(this.transcription, this.pendingText, this.positions);
    const survivingIndices = rebased ? this.positions.map((position, index) => ({ position, index }))
      .filter(({ position }) => !rebased.affected.includes(position)).map(({ index }) => index) : null;
    if (!this.syncText()) return;
    this.pendingDeletion = (survivingIndices ? indices.map(index => survivingIndices.indexOf(index)) : indices)
      .filter(index => index >= 0 && !!this.positions[index]);
    if (this.pendingDeletion.length) {
      const index = this.pendingDeletion[0];
      this.selectEdit(index);
      const position = this.positions[index];
      this.source?.nativeElement.setSelectionRange(position.start, position.start + position.length);
    }
  }

  requestBulkDelete(all: boolean): void {
    this.requestDelete(all ? this.positions.map((_, index) => index) : [...this.checked].sort((a, b) => a - b));
  }

  cancelDelete(): void {
    this.pendingDeletion = [];
  }

  confirmDelete(): void {
    if (!this.pendingDeletion.length) return;
    const deleted = new Set(this.pendingDeletion);
    const needsPromotion = this.positions.some((position, index) => !deleted.has(index) &&
      position.parentId && this.positions.some((parent, parentIndex) => deleted.has(parentIndex) && parent.id === position.parentId));
    const result = needsPromotion
      ? this.deletePositions?.(this.transcription, this.positions, deleted)
      : this.positions.filter((_, index) => !deleted.has(index));
    if (!result) {
      this.error = 'Unable to preserve nested edits. Wait for the text to render and try again.';
      return;
    }
    this.positions = result;
    this.checked.clear();
    this.pendingDeletion = [];
    this.newEdit();
  }

  applyEdit(): void {
    if (!this.syncText()) return;
    if (!validPosition(this.draft, this.transcription)) {
      this.error = 'Enter a valid text range, position, rotation, and font size.';
      return;
    }
    if (this.selectedIndex === null) {
      const result = addNestedPosition(this.draft, this.positions);
      if (!result) {
        this.error = 'Ranges must be disjoint or completely inside an existing edit.';
        return;
      }
      this.positions = result.positions;
      this.selectedIndex = result.index;
    } else {
      if (!validNestedUpdate(this.draft, this.positions, this.selectedIndex)) {
        this.error = 'The range must stay inside its parent and cannot overlap a sibling or exclude a nested edit.';
        return;
      }
      this.positions = this.positions.map((position, index) =>
        index === this.selectedIndex ? { ...this.draft } : position);
    }
    this.error = '';
  }

  save(): void {
    if (!this.syncText()) return;
    const error = this.validatePositions?.(this.transcription, this.positions);
    if (error) {
      this.error = error;
      return;
    }
    this.response.next({ transcription: this.transcription, positions: this.positions.map(position => ({ ...position })),
      bookSchema: this.bookSchema.map(entry => ({ ...entry })) });
    this.close();
  }

  private newDraft(): ArtifactFragmentWordPosition {
    return { start: 0, length: 1, x: 0, y: 0, flip: 0, fontSize: 16, letterSpacing: 0 };
  }

  private newBookDraft(): BookDraft {
    return { book: '', chapter: null, verse: null, start: 0, end: 1 };
  }
}
