import React, { useRef, useEffect } from "react";

export default function Advisor({ messages, input, setInput, sendMessage, loading, darkMode, t }) {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const suggestions = [
    "Am I overspending?",
    "Give me a monthly report",
    "Where can I cut costs?",
    "How much should I save?"
  ];

  const card = {
    background: darkMode ? "#0d1729" : "#ffffff",
    border: `1px solid ${darkMode ? "#1e2d4a" : "#e0e6f0"}`,
    borderRadius: 12,
    padding: "22px 26px",
    marginBottom: 14,
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>

      {/* Header Card */}
      <div style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: darkMode ? "#070d1a" : "#f0f4ff",
            border: `1px solid ${darkMode ? "#1e2d4a" : "#dde3f0"}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
          }}>◎</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: darkMode ? "#f0f4ff" : "#111827", marginBottom: 3 }}>
              {t.aiAdvisor}
            </div>
            <div style={{ fontSize: 12, color: "#445577", fontWeight: 500 }}>
              Powered by AI — Ask anything about your finances
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 6px #22c55e88" }} />
          <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 600, letterSpacing: 0.5 }}>Online</span>
        </div>
      </div>

      {/* Chat Box */}
      <div style={{
        ...card,
        minHeight: 340, maxHeight: 420,
        overflowY: "auto", display: "flex",
        flexDirection: "column", gap: 16, padding: "20px 22px"
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: "flex",
            flexDirection: m.role === "user" ? "row-reverse" : "row",
            alignItems: "flex-start", gap: 12
          }}>
            {m.role === "assistant" && (
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: darkMode ? "#070d1a" : "#f0f4ff",
                border: `1px solid ${darkMode ? "#1e2d4a" : "#dde3f0"}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
              }}>◎</div>
            )}
            <div style={{
              maxWidth: "75%",
              background: m.role === "user"
                ? "#c9a84c"
                : darkMode ? "#070d1a" : "#f5f8ff",
              border: m.role === "user"
                ? "none"
                : `1px solid ${darkMode ? "#1e2d4a" : "#e0e6f0"}`,
              borderRadius: m.role === "user" ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
              padding: "12px 16px",
              fontSize: 13,
              lineHeight: 1.6,
              color: m.role === "user" ? "#070d1a" : darkMode ? "#c8d4ee" : "#334",
              fontWeight: m.role === "user" ? 600 : 400,
              whiteSpace: "pre-wrap",
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: darkMode ? "#070d1a" : "#f0f4ff",
              border: `1px solid ${darkMode ? "#1e2d4a" : "#dde3f0"}`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
            }}>◎</div>
            <div style={{
              background: darkMode ? "#070d1a" : "#f5f8ff",
              border: `1px solid ${darkMode ? "#1e2d4a" : "#e0e6f0"}`,
              borderRadius: "4px 12px 12px 12px",
              padding: "14px 18px", display: "flex", gap: 5, alignItems: "center"
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#445577",
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  display: "inline-block"
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {suggestions.map(q => (
          <button
            key={q}
            onClick={() => setInput(q)}
            style={{
              background: "transparent",
              border: `1px solid ${darkMode ? "#1e2d4a" : "#dde3f0"}`,
              borderRadius: 99, padding: "6px 14px",
              color: darkMode ? "#445577" : "#8899bb",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              transition: "all 0.2s", letterSpacing: 0.2
            }}
            onMouseEnter={e => { e.target.style.borderColor = "#c9a84c55"; e.target.style.color = "#c9a84c"; }}
            onMouseLeave={e => { e.target.style.borderColor = darkMode ? "#1e2d4a" : "#dde3f0"; e.target.style.color = darkMode ? "#445577" : "#8899bb"; }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Row */}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          style={{
            flex: 1,
            background: darkMode ? "#0d1729" : "#ffffff",
            border: `1px solid ${darkMode ? "#1e2d4a" : "#dde3f0"}`,
            borderRadius: 10, color: darkMode ? "#f0f4ff" : "#111827",
            padding: "13px 18px", fontSize: 13, outline: "none",
            fontFamily: "inherit", transition: "border 0.2s"
          }}
          placeholder={t.typeMessage}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          onFocus={e => e.target.style.borderColor = "#c9a84c66"}
          onBlur={e => e.target.style.borderColor = darkMode ? "#1e2d4a" : "#dde3f0"}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            background: "#c9a84c", border: "none",
            borderRadius: 10, color: "#070d1a",
            padding: "13px 24px", cursor: "pointer",
            fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
            opacity: loading ? 0.6 : 1, transition: "all 0.2s"
          }}
        >
          {t.send} →
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}