package com.ims.restClient.service;

import com.ims.restClient.dto.request.StockItemCreateRequest;
import com.ims.restClient.dto.request.StockUpdateRequest;
import com.ims.restClient.dto.response.StockItemResponse;
import java.util.List;

public interface StockItemService {
    StockItemResponse create(StockItemCreateRequest request);
    StockItemResponse getById(Long id);
    List<StockItemResponse> getAll();
    StockItemResponse adjustStock(StockUpdateRequest request);
    void delete(Long id);
}