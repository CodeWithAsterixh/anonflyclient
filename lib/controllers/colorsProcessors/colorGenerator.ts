type ColorPairInput = {
  primary?: string
  text?: string
}

type ColorPairOutput = {
  primary: string
  text: string
}

/**
 * Generate a well-contrasted color pair (primary and text) meeting WCAG standards.
 */
const hexToRgb = (hex: string): [number, number, number] => {
  hex = hex.replace(/^#/, '')
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const num = Number.parseInt(hex, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

const parseColor = (color: string): [number, number, number] => {
  if (color.startsWith('#')) return hexToRgb(color)

  const match = color.match(/\d+(\.\d+)?/g)?.map(Number)
  if (!match || match.length < 3) return [0, 0, 0]
  return [match[0], match[1], match[2]]
}

const getRandomColor = (): string => {
  const r = Math.floor(Math.random() * 256)
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)
  return `rgb(${r},${g},${b})`
}

const getLuminance = (r: number, g: number, b: number): number => {
  const a = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]
}

const contrastRatio = (
  rgb1: [number, number, number],
  rgb2: [number, number, number],
): number => {
  const L1 = getLuminance(...rgb1)
  const L2 = getLuminance(...rgb2)
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
}

const BLACK: [number, number, number] = [0, 0, 0]
const WHITE: [number, number, number] = [255, 255, 255]

const isReadable = (fg: [number, number, number], bg: [number, number, number]) =>
  contrastRatio(fg, bg) >= 4.5

/**
 * Finds a random accessible primary color for a given text color.
 */
const findAccessiblePrimary = (textRgb: [number, number, number]): string => {
  while (true) {
    const rand = getRandomColor()
    if (isReadable(textRgb, parseColor(rand))) return rand
  }
}

/**
 * Generates a random accessible color pair.
 */
const generateRandomPair = (): ColorPairOutput => {
  while (true) {
    const rand = getRandomColor()
    const rParsed = parseColor(rand)
    if (isReadable(BLACK, rParsed)) return {primary: rand, text: '#000000'}
    if (isReadable(WHITE, rParsed)) return {primary: rand, text: '#FFFFFF'}
  }
}

/**
 * Generate a well-contrasted color pair (primary and text) meeting WCAG standards.
 */
export function generateAccessibleColorPair({primary, text}: ColorPairInput = {}): ColorPairOutput {
  // --- CASE: Both provided, ensure readability ---
  if (primary && text) {
    if (isReadable(parseColor(text), parseColor(primary))) return {primary, text}
    throw new Error('Provided primary and text colors do not meet WCAG contrast requirements.')
  }

  // --- CASE: Only primary provided ---
  if (primary) {
    const t = isReadable(BLACK, parseColor(primary)) ? '#000000' : '#FFFFFF'
    return {primary, text: t}
  }

  // --- CASE: Only text provided ---
  if (text) {
    return {primary: findAccessiblePrimary(parseColor(text)), text}
  }

  // --- CASE: None provided ---
  return generateRandomPair()
}
