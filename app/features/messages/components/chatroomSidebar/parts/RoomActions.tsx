import { Check, LogOut, Settings2, Share2, Trash2 } from 'lucide-react';
import React from 'react';

interface RoomActionsProps {
  isHost: boolean;
  onLeaveRoom: () => void;
  onEditRoom: () => void;
  onDeleteRoom: () => void;
  onGenerateShareLink: () => Promise<any>;
}

const RoomActions: React.FC<RoomActionsProps> = ({
  isHost,
  onLeaveRoom,
  onEditRoom,
  onDeleteRoom,
  onGenerateShareLink,
}) => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [showCopied, setShowCopied] = React.useState(false);
  const [expiresAt, setExpiresAt] = React.useState<number | null>(null);

  const handleShare = async () => {
    try {
      setIsGenerating(true);
      const data = await onGenerateShareLink();
      if (data?.expiresAt) {
        setExpiresAt(data.expiresAt);
      }
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error("Failed to generate share link:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatExpiry = (timestamp: number) => {
    const diff = timestamp - Date.now();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getShareButtonContent = () => {
    if (showCopied) {
      return (
        <>
          <Check size={16} />
          <span>Copied!</span>
        </>
      );
    }
    
    if (isGenerating) {
      return (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Generating...</span>
        </>
      );
    }

    return (
      <>
        <Share2 size={16} />
        <span>Share Access Link</span>
      </>
    );
  };

  return (
    <div className="p-4 space-y-2">
      <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
        Quick Actions
      </h3>
      
      <div className="grid grid-cols-1 gap-2">
        {isHost && (
          <div className="space-y-1">
            <button
              onClick={handleShare}
              disabled={isGenerating}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-xl transition-all disabled:opacity-50"
            >
              {getShareButtonContent()}
            </button>
            {expiresAt && (
              <p className="text-[10px] text-muted px-3 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-amber-400" />
                Link expires in {formatExpiry(expiresAt)}
              </p>
            )}
          </div>
        )}

        <button
          onClick={onLeaveRoom}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-all"
        >
          <LogOut size={16} />
          <span>Leave Room</span>
        </button>

        {isHost && (
          <>
            <button
              onClick={onEditRoom}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-foreground hover:bg-white/5 rounded-xl transition-all"
            >
              <Settings2 size={16} />
              <span>Room Settings</span>
            </button>
            <button
              onClick={onDeleteRoom}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-all"
            >
              <Trash2 size={16} />
              <span>Delete Room</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RoomActions;
