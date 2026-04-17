'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle2, AlertCircle, Briefcase, Clock, Trash2 } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/notifications?limit=100', { cache: 'no-store' });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to load notifications');
      setNotifications(payload.data.notifications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getIconStyle = (type: string) => {
    if (type === 'new-drive') return { icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' };
    if (type === 'shortlisted' || type === 'selected') return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' };
    if (type === 'deadline-reminder') return { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' };
    return { icon: AlertCircle, color: 'text-purple-600', bg: 'bg-purple-50' };
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to mark as read');
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      const res = await fetch('/api/notifications/read-all', { method: 'PUT' });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to mark all as read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Notifications</h1>
            <p className="text-slate-600">Stay updated with your placement activities</p>
          </div>
          <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={markingAll}>
            Mark all as read
          </Button>
        </div>

        {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

        {loading ? (
          <Card className="p-8 text-center text-slate-600">Loading notifications...</Card>
        ) : (
          <div className="space-y-3">
          {notifications.map((notification) => {
            const style = getIconStyle(notification.type);
            const Icon = style.icon;
            return (
              <Card
                key={notification._id}
                className={`p-5 border transition-colors ${
                  notification.read
                    ? 'border-slate-200 bg-white'
                    : 'border-blue-200 bg-blue-50/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 ${style.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${style.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="font-semibold text-slate-900">{notification.title}</h3>
                      {!notification.read && (
                        <Badge className="bg-blue-600 text-white border-blue-600 flex-shrink-0">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{new Date(notification.createdAt).toLocaleString()}</span>
                      <div className="flex gap-2">
                        {!notification.read && (
                          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => markAsRead(notification._id)}>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Mark as read
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-400 hover:text-slate-600" disabled>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        )}

        {!loading && notifications.length === 0 && (
          <Card className="p-12 border border-gray-200 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-600">You'll see notifications here when there are updates</p>
          </Card>
        )}
      </div>
    </div>
  );
}
