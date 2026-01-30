export function massoretifierFn(pattern: string): string {
  return pattern.replace(
    /([\p{Script=Hebrew}])/gu,
    '$1\\p{M}*'
  );
}
