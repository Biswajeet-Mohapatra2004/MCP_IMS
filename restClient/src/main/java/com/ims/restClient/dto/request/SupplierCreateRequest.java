package com.ims.restClient.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SupplierCreateRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Contact email is required")
    @Email(message = "Must be a valid email")
    private String contactEmail;

    private String phone;
}