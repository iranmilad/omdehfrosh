import { useMediaQuery } from '@mantine/hooks';

const MOBILE_BREAKPOINT = '(max-width: 480px)';

export function useSliderPillFontSize() {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
  return isMobile ? '12px' : '16px';
}
