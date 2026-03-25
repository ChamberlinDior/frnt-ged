import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export const departmentSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(120),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

export type DepartmentFormValues = z.infer<typeof departmentSchema>;

export const documentSchema = z.object({
  title: z.string().min(2, "Le titre est requis").max(180),
  referenceCode: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "VALIDATED", "ARCHIVED"]).default("DRAFT"),
  documentDate: z.string(),
  active: z.boolean().default(true),
  categoryId: z.number().min(1, "La catégorie est requise"),
  departmentId: z.number().min(1, "Le département est requis"),
});

export type DocumentFormValues = z.infer<typeof documentSchema>;
