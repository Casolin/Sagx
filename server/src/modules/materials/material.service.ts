import Material from "./material.model.js";
import { AppError } from "../../utils/AppError.js";

export const createMaterial = async (data: any) => {
  const existing = await Material.findOne({ name: data.name });

  if (existing) {
    throw new AppError("Material already exists", 409);
  }

  return await Material.create(data);
};

export const getAllMaterials = async () => {
  return await Material.find().sort({ createdAt: -1 });
};

export const getMaterialById = async (id: string) => {
  const material = await Material.findById(id);

  if (!material) {
    throw new AppError("Material not found", 404);
  }

  return material;
};

export const updateMaterialStock = async (id: string, quantity: number) => {
  const material = await Material.findById(id);

  if (!material) {
    throw new AppError("Material not found", 404);
  }

  material.quantity = quantity;
  await material.save();

  return material;
};

export const deleteMaterial = async (id: string) => {
  const material = await Material.findByIdAndDelete(id);

  if (!material) {
    throw new AppError("Material not found", 404);
  }

  return material;
};

export const resolveMaterials = async (
  failureType: string,
  machineType: string,
) => {
  const type = (failureType || "UNKNOWN").toUpperCase();

  let materials = await Material.find({
    $or: [
      { failureTypes: { $in: [type, "UNKNOWN"] } },
      { machineTypes: { $in: [machineType] } },
    ],
  });

  if (!materials.length) {
    materials = await Material.find({
      quantity: { $gt: 0 },
    }).limit(3);
  }

  return materials;
};

export const consumeMaterials = async (materials: any[]) => {
  for (const item of materials) {
    const material = await Material.findById(item.materialId);

    if (!material) {
      throw new AppError("Material not found", 404);
    }

    const qtyToConsume = item.quantity || 1;

    if (material.quantity < qtyToConsume) {
      throw new AppError(`Not enough stock for material ${material.name}`, 400);
    }

    material.quantity -= qtyToConsume;
    await material.save();
  }
};
