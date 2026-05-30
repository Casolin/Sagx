import type { Request, Response } from "express";
import Mission from "./mission.model.js";
import User from "../users/user.model.js";
import { broadcastKpiUpdate } from "../../utils/kpi.helper.js";

import {
  createMission,
  getAllMissions,
  getMissionById,
  updateMission,
  deleteMission,
} from "./mission.service.js";

import { emitToUser } from "../../sockets/socket.service.js";
import { SOCKET_EVENTS } from "../../sockets/socket.events.js";
import { consumeMaterials } from "../materials/material.service.js";

import Alert from "../alert/alert.model.js";

import { createNotification } from "../notification/notification.service.js";
import { missionEvents } from "../../utils/mission.helper.js";

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

  const updatedUser = await UserModel.findByIdAndUpdate(
    mission.assignedTo,
    {
      $inc: { currentTasks: -1 },
      $pull: { assignedMissions: mission._id },
    },
    { new: true },
  );

  if (!updatedUser) return;

  updatedUser.availability = updatedUser.currentTasks < updatedUser.maxTasks;

  await updatedUser.save();
};

/* ---------------- CREATE ---------------- */
export const create = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!Array.isArray(req.body.materials) || req.body.materials.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one material should be selected",
      });
    }

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

    const isManualAssignment =
      req.body.assignedTo !== undefined &&
      req.body.assignedTo !== null &&
      req.body.assignedTo !== "";

    let assignedTech = null;

    if (isManualAssignment) {
      const tech = await User.findById(req.body.assignedTo);

      if (!tech) {
        return res.status(400).json({
          success: false,
          message: "Technician not found",
        });
      }

      assignedTech = { id: tech._id.toString() };
    }

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
      return res.status(400).json({
        success: false,
        message: "AI could not assign technician",
      });
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

    const senderName = user?.firstName?.trim() ? user.firstName : "Someone";

    const notification = await createNotification({
      userId: assignedTech.id,
      title: "New Mission Assigned",
      message: `${senderName} assigned you a new mission`,
      type: "MISSION",
      relatedId: mission._id,
    });

    emitToUser(assignedTech.id, SOCKET_EVENTS.NOTIFICATION_NEW, notification);
    await broadcastKpiUpdate();
    missionEvents.created(mission);

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
  try {
    const missionId = getParam(req.params.missionId);

    const oldMission = await Mission.findById(missionId);

    if (!oldMission) {
      return res.status(404).json({
        success: false,
        message: "Mission not found",
      });
    }

    const wasAssignedTo = oldMission.assignedTo
      ? oldMission.assignedTo.toString()
      : null;

    const wasCancelled = oldMission.status === "CANCELLED";
    const willBeCancelled = req.body.status === "CANCELLED";

    const mission = await updateMission(missionId, req.body);

    if (!mission) {
      return res.status(404).json({
        success: false,
        message: "Mission not found after update",
      });
    }

    missionEvents.updated(mission);

    if (willBeCancelled && wasAssignedTo && !wasCancelled) {
      const UserModel = (await import("../users/user.model.js")).default;

      await UserModel.findByIdAndUpdate(wasAssignedTo, {
        $inc: { currentTasks: -1 },
        $pull: { assignedMissions: mission._id },
      });

      const user = await UserModel.findById(wasAssignedTo);

      if (user) {
        user.availability = user.currentTasks < user.maxTasks;
        await user.save();
      }

      if (mission.alertId) {
        await Alert.findByIdAndUpdate(mission.alertId, {
          status: "CANCELLED",
        });
      }
    }

    const newTech = req.body.assignedTo?.toString();

    if (newTech && wasAssignedTo && newTech !== wasAssignedTo) {
      const senderName = (req as any).user?.firstName?.trim() || "Someone";

      const notification = await createNotification({
        userId: newTech,
        title: "Mission Reassigned",
        message: `${senderName} reassigned a mission to you`,
        type: "MISSION",
        relatedId: mission._id,
      });

      emitToUser(newTech, SOCKET_EVENTS.NOTIFICATION_NEW, notification);

      emitToUser(newTech, SOCKET_EVENTS.MISSION_CREATED, mission);
    }

    await broadcastKpiUpdate();

    return res.json({
      success: true,
      data: mission,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/* ---------------- DELETE ---------------- */
export const remove = async (req: Request, res: Response) => {
  const missionId = getParam(req.params.missionId);

  const mission = await deleteMission(missionId);

  if (mission?.assignedTo) {
    const UserModel = (await import("../users/user.model.js")).default;

    const user = await UserModel.findById(mission.assignedTo);

    const stillAssigned = user?.assignedMissions?.some(
      (m: any) => m.toString() === mission._id.toString(),
    );

    if (stillAssigned) {
      await UserModel.findByIdAndUpdate(mission.assignedTo, {
        $inc: { currentTasks: -1 },
        $pull: { assignedMissions: mission._id },
      });
    }
  }

  await broadcastKpiUpdate();
  missionEvents.deleted(mission);

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
      const wasNotInProgress = mission.status !== "IN_PROGRESS";

      mission.status = "IN_PROGRESS";

      if (wasNotInProgress && mission.materials?.length) {
        await consumeMaterials(mission.materials);
      }
    }

    await mission.save();

    await broadcastKpiUpdate();
    missionEvents.updated(mission);

    return res.json({ success: true, data: mission });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
