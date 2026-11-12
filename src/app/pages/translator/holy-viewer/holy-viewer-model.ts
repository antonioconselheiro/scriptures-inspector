export type HolyViewerSection =
  | 'interlinear'
  | 'customTranslation'
  | 'lexical'
  | 'spelling'
  | 'transliteration'
  | 'numerology';

export interface HolyViewerConfig {
  scope: 'verse' | 'range' | 'chapter';
  verse: number;
  startVerse: number;
  endVerse: number;
  showOriginal: boolean;
  showOriginalLexicalTooltip: boolean;
  displayMode: 'wordOfGod' | 'prismatic';
  selectedVariations: Record<string, string[]>;
  sections: Record<HolyViewerSection, boolean>;
}

export interface HolyViewerPiece {
  text: string;
  title?: string;
  color?: string;
  wordOfGod?: boolean;
  variations?: Record<string, string>;
}

export interface HolyViewerVariationOption {
  target: string;
  source: string;
  id: string;
  name: string;
}

export interface HolyViewerLine {
  type: 'original' | HolyViewerSection;
  label: string;
  language?: string;
  pieces: HolyViewerPiece[];
  variationTarget?: string;
}

export interface HolyViewerVerse {
  id: string;
  bookName: string;
  chapter: number;
  verse: number;
  lines: HolyViewerLine[];
}

export const defaultHolyViewerConfig: HolyViewerConfig = {
  scope: 'verse',
  verse: 1,
  startVerse: 1,
  endVerse: 1,
  showOriginal: true,
  showOriginalLexicalTooltip: false,
  displayMode: 'prismatic',
  selectedVariations: {},
  sections: {
    interlinear: true,
    customTranslation: true,
    lexical: true,
    spelling: false,
    transliteration: false,
    numerology: false
  }
};
