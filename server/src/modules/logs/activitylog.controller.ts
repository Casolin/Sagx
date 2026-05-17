import ActivityLog from "./activitylog.model.js";

export const getAllLogs = async (req: any, res: any) => {
  const logs = await ActivityLog.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  res.json(logs);
};
