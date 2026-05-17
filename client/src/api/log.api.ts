import api from "./axios";

export const getLogs = async () => {
  const res = await api.get("/api/logs");
  return res.data;
};
