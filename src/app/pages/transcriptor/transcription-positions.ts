import { ArtifactFragmentWordPosition } from '@domain/artifact-fragment-word-position-model';
import { v4 as uuid } from 'uuid';

export function validPosition(position: ArtifactFragmentWordPosition, text: string): boolean {
  return Number.isInteger(position.start) && Number.isInteger(position.length) &&
    position.start >= 0 && position.length > 0 && position.start + position.length <= text.length &&
    Number.isFinite(position.x) && Number.isFinite(position.y) && Number.isFinite(position.flip) &&
    (position.fontSize == null || Number.isFinite(position.fontSize) && position.fontSize > 0) &&
    (position.letterSpacing == null || Number.isFinite(position.letterSpacing)) &&
    (position.width == null || Number.isFinite(position.width) && position.width > 0);
}

export function addNestedPosition(
  position: ArtifactFragmentWordPosition,
  positions: ArtifactFragmentWordPosition[]
): { positions: ArtifactFragmentWordPosition[]; index: number } | null {
  const end = position.start + position.length;
  const intersecting = positions.filter(item => position.start < item.start + item.length && item.start < end);
  if (intersecting.some(item => position.start < item.start || end > item.start + item.length ||
    (position.start === item.start && end === item.start + item.length))) return null;
  const parent = intersecting.reduce<ArtifactFragmentWordPosition | undefined>((closest, item) =>
    !closest || item.length < closest.length ? item : closest, undefined);
  const result = positions.map(item => ({ ...item }));
  const parentIndex = parent ? positions.indexOf(parent) : -1;
  if (parentIndex >= 0 && !result[parentIndex].id) result[parentIndex].id = uuid();
  const next = { ...position, id: uuid() };
  if (parentIndex >= 0) next.parentId = result[parentIndex].id;
  else delete next.parentId;
  result.push(next);
  return { positions: result, index: result.length - 1 };
}

export function validNestedUpdate(position: ArtifactFragmentWordPosition, positions: ArtifactFragmentWordPosition[], index: number): boolean {
  const previous = positions[index];
  if (!previous) return false;
  if (previous.parentId) {
    const parent = positions.find(item => item.id === previous.parentId);
    if (!parent || position.start < parent.start || position.start + position.length > parent.start + parent.length) return false;
  }
  if (positions.some(item => item.parentId && item.parentId === previous.id &&
    (item.start < position.start || item.start + item.length > position.start + position.length))) return false;
  return !positions.some((item, i) => i !== index && item.parentId === previous.parentId &&
    position.start < item.start + item.length && item.start < position.start + position.length);
}

export function rebasePositions(previous: string, next: string, positions: ArtifactFragmentWordPosition[]): {
  positions: ArtifactFragmentWordPosition[];
  affected: ArtifactFragmentWordPosition[];
} {
  if (previous === next) return { positions: positions.map(position => ({ ...position })), affected: [] };
  let prefix = 0;
  while (prefix < previous.length && prefix < next.length && previous[prefix] === next[prefix]) prefix++;
  let suffix = 0;
  while (suffix < previous.length - prefix && suffix < next.length - prefix &&
    previous[previous.length - 1 - suffix] === next[next.length - 1 - suffix]) suffix++;
  const changedEnd = previous.length - suffix;
  const delta = next.length - previous.length;
  const affected = positions.filter(position =>
    position.start < changedEnd && position.start + position.length > prefix ||
    (prefix === changedEnd && position.start < prefix && position.start + position.length > prefix));
  let count: number;
  do {
    count = affected.length;
    for (const position of positions) {
      if (position.parentId && affected.some(item => item.id === position.parentId) && !affected.includes(position)) {
        affected.push(position);
      }
    }
  } while (affected.length !== count);
  return {
    affected,
    positions: positions.filter(position => !affected.includes(position)).map(position =>
      position.start >= changedEnd ? { ...position, start: position.start + delta } : { ...position })
  };
}
