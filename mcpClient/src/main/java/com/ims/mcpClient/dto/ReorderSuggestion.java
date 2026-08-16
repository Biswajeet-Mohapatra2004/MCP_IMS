package com.ims.mcpClient.dto;

public class ReorderSuggestion {
    public Long productId;
    public String productName;
    public String sku;
    public int currentQuantity;
    public int reorderThreshold;
    public Long supplierId;
    public String supplierName;
    public Long warehouseId;
    public String warehouseName;
    public int suggestedQuantity;
    public String reasoning;
}