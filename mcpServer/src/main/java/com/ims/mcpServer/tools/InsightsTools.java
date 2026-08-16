package com.ims.mcpServer.tools;

import com.ims.mcpServer.client.InventoryApiClient;
import com.ims.mcpServer.exception.ApiCallException;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

@Component
public class InsightsTools {

    private final InventoryApiClient apiClient;

    public InsightsTools(InventoryApiClient apiClient) {
        this.apiClient = apiClient;
    }

    @Tool(description = "Retrieves aggregated inventory analytics: stock quantity grouped by category, product counts grouped by supplier, warehouse utilization, and the list of products currently below their reorder threshold. Use this to answer questions about overall inventory health or to generate a summary report.")
    public Object getInsightsSummary() {
        try {
            return apiClient.getInsightsSummary();
        } catch (ApiCallException e) {
            return e.getMessage();
        }
    }

    @Tool(description = "Retrieves the list of products currently below their reorder threshold, along with their linked suppliers and current per-warehouse stock levels. Use this as the basis for proposing a reorder plan — do not invent supplier or warehouse information not present in this data.")
    public Object getReorderCandidates() {
        try {
            return apiClient.getReorderCandidates();
        } catch (ApiCallException e) {
            return e.getMessage();
        }
    }
}