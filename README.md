# Inventory Management System (IMS)

A full-stack Inventory Management System built to explore the **Model Context Protocol (MCP)** with Spring AI — combining a traditional SAP-style admin console with an embedded, voice-and-text-capable AI assistant that can perform the same operations conversationally.

---

## ✨ Features

- **Full CRUD across 5 entities** — Products, Categories, Warehouses, Stock Items, Suppliers, including many-to-many (Product ↔ Supplier) and many-to-one (Product → Category) relationships
- **Dual interface, one app**
  - **Console** — a dense, minimalist, SAP Fiori–inspired admin UI with slide-in forms for every entity
  - **AI Assistant** — a chat interface (text + voice input) where a Gemini-powered agent performs the same operations by calling MCP tools
- **Real authentication & role-based access control** — Keycloak-backed login (Authorization Code + PKCE) with three roles (`ADMIN`, `MANAGER`, `STAFF`), enforced at the API layer, not just hidden in the UI
- **25 MCP tools** exposing full CRUD for every entity to the AI assistant
- **Client-side caching** via TanStack Query — no redundant refetching when switching between Console tabs
- **Fully deployed**, end to end, across multiple free-tier cloud platforms

---

## 🏗️ Architecture

```
                    ┌─────────────────────────────┐
                    │   React Frontend (Vite)      │
                    │   Vercel                     │
                    │  ┌─────────┐  ┌────────────┐ │
                    │  │ Console │  │ Chat (AI)  │ │
                    │  └────┬────┘  └─────┬──────┘ │
                    └───────┼─────────────┼─────────┘
                       (user's JWT)  (user's JWT)
                            │             │
                            ▼             ▼
                  REST API (Render)   MCP Client (Render)
                            │             │
                            │       forwards to
                            │             ▼
                            │       MCP Server (Render)
                            │             │
                            │      (service account token)
                            │             │
                            └─────────────┘
                                    ▼
                              REST API
                                    │
                                    ▼
                          Postgres (Neon)

        Auth: Keycloak (Cloud-IAM, managed)
```

| Service | Responsibility |
|---|---|
| **REST API** | Owns the domain model, enforces RBAC, persists to Postgres |
| **MCP Server** | Exposes 25 `@Tool` methods wrapping the REST API for MCP-compatible clients |
| **MCP Client** | Hosts the chat endpoint; Gemini decides which tools to call |
| **Frontend** | Console (direct REST calls) + Chat (via MCP Client) in one Vite/React app |
| **Keycloak** (Cloud-IAM) | Identity provider — realms, clients, roles, users, JWT issuance |
| **Postgres** (Neon) | Managed relational database |

For a full breakdown of every dependency, Spring bean, annotation, Docker pattern, and Keycloak concept used in this project, see [`IMS_Technical_Documentation.md`](./IMS_Technical_Documentation.md).

---

## 🧰 Tech Stack

**Backend**
- Java 21, Spring Boot 4.1
- Spring Data JPA + Hibernate, PostgreSQL
- Spring Security (OAuth2 Resource Server)
- Spring AI — MCP Server & MCP Client starters, Google GenAI (Gemini) integration
- Lombok

**Frontend**
- React + TypeScript + Vite
- TanStack Query (client-side caching)
- `keycloak-js` (Authorization Code + PKCE login)
- Web Speech API (voice input for chat)
- Axios

**Infrastructure**
- Docker (multi-stage builds for all Spring Boot services)
- Neon (managed Postgres)
- Cloud-IAM (managed Keycloak)
- Render (REST API, MCP Server, MCP Client hosting)
- Vercel (frontend hosting)

---

## 📂 Repository Structure (Monorepo)

```
MCP_IMS/
├── restClient/          # REST API — domain model, business logic, RBAC
├── mcpServer/            # MCP Server — 25 tools wrapping the REST API
├── mcpClient/             # MCP Client — chat endpoint, Gemini integration
├── ims-frontend/           # React console + chat UI
└── IMS_Technical_Documentation.md
```

Each backend module deploys as an independent Render service using the **Root Directory** setting to target its subfolder within this single repo.

---

## 🚀 Getting Started Locally

