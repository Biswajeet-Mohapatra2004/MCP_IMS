# Inventory Management System — Technical Documentation

A reference guide covering architecture, dependencies, Spring beans, annotations, Docker, and Keycloak concepts used across the project.

---

## 1. Architecture Overview

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

        Auth: Keycloak (Cloud-IAM, managed) — issues JWTs,
        validated by REST API (Resource Server) and used by
        the frontend (Authorization Code + PKCE) and MCP
        Server (Client Credentials, service account).
```

### Services

| Service | Role | Framework |
|---|---|---|
| **REST API** (`restClient`) | Owns the domain model (Product, Category, Warehouse, StockItem, Supplier), enforces RBAC, talks to Postgres | Spring Boot + Spring Data JPA + Spring Security (Resource Server) |
| **MCP Server** (`mcpServer`) | Exposes 25 `@Tool` methods wrapping the REST API as MCP tools for an LLM to call | Spring Boot + Spring AI MCP Server |
| **MCP Client** (`mcpClient`) | Hosts the chat endpoint; Gemini decides which MCP tools to call to fulfill a request | Spring Boot + Spring AI MCP Client + Google GenAI |
| **Frontend** (`ims-frontend`) | SAP-style admin console (direct REST calls) + embedded AI chat console (via MCP Client) | React + Vite + TypeScript + TanStack Query |
| **Keycloak** (Cloud-IAM) | Identity provider — realms, clients, roles, users, JWT issuance | Managed Keycloak |
| **Postgres** (Neon) | Managed relational database | Neon serverless Postgres |

---

## 2. Backend Dependencies

### 2.1 REST API (`restClient`)

| Dependency | Purpose |
|---|---|
| `spring-boot-starter-web` | Embedded Tomcat, Spring MVC, REST controllers |
| `spring-boot-starter-data-jpa` | Hibernate ORM, repositories, entity management |
| `postgresql` | JDBC driver for Postgres |
| `spring-boot-starter-oauth2-resource-server` | Validates incoming JWTs on protected endpoints |
| `spring-boot-starter-validation` | Enables `@Valid`/Bean Validation annotations on DTOs |
| `spring-boot-starter-security` | Pulled in transitively by resource-server; provides the security filter chain infrastructure |
| `lombok` | Boilerplate reduction (getters/setters/constructors/builders) via annotation processing |
| `spring-boot-devtools` | Local dev only — auto-restart on code changes |
| `spring-boot-docker-compose` | Auto-starts/stops `compose.yaml` containers (Postgres, Keycloak) during local `mvn spring-boot:run` |

**Why Resource Server, not Client or Authorization Server:** the REST API's job is to *validate* incoming tokens on every request — it never logs a human in (that's the frontend's job via Authorization Code flow) and never issues its own tokens (that's Keycloak's job). Resource Server is the correct, minimal role.

### 2.2 MCP Server (`mcpServer`)

| Dependency | Purpose |
|---|---|
| `spring-ai-starter-mcp-server-webmvc` | Exposes `@Tool`-annotated methods over the MCP protocol (streamable-http transport) |
| `spring-boot-starter-web` | HTTP server + `RestClient` support for calling the REST API |
| `lombok` | Boilerplate reduction |

The MCP server does **not** need `spring-data-jpa`, a database driver, or Spring Security — it has no direct database access (everything routes through the REST API) and doesn't protect its own endpoints from public traffic (kept off the public internet entirely in the deployed architecture; only the MCP Client talks to it).

### 2.3 MCP Client (`mcpClient`)

| Dependency | Purpose |
|---|---|
| `spring-ai-starter-mcp-client` | Connects to one or more MCP servers, exposes their tools as `ToolCallback`s |
| `spring-ai-starter-model-google-genai` | Gemini chat model integration |
| `spring-boot-starter-web` | Hosts the `/api/v1/ai/chat` REST endpoint the frontend calls |
| `lombok` | Boilerplate reduction |

**Key distinction — MCP Client vs MCP Server:** the *server* exposes tools; the *client* discovers and calls them, then feeds results to an LLM. A single Spring AI project is rarely both at once — they're separate applications by design here.

### 2.4 Why NOT `oauth2-client` on any backend service

`spring-boot-starter-oauth2-client` is for **browser-based, human-driven "Login with X"** flows (Authorization Code). None of the three backend services do this:
- REST API validates tokens (Resource Server)
- MCP Server *requests* its own tokens via Client Credentials grant (no browser involved) — a plain `RestClient` interceptor is sufficient, no need for the full OAuth2 Client machinery
- MCP Client forwards a token it received from the frontend; it doesn't originate a login itself

---

## 3. Spring Beans Reference

A **bean** is any object whose lifecycle (creation, wiring, destruction) is managed by the Spring container rather than by your own code calling `new`. Beans are typically declared either by annotating a class (`@Component`, `@Service`, `@Configuration`) or by annotating a method that returns the object (`@Bean` inside a `@Configuration` class).

### 3.1 `SecurityFilterChain` (REST API)

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(HttpMethod.DELETE, "/api/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.POST, "/api/**").hasAnyRole("ADMIN", "MANAGER")
            .anyRequest().permitAll()
        )
        .oauth2ResourceServer(oauth2 -> oauth2
            .jwt(jwt -> jwt.jwtAuthenticationConverter(new KeycloakRoleConverter()))
        );
    return http.build();
}
```
- **Definition:** the central Spring Security bean that defines which requests require authentication/authorization and how.
- **When to use:** exactly once per security-enabled application, to declare the full set of access rules and which auth mechanism (JWT resource server, form login, etc.) applies.

