import React, { useState } from 'react';
import { Bell, BellOff, CheckCircle2, Info, Calendar, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import Drawer from '~/shared/components/ui/drawer/Drawer';
import Badge from '~/shared/components/ui/badge/Badge';

interface NotificationListProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
}

const NotificationList: React.FC<NotificationListProps> = ({ isOpen, onClose, token }) => {
  const { notifications, isLoading, unreadCount, markAsRead } = useNotifications(token);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggleExpand = (id: string, isRead: boolean) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      if (!isRead) {
        markAsRead(id);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const showNotification = notifications.length === 0 ? (
    <div className="flex flex-col items-center justify-center h-64 text-muted text-center p-6 space-y-4">
      <div className="p-4 bg-muted-bg rounded-3xl group-hover:scale-110 transition-transform">
        <BellOff size={48} className="opacity-20" />
      </div>
      <div>
        <p className="font-bold text-foreground">No notifications</p>
        <p className="text-sm max-w-[200px] mt-1">You're all caught up! Updates and news will appear here.</p>
      </div>
    </div>
  ) : (
    <div className="divide-y divide-border">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`transition-colors cursor-pointer group ${notification.isRead ? 'bg-transparent' : 'bg-primary/5 hover:bg-primary/10'
            }`}
          onClick={() => handleToggleExpand(notification.id, notification.isRead)}
        >
          <div className="p-4 flex gap-4">
            <div className={`mt-1 h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center ${notification.type === 'GLOBAL' ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'
              }`}>
              {notification.type === 'GLOBAL' ? <Info size={18} /> : <Zap size={18} />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className={`text-sm font-bold truncate ${notification.isRead ? 'text-foreground' : 'text-primary'}`}>
                  {notification.title}
                </h4>
                {!notification.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
                )}
              </div>
              <p className={`text-xs line-clamp-2 leading-relaxed ${expandedId === notification.id ? 'hidden' : 'text-muted'
                }`}>
                {notification.content}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-[10px] text-muted font-medium">
                  <Calendar size={10} />
                  {formatDate(notification.createdAt)}
                </div>
                {notification.type === 'GLOBAL' && (
                  <Badge variant="amber" className="text-[8px] uppercase tracking-widest px-1.5 py-0 border-none shadow-sm shadow-amber-500/10">
                    Global
                  </Badge>
                )}
              </div>
            </div>

            <div className="shrink-0 text-muted mt-1">
              {expandedId === notification.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>

          {expandedId === notification.id && (
            <div className="px-4 pb-6 ml-14 animate-in slide-in-from-top-2 duration-200">
              <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap bg-muted-bg/50 p-4 rounded-2xl border border-border/50">
                {notification.content}
              </div>
              {notification.isRead && notification.readAt && (
                <p className="mt-3 text-[10px] text-muted flex items-center gap-1">
                  <CheckCircle2 size={10} className="text-green-500" />
                  Read on {formatDate(notification.readAt)}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Notifications" side="right">
      <Drawer.Header onClose={onClose}>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-foreground">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="blue" className="px-2 py-0.5 rounded-full text-[10px] h-5 min-w-5">
              {unreadCount}
            </Badge>
          )}
        </div>
      </Drawer.Header>

      <Drawer.Content className="space-y-4 p-0">
        {isLoading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted space-y-2">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm">Loading updates...</p>
          </div>
        ) : showNotification}
      </Drawer.Content>

      <Drawer.Footer className="bg-muted-bg/30">
        <p className="text-[10px] text-muted text-center uppercase tracking-widest font-bold">
          Anonfly Notification System
        </p>
      </Drawer.Footer>
    </Drawer>
  );
};

export default NotificationList;
