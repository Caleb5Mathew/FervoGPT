import React, { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import "./Login.css";
import { loadStoredTheme } from "../components/ThemeManager"; // ✅ reuse your logic

export default function Login() {
  const { instance } = useMsal();

  useEffect(() => {
    loadStoredTheme(); // ✅ use same logic as the rest of the app
  }, []);

  return (
    <main className="login-root">
      <section className="login-card">
        <img src="/ferv.png" alt="Fervo logo" className="login-logo" />
        <h1 className="login-title">Welcome to Fervo</h1>
        <p className="login-sub">Sign in to continue to the energy platform</p>
        <button onClick={() => instance.loginRedirect()} className="login-btn">
          Sign in with Microsoft
        </button>
        <p className="login-footer">Powered by Fervo Energy</p>
      </section>
    </main>
  );
}
