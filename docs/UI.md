# UI & Theming Module

Anonfly's UI is built with React and Tailwind CSS, focusing on accessibility, responsiveness, and customization.

## Theming

The application supports a system-aware light and dark mode.
- **Persistence**: The theme is stored in a cookie (`theme=dark/light`) and `localStorage`.
- **Initialization**: To prevent "theme flash" on page load, a small inline script in [root.tsx](file:///c:/Users/Asterixh/Desktop/Anonfly-chat-app/anonflyclient/app/root.tsx) applies the correct CSS class before the React app hydrates.
- **Provider**: The `ThemeProvider` in [useTheme/index.tsx](file:///c:/Users/Asterixh/Desktop/Anonfly-chat-app/anonflyclient/hooks/useTheme/index.tsx) manages the theme state globally.

## Component Library

The UI is built using a custom component library located in `anonflyclient/components/ui/`.

### Core Components
- **Avatar**: Deterministically generates accessible color pairs for user profile pictures based on their AID.
- **Input**: A collection of styled form elements (text, password, textarea) with built-in validation support.
- **Loader**: Various loading indicators used throughout the app.
- **Drawer / Modal**: Accessible overlay components for settings, account management, and room creation.

## Accessibility (WCAG 2.1)

A significant effort is made to ensure the UI is accessible:
- **Contrast**: The [colorProcessing.ts](file:///c:/Users/Asterixh/Desktop/Anonfly-chat-app/anonflyclient/lib/controllers/colorsProcessors/colorProcessing.ts) utility calculates relative luminance and contrast ratios to ensure text is readable against any background.
- **Responsive**: The `useIsMobile` hook and Tailwind's responsive classes ensure a seamless experience across mobile, tablet, and desktop devices.

## Layouts

The application uses a nested layout structure:
- **Root Layout**: Provides the HTML skeleton and global providers.
- **Chat Layout**: Manages the sidebar and main content area for the chat experience.

Implementation: [ChatLayoutContext.tsx](file:///c:/Users/Asterixh/Desktop/Anonfly-chat-app/anonflyclient/app/contexts/ChatLayoutContext.tsx).
