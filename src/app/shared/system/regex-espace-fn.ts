export function regexEscapeFn(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
