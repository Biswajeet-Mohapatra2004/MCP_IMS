import { ReactNode } from "react";

interface SidePanelProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function SidePanel({ title, open, onClose, children }: SidePanelProps) {
  if (!open) return null;

  return (
    <>
      <div className="side-panel-overlay" onClick={onClose} />
      <div className="side-panel">
        <div className="side-panel-header">
          <h3>{title}</h3>
          <button className="side-panel-close" onClick={onClose}>×</button>
        </div>
        <div className="side-panel-body">{children}</div>
      </div>
    </>
  );
}