import { createMission } from "../missions/mission.service.js";

export const handleMachineFailure = async (machine: any, userId: string) => {
  const failureType = machine.failureType || machine.condition;

  const mission = await createMission(
    {
      title: `Repair ${machine.name}`,
      description: `Auto-generated mission due to ${failureType}`,

      machine: machine._id,

      priority: "HIGH",
      requiredSkills: [failureType],

      tasks: [
        { title: "Diagnose issue", status: "PENDING" },
        { title: "Fix components", status: "PENDING" },
      ],
    },
    userId,
  );

  return mission;
};
