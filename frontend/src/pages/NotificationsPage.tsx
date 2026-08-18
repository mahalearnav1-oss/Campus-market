import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api/client';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  actionUrl?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationPreferences {
  inAppEnabled: boolean;
  emailEnabled: boolean;
  orderUpdates: boolean;
  messages: boolean;
  reviews: boolean;
  promotions: boolean;
}

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'settings'>('feed');

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const [notifRes, prefRes]: any = await Promise.all([
        apiClient.get(`/notifications?unreadOnly=${unreadOnly}`),
        apiClient.get('/users/me/notification-preferences'),
      ]);
      setNotifications(notifRes.data.notifications || []);
      setPreferences(prefRes.data.preferences || null);
    } catch (err: any) {
      setError(err.message || 'Couldn\'t load notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [unreadOnly]);

  const handleMarkAllRead = async () => {
    try {
      await apiClient.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
    } catch (err: any) {
      setError(err.message || 'Couldn\'t update notifications. Please try again.');
    }
  };

  const handleNotificationClick = async (n: NotificationItem) => {
    if (!n.readAt) {
      try {
        await apiClient.patch(`/notifications/${n.id}/read`);
        setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, readAt: new Date().toISOString() } : item)));
      } catch (e) {
        // Ignore
      }
    }
    if (n.actionUrl) {
      navigate(n.actionUrl);
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err: any) {
      setError(err.message || 'Couldn\'t delete notification. Please try again.');
    }
  };

  const handleTogglePreference = async (key: keyof NotificationPreferences) => {
    if (!preferences) return;
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    try {
      await apiClient.patch('/users/me/notification-preferences', { [key]: updated[key] });
    } catch (err: any) {
      setError(err.message || 'Couldn\'t update notification preferences. Please try again.');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'MESSAGE_RECEIVED':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        );
      case 'ORDER_STATUS_CHANGED':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        );
      case 'PAYMENT_RECEIVED':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        );
      case 'ESCROW_RELEASED':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#6E8A62]">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        );
      case 'REVIEW_LEFT':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#C8A46A" stroke="none">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      default:
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        );
    }
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8 text-[#3B2A22]">

      {/* Header */}
      <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="tag-editorial mb-2 block">Activity Feed</span>
          <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">
            Notifications
          </h1>
          <p className="font-sans text-xs text-[#8B7562] mt-1">
            {unreadCount > 0 ? `${unreadCount} unread update(s)` : 'All caught up!'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#E7DED1] p-1 rounded-2xl border border-[#D6C8B8]">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-2 rounded-xl text-xs font-sans font-semibold transition-all ${activeTab === 'feed' ? 'bg-[#111111] text-[#F4EFE7]' : 'text-[#6E5948]'}`}
            >
              Activity Feed
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-xl text-xs font-sans font-semibold transition-all ${activeTab === 'settings' ? 'bg-[#111111] text-[#F4EFE7]' : 'text-[#6E5948]'}`}
            >
              Preferences
            </button>
          </div>

          {activeTab === 'feed' && unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="btn-secondary text-xs !py-2 !px-4"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Activity Feed Tab */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="font-sans text-[10px] tracking-[0.2em] uppercase font-semibold text-[#8B7562]">
              Updates ({notifications.length})
            </span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
                className="w-4 h-4 rounded border-[#D6C8B8] text-[#C8A46A] focus:ring-[#C8A46A]"
              />
              <span className="font-sans text-xs text-[#6E5948]">Show unread only</span>
            </label>
          </div>

          {isLoading ? (
            <div className="text-center py-16 text-xs text-[#8B7562]">Loading notifications…</div>
          ) : notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-6 rounded-[28px] border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                    !n.readAt
                      ? 'bg-[#EDE5D9] border-[#C8A46A] shadow-warm-subtle'
                      : 'bg-[#EDE5D9]/60 border-[#D6C8B8] hover:bg-[#EDE5D9]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] text-lg flex items-center justify-center shrink-0">
                      {getTypeIcon(n.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-heading text-xl font-normal text-[#3B2A22]">{n.title}</h4>
                        {!n.readAt && (
                          <span className="w-2 h-2 rounded-full bg-[#C8A46A]" />
                        )}
                      </div>
                      <p className="font-sans text-xs text-[#6E5948] leading-relaxed mb-2">{n.body}</p>
                      <span className="font-sans text-[10px] text-[#8B7562]">
                        {new Date(n.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteNotification(n.id, e)}
                    className="text-[#8B7562] hover:text-[#9B5C52] p-1 transition-colors text-xs"
                    title="Delete notification"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-6 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8]">
              <div className="w-14 h-14 rounded-2xl bg-[#E7DED1] text-[#3B2A22] flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <h3 className="font-heading text-2xl font-normal text-[#3B2A22] mb-1">No Notifications</h3>
              <p className="text-xs text-[#8B7562]">You're all caught up with orders, messages, and escrow updates.</p>
            </div>
          )}
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'settings' && preferences && (
        <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-6">
          <div>
            <h2 className="font-heading text-2xl font-normal text-[#3B2A22] mb-1">Notification Preferences</h2>
            <p className="text-xs text-[#8B7562]">Control how and when CampusMarket notifies you</p>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#D6C8B8]">
            {[
              { key: 'inAppEnabled' as const, label: 'In-App Notifications', desc: 'Receive real-time popups and header alerts' },
              { key: 'emailEnabled' as const, label: 'Email Notifications', desc: 'Receive order receipts and message summaries via email' },
              { key: 'orderUpdates' as const, label: 'Escrow & Order Milestones', desc: 'Receive status changes on purchases and sales' },
              { key: 'messages' as const, label: 'Direct Messages & Offers', desc: 'Receive alerts when buyers or sellers message you' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8]">
                <div>
                  <h4 className="font-sans font-semibold text-xs text-[#3B2A22]">{item.label}</h4>
                  <p className="font-sans text-[11px] text-[#8B7562] mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() => handleTogglePreference(item.key)}
                  className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${preferences[item.key] ? 'bg-[#6E8A62] justify-end' : 'bg-[#D6C8B8] justify-start'}`}
                >
                  <div className="w-4 h-4 rounded-full bg-[#F4EFE7] shadow-sm" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
