import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current device is a mobile device based on the user agent.
 * @returns {boolean} True if the device is mobile, false otherwise.
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || (globalThis.window as any).opera;
      // Detailed mobile check (phone/tablet)
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobile(mobileRegex.test(userAgent.toLowerCase()));
    };

    checkMobile();
    
    // Also add a listener for globalThis.window resize as a fallback or for orientation changes
    globalThis.window.addEventListener('resize', checkMobile);
    return () => globalThis.window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};
