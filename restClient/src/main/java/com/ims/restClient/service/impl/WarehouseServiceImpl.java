package com.ims.restClient.service.impl;

import com.ims.restClient.dto.request.WarehouseCreateRequest;
import com.ims.restClient.dto.request.WarehouseUpdateRequest;
import com.ims.restClient.dto.response.WarehouseResponse;
import com.ims.restClient.entity.Warehouse;
import com.ims.restClient.exception.DuplicateResourceException;
import com.ims.restClient.exception.ResourceNotFoundException;
import com.ims.restClient.exception.WarehouseInUseException;
import com.ims.restClient.mapper.WarehouseMapper;
import com.ims.restClient.repository.WarehouseRepository;
import com.ims.restClient.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseMapper warehouseMapper;

    @Override
    public WarehouseResponse create(WarehouseCreateRequest request) {
        if (warehouseRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Warehouse with name " + request.getName() + " already exists");
        }
        Warehouse warehouse = warehouseMapper.toEntity(request);
        return warehouseMapper.toResponse(warehouseRepository.save(warehouse));
    }

    @Override
    @Transactional(readOnly = true)
    public WarehouseResponse getById(Long id) {
        return warehouseMapper.toResponse(findWarehouseOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseResponse> getAll() {
        return warehouseRepository.findAll().stream()
                .map(warehouseMapper::toResponse)
                .toList();
    }

    @Override
    public WarehouseResponse update(Long id, WarehouseUpdateRequest request) {
        Warehouse warehouse = findWarehouseOrThrow(id);

        if (request.getName() != null) warehouse.setName(request.getName());
        if (request.getLocation() != null) warehouse.setLocation(request.getLocation());

        return warehouseMapper.toResponse(warehouseRepository.save(warehouse));
    }

    @Override
    public void delete(Long id) {
        Warehouse warehouse = findWarehouseOrThrow(id);

        if (!warehouse.getStockItems().isEmpty()) {
            throw new WarehouseInUseException(
                    "Cannot delete warehouse '" + warehouse.getName() + "' — it has "
                            + warehouse.getStockItems().size() + " stock item(s) assigned to it");
        }

        warehouseRepository.delete(warehouse);
    }

    private Warehouse findWarehouseOrThrow(Long id) {
        return warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));
    }
}