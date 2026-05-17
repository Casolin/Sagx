import api from "./axios";

export const getKpis = async () => {
  const res = await api.get("/api/kpi");
  return res.data;
};

export const getMyKpis = async () => {
  const res = await api.get("/api/kpi/technician");
  return res.data;
};
