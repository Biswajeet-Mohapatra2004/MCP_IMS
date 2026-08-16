import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reorderApi } from "../../api/reorder";
import { STOCK_KEY } from "./useStock";

export function useGenerateReorderPlan() {
  return useMutation({ mutationFn: reorderApi.generatePlan });
}

export function useExecuteReorderPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderApi.executePlan,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STOCK_KEY }),
  });
}