### 3.2 `KeycloakRoleConverter` (custom `Converter<Jwt, AbstractAuthenticationToken>`)

```java
public class KeycloakRoleConverter implements Converter<Jwt, AbstractAuthenticationToken> {
    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = extractRealmRoles(jwt);
        return new JwtAuthenticationToken(jwt, authorities);
    }
    // extracts jwt.getClaim("realm_access").roles, prefixes each with "ROLE_"
}
```
- **Definition:** translates Keycloak's `realm_access.roles` JWT claim into Spring Security `GrantedAuthority` objects.
- **Why needed:** Spring Security's `hasRole("ADMIN")` internally checks for an authority literally named `ROLE_ADMIN`. Keycloak's roles aren't in that shape or location by default — without this converter, `hasRole()`/`hasAnyRole()` checks silently always fail even with valid tokens.
- **When to use:** any time you're integrating Keycloak (or another IdP with a non-standard roles claim) with Spring Security's role-based checks.

### 3.3 `CorsConfigurationSource`

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of(allowedOrigin));
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```
- **Definition:** declares which browser origins may call this API cross-origin, and with what methods/headers.
- **When to use:** whenever a browser-based frontend on a different origin (different domain/port) needs to call this API directly.

### 3.4 `RestClient` beans (MCP Server's `RestClientConfig`)

```java
@Bean
public RestClient tokenRestClient() {
    return RestClient.create();
}

