# Message Formatting Preview Implementation

This folder contains the implementation for the message formatting preview feature. 
Although the live preview below the input has been disabled in favor of live inline formatting (WhatsApp/Telegram style), the logic and components remain available for future use or alternative display modes.

## Components

### `MessagePreview`
A component that displays a formatted preview of a message. It is currently used for:
- Showing the original message when replying.
- Showing the previous content when editing a message.

### `InlineFormattedInput`
The main input component that provides live inline formatting as the user types.

## How it Works
The formatting logic is handled by the `formatInline` helper in `lib/helpers/markdown.tsx`. It uses regular expressions to identify markdown patterns (bold, italic, etc.) and wraps them in styled React components while preserving the original markdown symbols with low opacity.

## Future Usage
To re-enable a separate preview area for the current input, you can add the `MessagePreview` component back to the `MessageInput` main component:

```tsx
{messageInput && (
  <MessagePreview 
    content={messageInput}
    title="Preview"
    onCancel={() => {}}
  />
)}
```
