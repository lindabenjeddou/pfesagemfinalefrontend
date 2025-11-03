import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

export default function ThemeSwitcher() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      style={{
        position: "relative",
        width: 56,
        height: 28,
        borderRadius: 999,
        border: "none",
        background: isDark
          ? "linear-gradient(135deg, #1e293b, #334155)"
          : "linear-gradient(135deg, #0078d4, #003061)",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: isDark
          ? "0 4px 12px rgba(0, 0, 0, 0.3)"
          : "0 4px 12px rgba(0, 120, 212, 0.3)",
        padding: 3,
      }}
      title={isDark ? "Mode clair" : "Mode sombre"}
    >
      <div
        style={{
          position: "absolute",
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#fff",
          transition: "all 0.3s ease",
          left: isDark ? "calc(100% - 25px)" : "3px",
          top: "3px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <span style={{ fontSize: 12 }}>
          {isDark ? "🌙" : "☀️"}
        </span>
      </div>
    </button>
  );
}
