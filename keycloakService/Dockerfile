FROM quay.io/keycloak/keycloak:26.0 AS builder

ENV KC_DB=postgres
ENV KC_HEALTH_ENABLED=true
ENV KC_CACHE=local
WORKDIR /opt/keycloak
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:26.0
COPY --from=builder /opt/keycloak/ /opt/keycloak/

# Render provides $PORT dynamically — Keycloak needs a shell to expand it at runtime
ENTRYPOINT ["sh", "-c", "/opt/keycloak/bin/kc.sh start --optimized --http-port=${PORT:-8080}"]