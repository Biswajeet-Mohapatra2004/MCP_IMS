import axios from "axios";
import keycloak from "../keycloak";

export const restApiClient = axios.create({
  baseURL: "http://localhost:8081",
});

export const mcpChatClient = axios.create({
  baseURL: "http://localhost:8080",
});

// Attach the current user's token to every outgoing request, on both clients
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