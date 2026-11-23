import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Subject } from 'rxjs';
import { ArtifactFragmentWordPosition } from '@domain/artifact-fragment-word-position-model';
import { LanguageAlternativeSpelling } from '@domain/language-alternative-spelling-model';
import { addNestedPosition, rebasePositions, validNestedUpdate, validPosition } from '../transcription-positions';

interface TranscriptionDialogData {
  title: string;
  transcription: string;
  positions: ArtifactFragmentWordPosition[];
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
export class DefineTranscriptionDialog extends ModalableDirective<TranscriptionDialogData, { transcription: string; positions: ArtifactFragmentWordPosition[] }> {

  @ViewChild('source') source?: ElementRef<HTMLTextAreaElement>;
  transcription = '';
  pendingText = '';
  positions: ArtifactFragmentWordPosition[] = [];
  selectedIndex: number | null = null;
  draft: ArtifactFragmentWordPosition = this.newDraft();
  error = '';
  spelling?: LanguageAlternativeSpelling;
  checked = new Set<number>();
  pendingDeletion: number[] = [];
  private validatePositions?: (text: string, positions: ArtifactFragmentWordPosition[]) => string | null;
  private deletePositions?: TranscriptionDialogData['deletePositions'];
  override response = new Subject<{ transcription: string; positions: ArtifactFragmentWordPosition[] } | void>();

  override onInjectData(data: TranscriptionDialogData): void {
    this.transcription = data.transcription;
    this.pendingText = data.transcription;
    this.positions = (data.positions ?? []).map(position => ({ ...position }));
    this.validatePositions = data.validatePositions;
    this.spelling = data.spelling;
    this.deletePositions = data.deletePositions;
  }

  syncText(): boolean {
    if (this.pendingText === this.transcription) return true;
    const result = rebasePositions(this.transcription, this.pendingText, this.positions);
    if (result.affected.length && !confirm('This change affects positioned text. Discard the affected edits and their nested edits?')) {
      this.pendingText = this.transcription;
      return false;
    }
    this.positions = result.positions;
    this.transcription = this.pendingText;
    this.checked.clear();
    this.pendingDeletion = [];
    this.newEdit();
    return true;
  }

  selectRange(input: HTMLTextAreaElement): void {
    if (this.pendingDeletion.length || input.selectionStart === input.selectionEnd || !this.syncText()) return;
    this.newEdit();
    this.draft.start = input.selectionStart;
    this.draft.length = input.selectionEnd - input.selectionStart;
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
      this.source?.nativeElement.focus();
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
    this.response.next({ transcription: this.transcription, positions: this.positions.map(position => ({ ...position })) });
    this.close();
  }

  private newDraft(): ArtifactFragmentWordPosition {
    return { start: 0, length: 1, x: 0, y: 0, flip: 0, fontSize: 16, letterSpacing: 0 };
  }
}
