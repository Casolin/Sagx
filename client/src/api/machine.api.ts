import api from "./axios";
import type {
  Machine,
  MachineStatus,
  CreateMachineDTO,
  UpdateMachineDTO,
  ApiResponse,
} from "../types/global.types";

export const getMachines = async (): Promise<Machine[]> => {
  const res = await api.get<ApiResponse<Machine[]>>("/api/machines");
  return res.data.data;
};

export const getMachine = async (id: string): Promise<Machine> => {
  const res = await api.get<ApiResponse<Machine>>(`/api/machines/${id}`);
  return res.data.data;
};

export const createMachine = async (
  data: CreateMachineDTO,
): Promise<Machine> => {
  const res = await api.post<Machine>("/api/machines/create", data);
  return res.data;
};

export const updateMachine = async (
  id: string,
  data: UpdateMachineDTO,
): Promise<Machine> => {
  const res = await api.put<Machine>(`/api/machines/${id}/update`, data);
  return res.data;
};

export const updateMachineStatus = async (
  id: string,
  data: { status: MachineStatus },
): Promise<Machine> => {
  const res = await api.patch<Machine>(`/api/machines/${id}/status`, data);
  return res.data;
};

export const deleteMachine = async (
  id: string,
): Promise<{ message: string }> => {
  const res = await api.delete<{ message: string }>(
    `/api/machines/${id}/delete`,
  );
  return res.data;
};
