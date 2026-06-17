import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { menuByRole } from "../constants/menu";
import { LogOut, Menu, ArrowLeftFromLine, User } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

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

  const { dark, setDark } = useTheme();

  const handleLogout = () => {
    logoutUser();

    setDark(false); // reset theme
    localStorage.removeItem("theme"); // optional cleanup
  };

  return (
    <>
      {/* mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 md:hidden z-30"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`
        fixed md:static z-30 h-full flex flex-col
        bg-white
        transition-all duration-300 overflow-hidden
        ${open ? "w-64" : "w-0"}
        ${collapsed ? "md:w-16" : "md:w-64"}
      `}
      >
        {/* HEADER */}
        <div
          className={`
          flex items-center  border-gray-100 px-3 py-3
          ${collapsed ? "justify-center" : "justify-between"}
        `}
        >
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <img
                src={dark ? "/logo2.png" : "/logo.png"}
                className="w-10 h-10"
                alt="logo"
              />
              <h2 className="font-montserrat text-2xl">SAGX</h2>
            </div>
          ) : (
            <img src="/logo.png" className="w-8 h-8" />
          )}

          <button
            className="hidden md:flex items-center justify-center w-9 h-9 rounded-md hover:bg-gray-100"
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

        {/* CONTENT */}
        <div className="flex flex-col flex-1 overflow-y-auto p-2 gap-8">
          {/* MENU */}
          <div className="flex flex-col gap-1">
            {!collapsed && (
              <h2 className="text-xs font-semibold text-gray-500 px-3 mb-2 tracking-widest">
                MENU
              </h2>
            )}

            {menu.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={() =>
                    `
                    flex items-center gap-3 px-3 py-2 rounded-lg
                    text-gray-600 hover:text-gray-900 hover:bg-gray-50
                    transition relative
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

                      {/* subtle active indicator */}
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-gray-900 rounded-full" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* OTHERS */}
          <hr
            className={`h-px border-0 ${dark ? "bg-gray-200" : "bg-gray-200"}`}
          />
          <div className="dark:border-gray-700 flex flex-col gap-1">
            {!collapsed && (
              <h2 className="text-xs font-semibold text-gray-500 px-3 mb-2 tracking-widest">
                OTHERS
              </h2>
            )}

            <NavLink
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              <User size={18} />
              {!collapsed && <span className="text-sm">Profile</span>}
            </NavLink>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              <LogOut size={18} />
              {!collapsed && <span className="text-sm">Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
