import { useState } from "react";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import ConsoleView from "../views/ConsoleView";
import ChatView from "../views/ChatView";

type View = "console" | "chat";

export default function AppShell() {
  const [activeView, setActiveView] = useState<View>("console");

  return (
    <div className="app-shell">
      <TopBar />
      <div className="app-body">
        <Sidebar activeView={activeView} onChange={setActiveView} />
        <main className="app-content">
          {activeView === "console" ? <ConsoleView /> : <ChatView />}
        </main>
      </div>
    </div>
  );
}