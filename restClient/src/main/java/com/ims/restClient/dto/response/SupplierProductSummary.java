package com.ims.restClient.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SupplierProductSummary {
    private Long supplierId;
    private String supplierName;
    private int productCount;
}