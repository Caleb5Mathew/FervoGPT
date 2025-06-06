import React, { useState, useEffect } from "react";
import { applyTheme, themeList } from "./ThemeManager";
import "./ThemeDropdown.css";

export default function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState("default");
  const [modeMap, setModeMap] = useState({});

  useEffect(() => {
    const savedTheme = localStorage.getItem("selected-theme") || "default";
    const savedMode = localStorage.getItem("selected-mode") || "dark";
    setCurrentTheme(savedTheme);
    setModeMap({ [savedTheme]: savedMode });
  }, []);

  const handleThemeClick = (theme) => {
    const selectedMode = modeMap[theme] || "dark";
    setCurrentTheme(theme);
    applyTheme(theme, selectedMode);
  };

  const toggleModeForTheme = (theme) => {
    const current = modeMap[theme] || "dark";
    const next = current === "dark" ? "light" : "dark";
    const updatedMap = { ...modeMap, [theme]: next };
    setModeMap(updatedMap);

    if (currentTheme === theme) {
      applyTheme(theme, next);
    }

    localStorage.setItem("selected-theme", theme);
    localStorage.setItem("selected-mode", next);
  };

  return (
    <div className="theme-selector-container">
      <div className="theme-entry-header">Color Themes</div>
      <div className="theme-dropdown">
        {themeList.map((theme) => {
          const selected = currentTheme === theme;
          const mode = modeMap[theme] || "dark";

          return (
            <div
              key={theme}
              className={`theme-option-row ${selected ? "active" : ""}`}
            >
              <div
                className="theme-swatch"
                onClick={() => handleThemeClick(theme)}
              >
                <div
                  className="swatch-strip"
                  data-theme={`${theme}-${mode}`}
                ></div>
                <span>{theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
              </div>
              <button
                className={`theme-toggle ${mode}`}
                onClick={() => toggleModeForTheme(theme)}
              >
                <div className="toggle-circle">{mode === "dark" ? "🌙" : "☀️"}</div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
