import { restApiClient } from "./client";

export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  unitPrice: number;
  reorderThreshold: number;
  categoryId?: number;
  categoryName?: string;
  createdAt: string;
  updatedAt: string;
  suppliers: { id: number; name: string }[];
}

export interface ProductFormData {
  sku?: string;
  name: string;
  description?: string;
  unitPrice: number;
  reorderThreshold?: number;
  categoryId?: number;
  supplierIds?: number[];
}

export const productApi = {
  getAll: () => restApiClient.get<Product[]>("/api/products").then((r) => r.data),
  create: (data: ProductFormData) => restApiClient.post<Product>("/api/products", data).then((r) => r.data),
  update: (id: number, data: Partial<ProductFormData>) =>
    restApiClient.put<Product>(`/api/products/${id}`, data).then((r) => r.data),
  delete: (id: number) => restApiClient.delete(`/api/products/${id}`),
};