import type { Express } from "express";
import fs from "node:fs/promises";
import path from "node:path";

import { prisma } from "../prisma";
import { requireAuth } from "../auth/middleware";
import { staffCreateSchema, staffUpdateSchema } from "../validators/staff";
import {
  upload,
  processToWebp,
  UPLOAD_DIR,
} from "../uploads/images";

async function safeUnlink(uploadPath?: string | null) {
  if (!uploadPath) return;

  // لا نسمح بحذف أي ملف خارج /uploads
  if (!uploadPath.startsWith("/uploads/")) return;

  const fileName = path.basename(uploadPath);
  const diskPath = path.join(UPLOAD_DIR, fileName);

  try {
    await fs.unlink(diskPath);
  } catch (err: any) {
    if (err?.code !== "ENOENT") {
      console.warn(
        "Failed to delete file:",
        diskPath,
        err,
      );
    }
  }
}

export function registerStaffRoutes(app: Express) {
  // -------- Public --------
  app.get("/api/public/staff", async (_req, res) => {
    const staff = await prisma.staff.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(staff);
  });

  // -------- Admin --------
  app.get("/api/admin/staff", requireAuth, async (_req, res) => {
    const staff = await prisma.staff.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(staff);
  });

  app.get("/api/admin/staff/:id", requireAuth, async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isFinite(id)) {
      return res.status(400).json({
        message: "Invalid id",
      });
    }

    const member = await prisma.staff.findUnique({
      where: { id },
    });

    if (!member) {
      return res.status(404).json({
        message: "Staff not found",
      });
    }

    res.json(member);
  });

  // -------- Create --------
  app.post("/api/admin/staff", requireAuth, async (req, res) => {
    const parsed = staffCreateSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message:
          parsed.error.issues[0]?.message || "Invalid input",
      });
    }

    const created = await prisma.staff.create({
      data: parsed.data,
    });

    res.status(201).json(created);
  });

  // -------- Update --------
  app.put("/api/admin/staff/:id", requireAuth, async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isFinite(id)) {
      return res.status(400).json({
        message: "Invalid id",
      });
    }

    const parsed = staffUpdateSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message:
          parsed.error.issues[0]?.message || "Invalid input",
      });
    }

    try {
      const updated = await prisma.staff.update({
        where: { id },
        data: parsed.data,
      });

      res.json(updated);
    } catch (e: any) {
      if (e?.code === "P2025") {
        return res.status(404).json({
          message: "Staff not found",
        });
      }

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  });

  // -------- Delete staff + images --------
  app.delete("/api/admin/staff/:id", requireAuth, async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isFinite(id)) {
      return res.status(400).json({
        message: "Invalid id",
      });
    }

    try {

      const member = await prisma.staff.findUnique({
        where: { id },
        select: {
          imageUrl: true,
          thumbnailUrl: true,
        },
      });

      if (!member) {
        return res.status(404).json({
          message: "Staff not found",
        });
      }


      await prisma.staff.delete({
        where: { id },
      });

      // حذف الصور من uploads
      await Promise.all([
        safeUnlink(member.imageUrl),
        safeUnlink(member.thumbnailUrl),
      ]);

      return res.status(204).end();
    } catch (e: any) {
      if (e?.code === "P2025") {
        return res.status(404).json({
          message: "Staff not found",
        });
      }

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  });

  // -------- Upload / replace image --------
  app.post(
    "/api/admin/staff/:id/image",
    requireAuth,
    upload.single("image"),
    async (req, res) => {
      const id = Number(req.params.id);

      if (!Number.isFinite(id)) {
        return res.status(400).json({
          message: "Invalid id",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "Image is required",
        });
      }

      try {
        const current = await prisma.staff.findUnique({
          where: { id },
          select: {
            imageUrl: true,
            thumbnailUrl: true,
          },
        });

        if (!current) {
          return res.status(404).json({
            message: "Staff not found",
          });
        }


        const { imageUrl, thumbnailUrl } =
          await processToWebp(req.file.buffer);


        const updated = await prisma.staff.update({
          where: { id },
          data: {
            imageUrl,
            thumbnailUrl,
          },
        });


        await Promise.all([
          safeUnlink(current.imageUrl),
          safeUnlink(current.thumbnailUrl),
        ]);

        return res.json({
          staff: updated,
        });
      } catch (e: any) {
        if (e?.code === "P2025") {
          return res.status(404).json({
            message: "Staff not found",
          });
        }

        return res.status(500).json({
          message: e?.message || "Internal server error",
        });
      }
    },
  );
}