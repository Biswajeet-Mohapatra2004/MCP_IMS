import { restApiClient } from "./client";

export interface Warehouse {
  id: number;
  name: string;
  location: string;
  stockItemCount: number;
}

export interface WarehouseFormData {
  name: string;
  location: string;
}

export const warehouseApi = {
  getAll: () => restApiClient.get<Warehouse[]>("/api/warehouses").then((r) => r.data),
  create: (data: WarehouseFormData) => restApiClient.post<Warehouse>("/api/warehouses", data).then((r) => r.data),
  update: (id: number, data: Partial<WarehouseFormData>) =>
    restApiClient.put<Warehouse>(`/api/warehouses/${id}`, data).then((r) => r.data),
  delete: (id: number) => restApiClient.delete(`/api/warehouses/${id}`),
};