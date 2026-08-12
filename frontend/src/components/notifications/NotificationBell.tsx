import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';
import { getSocketInstance } from '../../lib/socket';
import { useAuthStore } from '../../stores/authStore';

export interface NotificationItemData {
  id: string;
  type: string;
  title: string;
  body: string;
  actionUrl?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuthStore();

  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<NotificationItemData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCountAndRecent = async () => {
    if (!isAuthenticated) return;
    try {
      const [countRes, listRes]: any = await Promise.all([
        apiClient.get('/notifications/unread-count'),
        apiClient.get('/notifications?limit=5'),
      ]);
      setUnreadCount(countRes.data.count || 0);
      setRecentNotifications(listRes.data.notifications || []);
    } catch (e) {
      // Ignore
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchUnreadCountAndRecent();
    const interval = setInterval(fetchUnreadCountAndRecent, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchUnreadCountAndRecent();
    }
  }, [isOpen, isAuthenticated]);

  // Real-time WebSocket Listeners
  useEffect(() => {
    if (!token || !isAuthenticated) return;

    const socket = getSocketInstance(token);
    if (!socket) return;

    const handleUnreadUpdate = (data: { count: number }) => {
      setUnreadCount(data.count);
    };

    const handleNewNotification = (data: { notification: NotificationItemData; unreadCount: number }) => {
      setUnreadCount(data.unreadCount);
      fetchUnreadCountAndRecent();
    };

    socket.on('unread_count:update', handleUnreadUpdate);
    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('unread_count:update', handleUnreadUpdate);
      socket.off('notification:new', handleNewNotification);
    };
  }, [token, isAuthenticated]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await apiClient.post('/notifications/read-all');
      setUnreadCount(0);
      setRecentNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
    } catch (e) {
      // Ignore
    }
  };

  const handleNotificationClick = async (notif: NotificationItemData) => {
    if (!notif.readAt) {
      try {
        await apiClient.patch(`/notifications/${notif.id}/read`);
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (e) {
        // Ignore
      }
    }
    setIsOpen(false);
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#E7DED1] border border-[#D6C8B8] text-[#3B2A22] hover:border-[#C8A46A] transition-all"
        aria-label="Notifications"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 badge-count font-extrabold">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-80 bg-[#EDE5D9] border border-[#D6C8B8] rounded-[24px] shadow-2xl overflow-hidden z-50 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#D6C8B8]">
            <span className="font-heading font-medium text-base text-[#3B2A22]">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="font-sans text-[10px] tracking-wider uppercase font-semibold text-[#8B7562] hover:text-[#3B2A22] transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#D6C8B8]">
            {recentNotifications.length === 0 ? (
              <div className="p-6 text-center text-xs font-sans text-[#8B7562]">
                No recent notifications.
              </div>
            ) : (
              recentNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 transition-colors cursor-pointer text-xs font-sans ${
                    !notif.readAt ? 'bg-[#E7DED1] font-medium' : 'hover:bg-[#E7DED1]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-heading font-normal text-sm text-[#3B2A22]">{notif.title}</span>
                    {!notif.readAt && <span className="w-2 h-2 rounded-full bg-[#C8A46A]" />}
                  </div>
                  <p className="text-[11px] text-[#6E5948] line-clamp-2 leading-relaxed mb-1">{notif.body}</p>
                  <span className="text-[9px] text-[#8B7562]">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <Link
            to="/notifications"
            onClick={() => setIsOpen(false)}
            className="block text-center py-3 bg-[#E7DED1] border-t border-[#D6C8B8] font-sans text-xs font-semibold text-[#3B2A22] hover:bg-[#D9C8B7] transition-colors"
          >
            View All Notifications →
          </Link>
        </div>
      )}
    </div>
  );
};
