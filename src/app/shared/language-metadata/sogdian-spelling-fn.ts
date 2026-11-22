
type SogdianCharactersEntry = {
  name: string;
  spelling: string;
  unicode: string;
};

const SOGDIAN_CHARACTERES: SogdianCharactersEntry[] = [
  // Aleph
  { name: "aleph", spelling: "ʾ", unicode: "\u{10AC0}" },

  // Beth and Bheth
  { name: "beth", spelling: "b", unicode: "\u{10AC1}" },
  { name: "bheth", spelling: "β", unicode: "\u{10AC2}" },

  // Gimel and Ghimel
  { name: "gimel", spelling: "g", unicode: "\u{10AC3}" },
  { name: "ghimel", spelling: "γ", unicode: "\u{10AC4}" },

  // Daleth
  { name: "daleth", spelling: "d", unicode: "\u{10AC5}" },

  // He and Heth
  { name: "he", spelling: "ẖ", unicode: "\u{10AC6}" },
  { name: "heth", spelling: "h", unicode: "\u{10ACD}" },
  { name: "heth-diacritic", spelling: "ḥ", unicode: "\u{10ACD}" },

  // Waw
  { name: "waw", spelling: "w", unicode: "\u{10AC7}" },

  // Zayin
  { name: "zayin", spelling: "z", unicode: "\u{10AC9}" },

  // Jayin: Sogdian-specific letter for ž
  { name: "jayin", spelling: "ž", unicode: "\u{10ACB}" },
  { name: "jayin-graphemic", spelling: "j", unicode: "\u{10ACB}" },

  // Teth and Yodh
  { name: "teth", spelling: "ṭ", unicode: "\u{10ACE}" },
  { name: "yodh", spelling: "y", unicode: "\u{10ACF}" },

  // Kaph and Xaph
  { name: "kaph", spelling: "k", unicode: "\u{10AD0}" },
  { name: "xaph", spelling: "x", unicode: "\u{10AD1}" },

  // Lamedh and Sogdian voiced dental fricatives
  { name: "lamedh", spelling: "l", unicode: "\u{10AD3}" },
  { name: "dhamedh", spelling: "δ", unicode: "\u{10AD4}" },
  { name: "thamedh", spelling: "θ", unicode: "\u{10AD4}" },

  // Mem and Nun
  { name: "mem", spelling: "m", unicode: "\u{10AD6}" },
  { name: "nun", spelling: "n", unicode: "\u{10AD7}" },

  // Samekh
  { name: "samekh", spelling: "s", unicode: "\u{10AD8}" },

  // Ayin
  { name: "ayin", spelling: "ʿ", unicode: "\u{10AD9}" },

  // Pe and Fe
  { name: "pe", spelling: "p", unicode: "\u{10ADB}" },
  { name: "fe", spelling: "f", unicode: "\u{10ADC}" },

  // Sadhe: Sogdian č / c
  { name: "sadhe", spelling: "c", unicode: "\u{10ADD}" },
  { name: "sadhe-affricate", spelling: "č", unicode: "\u{10ADD}" },
  { name: "sadhe-voiced", spelling: "ǰ", unicode: "\u{10ADD}" },

  // Qoph
  { name: "qoph", spelling: "q", unicode: "\u{10ADE}" },

  // Resh
  { name: "resh", spelling: "r", unicode: "\u{10AE1}" },

  // Shin
  { name: "shin", spelling: "š", unicode: "\u{10AE2}" },

  // Taw
  { name: "taw", spelling: "t", unicode: "\u{10AE4}" }
];

// Longest match first, preventing shorter sequences from
// consuming characters belonging to longer transliterations.
const SOGDIAN_SPELLING_MAP = new Map(
  [...SOGDIAN_CHARACTERES]
    .sort((a, b) => b.spelling.length - a.spelling.length)
    .map(({ spelling, unicode }) => [spelling, unicode])
);

const SOGDIAN_SPELLING_REGEX = new RegExp(
  [...SOGDIAN_SPELLING_MAP.keys()]
    .map(value =>
      value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    )
    .join("|"),
  "gu"
);

export function sogdianSpellingFn(text: string): string {
  const normalized = text.normalize("NFC");

  return normalized.replace(
    SOGDIAN_SPELLING_REGEX,
    match => SOGDIAN_SPELLING_MAP.get(match) ?? match
  );
}