@Bean
public RestClient inventoryRestClient(RestClient tokenRestClient) {
    return RestClient.builder()
            .baseUrl(baseUrl)
            .requestInterceptor((request, body, execution) -> {
                String token = fetchServiceAccountToken(tokenRestClient);
                request.getHeaders().setBearerAuth(token);
                return execution.execute(request, body);
            })
            .build();
}
```
- **Definition:** `RestClient` is Spring's modern synchronous HTTP client (successor to `RestTemplate`). `tokenRestClient` is a plain client used to fetch tokens from Keycloak; `inventoryRestClient` is pre-configured with a `baseUrl` and a **request interceptor** that transparently attaches a bearer token to every outgoing call.
- **When to use:** any time a service needs to call another HTTP API. The interceptor pattern is the idiomatic way to inject cross-cutting concerns (auth, logging, retries) without repeating logic in every call site.

### 3.5 `ToolCallbackProvider` (MCP Server)

```java
@Bean
ToolCallbackProvider toolCallbackProvider(CategoryTools categoryTools, ProductTools productTools,
                                          StockTools stockTools, SupplierTools supplierTools,
                                          WarehouseTools warehouseTools) {
    return MethodToolCallbackProvider.builder()
            .toolObjects(categoryTools, productTools, stockTools, supplierTools, warehouseTools)
            .build();
}
```
- **Definition:** tells the MCP server auto-configuration which beans contain `@Tool`-annotated methods to expose over the MCP protocol.
- **When to use:** required on the MCP **server** side — unlike client-side tool discovery (which is automatic once connected to a server), the server must be explicitly told which of its own beans hold callable tools.

### 3.6 `ChatClient` (MCP Client, built inside the controller)

```java
public InventoryChatController(ChatClient.Builder chatClientBuilder, ToolCallbackProvider tools) {
    this.chatClient = chatClientBuilder
            .defaultAdvisors(new SimpleLoggerAdvisor())
            .defaultTools(tools)
            .build();
}
```
- **Definition:** `ChatClient` is Spring AI's fluent API for talking to a chat model. `ChatClient.Builder` is itself an auto-configured bean; calling `.build()` produces the actual client instance used per request.
- **`defaultTools(tools)`:** registers the MCP-discovered tools so the LLM can call them — this is the piece that makes function/tool calling work; without it the model has no awareness any tools exist, even if the MCP connection itself succeeded.
- **`defaultAdvisors(new SimpleLoggerAdvisor())`:** attaches request/response logging around every call — useful for debugging tool-calling round trips.
- **When to use:** build once per distinct "personality"/tool-set combination your app needs; here, once, since there's only one assistant configuration.

### 3.7 `McpSyncHttpClientRequestCustomizer` (attempted token-forwarding hook)

```java
@Bean
public McpSyncHttpClientRequestCustomizer requestCustomizer() {
    return (builder, method, endpoint, body, context) -> {
        String forwardedToken = RequestTokenContext.get();
        if (forwardedToken != null) {
            builder.header("X-Forwarded-User-Token", forwardedToken);
        }
    };
}
```
- **Definition:** a hook Spring AI's MCP client offers for customizing outgoing HTTP requests to the MCP server (e.g. adding headers).
- **Known limitation encountered in this project:** in the version used, this hook did not reliably fire for actual *tool-call* requests (only some lifecycle calls), which is why per-user token forwarding through MCP tool calls remains an open item — see Section 8 (Keycloak concepts) for the deeper explanation of why this matters.

### 3.8 `RestClient` beans (frontend-adjacent — `axios` instances, not Spring beans, but same pattern)

Not a Spring bean (frontend is React), but conceptually identical: `restApiClient` and `mcpChatClient` are pre-configured `axios` instances with an interceptor that attaches the logged-in user's Keycloak token to every outgoing request — the browser-side mirror of the `RestClient` interceptor pattern above.

---

## 4. MCP Server Annotations Reference

These annotations are specific to the MCP Server module and are what actually turn plain Java methods into tools an LLM can discover and invoke over the Model Context Protocol.

| Annotation | Definition | Example | When to use |
|---|---|---|---|
| `@Tool(description = "...")` | Marks a method as an MCP tool. The `description` is sent to the LLM as part of the tool's schema and is what the model uses to decide *whether* and *when* to call it | `@Tool(description = "Creates a new product with SKU, name, price, and optional category") public Object createProduct(...)` | On every method you want exposed as a callable tool. The description quality directly affects whether the LLM picks the right tool — vague or overlapping descriptions across tools cause misfires (e.g. confusing `updateStock` with `updateProduct`) |
| `@ToolParam(description = "...", required = false)` | Documents an individual tool parameter — its purpose and whether it's optional | `@ToolParam(description = "The ID of the product to retrieve") Long productId` | On every parameter of a `@Tool` method. `required = false` matters for partial-update tools (e.g. `updateProduct`), where omitted parameters should leave existing values untouched rather than being forced as mandatory |
| `@Component` (on tool classes) | Standard Spring stereotype marking a class as a container-managed bean | `@Component public class ProductTools { ... }` | On every class holding `@Tool` methods — required so Spring can instantiate it and so it can be collected into the `ToolCallbackProvider` bean (see Section 3.5) |
| `@Configuration` (on `ToolRegister`) | Marks the class that assembles the `ToolCallbackProvider` bean from all tool-holder beans | `@Configuration public class ToolRegister { @Bean ToolCallbackProvider toolCallbackProvider(...) { ... } }` | Once per MCP server application — this is the explicit registration step MCP servers require (unlike MCP clients, where tool discovery from a connected server is automatic) |

**Design pattern used throughout this project's tool methods:**
```java
@Tool(description = "Deletes a category by its ID. Fails if any products are still assigned to this category.")
public Object deleteCategory(
        @ToolParam(description = "The ID of the category to delete") Long categoryId
) {
    try {
        apiClient.deleteCategory(categoryId);
        return "Category with ID " + categoryId + " has been deleted successfully.";
    } catch (ApiCallException e) {
        return e.getMessage();
    }
}
```
Note the return type is `Object`, not a fixed type — a tool method may return either the successful result (a `Map`, a `List`, a `String` confirmation) or a plain-text error string, and both must be valid JSON-serializable content the LLM can read back. Letting an exception escape uncaught (rather than being caught and returned as text) breaks the round trip back to the model — see the Appendix for the full explanation of why this matters.

**Why MCP Server has almost none of the annotations from Sections 5–7:**
- **No JPA annotations** — the MCP Server has no direct database access and no `@Entity` classes; all persistence happens behind the REST API it calls.
- **No Bean Validation annotations** (`@NotBlank`, `@Valid`, etc.) — tool parameter validation is expressed through `@ToolParam`'s `required` flag and natural-language `description`, not Bean Validation constraints. Malformed input still gets caught downstream by the REST API's own `@Valid` DTOs, and any resulting error is surfaced back through the tool's `try/catch` (see the pattern above).
- **No `@RestController`/`@GetMapping`/etc.** — the MCP Server does not expose conventional REST endpoints of its own (aside from the framework-provided `/mcp` protocol endpoint, which you don't hand-write); all "API surface" is declared via `@Tool` methods instead.
- **No Spring Security annotations** — in this project's deployed architecture, the MCP Server is deliberately kept off the public internet (only the MCP Client calls it), so it doesn't need its own resource-server configuration. It participates in auth only as an **outbound client** — see Section 7 below.

---

## 5. JPA Annotations Reference

| Annotation | Definition | Example | When to use |
|---|---|---|---|
| `@Entity` | Marks a class as a JPA-managed persistent entity, mapped to a database table | `@Entity public class Product { ... }` | On every domain class you want Hibernate to persist |
| `@Table(name = "...")` | Explicitly names the backing table (otherwise defaults to the class name) | `@Table(name = "products")` | When you want a table name different from the class name, or to be explicit |
| `@Id` | Marks the primary key field | `@Id private Long id;` | Exactly once per entity |
| `@GeneratedValue(strategy = GenerationType.IDENTITY)` | Delegates primary key generation to the database (auto-increment) | `@GeneratedValue(strategy = GenerationType.IDENTITY)` | When the DB handles PK generation (typical for Postgres `SERIAL`/`IDENTITY` columns) |
| `@Column(nullable = false, unique = true)` | Customizes column constraints | `@Column(nullable = false, unique = true) private String sku;` | Whenever a field needs DB-level constraints beyond the default (nullable, length, uniqueness) |
| `@ManyToOne(fetch = FetchType.LAZY)` | Declares a many-to-one relationship; `LAZY` defers loading the related entity until accessed | `@ManyToOne(fetch = FetchType.LAZY) private Category category;` | The "many" side of a relationship (e.g. many Products, one Category) |
| `@OneToMany(mappedBy = "...", cascade = CascadeType.ALL)` | Declares the inverse (one) side of a relationship | `@OneToMany(mappedBy = "category") private List<Product> products;` | The "one" side; `mappedBy` points to the field on the owning entity that holds the FK |
| `@ManyToMany` + `@JoinTable` | Declares a many-to-many relationship backed by a join table | `@ManyToMany @JoinTable(name = "product_suppliers", ...)` | When two entities can each relate to many of the other (Product ↔ Supplier) |
| `@JoinColumn(name = "...")` | Names the foreign key column for a `@ManyToOne`/`@OneToOne` | `@JoinColumn(name = "category_id")` | Whenever you want to control the FK column name explicitly |
| `@PrePersist` / `@PreUpdate` | Lifecycle callbacks fired automatically before insert/update | `@PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }` | For auto-managed timestamp fields (`createdAt`, `updatedAt`) without repeating logic in every service method |
| `@UniqueConstraint` (inside `@Table`) | Declares a composite (multi-column) uniqueness constraint | `@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "warehouse_id"}))` | When uniqueness spans more than one column (e.g. one StockItem per product+warehouse pair) |
| `@Transactional` | Wraps a method in a database transaction | `@Transactional public ProductResponse create(...)` | On service methods that read/write the database — ensures atomicity and is required for lazy-loading to work outside the initial fetch |
| `@Transactional(readOnly = true)` | Optimization hint for read-only operations | `@Transactional(readOnly = true) public List<...> getAll()` | On query-only methods — allows Hibernate/the DB driver to skip dirty-checking overhead |

**Lazy loading + transactions, a common gotcha:** a `@ManyToOne(fetch = FetchType.LAZY)` field is not actually loaded from the DB until you call its getter — and that call must happen while the entity is still attached to an active Hibernate session, which in practice means inside a `@Transactional` method. This project disables `open-in-view` (`spring.jpa.open-in-view: false`), so lazy fields **must** be accessed inside the service layer (where `@Transactional` applies), never later in a mapper called outside that boundary — this was a deliberate design constraint followed throughout (e.g. `ProductMapper.toResponse()` is only ever invoked from within transactional service methods).

---

## 6. Bean Validation Annotations

| Annotation | Definition | Example | When to use |
|---|---|---|---|
| `@NotBlank` | String must be non-null and contain at least one non-whitespace character | `@NotBlank(message = "Name is required") String name;` | Required text fields (names, SKUs) |
| `@NotNull` | Value must not be null (any type) | `@NotNull(message = "Unit price is required") BigDecimal unitPrice;` | Required non-string fields |
| `@Email` | Must match a valid email format | `@Email(message = "Must be a valid email") String contactEmail;` | Email fields |
| `@Min` / `@Max` | Numeric lower/upper bound (inclusive) | `@Min(value = 0) Integer reorderThreshold;` | Quantities, thresholds that must stay within a range |
| `@DecimalMin(value = "0.0", inclusive = false)` | Decimal lower bound, with control over inclusivity | `@DecimalMin(value = "0.0", inclusive = false) BigDecimal unitPrice;` | Prices/amounts that must be strictly positive |
| `@Valid` | Triggers cascading validation on a nested object or method parameter | `create(@Valid @RequestBody ProductCreateRequest request)` | On controller method parameters, to actually activate the field-level constraints above |

**How it connects end-to-end:** `@Valid` on a controller parameter tells Spring to run Bean Validation against that object; any constraint violations (`@NotBlank`, `@Min`, etc.) are collected into a `MethodArgumentNotValidException`, which this project's `GlobalExceptionHandler` catches and turns into a structured `400 Bad Request` response with per-field error messages.

---

## 7. Spring MVC Annotations

| Annotation | Definition | Example | When to use |
|---|---|---|---|
| `@RestController` | Combines `@Controller` + `@ResponseBody` — every method's return value is serialized directly into the HTTP response body (typically JSON) | `@RestController public class ProductController { ... }` | Any class exposing REST endpoints |
| `@RequestMapping("/api/products")` | Declares a base path for all endpoints in the class | `@RequestMapping("/api/products")` | Class-level, to avoid repeating the prefix on every method |
| `@GetMapping` / `@PostMapping` / `@PutMapping` / `@PatchMapping` / `@DeleteMapping` | Shorthand for `@RequestMapping(method = ...)` per HTTP verb | `@GetMapping("/{id}")` | One per endpoint, matching the correct HTTP semantics (GET = read, POST = create, PUT = full update, PATCH = partial/relative update, DELETE = remove) |
| `@PathVariable` | Binds a URI template variable to a method parameter | `getById(@PathVariable Long id)` | Extracting IDs or other path segments |
| `@RequestParam` | Binds a query string parameter | `chat(@RequestParam(name = "query") String query)` | Optional or simple scalar inputs passed via `?key=value` |
| `@RequestBody` | Deserializes the HTTP request body (typically JSON) into a Java object | `create(@RequestBody ProductCreateRequest request)` | Whenever the client sends a structured payload (POST/PUT/PATCH bodies) |
| `@RequestHeader` | Binds an HTTP header value to a method parameter | Used indirectly via `HttpServletRequest.getHeader("Authorization")` in this project | Reading custom or standard headers (auth tokens, content negotiation) |
| `@RestControllerAdvice` | Combines `@ControllerAdvice` + `@ResponseBody` — a global, cross-cutting exception handler for all controllers | `@RestControllerAdvice public class GlobalExceptionHandler { ... }` | Centralizing error-response formatting instead of try/catch in every controller method |
| `@ExceptionHandler(SomeException.class)` | Declares which exception type a method (inside a `@RestControllerAdvice`) handles | `@ExceptionHandler(ResourceNotFoundException.class)` | One per distinct exception type needing a specific HTTP status/response shape |

---

## 8. Auth-Related Annotations & Configuration

| Annotation / concept | Definition | When to use |
|---|---|---|
| `@EnableWebSecurity` | Activates Spring Security's web security support and allows customizing it via a `SecurityFilterChain` bean | Once, on a `@Configuration` class, in any app that needs custom security rules |
| `@Configuration` | Marks a class as a source of bean definitions (methods annotated `@Bean` inside it are registered) | Any class whose sole purpose is wiring up beans (security config, CORS config, REST client config) |
| `hasRole("ADMIN")` / `hasAnyRole("ADMIN", "MANAGER")` | Fluent authorization expressions used inside `authorizeHttpRequests` | Restricting specific endpoints/methods to specific roles |
| `.oauth2ResourceServer(oauth2 -> oauth2.jwt(...))` | Configures the app to validate incoming Bearer JWTs against the configured issuer | The core line that turns a Spring Boot app into an OAuth2 Resource Server |
| `spring.security.oauth2.resourceserver.jwt.issuer-uri` | The property pointing at the identity provider's realm; Spring auto-discovers the JWKS endpoint from `{issuer-uri}/.well-known/openid-configuration` | Set once per environment (local Keycloak vs Cloud-IAM's hosted realm) |

**Not used in this project, but worth knowing the distinction:**
- `@PreAuthorize("hasRole('ADMIN')")` — method-level security (requires `@EnableMethodSecurity`), an alternative/complement to URL-pattern-based rules in the `SecurityFilterChain`. This project used URL-pattern rules (by HTTP method) instead, for simplicity across 5 entities.

---

## 9. Docker Concepts & Commands Used (All Services)

### 9.1 Multi-stage builds

```dockerfile
# ---- Build stage ----
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
```
- **Definition:** a Dockerfile with multiple `FROM` statements, where later stages can selectively copy artifacts from earlier ones (`COPY --from=build ...`).
- **Why:** the `build` stage needs the full JDK + Maven wrapper to compile, but none of that is needed at runtime. The final image only contains the JRE (smaller footprint) and the compiled JAR — reduces image size and attack surface, and speeds up deploys/cold-starts on resource-constrained hosting.

### 9.2 `ENTRYPOINT` vs relying on shell expansion for dynamic ports

```dockerfile
ENTRYPOINT ["sh", "-c", "/opt/keycloak/bin/kc.sh start --optimized --http-port=${PORT:-8080}"]
```
- **Definition:** Docker's *exec form* (`["java", "-jar", "app.jar"]`) runs the command directly, without a shell — meaning environment variable expansion (`$PORT`) does **not** happen automatically.
- **When to wrap in `sh -c`:** whenever the entrypoint command needs to reference an environment variable that's only known at container **runtime** (like Render's dynamically assigned `$PORT`), you need the shell form so `${VAR}` actually gets substituted before the command runs.

### 9.3 Build-time vs runtime configuration (Keycloak-specific lesson)

Some Keycloak options (`KC_DB`, `KC_HEALTH_ENABLED`, `KC_CACHE`) must be baked in via `kc.sh build` **during the Docker build**, not supplied only as runtime environment variables — supplying them only at runtime after an optimized build causes Keycloak to warn/fail because the compiled configuration no longer matches:
```dockerfile
FROM quay.io/keycloak/keycloak:26.0 AS builder
ENV KC_DB=postgres
ENV KC_HEALTH_ENABLED=true
ENV KC_CACHE=local
RUN /opt/keycloak/bin/kc.sh build
```
- **General lesson:** not every piece of "configuration" in a containerized app is interchangeable between build-time and run-time — some frameworks compile certain settings into an optimized artifact, and mismatching where you set a value causes confusing startup failures.

### 9.4 `.dockerignore`

```
target/
.git/
.idea/
*.iml
.mvn/wrapper/maven-wrapper.jar
```
- **Definition:** excludes files/folders from the Docker build context, same syntax as `.gitignore`.
- **Why:** avoids sending unnecessary (and sometimes large or stale) files into the image build, keeping builds faster and images cleaner.

### 9.5 MCP Server's Dockerfile — same pattern, no database layer

```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
```
Structurally identical to the REST API's Dockerfile (Section 9.1) and MCP Client's — same multi-stage build, same JRE-only runtime image. The only differences across the three plain Spring Boot services are the exposed port and the environment variables injected at runtime (Section 9.6). Unlike Keycloak's Dockerfile, none of these three needs the build-time-vs-runtime distinction from Section 9.3 — ordinary Spring Boot `application.yml` properties are all resolved at runtime via `${VAR:default}` placeholders, with no separate "compile the config in" step.

### 9.6 Environment-variable pattern used across REST API, MCP Server, and MCP Client

All three plain Spring Boot services follow the same externalization pattern in `application.yml`, so the identical Dockerfile/image works unchanged in both local dev and deployed environments:
```yaml
server:
  port: ${PORT:8082}          # Render assigns $PORT dynamically; falls back to a fixed port locally

