import { useEffect, useState } from "react";
import { getAlerts } from "../../api/alert.api";
import type { Alert } from "../../types/global.types";

type Props = {
  alertId: string;
  setAlertId: (id: string) => void;
  setMachineId: (id: string) => void;
};

export default function AlertSelector({
  alertId,
  setAlertId,
  setMachineId,
}: Props) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    getAlerts().then(setAlerts).catch(console.error);
  }, []);

  const handleChange = (id: string) => {
    setAlertId(id);

    const alert = alerts.find((a) => a._id === id);

    if (!alert) return;

    const machineId =
      typeof alert.machine === "string"
        ? alert.machine
        : alert.machine?._id || "";

    setMachineId(machineId);
  };

  return (
    <select
      value={alertId}
      onChange={(e) => handleChange(e.target.value)}
      className="w-full border rounded-lg px-3 py-2"
    >
      <option value="">Select alert (optional)</option>

      {alerts.map((a) => (
        <option key={a._id} value={a._id}>
          {a.type} - {a.message} -{" "}
          {typeof a.machine === "object" && a.machine !== null
            ? a.machine.name
            : "Unknown Machine"}
        </option>
      ))}
    </select>
  );
}
