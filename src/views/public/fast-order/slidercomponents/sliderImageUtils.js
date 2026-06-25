export const DEFAULT_SLIDER_PLACEHOLDER =
  'data:image/svg+xml;base64,' +
  btoa(`
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="20" fill="#F8F9FA"/>
  <rect x="10" y="10" width="20" height="20" rx="2" fill="#E9ECEF" stroke="#ADB5BD" stroke-width="1"/>
  <rect x="13" y="13" width="6" height="6" rx="1" fill="#9CA3AF"/>
  <rect x="21" y="13" width="6" height="6" rx="1" fill="#9CA3AF"/>
  <rect x="13" y="21" width="6" height="6" rx="1" fill="#9CA3AF"/>
  <rect x="21" y="21" width="6" height="6" rx="1" fill="#9CA3AF"/>
</svg>
`);

const INVALID_STRINGS = new Set(['', 'null', 'undefined', '[]']);

export function normalizeImageUrl(imageValue) {
  if (imageValue == null) return null;

  if (Array.isArray(imageValue)) {
    const found = imageValue.find(
      (img) =>
        typeof img === 'string' &&
        !INVALID_STRINGS.has(img.trim()) &&
        img.trim() !== ''
    );
    return found ? found.trim() : null;
  }

  if (typeof imageValue === 'string') {
    const trimmed = imageValue.trim();
    if (INVALID_STRINGS.has(trimmed)) return null;
    return trimmed;
  }

  return null;
}
