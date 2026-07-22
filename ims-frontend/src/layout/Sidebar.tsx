type View = "console" | "chat";

interface SidebarProps {
  activeView: View;
  onChange: (view: View) => void;
}

export default function Sidebar({ activeView, onChange }: SidebarProps) {
  return (
    <nav className="sidebar">
      <button
        className={`sidebar-item ${activeView === "console" ? "active" : ""}`}
        onClick={() => onChange("console")}
      >
        Console
      </button>
      <button
        className={`sidebar-item ${activeView === "chat" ? "active" : ""}`}
        onClick={() => onChange("chat")}
      >
        AI Assistant
      </button>
    </nav>
  );
}