"use client";

import React, { useState, useEffect } from "react";

export function useTheme() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.setAttribute("data-theme", storedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  return { theme, toggleTheme, setTheme };
}

export function ThemeToggle({ className = "", children, ...props }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={`outline ${className}`}
      onClick={toggleTheme}
      {...props}
    >
      {children || (theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode")}
    </button>
  );
}
