package com.ims.mcpServer.dto;


import java.math.BigDecimal;

public class ProductUpdateRequest {
    public String name;
    public String description;
    public BigDecimal unitPrice;
    public Integer reorderThreshold;
}