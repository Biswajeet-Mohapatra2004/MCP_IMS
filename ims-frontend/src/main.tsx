import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import keycloak from "./keycloak";
import "./styles/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // data considered fresh for 30s — no refetch on tab switch within that window
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root")!);

keycloak
  .init({
    onLoad: "login-required",
    pkceMethod: "S256",
    checkLoginIframe: false,
  })
  .then((authenticated) => {
    if (authenticated) {
      root.render(
        <React.StrictMode>
          <QueryClientProvider client={queryClient}>
               <App />
             </QueryClientProvider>
        </React.StrictMode>
      );
    } else {
      window.location.reload();
    }
  })
  .catch((err) => {
    console.error("Keycloak init failed", err);
    root.render(<div style={{ padding: 24 }}>Failed to initialize authentication. Check console for details.</div>);
  });

// Auto-refresh token before it expires
setInterval(() => {
  keycloak.updateToken(30).catch(() => {
    console.warn("Token refresh failed — logging out");
    keycloak.logout();
  });
}, 20000);