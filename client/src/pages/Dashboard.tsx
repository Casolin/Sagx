import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getLatestMessages } from "../api/message.api";
import { getKpis, getMyKpis } from "../api/kpi.api";
import type { Message, Activity } from "../types/global.types";
import { timeAgo } from "../utils/formatTime";
import { getUserUpdates } from "../api/notification.api";
import { SOCKET_EVENTS } from "../services/socket.events";
import { getSocket } from "../services/socket.service";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { Flag, Trophy, AlertTriangle, Power } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* =========================
   TYPES (NO ANY)
========================= */

type Technician = {
  id: string;
  name: string;
  skills?: string[];
  availability: boolean;
  status?: string;
  currentTasks?: number;
  completedTasks?: number;
};

type KpiData = {
  missions?: Record<string, number>;
  alerts?: Record<string, number>;

  machines?: {
    total: number;
    status: Record<string, number>;
    condition: Record<string, number>;
  };

  technicians?: Technician[];

  myTasks?: Record<string, number>;
  myMissions?: Record<string, number>;
};

/* =========================
   STATUS COLORS
========================= */
const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  ASSIGNED: "#3b82f6",
  IN_PROGRESS: "#6366f1",
  COMPLETED: "#10b981",
  CANCELLED: "#ef4444",
  OK: "#10b981",
  DOWN: "#ef4444",
  MAINTENANCE: "#f59e0b",
  OPEN: "#ef4444",
  RESOLVED: "#10b981",
  AVAILABLE: "#10b981",
  UNAVAILABLE: "#ef4444",
};

/* =========================
   KPI CARD
========================= */

