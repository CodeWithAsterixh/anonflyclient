export interface Emoji {
  id: string;
  value: string; // This can be a unicode emoji, or a URL to an image/SVG/GIF
  type: 'unicode' | 'image' | 'svg' | 'gif';
}

export const defaultEmojis: Emoji[] = [
  { id: 'thumbs_up', value: '👍', type: 'unicode' },
  { id: 'heart', value: '❤️', type: 'unicode' },
  { id: 'laughing', value: '😂', type: 'unicode' },
  { id: 'wow', value: '😮', type: 'unicode' },
  { id: 'sad', value: '😢', type: 'unicode' },
  { id: 'fire', value: '🔥', type: 'unicode' },
];

export const allEmojis: Emoji[] = [
  ...defaultEmojis,
  { id: 'clapping', value: '👏', type: 'unicode' },
  { id: 'party', value: '🎉', type: 'unicode' },
  { id: 'pray', value: '🙏', type: 'unicode' },
  { id: 'eyes', value: '👀', type: 'unicode' },
  { id: 'rocket', value: '🚀', type: 'unicode' },
  { id: '100', value: '💯', type: 'unicode' },
  { id: 'star', value: '⭐', type: 'unicode' },
  { id: 'check', value: '✅', type: 'unicode' },
  { id: 'smile', value: '😊', type: 'unicode' },
  { id: 'thinking', value: '🤔', type: 'unicode' },
];
