export function metadataVerseMatches(value: unknown, verse: number): boolean {
  if (value === verse) return true;
  if (!value || typeof value !== 'object' || !('start' in value) || !('end' in value)) return false;
  return Number(value.start) <= verse && Number(value.end) >= verse;
}
