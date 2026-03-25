import { z } from "zod";

export const departmentFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  description: z.string().catch(""),
  active: z.boolean().catch(true),
});

export type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

export type DepartmentActiveFilter = "all" | "active" | "inactive";
