export interface LoaderProps {
  /**
   * Main loading text
   * @default "Loading..."
   */
  message?: string;
  /**
   * Secondary description or error message
   */
  description?: string;
  /**
   * If true, shows a progress bar (useful for retry countdowns)
   */
  progress?: number;
  /**
   * Maximum value for the progress bar
   * @default 5
   */
  maxProgress?: number;
  /**
   * Whether the loader should take the full screen height
   * @default true
   */
  fullScreen?: boolean;
  /**
   * Additional classes for the container
   */
  className?: string;
  /**
   * Error message to display (different styling than description)
   */
  error?: string;
  /**
   * Show pulse animation on the text
   * @default true
   */
  animateText?: boolean;
}
