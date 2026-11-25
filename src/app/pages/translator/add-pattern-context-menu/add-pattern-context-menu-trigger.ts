import { Directive, HostListener, Input } from '@angular/core';
import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { Word } from '@domain/word-model';
import { AddPatternContextMenu } from './add-pattern-context-menu';

@Directive({
  selector: '[appAddPatternContextMenuTrigger]'
})
export class AddPatternContextMenuTrigger {

  @Input({ alias: 'appAddPatternContextMenuTrigger', required: true })
  contextMenu!: AddPatternContextMenu;

  @Input({ required: true })
  sourceLanguage!: LanguageUnionType;

  @Input({ required: true })
  bookTarget!: BookMetadataTarget;

  @Input({ required: true })
  patternWordMatrix!: Word[];

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault();
    const selection = window.getSelection();
    const selectedText = selection?.toString() ?? '';
    const trimmedSelection = selectedText.trim();

    if (trimmedSelection) {
      this.contextMenu.selectedWord = trimmedSelection;
      this.contextMenu.selectedText = selectedText;
      const target = event.target;
      const cell = target instanceof Element ? target.closest('td') : null;
      const segmentFromNode = (node: Node | null): Element | null => {
        const element = node instanceof Element ? node : node?.parentElement;
        return element?.closest('span') ?? null;
      };
      const anchorSegment = segmentFromNode(selection?.anchorNode ?? null);
      const focusSegment = segmentFromNode(selection?.focusNode ?? null);
      const selectionSegment = anchorSegment === focusSegment ? anchorSegment : null;
      const targetSegment = target instanceof Element ? target.closest('span') : null;
      const segment = selectionSegment ?? targetSegment;
      this.contextMenu.selectedSegment = segment?.textContent?.trim() ?? '';
      const anchorWordIndex = anchorSegment?.getAttribute('data-pattern-word-index');
      const focusWordIndex = focusSegment?.getAttribute('data-pattern-word-index');
      const host = event.currentTarget instanceof Element ? event.currentTarget : null;
      const targetWordIndex = targetSegment?.getAttribute('data-pattern-word-index');
      const wordIndex = anchorWordIndex !== null && anchorWordIndex !== undefined
        && anchorWordIndex === focusWordIndex && anchorWordIndex === targetWordIndex
        && !!anchorSegment && !!focusSegment && !!host?.contains(anchorSegment) && host.contains(focusSegment)
        ? Number(anchorWordIndex) : -1;
      this.contextMenu.selectedFullWord = this.patternWordMatrix[wordIndex]?.segments
        .map(item => item.word).join('') ?? '';
      this.contextMenu.selectionAtWordStart = false;
      this.contextMenu.selectionAtWordEnd = false;
      if (wordIndex >= 0 && selection?.rangeCount && host) {
        const spans = host.querySelectorAll(`[data-pattern-word-index="${wordIndex}"]`);
        const selectedRange = selection.getRangeAt(0);
        const before = document.createRange();
        before.setStartBefore(spans[0]);
        before.setEnd(selectedRange.startContainer, selectedRange.startOffset);
        const after = document.createRange();
        after.setStart(selectedRange.endContainer, selectedRange.endOffset);
        after.setEndAfter(spans[spans.length - 1]);
        this.contextMenu.selectionAtWordStart = before.toString().length === 0;
        this.contextMenu.selectionAtWordEnd = after.toString().length === 0;
      }
      this.contextMenu.cellContent = cell?.textContent ?? '';
      this.contextMenu.x = event.clientX;
      this.contextMenu.y = event.clientY;
      this.contextMenu.visible = true;
      this.contextMenu.sourceLanguage = this.sourceLanguage;
      this.contextMenu.bookTarget = this.bookTarget;
    } else {
      this.contextMenu.visible = false;
    }
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.contextMenu) {
      this.contextMenu.visible = false;
    }
  }
}
