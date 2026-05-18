import type { Request, Response } from "express";
import {
  createAlert,
  getAllAlerts,
  diagnoseAlert,
  getAlertById,
  updateAlert,
  updateAlertStatus,
  deleteAlert,
} from "./alert.service.js";

import { broadcastKpiUpdate } from "../../utils/kpi.helper.js";
import {
  broadcastAlertCreated,
  broadcastAlertUpdated,
  broadcastAlertDeleted,
} from "../../utils/alert.helper.js";

const getParam = (param: unknown): string => {
  if (typeof param === "string") return param;
  if (Array.isArray(param)) return param[0];
  throw new Error("Invalid param");
};

export const create = async (req: any, res: Response) => {
  try {
    const userId = req.user?._id || req.user?.id;

    const result = await createAlert(req.body, userId);

    await broadcastKpiUpdate();
    await broadcastAlertCreated(result);

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const diagnose = async (req: any, res: Response) => {
  const userId = req.user?.id;

  const alert = await diagnoseAlert(req.params.alertId, req.body, userId);
  await broadcastKpiUpdate();

  return res.json({ success: true, data: alert });
};

export const getAll = async (req: any, res: Response) => {
  const user = req.user;

  const normalizedUser = {
    ...user,
    _id: user?._id || user?.id,
  };

  const alerts = await getAllAlerts(normalizedUser);

  return res.json({ success: true, data: alerts });
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const alert = await getAlertById(getParam(req.params.alertId));
    return res.json({ success: true, data: alert });
  } catch (error: any) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

export const update = async (req: any, res: Response) => {
  try {
    const alert = await updateAlert(req.params.alertId, req.body);
    await broadcastKpiUpdate();
    await broadcastAlertUpdated(alert);
    return res.json({ success: true, data: alert });
  } catch (error: any) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const alert = await updateAlertStatus(
      getParam(req.params.alertId),
      req.body.status,
    );
    await broadcastKpiUpdate();
    await broadcastAlertUpdated(alert);
    return res.json({ success: true, data: alert });
  } catch (error: any) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const alert = await deleteAlert(getParam(req.params.alertId));
    await broadcastKpiUpdate();
    await broadcastAlertDeleted(alert);
    return res.json({ success: true, data: alert });
  } catch (error: any) {
    return res.status(404).json({ success: false, message: error.message });
  }
};
