import { Search, BellRing, Sun, Moon, Menu, MessageSquare } from "lucide-react";

import { useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState, useEffect } from "react";
import AIChat from "./AIChat";
import { searchBus } from "../utils/searchBus";
import CreateMaterialModal from "./materials/CreateMaterialModal";

import { useNotificationStore } from "../utils/notification.store";
import { getNotifications } from "../api/notification.api";
import { getSocket } from "../services/socket.service";

import type { Message } from "../types/global.types";
import { useTheme } from "../hooks/useTheme";

type Props = {
  setIsOpen: (v: boolean) => void;
  open: boolean; // main app sidebar
};

export default function Navbar({ setIsOpen, open }: Props) {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);

  const { dark, setDark } = useTheme();
  const location = useLocation();

  const notifications = useNotificationStore((s) => s.notifications);
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const openNotifications = useNotificationStore((s) => s.openPanel);
  const firstName = user?.firstName || "User";

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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

  const showSearch = currentPage === "Missions" || currentPage === "Machines";

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchBus.set(search.trim());
    }, 250);

    return () => clearTimeout(timeout);
  }, [search]);

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
      if (message.sender === user._id) return;

      const isSameConversation = location.pathname.includes(
        message.roomId || "",
      );

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

  const toggleChatSidebar = () => {
    const sidebar = document.getElementById("chat-sidebar");
    if (!sidebar) return;

    const isOpen = sidebar.classList.contains("w-64");

    if (isOpen) {
      sidebar.classList.remove("w-64");
      sidebar.classList.add("w-0");
    } else {
      sidebar.classList.remove("w-0");
      sidebar.classList.add("w-64");
    }
  };

  return (
    <div className="sticky top-0 z-30">
      {/* TOP BAR */}
      <div className="h-16 flex items-center justify-between px-3 md:px-6 bg-white backdrop-blur-xl border-b border-slate-200/40 dark:border-white/10">
        {/* LEFT */}
        <div className="flex items-center gap-2">
          {/* MAIN SIDEBAR */}
          <button
            onClick={() => setIsOpen(!open)}
            className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/10"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* CENTER SEARCH */}
        {showSearch ? (
          <div className="hidden sm:flex flex-1 justify-center">
            <div className="relative w-full max-w-md bg-gray-100 rounded-xl">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-100 dark:bg-white/10 text-sm outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* RIGHT */}
        <div className="flex items-center gap-2">
          {/* CHAT SIDEBAR BUTTON (NEW ADDITION) */}
          {currentPage === "Chat" && (
            <button
              onClick={toggleChatSidebar}
              className="p-2 rounded-full bg-slate-100 dark:bg-white/10 hover:scale-105 transition"
              title="Toggle chat sidebar"
            >
              <MessageSquare size={18} />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-100/80 dark:bg-white/10 border border-slate-200/60 dark:border-white/10">
            <img
              src={user?.avatar}
              alt="avatar"
              className="w-9 h-9 rounded-full object-cover border border-white/40 dark:border-white/10 shadow-sm"
            />

            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">{firstName}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-500">
                {user?.email}
              </span>
            </div>
          </div>

          {/* NOTIFICATIONS */}
          <button
            onClick={openNotifications}
            className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <BellRing size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white w-4 h-4 flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {/* THEME TOGGLE */}
          <button
            onClick={() => setDark(!dark)}
            className="relative w-10 h-10 rounded-full flex items-center justify-center bg-slate-200 dark:bg-white/10 transition"
          >
            <Sun
              size={18}
              className={`absolute transition-all ${
                dark ? "opacity-0 scale-75 rotate-90" : "opacity-100"
              }`}
            />
            <Moon
              size={18}
              className={`absolute transition-all ${
                dark ? "opacity-100" : "opacity-0 scale-75 -rotate-90"
              }`}
            />
          </button>

          {/* AI CHAT */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="p-2 rounded-full bg-black text-white hover:scale-105 transition"
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
