import { Types } from "mongoose";

export enum MissionStatus {
  PENDING = "PENDING",
  ASSIGNED = "ASSIGNED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export type MissionPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface IMission {
  title: string;
  description: string;
  requiredSkills: string[];
  status: MissionStatus;
  priority: MissionPriority;
  machine?: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  alertId?: Types.ObjectId;

  materials?: {
    materialId: Types.ObjectId;
    quantity: number;
  }[];

  createdBy: Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateMissionDTO {
  title: string;
  description: string;
  priority: MissionPriority;
  status?: MissionStatus;
  requiredSkills: string[];
  machine?: string;
  alertId?: string;

  machineType?: string;
  condition?: string;
  failureType?: string;
  source?: "AUTO" | "MANUAL";

  materials?: {
    materialId: string;
    quantity: number;
  }[];

  tasks: {
    title: string;
    description?: string;
    priority?: MissionPriority;
    machine?: string;
  }[];
}
