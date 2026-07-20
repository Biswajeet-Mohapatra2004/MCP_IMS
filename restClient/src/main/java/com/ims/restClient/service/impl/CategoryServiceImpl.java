package com.ims.restClient.service.impl;


import com.ims.restClient.dto.request.CategoryCreateRequest;
import com.ims.restClient.dto.request.CategoryUpdateRequest;
import com.ims.restClient.dto.response.CategoryResponse;
import com.ims.restClient.entity.Category;
import com.ims.restClient.exception.CategoryInUseException;
import com.ims.restClient.exception.DuplicateResourceException;
import com.ims.restClient.exception.ResourceNotFoundException;
import com.ims.restClient.mapper.CategoryMapper;
import com.ims.restClient.repository.CategoryRepository;
import com.ims.restClient.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public CategoryResponse create(CategoryCreateRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Category with name " + request.getName() + " already exists");
        }
        Category category = categoryMapper.toEntity(request);
        Category saved = categoryRepository.save(category);
        return categoryMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getById(Long id) {
        return categoryMapper.toResponse(findCategoryOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAll() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    public CategoryResponse update(Long id, CategoryUpdateRequest request) {
        Category category = findCategoryOrThrow(id);

        if (request.getName() != null) category.setName(request.getName());
        if (request.getDescription() != null) category.setDescription(request.getDescription());

        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    public void delete(Long id) {
        Category category = findCategoryOrThrow(id);

        if (!category.getProducts().isEmpty()) {
            throw new CategoryInUseException(
                    "Cannot delete category '" + category.getName() + "' — it has "
                            + category.getProducts().size() + " product(s) assigned to it");
        }

        categoryRepository.delete(category);
    }

    private Category findCategoryOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }
}