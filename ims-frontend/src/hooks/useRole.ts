import keycloak from "../keycloak";

export function useRole() {
  const roles: string[] = keycloak.tokenParsed?.realm_access?.roles ?? [];

  return {
    isAdmin: roles.includes("ADMIN"),
    isManager: roles.includes("MANAGER"),
    isStaff: roles.includes("STAFF"),
    canWrite: roles.includes("ADMIN") || roles.includes("MANAGER"),
    canDelete: roles.includes("ADMIN"),
  };
}