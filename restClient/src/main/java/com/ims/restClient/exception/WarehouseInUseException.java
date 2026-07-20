package com.ims.restClient.exception;

public class WarehouseInUseException extends RuntimeException {
    public WarehouseInUseException(String message) {
        super(message);
    }
}