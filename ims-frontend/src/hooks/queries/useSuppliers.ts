import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supplierApi } from "../../api/suppliers";
import type { SupplierFormData } from "../../api/suppliers";
import { PRODUCTS_KEY } from "./useProducts";

export const SUPPLIERS_KEY = ["suppliers"];

export function useSuppliers() {
  return useQuery({ queryKey: SUPPLIERS_KEY, queryFn: supplierApi.getAll });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SupplierFormData) => supplierApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SUPPLIERS_KEY }),
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SupplierFormData> }) =>
      supplierApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SUPPLIERS_KEY }),
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => supplierApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_KEY });
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
}