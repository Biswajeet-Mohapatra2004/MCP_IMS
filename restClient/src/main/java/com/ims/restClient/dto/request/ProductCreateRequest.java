package com.ims.restClient.dto.request;


import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Set;

@Data
public class ProductCreateRequest {

    @NotBlank(message = "SKU is required")
    private String sku;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Unit price must be positive")
    private BigDecimal unitPrice;

    @Min(value = 0, message = "Reorder threshold cannot be negative")
    private Integer reorderThreshold;
    private Long categoryId;
    private Set<Long> supplierIds;
}