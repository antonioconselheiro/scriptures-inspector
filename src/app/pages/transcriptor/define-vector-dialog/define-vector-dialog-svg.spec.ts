import { TestBed } from '@angular/core/testing';
import { DefineVectorDialog } from './define-vector-dialog';

describe('DefineVectorDialog SVG preview', () => {
  it('renders the generated vector after sanitizing it', () => {
    TestBed.configureTestingModule({ imports: [DefineVectorDialog] });

    const fixture = TestBed.createComponent(DefineVectorDialog);
    fixture.componentInstance.tracedSvg =
      '<svg viewBox="0 0 10 10"><path d="M0 0h10v10z" onload="alert(1)"/><script>alert(1)</script></svg>';
    fixture.detectChanges();

    const preview: HTMLElement = fixture.nativeElement.querySelector('.svgWrapper');
    expect(preview.querySelector('svg path')?.getAttribute('d')).toBe('M0 0h10v10z');
    expect(preview.querySelector('path')?.hasAttribute('onload')).toBeFalse();
    expect(preview.querySelector('script')).toBeNull();
  });
});
