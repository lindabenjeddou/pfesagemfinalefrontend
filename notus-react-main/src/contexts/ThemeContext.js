import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggle = () => setIsDark(!isDark);

  const colors = isDark ? {
    // Dark theme
    background: "#0f172a",
    backgroundSecondary: "#1e293b",
    cardBackground: "rgba(30, 41, 59, 0.95)",
    text: "#f1f5f9",
    textSecondary: "#cbd5e1",
    textTertiary: "#94a3b8",
    border: "#334155",
    primary: "#3b82f6",
    primaryHover: "#2563eb",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    shadow: "0 8px 24px rgba(0, 0, 0, 0.4)"
  } : {
    // Light theme
    background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
    backgroundSecondary: "#ffffff",
    cardBackground: "rgba(255, 255, 255, 0.96)",
    text: "#0f172a",
    textSecondary: "#475569",
    textTertiary: "#64748b",
    border: "#e2e8f0",
    primary: "#0078d4",
    primaryHover: "#003061",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    shadow: "0 8px 22px rgba(0, 48, 97, 0.12)"
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggle, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
