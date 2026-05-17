import { useEffect, useState } from "react";
import { getMissions } from "../api/mission.api";
import type { Mission } from "../types/global.types";
import MissionList from "../components/missions/MissionList";
import { searchBus } from "../utils/searchBus";

export default function Missions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [allMissions, setAllMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMissions = async () => {
    try {
      const data = await getMissions();
      setMissions(data);
      setAllMissions(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  useEffect(() => {
    const unsubscribe = searchBus.subscribe((value) => {
      const q = value.trim().toLowerCase();

      if (!q) {
        setMissions(allMissions);
        return;
      }

      const filtered = allMissions.filter((m) =>
        m.title.toLowerCase().includes(q),
      );

      setMissions(filtered);
    });

    return unsubscribe;
  }, [allMissions]);

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold">Missions</h1>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <MissionList missions={missions} refresh={fetchMissions} />
      )}
    </div>
  );
}
