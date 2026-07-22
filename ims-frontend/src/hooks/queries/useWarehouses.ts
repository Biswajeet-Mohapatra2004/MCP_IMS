import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { warehouseApi } from "../../api/warehouses";
import type { WarehouseFormData } from "../../api/warehouses";

export const WAREHOUSES_KEY = ["warehouses"];

export function useWarehouses() {
  return useQuery({ queryKey: WAREHOUSES_KEY, queryFn: warehouseApi.getAll });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: WarehouseFormData) => warehouseApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WAREHOUSES_KEY }),
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<WarehouseFormData> }) =>
      warehouseApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WAREHOUSES_KEY }),
  });
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => warehouseApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WAREHOUSES_KEY }),
  });
}