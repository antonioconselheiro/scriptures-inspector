import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'paleo'
})
export class PaleoPipe implements PipeTransform {

  readonly iconography = [
    {
      name: "alef",
      matcher: /[א][\u0591-\u05C7]*/g,
      paleo: "𐤀"
    },
    {
      name: "bet",
      matcher: /[ב][\u0591-\u05C7]*/g,
      paleo: "𐤁"
    },
    {
      name: "guimel",
      matcher: /[ג][\u0591-\u05C7]*/g,
      paleo: "𐤂"
    },
    {
      name: "dalet",
      matcher: /[ד][\u0591-\u05C7]*/g,
      paleo: "𐤃"
    },
    {
      name: "hei",
      matcher: /[ה][\u0591-\u05C7]*/g,
      paleo: "𐤄"
    },
    {
      name: "vav",
      matcher: /[ו][\u0591-\u05C7]*/g,
      paleo: "𐤅"
    },
    {
      name: "zain",
      matcher: /[ז][\u0591-\u05C7]*/g,
      paleo: "𐤆"
    },
    {
      name: "chet",
      matcher: /[ח][\u0591-\u05C7]*/g,
      paleo: "𐤇"
    },
    {
      name: "tet",
      matcher: /[ט][\u0591-\u05C7]*/g,
      paleo: "𐤈"
    },
    {
      name: "yod",
      matcher: /[י][\u0591-\u05C7]*/g,
      paleo: "𐤉"
    },
    {
      name: "kaf",
      matcher: /[כך][\u0591-\u05C7]*/g,
      paleo: "𐤊"
    },
    {
      name: "lamed",
      matcher: /[ל][\u0591-\u05C7]*/g,
      paleo: "𐤋"
    },
    {
      name: "mem",
      matcher: /[מם][\u0591-\u05C7]*/g,
      paleo: "𐤌"
    },
    {
      name: "nun",
      matcher: /[נן][\u0591-\u05C7]*/g,
      paleo: "𐤍"
    },
    {
      name: "samech",
      matcher: /[ס][\u0591-\u05C7]*/g,
      paleo: "𐤎"
    },
    {
      name: "ayin",
      matcher: /[ע][\u0591-\u05C7]*/g,
      paleo: "𐤏"
    },
    {
      name: "pe",
      matcher: /[פף][\u0591-\u05C7]*/g,
      paleo: "𐤐"
    },
    {
      name: "tsadi",
      matcher: /[צץ][\u0591-\u05C7]*/g,
      paleo: "𐤑"
    },
    {
      name: "qof",
      matcher: /[ק][\u0591-\u05C7]*/g,
      paleo: "𐤒"
    },
    {
      name: "resh",
      matcher: /[ר][\u0591-\u05C7]*/g,
      paleo: "𐤓"
    },
    {
      name: "shin",
      matcher: /[ש][\u0591-\u05C7]*/g,
      paleo: "𐤔"
    },
    {
      name: "tav",
      matcher: /[ת][\u0591-\u05C7]*/g,
      paleo: "𐤕"
    },
    {
      name: "separator",
      matcher: /[\u05BE\u05C0\u05C3\u05C6]$/g,
      paleo: "𐤟"
    }
  ];

  transform(value: string): string {
    for (let index = 0; index < this.iconography.length; index++) {
      value = value.replace(this.iconography[index].matcher, this.iconography[index].paleo);
    }

    return Array.from(value).reverse().join("");
  }
}
