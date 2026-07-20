package com.ims.restClient.service;

import com.ims.restClient.dto.request.ProductCreateRequest;
import com.ims.restClient.dto.request.ProductUpdateRequest;
import com.ims.restClient.dto.response.ProductResponse;
import java.util.List;

public interface ProductService {
    ProductResponse create(ProductCreateRequest request);
    ProductResponse getById(Long id);
    List<ProductResponse> getAll();
    ProductResponse update(Long id, ProductUpdateRequest request);
    void delete(Long id);
}