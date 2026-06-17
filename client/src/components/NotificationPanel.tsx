import { X, Check, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { useNotificationStore } from "../utils/notification.store";
import { getNotifications, markAsRead } from "../api/notification.api";
import type { Notification } from "../types/global.types";

type NotificationGroup = Record<string, Notification[]>;

export default function NotificationPanel() {
  const { open, closePanel, notifications, setNotifications } =
    useNotificationStore();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await getNotifications();
        const data = res.data ?? res;

        setNotifications(data);

        data.forEach((n: Notification) => {
          if (!n.isRead) markAsRead(n._id);
        });

        setNotifications(
          data.map((n: Notification) => ({ ...n, isRead: true })),
        );
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

  const formatDateLabel = (date: string): string => {
    const d = new Date(date);
    const today = new Date();

    if (d.toDateString() === today.toDateString()) return "Today";

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

    return d.toLocaleDateString();
  };

  const grouped: NotificationGroup = notifications.reduce(
    (acc: NotificationGroup, n: Notification) => {
      const key = formatDateLabel(n.createdAt);

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(n);

      return acc;
    },
    {},
  );

  return (
    <>
      {open && <div onClick={closePanel} className="fixed inset-0  z-100" />}

      <div
        className={`fixed top-0 left-0 h-full w-64 z-100
        bg-white border-r border-gray-100 shadow-xl
        transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* HEADER */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Notifications
              </h2>
              <p className="text-[11px] text-gray-400">Activity feed</p>
            </div>

            <button
              onClick={closePanel}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-2 overflow-y-auto h-full">
          {loading && (
            <div className="text-xs text-gray-400 px-2 py-3">Loading...</div>
          )}

          {!loading && Object.keys(grouped).length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Bell size={18} className="text-gray-300 mb-2" />
              <p className="text-xs text-gray-500">No notifications</p>
            </div>
          )}

          {!loading &&
            Object.entries(grouped).map(([date, items]) => (
              <div key={date} className="mb-3">
                {/* DATE */}
                <div className="px-2 py-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {date}
                  </span>
                </div>

                {/* GROUP */}
                <div className="bg-gray-50 rounded-xl p-1 space-y-1">
                  {items.map((n: Notification) => (
                    <div
                      key={n._id}
                      className="px-3 py-2 rounded-lg hover:bg-white transition"
                    >
                      <div className="flex justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {n.message}
                          </p>
                        </div>

                        {!n.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(n._id)}
                            className="p-1 rounded-md hover:bg-gray-200 transition"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>

                      <div className="mt-1 flex justify-between">
                        <span className="text-[10px] text-gray-400">
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        {!n.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-black" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
