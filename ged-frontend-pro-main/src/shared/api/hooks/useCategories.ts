import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchCategoriesByDepartment } from "@/shared/api/resources/category";

type UseCategoriesOptions = {
  departmentId?: number;
  activeOnly?: boolean;
};

export function useCategories(options?: UseCategoriesOptions) {
  const departmentId = options?.departmentId;
  const activeOnly = options?.activeOnly ?? false;

  return useQuery({
    queryKey: ["categories", { departmentId: departmentId ?? null, activeOnly }],
    queryFn: () =>
      departmentId ? fetchCategoriesByDepartment(departmentId, activeOnly) : fetchCategories(),
  });
}