import { useQuery } from "@tanstack/react-query";
import { fetchDepartments } from "@/shared/api/resources/department";

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });
}