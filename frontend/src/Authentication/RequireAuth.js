// src/RequireAuth.js
import React from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "./authConfig";

export default function RequireAuth({ children }) {
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();

  if (!isAuthenticated) {
    instance.loginRedirect(loginRequest);
    return <p>Redirecting to sign-in…</p>;
  }
  return children;
}
