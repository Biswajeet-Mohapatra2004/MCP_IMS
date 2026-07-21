package com.ims.mcpServer.tools;


import com.ims.mcpServer.client.InventoryApiClient;
import com.ims.mcpServer.dto.CategoryRequest;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class CategoryTools {

    private final InventoryApiClient apiClient;

    public CategoryTools(InventoryApiClient apiClient) {
        this.apiClient = apiClient;
    }

    @Tool(description = "Creates a new product category (e.g. Electronics, Furniture)")
    public Map<String, Object> createCategory(
            @ToolParam(description = "Category name") String name,
            @ToolParam(description = "Category description", required = false) String description
    ) {
        CategoryRequest request = new CategoryRequest();
        request.name = name;
        request.description = description;
        return apiClient.createCategory(request);
    }

    @Tool(description = "Retrieves a category's details by its ID, including how many products belong to it")
    public Map<String, Object> getCategory(
            @ToolParam(description = "The ID of the category to retrieve") Long categoryId
    ) {
        return apiClient.getCategory(categoryId);
    }

    @Tool(description = "Lists all product categories")
    public Object getAllCategories() {
        return apiClient.getAllCategories();
    }

    @Tool(description = "Updates a category's name or description. Only pass the fields you want changed.")
    public Map<String, Object> updateCategory(
            @ToolParam(description = "The ID of the category to update") Long categoryId,
            @ToolParam(description = "New category name", required = false) String name,
            @ToolParam(description = "New category description", required = false) String description
    ) {
        CategoryRequest request = new CategoryRequest();
        request.name = name;
        request.description = description;
        return apiClient.updateCategory(categoryId, request);
    }

    @Tool(description = "Deletes a category by its ID. Fails if any products are still assigned to this category — reassign or delete those products first.")
    public String deleteCategory(
            @ToolParam(description = "The ID of the category to delete") Long categoryId
    ) {
        apiClient.deleteCategory(categoryId);
        return "Category with ID " + categoryId + " has been deleted successfully.";
    }
}
