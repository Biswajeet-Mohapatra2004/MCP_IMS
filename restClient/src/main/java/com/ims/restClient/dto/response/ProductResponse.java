package com.ims.restClient.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String sku;
    private String name;
    private String description;
    private BigDecimal unitPrice;
    private Integer reorderThreshold;
    private Long categoryId;
    private String categoryName;
    private List<SupplierSummary> suppliers;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public record SupplierSummary(Long id, String name) {

    }
}

