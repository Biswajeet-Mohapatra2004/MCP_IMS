package com.ims.restClient.dto.request;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class SupplierUpdateRequest {
    private String name;

    @Email(message = "Must be a valid email")
    private String contactEmail;

    private String phone;
}