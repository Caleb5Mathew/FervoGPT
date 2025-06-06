// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { PublicClientApplication } from "@azure/msal-browser";
import {
  MsalProvider,
  MsalRedirectComponent              // ⭐ NEW
} from "@azure/msal-react";

import App from "./App";
import { msalConfig } from "./Authentication/authConfig";

/* ─── simple error boundary ───────────────────────────── */
class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <pre style={{ color: "darkred", padding: 20 }}>
          <strong>Render error:</strong>
          {"\n\n"}
          {this.state.error.toString()}
        </pre>
      );
    }
    return this.props.children;
  }
}

/* ─── MSAL instance ───────────────────────────────────── */
const msalInstance = new PublicClientApplication(msalConfig);

/* ─── React 18 root ───────────────────────────────────── */
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ErrorBoundary>
    <MsalProvider instance={msalInstance}>
      {/*  BrowserRouter is required so /auth can render */}
      <BrowserRouter>
        <Routes>
          {/*  your main app */}
          <Route path="/*" element={<App />} />

          {/*  this exact path must match redirectUri */}
          <Route path="/auth" element={<MsalRedirectComponent />} />
        </Routes>
      </BrowserRouter>
    </MsalProvider>
  </ErrorBoundary>
);
