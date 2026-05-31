import api from "./axios";
import type { Material, CreateMaterialDTO } from "../types/global.types";

export const getMaterials = async (): Promise<Material[]> => {
  const res = await api.get("/api/materials");
  return res.data.data;
};

export const getMaterial = async (id: string): Promise<Material> => {
  const res = await api.get<Material>(`/api/materials/${id}`);
  return res.data;
};

export const createMaterial = async (
  data: CreateMaterialDTO,
): Promise<Material> => {
  const res = await api.post<Material>("/api/materials", data);
  return res.data;
};

export const updateMaterialStock = async (
  id: string,
  quantity: number,
): Promise<Material> => {
  const res = await api.patch(`/api/materials/${id}/stock`, {
    quantity,
  });

  return res.data.data;
};

export const deleteMaterial = async (id: string): Promise<Material> => {
  const res = await api.delete(`/api/materials/${id}`);
  return res.data.data;
};
