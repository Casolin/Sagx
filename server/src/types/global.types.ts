import type { Request } from "express";
import { UserRole } from "../modules/users/user.types.js";

export interface JwtPayload {
  id: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
  role: "ADMIN" | "MANAGER" | "TECHNICIAN";
}
