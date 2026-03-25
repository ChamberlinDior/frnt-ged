import { z } from "zod";

export const documentFormSchema = z.object({
  title: z.string().min(2, "Le titre doit contenir au moins 2 caractères").max(180),
  referenceCode: z.string().catch(""),
  description: z.string().catch(""),
  status: z.enum(["DRAFT", "VALIDATED", "ARCHIVED"]),
  documentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)"),
  active: z.boolean().catch(true),
  categoryId: z.number().min(1, "La catégorie est requise"),
  departmentId: z.number().min(1, "Le département est requis"),
  externalUrl: z
    .string()
    .catch("")
    .refine((v) => !v || /^https?:\/\//i.test(v), "URL invalide"),
  filePath: z.string().catch(""),
});

export type DocumentFormValues = z.infer<typeof documentFormSchema>;

export type DocumentFilters = {
  search?: string;
  status?: "DRAFT" | "VALIDATED" | "ARCHIVED" | "all";
  categoryId?: number;
  departmentId?: number;
  active?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "date" | "title" | "status";
  sortOrder?: "asc" | "desc";
};

export const statusLabels: Record<"DRAFT" | "VALIDATED" | "ARCHIVED", string> = {
  DRAFT: "Brouillon",
  VALIDATED: "Validé",
  ARCHIVED: "Archivé",
};

export const statusBadgeClasses: Record<
  "DRAFT" | "VALIDATED" | "ARCHIVED",
  string
> = {
  DRAFT:
    "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800",
  VALIDATED:
    "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800",
  ARCHIVED:
    "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
};
