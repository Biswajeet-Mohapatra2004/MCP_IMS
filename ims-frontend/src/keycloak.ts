import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
   url: import.meta.env.VITE_KEYCLOAK_URL,
   realm: import.meta.env.VITE_KEYCLOAK_REALM,
   clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,

   console.log(import.meta.env.VITE_KEYCLOAK_URL),
   console.log(import.meta.env.VITE_KEYCLOAK_REALM),
   console.log(import.meta.env.VITE_KEYCLOAK_CLIENT_ID),
});

export default keycloak;