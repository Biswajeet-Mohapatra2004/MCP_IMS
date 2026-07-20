package com.ims.restClient.service;

import com.ims.restClient.dto.request.WarehouseCreateRequest;
import com.ims.restClient.dto.request.WarehouseUpdateRequest;
import com.ims.restClient.dto.response.WarehouseResponse;
import java.util.List;

public interface WarehouseService {
    WarehouseResponse create(WarehouseCreateRequest request);
    WarehouseResponse getById(Long id);
    List<WarehouseResponse> getAll();
    WarehouseResponse update(Long id, WarehouseUpdateRequest request);
    void delete(Long id);
}