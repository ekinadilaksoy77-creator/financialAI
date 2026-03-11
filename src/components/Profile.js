import React, { useState, useRef } from "react";
import { auth } from "../firebase";
import {
    updateProfile, updateEmail, updatePassword,
    deleteUser, reauthenticateWithCredential, EmailAuthProvider
} from "firebase/auth";

export default function Profile({ user, darkMode }) {
    const [firstName, setFirstName] = useState(user?.displayName?.split(" ")[0] || "");
    const [lastName, setLastName] = useState(user?.displayName?.split(" ")[1] || "");
    const [email, setEmail] = useState(user?.email || "");
    const [newPassword, setNewPassword] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [currentPassword2, setCurrentPassword2] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [avatar, setAvatar] = useState(user?.photoURL || null);
    const fileRef = useRef(null);

    const card = {
        background: darkMode ? "#0d1729" : "#ffffff",
        border: `1px solid ${darkMode ? "#1e2d4a" : "#e0e6f0"}`,
        borderRadius: 12, padding: "22px 26px", marginBottom: 14
    };
    const input = {
        background: darkMode ? "#070d1a" : "#f5f8ff",
        border: `1px solid ${darkMode ? "#1e2d4a" : "#dde3f0"}`,
        borderRadius: 8, color: darkMode ? "#f0f4ff" : "#111827",
        padding: "10px 14px", fontSize: 13, outline: "none",
        width: "100%", boxSizing: "border-box", fontFamily: "inherit"
    };
    const label = {
        fontSize: 10, color: "#445577", fontWeight: 700,
        textTransform: "uppercase", letterSpacing: 1.5,
        display: "block", marginBottom: 6
    };
    const btn = (color = "#c9a84c") => ({
        background: color === "danger" ? "transparent" : color === "gold" ? "#c9a84c" : "transparent",
        border: color === "danger" ? "1px solid #ff444433" : color === "gold" ? "none" : `1px solid ${darkMode ? "#1e2d4a" : "#dde3f0"}`,
        borderRadius: 8, padding: "10px 20px", cursor: "pointer",
        fontSize: 13, fontWeight: 700, letterSpacing: 0.3,
        color: color === "danger" ? "#ff4444" : color === "gold" ? "#070d1a" : "#8899bb",
        transition: "all 0.2s", marginTop: 14
    });
    const title = {
        fontSize: 10, color: "#445577", fontWeight: 700,
        textTransform: "uppercase", letterSpacing: 2, marginBottom: 16
    };

    const showSuccess = (msg) => { setMessage(msg); setError(""); setTimeout(() => setMessage(""), 3000); };
    const showError = (msg) => { setError(msg); setMessage(""); setTimeout(() => setError(""), 3000); };
    const reauth = async (password) => {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
    };

    const handleUpdateName = async () => {
        if (!firstName || !lastName) return showError("Please enter both name and surname.");
        setLoading(true);
        try {
            await updateProfile(auth.currentUser, { displayName: `${firstName} ${lastName}` });
            showSuccess("✅ Name updated successfully!");
        } catch (err) { showError(err.message); }
        setLoading(false);
    };

    const handleUpdateEmail = async () => {
        if (!email || !currentPassword) return showError("Please enter new email and current password.");
        setLoading(true);
        try {
            await reauth(currentPassword);
            await updateEmail(auth.currentUser, email);
            showSuccess("✅ Email updated successfully!");
        } catch (err) { showError(err.message); }
        setLoading(false);
    };

    const handleUpdatePassword = async () => {
        if (!newPassword || !currentPassword2) return showError("Please enter both passwords.");
        if (newPassword.length < 6) return showError("New password must be at least 6 characters.");
        setLoading(true);
        try {
            await reauth(currentPassword2);
            await updatePassword(auth.currentUser, newPassword);
            setNewPassword(""); setCurrentPassword2("");
            showSuccess("✅ Password updated successfully!");
        } catch (err) { showError(err.message); }
        setLoading(false);
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const dataUrl = ev.target.result;
            setAvatar(dataUrl);
            try {
                await updateProfile(auth.currentUser, { photoURL: dataUrl });
                showSuccess("✅ Profile picture updated!");
            } catch (err) { showError(err.message); }
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) return showError("Please enter your password to confirm.");
        setLoading(true);
        try {
            await reauth(deletePassword);
            await deleteUser(auth.currentUser);
        } catch (err) { showError(err.message); }
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 0 40px" }}>

            {/* Avatar Card */}
            <div style={{ ...card, display: "flex", alignItems: "center", gap: 24, marginBottom: 14 }}>
                <div
                    onClick={() => fileRef.current.click()}
                    style={{
                        width: 72, height: 72, borderRadius: 12, overflow: "hidden",
                        border: "1px solid #1e2d4a", cursor: "pointer", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "#070d1a", position: "relative"
                    }}
                >
                    {avatar ? (
                        <img src={avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                        <span style={{ fontSize: 24, fontWeight: 700, color: "#c9a84c" }}>
                            {firstName?.[0]}{lastName?.[0]}
                        </span>
                    )}
                </div>
                <input type="file" accept="image/*" ref={fileRef} style={{ display: "none" }} onChange={handleAvatarChange} />
                <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: darkMode ? "#f0f4ff" : "#111827", marginBottom: 4 }}>
                        {user?.displayName || "User"}
                    </div>
                    <div style={{ fontSize: 13, color: "#445577", marginBottom: 8 }}>{user?.email}</div>
                    <button
                        onClick={() => fileRef.current.click()}
                        style={{ ...btn(), marginTop: 0, padding: "6px 14px", fontSize: 11 }}
                    >
                        📷 Change Photo
                    </button>
                </div>
            </div>

            {/* Messages */}
            {message && (
                <div style={{ background: "#0a1a0a", border: "1px solid #22c55e33", borderLeft: "3px solid #22c55e", borderRadius: 8, padding: "12px 16px", color: "#22c55e", fontSize: 13, marginBottom: 14 }}>
                    {message}
                </div>
            )}
            {error && (
                <div style={{ background: "#1a0a0a", border: "1px solid #ff444433", borderLeft: "3px solid #ff4444", borderRadius: 8, padding: "12px 16px", color: "#ff4444", fontSize: 13, marginBottom: 14 }}>
                    {error}
                </div>
            )}

            {/* Change Name */}
            <div style={card}>
                <div style={title}>CHANGE NAME</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 4 }}>
                    <div>
                        <label style={label}>First Name</label>
                        <input style={input} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" />
                    </div>
                    <div>
                        <label style={label}>Last Name</label>
                        <input style={input} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" />
                    </div>
                </div>
                <button style={btn("gold")} onClick={handleUpdateName} disabled={loading}>
                    Save Name →
                </button>
            </div>

            {/* Change Email */}
            <div style={card}>
                <div style={title}>CHANGE EMAIL</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 4 }}>
                    <div>
                        <label style={label}>New Email</label>
                        <input style={input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="new@email.com" />
                    </div>
                    <div>
                        <label style={label}>Current Password</label>
                        <input style={input} type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" />
                    </div>
                </div>
                <button style={btn("gold")} onClick={handleUpdateEmail} disabled={loading}>
                    Save Email →
                </button>
            </div>

            {/* Change Password */}
            <div style={card}>
                <div style={title}>CHANGE PASSWORD</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 4 }}>
                    <div>
                        <label style={label}>Current Password</label>
                        <input style={input} type="password" value={currentPassword2} onChange={e => setCurrentPassword2(e.target.value)} placeholder="••••••••" />
                    </div>
                    <div>
                        <label style={label}>New Password</label>
                        <input style={input} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
                    </div>
                </div>
                <button style={btn("gold")} onClick={handleUpdatePassword} disabled={loading}>
                    Save Password →
                </button>
            </div>

            {/* Danger Zone */}
            <div style={{ ...card, borderColor: "#ff444422" }}>
                <div style={{ ...title, color: "#ff4444" }}>⚠ DANGER ZONE</div>
                {!showDelete ? (
                    <button style={btn("danger")} onClick={() => setShowDelete(true)}>
                        Delete Account
                    </button>
                ) : (
                    <>
                        <p style={{ fontSize: 13, color: "#ff4444", marginBottom: 14, lineHeight: 1.6 }}>
                            This will permanently delete your account and all data. This cannot be undone.
                        </p>
                        <label style={label}>Enter Password to Confirm</label>
                        <input style={{ ...input, marginBottom: 14 }} type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="••••••••" />
                        <div style={{ display: "flex", gap: 10 }}>
                            <button style={{ ...btn("danger"), marginTop: 0 }} onClick={handleDeleteAccount} disabled={loading}>
                                Yes, Delete My Account
                            </button>
                            <button style={{ ...btn(), marginTop: 0 }} onClick={() => setShowDelete(false)}>
                                Cancel
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}