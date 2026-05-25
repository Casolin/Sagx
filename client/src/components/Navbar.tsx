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

  return (
    <div className="sticky top-0 z-50">
      {/* MAIN BAR */}
      <div
        className="h-16 md:h-14 flex items-center justify-between px-3 md:px-6 
      bg-white/70 backdrop-blur-2xl border-b border-slate-200/40 shadow-sm"
      >
        {/* LEFT */}
        <div className="flex items-center gap-2 md:gap-3 min-w-fit">
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden p-2 rounded-xl active:scale-95 transition bg-slate-100 hover:bg-slate-200"
          >
            <Menu size={20} />
          </button>

          {/* CLEAN MODERN PILL */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full
    bg-white/70 backdrop-blur-xl border border-slate-200/60
    shadow-sm"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                currentPage === "Alerts" ? "bg-orange-500" : "bg-indigo-500"
              }`}
            />

            <span className="text-sm font-semibold text-slate-900 tracking-tight">
              {currentPage || "Dashboard"}
            </span>
          </div>
        </div>

        {/* CENTER SEARCH (mobile becomes icon only) */}
        {showSearch ? (
          <div className="flex-1 flex justify-center px-2 md:px-6">
            <div className="relative w-full max-w-xl">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={getPlaceholder()}
                className="w-full pl-10 pr-4 py-2 md:py-2.5
              rounded-full bg-slate-100/70 hover:bg-white
              border border-slate-200/50
              text-sm outline-none
              focus:ring-2 focus:ring-indigo-500/30
              transition"
              />
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* RIGHT */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* quick actions pill (Instagram style) */}
          <div className="hidden sm:flex items-center gap-1 p-1 rounded-full bg-slate-100/70 border border-slate-200/50">
            <button
              onClick={takeScreenshot}
              className="p-2 rounded-full hover:bg-white active:scale-95 transition cursor-pointer"
            >
              <Camera size={18} />
            </button>

            <button
              onClick={() => window.location.reload()}
              className="p-2 rounded-full hover:bg-white active:scale-95 transition cursor-pointer"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          {/* + BUTTON (primary floating style) */}
          {currentPage === "Missions" && isAdminOrManager && (
            <button
              onClick={() => navigate("/missions/add")}
              className="p-2.5 md:p-2.5 rounded-full bg-indigo-600 text-white
            shadow-md hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              <Plus size={20} />
            </button>
          )}

          {currentPage === "Machines" && isAdminOrManager && (
            <button
              onClick={() => navigate("/machines/add")}
              className="p-2.5 rounded-full bg-indigo-600 text-white
            shadow-md hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              <Plus size={20} />
            </button>
          )}

          {currentPage === "Alerts" && (
            <button
              onClick={() => navigate("/alerts/add")}
              className="p-2.5 rounded-full bg-amber-500 text-white
            shadow-md hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              <Plus size={20} />
            </button>
          )}

          {currentPage === "Users" && (
            <button
              onClick={() => navigate("/users/add")}
              className="p-2.5 rounded-full bg-indigo-600 text-white
            shadow-md hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              <Plus size={20} />
            </button>
          )}

          {currentPage === "Materials" && (
            <button
              onClick={() => setIsAddMaterialOpen(true)}
              className="p-2.5 rounded-full bg-indigo-600 text-white
            shadow-md hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              <Plus size={20} />
            </button>
          )}

          {/* chat sidebar toggle (mobile only) */}
          {currentPage === "Chat" && (
            <button
              onClick={() => {
                const sidebar = document.getElementById("chat-sidebar");
                if (!sidebar) return;

                const open = sidebar.classList.contains("w-0");
                sidebar.classList.toggle("w-0", !open);
                sidebar.classList.toggle("w-max", open);
                setIsSidebarOpen(open);
              }}
              className="md:hidden p-2.5 rounded-full bg-slate-900 text-white
            active:scale-95 transition"
            >
              {isSidebarOpen ? (
                <ArrowLeftToLine size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>
          )}

          {/* AI button (floating glass) */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="ml-1 p-2.5 rounded-full bg-black text-white
          shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer
          bg-linear-to-br from-slate-900 to-black"
          >
            <img src="/ailogo.png" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* MODALS */}
      {isChatOpen && <AIChat closeChat={() => setIsChatOpen(false)} />}

      <CreateMaterialModal
        open={isAddMaterialOpen}
        onOpenChange={setIsAddMaterialOpen}
        onCreated={() => {}}
      />
    </div>
  );
}
