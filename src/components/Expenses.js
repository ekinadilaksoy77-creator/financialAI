import React from "react";
import { formatAmount } from "../utils/currency";
import "../styles/Expenses.css";

const CATEGORIES = ["Food","Rent","Transport","Entertainment","Health","Shopping","Utilities","Other"];

const categoryIcon = (cat) => {
  const icons = { Food: "🍔", Rent: "🏠", Transport: "🚗", Entertainment: "🎮", Health: "💊", Shopping: "🛍️", Utilities: "💡", Other: "📦" };
  return icons[cat] || "📦";
};

export default function Expenses({ expenses, setExpenses, form, setForm, darkMode, currency, t }) {
  const addExpense = () => {
    if (!form.name || !form.amount || isNaN(form.amount)) return;
    setExpenses(prev => [...prev, { ...form, id: Date.now() }]);
    setForm(f => ({ ...f, name: "", amount: "" }));
  };

  const deleteExpense = (id) => setExpenses(prev => prev.filter(e => e.id !== id));

  return (
    <div className={`expenses ${darkMode ? "" : "light"}`}>

      {/* Add Expense Form */}
      <div className="exp-card">
        <div className="exp-card-title">{t.addExpense}</div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 10, color: "#445577", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>{t.amount === "Amount" ? "Description" : "Açıklama"}</label>
            <input
              className="exp-input"
              placeholder={t.expenseName}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && addExpense()}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 10, color: "#445577", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>{t.amount}</label>
            <input
              className="exp-input"
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && addExpense()}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 10, color: "#445577", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>{t.category}</label>
            <select
              className="exp-input"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 10, color: "#445577", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>{t.date}</label>
            <input
              className="exp-input"
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            />
          </div>

          <button className="exp-btn" onClick={addExpense} style={{ marginBottom: 1 }}>
            + {t.add}
          </button>
        </div>
      </div>

      {/* Expense List */}
      <div className="exp-card">
        <div className="exp-card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>ALL EXPENSES</span>
          {expenses.length > 0 && (
            <span style={{ color: "#c9a84c", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
              {expenses.length} ENTRIES
            </span>
          )}
        </div>

        {expenses.length === 0 ? (
          <div className="exp-empty">{t.noExpenses}</div>
        ) : (
          <div className="exp-list">
            {[...expenses].reverse().map(e => (
              <div key={e.id} className="exp-item">
                <div className="exp-item-left">
                  <div className="exp-item-icon">{categoryIcon(e.category)}</div>
                  <div>
                    <div className="exp-item-name">{e.name}</div>
                    <div className="exp-item-meta">{e.category} · {e.date}</div>
                  </div>
                </div>
                <div className="exp-item-right">
                  <div className="exp-item-amount">{formatAmount(e.amount, currency)}</div>
                  <button className="exp-delete-btn" onClick={() => deleteExpense(e.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}