import {
  Menu,
  Plus,
  RefreshCw,
  Search,
  ArrowLeftToLine,
  Camera,
} from "lucide-react";
import { toPng } from "html-to-image";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState, useEffect } from "react";
import AIChat from "./AIChat";
import { searchBus } from "../utils/searchBus";
import CreateMaterialModal from "./materials/CreateMaterialModal";

type Props = {
  setIsOpen: (v: boolean) => void;
};

export default function Navbar({ setIsOpen }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAdminOrManager = user?.role === "ADMIN" || user?.role === "MANAGER";

  const currentPage = pathname.startsWith("/missions")
    ? "Missions"
    : pathname.startsWith("/machines")
      ? "Machines"
      : pathname.startsWith("/materials")
        ? "Materials"
        : pathname.startsWith("/users")
          ? "Users"
          : pathname.startsWith("/alerts")
            ? "Alerts"
            : pathname.startsWith("/chat")
              ? "Chat"
              : pathname.startsWith("/friends")
                ? "Friends"
                : pathname.startsWith("/settings")
                  ? "Settings"
                  : pathname.startsWith("/profile")
                    ? "Profile"
                    : "";

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchBus.set(search.trim());
    }, 250);

    return () => clearTimeout(timeout);
  }, [search]);

  const getPlaceholder = () => {
    if (currentPage === "Missions") return "Search missions by title...";
    if (currentPage === "Machines") return "Search machines by name...";
    return "Search...";
  };

  const takeScreenshot = async () => {
    try {
      const dataUrl = await toPng(document.body, {
        cacheBust: true,
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `screenshot-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Screenshot failed:", err);
    }
  };

  const showSearch = currentPage === "Missions" || currentPage === "Machines";

  const iconButton =
    "p-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition-all duration-200 cursor-pointer";

  const primaryButton =
    "p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all duration-200 cursor-pointer";

  const warningButton =
    "p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all duration-200 cursor-pointer";

  return (
    <div className="relative">
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden p-2.5 rounded-xl hover:bg-slate-100 transition-all"
          >
            <Menu size={20} className="text-slate-700" />
          </button>

          <h1 className="font-semibold text-xl text-slate-800">
            {currentPage || "Dashboard"}
          </h1>
        </div>

        {showSearch && (
          <div className="flex-1 flex justify-center px-4">
            <div className="relative w-full max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={getPlaceholder()}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={takeScreenshot}
            className={iconButton}
            title="Take Screenshot"
          >
            <Camera size={19} />
          </button>

          <button
            onClick={() => window.location.reload()}
            className={iconButton}
          >
            <RefreshCw size={19} />
          </button>

          {currentPage === "Missions" && isAdminOrManager && (
            <button
              onClick={() => navigate("/missions/add")}
              className={primaryButton}
            >
              <Plus size={20} />
            </button>
          )}

          {currentPage === "Machines" && isAdminOrManager && (
            <button
              onClick={() => navigate("/machines/add")}
              className={primaryButton}
            >
              <Plus size={20} />
            </button>
          )}

          {currentPage === "Alerts" && (
            <button
              onClick={() => navigate("/alerts/add")}
              className={warningButton}
            >
              <Plus size={20} />
            </button>
          )}

          {currentPage === "Users" && (
            <button
              onClick={() => navigate("/users/add")}
              className={primaryButton}
            >
              <Plus size={20} />
            </button>
          )}

          {currentPage === "Materials" && (
            <button
              onClick={() => setIsAddMaterialOpen(true)}
              className={primaryButton}
            >
              <Plus size={20} />
            </button>
          )}

          {currentPage === "Chat" && (
            <button
              onClick={() => {
                const sidebar = document.getElementById("chat-sidebar");

                if (sidebar) {
                  if (sidebar.classList.contains("w-0")) {
                    sidebar.classList.remove("w-0");
                    sidebar.classList.add("w-max");
                    setIsSidebarOpen(true);
                  } else {
                    sidebar.classList.remove("w-max");
                    sidebar.classList.add("w-0");
                    setIsSidebarOpen(false);
                  }
                }
              }}
              className="md:hidden p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all duration-200 cursor-pointer"
            >
              {isSidebarOpen ? (
                <ArrowLeftToLine size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>
          )}

          <button
            onClick={() => setIsChatOpen(true)}
            className="p-2.5 rounded-xl bg-linear-to-br from-slate-900 to-black hover:scale-105 transition-all duration-200 cursor-pointer shadow-md"
          >
            <img src="/ailogo.png" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isChatOpen && <AIChat closeChat={() => setIsChatOpen(false)} />}

      <CreateMaterialModal
        open={isAddMaterialOpen}
        onOpenChange={setIsAddMaterialOpen}
        onCreated={() => {}}
      />
    </div>
  );
}