### Prerequisites
- Java 21
- Node.js 18+
- Docker & Docker Compose
- A Google GenAI (Gemini) API key
- A Keycloak instance (local via Docker Compose, or a free Cloud-IAM instance)

### 1. Start supporting infrastructure

Each Spring Boot module's `compose.yaml` will auto-start Postgres and/or Keycloak via `spring-boot-docker-compose` when you run it — see the `restClient` module's `compose.yaml` for the local dev stack.

### 2. Configure environment variables

Each service reads configuration via environment variables with local-friendly defaults baked into `application.yml` (see the technical documentation for the full list). At minimum you'll need:

**REST API**
```
DB_URL, DB_USERNAME, DB_PASSWORD
KEYCLOAK_ISSUER_URI
FRONTEND_ORIGIN
```

**MCP Server**
```
INVENTORY_API_BASE_URL
KEYCLOAK_TOKEN_URL, KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET
```

**MCP Client**
```
GEMINI_API_KEY
MCP_SERVER_URL
FRONTEND_ORIGIN
```

**Frontend** (`.env.development`)
```
VITE_KEYCLOAK_URL, VITE_KEYCLOAK_REALM, VITE_KEYCLOAK_CLIENT_ID
VITE_REST_API_URL
VITE_MCP_CLIENT_URL
```

### 3. Run each service

```bash
# REST API
cd restClient && ./mvnw spring-boot:run

# MCP Server
cd mcpServer && ./mvnw spring-boot:run

# MCP Client
cd mcpClient && ./mvnw spring-boot:run

# Frontend
cd ims-frontend && npm install && npm run dev
```

Start them in this order — MCP Client's startup connects eagerly to MCP Server, which in turn calls the REST API, which needs Postgres and Keycloak already running.

### 4. Keycloak setup

Create a realm with:
- A **confidential** client (service account, Client Credentials grant) for MCP Server → REST API calls
- A **public** client (Standard Flow + PKCE) for the frontend's user login
- Realm roles: `ADMIN`, `MANAGER`, `STAFF`
- A few test users assigned to each role

---

## 🔐 Roles & Permissions

| Role | Read | Create/Update | Delete |
|---|---|---|---|
| `ADMIN` | ✅ | ✅ | ✅ |
| `MANAGER` | ✅ | ✅ | ❌ |
| `STAFF` | ✅ | ❌ | ❌ |

Enforced server-side on the REST API by HTTP method; the Console UI also hides unavailable actions per role as a UX convenience (not a security boundary — the real enforcement is on the backend).

> **Known limitation:** the AI Chat path currently always executes with the MCP Server's own service-account (`ADMIN`) credentials, regardless of which user is chatting — per-user role enforcement through the MCP chain is a documented open item (see Roadmap).

---

## 🗺️ Roadmap

- [ ] **AI Insights dashboard** — a new Console tab where Gemini synthesizes current inventory data (low stock, dormant categories, supplier concentration) into a prioritized narrative summary
- [ ] **RBAC in Chat** — forward the logged-in user's real token through the MCP tool-calling chain so chat-driven actions respect the same per-user roles as the Console
- [ ] **`StockMovement` & `AppUser` entities** — audit trail for stock changes, enabling genuinely predictive/trend-based insights down the line
- [ ] **Graceful tool error handling** — catch REST API 4xx responses inside MCP tool methods and return readable text instead of letting them crash the chat round trip
- [ ] **Groq Whisper voice upgrade** — replace the browser's built-in (less accurate) speech recognition with a Whisper-based transcription endpoint
- [ ] **CI/CD via GitHub Actions** — automate build/deploy on push instead of manual redeploys

---

## 📖 Further Reading

See [`IMS_Technical_Documentation.md`](./IMS_Technical_Documentation.md) for an in-depth reference covering:
- Every dependency used per service, and why
- Every custom Spring bean, with definitions and usage examples
- JPA, Bean Validation, Spring MVC, MCP, and Security annotations — defined, exemplified, and explained
- Docker concepts (multi-stage builds, build-time vs. runtime config) as encountered while deploying this project
- Keycloak concepts (realms, client types, grant types, PKCE, role mapping)

---

## 📝 License

This project was built as a learning exercise exploring Spring AI, MCP, and full-stack deployment. No license specified — add one here if you intend to distribute or open-source it.
