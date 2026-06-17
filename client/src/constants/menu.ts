import {
  LayoutDashboard,
  Wrench,
  AlertTriangle,
  Users,
  ClipboardList,
  User,
  MessageCircle,
  Users2,
  PcCase,
} from "lucide-react";

export const menuByRole = {
  ADMIN: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Missions", path: "/missions", icon: ClipboardList },
    { label: "Machines", path: "/machines", icon: Wrench },
    { label: "Alerts", path: "/alerts", icon: AlertTriangle },
    { label: "Materials", path: "/materials", icon: PcCase },
    { label: "Users", path: "/users", icon: Users },
    { label: "Chat", path: "/chat", icon: MessageCircle },
    { label: "Friends", path: "/friends", icon: Users2 },
    { label: "Profile", path: "/profile", icon: User },
  ],
  MANAGER: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Missions", path: "/missions", icon: ClipboardList },
    { label: "Machines", path: "/machines", icon: Wrench },
    { label: "Alerts", path: "/alerts", icon: AlertTriangle },
    { label: "Materials", path: "/materials", icon: PcCase },
    { label: "Chat", path: "/chat", icon: MessageCircle },
    { label: "Friends", path: "/friends", icon: Users2 },
    { label: "Profile", path: "/profile", icon: User },
  ],
  TECHNICIAN: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Missions", path: "/missions", icon: ClipboardList },
    { label: "Alerts", path: "/alerts", icon: AlertTriangle },
    { label: "Chat", path: "/chat", icon: MessageCircle },
    { label: "Friends", path: "/friends", icon: Users2 },
    { label: "Profile", path: "/profile", icon: User },
  ],
};
