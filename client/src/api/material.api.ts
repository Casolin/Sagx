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
