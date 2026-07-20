package com.ims.restClient.service.impl;

import com.ims.restClient.dto.request.SupplierCreateRequest;
import com.ims.restClient.dto.request.SupplierUpdateRequest;
import com.ims.restClient.dto.response.SupplierResponse;
import com.ims.restClient.entity.Supplier;
import com.ims.restClient.exception.DuplicateResourceException;
import com.ims.restClient.exception.ResourceNotFoundException;
import com.ims.restClient.exception.SupplierInUseException;
import com.ims.restClient.mapper.SupplierMapper;
import com.ims.restClient.repository.SupplierRepository;
import com.ims.restClient.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;

    @Override
    public SupplierResponse create(SupplierCreateRequest request) {
        if (supplierRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Supplier with name " + request.getName() + " already exists");
        }
        Supplier supplier = supplierMapper.toEntity(request);
        return supplierMapper.toResponse(supplierRepository.save(supplier));
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierResponse getById(Long id) {
        return supplierMapper.toResponse(findSupplierOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierResponse> getAll() {
        return supplierRepository.findAll().stream()
                .map(supplierMapper::toResponse)
                .toList();
    }

    @Override
    public SupplierResponse update(Long id, SupplierUpdateRequest request) {
        Supplier supplier = findSupplierOrThrow(id);

        if (request.getName() != null) supplier.setName(request.getName());
        if (request.getContactEmail() != null) supplier.setContactEmail(request.getContactEmail());
        if (request.getPhone() != null) supplier.setPhone(request.getPhone());

        return supplierMapper.toResponse(supplierRepository.save(supplier));
    }

    @Override
    public void delete(Long id) {
        Supplier supplier = findSupplierOrThrow(id);

        if (!supplier.getProducts().isEmpty()) {
            throw new SupplierInUseException(
                    "Cannot delete supplier '" + supplier.getName() + "' — it is linked to "
                            + supplier.getProducts().size() + " product(s)");
        }

        supplierRepository.delete(supplier);
    }

    private Supplier findSupplierOrThrow(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
    }
}