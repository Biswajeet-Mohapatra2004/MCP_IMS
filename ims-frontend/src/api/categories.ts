import { restApiClient } from "./client";

export interface Category {
  id: number;
  name: string;
  description?: string;
  productCount: number;
}

export interface CategoryFormData {
  name: string;
  description?: string;
}

export const categoryApi = {
  getAll: () => restApiClient.get<Category[]>("/api/categories").then((r) => r.data),
  create: (data: CategoryFormData) => restApiClient.post<Category>("/api/categories", data).then((r) => r.data),
  update: (id: number, data: Partial<CategoryFormData>) =>
    restApiClient.put<Category>(`/api/categories/${id}`, data).then((r) => r.data),
  delete: (id: number) => restApiClient.delete(`/api/categories/${id}`),
};