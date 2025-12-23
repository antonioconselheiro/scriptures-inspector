export interface LanguageAlternativeSpelling {
  name: string;
  label: string;
  font?: string;
  parse?: (text: string) => string;
}
