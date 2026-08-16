package com.ims.restClient.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ReorderCandidate {
    private Long productId;
    private String productName;
    private String sku;
    private int currentQuantity;
    private int reorderThreshold;
    private BigDecimal unitPrice;
    private List<SupplierOption> suppliers;
    private List<WarehouseStock> warehouseStock;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SupplierOption {
        private Long supplierId;
        private String supplierName;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class WarehouseStock {
        private Long warehouseId;
        private String warehouseName;
        private int quantity;
    }
}