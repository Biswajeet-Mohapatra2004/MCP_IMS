package com.ims.restClient.mapper;

package com.ims.restClient.mapper;

import com.ims.restClient.dto.request.WarehouseCreateRequest;
import com.ims.restClient.dto.response.WarehouseResponse;
import com.ims.restClient.entity.Warehouse;
import org.springframework.stereotype.Component;

@Component
public class WarehouseMapper {

    public Warehouse toEntity(WarehouseCreateRequest request) {
        return Warehouse.builder()
                .name(request.getName())
                .location(request.getLocation())
                .build();
    }

    public WarehouseResponse toResponse(Warehouse warehouse) {
        return WarehouseResponse.builder()
                .id(warehouse.getId())
                .name(warehouse.getName())
                .location(warehouse.getLocation())
                .stockItemCount(warehouse.getStockItems() != null ? warehouse.getStockItems().size() : 0)
                .build();
    }
}