import keycloak from "../keycloak";

export default function TopBar() {
  const username = keycloak.tokenParsed?.preferred_username ?? "User";
  const roles: string[] = keycloak.tokenParsed?.realm_access?.roles ?? [];
  const primaryRole = roles.find((r) => ["ADMIN", "MANAGER", "STAFF"].includes(r)) ?? "—";

  return (
    <header className="topbar">
      <div className="topbar-brand">Inventory Management System</div>
      <div className="topbar-user">
        <span className="topbar-user-name">{username}</span>
        <span className="topbar-user-role">{primaryRole}</span>
        <button className="topbar-logout" onClick={() => keycloak.logout()}>
          Sign out
        </button>
      </div>
    </header>
  );
}