import { TestBed } from '@angular/core/testing';
import { ArtifactTextEditorComponent } from './artifact-text-editor-component';

describe('ArtifactTextEditorComponent', () => {
  it('renders persisted fragments and supports selection and rotation', () => {
    const fixture = TestBed.createComponent(ArtifactTextEditorComponent);
    fixture.componentRef.setInput('text', 'First second');
    fixture.componentRef.setInput('fragments', [
      { start: 0, length: 5, x: 12, y: 34, flip: 0 },
      { start: 6, length: 6, x: 56, y: 78, flip: 15 },
    ]);
    fixture.detectChanges();
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const fragments: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.artifact-fragment');
    expect(fragments.length).toBe(2);
    expect(fragments[0].textContent?.trim()).toBe('First');
    expect(fragments[1].textContent?.trim()).toBe('second');
    expect(fragments[0].style.left).toBe('12px');
    expect(fragments[0].style.top).toBe('34px');
    expect(fragments[1].style.transform).toBe('rotate(15deg)');

    fragments[0].click();
    fixture.detectChanges();
    expect(fragments[0].classList.contains('selected')).toBeTrue();

    const emit = spyOn(fixture.componentInstance.fragmentsChange, 'emit');
    fixture.componentInstance.rotateSelected(30);
    fixture.detectChanges();
    expect(fragments[0].style.transform).toBe('rotate(30deg)');
    expect(emit).toHaveBeenCalledWith([
      { start: 0, length: 5, x: 12, y: 34, flip: 30 },
      { start: 6, length: 6, x: 56, y: 78, flip: 15 },
    ]);

    (fixture.nativeElement.querySelector('.artifact-canvas') as HTMLElement).click();
    fixture.detectChanges();
    expect(fragments[0].classList.contains('selected')).toBeFalse();
  });
});
