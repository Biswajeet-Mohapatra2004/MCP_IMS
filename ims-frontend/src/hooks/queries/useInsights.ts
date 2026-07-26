import { useMutation, useQuery } from "@tanstack/react-query";
import { insightsApi } from "../../api/insights";

export function useInsightsSummary() {
  return useQuery({ queryKey: ["insights", "summary"], queryFn: insightsApi.getSummary });
}

export function useAiNarrative() {
  return useMutation({ mutationFn: insightsApi.getAiNarrative });
}