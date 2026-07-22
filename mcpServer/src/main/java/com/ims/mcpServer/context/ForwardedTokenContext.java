package com.ims.mcpServer.context;

public class ForwardedTokenContext {

    private static final ThreadLocal<String> CURRENT_TOKEN = new ThreadLocal<>();

    public static void set(String token) {
        CURRENT_TOKEN.set(token);
    }

    public static String get() {
        return CURRENT_TOKEN.get();
    }

    public static void clear() {
        CURRENT_TOKEN.remove();
    }
}