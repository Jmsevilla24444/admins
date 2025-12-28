import React, { useState } from "react";
import "./AdminLogin.css";
import { auth, db } from "./service/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const ADMIN_SESSION_KEY = "admin_auth"; // same key as dashboard

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEmailValid = /^\S+@gmail\.com$/i.test(email);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    if (!isEmailValid) {
      setError("Please enter a valid Gmail address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);

      const uid = userCred.user.uid;

      const ref = doc(db, "Admin", uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        throw new Error("This account is not registered as Admin.");
      }

      // ✅ Set login session in localStorage
      localStorage.setItem(ADMIN_SESSION_KEY, uid);

      if (remember) {
        localStorage.setItem("adm-email", email);
      } else {
        localStorage.removeItem("adm-email");
      }

      // Redirect to dashboard
      window.location.hash = "#/dashboard";
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/user-not-found") {
        setError("Admin account does not exist.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else {
        setError(err.message || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-card">
        <h1 className="admin-title">Admin Login</h1>

        <form onSubmit={onSubmit} className="admin-form" autoComplete="on">
          <label className="admin-label" htmlFor="email">
            Email
          </label>
          <div className="admin-input-wrap">
            <span className="admin-input-icon" aria-hidden>
              ✉️
            </span>
            <input
              id="email"
              type="email"
              className="admin-input"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label className="admin-label" htmlFor="password">
            Password
          </label>
          <div className="admin-input-wrap">
            <span className="admin-input-icon" aria-hidden>
              🔒
            </span>
            <input
              id="password"
              type="password"
              className="admin-input"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="admin-remember">
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
          </div>

          {error && (
            <div style={{ color: "red", marginTop: 10, fontSize: 13 }}>
              {error}
            </div>
          )}

          <button type="submit" className="admin-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
