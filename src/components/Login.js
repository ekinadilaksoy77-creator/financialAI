import React, { useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return setError("Please enter email and password.");
    if (isSignUp && (!firstName || !lastName)) return setError("Please enter your name and surname.");
    setLoading(true);
    setError("");
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: `${firstName} ${lastName}` });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      switch (err.code) {
        case "auth/invalid-email": setError("Invalid email address format."); break;
        case "auth/user-not-found": setError("No account found with this email."); break;
        case "auth/wrong-password": setError("Wrong password. Please try again."); break;
        case "auth/invalid-credential": setError("Wrong email or password. Please try again."); break;
        case "auth/email-already-in-use": setError("This email is already registered. Sign in instead."); break;
        case "auth/weak-password": setError("Password must be at least 6 characters."); break;
        case "auth/too-many-requests": setError("Too many failed attempts. Try again later."); break;
        default: setError("Something went wrong. Please try again.");
      }
    }
    setLoading(false);
  };

  const inputStyle = {
    background: "#070d1a",
    border: "1px solid #1e2d4a",
    borderRadius: 8,
    color: "#f0f4ff",
    padding: "12px 16px",
    fontSize: 14,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border 0.2s"
  };

  const labelStyle = {
    fontSize: 10, color: "#445577", fontWeight: 700,
    textTransform: "uppercase", letterSpacing: 1.5,
    display: "block", marginBottom: 6
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#070d1a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: 24,
      position: "relative",
      overflow: "hidden"
    }}>

      {/* Background accents */}
      <div style={{
        position: "absolute", top: -200, right: -200,
        width: 500, height: 500, borderRadius: "50%",
        background: "#c9a84c08", pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", bottom: -200, left: -200,
        width: 400, height: 400, borderRadius: "50%",
        background: "#1e2d4a44", pointerEvents: "none"
      }} />

      <div style={{
        background: "#0d1729",
        border: "1px solid #1e2d4a",
        borderRadius: 16,
        padding: "40px 40px 32px",
        width: "100%",
        maxWidth: 420,
        position: "relative",
        zIndex: 1
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>◆</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#f0f4ff", letterSpacing: "-0.5px", marginBottom: 4 }}>
            SpendSmart
          </div>
          <div style={{ fontSize: 12, color: "#445577", fontWeight: 500, letterSpacing: 0.5 }}>
            Your AI-Powered Budget Advisor
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex",
          borderBottom: "1px solid #1e2d4a",
          marginBottom: 28, marginTop: 28
        }}>
          {["Sign In", "Sign Up"].map((tab, i) => (
            <button
              key={tab}
              onClick={() => { setIsSignUp(i === 1); setError(""); }}
              style={{
                flex: 1, background: "transparent", border: "none",
                borderBottom: isSignUp === (i === 1) ? "2px solid #c9a84c" : "2px solid transparent",
                color: isSignUp === (i === 1) ? "#c9a84c" : "#445577",
                padding: "10px", cursor: "pointer", fontSize: 13,
                fontWeight: 700, letterSpacing: 0.5, transition: "all 0.2s",
                marginBottom: -1
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {isSignUp && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input style={inputStyle} placeholder="John" value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  onFocus={e => e.target.style.borderColor = "#c9a84c66"}
                  onBlur={e => e.target.style.borderColor = "#1e2d4a"} />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input style={inputStyle} placeholder="Doe" value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  onFocus={e => e.target.style.borderColor = "#c9a84c66"}
                  onBlur={e => e.target.style.borderColor = "#1e2d4a"} />
              </div>
            </div>
          )}

          <div>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              onFocus={e => e.target.style.borderColor = "#c9a84c66"}
              onBlur={e => e.target.style.borderColor = "#1e2d4a"} />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input style={inputStyle} type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              onFocus={e => e.target.style.borderColor = "#c9a84c66"}
              onBlur={e => e.target.style.borderColor = "#1e2d4a"} />
          </div>

          {error && (
            <div style={{
              background: "#1a0a0a", border: "1px solid #ff444433",
              borderLeft: "3px solid #ff4444", borderRadius: 8,
              padding: "10px 14px", color: "#ff6666", fontSize: 12, fontWeight: 500
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: "#c9a84c", border: "none", borderRadius: 8,
              color: "#070d1a", padding: "13px", cursor: "pointer",
              fontSize: 14, fontWeight: 700, letterSpacing: 0.5,
              opacity: loading ? 0.7 : 1, transition: "all 0.2s", marginTop: 4
            }}
          >
            {loading ? "Please wait..." : isSignUp ? "Create Account →" : "Sign In →"}
          </button>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: "#445577" }}>
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <span
            onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
            style={{ color: "#c9a84c", cursor: "pointer", fontWeight: 600 }}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </span>
        </div>

      </div>
    </div>
  );
}