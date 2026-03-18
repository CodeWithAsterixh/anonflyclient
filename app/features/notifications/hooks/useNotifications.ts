import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '~/features/auth/state/auth-store';
import { getNotifications, markNotificationAsRead, type Notification } from '~/shared/utils/controllers/notificationController';

export const useNotifications = () => {
    const { token } = useAuthStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await getNotifications(token);
            setNotifications(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    const markAsRead = useCallback(async (id: string) => {
        if (!token) return;
        try {
            await markNotificationAsRead(token, id);
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
            ));
        } catch (err: any) {
            console.error('Failed to mark notification as read:', err);
        }
    }, [token]);

    const unreadCount = useMemo(() =>
        notifications.filter(n => !n.isRead).length
        , [notifications]);

    useEffect(() => {
        fetchNotifications();
        // Setup polling every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    return {
        notifications,
        isLoading,
        error,
        unreadCount,
        refetch: fetchNotifications,
        markAsRead
    };
};
