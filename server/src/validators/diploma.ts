import { z } from "zod";

const slugSchema = z
  .string()
  .min(3)
  .max(80)
  .regex(/^[a-z0-9-]+$/, "slug must be kebab-case (a-z, 0-9, -)");

const bulletsSchema = z.array(z.string().min(1).max(200)).max(50).optional().default([]);


export const diplomaCreateSchema = z.object({
  slug: slugSchema,
  titleAr: z.string().min(1).max(200),
  titleEn: z.string().min(1).max(200),

  descriptionAr: z.string().min(1).max(2000),
  descriptionEn: z.string().min(1).max(2000),

  durationMonths: z.coerce.number().int().min(1).max(48),

  requirementsAr: z.string().max(2000).optional().nullable(),
  requirementsEn: z.string().max(2000).optional().nullable(),
  curriculumAr: z.string().max(5000).optional().nullable(),
  curriculumEn: z.string().max(5000).optional().nullable(),

  objectivesAr: z.string().max(5000).optional().nullable(),
  objectivesEn: z.string().max(5000).optional().nullable(),
  outcomesAr: z.string().max(5000).optional().nullable(),
  outcomesEn: z.string().max(5000).optional().nullable(),

  isActive: z.boolean().default(true),
  imageUrl: z.string().optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),

  careerEnabled: z.coerce.boolean().optional(),
  careerOpportunitiesEn: bulletsSchema,
  careerOpportunitiesAr: bulletsSchema,

  advantagesEnabled: z.coerce.boolean().optional(),
  diplomaAdvantagesEn: bulletsSchema,
  diplomaAdvantagesAr: bulletsSchema,

  topStudentsRewardEnabled: z.coerce.boolean().optional(),
  topStudentsRewardEn: bulletsSchema,
  topStudentsRewardAr: bulletsSchema,

});

export const diplomaUpdateSchema = diplomaCreateSchema.partial().extend({
  slug: slugSchema.optional(),
  careerEnabled: z.coerce.boolean().optional(),
  careerOpportunitiesEn: bulletsSchema.optional(),
  careerOpportunitiesAr: bulletsSchema.optional(),

  advantagesEnabled: z.coerce.boolean().optional(),
  diplomaAdvantagesEn: bulletsSchema.optional(),
  diplomaAdvantagesAr: bulletsSchema.optional(),

  topStudentsRewardEnabled: z.coerce.boolean().optional(),
  topStudentsRewardEn: bulletsSchema.optional(),
  topStudentsRewardAr: bulletsSchema.optional(),

});
