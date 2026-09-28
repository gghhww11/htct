import type { Express } from "express";
import fs from "node:fs/promises";
import path from "node:path";

import { prisma } from "../prisma";
import { requireAuth } from "../auth/middleware";
import {
  upload,
  processToWebp,
  UPLOAD_DIR,
} from "../uploads/images";
import {
  galleryCreateSchema,
  galleryUpdateSchema,
} from "../validators/gallery";

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

export function registerGalleryRoutes(app: Express) {
  // -------- Public --------
  app.get("/api/public/gallery", async (_req, res) => {
    const items = await prisma.galleryItem.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(items);
  });

  // -------- Admin --------
  app.get(
    "/api/admin/gallery",
    requireAuth,
    async (_req, res) => {
      const items =
        await prisma.galleryItem.findMany({
          orderBy: { createdAt: "desc" },
        });

      res.json(items);
    },
  );

  // -------- Create --------
  app.post(
    "/api/admin/gallery",
    requireAuth,
    upload.single("image"),
    async (req, res) => {
      if (!req.file) {
        return res.status(400).json({
          message: "Image is required",
        });
      }

      const category = String(
        req.body?.category || "",
      ).trim();

      const captionAr = String(
        req.body?.captionAr || "",
      );

      const captionEn = String(
        req.body?.captionEn || "",
      );

      if (!category) {
        return res.status(400).json({
          message: "category is required",
        });
      }

      const exists =
        await prisma.category.findUnique({
          where: { key: category },
        });

      if (!exists) {
        return res.status(400).json({
          message: "Invalid category",
        });
      }

      try {
        const {
          imageUrl,
          thumbnailUrl,
        } = await processToWebp(
          req.file.buffer,
        );

        const parsed =
          galleryCreateSchema.safeParse({
            category,
            captionAr,
            captionEn,
            imageUrl,
            thumbnailUrl,
          });

        if (!parsed.success) {
          return res.status(400).json({
            message:
              parsed.error.issues[0]
                ?.message ||
              "Invalid input",
          });
        }

        const created =
          await prisma.galleryItem.create({
            data: parsed.data,
          });

        return res
          .status(201)
          .json(created);
      } catch (e: any) {
        return res.status(500).json({
          message:
            e?.message ||
            "Internal server error",
        });
      }
    },
  );

  // -------- Update captions/category --------
  app.put(
    "/api/admin/gallery/:id",
    requireAuth,
    async (req, res) => {
      const id = Number(req.params.id);

      if (!Number.isFinite(id)) {
        return res.status(400).json({
          message: "Invalid id",
        });
      }

      const parsed =
        galleryUpdateSchema.safeParse(
          req.body,
        );

      if (!parsed.success) {
        return res.status(400).json({
          message:
            parsed.error.issues[0]
              ?.message ||
            "Invalid input",
        });
      }

      try {
        const updated =
          await prisma.galleryItem.update({
            where: { id },
            data: parsed.data,
          });

        return res.json(updated);
      } catch (e: any) {
        if (e?.code === "P2025") {
          return res.status(404).json({
            message:
              "Gallery item not found",
          });
        }

        return res.status(500).json({
          message:
            "Internal server error",
        });
      }
    },
  );

  // -------- Delete gallery item + files --------
  app.delete(
    "/api/admin/gallery/:id",
    requireAuth,
    async (req, res) => {
      const id = Number(req.params.id);

      if (!Number.isFinite(id)) {
        return res.status(400).json({
          message: "Invalid id",
        });
      }

      try {
        // Get file paths before deleting the DB record
        const item =
          await prisma.galleryItem.findUnique({
            where: { id },
            select: {
              imageUrl: true,
              thumbnailUrl: true,
            },
          });

        if (!item) {
          return res.status(404).json({
            message:
              "Gallery item not found",
          });
        }

        // Delete from database
        await prisma.galleryItem.delete({
          where: { id },
        });

        // Delete full + thumbnail files
        await Promise.all([
          safeUnlink(item.imageUrl),
          safeUnlink(item.thumbnailUrl),
        ]);

        return res.status(204).end();
      } catch (e: any) {
        if (e?.code === "P2025") {
          return res.status(404).json({
            message:
              "Gallery item not found",
          });
        }

        return res.status(500).json({
          message:
            "Internal server error",
        });
      }
    },
  );
}