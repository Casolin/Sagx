import { useEffect, useState } from "react";
import { getMissions } from "../api/mission.api";
import type { Mission } from "../types/global.types";
import MissionList from "../components/missions/MissionList";
import { searchBus } from "../utils/searchBus";
import { getSocket } from "../services/socket.service";
import { SOCKET_EVENTS } from "../services/socket.events";

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

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const addMission = (mission: Mission) => {
      setMissions((prev) => [mission, ...prev]);
      setAllMissions((prev) => [mission, ...prev]);
    };

    const updateMission = (mission: Mission) => {
      setMissions((prev) =>
        prev.map((m) => (m._id === mission._id ? mission : m)),
      );
      setAllMissions((prev) =>
        prev.map((m) => (m._id === mission._id ? mission : m)),
      );
    };

    const deleteMission = (mission: Mission) => {
      setMissions((prev) => prev.filter((m) => m._id !== mission._id));
      setAllMissions((prev) => prev.filter((m) => m._id !== mission._id));
    };

    socket.on(SOCKET_EVENTS.MISSION_CREATED, addMission);
    socket.on(SOCKET_EVENTS.MISSION_UPDATED, updateMission);
    socket.on(SOCKET_EVENTS.MISSION_DELETED, deleteMission);

    return () => {
      socket.off(SOCKET_EVENTS.MISSION_CREATED, addMission);
      socket.off(SOCKET_EVENTS.MISSION_UPDATED, updateMission);
      socket.off(SOCKET_EVENTS.MISSION_DELETED, deleteMission);
    };
  }, []);

  return (
    <div className="p-6 space-y-6 bg-[#f9f9f9] min-h-screen">
      <h1 className="text-4xl font-black tracking-tight">Missions</h1>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <MissionList missions={missions} refresh={fetchMissions} />
      )}
    </div>
  );
}