inventory:
  api:
    base-url: ${INVENTORY_API_BASE_URL:http://localhost:8081}   # MCP Server → REST API

keycloak:
  token-url: ${KEYCLOAK_TOKEN_URL:http://localhost:8180/realms/ims-realm/protocol/openid-connect/token}
  client-id: ${KEYCLOAK_CLIENT_ID:ims-client}
  client-secret: ${KEYCLOAK_CLIENT_SECRET}                       # no local default — must always be supplied
```
**Pattern:** every property that differs between local dev and deployment gets a `${ENV_VAR:localDefault}` placeholder. Secrets (client secrets, API keys) deliberately have **no default value** — Spring fails fast at startup if they're missing, rather than silently running with a blank/insecure value.

### 9.7 Key Docker commands used throughout this project

| Command | Purpose |
|---|---|
| `docker build -t <name> .` | Builds an image from a Dockerfile in the current directory |
| `docker run -p 8081:8081 -e KEY=value ... <image>` | Runs a container, mapping a host port to a container port and injecting environment variables |
| `docker ps` / `docker ps -a` | Lists running (or all) containers |
| `docker exec -it <container_id> env` | Inspects environment variables actually visible inside a **running** container — critical for diagnosing "my env var change didn't take effect" issues |
| `docker stop <id>` / `docker rm <id>` | Stops and removes a container — **required** before environment variable changes take effect, since env vars are baked in at container *creation*, not just "restart" |
| `docker compose up` / `spring-boot-docker-compose` | Starts a defined stack of containers (Postgres, Keycloak) together, either manually or auto-triggered by Spring Boot on `mvn spring-boot:run` |

**Lesson learned and documented during this project:** editing environment variables via an IDE's container UI and clicking "Restart" does **not** apply the new values — Docker containers are immutable once created; you must fully stop and recreate (or `docker run` fresh) for new environment variables to take effect.

---

## 10. Keycloak Concepts

### 10.1 Realms

A **realm** is an isolated space of users, roles, and clients — think of it as a tenant. This project uses a single realm (`ims-auth` / `ims-realm` locally) containing all users, roles, and both clients.

### 10.2 Clients — Confidential vs Public

| Client type | Used for | Key setting |
|---|---|---|
| **Confidential** (`ims-client`) | Machine-to-machine calls (MCP Server → REST API) | Client authentication **On** (has a secret), Service Accounts enabled, no redirect URIs needed |
| **Public** (`ims-frontend`) | Browser-based human login | Client authentication **Off** (SPAs can't safely store secrets), Standard Flow enabled, PKCE required |

### 10.3 Grant types used

- **Client Credentials Grant** (`ims-client`): a pure machine-to-machine exchange — no user, no browser. The client authenticates with its own ID + secret and receives a token representing *itself* (via a "service account"), not any particular human.
  ```
  POST /realms/{realm}/protocol/openid-connect/token
  grant_type=client_credentials&client_id=...&client_secret=...
  ```
- **Authorization Code Flow + PKCE** (`ims-frontend`): the standard browser login flow — redirect to Keycloak's login page, user authenticates, Keycloak redirects back with a short-lived code, which is exchanged for tokens. **PKCE** (Proof Key for Code Exchange) adds a cryptographic verifier/challenge pair generated client-side, closing a vulnerability that exists for public clients that can't hold a secret to prove their identity during the code exchange.

### 10.4 Roles and the `realm_access` claim

Roles (`ADMIN`, `MANAGER`, `STAFF`) are assigned to users (or to a client's service account) and appear inside every issued JWT under:
```json
"realm_access": { "roles": ["ADMIN", "offline_access", ...] }
```
Spring Security doesn't read this claim natively — hence the custom `KeycloakRoleConverter` (Section 3.2) that extracts these roles and prefixes them with `ROLE_` so `hasRole()`/`hasAnyRole()` work correctly.

### 10.5 Issuer URL and OIDC discovery

Every realm exposes a discovery document at:
```
{issuer-uri}/.well-known/openid-configuration
```
containing the token endpoint, JWKS (public key) URI, supported grant types, and more. Spring Boot's Resource Server auto-configuration fetches this automatically the first time it needs to validate a token — you only need to supply the base `issuer-uri`, not each individual endpoint.

### 10.6 MCP Server's specific relationship to Keycloak

The MCP Server never validates tokens itself and has no Spring Security configuration at all — its only interaction with Keycloak is as a **caller**:
```java
private String fetchServiceAccountToken(RestClient tokenRestClient) {
    MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
    form.add("client_id", clientId);
    form.add("client_secret", clientSecret);
    form.add("grant_type", "client_credentials");

    Map<String, Object> response = tokenRestClient.post()
            .uri(tokenUrl)
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(form)
            .retrieve()
            .body(Map.class);

    return (String) response.get("access_token");
}
```
Every time the MCP Server needs to call the REST API (i.e., every tool invocation), it performs this Client Credentials exchange fresh, then attaches the resulting token as a Bearer header via the `inventoryRestClient`'s request interceptor (Section 3.4). This is a deliberately simple, stateless design — no token caching — traded off against efficiency for correctness and simplicity; caching with expiry-aware refresh was noted as a reasonable future optimization but not implemented.

### 10.7 Why the MCP Server always acts as one identity (and the resulting limitation)

Because MCP Server authenticates to the REST API using `ims-client`'s **service account** (Client Credentials), every action taken through the AI chat interface executes with that one fixed identity's role (`ADMIN`) — regardless of which human is actually chatting. This is different from the Console, where the browser's real Authorization-Code-issued token (carrying the actual logged-in user's role) is used directly. Making the Chat path respect per-user roles would require forwarding the real user's token through the MCP protocol call itself and having the MCP Server use *that* token instead of its own — attempted in this project via a custom HTTP request customizer, but not completed due to a framework limitation where that hook didn't reliably fire for MCP tool-call requests specifically (only for certain lifecycle calls). This remains a documented, open item.

### 10.8 Managed vs self-hosted Keycloak

This project self-hosted Keycloak on Render initially, which failed because Keycloak's real-world memory footprint (Quarkus + Infinispan cache + Hibernate) exceeded Render's free-tier 512MB limit, causing repeated OOM kills. The project ultimately switched to **Cloud-IAM**, a managed Keycloak hosting provider with a genuine free tier (1 realm, 100 users) — removing the self-hosting memory problem entirely while keeping full Keycloak API compatibility.

---

## 11. Deployment Platform Summary

| Platform | Hosts | Why chosen |
|---|---|---|
| **Neon** | Postgres | Genuine free tier, no card, no expiry ambiguity (unlike some alternatives) |
| **Render** | REST API, MCP Server, MCP Client | Free tier, no card, Docker-native deploys, monorepo support via per-service Root Directory |
| **Cloud-IAM** | Keycloak (`ims-auth` realm) | Managed Keycloak with a real free tier, sidesteps the JVM memory ceiling of self-hosting Keycloak on a 512MB free container |
| **Vercel** | React frontend | Free tier, zero-config Vite detection, automatic HTTPS |

**Cross-cutting lesson:** every service in this stack that's on a free tier sleeps after inactivity, so the first request after idle time can be slow (30–90s), and a chain of sleeping services (Frontend → MCP Client → MCP Server → REST API) can compound into a multi-minute wait on a fully cold start. This is an accepted, documented tradeoff of the free-tier deployment choice, not a bug.

---

## Appendix: Known Open Items

- **RBAC in Chat**: MCP-driven actions currently always run with the `ims-client` service account's `ADMIN` role; a `STAFF` user's real restrictions aren't enforced through the AI chat path yet.
- **Tool error handling**: `@Tool` methods that let REST API 4xx errors escape as exceptions cause a malformed-JSON crash when Spring AI tries to feed the error back to Gemini; the fix (catch and return plain-text error messages) was scoped but not yet applied across all 25 tools.
- **Voice input**: browser Web Speech API works but has lower accuracy than dedicated ASR; a Groq Whisper-based upgrade was designed (record audio → backend proxy → Groq transcription API) but not deployed.
- **CI/CD**: deployments are currently manual (`git push` → platform auto-build); GitHub Actions automation was discussed as a future step.
