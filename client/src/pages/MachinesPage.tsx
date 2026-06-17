import { useEffect, useState } from "react";
import { getMachines } from "../api/machine.api";
import type { Machine } from "../types/global.types";
import MachineList from "../components/machines/MachineList";
import { searchBus } from "../utils/searchBus";
import { SOCKET_EVENTS } from "../services/socket.events";
import { getSocket } from "../services/socket.service";

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMachines = async () => {
    try {
      const data = await getMachines();
      setMachines(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  useEffect(() => {
    const unsubscribe = searchBus.subscribe((value) => {
      setSearch(value);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onMachineCreated = (machine: Machine) => {
      setMachines((prev) => [machine, ...prev]);
    };

    const onMachineUpdated = (machine: Machine) => {
      setMachines((prev) =>
        prev.map((m) => (m._id === machine._id ? machine : m)),
      );
    };

    const onMachineDeleted = (machine: Machine) => {
      setMachines((prev) => prev.filter((m) => m._id !== machine._id));
    };

    socket.on(SOCKET_EVENTS.MACHINE_CREATED, onMachineCreated);
    socket.on(SOCKET_EVENTS.MACHINE_UPDATED, onMachineUpdated);
    socket.on(SOCKET_EVENTS.MACHINE_DELETED, onMachineDeleted);

    return () => {
      socket.off(SOCKET_EVENTS.MACHINE_CREATED, onMachineCreated);
      socket.off(SOCKET_EVENTS.MACHINE_UPDATED, onMachineUpdated);
      socket.off(SOCKET_EVENTS.MACHINE_DELETED, onMachineDeleted);
    };
  }, []);

  const filteredMachines = machines.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-6 bg-[#f9f9f9] min-h-screen">
      <h1 className="text-4xl font-black tracking-tight">Machines</h1>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <MachineList machines={filteredMachines} refresh={fetchMachines} />
      )}
    </div>
  );
}
