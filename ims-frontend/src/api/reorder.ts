import { mcpChatClient } from "./client";

export interface ReorderSuggestion {
  productId: number;
  productName: string;
  sku: string;
  currentQuantity: number;
  reorderThreshold: number;
  supplierId: number | null;
  supplierName: string | null;
  warehouseId: number | null;
  warehouseName: string | null;
  suggestedQuantity: number;
  reasoning: string;
}

export interface ExecutionResult {
  productName: string;
  status: "executed" | "skipped";
  reason?: string;
  result?: string;
}

export const reorderApi = {
  generatePlan: () =>
    mcpChatClient.post<ReorderSuggestion[]>("/api/v1/ai/reorder/plan").then((r) => r.data),
  executePlan: (items: ReorderSuggestion[]) =>
    mcpChatClient.post<ExecutionResult[]>("/api/v1/ai/reorder/execute", items).then((r) => r.data),
};