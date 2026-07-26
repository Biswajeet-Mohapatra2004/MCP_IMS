package com.ims.restClient.dto.response;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InsightsSummaryResponse {
    private List<CategoryStockSummary> stockByCategory;
    private List<SupplierProductSummary> productsBySupplier;
    private List<WarehouseUtilizationSummary> warehouseUtilization;
    private List<ProductResponse> lowStockProducts;
}