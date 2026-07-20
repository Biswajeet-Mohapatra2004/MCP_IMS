package com.ims.restClient.exception;

public class SupplierInUseException extends RuntimeException {
    public SupplierInUseException(String message) {
        super(message);
    }
}