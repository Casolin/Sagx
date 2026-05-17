import { useEffect, useState } from "react";
import { getMachines } from "../api/machine.api";
import type { Machine } from "../types/global.types";
import MachineList from "../components/machines/MachineList";
import { searchBus } from "../utils/searchBus";

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

  const filteredMachines = machines.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800">Machines</h1>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <MachineList machines={filteredMachines} refresh={fetchMachines} />
      )}
    </div>
  );
}
