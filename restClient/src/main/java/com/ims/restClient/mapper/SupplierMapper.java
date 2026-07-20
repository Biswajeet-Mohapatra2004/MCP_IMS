package com.ims.restClient.mapper;

import com.ims.restClient.dto.request.SupplierCreateRequest;
import com.ims.restClient.dto.response.SupplierResponse;
import com.ims.restClient.entity.Supplier;
import org.springframework.stereotype.Component;

@Component
public class SupplierMapper {

    public Supplier toEntity(SupplierCreateRequest request) {
        return Supplier.builder()
                .name(request.getName())
                .contactEmail(request.getContactEmail())
                .phone(request.getPhone())
                .build();
    }

    public SupplierResponse toResponse(Supplier supplier) {
        return SupplierResponse.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .contactEmail(supplier.getContactEmail())
                .phone(supplier.getPhone())
                .productCount(supplier.getProducts() != null ? supplier.getProducts().size() : 0)
                .build();
    }
}