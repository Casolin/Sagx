import Alert from "./alert.model.js";
import { AppError } from "../../utils/AppError.js";
import Machine from "../machines/machine.model.js";

export const createAlert = async (data: any, userId: string) => {
  if (!userId) throw new AppError("User not authenticated", 401);

  const machine = await Machine.findById(data.machine);
  if (!machine) throw new AppError("Machine not found", 404);

  const alert = await Alert.create({
    ...data,
    createdBy: userId,
  });

  return { alert };
};

export const diagnoseAlert = async (id: string, data: any, userId: string) => {
  const alert = await Alert.findById(id);
  if (!alert) throw new AppError("Alert not found", 404);

  alert.type = data.type || alert.type;
  alert.message = data.diagnosis || alert.message;

  (alert as any).rootCause = data.rootCause;
  (alert as any).diagnosedBy = userId;

  await alert.save();
  return alert;
};

export const getAllAlerts = async (user: any) => {
  const query: any = {};

  if (user.role === "TECHNICIAN") {
    query.createdBy = user._id;
  }

  return Alert.find(query)
    .populate("machine")
    .populate("missionId")
    .populate("createdBy");
};

export const getAlertById = async (id: string) => {
  const alert = await Alert.findById(id)
    .populate("machine")
    .populate("missionId");

  if (!alert) throw new AppError("Alert not found", 404);
  return alert;
};

export const updateAlert = async (id: string, data: any) => {
  const alert = await Alert.findById(id);
  if (!alert) throw new AppError("Alert not found", 404);

  if (data.status) alert.status = data.status;
  if (data.priority) alert.priority = data.priority;
  if (data.message) alert.message = data.message;

  await alert.save();
  return alert;
};

export const updateAlertStatus = async (id: string, status: string) => {
  const alert = await Alert.findByIdAndUpdate(id, { status }, { new: true });
  if (!alert) throw new AppError("Alert not found", 404);
  return alert;
};

export const deleteAlert = async (id: string) => {
  const alert = await Alert.findByIdAndDelete(id);
  if (!alert) throw new AppError("Alert not found", 404);
  return alert;
};
