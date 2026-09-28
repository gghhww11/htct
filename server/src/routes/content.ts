import type { Express } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../auth/middleware";
import { contactCreateSchema } from "../validators/contact";

export function registerContentRoutes(app: Express) {
  // -------- Public Contact --------
  app.post("/api/public/contact", async (req, res) => {
    const parsed = contactCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid input" });
    }
    const created = await prisma.contactMessage.create({ data: parsed.data });
    res.status(201).json(created);
  });

  // -------- Admin Messages --------
  app.get("/api/admin/messages", requireAuth, async (_req, res) => {
    const msgs = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
    res.json(msgs);
  });

  app.patch("/api/admin/messages/:id", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

    const isRead = req.body?.isRead;
    if (typeof isRead !== "boolean") return res.status(400).json({ message: "isRead must be boolean" });

    try {
      const updated = await prisma.contactMessage.update({ where: { id }, data: { isRead } });
      res.json(updated);
    } catch (e: any) {
      if (e?.code === "P2025") return res.status(404).json({ message: "Message not found" });
      return res.status(500).json({ message: "Internal server error" });
    }
  });
}
