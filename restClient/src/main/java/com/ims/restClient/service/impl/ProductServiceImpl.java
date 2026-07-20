package com.ims.restClient.service.impl;

import com.ims.restClient.dto.request.ProductCreateRequest;
import com.ims.restClient.dto.request.ProductUpdateRequest;
import com.ims.restClient.dto.response.ProductResponse;
import com.ims.restClient.entity.Category;
import com.ims.restClient.entity.Product;
import com.ims.restClient.exception.DuplicateResourceException;
import com.ims.restClient.exception.ResourceNotFoundException;
import com.ims.restClient.mapper.ProductMapper;
import com.ims.restClient.repository.CategoryRepository;
import com.ims.restClient.repository.ProductRepository;
import com.ims.restClient.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;   // <-- new
    private final ProductMapper productMapper;

    @Override
    public ProductResponse create(ProductCreateRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new DuplicateResourceException("Product with SKU " + request.getSku() + " already exists");
        }

        Product product = productMapper.toEntity(request);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category not found with id: " + request.getCategoryId()));
            product.setCategory(category);
        }

        Product saved = productRepository.save(product);
        return productMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        Product product = findProductOrThrow(id);
        return productMapper.toResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAll() {
        return productRepository.findAll().stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    public ProductResponse update(Long id, ProductUpdateRequest request) {
        Product product = findProductOrThrow(id);

        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getUnitPrice() != null) product.setUnitPrice(request.getUnitPrice());
        if (request.getReorderThreshold() != null) product.setReorderThreshold(request.getReorderThreshold());

        Product updated = productRepository.save(product);
        return productMapper.toResponse(updated);
    }

    @Override
    public void delete(Long id) {
        Product product = findProductOrThrow(id);
        productRepository.delete(product);
    }

    private Product findProductOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }
}