package com.ims.mcpServer.exception;

public class ApiCallException extends RuntimeException {
    public ApiCallException(String message) {
        super(message);
    }
}
