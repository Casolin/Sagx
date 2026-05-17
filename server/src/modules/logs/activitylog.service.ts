import ActivityLog from "./activitylog.model.js";

export const createActivityLog = async ({
  userId,
  action,
  entityType,
  entityId,
  description,
}: any) => {
  return await ActivityLog.create({
    userId,
    action,
    entityType,
    entityId,
    description,
  });
};
