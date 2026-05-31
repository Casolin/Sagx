import type { Request, Response } from "express";
import {
  createMaterial,
  getAllMaterials,
  getMaterialById,
  updateMaterialStock,
  deleteMaterial,
} from "./material.service.js";

export const create = async (req: Request, res: Response) => {
  try {
    const material = await createMaterial(req.body);

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

export const updateStock = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid material id",
      });
    }

    const { quantity } = req.body;

    if (typeof quantity !== "number") {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a number",
      });
    }

    const material = await updateMaterialStock(id, quantity);

    res.json({
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

export const remove = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid material id",
      });
    }

    const deleted = await deleteMaterial(id);

    res.json({
      success: true,
      data: deleted,
    });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }
};
