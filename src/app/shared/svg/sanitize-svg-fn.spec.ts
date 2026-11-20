import { sanitizeSvgFn } from './sanitize-svg-fn';

describe('sanitizeSvgFn', () => {
  function parse(svg: string): SVGSVGElement {
    const container = document.createElement('div');
    container.innerHTML = sanitizeSvgFn(svg);
    const result = container.querySelector('svg');
    if (!result) {
      throw new Error('Expected sanitized SVG.');
    }
    return result;
  }

  it('preserves generated path geometry, dimensions, and paint', () => {
    const result = parse('<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5.16 -16.77 751 645" width="751" height="645" fill="currentColor"><path d="M 21.34 239.67c0.03.75.18.9.39.39z"></path></svg>');
    expect(result.getAttribute('viewBox')).toBe('-5.16 -16.77 751 645');
    expect(result.getAttribute('width')).toBe('751');
    expect(result.getAttribute('fill')).toBe('currentColor');
    expect(result.querySelector('path')?.getAttribute('d')).toBe('M 21.34 239.67c0.03.75.18.9.39.39z');
  });

  it('removes scripts, event handlers, foreign content, animation and external references', () => {
    const result = parse(`<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)">
      <script>alert(1)</script><foreignObject><iframe src="https://example.invalid"></iframe></foreignObject>
      <image href="https://example.invalid/a.png"/><use href="https://example.invalid/a.svg#x"/>
      <animate attributeName="href" values="javascript:alert(1)"/>
      <style>@import url(https://example.invalid/a.css);</style>
      <path d="M0 0" onclick="alert(1)" style="fill:url(https://example.invalid/a)"
        fill="url(https://example.invalid/a)" stroke="url(&#x6a;avascript:alert(1))"
        clip-path="url(https://example.invalid/a)" mask="url(https://example.invalid/a)"/>
    </svg>`);
    expect(result.querySelector('script, foreignObject, iframe, image, use, animate, style')).toBeNull();
    expect(result.hasAttribute('onload')).toBeFalse();
    const path = result.querySelector('path')!;
    for (const name of ['onclick', 'style', 'fill', 'stroke', 'clip-path', 'mask']) {
      expect(path.hasAttribute(name)).withContext(name).toBeFalse();
    }
  });

  it('allows local gradients and clipping without permitting external references', () => {
    const result = parse(`<svg xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="gradient"><stop offset="0" stop-color="#fff"/></linearGradient>
      <clipPath id="clip"><rect width="10" height="10"/></clipPath></defs>
      <path fill="url(#gradient)" clip-path="url(#clip)" d="M0 0h10v10z"/>
    </svg>`);
    expect(result.querySelector('linearGradient stop')?.getAttribute('stop-color')).toBe('#fff');
    expect(result.querySelector('path')?.getAttribute('fill')).toBe('url(#gradient)');
    expect(result.querySelector('path')?.getAttribute('clip-path')).toBe('url(#clip)');
  });

  it('rejects non-SVG and multiple roots, and allows an empty vector', () => {
    expect(sanitizeSvgFn('')).toBe('');
    expect(() => sanitizeSvgFn('<p>not an SVG</p>')).toThrowError();
    expect(() => sanitizeSvgFn('<svg></svg><svg></svg>')).toThrowError();
  });
});
