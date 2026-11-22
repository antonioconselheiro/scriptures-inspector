import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMoveableComponent, NgxMoveableModule } from 'ngx-moveable';
import { ArtifactFragmentWordPosition } from '@domain/artifact-fragment-word-position-model';
import { Language } from '@domain/language-model';
import { LanguageAlternativeSpelling } from '@domain/language-alternative-spelling-model';
import { addNestedPosition, validNestedUpdate, validPosition } from '../transcription-positions';
import { v4 as uuid } from 'uuid';

interface TextSegment {
  start: number;
  text: string;
  hidden: boolean;
}

@Component({
  selector: 'app-artifact-text-editor-component',
  standalone: true,
  imports: [FormsModule, NgxMoveableModule, NgTemplateOutlet],
  templateUrl: './artifact-text-editor-component.html',
  styleUrl: './artifact-text-editor-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtifactTextEditorComponent implements OnChanges, OnDestroy {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLElement>;
  @ViewChild(NgxMoveableComponent) moveable?: NgxMoveableComponent;

  @Input({ required: true }) text = '';
  @Input() fragments: ArtifactFragmentWordPosition[] = [];
  @Input() language?: Language;
  @Input() spelling?: LanguageAlternativeSpelling;
  @Input() boundsElement?: HTMLElement;
  @Input() preserveSelectionOnChange = false;
  @Output() fragmentsChange = new EventEmitter<ArtifactFragmentWordPosition[]>();
  @Output() selectionChange = new EventEmitter<number | null>();

  selectedIndex: number | null = null;
  selectedElement: HTMLElement | null = null;
  draft: ArtifactFragmentWordPosition = this.emptyDraft();
  error = '';
  deleteIndex: number | null = null;
  checked = new Set<number>();
  pendingDeletion: number[] = [];
  selectingPart = false;
  boundsHeight = 300;
  readonly rotationPositions: ('top' | 'bottom' | 'left' | 'right')[] = ['top', 'bottom', 'left', 'right'];
  private selectionFrame: number | null = null;
  private controlsFrame: number | null = null;
  private needsControlResize = false;
  private boundsObserver?: ResizeObserver;

  constructor(private cdr: ChangeDetectorRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Node) || this.deleteIndex !== null || this.pendingDeletion.length) return;
    if (this.canvas.nativeElement.contains(target)) {
      if (this.selectionFrame === null && target instanceof Element &&
        !target.closest('.artifact-fragment, .floating-toolbar, ngx-moveable')) this.newEdit();
      return;
    }
    if (target instanceof Element && target.closest('.edit-panel button, .edit-panel input, .delete-confirmation, .position-fields')) return;
    this.newEdit();
    this.cdr.markForCheck();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['boundsElement']) {
      this.boundsObserver?.disconnect();
      if (this.boundsElement) {
        this.boundsHeight = this.boundsElement.getBoundingClientRect().height;
        this.boundsObserver = new ResizeObserver(() => {
          if (!this.boundsElement) return;
          this.boundsHeight = this.boundsElement.getBoundingClientRect().height;
          this.cdr.markForCheck();
        });
        this.boundsObserver.observe(this.boundsElement);
      }
    }
    if (changes['text'] && !changes['text'].firstChange) this.newEdit(false);
    const change = changes['fragments'];
    if (change && !change.firstChange && change.currentValue !== change.previousValue &&
      change.currentValue !== this.lastEmitted) {
      if (this.preserveSelectionOnChange && this.selectedIndex !== null && this.fragments[this.selectedIndex]) {
        this.draft = { ...this.fragments[this.selectedIndex] };
        this.refreshControls(true);
      } else {
        this.newEdit(false);
      }
      this.checked.clear();
    }
  }

  private lastEmitted: ArtifactFragmentWordPosition[] | null = null;

  ngOnDestroy(): void {
    if (this.selectionFrame !== null) cancelAnimationFrame(this.selectionFrame);
    if (this.controlsFrame !== null) cancelAnimationFrame(this.controlsFrame);
    this.boundsObserver?.disconnect();
  }

  get direction(): 'ltr' | 'rtl' {
    return this.language?.direction ?? 'ltr';
  }

  displayText(text: string): string {
    return this.spelling?.parse ? this.spelling.parse(text) : text;
  }

  get segments(): TextSegment[] {
    return this.segmentsFor(null);
  }

  children(parentId?: string): number[] {
    return this.fragments.map((item, index) => ({ item, index }))
      .filter(({ item }) => item.parentId === parentId).map(({ index }) => index);
  }

  segmentsFor(index: number | null): TextSegment[] {
    const segments: TextSegment[] = [];
    const parent = index === null ? null : this.fragments[index];
    let cursor = parent?.start ?? 0;
    const end = parent ? parent.start + parent.length : this.text.length;
    const ordered = (parent && !parent.id ? [] : this.children(parent?.id))
      .map(i => this.fragments[i]).sort((a, b) => a.start - b.start);
    for (const fragment of ordered) {
      if (fragment.start < cursor || fragment.length <= 0 || fragment.start + fragment.length > end) {
        continue;
      }
      if (fragment.start > cursor) {
        segments.push({ start: cursor, text: this.text.slice(cursor, fragment.start), hidden: false });
      }
      segments.push({ start: fragment.start, text: this.text.slice(fragment.start, fragment.start + fragment.length), hidden: true });
      cursor = fragment.start + fragment.length;
    }
    if (cursor < end) {
      segments.push({ start: cursor, text: this.text.slice(cursor, end), hidden: false });
    }
    return segments;
  }

  generateEdits(mode: 'text' | 'lines'): void {
    const ranges: { start: number; length: number }[] = [];
    if (mode === 'text' && this.text.length) {
      ranges.push({ start: 0, length: this.text.length });
    } else if (mode === 'lines') {
      const linePattern = /[^\r\n]+/g;
      for (const match of this.text.matchAll(linePattern)) {
        ranges.push({ start: match.index, length: match[0].length });
      }
    }
    if (!ranges.length) {
      this.error = 'There is no text to turn into an edit.';
      return;
    }
    if (this.boundsElement) {
      const bounds = this.boundsElement.getBoundingClientRect();
      if (!bounds.width || !bounds.height) {
        this.error = 'The image or SVG must be loaded before positioning text.';
        return;
      }
    }

    const original = this.fragments;
    const originalSelected = this.selectedIndex;
    const originalElement = this.selectedElement;
    const next = original.map(position => ({ ...position }));
    let added = 0;
    let failure = '';
    try {
      for (const range of ranges) {
        const end = range.start + range.length;
        if (next.some(item => item.start === range.start && item.length === range.length)) continue;
        const overlaps = next.filter(item => range.start < item.start + item.length && item.start < end);
        if (overlaps.some(item =>
          !(item.start <= range.start && item.start + item.length >= end) &&
          !(range.start <= item.start && end >= item.start + item.length))) {
          failure = 'An existing edit crosses a line boundary. Adjust that edit before generating line edits.';
          break;
        }
        const containing = overlaps.filter(item => item.start <= range.start && item.start + item.length >= end)
          .sort((a, b) => a.length - b.length)[0];
        const parentIndex = containing ? next.indexOf(containing) : null;
        const parent = parentIndex === null ? this.canvas.nativeElement :
          this.canvas.nativeElement.querySelector<HTMLElement>(`[data-fragment-index="${parentIndex}"]`);
        if (!parent) {
          failure = 'Unable to measure the existing edit. Try again after the text is rendered.';
          break;
        }
        const anchor = this.sourceRange(parentIndex, range.start, range.start + 1);
        const complete = this.sourceRange(parentIndex, range.start, end);
        if (!anchor || !complete) {
          failure = 'Unable to measure the text for the new edits.';
          break;
        }
        const position = this.rangePosition(anchor, parent);
        const visualLines = this.unrotated(parent, () =>
          new Set(Array.from(complete.getClientRects(), rect => Math.round(rect.top * 10))).size);
        const logicalLines = this.text.slice(range.start, end).split(/\r\n|\r|\n/).length;
        const parentId = containing ? (containing.id ??= uuid()) : undefined;
        const childIndices = next.map((item, index) => ({ item, index }))
          .filter(({ item }) => item.parentId === parentId && item.start >= range.start && item.start + item.length <= end)
          .map(({ index }) => index);
        const created: ArtifactFragmentWordPosition = {
          ...range, id: uuid(), parentId, x: position.x, y: position.y, flip: 0,
          alignLeft: parentIndex === null || getComputedStyle(parent).textAlign === 'left'
        };
        if (visualLines > logicalLines) created.width = parent.clientWidth;
        for (const index of childIndices) {
          next[index] = { ...next[index], parentId: created.id, x: next[index].x - created.x, y: next[index].y - created.y };
        }
        next.push(created);
        this.fragments = next;
        this.cdr.detectChanges();

        const newIndex = next.length - 1;
        const newParent = parentIndex === null ? this.canvas.nativeElement :
          this.canvas.nativeElement.querySelector<HTMLElement>(`[data-fragment-index="${parentIndex}"]`);
        const newAnchor = this.sourceRange(newIndex, range.start, range.start + 1);
        if (!newParent || !newAnchor) {
          failure = 'Unable to measure the generated edit.';
          break;
        }
        const after = this.rangePosition(newAnchor, newParent);
        const dx = position.x - after.x;
        const dy = position.y - after.y;
        created.x += dx;
        created.y += dy;
        for (const index of childIndices) {
          next[index].x -= dx;
          next[index].y -= dy;
        }
        this.cdr.detectChanges();
        added++;
      }
      if (!failure && added) failure = this.validatePositions(this.text, next) ?? '';
    } finally {
      this.fragments = original;
      this.cdr.detectChanges();
      this.selectedElement = originalSelected !== null && originalElement
        ? this.canvas.nativeElement.querySelector<HTMLElement>(`[data-fragment-index="${originalSelected}"]`)
        : null;
    }
    if (failure) {
      this.error = failure;
      return;
    }
    if (!added) {
      this.error = 'These edits already exist.';
      return;
    }
    this.newEdit();
    this.emitFragments(next);
  }

  private sourceRange(parentIndex: number | null, start: number, end: number): Range | null {
    const parent = parentIndex === null
      ? this.canvas.nativeElement.querySelector<HTMLElement>('.baseline')
      : this.canvas.nativeElement.querySelector<HTMLElement>(`[data-fragment-index="${parentIndex}"]`);
    if (!parent) return null;
    const segments = this.segmentsFor(parentIndex);
    const endpoint = (offset: number, isEnd: boolean): { node: Text; offset: number } | null => {
      const segment = segments.find(item => isEnd
        ? offset > item.start && offset <= item.start + item.text.length
        : offset >= item.start && offset < item.start + item.text.length);
      if (!segment) return null;
      const span = Array.from(parent.children).find(element =>
        element instanceof HTMLElement && element.dataset['segmentStart'] === String(segment.start));
      const node = span?.firstChild;
      if (!(node instanceof Text)) return null;
      const displayedOffset = this.displayText(segment.text.slice(0, offset - segment.start)).length;
      return displayedOffset <= node.length ? { node, offset: displayedOffset } : null;
    };
    const first = endpoint(start, false);
    const last = endpoint(end, true);
    if (!first || !last) return null;
    const range = document.createRange();
    range.setStart(first.node, first.offset);
    range.setEnd(last.node, last.offset);
    return range;
  }

  selectCanvasText(): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    const start = this.sourceOffset(range.startContainer, range.startOffset);
    const end = this.sourceOffset(range.endContainer, range.endOffset);
    if (start === null || end === null || end <= start) {
      this.error = 'Select complete characters in the transcription, or use Edit Transcription.';
      return;
    }
    const startParent = this.segmentParent(range.startContainer);
    const endParent = this.segmentParent(range.endContainer);
    if (startParent !== endParent) {
      this.error = 'Select text within a single existing edit.';
      return;
    }
    const parent = startParent === null ? this.canvas.nativeElement :
      this.canvas.nativeElement.querySelector<HTMLElement>(`[data-fragment-index="${startParent}"]`);
    if (!parent) return;
    const geometry = this.rangePosition(range, parent);
    const parentPosition = startParent === null ? undefined : this.fragments[startParent];
    this.selectedIndex = null;
    this.selectedElement = null;
    this.draft = {
      start, length: end - start, flip: 0,
      x: geometry.x, y: geometry.y,
    };
    if (parentPosition) {
      this.draft.fontSize = parentPosition.fontSize;
      this.draft.letterSpacing = parentPosition.letterSpacing;
    }
    this.error = '';
    this.saveEdit();
    if (!this.error) selection.removeAllRanges();
  }

  newEdit(notify = true): void {
    this.selectedIndex = null;
    this.selectedElement = null;
    this.draft = this.emptyDraft();
    this.error = '';
    this.deleteIndex = null;
    this.selectingPart = false;
    if (notify) this.selectionChange.emit(null);
  }

  selectEdit(index: number, element?: HTMLElement): void {
    if (this.selectionFrame !== null) return;
    this.selectedIndex = index;
    this.draft = { ...this.fragments[index] };
    this.error = '';
    this.deleteIndex = null;
    this.selectingPart = false;
    this.selectedElement = element ?? this.canvas.nativeElement.querySelector<HTMLElement>(`[data-fragment-index="${index}"]`);
    this.selectionChange.emit(index);
    this.cdr.markForCheck();
  }

  onFragmentMouseUp(event: MouseEvent): void {
    if (event.target instanceof Element &&
      event.target.closest('.artifact-fragment') === event.currentTarget) {
      this.selectCanvasText();
    }
  }

  saveEdit(): void {
    const d = this.draft;
    if (!validPosition(d, this.text)) {
      this.error = 'Enter a valid text range, position, rotation, and font size.';
      return;
    }
    let next = [...this.fragments];
    const isNew = this.selectedIndex === null;
    if (this.selectedIndex === null) {
      const result = addNestedPosition(d, this.fragments);
      if (!result) {
        this.error = 'Ranges must be disjoint or completely inside an existing edit.';
        return;
      }
      next = result.positions;
      this.selectedIndex = result.index;
    } else {
      if (!validNestedUpdate(d, this.fragments, this.selectedIndex)) {
        this.error = 'The range must stay inside its parent and cannot overlap a sibling or exclude a nested edit.';
        return;
      }
      next[this.selectedIndex] = { ...d };
    }
    const validationError = this.validatePositions(this.text, next, this.selectedIndex ?? undefined);
    if (validationError) {
      this.error = validationError;
      if (isNew) this.selectedIndex = null;
      return;
    }
    this.error = '';
    this.emitFragments(next);
    if (isNew) {
      const index = this.selectedIndex;
      if (this.selectionFrame !== null) cancelAnimationFrame(this.selectionFrame);
      this.selectionFrame = requestAnimationFrame(() => {
        this.selectionFrame = null;
        if (index !== null && this.selectedIndex === index && this.fragments[index] === next[index]) {
          this.selectEdit(index);
        }
      });
    }
  }

  requestDelete(index: number): void {
    this.selectEdit(index);
    this.deleteIndex = index;
    this.pendingDeletion = [index];
  }

  cancelDelete(): void {
    this.deleteIndex = null;
    this.pendingDeletion = [];
  }

  confirmDelete(): void {
    if (!this.pendingDeletion.length) return;
    const next = this.promoteChildren(new Set(this.pendingDeletion));
    if (!next) {
      this.error = 'Unable to preserve nested edits. Wait for the text to render and try again.';
      return;
    }
    this.emitFragments(next);
    this.checked.clear();
    this.pendingDeletion = [];
    this.newEdit();
  }

  toggleChecked(index: number, checked: boolean): void {
    if (checked) this.checked.add(index);
    else this.checked.delete(index);
  }

  requestBulkDelete(all: boolean): void {
    const indexes = all ? this.fragments.map((_, index) => index) : [...this.checked].sort((a, b) => a - b);
    if (!indexes.length) return;
    this.selectEdit(indexes[0]);
    this.deleteIndex = indexes[0];
    this.pendingDeletion = indexes;
  }

  selectPart(): void {
    this.selectingPart = true;
    this.selectedElement = null;
  }

  setFontSize(value: number | null): void {
    if (value === null || !Number.isFinite(value) || value <= 0) {
      this.error = 'Font size must be greater than zero.';
      return;
    }
    this.error = '';
    this.updateSelected({ fontSize: value });
    this.refreshControls(true);
  }

  setLetterSpacing(value: number | null): void {
    if (value === null || !Number.isFinite(value)) {
      this.error = 'Enter a valid letter spacing.';
      return;
    }
    this.error = '';
    this.updateSelected({ letterSpacing: value });
    this.refreshControls(true);
  }

  get toolbarPosition(): { left: number; top: number } {
    if (!this.selectedElement) return { left: 0, top: 0 };
    const rect = this.selectedElement.getBoundingClientRect();
    const canvas = this.canvas.nativeElement.getBoundingClientRect();
    return { left: rect.left - canvas.left, top: rect.bottom - canvas.top + 28 };
  }

  get fontSize(): number {
    return this.draft.fontSize ?? (this.selectedElement ? parseFloat(getComputedStyle(this.selectedElement).fontSize) : 16);
  }

  get letterSpacing(): number {
    return this.draft.letterSpacing ?? 0;
  }

  private refreshControls(resize = false): void {
    this.needsControlResize ||= resize;
    if (this.controlsFrame !== null) return;
    this.controlsFrame = requestAnimationFrame(() => {
      this.controlsFrame = null;
      if (this.needsControlResize) this.moveable?.updateRect();
      this.needsControlResize = false;
      this.cdr.markForCheck();
    });
  }

  onDrag(event: { left: number; top: number }): void {
    if (!this.selectedElement || this.selectedIndex === null) return;
    if (!this.boundsElement) {
      this.updateSelected({ x: event.left, y: event.top });
      return;
    }
    const bounds = this.boundsElement.getBoundingClientRect();
    if (!bounds.width || !bounds.height) {
      this.error = 'The image or SVG must be loaded before positioning text.';
      return;
    }
    const element = this.selectedElement;
    const oldLeft = element.style.left;
    const oldTop = element.style.top;
    element.style.left = `${event.left}px`;
    element.style.top = `${event.top}px`;
    const rects = [element, ...element.querySelectorAll<HTMLElement>('.artifact-fragment')]
      .map(item => item.getBoundingClientRect());
    element.style.left = oldLeft;
    element.style.top = oldTop;
    const left = Math.min(...rects.map(rect => rect.left));
    const right = Math.max(...rects.map(rect => rect.right));
    const top = Math.min(...rects.map(rect => rect.top));
    const bottom = Math.max(...rects.map(rect => rect.bottom));
    if (right - left > bounds.width || bottom - top > bounds.height) {
      this.error = 'The selected text is larger than the image or SVG bounds.';
      return;
    }
    const dx = Math.max(bounds.left - left, Math.min(0, bounds.right - right));
    const dy = Math.max(bounds.top - top, Math.min(0, bounds.bottom - bottom));
    let angle = 0;
    let parentId = this.fragments[this.selectedIndex].parentId;
    while (parentId) {
      const parent = this.fragments.find(item => item.id === parentId);
      if (!parent) break;
      angle += parent.flip;
      parentId = parent.parentId;
    }
    const radians = angle * Math.PI / 180;
    this.error = '';
    this.updateSelected({
      x: event.left + dx * Math.cos(radians) + dy * Math.sin(radians),
      y: event.top - dx * Math.sin(radians) + dy * Math.cos(radians)
    });
  }

  onRotateStart(event: { set: (angle: number) => void }): void {
    if (this.selectedIndex !== null) event.set(this.fragments[this.selectedIndex].flip);
  }

  onBeforeRotate(event: { rotation: number; inputEvent: Event; setRotation: (angle: number) => void }): void {
    if (!(event.inputEvent instanceof MouseEvent || event.inputEvent instanceof TouchEvent) ||
      !event.inputEvent.shiftKey || this.selectedIndex === null) return;
    let parentId = this.fragments[this.selectedIndex].parentId;
    let parentRotation = 0;
    while (parentId) {
      const parent = this.fragments.find(fragment => fragment.id === parentId);
      if (!parent) break;
      parentRotation += parent.flip;
      parentId = parent.parentId;
    }
    event.setRotation(Math.round((event.rotation + parentRotation) / 45) * 45 - parentRotation);
  }

  onRotate(event: { rotation: number }): void {
    this.updateSelected({ flip: event.rotation });
  }

  rotateSelected(degrees: number): void {
    if (this.selectedIndex !== null) this.updateSelected({ flip: this.fragments[this.selectedIndex].flip + degrees });
  }

  private updateSelected(change: Partial<ArtifactFragmentWordPosition>): void {
    if (this.selectedIndex === null) return;
    const next = this.fragments.map((item, i) => i === this.selectedIndex ? { ...item, ...change } : item);
    if (change.x === undefined && change.y === undefined) {
      const message = this.validateSelectedStyle(change);
      if (message) {
        this.error = message;
        return;
      }
    }
    this.draft = { ...next[this.selectedIndex] };
    this.emitFragments(next);
    this.refreshControls();
  }

  private validateSelectedStyle(change: Partial<ArtifactFragmentWordPosition>): string | null {
    if (!this.boundsElement || !this.selectedElement) return null;
    const bounds = this.boundsElement.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return 'The image or SVG must be loaded before positioning text.';
    const element = this.selectedElement;
    const { transform, fontSize, letterSpacing } = element.style;
    if (change.flip !== undefined) element.style.transform = `rotate(${change.flip}deg)`;
    if (change.fontSize !== undefined) element.style.fontSize = `${change.fontSize}px`;
    if (change.letterSpacing !== undefined) element.style.letterSpacing = `${change.letterSpacing}px`;
    try {
      for (const item of [element, ...element.querySelectorAll<HTMLElement>('.artifact-fragment')]) {
        const rect = item.getBoundingClientRect();
        if (rect.left < bounds.left - 0.1 || rect.top < bounds.top - 0.1 ||
          rect.right > bounds.right + 0.1 || rect.bottom > bounds.bottom + 0.1) {
          return 'The text would extend outside the image or SVG bounds. Move it or reduce its size first.';
        }
      }
      this.error = '';
      return null;
    } finally {
      element.style.transform = transform;
      element.style.fontSize = fontSize;
      element.style.letterSpacing = letterSpacing;
    }
  }

  validatePositions(text: string, positions: ArtifactFragmentWordPosition[], changedIndex?: number): string | null {
    if (!this.boundsElement) return null;
    const bounds = this.boundsElement.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return 'The image or SVG must be loaded before positioning text.';
    const previousText = this.text;
    const previousFragments = this.fragments;
    this.text = text;
    this.fragments = positions;
    this.cdr.detectChanges();
    try {
      const indices = changedIndex === undefined ? positions.map((_, index) => index) :
        positions.map((_, index) => index).filter(index => {
          let current: number | undefined = index;
          while (current !== undefined) {
            if (current === changedIndex) return true;
            const parentId: string | undefined = positions[current].parentId;
            const parentIndex: number = parentId ? positions.findIndex(item => item.id === parentId) : -1;
            current = parentIndex < 0 ? undefined : parentIndex;
          }
          return false;
        });
      for (const index of indices) {
        const element = this.canvas.nativeElement.querySelector<HTMLElement>(`[data-fragment-index="${index}"]`);
        if (!element) return 'Unable to measure positioned text. Check the edit ranges and try again.';
        const rect = element.getBoundingClientRect();
        const tolerance = 0.1;
        if (rect.left < bounds.left - tolerance || rect.top < bounds.top - tolerance ||
          rect.right > bounds.right + tolerance || rect.bottom > bounds.bottom + tolerance) {
          return `Edit ${index + 1} extends outside the image or SVG bounds. Adjust its position, rotation or size.`;
        }
      }
      return null;
    } finally {
      this.text = previousText;
      this.fragments = previousFragments;
      this.cdr.detectChanges();
      if (this.selectedIndex !== null && this.selectedElement) {
        this.selectedElement = this.canvas.nativeElement.querySelector<HTMLElement>(
          `[data-fragment-index="${this.selectedIndex}"]`
        );
        this.cdr.markForCheck();
      }
    }
  }

  private emitFragments(fragments: ArtifactFragmentWordPosition[]): void {
    this.fragments = fragments;
    this.lastEmitted = fragments;
    this.fragmentsChange.emit(fragments);
    this.cdr.markForCheck();
  }

  private sourceOffset(node: Node, offset: number): number | null {
    const element = node.parentElement;
    const span = element?.closest<HTMLElement>('[data-segment-start]');
    if (!span || !this.canvas.nativeElement.contains(span) || node.nodeType !== Node.TEXT_NODE) return null;
    const start = Number(span.dataset['segmentStart']);
    const parentIndex = this.segmentParent(node);
    const segment = this.segmentsFor(parentIndex).find(item => item.start === start);
    if (!segment) return null;
    let result: number | null = null;
    for (let i = 0; i <= segment.text.length; i++) {
      if (this.displayText(segment.text.slice(0, i)).length === offset) result = start + i;
    }
    return result;
  }

  private segmentParent(node: Node): number | null {
    const fragment = node.parentElement?.closest<HTMLElement>('[data-fragment-index]');
    return fragment ? Number(fragment.dataset['fragmentIndex']) : null;
  }

  private rangePosition(range: Range, parent: HTMLElement): { x: number; y: number } {
    return this.unrotated(parent, () => {
      const rect = range.getBoundingClientRect();
      const origin = parent.getBoundingClientRect();
      return { x: rect.left - origin.left, y: rect.top - origin.top };
    });
  }

  private unrotated<T>(parent: HTMLElement, measure: () => T): T {
    const changed: { element: HTMLElement; transform: string }[] = [];
    let node: HTMLElement | null = parent;
    while (node && node !== this.canvas.nativeElement) {
      if (node.classList.contains('artifact-fragment')) {
        changed.push({ element: node, transform: node.style.transform });
        node.style.transform = 'none';
      }
      node = node.parentElement;
    }
    try {
      return measure();
    } finally {
      for (const item of changed) item.element.style.transform = item.transform;
    }
  }

  private promoteChildren(deleted: Set<number>): ArtifactFragmentWordPosition[] | null {
    const next = this.fragments.map(position => ({ ...position }));
    for (let index = 0; index < next.length; index++) {
      if (deleted.has(index)) continue;
      let child = next[index];
      let parentIndex = next.findIndex(item => item.id && item.id === child.parentId);
      if (parentIndex < 0 || !deleted.has(parentIndex)) continue;
      const element = this.canvas.nativeElement.querySelector<HTMLElement>(`[data-fragment-index="${index}"]`);
      if (!element) return null;
      const computed = getComputedStyle(element);
      child.fontSize ??= parseFloat(computed.fontSize);
      child.letterSpacing ??= computed.letterSpacing === 'normal' ? 0 : parseFloat(computed.letterSpacing);
      while (parentIndex >= 0 && deleted.has(parentIndex)) {
        const parent = next[parentIndex];
        const parentElement = this.canvas.nativeElement.querySelector<HTMLElement>(`[data-fragment-index="${parentIndex}"]`);
        if (!parentElement) return null;
        const width = element.offsetWidth;
        const height = element.offsetHeight;
        const parentWidth = parentElement.offsetWidth;
        const parentHeight = parentElement.offsetHeight;
        const radians = parent.flip * Math.PI / 180;
        const dx = child.x + width / 2 - parentWidth / 2;
        const dy = child.y + height / 2 - parentHeight / 2;
        child = {
          ...child,
          x: parent.x + parentWidth / 2 + dx * Math.cos(radians) - dy * Math.sin(radians) - width / 2,
          y: parent.y + parentHeight / 2 + dx * Math.sin(radians) + dy * Math.cos(radians) - height / 2,
          flip: child.flip + parent.flip,
          parentId: parent.parentId
        };
        next[index] = child;
        parentIndex = next.findIndex(item => item.id && item.id === child.parentId);
      }
    }
    return next.filter((_, index) => !deleted.has(index));
  }

  private emptyDraft(): ArtifactFragmentWordPosition {
    return { start: 0, length: 1, x: 0, y: 0, flip: 0, fontSize: 16, letterSpacing: 0 };
  }
}
