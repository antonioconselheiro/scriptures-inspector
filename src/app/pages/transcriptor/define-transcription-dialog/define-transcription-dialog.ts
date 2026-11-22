import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Subject } from 'rxjs';
import { ArtifactFragmentWordPosition } from '@domain/artifact-fragment-word-position-model';
import { addNestedPosition, rebasePositions, validNestedUpdate, validPosition } from '../transcription-positions';

@Component({
  selector: 'app-define-transcription-dialog',
  imports: [
    FormsModule
  ],
  templateUrl: './define-transcription-dialog.html',
  styleUrl: './define-transcription-dialog.scss',
})
export class DefineTranscriptionDialog extends ModalableDirective<{
  title: string;
  transcription: string;
  positions: ArtifactFragmentWordPosition[];
  validatePositions?: (text: string, positions: ArtifactFragmentWordPosition[]) => string | null;
}, { transcription: string; positions: ArtifactFragmentWordPosition[] }> {

  transcription = '';
  pendingText = '';
  positions: ArtifactFragmentWordPosition[] = [];
  selectedIndex: number | null = null;
  draft: ArtifactFragmentWordPosition = this.newDraft();
  error = '';
  private validatePositions?: (text: string, positions: ArtifactFragmentWordPosition[]) => string | null;
  override response = new Subject<{ transcription: string; positions: ArtifactFragmentWordPosition[] } | void>();

  override onInjectData(data: { title: string; transcription: string; positions: ArtifactFragmentWordPosition[]; validatePositions?: (text: string, positions: ArtifactFragmentWordPosition[]) => string | null }): void {
    this.transcription = data.transcription;
    this.pendingText = data.transcription;
    this.positions = (data.positions ?? []).map(position => ({ ...position }));
    this.validatePositions = data.validatePositions;
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
    this.newEdit();
    return true;
  }

  selectRange(input: HTMLTextAreaElement): void {
    if (input.selectionStart === input.selectionEnd || !this.syncText()) return;
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
      this.positions[this.selectedIndex] = { ...this.draft };
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
