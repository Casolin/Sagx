import Machine from "./machine.model.js";
import { AppError } from "../../utils/AppError.js";

export const createMachine = async (data: any) => {
  return Machine.create(data);
};

export const getAllMachines = async () => {
  return Machine.find();
};

export const getMachineById = async (id: string) => {
  const machine = await Machine.findById(id);

  if (!machine) {
    throw new AppError("Machine not found", 404);
  }

  return machine;
};

export const updateMachine = async (id: string, data: any) => {
  const machine = await Machine.findById(id);

  if (!machine) {
    throw new AppError("Machine not found", 404);
  }

  const previousStatus = machine.status;
  const previousCondition = machine.condition;

  if (data.status !== undefined) machine.status = data.status;
  if (data.condition !== undefined) machine.condition = data.condition;
  if (data.failureType !== undefined) machine.failureType = data.failureType;
  if (data.name !== undefined) machine.name = data.name;
  if (data.type !== undefined) machine.type = data.type;
  if (data.location !== undefined) machine.location = data.location;
  if (data.description !== undefined) machine.description = data.description;

  await machine.save();

  return {
    machine,
    previousStatus,
    previousCondition,
  };
};

export const deleteMachine = async (id: string) => {
  const machine = await Machine.findByIdAndDelete(id);

  if (!machine) {
    throw new AppError("Machine not found", 404);
  }

  return machine;
};
