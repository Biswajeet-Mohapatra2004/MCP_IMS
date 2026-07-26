package com.ims.restClient.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CategoryStockSummary {
    private Long categoryId;
    private String categoryName;
    private int totalQuantity;
    private int productCount;
    private int lowStockCount;
}