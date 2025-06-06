// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import App from "./App";
import { msalConfig } from "./Authentication/authConfig";

// Error boundary to catch any render errors
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

console.log("🔍 index.js loaded");

// Initialize MSAL
const msalInstance = new PublicClientApplication(msalConfig);

// Create and mount the React 18 root
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ErrorBoundary>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </ErrorBoundary>
);
