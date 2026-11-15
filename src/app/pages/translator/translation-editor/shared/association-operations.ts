export interface AssociationAdapter<T> {
  entries: readonly T[];
  read: (entry: T) => string;
  write: (entry: T, value: string) => void;
}

export type AssociationOperation =
  | { kind: 'move'; selectedValue?: string }
  | { kind: 'return' }
  | {
    kind: 'fill';
    selectedValue?: string;
    originValues: readonly string[];
    fallbackPosition: number;
    confirmOverwrite: () => boolean;
  };

export function applyAssociationOperation<T>(
  adapter: AssociationAdapter<T>,
  operation: AssociationOperation
): boolean {
  const values = adapter.entries.map(entry => adapter.read(entry));
  if (!values.length) {
    return false;
  }

  let updatedValues: string[];
  if (operation.kind === 'move') {
    updatedValues = [operation.selectedValue ?? values[0], ...values.slice(0, -1)];
  } else if (operation.kind === 'return') {
    updatedValues = [...values.slice(1), ''];
  } else {
    const selectedPosition = operation.originValues.indexOf(operation.selectedValue ?? values[0]);
    const start = selectedPosition < 0 ? operation.fallbackPosition : selectedPosition;
    updatedValues = values.map((_, index) => operation.originValues[start + index] || '');
    if (values.some((value, index) => value && value !== updatedValues[index])
      && !operation.confirmOverwrite()) {
      return false;
    }
  }

  adapter.entries.forEach((entry, index) => adapter.write(entry, updatedValues[index]));
  return true;
}
