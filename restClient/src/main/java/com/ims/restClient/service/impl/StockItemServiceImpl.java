package com.ims.restClient.service.impl;

import com.ims.restClient.dto.request.StockItemCreateRequest;
import com.ims.restClient.dto.request.StockUpdateRequest;
import com.ims.restClient.dto.response.StockItemResponse;
import com.ims.restClient.entity.Product;
import com.ims.restClient.entity.StockItem;
import com.ims.restClient.entity.Warehouse;
import com.ims.restClient.exception.DuplicateResourceException;
import com.ims.restClient.exception.InsufficientStockException;
import com.ims.restClient.exception.ResourceNotFoundException;
import com.ims.restClient.mapper.StockItemMapper;
import com.ims.restClient.repository.ProductRepository;
import com.ims.restClient.repository.StockItemRepository;
import com.ims.restClient.repository.WarehouseRepository;
import com.ims.restClient.service.StockItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class StockItemServiceImpl implements StockItemService {

    private final StockItemRepository stockItemRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final StockItemMapper stockItemMapper;

    @Override
    public StockItemResponse create(StockItemCreateRequest request) {
        stockItemRepository.findByProductIdAndWarehouseId(request.getProductId(), request.getWarehouseId())
                .ifPresent(existing -> {
                    throw new DuplicateResourceException(
                            "Stock item already exists for this product in this warehouse — use adjustStock instead");
                });

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + request.getWarehouseId()));

        StockItem stockItem = StockItem.builder()
                .product(product)
                .warehouse(warehouse)
                .quantity(request.getQuantity() != null ? request.getQuantity() : 0)
                .build();

        return stockItemMapper.toResponse(stockItemRepository.save(stockItem));
    }

    @Override
    @Transactional(readOnly = true)
    public StockItemResponse getById(Long id) {
        return stockItemMapper.toResponse(findStockItemOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockItemResponse> getAll() {
        return stockItemRepository.findAll().stream()
                .map(stockItemMapper::toResponse)
                .toList();
    }

    @Override
    public StockItemResponse adjustStock(StockUpdateRequest request) {
        StockItem stockItem = stockItemRepository
                .findByProductIdAndWarehouseId(request.getProductId(), request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No stock item found for product " + request.getProductId()
                                + " in warehouse " + request.getWarehouseId()));

        int newQuantity = stockItem.getQuantity() + request.getQuantityChange();

        if (newQuantity < 0) {
            throw new InsufficientStockException(
                    "Insufficient stock: current quantity is " + stockItem.getQuantity()
                            + ", cannot reduce by " + Math.abs(request.getQuantityChange()));
        }

        stockItem.setQuantity(newQuantity);
        return stockItemMapper.toResponse(stockItemRepository.save(stockItem));
    }

    @Override
    public void delete(Long id) {
        StockItem stockItem = findStockItemOrThrow(id);
        stockItemRepository.delete(stockItem);
    }

    private StockItem findStockItemOrThrow(Long id) {
        return stockItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock item not found with id: " + id));
    }
}