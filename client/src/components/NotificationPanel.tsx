import { X, Check, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { useNotificationStore } from "../utils/notification.store";
import { getNotifications, markAsRead } from "../api/notification.api";
import type { Notification } from "../types/global.types";

export default function NotificationPanel() {
  const { open, closePanel, notifications, setNotifications } =
    useNotificationStore();

  const [loading, setLoading] = useState(false);
  const [markAllLoading, setMarkAllLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getNotifications();

        const data = res.data ?? res;
        setNotifications(data);

        const unreadCount = data.filter((n: Notification) => !n.isRead).length;

        useNotificationStore.setState({ unreadCount });
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, setNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);

      setNotifications(
        notifications.map((n: Notification) =>
          n._id === id ? { ...n, isRead: true } : n,
        ),
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkAllLoading(true);

      await Promise.all(
        notifications
          .filter((n: Notification) => !n.isRead)
          .map((n) => markAsRead(n._id)),
      );

      setNotifications(
        notifications.map((n: Notification) => ({
          ...n,
          isRead: true,
        })),
      );

      useNotificationStore.setState({ unreadCount: 0 });
    } catch (err) {
      console.log(err);
    } finally {
      setMarkAllLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div onClick={closePanel} className="fixed inset-0 bg-black/20 z-40" />
      )}

      {/* PANEL */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white border-r border-gray-200 z-50 transition-transform duration-300 shadow-xl ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold text-sm text-gray-900">
                Notifications
              </h2>
              <p className="text-[11px] text-gray-500">
                Latest updates & activity
              </p>
            </div>

            <button
              onClick={closePanel}
              className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            >
              <X size={18} className="text-gray-600" />
            </button>
          </div>

          {/* ACTION BUTTON */}
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markAllLoading}
              className="mt-3 w-full text-xs font-medium py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition disabled:opacity-50 cursor-pointer"
            >
              {markAllLoading ? "Marking..." : "Mark all as read"}
            </button>
          )}
        </div>

        {/* BODY */}
        <div className="p-3 space-y-3 overflow-y-auto h-full bg-white">
          {/* LOADING */}
          {loading && (
            <div className="text-sm text-gray-500">
              Loading notifications...
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center mt-20 px-4">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                <Bell size={20} className="text-gray-400" />
              </div>

              <p className="text-sm font-medium text-gray-700">
                No notifications
              </p>

              <p className="text-xs text-gray-500 mt-1">
                You're all caught up.
              </p>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {!loading &&
            notifications.map((n: Notification) => (
              <div
                key={n._id}
                className={`p-3 rounded-xl border transition hover:shadow-sm ${
                  n.isRead
                    ? "bg-white border-gray-200 opacity-60"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                {/* TOP */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-900">
                      {n.title}
                    </div>

                    <div className="text-xs text-gray-500 leading-snug">
                      {n.message}
                    </div>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(n._id)}
                      className="p-1 rounded-md text-gray-500 hover:bg-gray-200 transition"
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                </div>

                {/* FOOTER */}
                <div className="flex justify-between items-center mt-3">
                  <span className="text-[10px] text-gray-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>

                  {!n.isRead && (
                    <span className="text-[10px] font-medium text-blue-600">
                      NEW
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
