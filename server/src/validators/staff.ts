import { z } from "zod";

const roleEnum = z.enum(["MANAGER", "TEACHER"]);

export const staffCreateSchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  role: roleEnum,
  bioAr: z.string().min(1),
  bioEn: z.string().min(1),
  expertiseTags: z.array(z.string()).default([]),
  imageUrl: z.string().optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
});

export const staffUpdateSchema = staffCreateSchema.partial();
