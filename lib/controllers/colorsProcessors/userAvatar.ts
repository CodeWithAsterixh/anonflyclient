import { createColorSwatchDataUrl } from "./color_swatch";
import { generateAccessibleColorPair } from "./colorGenerator";

/**
 * Generates a deterministic color based on a user's unique ID (userAid).
 * Uses a simple hash to ensure the same user always gets the same color.
 */
export function getUserColor(userAid: string): string {
  let hash = 0;
  for (let i = 0; i < userAid.length; i++) {
    hash = userAid.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert hash to a color using HSL for better distribution
  const h = Math.abs(hash % 360);
  const s = 60 + (Math.abs(hash % 20)); // 60-80% saturation
  const l = 40 + (Math.abs(hash % 20)); // 40-60% lightness
  
  return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * Gets the first letter of a username. If the first character isn't a letter,
 * it searches for the first available letter.
 */
export function getUsernameInitial(username: string): string {
  const match = username.match(/[a-zA-Z]/);
  return match ? match[0].toUpperCase() : (username[0]?.toUpperCase() || "?");
}

/**
 * Generates an avatar data URL for a user.
 */
export function getUserAvatar(username: string, userAid: string, size: number = 40): string {
  const bgColor = getUserColor(userAid);
  const initial = getUsernameInitial(username);
  
  // Generate accessible text color for the initial
  const { text: textColor } = generateAccessibleColorPair({ primary: bgColor });
  
  return createColorSwatchDataUrl(bgColor, size, size / 2, initial, textColor);
}

/**
 * Generates a pair of accessible colors for a user's chat bubble.
 */
export function getUserBubbleColors(userAid: string): { primary: string; text: string } {
  const bgColor = getUserColor(userAid);
  return generateAccessibleColorPair({ primary: bgColor });
}
