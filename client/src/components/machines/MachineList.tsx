import type { Machine } from "../../types/global.types";
import MachineCard from "./MachineCard";

type Props = {
  machines: Machine[];
  refresh: () => void;
};

export default function MachineList({ machines, refresh }: Props) {
  if (!machines.length) {
    return <p className="text-gray-500">No machines found</p>;
  }

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-fr">
      {machines.map((m) => (
        <MachineCard key={m._id} machine={m} refresh={refresh} />
      ))}
    </div>
  );
}
