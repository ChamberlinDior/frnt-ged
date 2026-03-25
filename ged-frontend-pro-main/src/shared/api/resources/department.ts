import { apiClient } from "@/shared/api/client";
import type { Category } from "@/shared/api/resources/category";
import type { DocumentItem } from "@/shared/api/resources/document";

export type Department = {
  id: number;
  name: string;
  description?: string | null;
  active: boolean;
  createdAt?: string | null;
};

export type DepartmentRequest = {
  name: string;
  description?: string | null;
  active: boolean;
};

export async function fetchDepartments(): Promise<Department[]> {
  const response = await apiClient.get<Department[]>("/departments");
  return response.data;
}

export async function fetchDepartmentById(id: number): Promise<Department> {
  const response = await apiClient.get<Department>(`/departments/${id}`);
  return response.data;
}

export async function fetchDepartmentCategories(
  departmentId: number,
  activeOnly = false
): Promise<Category[]> {
  const response = await apiClient.get<Category[]>(`/departments/${departmentId}/categories`, {
    params: { activeOnly },
  });
  return response.data;
}

export async function fetchDepartmentDocuments(
  departmentId: number,
  options?: { categoryId?: number; activeOnly?: boolean }
): Promise<DocumentItem[]> {
  const response = await apiClient.get<DocumentItem[]>(`/departments/${departmentId}/documents`, {
    params: {
      categoryId: options?.categoryId,
      activeOnly: options?.activeOnly ?? false,
    },
  });
  return response.data;
}

export async function createDepartment(data: DepartmentRequest): Promise<Department> {
  const response = await apiClient.post<Department>("/departments", data);
  return response.data;
}

export async function updateDepartment(id: number, data: DepartmentRequest): Promise<Department> {
  const response = await apiClient.put<Department>(`/departments/${id}`, data);
  return response.data;
}

export async function deleteDepartment(id: number): Promise<void> {
  await apiClient.delete(`/departments/${id}`);
}