import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { menuByRole } from "../constants/menu";
import { LogOut, Menu, ArrowLeftFromLine, Bell } from "lucide-react";
import { useEffect } from "react";

import { useNotificationStore } from "../utils/notification.store";
import { getNotifications } from "../api/notification.api";

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

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed md:static z-50 h-full flex flex-col border-r transition-all duration-300 overflow-hidden bg-white text-gray-700 border-gray-200
        ${open ? "w-64" : "w-0"}
        ${collapsed ? "md:w-16" : "md:w-64"}
      `}
      >
        {/* HEADER */}
        <div
          className={`flex items-center border-b p-3 border-gray-200 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!collapsed && (
            <img
              src="/logo.png"
              className="w-10 h-10 object-contain"
              alt="logo"
            />
          )}

          <button
            className="hidden md:flex items-center justify-center w-10 h-10"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <Menu /> : <ArrowLeftFromLine />}
          </button>

          <button className="md:hidden" onClick={() => setOpen(false)}>
            <ArrowLeftFromLine />
          </button>
        </div>

        {/* MENU */}
        <div className="flex flex-col gap-1 p-2 flex-1">
          {menu.map((item) => {
            const Icon = item.icon;

            if (item.action === "notifications") {
              return (
                <button
                  key={item.label}
                  onClick={openNotifications}
                  className={`flex items-center gap-3 p-2 rounded-md transition
                  text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer
                  ${collapsed ? "justify-center" : ""}`}
                >
                  <div className="relative">
                    <Bell size={18} />

                    {unreadCount > 0 && (
                      <div className="absolute -top-2 -right-2 text-[10px] text-white bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount > 99 ? "+99" : unreadCount}
                      </div>
                    )}
                  </div>

                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-2 rounded-md transition
                  ${
                    isActive
                      ? "bg-gray-200 text-gray-900"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }
                  ${collapsed ? "justify-center" : ""}`
                }
              >
                <Icon size={18} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="border-t p-3 border-gray-200">
          {user && (
            <div className="flex items-center justify-end">
              {!collapsed && (
                <div className="flex items-center gap-3 mr-auto">
                  <img
                    src={user.avatar}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-900"
                    alt="avatar"
                  />

                  <div>
                    <div className="text-sm font-semibold">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-xs opacity-60">{user.role}</div>
                  </div>
                </div>
              )}

              <button
                onClick={logoutUser}
                className="p-2 rounded-md hover:bg-gray-100 transition cursor-pointer"
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
