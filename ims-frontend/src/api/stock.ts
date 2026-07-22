import { restApiClient } from "./client";

export interface StockItem {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  warehouseId: number;
  warehouseName: string;
  quantity: number;
  lastUpdated: string;
}

export interface StockCreateData {
  productId: number;
  warehouseId: number;
  quantity?: number;
}

export interface StockAdjustData {
  productId: number;
  warehouseId: number;
  quantityChange: number;
}

export const stockApi = {
  getAll: () => restApiClient.get<StockItem[]>("/api/stock-items").then((r) => r.data),
  create: (data: StockCreateData) => restApiClient.post<StockItem>("/api/stock-items", data).then((r) => r.data),
  adjust: (data: StockAdjustData) => restApiClient.patch<StockItem>("/api/stock-items/adjust", data).then((r) => r.data),
  delete: (id: number) => restApiClient.delete(`/api/stock-items/${id}`),
};