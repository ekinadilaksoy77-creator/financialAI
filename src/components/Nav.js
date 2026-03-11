import React from "react";
import "../styles/Nav.css";

export default function Nav({ tab, setTab, darkMode, t }) {
  const tabs = [
    { id: "dashboard", label: t.dashboard, icon: "▦" },
    { id: "expenses", label: t.expenses, icon: "⊟" },
    { id: "advisor", label: t.advisor, icon: "◎" },
    { id: "profile", label: t.profile, icon: "◉" },
  ];

  return (
    <div className="nav" style={{
      background: darkMode ? "#070d1a" : "#ffffff",
      borderBottom: darkMode ? "1px solid #1e2d4a" : "1px solid #e0e6f0",
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          className={`nav-btn ${tab === t.id ? "active" : ""}`}
          onClick={() => setTab(t.id)}
          style={{
            color: tab === t.id ? "#c9a84c" : darkMode ? "#445577" : "#aab",
            background: "transparent",
            borderBottom: tab === t.id ? "2px solid #c9a84c" : "2px solid transparent",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            borderRadius: 0,
            padding: "12px 20px",
            fontWeight: tab === t.id ? 700 : 500,
            fontSize: 13,
            letterSpacing: 0.3,
          }}
        >
          <span style={{ marginRight: 6, fontSize: 14 }}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}