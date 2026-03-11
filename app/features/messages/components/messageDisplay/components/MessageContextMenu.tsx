import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Message } from "~/shared/types/chat";
import { Copy, Link as LinkIcon, Search, Square, Scissors, Reply, Edit2, Trash2 } from "lucide-react";

interface MessageContextMenuProps {
  open: boolean;
  position: { top: number; left: number };
  onClose: () => void;
  message: Message;
  isEditable: boolean;
  bubbleRef?: React.RefObject<HTMLElement | null>;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const clampToViewport = (top: number, left: number, width: number, height: number) => {
  const padding = 8;
  const vw = globalThis.window.innerWidth;
  const vh = globalThis.window.innerHeight;
  const clampedLeft = Math.max(padding, Math.min(left, vw - width - padding));
  const clampedTop = Math.max(padding, Math.min(top, vh - height - padding));
  return { top: clampedTop, left: clampedLeft };
};

export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  open,
  position,
  onClose,
  message,
  isEditable,
  bubbleRef,
  onReply,
  onEdit,
  onDelete
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  const selection = globalThis.window.getSelection?.()?.toString() || "";

  const doCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onClose();
    } catch {
      onClose();
    }
  };

  const selectAllInBubble = () => {
    try {
      const el = bubbleRef?.current;
      if (!el) return;
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = globalThis.window.getSelection?.();
      sel?.removeAllRanges();
      sel?.addRange(range);
    } catch {
      // ignore
    }
    onClose();
  };

  const searchSelection = () => {
    if (!selection) return;
    const q = encodeURIComponent(selection.trim().slice(0, 200));
    globalThis.window.open(`https://www.google.com/search?q=${q}`, "_blank", "noopener,noreferrer");
    onClose();
  };

  const copyLink = async () => {
    const base = globalThis.window.location.origin + globalThis.window.location.pathname;
    const link = `${base}#message-${message.id}`;
    await doCopy(link);
  };

  const menuWidth = 320;
  const menuHeight = 260;
  const p = clampToViewport(position.top, position.left, menuWidth, menuHeight);

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      aria-label="Message menu"
      className="fixed z-1000 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-2xl w-[320px] overflow-hidden"
      style={{ top: p.top, left: p.left }}
    >
      {/* Preview */}
      <div className="px-4 py-3 border-b border-border">
        <div className="text-[11px] uppercase tracking-wide opacity-60">
          {message.senderUsername} • {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
        <div className="mt-1 text-sm line-clamp-3 whitespace-pre-wrap wrap-break-word opacity-90">
          {typeof message.content === "string" ? message.content : ""}
        </div>
      </div>

      <div className="py-1">
        <button
          onClick={() => doCopy(typeof message.content === "string" ? message.content : "")}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors text-left"
        >
          <Copy className="w-4 h-4" />
          <span className="text-sm">Copy</span>
        </button>
        <button
          disabled={!selection}
          onClick={() => selection && doCopy(selection)}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors text-left disabled:opacity-50"
        >
          <Scissors className="w-4 h-4" />
          <span className="text-sm">Copy selected</span>
        </button>
        <button
          onClick={selectAllInBubble}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors text-left"
        >
          <Square className="w-4 h-4" />
          <span className="text-sm">Select all</span>
        </button>
        <button
          disabled={!selection}
          onClick={searchSelection}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors text-left disabled:opacity-50"
        >
          <Search className="w-4 h-4" />
          <span className="text-sm">Search “{selection ? (selection.length > 24 ? selection.slice(0, 24) + "…" : selection) : ""}”</span>
        </button>
        <button
          onClick={copyLink}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors text-left"
        >
          <LinkIcon className="w-4 h-4" />
          <span className="text-sm">Copy link to message</span>
        </button>
        <div className="h-px bg-border my-1" />
        <button
          onClick={() => { onReply?.(); }}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors text-left"
        >
          <Reply className="w-4 h-4" />
          <span className="text-sm">Reply</span>
        </button>
        {isEditable && (
          <>
            <button
              onClick={() => { onEdit?.(); }}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors text-left"
            >
              <Edit2 className="w-4 h-4" />
              <span className="text-sm">Edit</span>
            </button>
            <button
              onClick={() => { onDelete?.(); }}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors text-left text-destructive"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">Delete</span>
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default MessageContextMenu;
