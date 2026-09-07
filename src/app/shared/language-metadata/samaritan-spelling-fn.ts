const ETCBC_TO_SAMARITAN = {
  ">": "ࠀ",
  "B": "ࠁ",
  "G": "ࠂ",
  "D": "ࠃ",
  "H": "ࠄ",
  "W": "ࠅ",
  "Z": "ࠆ",
  "X": "ࠇ",
  "V": "ࠈ",
  "J": "ࠉ",
  "K": "ࠊ",
  "L": "ࠋ",
  "M": "ࠌ",
  "N": "ࠍ",
  "S": "ࠎ",
  "<": "ࠏ",
  "P": "ࠐ",
  "Y": "ࠑ",
  "Q": "ࠒ",
  "R": "ࠓ",
  "C": "ࠔ",
  "F": "ࠔ",
  "T": "ࠕ"
}

export function samaritanSpellingFn(text: string): string {
  return [...text]
    .map(char => ETCBC_TO_SAMARITAN[char as keyof typeof ETCBC_TO_SAMARITAN] ?? char)
    .join("");
}
