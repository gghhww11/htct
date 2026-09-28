import type { Request, Response, NextFunction } from "express";
import { ACCESS_COOKIE } from "./cookies";
import { verifyAccessToken } from "./tokens";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[ACCESS_COOKIE];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const payload = verifyAccessToken(token); // { adminId }
    (req as any).auth = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
