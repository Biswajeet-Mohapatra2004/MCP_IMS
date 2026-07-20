package com.ims.restClient.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierResponse {
    private Long id;
    private String name;
    private String contactEmail;
    private String phone;
    private int productCount;
}