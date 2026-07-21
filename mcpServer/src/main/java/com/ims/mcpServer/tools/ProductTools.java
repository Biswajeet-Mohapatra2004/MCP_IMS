package com.ims.mcpServer.tools;

import com.ims.mcpServer.client.InventoryApiClient;
import com.ims.mcpServer.dto.ProductCreateRequest;
import com.ims.mcpServer.dto.ProductUpdateRequest;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;

@Component
public class ProductTools {

    private final InventoryApiClient apiClient;

    public ProductTools(InventoryApiClient apiClient) {
        this.apiClient = apiClient;
    }

    @Tool(description = "Creates a new product with SKU, name, price, and optional category. Does not set stock quantity — use createStockItem separately to add initial stock in a warehouse.")
    public Map<String, Object> createProduct(
            @ToolParam(description = "Unique SKU code for the product") String sku,
            @ToolParam(description = "Product name") String name,
            @ToolParam(description = "Product description", required = false) String description,
            @ToolParam(description = "Unit price of the product") BigDecimal unitPrice,
            @ToolParam(description = "Quantity threshold at which restocking is needed", required = false) Integer reorderThreshold,
            @ToolParam(description = "ID of the category this product belongs to", required = false) Long categoryId
    ) {
        ProductCreateRequest request = new ProductCreateRequest();
        request.sku = sku;
        request.name = name;
        request.description = description;
        request.unitPrice = unitPrice;
        request.reorderThreshold = reorderThreshold;
        request.categoryId = categoryId;
        return apiClient.createProduct(request);
    }

    @Tool(description = "Retrieves a single product's details (name, price, category, SKU) by its ID. Does not return current stock quantity — use getStockItem or getAllStockItems for that.")
    public Map<String, Object> getProduct(
            @ToolParam(description = "The ID of the product to retrieve") Long productId
    ) {
        return apiClient.getProduct(productId);
    }

    @Tool(description = "Lists all products in the catalog with their basic details")
    public Object getAllProducts() {
        return apiClient.getAllProducts();
    }

    @Tool(description = "Updates a product's name, description, unit price, or reorder threshold. Only pass the fields you want changed; omitted fields are left unchanged. Does not change stock quantity — use updateStock for that.")
    public Map<String, Object> updateProduct(
            @ToolParam(description = "The ID of the product to update") Long productId,
            @ToolParam(description = "New product name", required = false) String name,
            @ToolParam(description = "New product description", required = false) String description,
            @ToolParam(description = "New unit price", required = false) BigDecimal unitPrice,
            @ToolParam(description = "New reorder threshold", required = false) Integer reorderThreshold
    ) {
        ProductUpdateRequest request = new ProductUpdateRequest();
        request.name = name;
        request.description = description;
        request.unitPrice = unitPrice;
        request.reorderThreshold = reorderThreshold;
        return apiClient.updateProduct(productId, request);
    }

    @Tool(description = "Permanently deletes a product from the catalog by its ID")
    public String deleteProduct(
            @ToolParam(description = "The ID of the product to delete") Long productId
    ) {
        apiClient.deleteProduct(productId);
        return "Product with ID " + productId + " has been deleted successfully.";
    }
}