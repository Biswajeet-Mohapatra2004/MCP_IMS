package com.ims.mcpClient.config;

import com.ims.mcpClient.context.RequestTokenContext;
import io.modelcontextprotocol.client.transport.customizer.McpSyncHttpClientRequestCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class McpClientConfig {

    @Bean
    public McpSyncHttpClientRequestCustomizer requestCustomizer() {
        return (builder, method, endpoint, body, context) -> {
            String forwardedToken = RequestTokenContext.get();
            System.out.println("[DEBUG] Customizer thread: " + Thread.currentThread().getName() + " | forwarded token present: " + (forwardedToken != null));
            if (forwardedToken != null) {
                builder.header("X-Forwarded-User-Token", forwardedToken);
            }
        };
    }
}