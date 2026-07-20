package com.ims.restClient.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryCreateRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;
}