import { useEffect, useState } from 'react';
import { DEFAULT_SLIDER_PLACEHOLDER, normalizeImageUrl } from './sliderImageUtils';

const PILL_SIZE = 24;

export default function SliderPillImage({ image, alt = '', size = PILL_SIZE }) {
  const imageUrl = normalizeImageUrl(image);
  const [displaySrc, setDisplaySrc] = useState(DEFAULT_SLIDER_PLACEHOLDER);

  useEffect(() => {
    setDisplaySrc(DEFAULT_SLIDER_PLACEHOLDER);

    if (!imageUrl) {
      return undefined;
    }

    let cancelled = false;
    const loader = new Image();

    loader.onload = () => {
      if (!cancelled) {
        setDisplaySrc(imageUrl);
      }
    };

    loader.onerror = () => {
      if (!cancelled) {
        setDisplaySrc(DEFAULT_SLIDER_PLACEHOLDER);
      }
    };

    loader.src = imageUrl;

    return () => {
      cancelled = true;
      loader.onload = null;
      loader.onerror = null;
    };
  }, [imageUrl]);

  return (
    <div
      className="rounded-full overflow-hidden flex-shrink-0"
      style={{
        width: size,
        height: size,
        lineHeight: 0,
        marginRight: 0,
      }}
    >
      <img
        className="w-full inline-block"
        style={{
          objectFit: 'cover',
          display: 'block',
          width: size,
          height: size,
          marginRight: 0,
        }}
        src={displaySrc}
        alt={alt}
        width={size}
        height={size}
      />
    </div>
  );
}
