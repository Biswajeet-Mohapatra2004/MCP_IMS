package com.ims.restClient.mapper;

import com.ims.restClient.dto.response.StockItemResponse;
import com.ims.restClient.entity.StockItem;
import org.springframework.stereotype.Component;

@Component
public class StockItemMapper {

    public StockItemResponse toResponse(StockItem stockItem) {
        return StockItemResponse.builder()
                .id(stockItem.getId())
                .productId(stockItem.getProduct().getId())
                .productName(stockItem.getProduct().getName())
                .productSku(stockItem.getProduct().getSku())
                .warehouseId(stockItem.getWarehouse().getId())
                .warehouseName(stockItem.getWarehouse().getName())
                .quantity(stockItem.getQuantity())
                .lastUpdated(stockItem.getLastUpdated())
                .build();
    }
}