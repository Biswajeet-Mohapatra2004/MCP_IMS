package com.ims.restClient.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class WarehouseUtilizationSummary {
    private Long warehouseId;
    private String warehouseName;
    private int totalQuantity;
    private int stockItemCount;
}