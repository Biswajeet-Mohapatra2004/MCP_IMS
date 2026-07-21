package com.ims.mcpServer.tools;

import com.ims.mcpServer.client.InventoryApiClient;
import com.ims.mcpServer.dto.WarehouseRequest;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class WarehouseTools {

    private final InventoryApiClient apiClient;

    public WarehouseTools(InventoryApiClient apiClient) {
        this.apiClient = apiClient;
    }

    @Tool(description = "Creates a new warehouse location")
    public Map<String, Object> createWarehouse(
            @ToolParam(description = "Warehouse name") String name,
            @ToolParam(description = "Warehouse physical location/address") String location
    ) {
        WarehouseRequest request = new WarehouseRequest();
        request.name = name;
        request.location = location;
        return apiClient.createWarehouse(request);
    }

    @Tool(description = "Retrieves a warehouse's details by its ID, including how many distinct stock items are stored there")
    public Map<String, Object> getWarehouse(
            @ToolParam(description = "The ID of the warehouse to retrieve") Long warehouseId
    ) {
        return apiClient.getWarehouse(warehouseId);
    }

    @Tool(description = "Lists all warehouses")
    public Object getAllWarehouses() {
        return apiClient.getAllWarehouses();
    }

    @Tool(description = "Updates a warehouse's name or location. Only pass the fields you want changed.")
    public Map<String, Object> updateWarehouse(
            @ToolParam(description = "The ID of the warehouse to update") Long warehouseId,
            @ToolParam(description = "New warehouse name", required = false) String name,
            @ToolParam(description = "New warehouse location", required = false) String location
    ) {
        WarehouseRequest request = new WarehouseRequest();
        request.name = name;
        request.location = location;
        return apiClient.updateWarehouse(warehouseId, request);
    }

    @Tool(description = "Deletes a warehouse by its ID. Fails if any stock items are still stored there — remove or transfer that stock first.")
    public String deleteWarehouse(
            @ToolParam(description = "The ID of the warehouse to delete") Long warehouseId
    ) {
        apiClient.deleteWarehouse(warehouseId);
        return "Warehouse with ID " + warehouseId + " has been deleted successfully.";
    }
}