import React from "react";
import { applyTheme, themeList } from "./ThemeManager";
import "./ThemeDropdown.css"; // ✅ Make sure this is included

export default function ThemeDropdown() {
  return (
    <div className="theme-dropdown">
      {themeList.map((theme) => (
        <div
          key={theme}
          className="theme-swatch"
          onClick={() => applyTheme(theme)}
        >
          <div className="swatch-strip" data-theme={theme}></div>
          <span>{theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
        </div>
      ))}
    </div>
  );
}
