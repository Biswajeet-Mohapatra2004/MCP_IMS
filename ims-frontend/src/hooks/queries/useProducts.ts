import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productApi } from "../../api/products";
import type { ProductFormData } from "../../api/products";

export const PRODUCTS_KEY = ["products"];

export function useProducts() {
  return useQuery({ queryKey: PRODUCTS_KEY, queryFn: productApi.getAll });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductFormData) => productApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductFormData> }) =>
      productApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}