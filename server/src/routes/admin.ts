import type { Express } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../auth/middleware";

export function registerAdminRoutes(app: Express) {
  app.get("/api/admin/stats", requireAuth, async (_req, res) => {
    const [
      totalMessages,
      unreadMessages,
      totalDiplomas,
      totalStaff,
      totalGalleryItems,
    ] = await Promise.all([
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.diploma.count(),
      prisma.staff.count(),
      prisma.galleryItem.count(),
    ]);

    res.json({
      totalMessages,
      unreadMessages,
      totalDiplomas,
      totalStaff,
      totalGalleryItems,
    });
  });

  // ✅ Public: list categories (no auth)
  app.get("/api/public/categories", async (_req, res) => {
    const cats = await prisma.category.findMany({ orderBy: { createdAt: "desc" } });
    res.json(cats);
  });
}
