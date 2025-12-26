export interface LanguageNumerology {
  name: string;
  label: string;
  calc: (text: string) => number;
}
