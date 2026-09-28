import type { Express } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../auth/middleware";
import fs from "node:fs/promises";
import path from "node:path";
import type { GalleryItem } from "@prisma/client";

async function safeUnlink(uploadPath?: string | null) {
  if (!uploadPath) return;
  if (!uploadPath.startsWith("/uploads/")) return;

  const diskPath = path.join(process.cwd(), uploadPath.replace(/^\//, ""));
  try {
    await fs.unlink(diskPath);
  } catch (err: any) {
    if (err?.code !== "ENOENT") {
      console.warn("Failed to delete file:", diskPath, err);
    }
  }
}

export function registerCategoryRoutes(app: Express) {
  // List categories
  app.get("/api/admin/categories", requireAuth, async (_req, res) => {
    const cats = await prisma.category.findMany({ orderBy: { createdAt: "desc" } });
    res.json(cats);
  });

  // Create category
  app.post("/api/admin/categories", requireAuth, async (req, res) => {
    const key = String(req.body?.key || "").trim();
    const nameAr = String(req.body?.nameAr || "").trim();
    const nameEn = String(req.body?.nameEn || "").trim();

    if (!key) return res.status(400).json({ message: "key is required" });
    if (!nameAr) return res.status(400).json({ message: "nameAr is required" });
    if (!nameEn) return res.status(400).json({ message: "nameEn is required" });

    try {
      const created = await prisma.category.create({ data: { key, nameAr, nameEn } });
      res.status(201).json(created);
    } catch (e: any) {
      return res.status(400).json({ message: "Category key already exists" });
    }
  });

  // Public: List categories (for user gallery tabs)
  app.get("/api/public/categories", async (_req, res) => {
    const cats = await prisma.category.findMany({ orderBy: { createdAt: "desc" } });
    res.json(cats);
  });


  // Delete category + delete all gallery items under it + delete their files
  app.delete("/api/admin/categories/:id", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

    const cat = await prisma.category.findUnique({ where: { id } });
    if (!cat) return res.status(404).json({ message: "Category not found" });

    // اجلب العناصر قبل حذفها حتى نعرف ملفاتها
    const items = await prisma.galleryItem.findMany({
      where: { category: cat.key },
      select: { id: true, imageUrl: true, thumbnailUrl: true },
    });

    try {
      await prisma.$transaction([
        prisma.galleryItem.deleteMany({ where: { category: cat.key } }),
        prisma.category.delete({ where: { id } }),
      ]);

      // حذف الملفات من disk بعد نجاح DB
      await Promise.all(
        items.flatMap((it: Pick<GalleryItem, "imageUrl" | "thumbnailUrl">) => [
        safeUnlink(it.imageUrl),
        safeUnlink(it.thumbnailUrl),
      ])
      );

      res.status(204).end();
    } catch (e: any) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
}
