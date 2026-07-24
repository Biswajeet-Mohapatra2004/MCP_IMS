import axios from "axios";
import keycloak from "../keycloak";

export const restApiClient = axios.create({
  baseURL: import.meta.env.VITE_REST_API_URL,
});

export const mcpChatClient = axios.create({
  baseURL: import.meta.env.VITE_MCP_CLIENT_URL,
});

[restApiClient, mcpChatClient].forEach((client) => {
  client.interceptors.request.use(async (config) => {
    try {
      await keycloak.updateToken(10);
    } catch {
      keycloak.logout();
    }
    config.headers.Authorization = `Bearer ${keycloak.token}`;
    return config;
  });
});