import { useEffect, useState } from "react";
import { getMaterials } from "../../api/material.api";
import type { Material, MissionMaterial } from "../../types/global.types";

type Props = {
  materials: MissionMaterial[];
  setMaterials: (m: MissionMaterial[]) => void;
};

export default function MaterialsSelector({ materials, setMaterials }: Props) {
  const [all, setAll] = useState<Material[]>([]);

  useEffect(() => {
    getMaterials().then(setAll).catch(console.error);
  }, []);

  const addMaterial = (id: string) => {
    if (!id) return;

    if (materials.find((m) => m.materialId === id)) return;

    setMaterials([...materials, { materialId: id, quantity: 1 }]);
  };

  const updateQty = (id: string, qty: number) => {
    setMaterials(
      materials.map((m) => (m.materialId === id ? { ...m, quantity: qty } : m)),
    );
  };

  const remove = (id: string) => {
    setMaterials(materials.filter((m) => m.materialId !== id));
  };

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <h3 className="font-semibold">Materials</h3>

      <select
        onChange={(e) => addMaterial(e.target.value)}
        className="w-full border rounded px-2 py-2"
      >
        <option value="" defaultChecked>
          Select material
        </option>
        {all.map((m) => (
          <option key={m._id} value={m._id}>
            {m.name}
          </option>
        ))}
      </select>

      {materials.map((m) => {
        const mat = all.find((x) => x._id === m.materialId);

        return (
          <div key={m.materialId} className="flex items-center gap-2 mt-2">
            <span className="flex-1">{mat?.name}</span>

            <input
              type="number"
              value={m.quantity}
              min={1}
              onChange={(e) => updateQty(m.materialId, Number(e.target.value))}
              className="w-16 border px-1 rounded"
            />

            <button
              onClick={() => remove(m.materialId)}
              className="text-red-500"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
