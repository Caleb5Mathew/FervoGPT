// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useIsAuthenticated } from "@azure/msal-react";
import Login from "./Authentication/Login";
import RequireAuth from "./Authentication/RequireAuth";
import Dashboard from "./Dashboard";

export default function App() {
  const isAuthenticated = useIsAuthenticated();

  const content = isAuthenticated
    ? (
      <RequireAuth>
        <Dashboard />
      </RequireAuth>
    )
    : (
      <Login />
    );

  return (
    <BrowserRouter>
      <Routes>
        {/* This handles the redirect back from Azure AD */}
        <Route path="/auth" element={content} />
        {/* This handles the root and any other paths */}
        <Route path="/*" element={content} />
      </Routes>
    </BrowserRouter>
  );
}
