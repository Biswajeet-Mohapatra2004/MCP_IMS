package com.ims.restClient.repository;

import com.ims.restClient.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    Optional<Warehouse> findByName(String name);
    boolean existsByName(String name);
}