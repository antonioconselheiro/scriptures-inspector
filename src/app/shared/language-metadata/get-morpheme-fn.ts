export function getMorphemeFn(segments: Array<any>, currentIndex: number): 'common' | 'prefix' | 'suffix' {
  if (currentIndex === 0) {
    return 'prefix';
  } else if (currentIndex === segments.length - 1) {
    return 'suffix';
  } else {
    return 'common';
  }
}
