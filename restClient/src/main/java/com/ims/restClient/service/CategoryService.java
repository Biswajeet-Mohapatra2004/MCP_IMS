package com.ims.restClient.service;


import com.ims.restClient.dto.request.CategoryCreateRequest;
import com.ims.restClient.dto.request.CategoryUpdateRequest;
import com.ims.restClient.dto.response.CategoryResponse;
import java.util.List;

public interface CategoryService {
    CategoryResponse create(CategoryCreateRequest request);
    CategoryResponse getById(Long id);
    List<CategoryResponse> getAll();
    CategoryResponse update(Long id, CategoryUpdateRequest request);
    void delete(Long id);
}