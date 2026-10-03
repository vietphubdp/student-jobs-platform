import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../api/notifications';
import { Notification, NotificationType } from '../types/notification';
import { Navbar } from '../components/layout/Navbar';
import { timeAgo } from '../utils/timeAgo';
import {
  Bell,
  CheckCheck,
  UserPlus,
  CheckCircle2,
  XCircle,
  Undo2,
  PartyPopper,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
  Inbox
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'UNREAD'>('ALL');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await notificationApi.getNotifications({
        page,
        limit: 15,
        unreadOnly: selectedTab === 'UNREAD',
      });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [selectedTab, page]);

  const handleMarkAsRead = async (notif: Notification) => {
    try {
      if (!notif.isRead) {
        await notificationApi.markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      if (notif.link) {
        navigate(notif.link);
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingAll(true);
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      if (selectedTab === 'UNREAD') {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'APPLICATION_RECEIVED':
        return (
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0065c9] border border-blue-100 flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
        );
      case 'APPLICATION_ACCEPTED':
        return (
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        );
      case 'APPLICATION_REJECTED':
        return (
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
        );
      case 'APPLICATION_WITHDRAWN':
        return (
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Undo2 className="w-5 h-5" />
          </div>
        );
      case 'JOB_COMPLETED':
        return (
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <PartyPopper className="w-5 h-5" />
          </div>
        );
      case 'NEW_REVIEW':
        return (
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center space-x-3">
              <span className="p-2 rounded-xl bg-blue-50 text-[#0065c9] border border-blue-100">
                <Bell className="w-6 h-6" />
              </span>
              <span>Trung tâm Thông báo</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Toàn bộ tin thông báo về trạng thái ứng tuyển, kết quả duyệt đơn và đánh giá.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
              className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs self-start sm:self-auto space-x-1.5"
            >
              {isMarkingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCheck className="w-4 h-4 text-[#0065c9]" />
              )}
              <span>Đánh dấu tất cả đã đọc</span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-1">
          <button
            onClick={() => {
              setSelectedTab('ALL');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedTab === 'ALL'
                ? 'bg-[#0065c9] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tất cả thông báo
          </button>

          <button
            onClick={() => {
              setSelectedTab('UNREAD');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              selectedTab === 'UNREAD'
                ? 'bg-[#0065c9] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Chưa đọc</span>
            {unreadCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  selectedTab === 'UNREAD'
                    ? 'bg-white text-[#0065c9]'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#0065c9]" />
            <p className="text-sm">Đang tải danh sách thông báo...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-sm">
            <div className="w-14 h-14 rounded-3xl bg-blue-50 text-[#0065c9] flex items-center justify-center mx-auto">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {selectedTab === 'ALL'
                ? 'Bạn chưa có thông báo nào'
                : 'Bạn đã đọc hết tất cả thông báo!'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Các thông báo mới về ứng tuyển và đánh giá sẽ xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs text-slate-500 font-medium">
              Hiển thị <strong className="text-slate-800">{notifications.length}</strong> / {totalCount} thông báo
            </div>
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleMarkAsRead(notif)}
                className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer flex items-start space-x-4 shadow-xs hover:border-[#0065c9]/40 ${
                  !notif.isRead
                    ? 'bg-blue-50/25 border-blue-200/80'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Icon */}
                {getNotificationIcon(notif.type)}

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={`text-sm ${
                        !notif.isRead
                          ? 'font-extrabold text-slate-900'
                          : 'font-semibold text-slate-800'
                      }`}
                    >
                      {notif.title}
                    </h3>
                    <span className="text-xs text-slate-400 shrink-0">
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{notif.content}</p>

                  {notif.link && (
                    <div className="pt-2">
                      <span className="inline-flex items-center text-xs font-bold text-[#0065c9] hover:underline">
                        <span>Xem chi tiết</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </span>
                    </div>
                  )}
                </div>

                {/* Unread indicator */}
                {!notif.isRead && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0065c9] shrink-0 mt-1" />
                )}
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-6">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center transition"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span>Trang trước</span>
                </button>

                <div className="text-xs font-bold text-slate-600 px-3">
                  Trang {page} / {totalPages}
                </div>

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center transition"
                >
                  <span>Trang sau</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
