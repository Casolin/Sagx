import type { Request, Response } from "express";
import {
  createMaterial,
  getAllMaterials,
  getMaterialById,
} from "./material.service.js";

import { createActivityLog } from "../logs/activitylog.service.js";

export const create = async (req: Request, res: Response) => {
  try {
    const material = await createMaterial(req.body);

    await createActivityLog({
      userId: (req as any).user?.id,
      action: "MATERIAL_CREATED",
      entityType: "MATERIAL",
      entityId: material._id,
      description: `Material ${material.name} created`,
    });

    res.status(201).json({
      success: true,
      data: material,
    });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getAll = async (_req: Request, res: Response) => {
  try {
    const materials = await getAllMaterials();

    res.json({
      success: true,
      data: materials,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid material id",
      });
    }

    const material = await getMaterialById(id);

    res.json({
      success: true,
      data: material,
    });
  } catch (err: any) {
    res.status(err.statusCode || 404).json({
      success: false,
      message: err.message,
    });
  }
};
