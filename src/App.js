import { useState, useRef, useEffect } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Header from "./components/Header";
import Nav from "./components/Nav";
import Dashboard from "./components/Dashboard";
import Expenses from "./components/Expenses";
import Advisor from "./components/Advisor";
import { requestPermission, sendNotification } from "./utils/notifications";
import translations from "./utils/translations";

const CATEGORIES = ["Food", "Rent", "Transport", "Entertainment", "Health", "Shopping", "Utilities", "Other"];
const formatCurrency = (n) => `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function App() {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const [tab, setTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(true);
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("EN");
  const [income, setIncome] = useState("");
  const [savedIncome, setSavedIncome] = useState(0);
  const [categoryGoals, setCategoryGoals] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [lastReset, setLastReset] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [form, setForm] = useState({ name: "", amount: "", category: "Food", date: now.toISOString().slice(0, 10) });
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Hi! I'm your AI budget advisor. Add your income and expenses, then ask me anything — like 'Am I overspending?' or 'Give me a monthly report'." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setDataLoaded(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  // Request notification permission on login
  useEffect(() => {
    if (user) requestPermission();

  }, [user]);
  // Send notifications when overspending
  useEffect(() => {
    if (!dataLoaded || !user) return;
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const spendPercent = savedIncome > 0 ? (totalExpenses / savedIncome) * 100 : 0;

    // Overall budget warning
    if (spendPercent >= 100) {
      sendNotification(
        "🚨 Budget Exceeded!",
        `You have spent $${totalExpenses.toFixed(2)} which is over your $${savedIncome.toFixed(2)} budget!`
      );
    } else if (spendPercent >= 80) {
      sendNotification(
        "⚠️ Budget Warning!",
        `You've used ${spendPercent.toFixed(0)}% of your monthly budget. Slow down on spending!`
      );
    }

    // Category goal warnings
    const CATS = ["Food", "Rent", "Transport", "Entertainment", "Health", "Shopping", "Utilities", "Other"];
    CATS.forEach(c => {
      const goal = categoryGoals[c];
      if (!goal || goal <= 0) return;
      const spent = expenses
        .filter(e => e.category === c)
        .reduce((s, e) => s + Number(e.amount), 0);
      if (spent >= goal) {
        sendNotification(
          `🎯 ${c} Budget Exceeded!`,
          `You've spent $${spent.toFixed(2)} on ${c}, which is over your $${goal.toFixed(2)} goal!`
        );
      }
    });
  }, [expenses, savedIncome, categoryGoals]);

  // Load data from Firestore when user logs in
  useEffect(() => {
    if (!user) return;
    setDataLoaded(false);
    const loadData = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.expenses) setExpenses(data.expenses);
          if (data.savedIncome) setSavedIncome(data.savedIncome);
          if (data.categoryGoals) setCategoryGoals(data.categoryGoals);
          if (data.currency) setCurrency(data.currency);
          if (data.language) setLanguage(data.language);
          if (data.recurringExpenses) setRecurringExpenses(data.recurringExpenses);
          if (data.lastReset) {
            setLastReset(data.lastReset);
            // Check if new month
            if (data.lastReset !== currentMonth) {
              setShowResetModal(true);
            }
          } else {
            // First time — set lastReset to current month
            await setDoc(docRef, { lastReset: currentMonth }, { merge: true });
            setLastReset(currentMonth);
          }
        }
      } catch (err) {
        console.error("Load error:", err);
      }
      setDataLoaded(true);
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Save data to Firestore only AFTER data has been loaded
  useEffect(() => {
    if (!user || !dataLoaded) return;
    const saveData = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        await setDoc(docRef, { expenses, savedIncome, categoryGoals, lastReset, currency, language, recurringExpenses }, { merge: true });
      } catch (err) {
        console.error("Save error:", err);
      }
    };
    saveData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, savedIncome, categoryGoals, lastReset, currency, language, recurringExpenses, user, dataLoaded]);

  if (!user) return <Login />;

  const t = translations[language] || translations.EN;
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const remaining = savedIncome - totalExpenses;
  const spendPercent = savedIncome > 0 ? (totalExpenses / savedIncome) * 100 : 0;

  const byCategory = CATEGORIES.map(c => ({
    name: c,
    total: expenses.filter(e => e.category === c).reduce((s, e) => s + Number(e.amount), 0)
  })).filter(c => c.total > 0);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    const context = `
You are an expert personal finance AI advisor. Here is the user's financial data:
- Monthly Income: ${formatCurrency(savedIncome)}
- Total Expenses: ${formatCurrency(totalExpenses)}
- Remaining Budget: ${formatCurrency(remaining)}
- Budget Used: ${spendPercent.toFixed(1)}%
- Expense Breakdown by Category:
${byCategory.map(c => `  • ${c.name}: ${formatCurrency(c.total)} (${savedIncome > 0 ? ((c.total / savedIncome) * 100).toFixed(1) : 0}% of income)`).join("\n")}
- All Expenses:
${expenses.map(e => `  • ${e.date} | ${e.name} | ${e.category} | ${formatCurrency(e.amount)}`).join("\n") || "  (none added yet)"}

Give concise, personalized, actionable advice. Use emojis to make responses engaging. 
If asked for a report, structure it clearly with sections. 
Warn clearly if overspending (>80% of budget used). 
Keep responses under 200 words unless generating a full report.
    `.trim();

    try {
      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: context,
          messages: [
            ...messages.slice(1).map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMsg }
          ]
        })
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || "").join("") || "Sorry, I couldn't process that.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Connection error. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: darkMode ? "#070d1a" : "#f0f4ff", color: darkMode ? "#f0f4ff" : "#111827", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", padding: "0 0 40px", transition: "all 0.3s" }}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} t={t} language={language} setLanguage={setLanguage} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 24px", background: darkMode ? "#070d1a" : "#ffffff", borderBottom: darkMode ? "1px solid #1e2d4a" : "1px solid #e0e6f0", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 13, color: "#c9a84c", fontWeight: 600 }}>
          👋 {t.welcome}, {user?.displayName || user?.email}
        </span>
        <button
          onClick={() => signOut(auth)}
          style={{ background: "transparent", border: "1px solid #c9a84c44", borderRadius: 8, color: "#c9a84c", padding: "5px 16px", cursor: "pointer", fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}
        >
          {t.signOut}
        </button>
      </div>

      <Nav tab={tab} setTab={setTab} darkMode={darkMode} t={t} />

      <div style={{ padding: "24px", maxWidth: 860, margin: "0 auto" }}>
        {tab === "dashboard" && (
          <Dashboard
            income={income} setIncome={setIncome}
            savedIncome={savedIncome} setSavedIncome={setSavedIncome}
            expenses={expenses}
            categoryGoals={categoryGoals} setCategoryGoals={setCategoryGoals}
            darkMode={darkMode}
            currency={currency} setCurrency={setCurrency}
            t={t}
            recurringExpenses={recurringExpenses}
            setRecurringExpenses={setRecurringExpenses}
          />
        )}
        {tab === "expenses" && (
          <Expenses
            expenses={expenses} setExpenses={setExpenses}
            form={form} setForm={setForm}
            darkMode={darkMode}
            currency={currency}
            t={t}
          />
        )}
        {tab === "advisor" && (
          <Advisor
            messages={messages}
            input={input} setInput={setInput}
            sendMessage={sendMessage}
            loading={loading}
            darkMode={darkMode}
            t={t}
          />
        )}
        {tab === "profile" && (
          <Profile user={user} darkMode={darkMode} />
        )}
      </div>

      {/* Monthly Reset Modal */}
      {showResetModal && (
        <div style={{
          position: "fixed", inset: 0, background: "#000000cc",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, padding: 24
        }}>
          <div style={{
            background: "#0d0d1a", border: "1px solid #00ffff33",
            borderRadius: 20, padding: 32, maxWidth: 400, width: "100%",
            boxShadow: "0 0 60px #00ffff15"
          }}>
            <div style={{ fontSize: 32, marginBottom: 12, textAlign: "center" }}>🗓️</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#e8e8f0", marginBottom: 8, textAlign: "center" }}>
              New Month!
            </div>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 24, textAlign: "center", lineHeight: 1.6 }}>
              It's a new month! Do you want to reset your expenses and start fresh?
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  // Auto-add recurring expenses on reset
                  const autoExpenses = recurringExpenses.map(r => ({
                    ...r,
                    id: Date.now() + Math.random(),
                    date: new Date().toISOString().slice(0, 10)
                  }));
                  setExpenses(autoExpenses);
                  setLastReset(currentMonth);
                  setShowResetModal(false);
                }}
                style={{
                  flex: 1, background: "#00ffff22", border: "1px solid #00ffff44",
                  borderRadius: 10, color: "#00ffff", padding: "12px",
                  cursor: "pointer", fontSize: 14, fontWeight: 700,
                  boxShadow: "0 0 15px #00ffff22"
                }}
              >
                Yes, Reset! 🚀
              </button>
              <button
                onClick={() => {
                  setLastReset(currentMonth);
                  setShowResetModal(false);
                }}
                style={{
                  flex: 1, background: "#ffffff0f", border: "1px solid #ffffff22",
                  borderRadius: 10, color: "#888", padding: "12px",
                  cursor: "pointer", fontSize: 14, fontWeight: 700
                }}
              >
                Keep Expenses
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}