import type { Express } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../auth/middleware";

export function registerMessageRoutes(app: Express) {
  // Delete one message (hard delete)
  app.delete("/api/admin/messages/:id", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

    try {
      await prisma.contactMessage.delete({ where: { id } });
      return res.status(204).end();
    } catch (e: any) {
      if (e?.code === "P2025") return res.status(404).json({ message: "Message not found" });
      return res.status(500).json({ message: "Internal server error" });
    }
  });
}
