package com.ims.mcpServer.tools;

import com.ims.mcpServer.client.InventoryApiClient;
import com.ims.mcpServer.dto.StockAdjustRequest;
import com.ims.mcpServer.dto.StockItemCreateRequest;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class StockTools {

    private final InventoryApiClient apiClient;

    public StockTools(InventoryApiClient apiClient) {
        this.apiClient = apiClient;
    }

    @Tool(description = "Creates a new stock record linking a product to a warehouse with an initial quantity. Fails if a stock record for this product/warehouse pair already exists — use updateStock to adjust an existing one instead.")
    public Map<String, Object> createStockItem(
            @ToolParam(description = "The ID of the product") Long productId,
            @ToolParam(description = "The ID of the warehouse") Long warehouseId,
            @ToolParam(description = "Initial stock quantity", required = false) Integer quantity
    ) {
        StockItemCreateRequest request = new StockItemCreateRequest();
        request.productId = productId;
        request.warehouseId = warehouseId;
        request.quantity = quantity;
        return apiClient.createStockItem(request);
    }

    @Tool(description = "Retrieves a single stock record by its ID, showing product, warehouse, and current quantity")
    public Map<String, Object> getStockItem(
            @ToolParam(description = "The ID of the stock item to retrieve") Long stockItemId
    ) {
        return apiClient.getStockItem(stockItemId);
    }

    @Tool(description = "Lists all stock records across all products and warehouses")
    public Object getAllStockItems() {
        return apiClient.getAllStockItems();
    }

    @Tool(description = "Adjusts stock quantity for a product in a specific warehouse. Use a positive number to add stock (e.g. restocking), a negative number to remove stock (e.g. a sale). Fails if the resulting quantity would go below zero. This changes quantity only — it does not change the product's price, name, or other details; use updateProduct for that.")
    public Map<String, Object> updateStock(
            @ToolParam(description = "The ID of the product") Long productId,
            @ToolParam(description = "The ID of the warehouse") Long warehouseId,
            @ToolParam(description = "Amount to change stock by — positive to add, negative to remove") Integer quantityChange
    ) {
        StockAdjustRequest request = new StockAdjustRequest();
        request.productId = productId;
        request.warehouseId = warehouseId;
        request.quantityChange = quantityChange;
        return apiClient.adjustStock(request);
    }

    @Tool(description = "Permanently deletes a stock record by its ID. This removes the tracking record entirely, not just the quantity — use updateStock with a negative quantityChange if you just want to reduce stock to zero.")
    public String deleteStockItem(
            @ToolParam(description = "The ID of the stock item to delete") Long stockItemId
    ) {
        apiClient.deleteStockItem(stockItemId);
        return "Stock item with ID " + stockItemId + " has been deleted successfully.";
    }
}
