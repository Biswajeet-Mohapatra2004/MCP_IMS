import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "../../api/categories";
import type { CategoryFormData } from "../../api/categories";
import { PRODUCTS_KEY } from "./useProducts";

export const CATEGORIES_KEY = ["categories"];

export function useCategories() {
  return useQuery({ queryKey: CATEGORIES_KEY, queryFn: categoryApi.getAll });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryFormData) => categoryApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CategoryFormData> }) =>
      categoryApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }); // category deletion can affect product listings
    },
  });
}