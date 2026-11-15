export type HolyViewerSection =
  | 'customTranslation'
  | 'spelling'
  | 'transliteration'
  | 'numerology';

export type HolyViewerAlignment = 'left' | 'center' | 'right' | 'justify';

export interface HolyViewerConfig {
  scope: 'verse' | 'range' | 'chapter';
  verse: number;
  startVerse: number;
  endVerse: number;
  displayMode: 'wordOfGod' | 'prismatic';
  fontSize?: number;
  showLineLabels?: boolean;
  textAlignment?: HolyViewerAlignment;
  codices: Record<string, HolyViewerCodexConfig>;
}

export interface HolyViewerCodexConfig {
  showOriginal: boolean;
  showOriginalLexicalTooltip: boolean;
  selectedVariations: Record<string, string[]>;
  selectedSpellings?: string[];
  selectedNumerology?: string[];
  sections: Record<HolyViewerSection, boolean>;
}

export interface HolyViewerPiece {
  text: string;
  separator?: boolean;
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
  source: string;
  type: 'original' | 'interlinear' | HolyViewerSection;
  label: string;
  language?: string;
  pieces: HolyViewerPiece[];
  variationTarget?: string;
  optionId?: string;
}

export interface HolyViewerVerse {
  id: string;
  bookName: string;
  chapter: number;
  verse: number;
  lines: HolyViewerLine[];
}

export const defaultHolyViewerConfig: HolyViewerConfig & { fontSize: number } = {
  scope: 'verse',
  verse: 1,
  startVerse: 1,
  endVerse: 1,
  displayMode: 'prismatic',
  fontSize: 20,
  showLineLabels: true,
  textAlignment: 'left',
  codices: {}
};

export const defaultHolyViewerCodexConfig: HolyViewerCodexConfig = {
  showOriginal: true,
  showOriginalLexicalTooltip: true,
  selectedVariations: {},
  sections: {
    customTranslation: true,
    spelling: false,
    transliteration: false,
    numerology: false
  }
};
