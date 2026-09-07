const ETCBC_TO_SQUARE_HEBREW: Record<string, string> = {
    ">": "א",
    "B": "ב",
    "G": "ג",
    "D": "ד",
    "H": "ה",
    "W": "ו",
    "Z": "ז",
    "X": "ח",
    "V": "ט",
    "J": "י",
    "K": "כ",
    "L": "ל",
    "M": "מ",
    "N": "נ",
    "S": "ס",
    "<": "ע",
    "P": "פ",
    "Y": "צ",
    "Q": "ק",
    "R": "ר",
    "C": "ש",
    "F": "ש",
    "T": "ת"
};

export function squareHebrewSpellingFn(text: string): string {
    return [...text]
        .map(char => ETCBC_TO_SQUARE_HEBREW[char] ?? char)
        .join("");
}
