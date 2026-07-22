import { restApiClient } from "./client";

export interface Supplier {
  id: number;
  name: string;
  contactEmail: string;
  phone?: string;
  productCount: number;
}

export interface SupplierFormData {
  name: string;
  contactEmail: string;
  phone?: string;
}

export const supplierApi = {
  getAll: () => restApiClient.get<Supplier[]>("/api/suppliers").then((r) => r.data),
  create: (data: SupplierFormData) => restApiClient.post<Supplier>("/api/suppliers", data).then((r) => r.data),
  update: (id: number, data: Partial<SupplierFormData>) =>
    restApiClient.put<Supplier>(`/api/suppliers/${id}`, data).then((r) => r.data),
  delete: (id: number) => restApiClient.delete(`/api/suppliers/${id}`),
};