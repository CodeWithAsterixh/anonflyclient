import React, { useMemo, useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck, Lock, Reply } from 'lucide-react';
import { getUserAvatar, getUserBubbleColors } from '../lib/controllers/colorsProcessors/userAvatar';
import { useIsMobile } from '../hooks/useIsMobile';

interface Message {
  id?: string;
  senderAid: string;
  senderUsername: string;
  content: string;
  timestamp: string;
  type?: 'message' | 'system';
  isEncrypted?: boolean;
  replyTo?: {
    messageId: string;
    senderUsername: string;
    content: string;
    userAid?: string;
  };
}

interface MessageDisplayProps {
  message: Message;
  onReply?: (replyInfo: { messageId: string; senderUsername: string; content: string; senderAid: string }) => void;
}

/**
 * MessageDisplay component is a presentational component for displaying a single chat message.
 * It styles messages differently based on whether the current user is the sender.
 * System messages (like user join notifications) are displayed as centered notifications.
 *
 * @param {MessageDisplayProps} props The props for the component.
 * @param {Message} props.message The message object to display.
 * @returns {React.FC} A React functional component.
 */
const MessageDisplay: React.FC<MessageDisplayProps> = ({ message, onReply }) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const isCurrentUser = user && user.userId === message.senderAid;
  const isSystemMessage = message.type === 'system';

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [highlight, setHighlight] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Effect to handle highlighting
  React.useEffect(() => {
    const handleHighlight = (e: CustomEvent<{ messageId: string }>) => {
      if (message.id === e.detail.messageId) {
        setHighlight(true);
        setTimeout(() => setHighlight(false), 2000);
      }
    };

    window.addEventListener('highlight-message' as any, handleHighlight);
    return () => window.removeEventListener('highlight-message' as any, handleHighlight);
  }, [message.id]);

  const scrollToRepliedMessage = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Dispatch event to highlight the message
      window.dispatchEvent(new CustomEvent('highlight-message', { detail: { messageId } }));
    }
  };

  const isReplyToMe = message.replyTo?.userAid === user?.userId || 
                    (message.replyTo?.senderUsername === user?.username && !message.replyTo?.userAid);

  // Minimum swipe distance to trigger reply
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
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
    if (!touchStart || !touchEnd) {
      setSwipeOffset(0);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isCurrentUser && isRightSwipe) {
      handleReply();
    } else if (!isCurrentUser && isLeftSwipe) {
      handleReply();
    }
    
    setSwipeOffset(0);
  };

  const handleReply = () => {
    if (onReply && message.id) {
      onReply({
        messageId: message.id,
        senderUsername: message.senderUsername,
        content: message.content,
        senderAid: message.senderAid,
      });
    }
  };

  const handleDoubleClick = () => {
    if (!isMobile) {
      handleReply();
    }
  };

  const avatarUrl = useMemo(() => 
    getUserAvatar(message.senderUsername, message.senderAid, 32),
    [message.senderUsername, message.senderAid]
  );

  const bubbleColors = useMemo(() => 
    getUserBubbleColors(message.senderAid),
    [message.senderAid]
  );

  // Render system messages (like user join notifications)
  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm italic">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div 
      id={`message-${message.id}`}
      className={`flex items-end gap-2 overflow-x-0 mb-4 relative transition-all duration-300 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} ${highlight ? 'bg-blue-300/50 rounded-lg p-1' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => {
        setTouchEnd(touchStart !== null ? touchStart - swipeOffset : null);
        handleTouchEnd();
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Reply Icon Indicator while swiping */}
      <div 
        className={`absolute top-1/2 -translate-y-1/2 transition-opacity duration-200 ${
          Math.abs(swipeOffset) > 20 ? 'opacity-100' : 'opacity-0'
        } ${isCurrentUser ? 'left-4' : 'right-4'}`}
      >
        <Reply className="w-5 h-5 text-gray-400" />
      </div>

      {/* Avatar */}
      <div className="flex-shrink-0 mb-1">
        <img 
          src={avatarUrl} 
          alt={message.senderUsername} 
          className="w-8 h-8 rounded-full shadow-sm border border-gray-100"
        />
      </div>

      <div
        ref={bubbleRef}
        style={{ 
          backgroundColor: bubbleColors.primary,
          color: bubbleColors.text,
          transform: `translateX(${swipeOffset}px)`
        }}
        className={`min-w-[2rem] max-w-[70%] md:max-w-[50%] px-2 py-2 rounded-2xl shadow-sm relative ${
          isCurrentUser
            ? 'rounded-br-none'
            : 'rounded-bl-none'
        }`}
      >
        {/* Reply Preview in Bubble */}
        {message.replyTo && (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              scrollToRepliedMessage(message.replyTo!.messageId);
            }}
            className="mb-2 p-2 rounded-lg bg-black/5 border-l-4 border-black/20 text-xs cursor-pointer hover:bg-black/10 transition-colors"
          >
            <p className="font-bold opacity-70 truncate">
              {isReplyToMe ? 'You' : (message.replyTo.senderUsername || 'Anonymous')}
            </p>
            <p className="opacity-60 line-clamp-2 italic">{message.replyTo.content}</p>
          </div>
        )}

        {!isCurrentUser && (
          <div className="flex items-center justify-between mb-1 gap-2 px-2">
            <p className="font-bold text-xs truncate" style={{ color: bubbleColors.text }}>
              {message.senderUsername}
            </p>
            {message.isEncrypted && (
              <ShieldCheck className="w-3 h-3 opacity-70" />
            )}
          </div>
        )}
        

        <p className="break-words text-sm md:text-base whitespace-pre-wrap px-2">{message.content}</p>
        
        <div className="flex items-center justify-end mt-1 gap-3 px-2">
          <span className="text-[10px] opacity-60 font-medium">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageDisplay;
