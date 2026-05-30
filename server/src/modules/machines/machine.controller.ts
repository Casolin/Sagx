import type { Request, Response } from "express";
import {
  createMachine,
  getAllMachines,
  getMachineById,
  updateMachine,
  deleteMachine,
} from "./machine.service.js";

import { broadcastKpiUpdate } from "../../utils/kpi.helper.js";
import {
  broadcastMachineCreated,
  broadcastMachineUpdated,
  broadcastMachineDeleted,
} from "../../utils/machine.helper.js";

import Alert from "../alert/alert.model.js";

import { resolveMaterials } from "../materials/material.service.js";
import { createMission } from "../missions/mission.service.js";
import User from "../users/user.model.js";

import Mission from "../missions/mission.model.js";

/* ---------------- TASK BUILDER ---------------- */
const buildTasks = (alertType: string, machine: any) => {
  const buildTask = (task: any) => ({
    ...task,
    machine: machine._id.toString(),
    source: "AUTO",
  });

  switch (alertType) {
    case "MACHINE_FAILURE":
    case "DOWN":
      return [
        buildTask({
          title: "Emergency Diagnosis",
          description: "Identify critical failure cause",
          status: "PENDING",
          priority: "HIGH",
        }),

        buildTask({
          title: "Emergency Repair",
          description: "Fix the system immediately",
          status: "PENDING",
          priority: "HIGH",
        }),

        buildTask({
          title: "System Restart & Validation",
          description: "Ensure machine is stable",
          status: "PENDING",
          priority: "MEDIUM",
        }),
      ];

    case "FAILURE":
      return [
        buildTask({
          title: "Failure Analysis",
          description: "Inspect failed component",
          status: "PENDING",
          priority: "HIGH",
        }),

        buildTask({
          title: "Component Replacement",
          description: "Replace damaged part",
          status: "PENDING",
          priority: "HIGH",
        }),
      ];

    case "MAINTENANCE":
      return [
        buildTask({
          title: "Preventive Inspection",
          description: "Check machine health",
          status: "PENDING",
          priority: "MEDIUM",
        }),

        buildTask({
          title: "Cleaning & Calibration",
          description: "Standard maintenance procedure",
          status: "PENDING",
          priority: "LOW",
        }),
      ];

    case "ANOMALY":
      return [
        buildTask({
          title: "Sensor Check",
          description: "Validate sensor readings",
          status: "PENDING",
          priority: "MEDIUM",
        }),
      ];

    default:
      return [];
  }
};

/* ---------------- PARAM SAFE ---------------- */
const getParam = (param: unknown): string => {
  if (typeof param === "string") return param;
  if (Array.isArray(param) && typeof param[0] === "string") return param[0];
  throw new Error("Invalid param");
};

/* ---------------- CREATE MACHINE ---------------- */
export const create = async (req: any, res: Response) => {
  const userId = req.user?._id?.toString() || req.user?.id?.toString();

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user",
    });
  }

  const machine = await createMachine({
    ...req.body,
    createdBy: userId,
  });

  await broadcastKpiUpdate();
  await broadcastMachineCreated(machine);

  return res.status(201).json({ success: true, data: machine });
};

/* ---------------- GET ---------------- */
export const getAll = async (_req: Request, res: Response) => {
  const machines = await getAllMachines();
  return res.json({ success: true, data: machines });
};

export const getOne = async (req: Request, res: Response) => {
  const machine = await getMachineById(getParam(req.params.machineId));
  return res.json({ success: true, data: machine });
};

/* ---------------- UPDATE BASIC (KEPT BUT SAFE) ---------------- */
export const update = async (req: any, res: Response) => {
  const { machine, previousStatus } = await updateMachine(
    req.params.machineId,
    req.body,
  );

  const userId = req.user?._id?.toString() || req.user?.id?.toString();

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  await broadcastKpiUpdate();
  await broadcastMachineUpdated(machine);
  return res.json({ success: true, data: machine });
};

