import React, { useState } from "react";
import exportPDF from "../utils/exportPDF";
import { requestPermission, sendNotification } from "../utils/notifications";
import { CURRENCIES, formatAmount } from "../utils/currency";
import "../styles/Dashboard.css";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

const CATEGORIES = ["Food", "Rent", "Transport", "Entertainment", "Health", "Shopping", "Utilities", "Other"];
const catColors = ["#00ffff", "#ff00ff", "#00ff88", "#ffd166", "#ff6b6b", "#4ecdc4", "#a78bfa", "#f9ca24"];

const GlowBar = ({ percent, color }) => (
  <div className="glowbar-bg">
    <div className="glowbar-fill" style={{
      width: `${Math.min(percent, 100)}%`,
      background: color,
      boxShadow: `0 0 10px ${color}88`
    }} />
  </div>
);

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#0d0d1a", border: "1px solid #00ffff33", borderRadius: 10, padding: "10px 14px" }}>
        {label && <div style={{ color: "#888", fontSize: 12, marginBottom: 4 }}>{label}</div>}
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, fontSize: 13, fontWeight: 700 }}>
            {formatAmount(p.value, currency)}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard({ income, setIncome, savedIncome, setSavedIncome, expenses, categoryGoals, setCategoryGoals, darkMode, currency, setCurrency, t, recurringExpenses, setRecurringExpenses }) {
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const remaining = savedIncome - totalExpenses;
  const spendPercent = savedIncome > 0 ? (totalExpenses / savedIncome) * 100 : 0;

  const byCategory = CATEGORIES.map((c, i) => ({
    name: c,
    total: expenses.filter(e => e.category === c).reduce((s, e) => s + Number(e.amount), 0),
    color: catColors[i]
  })).filter(c => c.total > 0);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    const total = expenses
      .filter(e => e.date === dateStr)
      .reduce((s, e) => s + Number(e.amount), 0);
    return { label, total };
  });

  const overBudgetCategories = byCategory.filter(c => {
    const goal = categoryGoals[c.name];
    return goal > 0 && c.total > goal;
  });

  const curSymbol = CURRENCIES.find(c => c.code === currency)?.symbol || "$";
  const [recForm, setRecForm] = useState({ name: "", amount: "", category: "Food" });

  return (
    <div className={`dashboard ${darkMode ? "" : "light"}`}>

      {/* Income Setter */}
      <div className="dash-card">
        <div className="dash-card-title">{t.monthlyIncome.toUpperCase()}</div>

        {/* Currency Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: "#00ffff99", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{t.currency}</label>
          <select
            className="dash-input"
            style={{ width: "auto", padding: "6px 12px" }}
            value={currency}
            onChange={e => setCurrency(e.target.value)}
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>
            ))}
          </select>
        </div>

        {/* Income Input Row */}
        <div className="dash-row" style={{ marginBottom: 12 }}>
          <input
            className="dash-input"
            type="number"
            placeholder={t.enterIncome}
            value={income}
            onChange={e => setIncome(e.target.value)}
          />
          <button
            className="dash-btn"
            onClick={() => { if (!isNaN(income) && income) setSavedIncome(Number(income)); }}
          >
            {t.setIncome}
          </button>
        </div>

        {/* Action Buttons Row */}
        <div className="dash-row" style={{ gap: 10 }}>
          <button
            className="dash-btn"
            onClick={() => exportPDF(expenses, savedIncome, categoryGoals, "User")}
            style={{ background: "linear-gradient(135deg, #ff00ff22, #ff00ff11)", border: "1px solid #ff00ff44", color: "#ff00ff", boxShadow: "0 0 15px #ff00ff22" }}
          >
            📄 {t.exportPDF}
          </button>
          <button
            className="dash-btn"
            onClick={async () => {
              const granted = await requestPermission();
              if (granted) {
                sendNotification("✅ Notifications Enabled!", "You will now get alerts when overspending.");
              } else {
                alert("Please allow notifications in your browser settings.");
              }
            }}
            style={{ background: "linear-gradient(135deg, #ffd16622, #ffd16611)", border: "1px solid #ffd16644", color: "#ffd166", boxShadow: "0 0 15px #ffd16622" }}
          >
            🔔 {t.enableAlerts}
          </button>
        </div>
      </div>

      {/* Overspending Alert */}
      {spendPercent > 80 && (
        <div className="dash-warn">
          ⚠️ <strong>{t.overspendingAlert}</strong> {t.youveUsed} {spendPercent.toFixed(0)}% {t.ofYourBudget}
        </div>
      )}

      {/* Category Goal Alerts */}
      {overBudgetCategories.length > 0 && (
        <div className="dash-warn">
          🎯 <strong>{t.goalExceeded}</strong> {t.overBudgetIn}: {overBudgetCategories.map(c => c.name).join(", ")}
        </div>
      )}

      {/* Stat Cards */}
      <div className="dash-stat-grid">
        <div className="dash-stat" style={{ borderLeftColor: "#00ffff" }}>
          <div className="dash-stat-label">{t.monthlyIncome}</div>
          <div className="dash-stat-value" style={{ color: "#00ffff" }}>{formatAmount(savedIncome, currency)}</div>
        </div>
        <div className="dash-stat" style={{ borderLeftColor: "#ff00ff" }}>
          <div className="dash-stat-label">{t.totalExpenses}</div>
          <div className="dash-stat-value" style={{ color: "#ff00ff" }}>{formatAmount(totalExpenses, currency)}</div>
        </div>
        <div className="dash-stat" style={{ borderLeftColor: remaining >= 0 ? "#00ff88" : "#ff6b6b" }}>
          <div className="dash-stat-label">{t.remaining}</div>
          <div className="dash-stat-value" style={{ color: remaining >= 0 ? "#00ff88" : "#ff6b6b" }}>{formatAmount(remaining, currency)}</div>
        </div>
        <div className="dash-stat" style={{ borderLeftColor: "#ffd166" }}>
          <div className="dash-stat-label">{t.budgetUsed}</div>
          <div className="dash-stat-value" style={{ color: "#ffd166" }}>{spendPercent.toFixed(1)}%</div>
        </div>
      </div>

      {/* Budget Bar */}
      <div className="dash-card">
        <div className="dash-card-title">{t.budgetOverview}</div>
        <div className="dash-bar-labels">
          <span>{t.spent}: {formatAmount(totalExpenses, currency)}</span>
          <span>{t.limit}: {formatAmount(savedIncome, currency)}</span>
        </div>
        <GlowBar
          percent={spendPercent}
          color={spendPercent > 80 ? "#ff6b6b" : spendPercent > 60 ? "#ffd166" : "#00ff88"}
        />
      </div>

      {/* Charts Row */}
      {expenses.length > 0 && (
        <div className="dash-charts-grid">
          <div className="dash-card">
            <div className="dash-card-title">{t.spendingLast7.toUpperCase()}</div>
            <ResponsiveContainer width="100%" height={180} minWidth={0}>
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ffff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00ffff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${curSymbol}${v}`} />
                <Tooltip content={<CustomTooltip currency={currency} />} />
                <Area type="monotone" dataKey="total" stroke="#00ffff" strokeWidth={2} fill="url(#areaGrad)" dot={{ fill: "#00ffff", r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="dash-card">
            <div className="dash-card-title">{t.spendingByCategory.toUpperCase()}</div>
            <ResponsiveContainer width="100%" height={180} minWidth={0}>
              <BarChart data={byCategory} barSize={20}>
                <XAxis dataKey="name" tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${curSymbol}${v}`} />
                <Tooltip content={<CustomTooltip currency={currency} />} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {byCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Spending Breakdown */}
      {byCategory.length > 0 && (
        <div className="dash-card">
          <div className="dash-card-title">{t.spendingBreakdown.toUpperCase()}</div>

          {/* Pie Chart */}
          <div style={{ width: "100%", height: 220, marginBottom: 24 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={byCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="total"
                  paddingAngle={3}
                >
                  {byCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip currency={currency} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Bars */}
          <div style={{ width: "100%" }}>
            {byCategory.map((c) => {
              const goal = categoryGoals[c.name] || 0;
              const overBudget = goal > 0 && c.total > goal;
              const goalPercent = goal > 0 ? (c.total / goal) * 100 : savedIncome > 0 ? (c.total / savedIncome) * 100 : 0;
              return (
                <div key={c.name} style={{ marginBottom: 14 }}>
                  <div className="dash-category-row">
                    <span style={{ color: c.color, fontWeight: 700 }}>{c.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="dash-category-amount">{formatAmount(c.total, currency)}</span>
                      {goal > 0 && (
                        <span style={{ fontSize: 11, color: overBudget ? "#ff6b6b" : "#555" }}>
                          / {formatAmount(goal, currency)}
                        </span>
                      )}
                      {overBudget && (
                        <span style={{ fontSize: 11, color: "#ff6b6b", fontWeight: 700 }}>⚠️ {t.over}</span>
                      )}
                    </div>
                  </div>
                  <GlowBar percent={goalPercent} color={overBudget ? "#ff6b6b" : c.color} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Goals Setter */}
      <div className="dash-card">
        <div className="dash-card-title">🎯 {t.budgetGoals.toUpperCase()}</div>
        <div className="dash-goals-grid">
          {CATEGORIES.map((c, i) => (
            <div key={c} className="dash-goal-item">
              <label className="dash-goal-label" style={{ color: catColors[i] }}>{c}</label>
              <input
                className="dash-input"
                type="number"
                placeholder={t.noLimit}
                value={categoryGoals[c] || ""}
                onChange={e => setCategoryGoals(prev => ({
                  ...prev,
                  [c]: Number(e.target.value)
                }))}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Recurring Expenses */}
      <div className="dash-card">
        <div className="dash-card-title">🔁 RECURRING EXPENSES</div>

        {/* Add Recurring Form */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 10, marginBottom: 16 }}>
          <input
            className="dash-input"
            placeholder="e.g. Netflix, Rent..."
            value={recForm.name}
            onChange={e => setRecForm(f => ({ ...f, name: e.target.value }))}
          />
          <input
            className="dash-input"
            type="number"
            placeholder="Amount"
            value={recForm.amount}
            onChange={e => setRecForm(f => ({ ...f, amount: e.target.value }))}
          />
          <select
            className="dash-input"
            value={recForm.category}
            onChange={e => setRecForm(f => ({ ...f, category: e.target.value }))}
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <button
            className="dash-btn"
            style={{ background: "#c9a84c", color: "#070d1a", border: "none", fontWeight: 700 }}
            onClick={() => {
              if (!recForm.name || !recForm.amount) return;
              setRecurringExpenses(prev => [...prev, { ...recForm, id: Date.now() }]);
              setRecForm({ name: "", amount: "", category: "Food" });
            }}
          >
            + Add
          </button>
        </div>

        {/* Recurring List */}
        {recurringExpenses.length === 0 ? (
          <div style={{ textAlign: "center", color: "#445577", padding: "24px 0", fontSize: 13 }}>
            No recurring expenses yet. Add your monthly bills above.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recurringExpenses.map(r => (
              <div key={r.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: darkMode ? "#070d1a" : "#f5f8ff",
                border: `1px solid ${darkMode ? "#1e2d4a" : "#e0e6f0"}`,
                borderRadius: 10, padding: "12px 16px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: darkMode ? "#0d1729" : "#eef2f9",
                    border: `1px solid ${darkMode ? "#1e2d4a" : "#dde3f0"}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
                  }}>🔁</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: darkMode ? "#f0f4ff" : "#111827", marginBottom: 2 }}>
                      {r.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#445577" }}>
                      {r.category} · Monthly
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#c9a84c" }}>
                    {formatAmount(r.amount, currency)}
                  </div>
                  <button
                    onClick={() => setRecurringExpenses(prev => prev.filter(e => e.id !== r.id))}
                    style={{
                      background: "transparent", border: `1px solid ${darkMode ? "#1e2d4a" : "#dde3f0"}`,
                      borderRadius: 6, color: "#445577", padding: "4px 10px",
                      cursor: "pointer", fontSize: 11, fontWeight: 600, transition: "all 0.2s"
                    }}
                    onMouseEnter={e => { e.target.style.borderColor = "#ff4444"; e.target.style.color = "#ff4444"; }}
                    onMouseLeave={e => { e.target.style.borderColor = darkMode ? "#1e2d4a" : "#dde3f0"; e.target.style.color = "#445577"; }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            {/* Total */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              borderTop: `1px solid ${darkMode ? "#1e2d4a" : "#e0e6f0"}`,
              paddingTop: 12, marginTop: 4
            }}>
              <span style={{ fontSize: 12, color: "#445577", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                Monthly Total
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#c9a84c" }}>
                {formatAmount(recurringExpenses.reduce((s, r) => s + Number(r.amount), 0), currency)}
              </span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}