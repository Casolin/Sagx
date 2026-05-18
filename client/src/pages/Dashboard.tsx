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
} from "recharts";

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
  dark,
}: {
  title: string;
  value: string | number;
  dark?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border shadow-sm p-5 transition
      ${dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
    >
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
        className={`p-6 text-center ${dark ? "text-gray-300" : "text-gray-500"}`}
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
      className={`p-6 space-y-8 transition-colors
      ${dark ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"}`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.firstName}</p>
        </div>
      </div>

      {/* ADMIN / MANAGER */}
      {user?.role !== "TECHNICIAN" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              dark={dark}
              title="Total Missions"
              value={data.missions?.total || 0}
            />
            <KpiCard
              dark={dark}
              title="Completed"
              value={data.missions?.COMPLETED || 0}
            />
            <KpiCard
              dark={dark}
              title="Open Alerts"
              value={data.alerts?.OPEN || 0}
            />
            <KpiCard
              dark={dark}
              title="Machines Down"
              value={data.machines?.status.DOWN || 0}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div
              className={`rounded-2xl border p-6 ${dark ? "bg-gray-900 border-gray-800" : "bg-white"}`}
            >
              <h2 className="font-semibold mb-4">Mission Status</h2>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={missionChartData}>
                  <XAxis
                    dataKey="name"
                    interval={0}
                    tick={isMobile ? false : { fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
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
              className={`rounded-2xl border p-6 ${dark ? "bg-gray-900 border-gray-800" : "bg-white"}`}
            >
              <h2 className="font-semibold mb-4">Machines</h2>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={machineChartData}>
                  <XAxis
                    dataKey="name"
                    interval={0}
                    tick={isMobile ? false : { fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
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
            className={`rounded-2xl border p-6 ${dark ? "bg-gray-900 border-gray-800" : "bg-white"}`}
          >
            <h2 className="font-semibold mb-4">Technician Availability</h2>

            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={110}>
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

      {/* TECHNICIAN */}
      {user?.role === "TECHNICIAN" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            dark={dark}
            title="My Missions"
            value={data.myMissions?.total || 0}
          />
          <KpiCard
            dark={dark}
            title="Active"
            value={data.myMissions?.active || 0}
          />
          <KpiCard
            dark={dark}
            title="Pending Tasks"
            value={data.myTasks?.pending || 0}
          />
          <KpiCard
            dark={dark}
            title="Completed Tasks"
            value={data.myTasks?.completed || 0}
          />
        </div>
      )}

      {/* =========================
          🔥 ADDED SECTION ONLY
          LATEST UPDATES + MESSAGES
      ========================= */}
      <div
        className={`rounded-2xl border p-6 space-y-6 ${dark ? "bg-gray-900 border-gray-800" : "bg-white"}`}
      >
        {/* LATEST UPDATES */}
        <div>
          <h2 className="font-semibold mb-3">Latest Activities</h2>

          {updates.length === 0 ? (
            <p className="text-sm text-gray-400">No recent activity</p>
          ) : (
            <div className="space-y-2 text-sm">
              {updates.slice(0, 3).map((u) => (
                <div
                  key={u._id}
                  className="flex justify-between items-start border-b pb-2"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{u.title}</span>
                    <span className="text-xs text-gray-500">{u.message}</span>
                  </div>

                  <span className="text-[11px] text-gray-400 whitespace-nowrap">
                    {timeAgo(u.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-semibold mb-3">Latest Messages</h2>

          {messages.length === 0 ? (
            <p className="text-sm text-gray-400">No messages yet</p>
          ) : (
            messages.slice(0, 5).map((m) => (
              <div key={m._id} className="flex items-center gap-3">
                <img
                  src={isPopulatedUser(m.sender) ? m.sender.avatar : ""}
                  className="h-8 w-8 rounded-full border"
                />

                <div className="flex flex-col">
                  <p className="text-sm font-medium">
                    {isPopulatedUser(m.sender) ? m.sender.firstName : "User"}
                  </p>

                  <p className="text-xs text-gray-500">{m.content}</p>
                </div>

                <p className="ml-auto text-[10px] text-gray-400">
                  {timeAgo(m.createdAt)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
