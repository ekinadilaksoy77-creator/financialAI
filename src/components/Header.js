import React from "react";
import "../styles/Header.css";

const LANGUAGES = [
  { code: "EN", label: "🇬🇧 EN" },
  { code: "TR", label: "🇹🇷 TR" },
  { code: "ES", label: "🇪🇸 ES" },
  { code: "FR", label: "🇫🇷 FR" },
  { code: "DE", label: "🇩🇪 DE" },
  { code: "AR", label: "🇸🇦 AR" },
];

export default function Header({ darkMode, setDarkMode, t, language, setLanguage }) {
  return (
    <div className="header" style={{
      background: darkMode ? "#070d1a" : "#ffffff",
      borderBottom: darkMode ? "1px solid #1e2d4a" : "1px solid #e0e6f0",
      boxShadow: darkMode ? "0 1px 0 #1e2d4a" : "0 1px 0 #e0e6f0"
    }}>
      <div className="header-left">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34,
            background: "linear-gradient(135deg, #c9a84c, #a07830)",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 16, color: "#070d1a",
            letterSpacing: "-1px", fontFamily: "Georgia, serif"
          }}>S</div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{
              fontSize: 16, fontWeight: 800,
              color: darkMode ? "#f0f4ff" : "#111827",
              letterSpacing: "-0.5px",
              fontFamily: "Georgia, serif"
            }}>SpendSmart</span>
            <span style={{ fontSize: 9, color: "#c9a84c", letterSpacing: 2.5, fontWeight: 700, textTransform: "uppercase" }}>Business Finance</span>
          </div>
        </div>
      </div>
      <div className="header-right">
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          style={{
            background: darkMode ? "#0d1729" : "#f0f4ff",
            border: darkMode ? "1px solid #1e2d4a" : "1px solid #dde3f0",
            borderRadius: 8,
            color: darkMode ? "#8899bb" : "#444",
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            outline: "none",
          }}
        >
          {LANGUAGES.map(l => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>

        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            background: "transparent",
            border: darkMode ? "1px solid #1e2d4a" : "1px solid #dde3f0",
            borderRadius: 8,
            color: darkMode ? "#8899bb" : "#444",
            padding: "6px 14px",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 6px #22c55e88" }}></span>
          <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 600, letterSpacing: 0.5 }}>{t.live}</span>
        </div>
      </div>
    </div>
  );
}