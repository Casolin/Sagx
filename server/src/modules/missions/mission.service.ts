import Mission from "./mission.model.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateMissionDTO } from "./mission.types.js";

const basePopulate = [
  { path: "createdBy", select: "firstName lastName email avatar" },
  { path: "assignedTo", select: "firstName lastName email avatar" },
];

export const createMission = async (data: CreateMissionDTO, userId: string) => {
  if (!data.machine) {
    throw new AppError("Machine is required", 400);
  }

  const exists = await Mission.findOne({
    machine: data.machine,
    status: { $in: ["PENDING", "ASSIGNED", "IN_PROGRESS"] },
  });

  if (exists) {
    throw new AppError("Active mission already exists for this machine", 409);
  }

  return Mission.create({
    ...data,
    machine: data.machine,
    createdBy: userId,
  });
};

export const getAllMissions = async (user: any) => {
  const baseQuery = Mission.find().populate(basePopulate);

  if (user.role === "TECHNICIAN") {
    baseQuery.where({ assignedTo: user.id });
  }

  return baseQuery;
};
export const getMissionById = async (id: string) => {
  const mission = await Mission.findById(id).populate(basePopulate);
  if (!mission) throw new AppError("Mission not found", 404);
  return mission;
};

export const updateMission = async (id: string, data: any) => {
  const mission = await Mission.findByIdAndUpdate(id, data, {
    new: true,
  }).populate(basePopulate);

  if (!mission) throw new AppError("Mission not found", 404);
  return mission;
};

export const deleteMission = async (id: string) => {
  const mission = await Mission.findByIdAndDelete(id);
  if (!mission) throw new AppError("Mission not found", 404);
  return mission;
};
