
const OLD_UYGHUR_SPELLING = [
  // Vogais e caracteres específicos
  { name: "a-umlaut", matcher: /Ä/g, latin: "Ä" },
  { name: "a-umlaut-lower", matcher: /ä/g, latin: "ä" },
  { name: "o-umlaut", matcher: /Ö/g, latin: "Ö" },
  { name: "o-umlaut-lower", matcher: /ö/g, latin: "ö" },
  { name: "u-umlaut", matcher: /Ü/g, latin: "Ü" },
  { name: "u-umlaut-lower", matcher: /ü/g, latin: "ü" },

  // Consoantes acadêmicas
  { name: "eng", matcher: /Ŋ/g, latin: "Ŋ" },
  { name: "eng-lower", matcher: /ŋ/g, latin: "ŋ" },
  { name: "esh", matcher: /Š/g, latin: "Š" },
  { name: "esh-lower", matcher: /š/g, latin: "š" },
  { name: "c-caron", matcher: /Č/g, latin: "Č" },
  { name: "c-caron-lower", matcher: /č/g, latin: "č" },
  { name: "dotless-i", matcher: /ı/g, latin: "ı" },
  { name: "dotless-i-upper", matcher: /I/g, latin: "I" },

  // Caracteres de transcrição editorial
  { name: "glottal-stop", matcher: /ʾ/g, latin: "ʾ" },
  { name: "ayin", matcher: /ʿ/g, latin: "ʿ" },

  // Separadores
  { name: "separator", matcher: /[❀]/g, latin: " " }
];

export function oldUyghurSpellingFn(text: string): string {
  let result = text.normalize("NFC");

  for (const item of OLD_UYGHUR_SPELLING) {
    result = result.replace(item.matcher, item.latin);
  }

  return result
    .replace(/[ \t]+/g, " ")
    .trim();
}
