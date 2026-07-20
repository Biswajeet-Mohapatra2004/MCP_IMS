package com.ims.restClient.service;

import com.ims.restClient.dto.request.SupplierCreateRequest;
import com.ims.restClient.dto.request.SupplierUpdateRequest;
import com.ims.restClient.dto.response.SupplierResponse;
import java.util.List;

public interface SupplierService {
    SupplierResponse create(SupplierCreateRequest request);
    SupplierResponse getById(Long id);
    List<SupplierResponse> getAll();
    SupplierResponse update(Long id, SupplierUpdateRequest request);
    void delete(Long id);
}