function KpiCard({
  title,
  value,
  icon: Icon,
  color = "#3b82f6",
  dark,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border shadow-sm p-5 transition flex items-start justify-between
      ${dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
    >
      <div>
        <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
          {title}
        </p>

        <h2
          className={`text-3xl font-bold mt-2 ${
            dark ? "text-white" : "text-gray-900"
          }`}
        >
          {value}
        </h2>
      </div>

      <div
        className="p-3 rounded-xl"
        style={{
          backgroundColor: `${color}20`, // soft background
          color,
        }}
      >
        <Icon size={20} />
      </div>
    </div>
  );
}

/* =========================
   DASHBOARD
========================= */
export default function Dashboard({ dark }: { dark?: boolean }) {
  const { user } = useAuth();
  const [data, setData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [updates, setUpdates] = useState<Activity[]>([]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getUserUpdates();
        setUpdates(Array.isArray(res) ? res : []);
      } catch {
        setUpdates([]);
      }
    };

    fetch();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res =
          user?.role === "TECHNICIAN" ? await getMyKpis() : await getKpis();

        setData(res?.data || res);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetch();
  }, [user]);

  useEffect(() => {
    const fetch = async () => {
      const res = await getLatestMessages();
      setMessages(Array.isArray(res?.data) ? res.data : []);
    };

    fetch();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleKpiUpdate = (kpiData: KpiData) => {
      console.log("Received KPI update:", kpiData);
      setData(kpiData); // <-- THIS updates your dashboard state!
    };

    socket.on(SOCKET_EVENTS.KPI_UPDATE, handleKpiUpdate);

    return () => {
      socket.off(SOCKET_EVENTS.KPI_UPDATE, handleKpiUpdate);
    };
  }, []);

  if (loading)
    return (
      <div
        className={`p-6 text-center ${
          dark ? "text-gray-300" : "text-gray-500"
        }`}
      >
        Loading dashboard...
      </div>
    );

  if (!data)
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load dashboard
      </div>
    );

  /* =========================
     SAFE TECHNICIANS ARRAY
  ========================= */
  const techniciansList: Technician[] = Array.isArray(data.technicians)
    ? data.technicians
    : [];

  const pieData = [
    {
      name: "Available",
      value: techniciansList.filter((t) => t.availability).length,
    },
    {
      name: "Unavailable",
      value: techniciansList.filter((t) => !t.availability).length,
    },
  ];

  const missionChartData = [
    { name: "Pending", value: data.missions?.PENDING || 0 },
    { name: "Assigned", value: data.missions?.ASSIGNED || 0 },
    { name: "In Progress", value: data.missions?.IN_PROGRESS || 0 },
    { name: "Completed", value: data.missions?.COMPLETED || 0 },
    { name: "Cancelled", value: data.missions?.CANCELLED || 0 },
  ];

  const machineChartData = [
    { name: "OK", value: data.machines?.status?.OK || 0 },
    { name: "Down", value: data.machines?.status?.DOWN || 0 },
    { name: "Maintenance", value: data.machines?.status?.MAINTENANCE || 0 },
  ];

  type Sender =
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
      };

  const isPopulatedUser = (
    sender: Sender,
  ): sender is Exclude<Sender, string> => {
    return typeof sender === "object" && sender !== null;
  };

  return (
    <div
      className={`
      min-h-screen p-6 md:p-8 space-y-8
      ${dark ? "bg-[#030712] text-white" : "bg-[#f9f9f9] text-gray-900"}
    `}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Dashboard</h1>

          <p className={`mt-2 ${dark ? "text-gray-400" : "text-gray-500"}`}>
            Welcome back, {user?.firstName}
          </p>
        </div>
      </div>

      {user?.role !== "TECHNICIAN" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <KpiCard
              dark={dark}
              title="Total Missions"
              value={data.missions?.total || 0}
              icon={Flag}
              color="#6366f1"
            />

            <KpiCard
              dark={dark}
              title="Completed"
              value={data.missions?.COMPLETED || 0}
              icon={Trophy}
              color="#10b981"
            />

            <KpiCard
              dark={dark}
              title="Open Alerts"
              value={data.alerts?.OPEN || 0}
              icon={AlertTriangle}
              color="#f59e0b"
            />

            <KpiCard
              dark={dark}
              title="Machines Down"
              value={data.machines?.status.DOWN || 0}
              icon={Power}
              color="#ef4444"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div
              className={`
              rounded-3xl border p-6
              ${
                dark
                  ? "bg-[#111827]/70 border-white/10 backdrop-blur-xl"
                  : "bg-white border-white backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.06)]"
              }
            `}
            >
              <div className="mb-6">
                <h2 className="text-xl font-bold">Mission Status</h2>

                <p className="text-sm text-gray-400 mt-1">
                  Real-time mission overview
                </p>
              </div>

              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={missionChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={dark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}
                  />

                  <XAxis
                    dataKey="name"
                    tick={isMobile ? false : { fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    stroke={dark ? "#9ca3af" : "#6b7280"}
                  />

                  <YAxis
                    stroke={dark ? "#9ca3af" : "#6b7280"}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      background: dark ? "#111827" : "#ffffff",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                    }}
                  />

                  <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={42}>
                    {missionChartData.map((e, i) => (
                      <Cell
                        key={i}
                        fill={STATUS_COLORS[e.name.toUpperCase()] || "#888"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div
              className={`
              rounded-3xl border p-6
              ${
                dark
                  ? "bg-[#111827]/70 border-white/10 backdrop-blur-xl"
                  : "bg-white border-white backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.06)]"
              }
            `}
            >
              <div className="mb-6">
                <h2 className="text-xl font-bold">Machines</h2>

                <p className="text-sm text-gray-400 mt-1">
                  Machine health & uptime
                </p>
              </div>

              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={machineChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={dark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}
                  />

                  <XAxis
                    dataKey="name"
                    tick={isMobile ? false : { fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    stroke={dark ? "#9ca3af" : "#6b7280"}
                  />

                  <YAxis
                    stroke={dark ? "#9ca3af" : "#6b7280"}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      background: dark ? "#111827" : "#ffffff",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                    }}
                  />

                  <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={52}>
                    {machineChartData.map((e, i) => (
                      <Cell
                        key={i}
                        fill={STATUS_COLORS[e.name.toUpperCase()] || "#888"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div
            className={`
            rounded-3xl border p-6
            ${
              dark
                ? "bg-[#111827]/70 border-white/10 backdrop-blur-xl"
                : "bg-white border-white backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.06)]"
            }
          `}
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold">Technician Availability</h2>

              <p className="text-sm text-gray-400 mt-1">
                Live technician availability
              </p>
            </div>

            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  innerRadius={75}
                  outerRadius={110}
                  paddingAngle={5}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#10b981" : "#ef4444"} />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {user?.role === "TECHNICIAN" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <KpiCard
            dark={dark}
            title="Total Missions"
            value={data.missions?.total || 0}
            icon={Flag}
            color="#6366f1"
          />

          <KpiCard
            dark={dark}
            title="Completed"
            value={data.missions?.COMPLETED || 0}
            icon={Trophy}
            color="#10b981"
          />

          <KpiCard
            dark={dark}
            title="Open Alerts"
            value={data.alerts?.OPEN || 0}
            icon={AlertTriangle}
            color="#f59e0b"
          />

          <KpiCard
            dark={dark}
            title="Machines Down"
            value={data.machines?.status.DOWN || 0}
            icon={Power}
            color="#ef4444"
          />
        </div>
      )}

      <div
        className={`
        rounded-3xl border p-6 space-y-8
        ${
          dark
            ? "bg-[#111827]/70 border-white/10 backdrop-blur-xl"
            : "bg-white border-white backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.06)]"
        }
      `}
      >
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-2">
            <h2 className="text-xl font-bold mb-5">Latest Activities</h2>

            {updates.length === 0 ? (
              <p className="text-sm text-gray-400">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {updates.slice(0, 3).map((u) => (
                  <div
                    key={u._id}
                    className={`
                  flex justify-between items-start rounded-2xl px-4 py-4 transition-all
                  ${
                    dark
                      ? "bg-white/3 hover:bg-white/6"
                      : "bg-gray-50 hover:bg-gray-100/80"
                  }
                `}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">{u.title}</span>

                      <span className="text-sm text-gray-400 mt-1">
                        {u.message}
                      </span>
                    </div>

                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {timeAgo(u.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="hidden md:block w-0.5 bg-gray-100 p-0.5 rounded-full" />

          <div className="flex-3 min-w-0">
            <h2 className="text-xl font-bold mb-5">Latest Messages</h2>

            {messages.length === 0 ? (
              <p className="text-sm text-gray-400">No messages yet</p>
            ) : (
              <div className="space-y-3">
                {messages.slice(0, 5).map((m) => (
                  <div
                    key={m._id}
                    className={`
            flex items-center gap-4 rounded-2xl px-4 py-3
            transition-all
            ${dark ? "hover:bg-white/5" : "hover:bg-gray-100/70"}
          `}
                  >
                    {/* avatar */}
                    <img
                      src={isPopulatedUser(m.sender) ? m.sender.avatar : ""}
                      className="h-11 w-11 rounded-xl border object-cover shrink-0"
                    />

                    {/* text */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {isPopulatedUser(m.sender)
                          ? m.sender.firstName
                          : "User"}
                      </p>

                      <p className="text-sm text-gray-500 truncate">
                        {m.content}
                      </p>
                    </div>

                    {/* time */}
                    <p className="ml-auto text-xs text-gray-400 whitespace-nowrap shrink-0">
                      {timeAgo(m.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
