import api from "./axios";
import type {
  Mission,
  CreateMissionDTO,
  UpdateMissionDTO,
  UpdateTaskStatusDTO,
  MissionsResponse,
  ApiResponse,
} from "../types/global.types";

import aiApi from "./aiAxios";

export const getMissions = async (): Promise<Mission[]> => {
  const res = await api.get<MissionsResponse>("/api/mission");
  return res.data.data;
};

export const getMission = async (id: string): Promise<Mission> => {
  const res = await api.get<ApiResponse<Mission>>(`/api/mission/${id}`);

  return res.data.data;
};

export const createMission = async (
  data: CreateMissionDTO,
): Promise<Mission> => {
  const res = await api.post<Mission>("/api/mission/create", data);
  return res.data;
};

export const updateMission = async (
  id: string,
  data: UpdateMissionDTO,
): Promise<Mission> => {
  const res = await api.put<Mission>(`/api/mission/${id}/update`, data);
  return res.data;
};

export const deleteMission = async (
  id: string,
): Promise<{ message: string }> => {
  const res = await api.delete<{ message: string }>(
    `/api/mission/${id}/delete`,
  );
  return res.data;
};

export const updateTaskStatus = async (
  missionId: string,
  taskId: string,
  data: UpdateTaskStatusDTO,
): Promise<Mission> => {
  const res = await api.patch<Mission>(
    `/api/mission/${missionId}/tasks/${taskId}/status`,
    data,
  );
  return res.data;
};

export const generateMissionReport = async (
  missionId: string,
): Promise<string> => {
  const res = await aiApi.post<{
    download_url: string;
  }>("/generate_report", {
    missionId,
  });

  return res.data.download_url;
};
