import type { Express } from "express";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client"; // ✅ NEW: for catching P2002
import { prisma } from "../prisma";
import {
  clearAuthCookies,
  setAuthCookies,
  REFRESH_COOKIE,
  ACCESS_COOKIE,
} from "../auth/cookies";
import {
  hashToken,
  refreshExpiresAt,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
} from "../auth/tokens";

export function registerAuthRoutes(app: Express) {
  // Login
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const payload = { adminId: admin.id };

    const access = signAccessToken(payload);

    // ✅ NEW: make refresh create resilient to rare collisions
    let refresh = signRefreshToken(payload);
    let refreshHash = hashToken(refresh);

    try {
      await prisma.refreshToken.create({
        data: {
          adminId: admin.id,
          tokenHash: refreshHash,
          expiresAt: refreshExpiresAt(),
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        // retry once
        refresh = signRefreshToken(payload);
        refreshHash = hashToken(refresh);

        await prisma.refreshToken.create({
          data: {
            adminId: admin.id,
            tokenHash: refreshHash,
            expiresAt: refreshExpiresAt(),
          },
        });
      } else {
        throw e;
      }
    }

    setAuthCookies(res, access, refresh);
    return res.json({ message: "Login successful" });
  });

  // Refresh (rotate)
  app.post("/api/auth/refresh", async (req, res) => {
    const refresh = req.cookies?.[REFRESH_COOKIE];
    if (!refresh) return res.status(401).json({ message: "Unauthorized" });

    let payload: { adminId: number };
    try {
      payload = verifyRefreshToken(refresh); // returns { adminId } only
    } catch {
      clearAuthCookies(res);
      return res.status(401).json({ message: "Unauthorized" });
    }

    const tokenHash = hashToken(refresh);

    const existing = await prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!existing || existing.revokedAt) {
      clearAuthCookies(res);
      return res.status(401).json({ message: "Unauthorized" });
    }

    const admin = await prisma.admin.findUnique({ where: { id: payload.adminId } });
    if (!admin) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      clearAuthCookies(res);
      return res.status(401).json({ message: "Unauthorized" });
    }

    // revoke old token and issue new one (rotation)
    await prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });

    const newAccess = signAccessToken({ adminId: admin.id });

    // ✅ NEW: retry-safe refresh token creation
    let newRefresh = signRefreshToken({ adminId: admin.id });
    let newHash = hashToken(newRefresh);

    try {
      await prisma.refreshToken.create({
        data: {
          adminId: admin.id,
          tokenHash: newHash,
          expiresAt: refreshExpiresAt(),
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        // retry once (extra safety)
        newRefresh = signRefreshToken({ adminId: admin.id });
        newHash = hashToken(newRefresh);

        await prisma.refreshToken.create({
          data: {
            adminId: admin.id,
            tokenHash: newHash,
            expiresAt: refreshExpiresAt(),
          },
        });
      } else {
        throw e;
      }
    }

    setAuthCookies(res, newAccess, newRefresh);
    return res.json({ message: "Refreshed" });
  });

  // Logout
  app.post("/api/auth/logout", async (req, res) => {
    const refresh = req.cookies?.[REFRESH_COOKIE];
    if (refresh) {
      const tokenHash = hashToken(refresh);
      await prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    clearAuthCookies(res);
    return res.json({ message: "Logged out" });
  });

  // Check
  app.get("/api/auth/check", async (req, res) => {
    const access = req.cookies?.[ACCESS_COOKIE];
    if (!access) return res.status(401).json({ message: "Unauthorized" });

    try {
      const p = verifyAccessToken(access); // { adminId }
      const admin = await prisma.admin.findUnique({ where: { id: p.adminId } });
      if (!admin) return res.status(401).json({ message: "Unauthorized" });

      return res.json({ user: { id: admin.id, email: admin.email } });
    } catch {
      return res.status(401).json({ message: "Unauthorized" });
    }
  });
}
