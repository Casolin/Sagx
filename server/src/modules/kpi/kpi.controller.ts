import type { Request, Response } from "express";
import { getKpiStats, getTechnicianKpis } from "./kpi.service.js";

export const getKpis = async (_req: Request, res: Response) => {
  try {
    const stats = await getKpiStats();

    return res.status(200).json({
      success: true,
      data: stats,
      message: "KPI statistics retrieved successfully",
    });
  } catch (error: any) {
    console.error("Error fetching KPI stats:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch KPI stats",
    });
  }
};

export const getMyKpis = async (req: Request, res: Response) => {
  try {
    const stats = await getTechnicianKpis((req as any).user.id);

    return res.status(200).json({
      success: true,
      data: stats,
      message: "Technician KPI retrieved successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch technician KPI",
    });
  }
};
