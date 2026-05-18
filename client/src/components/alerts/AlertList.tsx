import { useEffect, useState } from "react";
import type { Alert } from "../../types/global.types";
import { getAlerts } from "../../api/alert.api";
import AlertCard from "./AlertCard";
import { AlertTriangle } from "lucide-react";
import { SOCKET_EVENTS } from "../../services/socket.events";
import { getSocket } from "../../services/socket.service";

export default function AlertList() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await getAlerts();
      setAlerts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleAlertCreated = (alert: Alert) => {
      setAlerts((prev) => [alert, ...prev]);
    };

    const handleAlertUpdated = (alert: Alert) => {
      setAlerts((prev) => prev.map((a) => (a._id === alert._id ? alert : a)));
    };

    const handleAlertDeleted = (alert: Alert) => {
      setAlerts((prev) => prev.filter((a) => a._id !== alert._id));
    };

    socket.on(SOCKET_EVENTS.ALERT_CREATED, handleAlertCreated);
    socket.on(SOCKET_EVENTS.ALERT_UPDATED, handleAlertUpdated);
    socket.on(SOCKET_EVENTS.ALERT_DELETED, handleAlertDeleted);

    return () => {
      socket.off(SOCKET_EVENTS.ALERT_CREATED, handleAlertCreated);
      socket.off(SOCKET_EVENTS.ALERT_UPDATED, handleAlertUpdated);
      socket.off(SOCKET_EVENTS.ALERT_DELETED, handleAlertDeleted);
    };
  }, []);

  if (loading) {
    return (
      <div className="text-gray-500 text-center py-10">Loading alerts...</div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center bg-white rounded-xl p-10 text-center text-gray-500">
        <div className="p-3 rounded-full bg-gray-100 mb-3">
          <AlertTriangle size={28} className="text-gray-400" />
        </div>

        <p className="text-sm font-medium text-gray-700">No alerts detected</p>

        <p className="text-xs text-gray-400 mt-1">
          System is currently stable — no issues reported
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {alerts.map((alert) => (
        <AlertCard key={alert._id} alert={alert} refresh={fetchAlerts} />
      ))}
    </div>
  );
}
