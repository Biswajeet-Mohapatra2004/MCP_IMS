package com.ims.mcpServer.dto;

import java.math.BigDecimal;

public class ProductCreateRequest {
    public String sku;
    public String name;
    public String description;
    public BigDecimal unitPrice;
    public Integer reorderThreshold;
    public Long categoryId;
}