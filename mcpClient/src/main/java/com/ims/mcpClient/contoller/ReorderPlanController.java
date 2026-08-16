package com.ims.mcpClient.contoller;

import com.ims.mcpClient.dto.ReorderSuggestion;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.ParameterizedTypeReference;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai/reorder")
public class ReorderPlanController {

    private final ChatClient chatClient;
    private final ToolCallbackProvider toolCallbackProvider;

    public ReorderPlanController(ChatClient.Builder chatClientBuilder, ToolCallbackProvider tools) {
        this.toolCallbackProvider = tools;
        this.chatClient = chatClientBuilder
                .defaultAdvisors(new SimpleLoggerAdvisor())
                .defaultTools(tools)
                .build();
    }

    @PostMapping("/plan")
    public ResponseEntity<List<ReorderSuggestion>> generatePlan() {
        String prompt = """
            Call the getReorderCandidates tool to retrieve products currently below their reorder
            threshold. For each candidate, propose a reorder action:

            - Choose ONE supplier from the product's linked suppliers. If no suppliers are linked,
              set supplierId to null and explain this in the reasoning.
            - Choose the warehouse where the product already has the most existing stock. If the
              product has zero stock everywhere, set warehouseId to null and explain this in the
              reasoning.
            - Suggest a quantity that brings total stock to roughly double the reorder threshold
              (a reasonable buffer, not just back to the exact threshold).
            - Write one clear sentence of reasoning per suggestion, referencing the actual numbers.

            Return a suggestion for every candidate, even ones with missing supplier/warehouse data —
            flag those clearly in the reasoning instead of omitting them.
            """;

        List<ReorderSuggestion> plan = chatClient.prompt(prompt)
                .call()
                .entity(new ParameterizedTypeReference<List<ReorderSuggestion>>() {});

        return ResponseEntity.ok(plan);
    }

    @PostMapping("/execute")
    public ResponseEntity<List<Map<String, Object>>> executePlan(@RequestBody List<ReorderSuggestion> approvedItems) {
        ToolCallback updateStockTool = java.util.Arrays.stream(toolCallbackProvider.getToolCallbacks())
                .filter(t -> t.getToolDefinition().name().equals("updateStock"))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("updateStock tool not found"));

        List<Map<String, Object>> results = new java.util.ArrayList<>();

        for (ReorderSuggestion item : approvedItems) {
            if (item.warehouseId == null) {
                results.add(Map.of(
                        "productName", item.productName,
                        "status", "skipped",
                        "reason", "No warehouse specified — cannot execute automatically"
                ));
                continue;
            }

            String argsJson = String.format(
                    "{\"productId\":%d,\"warehouseId\":%d,\"quantityChange\":%d}",
                    item.productId, item.warehouseId, item.suggestedQuantity
            );

            String result = updateStockTool.call(argsJson);
            results.add(Map.of(
                    "productName", item.productName,
                    "status", "executed",
                    "result", result
            ));
        }

        return ResponseEntity.ok(results);
    }
}