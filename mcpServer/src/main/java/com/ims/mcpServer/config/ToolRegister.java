package com.ims.mcpServer.config;

import com.ims.mcpServer.tools.*;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ToolRegister {
    @Bean
    ToolCallbackProvider toolCallbackProvider(CategoryTools categoryTools, ProductTools productTools,
                                              StockTools stockTools, SupplierTools supplierTools,
                                              WarehouseTools warehouseTools, InsightsTools insightsTools) {
        return MethodToolCallbackProvider.builder()
                .toolObjects(categoryTools, productTools, stockTools, supplierTools, warehouseTools, insightsTools)
                .build();
    }
}
