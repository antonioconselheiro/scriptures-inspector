import { Pipe, PipeTransform } from '@angular/core';
import { AbstractHolyScriptureModel } from './domain/abstract-holy-scripture-model';
import { OldBook } from './domain/old-book-enum';
import { ScriptureVerse } from './domain/scripture-verse-model';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'delimitationHtmlfier',
  pure: false
})
export class DelimitationHtmlfierPipe implements PipeTransform {

  constructor(
    private sanitizer: DomSanitizer,
  ) { }

  transform(custom: AbstractHolyScriptureModel, book: OldBook, chapter: number, verse: ScriptureVerse): unknown {
    const scriptureVerse = this.getCustomTranslationVerse(custom, book, chapter, verse);
    if (scriptureVerse) {
      return this.sanitizer.bypassSecurityTrustHtml(this.applyMetadata(scriptureVerse));
    }

    return '&nbsp;';
  }

  getCustomTranslationVerse(custom: AbstractHolyScriptureModel, book: OldBook, chapter: number, verse: ScriptureVerse): ScriptureVerse | null {
    return custom[book] && custom[book][chapter] && custom[book][chapter][verse.verse.index];
  }

  private applyMetadata(verse: ScriptureVerse): string {
    if (!verse.metadata || verse.metadata.length === 0) {
      return verse.text;
    }

    let result = verse.text;
    const godsaid = verse.metadata.filter(m => m.type === "godsaid");
    const inner = verse.metadata.filter(m => m.type !== "godsaid");
    const sortDesc = (a: any, b: any) => b.start - a.start;

    godsaid.sort(sortDesc).forEach(g => {
      result =
        result.slice(0, g.start) +
        `<span class="delimitation godsaid" data-start="${g.start}" data-end="${g.end}">` +
        result.slice(g.start, g.end) +
        `</span>` +
        result.slice(g.end);
    });

    inner.sort(sortDesc).forEach(m => {
      result =
        result.slice(0, m.start) +
        `<span class="delimitation ${m.type}" data-start="${m.start}" data-end="${m.end}">` +
        result.slice(m.start, m.end) +
        `</span>` +
        result.slice(m.end);
    });

    return result;
  }

}
