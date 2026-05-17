import { Menu, Plus, RefreshCw, Search, ArrowLeftToLine } from "lucide-react";
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

  const showSearch = currentPage === "Missions" || currentPage === "Machines";

  return (
    <div className="relative">
      <div className="h-14 flex items-center justify-between px-5 border-b border-gray-200 bg-white">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>

          <h1 className="font-semibold text-lg">
            {currentPage || "Dashboard"}
          </h1>
        </div>

        {/* SEARCH */}
        {showSearch && (
          <div className="flex-1 flex justify-center px-4">
            <div className="relative w-full max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={getPlaceholder()}
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* refresh */}
          <button
            onClick={() => window.location.reload()}
            className="p-2 border rounded-lg cursor-pointer"
          >
            <RefreshCw size={20} />
          </button>

          {/* Missions */}
          {currentPage === "Missions" && isAdminOrManager && (
            <button
              onClick={() => navigate("/missions/add")}
              className="p-2 bg-indigo-600 text-white rounded-lg cursor-pointer"
            >
              <Plus size={20} />
            </button>
          )}

          {/* Machines */}
          {currentPage === "Machines" && isAdminOrManager && (
            <button
              onClick={() => navigate("/machines/add")}
              className="p-2 bg-indigo-600 text-white rounded-lg cursor-pointer"
            >
              <Plus size={20} />
            </button>
          )}

          {/* Alerts */}
          {currentPage === "Alerts" && (
            <button
              onClick={() => navigate("/alerts/add")}
              className="p-2 bg-orange-500 text-white rounded-lg cursor-pointer"
            >
              <Plus size={20} />
            </button>
          )}

          {/* Users */}
          {currentPage === "Users" && (
            <button
              onClick={() => navigate("/users/add")}
              className="p-2 bg-indigo-600 text-white rounded-lg cursor-pointer"
            >
              <Plus size={20} />
            </button>
          )}

          {/* MATERIALS → OPEN MODAL */}
          {currentPage === "Materials" && (
            <button
              onClick={() => setIsAddMaterialOpen(true)}
              className="p-2 bg-indigo-600 text-white rounded-lg cursor-pointer"
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
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
            >
              {isSidebarOpen ? (
                <button className="p-2 bg-indigo-600 text-white rounded-lg cursor-pointer">
                  <ArrowLeftToLine size={20} />
                </button>
              ) : (
                <button className="p-2 bg-indigo-600 text-white rounded-lg cursor-pointer">
                  <Menu size={20} />
                </button>
              )}
            </button>
          )}

          {/* AI CHAT */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="p-2 rounded-lg bg-black cursor-pointer"
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
        onCreated={() => {
          // optional: refresh materials list here
        }}
      />
    </div>
  );
}
