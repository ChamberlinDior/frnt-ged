import { apiClient } from "@/shared/api/client";

export type Category = {
  id: number;
  name: string;
  description?: string | null;
  active: boolean;
  departmentId?: number | null;
  departmentName?: string | null;
  createdAt?: string | null;
};

export type CategoryRequest = {
  name: string;
  description?: string | null;
  active: boolean;
  departmentId?: number | null;
};

export async function fetchCategories(): Promise<Category[]> {
  const response = await apiClient.get<Category[]>("/categories");
  return response.data;
}

export async function fetchCategoriesByDepartment(
  departmentId: number,
  activeOnly = false
): Promise<Category[]> {
  const response = await apiClient.get<Category[]>(`/categories/department/${departmentId}`, {
    params: { activeOnly },
  });
  return response.data;
}

export async function fetchCategoryById(id: number): Promise<Category> {
  const response = await apiClient.get<Category>(`/categories/${id}`);
  return response.data;
}

export async function createCategory(data: CategoryRequest): Promise<Category> {
  const response = await apiClient.post<Category>("/categories", data);
  return response.data;
}

export async function updateCategory(id: number, data: CategoryRequest): Promise<Category> {
  const response = await apiClient.put<Category>(`/categories/${id}`, data);
  return response.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}