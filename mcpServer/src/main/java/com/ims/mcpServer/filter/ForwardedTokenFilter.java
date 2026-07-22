package com.ims.mcpServer.filter;

import com.ims.mcpServer.context.ForwardedTokenContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class ForwardedTokenFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String forwardedToken = request.getHeader("X-Forwarded-User-Token");
        System.out.println("[DEBUG] MCP Server filter | header present: " + (forwardedToken != null));
        try {
            if (forwardedToken != null && !forwardedToken.isBlank()) {
                ForwardedTokenContext.set(forwardedToken);
            }
            filterChain.doFilter(request, response);
        } finally {
            ForwardedTokenContext.clear();
        }
    }
}