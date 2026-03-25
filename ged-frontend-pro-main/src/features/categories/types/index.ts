import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  description: z.string().catch(""),
  active: z.boolean().catch(true),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export type CategoryActiveFilter = "all" | "active" | "inactive";
