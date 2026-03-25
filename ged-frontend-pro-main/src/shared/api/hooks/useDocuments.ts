import { useQuery } from "@tanstack/react-query";
import { fetchDocuments, fetchDocumentsByDepartment } from "@/shared/api/resources/document";

type UseDocumentsOptions = {
  departmentId?: number;
  categoryId?: number;
  activeOnly?: boolean;
};

export function useDocuments(options?: UseDocumentsOptions) {
  const departmentId = options?.departmentId;
  const categoryId = options?.categoryId;
  const activeOnly = options?.activeOnly ?? false;

  return useQuery({
    queryKey: ["documents", { departmentId: departmentId ?? null, categoryId: categoryId ?? null, activeOnly }],
    queryFn: () =>
      departmentId
        ? fetchDocumentsByDepartment(departmentId, { categoryId, activeOnly })
        : fetchDocuments(),
  });
}