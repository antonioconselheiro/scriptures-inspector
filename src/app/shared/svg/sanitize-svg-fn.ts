import DOMPurify from 'dompurify';

const svgNamespace = 'http://www.w3.org/2000/svg';
const paintAttributes = new Set(['fill', 'stroke', 'stop-color']);
const paintValue = /^(?:none|currentcolor|transparent|[a-z]+|#[\da-f]{3,8}|(?:rgb|rgba|hsl|hsla)\([\d\s.,%+-]+\)|url\(#[a-z_][\w.-]*\))$/i;
const localReference = /^(?:none|url\(#[a-z_][\w.-]*\))$/i;

export function sanitizeSvgFn(svg: string): string {
  if (!svg.trim()) {
    return '';
  }
  if (!DOMPurify.isSupported) {
    throw new Error('SVG sanitization is not supported in this environment.');
  }

  const fragment = DOMPurify.sanitize(svg, {
    RETURN_DOM_FRAGMENT: true,
    ALLOWED_TAGS: [
      'svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
      'defs', 'linearGradient', 'radialGradient', 'stop', 'clipPath', 'mask', 'title', 'desc'
    ],
    ALLOWED_ATTR: [
      'xmlns', 'viewBox', 'width', 'height', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
      'cx', 'cy', 'r', 'rx', 'ry', 'd', 'points', 'transform', 'fill', 'fill-rule',
      'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-linecap',
      'stroke-linejoin', 'stroke-miterlimit', 'stroke-dasharray', 'stroke-dashoffset',
      'opacity', 'id', 'gradientUnits', 'gradientTransform', 'offset', 'stop-color',
      'stop-opacity', 'clip-path', 'clip-rule', 'clipPathUnits', 'mask', 'maskUnits',
      'maskContentUnits', 'preserveAspectRatio', 'vector-effect'
    ],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  });

  const roots = Array.from(fragment.childNodes).filter(node =>
    node.nodeType !== Node.TEXT_NODE || node.textContent?.trim()
  );
  if (roots.length !== 1 || !(roots[0] instanceof Element)
    || roots[0].localName !== 'svg' || roots[0].namespaceURI !== svgNamespace) {
    throw new Error('Expected a single SVG root element.');
  }

  const root = roots[0];
  for (const element of [root, ...Array.from(root.querySelectorAll('*'))]) {
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim();
      if ((paintAttributes.has(name) && !paintValue.test(value))
        || ((name === 'clip-path' || name === 'mask') && !localReference.test(value))) {
        element.removeAttributeNode(attribute);
      }
    }
  }
  return root.outerHTML;
}
