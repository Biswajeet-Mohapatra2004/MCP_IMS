package com.ims.restClient.dto.request;

import lombok.Data;

@Data
public class WarehouseUpdateRequest {
    private String name;
    private String location;
}