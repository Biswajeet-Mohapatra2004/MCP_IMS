import { restApiClient, mcpChatClient } from "./client";

export interface CategoryStockSummary {
  categoryId: number;
  categoryName: string;
  totalQuantity: number;
  productCount: number;
  lowStockCount: number;
}

export interface SupplierProductSummary {
  supplierId: number;
  supplierName: string;
  productCount: number;
}

export interface WarehouseUtilizationSummary {
  warehouseId: number;
  warehouseName: string;
  totalQuantity: number;
  stockItemCount: number;
}

export interface InsightsSummary {
  stockByCategory: CategoryStockSummary[];
  productsBySupplier: SupplierProductSummary[];
  warehouseUtilization: WarehouseUtilizationSummary[];
  lowStockProducts: { id: number; name: string; sku: string; reorderThreshold: number }[];
}

export const insightsApi = {
  getSummary: () => restApiClient.get<InsightsSummary>("/api/insights/summary").then((r) => r.data),
  getAiNarrative: () => mcpChatClient.get<string>("/api/v1/ai/insights").then((r) => r.data),
};