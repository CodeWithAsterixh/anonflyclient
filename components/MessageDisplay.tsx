import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck, Lock, Reply, Plus, Smile, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { getUserAvatar, getUserBubbleColors } from '../lib/controllers/colorsProcessors/userAvatar';
import { useIsMobile } from '../hooks/useIsMobile';
import { defaultEmojis, allEmojis, type Emoji } from '../lib/assets/emojis';

interface Message {
  id?: string;
  senderAid: string;
  senderUsername: string;
  content: string;
  timestamp: string;
  type?: 'message' | 'system';
  isEncrypted?: boolean;
  isEdited?: boolean;
  reactions?: {
    userAid: string;
    username: string;
    emojiId: string;
    emojiValue: string;
    emojiType: string;
  }[];
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
  onReact?: (messageId: string, emoji: Emoji) => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
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
const MessageDisplay: React.FC<MessageDisplayProps> = ({ message, onReply, onReact, onEdit, onDelete }) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const isCurrentUser = user && user.userId === message.senderAid;
  const isSystemMessage = message.type === 'system';

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [highlight, setHighlight] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showAllEmojis, setShowAllEmojis] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const reactionsRef = useRef<HTMLDivElement>(null);

  // Check if message is editable (within 10 minutes)
  const isEditable = useMemo(() => {
    if (!isCurrentUser || message.type === 'system') return false;
    const messageTime = new Date(message.timestamp).getTime();
    const currentTime = new Date().getTime();
    return (currentTime - messageTime) < 10 * 60 * 1000;
  }, [message.timestamp, isCurrentUser, message.type]);

  // Close reactions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (reactionsRef.current && !reactionsRef.current.contains(event.target as Node)) {
        setShowReactions(false);
        setShowAllEmojis(false);
      }
    };

    if (showReactions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showReactions]);

  useEffect(() => {
    const handleHighlight = (e: any) => {
      if (e.detail.messageId === message.id) {
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

  const handleEmojiClick = (emoji: Emoji) => {
    if (onReact && message.id) {
      onReact(message.id, emoji);
    }
    setShowReactions(false);
    setShowAllEmojis(false);
  };

  const handleLongPress = () => {
    setShowReactions(true);
  };

  const isReplyToMe = message.replyTo?.userAid === user?.userId || 
                    (message.replyTo?.senderUsername === user?.username && !message.replyTo?.userAid);

  // Minimum swipe distance to trigger reply
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);

    if (isMobile) {
      const timer = setTimeout(handleLongPress, 500);
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
      setShowReactions(false);
      setShowAllEmojis(false);
    }
  };

  const handleEdit = () => {
    if (onEdit && message.id) {
      onEdit(message.id, message.content);
      setShowReactions(false);
      setShowAllEmojis(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && message.id) {
      if (window.confirm('Are you sure you want to delete this message?')) {
        onDelete(message.id);
      }
      setShowReactions(false);
      setShowAllEmojis(false);
    }
  };

  const handleDoubleClick = () => {
    if (!isMobile) {
      handleReply();
    }
  };

  const handleClick = () => {
    if (!isMobile) {
      setShowReactions(true);
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
    <>
      {showReactions && (
        <div className="fixed inset-0 z-[100] backdrop-blur-sm bg-black/10 transition-all duration-300" />
      )}
      <div 
        id={`message-${message.id}`}
        className={`flex items-end gap-2 overflow-x-0 mb-4 relative transition-all duration-500 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} ${highlight ? 'bg-blue-300/50 rounded-lg p-1' : ''} ${showReactions ? 'z-[101] scale-110' : 'z-[1]'}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => {
          setTouchEnd(touchStart !== null ? touchStart - swipeOffset : null);
          handleTouchEnd();
        }}
        onDoubleClick={handleDoubleClick}
        onClick={handleClick}
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
      <div className={`flex-shrink-0 mb-1 transition-opacity duration-300 ${showReactions ? 'opacity-0' : 'opacity-100'}`}>
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
        className={`min-w-[2rem] max-w-[70%] md:max-w-[50%] px-2 py-2 rounded-2xl shadow-sm relative transition-all duration-200 ${
          isCurrentUser
            ? 'rounded-br-none'
            : 'rounded-bl-none'
        } ${showReactions ? 'shadow-2xl ring-4 ring-black/5' : ''}`}
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
          {message.isEdited && (
            <span className="text-[10px] opacity-50 italic">edited</span>
          )}
          <span className="text-[10px] opacity-60 font-medium">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Reactions List */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="absolute -bottom-3 flex flex-wrap gap-1 z-20 px-1">
            {message.reactions.reduce((acc: { emoji: string; count: number; users: string[] }[], curr) => {
              const existing = acc.find(a => a.emoji === curr.emojiValue);
              if (existing) {
                existing.count++;
                existing.users.push(curr.username);
              } else {
                acc.push({ emoji: curr.emojiValue, count: 1, users: [curr.username] });
              }
              return acc;
            }, []).map((reaction, i) => (
              <div 
                key={i}
                title={reaction.users.join(', ')}
                className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-full px-1.5 py-0.5 shadow-sm text-[10px] flex items-center gap-1 hover:scale-110 transition-transform cursor-default"
              >
                <span>{reaction.emoji}</span>
                <span className="font-bold text-gray-600">{reaction.count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Emoji Reaction Picker */}
        {showReactions && (
          <div 
            ref={reactionsRef}
            className={`absolute top-full mt-4 flex flex-col gap-2 z-[102] ${isCurrentUser ? 'right-0' : 'left-0'}`}
          >
            <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-full p-1.5 shadow-2xl flex items-center gap-1 animate-in zoom-in-50 duration-200">
              {defaultEmojis.map((emoji) => (
                <button
                  key={emoji.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEmojiClick(emoji);
                  }}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full text-xl transition-all hover:scale-125 active:scale-90"
                >
                  {emoji.value}
                </button>
              ))}
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllEmojis(!showAllEmojis);
                }}
                className={`w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-all ${showAllEmojis ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {showAllEmojis && (
              <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl p-3 shadow-2xl w-64 grid grid-cols-5 gap-2 animate-in slide-in-from-top-2 duration-200">
                {allEmojis.map((emoji) => (
                  <button
                    key={emoji.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEmojiClick(emoji);
                    }}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl text-xl transition-all hover:scale-110 active:scale-90"
                  >
                    {emoji.value}
                  </button>
                ))}
              </div>
            )}

            {/* Action Menu (Reply, Edit, Delete) */}
            <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl p-1 shadow-2xl min-w-[150px] animate-in slide-in-from-top-2 duration-300">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReply();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-gray-700"
              >
                <Reply className="w-4 h-4" />
                <span className="text-sm font-medium">Reply</span>
              </button>
              
              {isEditable && (
                <>
                  <div className="h-px bg-gray-100 mx-2" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-blue-600"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Edit Message</span>
                  </button>
                  <div className="h-px bg-gray-100 mx-2" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Delete</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default MessageDisplay;
