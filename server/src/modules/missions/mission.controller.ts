import type { Request, Response } from "express";
import Mission from "./mission.model.js";
import User from "../users/user.model.js";

import {
  createMission,
  getAllMissions,
  getMissionById,
  updateMission,
  deleteMission,
} from "./mission.service.js";

import { emitToUser } from "../../sockets/socket.service.js";
import { SOCKET_EVENTS } from "../../sockets/socket.events.js";

import Alert from "../alert/alert.model.js";
import { createActivityLog } from "../logs/activitylog.service.js";
import { createNotification } from "../notification/notification.service.js";

/* ---------------- SAFE PARAM ---------------- */
const getParam = (param: unknown): string => {
  if (typeof param === "string") return param;
  if (Array.isArray(param) && typeof param[0] === "string") return param[0];
  throw new Error("Missing or invalid parameter");
};

/* ---------------- RELEASE TECHNICIAN ---------------- */
const releaseTechnician = async (mission: any) => {
  if (!mission.assignedTo) return;

  const UserModel = (await import("../users/user.model.js")).default;

  await UserModel.findByIdAndUpdate(mission.assignedTo, {
    $inc: { currentTasks: -1 },
    $pull: { assignedMissions: mission._id },
  });
};

/* ---------------- CREATE ---------------- */
export const create = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (req.body.machine) {
      const existingMission = await Mission.findOne({
        machine: req.body.machine,
        status: { $nin: ["COMPLETED", "CANCELLED"] },
      });

      if (existingMission) {
        return res.status(400).json({
          success: false,
          message: "This machine already has an active mission",
        });
      }
    }

    const mission = await createMission(
      {
        ...req.body,
        source: "MANUAL",
      },
      user.id,
    );

    if (req.body.alertId) {
      const alert = await Alert.findById(req.body.alertId);

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: "Alert not found",
        });
      }

      if (
        alert.machine &&
        alert.machine.toString() !== req.body.machine?.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: "Alert does not belong to this machine",
        });
      }

      alert.missionId = mission._id;
      alert.status = "IN_PROGRESS";
      await alert.save();
    }

    const techniciansFromDB = await User.find({
      role: "TECHNICIAN",
      availability: true,
      status: "ACTIVE",
      $expr: { $lt: ["$currentTasks", "$maxTasks"] },
    }).select("_id skills experience currentTasks maxTasks availability");

    const cleanedTechnicians = techniciansFromDB.map((t) => ({
      id: t._id.toString(),
      skills: t.skills,
      experience: t.experience || 1,
      currentTasks: t.currentTasks || 0,
      maxTasks: t.maxTasks || 5,
      availability: t.availability,
    }));

    let assignedTech = null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${process.env.AI_URL}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requiredSkills: mission.requiredSkills,
          technicians: cleanedTechnicians,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        assignedTech = data?.data?.assignedTechnician || null;
      }
    } catch {}

    if (!assignedTech) {
      const fallback = cleanedTechnicians[0];
      if (!fallback) {
        return res.status(400).json({
          success: false,
          message: "No technicians available",
        });
      }
      assignedTech = { id: fallback.id };
    }

    mission.assignedTo = assignedTech.id;
    mission.status = "ASSIGNED";
    await mission.save();

    const UserModel = (await import("../users/user.model.js")).default;

    const updatedUser = await UserModel.findByIdAndUpdate(
      assignedTech.id,
      {
        $inc: { currentTasks: 1 },
        $addToSet: { assignedMissions: mission._id },
      },
      { new: true },
    );

    await UserModel.findByIdAndUpdate(assignedTech.id, {
      availability:
        (updatedUser?.currentTasks ?? 0) < (updatedUser?.maxTasks ?? 5),
    });

    await createActivityLog({
      userId: user.id,
      action: "MISSION_CREATED",
      entityType: "MISSION",
      entityId: mission._id,
      description: "Mission created",
    });

    const senderName = user?.firstName?.trim() ? user.firstName : "Someone";

    const notification = await createNotification({
      userId: assignedTech.id,
      title: "New Mission Assigned",
      message: `${senderName} assigned you a new mission`,
      type: "MISSION",
      relatedId: mission._id,
    });

    emitToUser(assignedTech.id, SOCKET_EVENTS.NOTIFICATION_NEW, notification);

    return res.status(201).json({
      success: true,
      data: { mission, assignedTo: assignedTech },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/* ---------------- GET ---------------- */
export const getAll = async (req: Request, res: Response) => {
  const user = (req as any).user;

  const missions = await getAllMissions(user);

  return res.json({ success: true, data: missions });
};

export const getOne = async (req: Request, res: Response) => {
  const mission = await getMissionById(getParam(req.params.missionId));
  return res.json({ success: true, data: mission });
};

/* ---------------- UPDATE ---------------- */
export const update = async (req: Request, res: Response) => {
  const mission = await updateMission(getParam(req.params.missionId), req.body);

  await createActivityLog({
    userId: (req as any).user.id,
    action: "MISSION_UPDATED",
    entityType: "MISSION",
    entityId: mission._id,
    description: "Mission updated",
  });

  return res.json({ success: true, data: mission });
};

/* ---------------- DELETE ---------------- */
export const remove = async (req: Request, res: Response) => {
  const missionId = getParam(req.params.missionId);

  const mission = await deleteMission(missionId);

  await createActivityLog({
    userId: (req as any).user.id,
    action: "MISSION_DELETED",
    entityType: "MISSION",
    entityId: missionId,
    description: "Mission deleted",
  });

  return res.json({ success: true, data: mission });
};

/* ---------------- TASK UPDATE ---------------- */
export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const missionId = getParam(req.params.missionId);
    const taskId = getParam(req.params.taskId);
    const status = req.body.status;

    const mission = await Mission.findById(missionId);
    if (!mission) {
      return res
        .status(404)
        .json({ success: false, message: "Mission not found" });
    }

    const task = mission.tasks.id(taskId);
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    task.status = status;

    if (status === "COMPLETED") {
      task.progress = 100;

      if (mission.assignedTo) {
        const UserModel = (await import("../users/user.model.js")).default;
        const assignedToId =
          typeof mission.assignedTo === "string"
            ? mission.assignedTo
            : mission.assignedTo._id?.toString() || mission.assignedTo;

        await UserModel.findByIdAndUpdate(assignedToId, {
          $inc: { totalTasksDone: 1 },
        });
      }
    }

    const total = mission.tasks.length;
    const done = mission.tasks.filter((t) => t.status === "COMPLETED").length;

    mission.progress = total === 0 ? 0 : Math.round((done / total) * 100);

    const allDone = mission.tasks.every((t) => t.status === "COMPLETED");
    const anyInProgress = mission.tasks.some((t) => t.status === "IN_PROGRESS");

    if (allDone) {
      mission.status = "COMPLETED";

      const MachineModel = (await import("../machines/machine.model.js"))
        .default;

      const machineIds = new Set<string>();

      if (mission.machine) machineIds.add(mission.machine.toString());
      for (const t of mission.tasks) {
        if (t.machine) machineIds.add(t.machine.toString());
      }

      for (const id of machineIds) {
        await MachineModel.findByIdAndUpdate(id, {
          status: "OK",
          condition: "NORMAL",
          failureType: "NONE",
        });
      }

      if (mission.alertId) {
        await Alert.findByIdAndUpdate(mission.alertId, {
          status: "RESOLVED",
        });
      }

      if (mission.assignedTo) {
        const UserModel = (await import("../users/user.model.js")).default;

        const scoreMap: Record<string, number> = {
          LOW: 2,
          MEDIUM: 5,
          HIGH: 10,
          URGENT: 15,
        };

        const points = scoreMap[mission.priority] || 5;

        const assignedToId =
          typeof mission.assignedTo === "string"
            ? mission.assignedTo
            : mission.assignedTo._id?.toString() || mission.assignedTo;

        await UserModel.findByIdAndUpdate(assignedToId, {
          $inc: { workloadScore: points },
        });
      }

      await releaseTechnician(mission);
    } else if (anyInProgress) {
      mission.status = "IN_PROGRESS";
    }

    await mission.save();

    await createActivityLog({
      userId: (req as any).user.id,
      action: "TASK_UPDATED",
      entityType: "MISSION",
      entityId: mission._id,
      description: `Task ${taskId} updated`,
    });

    return res.json({ success: true, data: mission });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
