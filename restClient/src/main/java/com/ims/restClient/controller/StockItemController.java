package com.ims.restClient.controller;

import com.ims.restClient.dto.request.StockItemCreateRequest;
import com.ims.restClient.dto.request.StockUpdateRequest;
import com.ims.restClient.dto.response.StockItemResponse;
import com.ims.restClient.service.StockItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-items")
@RequiredArgsConstructor
public class StockItemController {

    private final StockItemService stockItemService;

    @PostMapping
    public ResponseEntity<StockItemResponse> create(@Valid @RequestBody StockItemCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stockItemService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StockItemResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(stockItemService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<StockItemResponse>> getAll() {
        return ResponseEntity.ok(stockItemService.getAll());
    }

    @PatchMapping("/adjust")
    public ResponseEntity<StockItemResponse> adjustStock(@Valid @RequestBody StockUpdateRequest request) {
        return ResponseEntity.ok(stockItemService.adjustStock(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        stockItemService.delete(id);
        return ResponseEntity.noContent().build();
    }
}