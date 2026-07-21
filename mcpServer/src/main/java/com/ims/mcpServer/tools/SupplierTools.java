package com.ims.mcpServer.tools;

import com.ims.mcpServer.client.InventoryApiClient;
import com.ims.mcpServer.dto.SupplierRequest;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class SupplierTools {

    private final InventoryApiClient apiClient;

    public SupplierTools(InventoryApiClient apiClient) {
        this.apiClient = apiClient;
    }

    @Tool(description = "Creates a new supplier with a name, contact email, and optional phone number")
    public Map<String, Object> createSupplier(
            @ToolParam(description = "Supplier company name") String name,
            @ToolParam(description = "Supplier contact email") String contactEmail,
            @ToolParam(description = "Supplier contact phone number", required = false) String phone
    ) {
        SupplierRequest request = new SupplierRequest();
        request.name = name;
        request.contactEmail = contactEmail;
        request.phone = phone;
        return apiClient.createSupplier(request);
    }

    @Tool(description = "Retrieves a supplier's details by its ID, including how many products they supply")
    public Map<String, Object> getSupplier(
            @ToolParam(description = "The ID of the supplier to retrieve") Long supplierId
    ) {
        return apiClient.getSupplier(supplierId);
    }

    @Tool(description = "Lists all suppliers")
    public Object getAllSuppliers() {
        return apiClient.getAllSuppliers();
    }

    @Tool(description = "Updates a supplier's name, contact email, or phone number. Only pass the fields you want changed.")
    public Map<String, Object> updateSupplier(
            @ToolParam(description = "The ID of the supplier to update") Long supplierId,
            @ToolParam(description = "New supplier name", required = false) String name,
            @ToolParam(description = "New contact email", required = false) String contactEmail,
            @ToolParam(description = "New phone number", required = false) String phone
    ) {
        SupplierRequest request = new SupplierRequest();
        request.name = name;
        request.contactEmail = contactEmail;
        request.phone = phone;
        return apiClient.updateSupplier(supplierId, request);
    }

    @Tool(description = "Deletes a supplier by its ID. Fails if any products are still linked to this supplier.")
    public String deleteSupplier(
            @ToolParam(description = "The ID of the supplier to delete") Long supplierId
    ) {
        apiClient.deleteSupplier(supplierId);
        return "Supplier with ID " + supplierId + " has been deleted successfully.";
    }
}