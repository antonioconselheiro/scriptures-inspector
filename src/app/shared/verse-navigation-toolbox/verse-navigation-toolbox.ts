import { AsyncPipe } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Toolbox } from '@shared/toolbox/toolbox';
import { ToolboxVisibilityService } from '@shared/toolbox/toolbox-visibility-service';

@Component({
  selector: 'app-verse-navigation-toolbox',
  imports: [AsyncPipe, Toolbox],
  templateUrl: './verse-navigation-toolbox.html',
  styleUrl: './verse-navigation-toolbox.scss'
})
export class VerseNavigationToolbox {

  verse: number | null = null;

  constructor(readonly toolboxVisibility: ToolboxVisibilityService) { }

  private getVerseTitles(): Array<HTMLElement> {
    return Array.from(document.querySelectorAll<HTMLElement>('h2.verseTitle[data-verse]'));
  }

  scrollToVerse(verse: number): void {
    if (!verse) {
      return;
    }

    const title = this.getVerseTitles().find(element => Number(element.dataset['verse']) === verse);
    if (title) {
      const top = title.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const limit = 1;
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
