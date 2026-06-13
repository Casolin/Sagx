import { useEffect, useState } from "react";
import { getMaterials } from "../api/material.api";
import type { Material } from "../types/global.types";

import MaterialList from "../components/materials/MaterialList";
import CreateMaterialModal from "../components/materials/CreateMaterialModal";

const MaterialsPage = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [open, setOpen] = useState<boolean>(false);

  const fetchMaterials = async () => {
    try {
      const data = await getMaterials();
      setMaterials(Array.isArray(data) ? data : []);
    } catch {
      setMaterials([]);
    }
  };

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const data = await getMaterials();
        setMaterials(Array.isArray(data) ? data : []);
      } catch {
        setMaterials([]);
      }
    };

    loadMaterials();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-[#f6f7fb]">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black tracking-tight">Materials</h1>
      </div>

      <MaterialList materials={materials} />

      <CreateMaterialModal
        open={open}
        onOpenChange={setOpen}
        onCreated={fetchMaterials}
      />
    </div>
  );
};

export default MaterialsPage;
