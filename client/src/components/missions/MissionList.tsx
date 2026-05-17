import { ClipboardList } from "lucide-react";
import type { Mission } from "../../types/global.types";
import MissionCard from "./MissionCard";

type Props = {
  missions: Mission[];
  refresh: () => void;
};

export default function MissionList({ missions, refresh }: Props) {
  if (!missions.length) {
    return (
      <div className="flex flex-col items-center justify-center bg-white rounded-xl p-10 text-center text-gray-500">
        <div className="p-3 rounded-full bg-gray-100 mb-3">
          <ClipboardList size={28} className="text-gray-400" />
        </div>

        <p className="text-sm font-medium text-gray-700">
          No missions available
        </p>

        <p className="text-xs text-gray-400 mt-1">
          Missions will appear here once they are assigned
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {missions.map((mission) => (
        <MissionCard key={mission._id} mission={mission} refresh={refresh} />
      ))}
    </div>
  );
}
