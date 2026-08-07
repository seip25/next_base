"use client";

import React, { useState, useEffect } from "react";

const SNACKBAR_EVENT = "bluebird_snackbar_event";

/**
 * Imperative snackbar function compatible with Bluebird JS API
 */
export function snackbar(options = {}) {
  const opts = typeof options === "string" ? { message: options } : options;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SNACKBAR_EVENT, { detail: opts }));
  }
}

/**
 * Snackbar Container component
 */
export function SnackbarContainer() {
  const [activeSnackbar, setActiveSnackbar] = useState(null);

  useEffect(() => {
    let timer;

    const handleSnackbarEvent = (e) => {
      const detail = e.detail || {};
      const config = {
        message: detail.message || "",
        type: detail.type || "info",
        duration: detail.duration || 3000,
        show: true,
      };

      setActiveSnackbar(config);

      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setActiveSnackbar((prev) => (prev ? { ...prev, show: false } : null));
      }, config.duration);
    };

    window.addEventListener(SNACKBAR_EVENT, handleSnackbarEvent);
    return () => {
      window.removeEventListener(SNACKBAR_EVENT, handleSnackbarEvent);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!activeSnackbar || !activeSnackbar.show) return null;

  return (
    <div
      id="snackbar"
      className={`show ${activeSnackbar.type}`}
    >
      {activeSnackbar.message}
    </div>
  );
}
