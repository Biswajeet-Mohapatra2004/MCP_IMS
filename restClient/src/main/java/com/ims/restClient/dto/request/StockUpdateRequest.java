package com.ims.restClient.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StockUpdateRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Warehouse ID is required")
    private Long warehouseId;

    @NotNull(message = "Quantity change is required")
    private Integer quantityChange;   // positive = add stock, negative = remove stock
}