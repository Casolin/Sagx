import Mission from "../missions/mission.model.js";
import User from "../users/user.model.js";
import Machine from "../machines/machine.model.js";
import Alert from "../alert/alert.model.js";

export const getKpiStats = async () => {
  // =========================
  // MISSIONS
  // =========================
  const totalMissions = await Mission.countDocuments();

  const missionStatuses = await Mission.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const statusMap: Record<string, number> = {
    PENDING: 0,
    ASSIGNED: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };

  missionStatuses.forEach((item) => {
    statusMap[item._id] = item.count;
  });

  // =========================
  // TASKS
  // =========================
  const taskStats = await Mission.aggregate([
    { $unwind: "$tasks" },
    { $group: { _id: "$tasks.status", count: { $sum: 1 } } },
  ]);

  const taskStatusMap: Record<string, number> = {
    PENDING: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    BLOCKED: 0,
  };

  taskStats.forEach((item) => {
    taskStatusMap[item._id] = item.count;
  });

  const totalTasks = Object.values(taskStatusMap).reduce((a, b) => a + b, 0);

  // =========================
  // TECHNICIANS
  // =========================
  const technicians = await User.find({ role: "TECHNICIAN" });

  const technicianTaskStats = await Mission.aggregate([
    { $unwind: "$tasks" },
    { $match: { "tasks.status": "COMPLETED" } },
    { $group: { _id: "$assignedTo", completedTasks: { $sum: 1 } } },
  ]);

  const technicianStats = technicians.map((tech) => {
    const completed =
      technicianTaskStats.find((t) => t._id?.toString() === tech._id.toString())
        ?.completedTasks || 0;

    return {
      id: tech._id,
      name: `${tech.firstName} ${tech.lastName}`,
      skills: tech.skills,
      availability: tech.availability,
      currentTasks: tech.currentTasks || 0,
      completedTasks: completed,
    };
  });

  // =========================
  // MACHINES
  // =========================
  const totalMachines = await Machine.countDocuments();

  const machineStatusStats = await Machine.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const machineConditionStats = await Machine.aggregate([
    { $group: { _id: "$condition", count: { $sum: 1 } } },
  ]);

  const machineStatusMap: Record<string, number> = {
    OK: 0,
    DOWN: 0,
    MAINTENANCE: 0,
  };

  machineStatusStats.forEach((item) => {
    machineStatusMap[item._id] = item.count;
  });

  const machineConditionMap: Record<string, number> = {
    NORMAL: 0,
    ANOMALY: 0,
    FAILURE: 0,
  };

  machineConditionStats.forEach((item) => {
    machineConditionMap[item._id] = item.count;
  });

  // =========================
  // ALERTS
  // =========================
  const totalAlerts = await Alert.countDocuments();

  const alertStats = await Alert.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const alertStatusMap: Record<string, number> = {
    OPEN: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
  };

  alertStats.forEach((item) => {
    alertStatusMap[item._id] = item.count;
  });

  // =========================
  // FINAL RESPONSE
  // =========================
  return {
    missions: { total: totalMissions, ...statusMap },
    tasks: { total: totalTasks, ...taskStatusMap },
    technicians: technicianStats,

    machines: {
      total: totalMachines,
      status: machineStatusMap,
      condition: machineConditionMap,
    },

    alerts: {
      total: totalAlerts,
      ...alertStatusMap,
    },
  };
};

export const getTechnicianKpis = async (userId: string) => {
  const technician = await User.findById(userId);

  if (!technician) throw new Error("Technician not found");

  const missions = await Mission.find({
    assignedTo: userId,
  })
    .sort({ createdAt: -1 })
    .limit(10);

  const totalMissions = await Mission.countDocuments({
    assignedTo: userId,
  });

  const activeMissions = await Mission.countDocuments({
    assignedTo: userId,
    status: { $in: ["ASSIGNED", "IN_PROGRESS"] },
  });

  const taskStats = await Mission.aggregate([
    { $match: { assignedTo: technician._id } },
    { $unwind: "$tasks" },
    {
      $group: {
        _id: "$tasks.status",
        count: { $sum: 1 },
      },
    },
  ]);

  const taskMap: Record<string, number> = {
    PENDING: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    BLOCKED: 0,
  };

  taskStats.forEach((t) => {
    taskMap[t._id] = t.count;
  });

  const totalTasks = Object.values(taskMap).reduce((a, b) => a + b, 0);

  const alerts = await Alert.find({
    missionId: { $in: missions.map((m) => m._id) },
  });

  const alertMap = {
    OPEN: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
  };

  alerts.forEach((a) => {
    alertMap[a.status]++;
  });

  return {
    myMissions: {
      total: totalMissions,
      active: activeMissions,
    },

    myMissionsList: missions.map((m) => ({
      id: m._id,
      title: m.title,
      status: m.status,
    })),

    myTasks: {
      total: totalTasks,
      ...taskMap,
    },

    alerts: {
      total: alerts.length,
      ...alertMap,
    },

    activities: [],
  };
};
