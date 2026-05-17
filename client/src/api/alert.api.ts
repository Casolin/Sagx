import api from "./axios";
import type { Alert, FailureType, Priority } from "../types/global.types";

export const getAlerts = async (): Promise<Alert[]> => {
  const res = await api.get("/api/alerts");
  return res.data.data;
};

export const getAlert = async (id: string): Promise<Alert> => {
  const res = await api.get<Alert>(`/api/alerts/${id}`);
  return res.data;
};

export const createAlert = async (data: Partial<Alert>): Promise<Alert> => {
  const res = await api.post<Alert>("/api/alerts/create", data);
  return res.data;
};

export const diagnoseAlert = async (
  id: string,
  data: { failureType?: FailureType },
): Promise<Alert> => {
  const res = await api.patch<Alert>(`/api/alerts/${id}/diagnose`, data);
  return res.data;
};

export const updateAlert = async (
  id: string,
  data: {
    status?: string;
    priority?: Priority;
    message?: string;
  },
): Promise<Alert> => {
  const res = await api.patch(`/api/alerts/${id}/update`, data);
  return res.data.data;
};

export const updateAlertStatus = async (
  id: string,
  data: { status?: string; priority?: Priority },
): Promise<Alert> => {
  const res = await api.patch<Alert>(`/api/alerts/${id}/status`, data);
  return res.data;
};

export const deleteAlert = async (id: string) => {
  const res = await api.delete(`/api/alerts/${id}/delete`);
  return res.data;
};
