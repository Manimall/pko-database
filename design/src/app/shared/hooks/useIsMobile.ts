import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 768;
const TABLET_MAX = 1150;

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}

export function useIsTablet(): boolean {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_MAX}px)`);
    const onChange = () => setIsTablet(mql.matches);
    mql.addEventListener('change', onChange);
    setIsTablet(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isTablet;
}
