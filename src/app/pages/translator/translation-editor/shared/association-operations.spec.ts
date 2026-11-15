import { applyAssociationOperation, AssociationAdapter } from './association-operations';

describe('association operations', () => {
  let values: string[];
  let adapter: AssociationAdapter<number>;
  let write: jasmine.Spy;

  beforeEach(() => {
    values = ['a', 'b', 'c'];
    write = jasmine.createSpy('write').and.callFake((index: number, value: string) => {
      values[index] = value;
    });
    adapter = { entries: [0, 1, 2], read: index => values[index], write };
  });

  it('moves a snapshot of the associations, using the clicked value when supplied', () => {
    expect(applyAssociationOperation(adapter, { kind: 'move', selectedValue: '' })).toBeTrue();
    expect(values).toEqual(['', 'a', 'b']);
    expect(write.calls.count()).toBe(3);
  });

  it('returns associations and clears the final one', () => {
    expect(applyAssociationOperation(adapter, { kind: 'return' })).toBeTrue();
    expect(values).toEqual(['b', 'c', '']);
  });

  it('fills from the selected origin and asks before overwriting', () => {
    const confirmOverwrite = jasmine.createSpy('confirmOverwrite').and.returnValue(false);
    const operation = {
      kind: 'fill' as const,
      selectedValue: 'b',
      originValues: ['a', 'b', 'c'],
      fallbackPosition: 0,
      confirmOverwrite
    };
    expect(applyAssociationOperation(adapter, operation)).toBeFalse();
    expect(values).toEqual(['a', 'b', 'c']);
    expect(write).not.toHaveBeenCalled();
    confirmOverwrite.and.returnValue(true);
    expect(applyAssociationOperation(adapter, operation)).toBeTrue();
    expect(values).toEqual(['b', 'c', '']);
  });

  it('uses the fallback position for empty or unmatched selections', () => {
    values = ['', '', ''];
    const confirmOverwrite = jasmine.createSpy('confirmOverwrite');
    expect(applyAssociationOperation(adapter, {
      kind: 'fill', originValues: ['a', 'b'], fallbackPosition: 1, confirmOverwrite
    })).toBeTrue();
    expect(values).toEqual(['b', '', '']);
    expect(confirmOverwrite).not.toHaveBeenCalled();
  });

  it('does not write or ask for confirmation when there are no entries', () => {
    const confirmOverwrite = jasmine.createSpy('confirmOverwrite');
    adapter.entries = [];
    expect(applyAssociationOperation(adapter, {
      kind: 'fill', originValues: [], fallbackPosition: 0, confirmOverwrite
    })).toBeFalse();
    expect(write).not.toHaveBeenCalled();
    expect(confirmOverwrite).not.toHaveBeenCalled();
  });
});
