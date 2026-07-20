package com.ims.restClient.dto.request;


import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductUpdateRequest {
    private String name;
    private String description;

    @DecimalMin(value = "0.0", inclusive = false, message = "Unit price must be positive")
    private BigDecimal unitPrice;

    @Min(value = 0, message = "Reorder threshold cannot be negative")
    private Integer reorderThreshold;
}