// ThemeManager.js
const themes = {
  default: {
    light: {
      "--primary": "#2F47D6",
      "--deep-indigo": "#B2C3F4",
      "--neon-violet": "#E0DBFF",
      "--cool-cyan": "#D1F4FF",
      "--background-dark": "#FFFFFF",
      "--surface-dim": "#F0F2F5",
      "--surface-hover": "#E5E7EB",
      "--text-primary": "#111111",
      "--text-secondary": "#4B5563",
      "--border-gray": "#D1D5DB",
      "--danger-red": "#E53E3E",
      "--input-bg": "#E5E7EB",
      "--input-text": "#111111",
      "--input-placeholder": "#6B7280",
      "--send-btn-bg": "#2F47D6",
      "--send-btn-text": "#FFFFFF",
      "--highlight": "#EEF2FF",
      "--new-chat-bg": "#2F47D6",
      "--new-chat-hover": "#3C5CFF"
    },
    dark: {
      "--primary": "#2F47D6",
      "--deep-indigo": "#111F95",
      "--neon-violet": "#7544FF",
      "--cool-cyan": "#FFFFFF",
      "--background-dark": "#0B0D1C",
      "--surface-dim": "#1B1E2D",
      "--surface-hover": "#2C2F45",
      "--text-primary": "#FFFFFF",
      "--text-secondary": "#A6ACD3",
      "--border-gray": "#3F4460",
      "--danger-red": "#E53E3E",
      "--input-bg": "#2C2F45",
      "--input-text": "#FFFFFF",
      "--input-placeholder": "#A6ACD3",
      "--send-btn-bg": "#2F47D6",
      "--send-btn-text": "#FFFFFF",
      "--highlight": "#313B65",
      "--new-chat-bg": "#3C5CFF",
      "--new-chat-hover": "#547BFF"
    }
  },
  watermelon: {
    light: {
      "--primary": "#F67280",
      "--deep-indigo": "#F9D0D2",
      "--neon-violet": "#F5B8BD",
      "--cool-cyan": "#FDE8EA",
      "--background-dark": "#FEF7F8",
      "--surface-dim": "#FCEBEB",
      "--surface-hover": "#FAD7D8",
      "--text-primary": "#1A1A1A",
      "--text-secondary": "#803342",
      "--border-gray": "#F0C2C2",
      "--danger-red": "#D33B3B",
      "--input-bg": "#FFECE6",
      "--input-text": "#1A1A1A",
      "--input-placeholder": "#803342",
      "--send-btn-bg": "#FF6B6B",
      "--send-btn-text": "#FFFFFF",
      "--highlight": "#FFDDD6",
      "--new-chat-bg": "#F67280",
      "--new-chat-hover": "#FF8A90"
    },
    dark: {
      "--primary": "#58152E",
      "--deep-indigo": "#95132C",
      "--neon-violet": "#3A162F",
      "--cool-cyan": "#FFFFFF",
      "--background-dark": "#0F0E10",
      "--surface-dim": "#2A1B24",
      "--surface-hover": "#3D1C28",
      "--text-primary": "#FFFFFF",
      "--text-secondary": "#FFBBC2",
      "--border-gray": "#803342",
      "--danger-red": "#FF3C3C",
      "--input-bg": "#3D1C28",
      "--input-text": "#FFFFFF",
      "--input-placeholder": "#FFBBC2",
      "--send-btn-bg": "#95132C",
      "--send-btn-text": "#FFFFFF",
      "--highlight": "#A6314F",
      "--new-chat-bg": "#95132C",
      "--new-chat-hover": "#B71C3C"
    }
  },
  cactus: {
    light: {
      "--primary": "#88B04B",
      "--deep-indigo": "#A8D5BA",
      "--neon-violet": "#B2CDA2",
      "--cool-cyan": "#F0F8ED",
      "--background-dark": "#F3F3EF",
      "--surface-dim": "#EBF1E7",
      "--surface-hover": "#DDE8D5",
      "--text-primary": "#1A1A1A",
      "--text-secondary": "#607D3B",
      "--border-gray": "#C7DDB5",
      "--danger-red": "#FF6F61",
      "--input-bg": "#EBF1E7",
      "--input-text": "#1A1A1A",
      "--input-placeholder": "#607D3B",
      "--send-btn-bg": "#88B04B",
      "--send-btn-text": "#FFFFFF",
      "--highlight": "#DAF4C9",
      "--new-chat-bg": "#88B04B",
      "--new-chat-hover": "#A0C464"
    },
    dark: {
      "--primary": "#88B04B",
      "--deep-indigo": "#6A8E7F",
      "--neon-violet": "#A8D5BA",
      "--cool-cyan": "#DCE8D5",
      "--background-dark": "#2A363B",
      "--surface-dim": "#262323",
      "--surface-hover": "#464436",
      "--text-primary": "#FFFFFF",
      "--text-secondary": "#C3C3C3",
      "--border-gray": "#6A8E7F",
      "--danger-red": "#94463C",
      "--input-bg": "#464436",
      "--input-text": "#FFFFFF",
      "--input-placeholder": "#C3C3C3",
      "--send-btn-bg": "#88B04B",
      "--send-btn-text": "#FFFFFF",
      "--highlight": "#92C96D",
      "--new-chat-bg": "#A0C464",
      "--new-chat-hover": "#B7D77B"
    }
  },
  batman: {
    light: {
      "--primary": "#888888",
      "--deep-indigo": "#666666",
      "--neon-violet": "#BBBBBB",
      "--cool-cyan": "#DDDDDD",
      "--background-dark": "#F2F2F2",
      "--surface-dim": "#E6E6E6",
      "--surface-hover": "#CCCCCC",
      "--text-primary": "#111111",
      "--text-secondary": "#444444",
      "--border-gray": "#BBBBBB",
      "--danger-red": "#888888",
      "--input-bg": "#E6E6E6",
      "--input-text": "#111111",
      "--input-placeholder": "#888888",
      "--send-btn-bg": "#888888",
      "--send-btn-text": "#FFFFFF",
      "--highlight": "#DDDDDD",
      "--new-chat-bg": "#AAAAAA",
      "--new-chat-hover": "#BBBBBB"
    },
    dark: {
      "--primary": "#888888",
      "--deep-indigo": "#333333",
      "--neon-violet": "#444444",
      "--cool-cyan": "#FFFFFF",
      "--background-dark": "#111111",
      "--surface-dim": "#1A1A1A",
      "--surface-hover": "#333333",
      "--text-primary": "#FFFFFF",
      "--text-secondary": "#CCCCCC",
      "--border-gray": "#444444",
      "--danger-red": "#888888",
      "--input-bg": "#1A1A1A",
      "--input-text": "#FFFFFF",
      "--input-placeholder": "#CCCCCC",
      "--send-btn-bg": "#444444",
      "--send-btn-text": "#FFFFFF",
      "--highlight": "#555555",
      "--new-chat-bg": "#666666",
      "--new-chat-hover": "#888888"
    }
  }
};

export function applyTheme(themeName, mode = "dark") {
  const themeSet = themes[themeName];
  const theme = themeSet?.[mode];
  if (!theme) return;
  for (const key in theme) {
    document.documentElement.style.setProperty(key, theme[key]);
  }
  localStorage.setItem("selected-theme", themeName);
  localStorage.setItem("selected-mode", mode);
}

export function loadStoredTheme() {
  const savedTheme = localStorage.getItem("selected-theme") || "default";
  const savedMode = localStorage.getItem("selected-mode") || "dark";
  applyTheme(savedTheme, savedMode);
}

export const themeList = Object.keys(themes);
