export const validMissionStatuses = [
  "PENDING",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

export type MissionStatusType = (typeof validMissionStatuses)[number];
