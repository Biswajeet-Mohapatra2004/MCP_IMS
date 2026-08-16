package com.ims.mcpServer.client;

import com.ims.mcpServer.dto.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;


@Component
public class InventoryApiClient {

    private final RestClient restClient;

    public InventoryApiClient(RestClient inventoryRestClient) {
        this.restClient = inventoryRestClient;
    }

    // ---------- Product ----------
    public Map<String, Object> createProduct(ProductCreateRequest request) {
        return restClient.post().uri("/api/products").body(request).retrieve().body(Map.class);
    }

    public Map<String, Object> getProduct(Long id) {
        return restClient.get().uri("/api/products/{id}", id).retrieve().body(Map.class);
    }

    public List<Map<String, Object>> getAllProducts() {
        return restClient.get().uri("/api/products").retrieve().body(List.class);
    }

    public Map<String, Object> updateProduct(Long id, ProductUpdateRequest request) {
        return restClient.put().uri("/api/products/{id}", id).body(request).retrieve().body(Map.class);
    }

    public void deleteProduct(Long id) {
        restClient.delete().uri("/api/products/{id}", id).retrieve().toBodilessEntity();
    }

    // ---------- Category ----------
    public Map<String, Object> createCategory(CategoryRequest request) {
        return restClient.post().uri("/api/categories").body(request).retrieve().body(Map.class);
    }

    public Map<String, Object> getCategory(Long id) {
        return restClient.get().uri("/api/categories/{id}", id).retrieve().body(Map.class);
    }

    public List<Map<String, Object>> getAllCategories() {
        return restClient.get().uri("/api/categories").retrieve().body(List.class);
    }

    public Map<String, Object> updateCategory(Long id, CategoryRequest request) {
        return restClient.put().uri("/api/categories/{id}", id).body(request).retrieve().body(Map.class);
    }

    public void deleteCategory(Long id) {
        restClient.delete().uri("/api/categories/{id}", id).retrieve().toBodilessEntity();
    }

    // ---------- Warehouse ----------
    public Map<String, Object> createWarehouse(WarehouseRequest request) {
        return restClient.post().uri("/api/warehouses").body(request).retrieve().body(Map.class);
    }

    public Map<String, Object> getWarehouse(Long id) {
        return restClient.get().uri("/api/warehouses/{id}", id).retrieve().body(Map.class);
    }

    public List<Map<String, Object>> getAllWarehouses() {
        return restClient.get().uri("/api/warehouses").retrieve().body(List.class);
    }

    public Map<String, Object> updateWarehouse(Long id, WarehouseRequest request) {
        return restClient.put().uri("/api/warehouses/{id}", id).body(request).retrieve().body(Map.class);
    }

    public void deleteWarehouse(Long id) {
        restClient.delete().uri("/api/warehouses/{id}", id).retrieve().toBodilessEntity();
    }

    // ---------- Supplier ----------
    public Map<String, Object> createSupplier(SupplierRequest request) {
        return restClient.post().uri("/api/suppliers").body(request).retrieve().body(Map.class);
    }

    public Map<String, Object> getSupplier(Long id) {
        return restClient.get().uri("/api/suppliers/{id}", id).retrieve().body(Map.class);
    }

    public List<Map<String, Object>> getAllSuppliers() {
        return restClient.get().uri("/api/suppliers").retrieve().body(List.class);
    }

    public Map<String, Object> updateSupplier(Long id, SupplierRequest request) {
        return restClient.put().uri("/api/suppliers/{id}", id).body(request).retrieve().body(Map.class);
    }

    public void deleteSupplier(Long id) {
        restClient.delete().uri("/api/suppliers/{id}", id).retrieve().toBodilessEntity();
    }

    // ---------- StockItem ----------
    public Map<String, Object> createStockItem(StockItemCreateRequest request) {
        return restClient.post().uri("/api/stock-items").body(request).retrieve().body(Map.class);
    }

    public Map<String, Object> getStockItem(Long id) {
        return restClient.get().uri("/api/stock-items/{id}", id).retrieve().body(Map.class);
    }

    public List<Map<String, Object>> getAllStockItems() {
        return restClient.get().uri("/api/stock-items").retrieve().body(List.class);
    }

    public Map<String, Object> adjustStock(StockAdjustRequest request) {
        return restClient.patch().uri("/api/stock-items/adjust").body(request).retrieve().body(Map.class);
    }

    public void deleteStockItem(Long id) {
        restClient.delete().uri("/api/stock-items/{id}", id).retrieve().toBodilessEntity();
    }

    public Map<String, Object> getInsightsSummary() {
        return restClient.get().uri("/api/insights/summary").retrieve().body(Map.class);
    }

    public Object getReorderCandidates() {
        return restClient.get().uri("/api/insights/reorder-candidates").retrieve().body(List.class);
    }
}