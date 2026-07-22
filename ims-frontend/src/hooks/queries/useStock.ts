import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { stockApi } from "../../api/stock";
import type { StockCreateData, StockAdjustData } from "../../api/stock";
import { WAREHOUSES_KEY } from "./useWarehouses";

export const STOCK_KEY = ["stock-items"];

export function useStockItems() {
  return useQuery({ queryKey: STOCK_KEY, queryFn: stockApi.getAll });
}

export function useCreateStockItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StockCreateData) => stockApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STOCK_KEY });
      queryClient.invalidateQueries({ queryKey: WAREHOUSES_KEY });
    },
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StockAdjustData) => stockApi.adjust(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STOCK_KEY }),
  });
}

export function useDeleteStockItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => stockApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STOCK_KEY });
      queryClient.invalidateQueries({ queryKey: WAREHOUSES_KEY });
    },
  });
}