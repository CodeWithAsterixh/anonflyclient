/**
 * @file location.ts
 * @description Helper utility to detect coarse-grained user location (region/country) for sorting rooms.
 */

/**
 * Detects the user's region based on their timezone.
 * This is coarse-grained and maintains anonymity as it only identifies the broad region/country.
 * 
 * @returns {string} The detected region (e.g., "Africa/Lagos" or a mapped country name).
 */
export const getUserRegion = (): string => {
  try {
    // Try to get the timezone name (e.g., "Africa/Lagos", "Europe/London")
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone) return timeZone;

    // Fallback to locale if timezone is not available
    const locale = navigator.language || (navigator as any).userLanguage;
    if (locale) return locale;
  } catch (e) {
    console.warn("Failed to detect user region:", e);
  }
  
  return "Unknown";
};
