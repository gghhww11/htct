import { z } from "zod";

export const galleryCreateSchema = z.object({
  category: z.string().min(1),
  captionAr: z.string().optional().default(""),
  captionEn: z.string().optional().default(""),
  imageUrl: z.string().min(1),
  thumbnailUrl: z.string().min(1),
});

export const galleryUpdateSchema = z.object({
  category: z.string().min(1).optional(),
  captionAr: z.string().optional(),
  captionEn: z.string().optional(),
});