/* ---------------- STATUS UPDATE (ONLY MISSION CREATOR) ---------------- */
export const updateStatus = async (req: any, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.user?.id?.toString();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const machineId = req.params.machineId;

    // 1️⃣ Get open alerts FIRST (before updating machine)
    const openAlerts = await Alert.find({
      machine: machineId,
      status: { $ne: "RESOLVED" },
    }).sort({ createdAt: -1 });

    const activeAlert = openAlerts[0];

    // 2️⃣ BLOCK invalid status changes
    if (
      (req.body.status === "DOWN" || req.body.status === "MAINTENANCE") &&
      !activeAlert
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot set machine to DOWN/MAINTENANCE without an active alert",
      });
    }

    // 3️⃣ NOW update machine safely
    const { machine, previousStatus, previousCondition } = await updateMachine(
      machineId,
      {
        status: req.body.status,
        condition: req.body.condition,
        failureType: req.body.failureType,
      },
    );

    await broadcastKpiUpdate();
    await broadcastMachineUpdated(machine);

    const failureType = machine.failureType || "UNKNOWN";

    // 4️⃣ If no alert → do nothing (NO mission creation)
    if (!activeAlert) {
      return res.json({
        success: true,
        data: machine,
      });
    }

    // 5️⃣ Avoid duplicate missions
    const existingMission = await Mission.findOne({
      machine: machine._id,
      status: { $in: ["PENDING", "ASSIGNED", "IN_PROGRESS"] },
    });

    if (existingMission) {
      return res.json({
        success: true,
        data: { machine, mission: existingMission },
      });
    }

    // 6️⃣ Materials
    let materials: any[] = [];
    try {
      materials = await resolveMaterials(failureType, machine.type);
    } catch {
      materials = [];
    }

    // 7️⃣ Tasks from alert type
    const tasks = buildTasks(activeAlert.type || "FAILURE", machine);

    // 8️⃣ Mark alert in progress
    activeAlert.status = "IN_PROGRESS";
    await activeAlert.save();

    // 9️⃣ Create mission (linked to alert safely)
    const mission = await createMission(
      {
        title: `${activeAlert.type} - ${machine.name}`,
        description: activeAlert.message || "Auto generated mission",
        priority: activeAlert.priority || "MEDIUM",
        machine: machine._id.toString(),
        requiredSkills: [machine.type, failureType],
        materials: materials.map((m) => ({
          materialId: m._id,
          quantity: 1,
        })),
        tasks,
        machineType: machine.type,
        condition: machine.condition,
        failureType,
        alertId: activeAlert._id.toString(), // FIXED TYPE ISSUE
        source: "AUTO",
      },
      userId,
    );

    // 🔟 Link alert → mission
    activeAlert.missionId = mission._id;
    activeAlert.status = "IN_PROGRESS";
    await activeAlert.save();

    // 1️⃣1️⃣ Assign technician (AI fallback included)
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

    let assignedTech: any = null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${process.env.AI_URL}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requiredSkills: [machine.type, failureType],
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

    // fallback technician
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

    // 1️⃣2️⃣ Assign mission
    mission.assignedTo = assignedTech.id;
    mission.status = "ASSIGNED";
    await mission.save();

    const updatedUser = await User.findByIdAndUpdate(
      assignedTech.id,
      {
        $inc: { currentTasks: 1 },
        $addToSet: { assignedMissions: mission._id },
      },
      { new: true },
    );

    await User.findByIdAndUpdate(assignedTech.id, {
      availability:
        (updatedUser?.currentTasks ?? 0) < (updatedUser?.maxTasks ?? 5),
    });

    return res.json({
      success: true,
      data: {
        machine,
        mission,
        assignedTo: assignedTech,
      },
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
  const machine = await deleteMachine(getParam(req.params.machineId));
  await broadcastKpiUpdate();
  await broadcastMachineDeleted(machine);
  return res.json({ success: true, data: machine });
};
