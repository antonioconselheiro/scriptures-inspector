export function demassoretifier(hebraic: string): string {
  return hebraic.replace(/[\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\s]/g, '');
}
