import { ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, OnDestroy, ViewChild } from '@angular/core';

@Component({
  selector: 'app-find-in-page',
  templateUrl: './find-in-page.html',
  styleUrl: './find-in-page.scss'
})
export class FindInPage implements OnDestroy {

  @ViewChild('searchEl')
  searchEl?: ElementRef<HTMLInputElement>;

  visible = false;
  query = '';
  total = 0;
  current = 0;

  private ranges: Array<Range> = [];
  private readonly matchHighlight = 'find-in-page-match';
  private readonly currentHighlight = 'find-in-page-current';
  private readonly ignoredTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'SELECT', 'OPTION']);
  private mutationObserver: MutationObserver | null = null;
  private mutationDebounce: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private host: ElementRef<HTMLElement>,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnDestroy(): void {
    this.clearHighlights();
    this.stopObserving();
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
      event.preventDefault();
      this.open();
    } else if (this.visible && event.key === 'Escape') {
      event.preventDefault();
      this.close();
    } else if (this.visible && event.key === 'F3') {
      event.preventDefault();
      event.shiftKey ? this.previous() : this.next();
    }
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.shiftKey ? this.previous() : this.next();
    }
  }

  onQueryChange(query: string): void {
    this.query = query;
    this.search(false);
  }

  open(): void {
    const selectedText = window.getSelection()?.toString().trim();
    if (selectedText && !selectedText.includes('\n') && !this.host.nativeElement.contains(window.getSelection()?.anchorNode || null)) {
      this.query = selectedText;
    }

    this.visible = true;
    this.cdr.detectChanges();
    this.searchEl?.nativeElement.focus();
    this.searchEl?.nativeElement.select();
    this.startObserving();
    this.search(false);
  }

  close(): void {
    this.visible = false;
    this.clearHighlights();
    this.stopObserving();
    this.ranges = [];
    this.total = 0;
    this.current = 0;
  }

  next(): void {
    if (this.total) {
      this.current = (this.current + 1) % this.total;
      this.updateHighlights(true);
    }
  }

  previous(): void {
    if (this.total) {
      this.current = (this.current - 1 + this.total) % this.total;
      this.updateHighlights(true);
    }
  }

  private search(keepPosition: boolean): void {
    const previousIndex = this.current;
    this.ranges = this.query ? this.findRanges(this.query) : [];
    this.total = this.ranges.length;

    if (!this.total) {
      this.current = 0;
    } else if (keepPosition) {
      this.current = Math.min(previousIndex, this.total - 1);
    } else {
      // like Chromium, starts from the first match visible in the viewport
      const firstVisible = this.ranges.findIndex(range => range.getBoundingClientRect().top >= 0);
      this.current = firstVisible === -1 ? 0 : firstVisible;
    }

    this.updateHighlights(!keepPosition);
  }

  private findRanges(query: string): Array<Range> {
    const nodes: Array<Text> = [];
    const starts: Array<number> = [];
    let text = '';
    let lastBlock: Element | null = null;
    const blockCache = new Map<Element, Element>();

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: node => this.isSearchable(node as Text) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    });

    for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
      const block = this.getBlockAncestor(node.parentElement!, blockCache);
      // block boundaries act as separators, so matches don't cross cells/paragraphs
      if (lastBlock && block !== lastBlock) {
        text += '\n';
      }

      lastBlock = block;
      nodes.push(node);
      starts.push(text.length);
      text += node.data;
    }

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'giu');
    const ranges: Array<Range> = [];

    for (const match of text.matchAll(regex)) {
      if (!match[0].length) {
        continue;
      }

      const start = this.locate(nodes, starts, match.index!);
      const end = this.locate(nodes, starts, match.index! + match[0].length);
      if (start && end) {
        const range = new Range();
        range.setStart(start.node, start.offset);
        range.setEnd(end.node, end.offset);
        ranges.push(range);
      }
    }

    return ranges;
  }

  private locate(nodes: Array<Text>, starts: Array<number>, position: number): { node: Text, offset: number } | null {
    let low = 0;
    let high = starts.length - 1;

    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      if (starts[middle] <= position) {
        low = middle;
      } else {
        high = middle - 1;
      }
    }

    const node = nodes[low];
    if (!node) {
      return null;
    }

    return { node, offset: Math.min(position - starts[low], node.data.length) };
  }

  private isSearchable(node: Text): boolean {
    const parent = node.parentElement;
    if (!parent || !node.data.trim()) {
      return false;
    }

    if (this.ignoredTags.has(parent.tagName) || this.host.nativeElement.contains(parent)) {
      return false;
    }

    return parent.checkVisibility({ visibilityProperty: true } as CheckVisibilityOptions);
  }

  private getBlockAncestor(element: Element, cache: Map<Element, Element>): Element {
    const cached = cache.get(element);
    if (cached) {
      return cached;
    }

    let block: Element = element;
    while (block.parentElement && getComputedStyle(block).display.startsWith('inline')) {
      block = block.parentElement;
    }

    cache.set(element, block);
    return block;
  }

  private updateHighlights(scroll: boolean): void {
    this.clearHighlights();
    if (!this.total) {
      return;
    }

    const currentRange = this.ranges[this.current];
    CSS.highlights.set(this.matchHighlight, new Highlight(...this.ranges.filter(range => range !== currentRange)));
    CSS.highlights.set(this.currentHighlight, new Highlight(currentRange));

    if (scroll) {
      const element = currentRange.startContainer.parentElement;
      element?.scrollIntoView({ block: 'center', inline: 'nearest' });
    }
  }

  private clearHighlights(): void {
    CSS.highlights.delete(this.matchHighlight);
    CSS.highlights.delete(this.currentHighlight);
  }

  private startObserving(): void {
    if (this.mutationObserver) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.mutationObserver = new MutationObserver(mutations => {
        const external = mutations.some(mutation => !this.host.nativeElement.contains(mutation.target));
        if (!external || !this.query) {
          return;
        }

        if (this.mutationDebounce) {
          clearTimeout(this.mutationDebounce);
        }

        this.mutationDebounce = setTimeout(() => this.zone.run(() => {
          this.search(true);
          this.cdr.markForCheck();
        }), 300);
      });

      this.mutationObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
    });
  }

  private stopObserving(): void {
    this.mutationObserver?.disconnect();
    this.mutationObserver = null;
    if (this.mutationDebounce) {
      clearTimeout(this.mutationDebounce);
      this.mutationDebounce = null;
    }
  }
}
