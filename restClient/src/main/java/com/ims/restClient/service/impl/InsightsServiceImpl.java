package com.ims.restClient.service.impl;

import com.ims.restClient.dto.response.*;
import com.ims.restClient.entity.*;
import com.ims.restClient.mapper.ProductMapper;
import com.ims.restClient.repository.*;
import com.ims.restClient.service.InsightsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InsightsServiceImpl implements InsightsService {

    private final ProductRepository productRepository;
    private final StockItemRepository stockItemRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductMapper productMapper;

    @Override
    public InsightsSummaryResponse getSummary() {
        List<Product> products = productRepository.findAll();
        List<StockItem> stockItems = stockItemRepository.findAll();
        List<Supplier> suppliers = supplierRepository.findAll();
        List<Warehouse> warehouses = warehouseRepository.findAll();

        Map<Long, Integer> qtyByProductId = stockItems.stream()
                .collect(Collectors.groupingBy(
                        si -> si.getProduct().getId(),
                        Collectors.summingInt(StockItem::getQuantity)));

        return InsightsSummaryResponse.builder()
                .stockByCategory(buildStockByCategory(products, qtyByProductId))
                .productsBySupplier(buildProductsBySupplier(products, suppliers))
                .warehouseUtilization(buildWarehouseUtilization(warehouses, stockItems))
                .lowStockProducts(buildLowStockProducts(products, qtyByProductId))
                .build();
    }

    private List<CategoryStockSummary> buildStockByCategory(List<Product> products, Map<Long, Integer> qtyByProductId) {
        Map<Category, List<Product>> byCategory = products.stream()
                .filter(p -> p.getCategory() != null)
                .collect(Collectors.groupingBy(Product::getCategory));

        return byCategory.entrySet().stream()
                .map(entry -> {
                    Category cat = entry.getKey();
                    List<Product> prods = entry.getValue();
                    int totalQty = prods.stream().mapToInt(p -> qtyByProductId.getOrDefault(p.getId(), 0)).sum();
                    int lowStock = (int) prods.stream()
                            .filter(p -> qtyByProductId.getOrDefault(p.getId(), 0) < p.getReorderThreshold())
                            .count();
                    return CategoryStockSummary.builder()
                            .categoryId(cat.getId())
                            .categoryName(cat.getName())
                            .totalQuantity(totalQty)
                            .productCount(prods.size())
                            .lowStockCount(lowStock)
                            .build();
                })
                .sorted(Comparator.comparing(CategoryStockSummary::getCategoryName))
                .toList();
    }

    private List<SupplierProductSummary> buildProductsBySupplier(List<Product> products, List<Supplier> suppliers) {
        Map<Long, Long> countBySupplierId = new HashMap<>();
        for (Product p : products) {
            for (Supplier s : p.getSuppliers()) {
                countBySupplierId.merge(s.getId(), 1L, Long::sum);
            }
        }
        return suppliers.stream()
                .map(s -> SupplierProductSummary.builder()
                        .supplierId(s.getId())
                        .supplierName(s.getName())
                        .productCount(countBySupplierId.getOrDefault(s.getId(), 0L).intValue())
                        .build())
                .sorted(Comparator.comparing(SupplierProductSummary::getSupplierName))
                .toList();
    }

    private List<WarehouseUtilizationSummary> buildWarehouseUtilization(List<Warehouse> warehouses, List<StockItem> stockItems) {
        Map<Long, List<StockItem>> byWarehouseId = stockItems.stream()
                .collect(Collectors.groupingBy(si -> si.getWarehouse().getId()));

        return warehouses.stream()
                .map(w -> {
                    List<StockItem> items = byWarehouseId.getOrDefault(w.getId(), List.of());
                    int totalQty = items.stream().mapToInt(StockItem::getQuantity).sum();
                    return WarehouseUtilizationSummary.builder()
                            .warehouseId(w.getId())
                            .warehouseName(w.getName())
                            .totalQuantity(totalQty)
                            .stockItemCount(items.size())
                            .build();
                })
                .sorted(Comparator.comparing(WarehouseUtilizationSummary::getWarehouseName))
                .toList();
    }

    private List<ProductResponse> buildLowStockProducts(List<Product> products, Map<Long, Integer> qtyByProductId) {
        return products.stream()
                .filter(p -> qtyByProductId.getOrDefault(p.getId(), 0) < p.getReorderThreshold())
                .map(productMapper::toResponse)
                .toList();
    }

    public List<ReorderCandidate> getReorderCandidates() {
        List<Product> products = productRepository.findAll();
        List<StockItem> stockItems = stockItemRepository.findAll();

        Map<Long, List<StockItem>> stockByProductId = stockItems.stream()
                .collect(Collectors.groupingBy(si -> si.getProduct().getId()));

        return products.stream()
                .map(p -> {
                    List<StockItem> items = stockByProductId.getOrDefault(p.getId(), List.of());
                    int totalQty = items.stream().mapToInt(StockItem::getQuantity).sum();
                    if (totalQty >= p.getReorderThreshold()) return null; // not a candidate

                    List<ReorderCandidate.SupplierOption> supplierOptions = p.getSuppliers().stream()
                            .map(s -> new ReorderCandidate.SupplierOption(s.getId(), s.getName()))
                            .toList();

                    List<ReorderCandidate.WarehouseStock> warehouseStocks = items.stream()
                            .map(si -> new ReorderCandidate.WarehouseStock(
                                    si.getWarehouse().getId(), si.getWarehouse().getName(), si.getQuantity()))
                            .toList();

                    return ReorderCandidate.builder()
                            .productId(p.getId())
                            .productName(p.getName())
                            .sku(p.getSku())
                            .currentQuantity(totalQty)
                            .reorderThreshold(p.getReorderThreshold())
                            .unitPrice(p.getUnitPrice())
                            .suppliers(supplierOptions)
                            .warehouseStock(warehouseStocks)
                            .build();
                })
                .filter(Objects::nonNull)
                .toList();
    }
}