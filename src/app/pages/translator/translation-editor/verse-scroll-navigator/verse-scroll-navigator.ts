import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-verse-scroll-navigator',
  template: `<input type="number" min="0" [value]="verse" (change)="scrollToVerse(verseEl.valueAsNumber)" #verseEl title="Go to verse" />`,
  styleUrl: './verse-scroll-navigator.scss'
})
export class VerseScrollNavigator {

  verse: number | null = null;

  private getHeaderOffset(): number {
    const header = document.querySelector<HTMLElement>('app-project-header');
    return header ? header.offsetHeight : 0;
  }

  private getVerseTitles(): Array<HTMLElement> {
    return Array.from(document.querySelectorAll<HTMLElement>('h2.verseTitle[data-verse]'));
  }

  scrollToVerse(verse: number): void {
    if (!verse) {
      return;
    }

    const title = this.getVerseTitles().find(el => Number(el.dataset['verse']) === verse);
    if (title) {
      const top = title.getBoundingClientRect().top + window.scrollY - this.getHeaderOffset();
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const limit = this.getHeaderOffset() + 1;
    let current: HTMLElement | null = null;

    for (const title of this.getVerseTitles()) {
      if (title.getBoundingClientRect().top <= limit) {
        current = title;
      } else {
        break;
      }
    }

    this.verse = current ? Number(current.dataset['verse']) : null;
  }
}
