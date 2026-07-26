package com.ims.mcpClient.contoller;

import com.ims.mcpClient.context.RequestTokenContext;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
public class InventoryChatController {

    private final ChatClient chatClient;

    public InventoryChatController(ChatClient.Builder chatClientBuilder, ToolCallbackProvider tools) {
        this.chatClient = chatClientBuilder
                .defaultAdvisors(new SimpleLoggerAdvisor())
                .defaultTools(tools)
                .build();
    }

    @PostMapping("/chat")
    public ResponseEntity<String> chat(@RequestParam(name = "query") String query, HttpServletRequest request)  {
        String authHeader = request.getHeader("Authorization");
        String userToken = (authHeader != null && authHeader.startsWith("Bearer "))
                ? authHeader.substring(7)
                : null;

        try {
            System.out.println("[DEBUG] Controller thread: " + Thread.currentThread().getName() + " | token present: " + (userToken != null));
            RequestTokenContext.set(userToken);
            String response = chatClient.prompt(query).call().content();
            return ResponseEntity.ok(response);
        } finally {
            RequestTokenContext.clear();
        }
    }

    @GetMapping("/insights")
    public ResponseEntity<String> insights() {
        String prompt = """
        Call the getInsightsSummary tool to retrieve current inventory analytics, then write a
        concise, prioritized narrative (3-5 sentences) for a manager reading this at a glance.
        Highlight the most concerning low-stock situations, any category or warehouse that stands
        out, and end with one clear recommended action. Do not just restate raw numbers — synthesize
        and prioritize them.
        """;
        String response = chatClient.prompt(prompt).call().content();
        return ResponseEntity.ok(response);
    }
}