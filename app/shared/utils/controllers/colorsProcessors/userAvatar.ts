import { createColorSwatchDataUrl } from "./color_swatch";

/**
 * Generates a deterministic color based on a user's unique ID (userAid).
 * Uses a simple hash to ensure the same user always gets the same color.
 */
export function getUserColor(userAid: string): string {
  let hash = 0;
  for (let i = 0; i < userAid.length; i++) {
    hash = (userAid.codePointAt(i) || 0) + ((hash << 5) - hash);
  }
  
  // Convert hash to a color using HSL
  // We want colors that are dark enough for white text to pass WCAG 2.1
  // Lightness (L) is capped at 45% to ensure contrast with white text
  const h = Math.abs(hash % 360);
  const s = 65 + (Math.abs(hash % 15)); // 65-80% saturation for vibrancy
  const l = 30 + (Math.abs(hash % 15)); // 30-45% lightness (darker range)
  
  return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * Gets the first letter of a username. If the first character isn't a letter,
 * it searches for the first available letter.
 */
export function getUsernameInitial(username: string): string {
  const match = new RegExp(/[a-zA-Z]/).exec(username);
  return match ? match[0].toUpperCase() : (username[0]?.toUpperCase() || "?");
}

/**
 * Generates an avatar data URL for a user.
 */
export function getUserAvatar(username: string, userAid: string, size: number = 40): string {
  const bgColor = getUserColor(userAid);
  const initial = getUsernameInitial(username);
  
  // Primary text color is white as per user request
  const textColor = "#FFFFFF";
  
  return createColorSwatchDataUrl(bgColor, size, size / 2, initial, textColor);
}

/**
 * Generates a pair of accessible colors for a user's chat bubble.
 */
export function getUserBubbleColors(userAid: string): { primary: string; text: string } {
  const bgColor = getUserColor(userAid);
  return { primary: bgColor, text: "#FFFFFF" };
}
