import type { Material } from "../../types/global.types";
import MaterialCard from "./MaterialCard";

interface Props {
  materials: Material[];
}

const MaterialList = ({ materials }: Props) => {
  if (!materials.length) {
    return <p className="text-gray-400">No materials found</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {materials.map((m) => (
        <MaterialCard key={m._id} material={m} />
      ))}
    </div>
  );
};

export default MaterialList;
