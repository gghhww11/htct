import type { Express } from "express";
import path from "node:path";
import fs from "node:fs/promises";
import { prisma } from "../prisma";
import { requireAuth } from "../auth/middleware";
import { diplomaCreateSchema, diplomaUpdateSchema } from "../validators/diploma";
import {
  upload,
  processToWebp,
  UPLOAD_DIR,
} from "../uploads/images";

async function safeUnlink(uploadPath?: string | null) {
  if (!uploadPath) return;

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

export function registerDiplomaRoutes(app: Express) {
  // -------- Public --------
  app.get("/api/public/diplomas", async (_req, res) => {
    const diplomas = await prisma.diploma.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(diplomas);
  });

  app.get("/api/public/diplomas/:slug", async (req, res) => {
    const slug = req.params.slug;


    const diploma = await prisma.diploma.findFirst({
      where: { slug, isActive: true },
    });

    if (!diploma) return res.status(404).json({ message: "Diploma not found" });
    res.json(diploma);
  });

  // -------- Admin (Protected) --------
  app.get("/api/admin/diplomas", requireAuth, async (_req, res) => {
    const diplomas = await prisma.diploma.findMany({ orderBy: { createdAt: "desc" } });
    res.json(diplomas);
  });

  app.get("/api/admin/diplomas/:id", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

    const diploma = await prisma.diploma.findUnique({ where: { id } });
    if (!diploma) return res.status(404).json({ message: "Diploma not found" });
    res.json(diploma);
  });

  app.post("/api/admin/diplomas", requireAuth, async (req, res) => {
    const parsed = diplomaCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid input" });
    }

    try {
      const created = await prisma.diploma.create({ data: parsed.data });
      res.status(201).json(created);
    } catch (e: any) {
      if (e?.code === "P2002") return res.status(409).json({ message: "Slug already exists" });
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/diplomas/:id", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

    const parsed = diplomaUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid input" });
    }

    try {
      const updated = await prisma.diploma.update({ where: { id }, data: parsed.data });
      res.json(updated);
    } catch (e: any) {
      if (e?.code === "P2025") return res.status(404).json({ message: "Diploma not found" });
      if (e?.code === "P2002") return res.status(409).json({ message: "Slug already exists" });
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(
    "/api/admin/diplomas/:id/image",
    requireAuth,
    upload.single("image"),
    async (req, res) => {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
      if (!req.file) return res.status(400).json({ message: "Image is required" });

      try {
        const current = await prisma.diploma.findUnique({
          where: { id },
          select: { imageUrl: true, thumbnailUrl: true },
        });
        if (!current) return res.status(404).json({ message: "Diploma not found" });

        const { imageUrl, thumbnailUrl } = await processToWebp(req.file.buffer);

        const updated = await prisma.diploma.update({
          where: { id },
          data: { imageUrl, thumbnailUrl },
        });

        await Promise.all([safeUnlink(current.imageUrl), safeUnlink(current.thumbnailUrl)]);

        return res.json({ diploma: updated });
      } catch (e: any) {
        if (e?.code === "P2025") return res.status(404).json({ message: "Diploma not found" });
        return res.status(500).json({ message: e?.message || "Internal server error" });
      }
    }
  );

  app.delete("/api/admin/diplomas/:id", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

    try {
      const diploma = await prisma.diploma.findUnique({
        where: { id },
        select: { imageUrl: true, thumbnailUrl: true },
      });
      if (!diploma) return res.status(404).json({ message: "Diploma not found" });

      await prisma.diploma.delete({ where: { id } });

      await Promise.all([safeUnlink(diploma.imageUrl), safeUnlink(diploma.thumbnailUrl)]);

      return res.json({ message: "Diploma deleted" });
    } catch (e: any) {
      if (e?.code === "P2025") return res.status(404).json({ message: "Diploma not found" });
      return res.status(500).json({ message: "Internal server error" });
    }
  });
}
