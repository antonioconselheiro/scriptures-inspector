
const MIDDLE_PERSIAN_MANICHAEAN = [
  // Aleph e variantes consonantais pontuadas
  { name: "aleph", spelling: "ʾ", unicode: "\u{10AC0}" },
  { name: "beth", spelling: "b", unicode: "\u{10AC1}" },
  { name: "bheth", spelling: "β", unicode: "\u{10AC2}" },

  // Gimel
  { name: "gimel", spelling: "g", unicode: "\u{10AC3}" },
  { name: "ghimel", spelling: "γ", unicode: "\u{10AC4}" },

  // Daleth, He e Waw
  { name: "daleth", spelling: "d", unicode: "\u{10AC5}" },
  { name: "he", spelling: "h", unicode: "\u{10AC6}" },
  { name: "waw", spelling: "w", unicode: "\u{10AC7}" },

  // Zayin e variantes
  { name: "zayin", spelling: "z", unicode: "\u{10AC9}" },
  { name: "zhayin", spelling: "ž", unicode: "\u{10ACA}" },

  // Heth, Teth e Yodh
  { name: "heth", spelling: "ẖ", unicode: "\u{10ACD}" },
  { name: "teth", spelling: "ṭ", unicode: "\u{10ACE}" },
  { name: "yodh", spelling: "y", unicode: "\u{10ACF}" },

  // Kaph e Xaph
  { name: "kaph", spelling: "k", unicode: "\u{10AD0}" },
  { name: "xaph", spelling: "x", unicode: "\u{10AD1}" },

  // Lamedh e variantes
  { name: "lamedh", spelling: "l", unicode: "\u{10AD3}" },
  { name: "dhamedh", spelling: "δ", unicode: "\u{10AD4}" },
  { name: "thamedh", spelling: "θ", unicode: "\u{10AD5}" },

  // Mem, Nun e Samekh
  { name: "mem", spelling: "m", unicode: "\u{10AD6}" },
  { name: "nun", spelling: "n", unicode: "\u{10AD7}" },
  { name: "samekh", spelling: "s", unicode: "\u{10AD8}" },

  // Ayin e Aayin
  { name: "ayin", spelling: "ʿ", unicode: "\u{10AD9}" },
  { name: "aayin", spelling: "ʿʿ", unicode: "\u{10ADA}" },

  // Pe e Fe
  { name: "pe", spelling: "p", unicode: "\u{10ADB}" },
  { name: "fe", spelling: "f", unicode: "\u{10ADC}" },

  // Sadhe, Qoph e variantes
  { name: "sadhe", spelling: "c", unicode: "\u{10ADD}" },
  { name: "qoph", spelling: "q", unicode: "\u{10ADE}" },

  // Resh, Shin e Taw
  { name: "resh", spelling: "r", unicode: "\u{10AE1}" },
  { name: "shin", spelling: "š", unicode: "\u{10AE2}" },
  { name: "taw", spelling: "t", unicode: "\u{10AE4}" }
] as const;

// Maior correspondência primeiro: importante para preservar
// sinais compostos antes de processar sinais individuais.
const MANICHAEAN_SPELLING_MAP = new Map<string, string>(
  [...MIDDLE_PERSIAN_MANICHAEAN]
    .sort((a, b) => b.spelling.length - a.spelling.length)
    .map(item => [item.spelling, item.unicode])
);

const MANICHAEAN_SPELLING_REGEX = new RegExp(
  [...MANICHAEAN_SPELLING_MAP.keys()]
    .map(value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|"),
  "gu"
);

export function middlePersianSpellingFn(text: string): string {
  const normalized = text.normalize("NFC");

  return normalized.replace(
    MANICHAEAN_SPELLING_REGEX,
    match => MANICHAEAN_SPELLING_MAP.get(match) ?? match
  );
}
