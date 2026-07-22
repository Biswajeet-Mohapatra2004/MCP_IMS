import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8180",
  realm: "ims-realm",
  clientId: "ims-frontend",
});

export default keycloak;