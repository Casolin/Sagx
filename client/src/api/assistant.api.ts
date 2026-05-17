import api from "./axios";
import type {
  AI_AssignMissionDTO,
  AI_AssignResponse,
} from "../types/global.types";

export const sendAssistantMessage = async (message: string) => {
  const res = await api.post("/assistant", { message });
  return res.data;
};

export const assignTechnician = async (
  data: AI_AssignMissionDTO,
): Promise<AI_AssignResponse> => {
  const res = await api.post<AI_AssignResponse>("/assign", data);
  return res.data;
};

export const generateMissionReport = async (missionId: string) => {
  const res = await api.post("/generate_report", { missionId });
  return res.data;
};
