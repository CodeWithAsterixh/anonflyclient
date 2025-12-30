import { useState } from "react";

interface UseSwipeProps {
  isCurrentUser: boolean|null;
  minSwipeDistance: number;
  onReply: () => void;
  isMobile: boolean;
  onLongPress: () => void;
}

export const useSwipe = ({
  isCurrentUser,
  minSwipeDistance,
  onReply,
  isMobile,
  onLongPress,
}: UseSwipeProps) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);

    if (isMobile) {
      const timer = setTimeout(onLongPress, 500);
      setLongPressTimer(timer);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    if (!touchStart) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = currentTouch - touchStart;

    // Only allow swiping in the correct direction based on message ownership
    if (isCurrentUser) {
      // My message: drag left to right (positive diff)
      if (diff > 0) {
        setSwipeOffset(Math.min(diff, 100));
      }
    } else {
      // Other's message: drag right to left (negative diff)
      if (diff < 0) {
        setSwipeOffset(Math.max(diff, -100));
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    if (!touchStart) {
      setSwipeOffset(0);
      return;
    }

    const distance = swipeOffset;

    // For current user: swipe right (positive distance) triggers reply
    // For other user: swipe left (negative distance) triggers reply
    if (isCurrentUser && distance > minSwipeDistance) {
      onReply();
    } else if (!isCurrentUser && distance < -minSwipeDistance) {
      onReply();
    }

    setSwipeOffset(0);
    setTouchStart(null);
  };

  return {
    swipeOffset,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};
