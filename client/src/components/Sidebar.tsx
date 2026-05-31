import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { menuByRole } from "../constants/menu";
import { LogOut, Menu, ArrowLeftFromLine, Bell } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useNotificationStore } from "../utils/notification.store";
import { getNotifications } from "../api/notification.api";
import { getSocket } from "../services/socket.service";
import type { Message } from "../types/global.types";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
};

export default function Sidebar({
  open,
  setOpen,
  collapsed,
  setCollapsed,
}: Props) {
  const { user, logoutUser } = useAuth();
  const location = useLocation();

  const menu = user?.role ? menuByRole[user.role] || [] : [];

  const notifications = useNotificationStore((s) => s.notifications);
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const openNotifications = useNotificationStore((s) => s.openPanel);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await getNotifications();
        const data = res.data ?? res;

        setNotifications(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchNotifications();
  }, [setNotifications]);

  useEffect(() => {
    const socket = getSocket();

    if (!socket || !user?._id) return;

    const handleMessage = (message: Message) => {
      const myId = user._id;

      const senderId =
        typeof message.sender === "object" && message.sender !== null
          ? (message.sender as { _id: string })._id
          : message.sender;

      const receiverId =
        typeof message.receiver === "object" && message.receiver !== null
          ? (message.receiver as { _id: string })._id
          : message.receiver;

      if (senderId === myId) return;

      const path = location.pathname;

      let isSameConversation = false;

      if (!message.roomId) {
        const chatUserId = senderId === myId ? receiverId : senderId;

        isSameConversation = path === `/chat/private/${chatUserId}`;
      }

      if (message.roomId) {
        isSameConversation = path === `/chat/room/${message.roomId}`;
      }

      if (isSameConversation) return;

      const audio = new Audio("/notification.wav");
      audio.volume = 0.4;
      audio.play().catch(() => {});
    };

    socket.on("MESSAGE:PRIVATE", handleMessage);
    socket.on("MESSAGE:ROOM", handleMessage);

    return () => {
      socket.off("MESSAGE:PRIVATE", handleMessage);
      socket.off("MESSAGE:ROOM", handleMessage);
    };
  }, [user, location.pathname]);

  return (
    <>
      {/* mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 md:hidden backdrop-blur-sm z-100"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`
        fixed md:static z-100 h-full flex flex-col
        bg-white border-r border-gray-200
        transition-all duration-300 overflow-hidden
        shadow-sm
        ${open ? "w-64" : "w-0"}
        ${collapsed ? "md:w-16" : "md:w-64"}
      `}
      >
        {/* HEADER */}
        <div
          className={`
          flex items-center border-b border-gray-100 px-3 py-3
          ${collapsed ? "justify-center" : "justify-between"}
        `}
        >
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                className="w-9 h-9 object-contain"
                alt="logo"
              />
              <span className="font-semibold text-gray-800 text-sm">
                Dashboard
              </span>
            </div>
          ) : (
            <img
              src="/logo.png"
              className="w-8 h-8 object-contain"
              alt="logo"
            />
          )}

          <button
            className="hidden md:flex items-center justify-center w-9 h-9 rounded-md hover:bg-gray-100 transition"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <Menu size={18} /> : <ArrowLeftFromLine size={18} />}
          </button>

          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            <ArrowLeftFromLine size={18} />
          </button>
        </div>

        {/* MENU */}
        <div className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto">
          {menu.map((item) => {
            const Icon = item.icon;

            if (item.action === "notifications") {
              return (
                <button
                  key={item.label}
                  onClick={openNotifications}
                  className={`
                  relative flex items-center gap-3 px-3 py-2 rounded-xl
                  transition-all duration-150
                  text-gray-600 hover:bg-gray-100 hover:text-gray-900
                  ${collapsed ? "justify-center" : ""}
                `}
                >
                  <div className="relative">
                    <Bell size={18} />

                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 text-[10px] bg-red-500 text-white w-4 h-4 flex items-center justify-center rounded-full">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </div>

                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </button>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `
                relative flex items-center gap-3 px-3 py-2 rounded-xl
                transition-all duration-150
                ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }
                ${collapsed ? "justify-center" : ""}
              `
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} />

                    {!collapsed && (
                      <span className="text-sm">{item.label}</span>
                    )}

                    {/* active indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-r-full" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="border-t border-gray-100 p-3">
          {user && (
            <div className="flex items-center gap-3">
              {!collapsed && (
                <div className="flex items-center gap-3 flex-1">
                  <img
                    src={user.avatar}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-200"
                    alt="avatar"
                  />

                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-[11px] text-gray-500">{user.role}</div>
                  </div>
                </div>
              )}

              <button
                onClick={logoutUser}
                className="
                p-2 rounded-lg
                hover:bg-red-50 hover:text-red-500
                transition cursor-pointer
              "
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
