"use client";

import React, { useState, useEffect } from "react";

const TOAST_EVENT = "bluebird_toast_event";

/**
 * Imperative toast function compatible with Bluebird JS API
 */
export function toast(options = {}) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: options }));
  }
}

/**
 * Toast Container component managing active toast notifications
 */
export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToastEvent = (e) => {
      const detail = e.detail || {};
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      const newToast = {
        id,
        title: detail.title || "",
        description: detail.description || "",
        type: detail.type || "info",
        position: detail.position || "bottom-right",
        duration: detail.duration !== undefined ? detail.duration : 4000,
        dismissing: false,
      };

      setToasts((prev) => [...prev, newToast]);

      if (newToast.duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, newToast.duration);
      }
    };

    window.addEventListener(TOAST_EVENT, handleToastEvent);
    return () => window.removeEventListener(TOAST_EVENT, handleToastEvent);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, dismissing: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  };

  // Group toasts by position
  const positions = ["bottom-right", "bottom-left", "top-right", "top-left", "top-center", "bottom-center"];
  
  return (
    <>
      {positions.map((pos) => {
        const posToasts = toasts.filter((t) => t.position === pos);
        if (posToasts.length === 0) return null;

        return (
          <div key={pos} className={`toast-container ${pos}`}>
            {posToasts.map((t) => (
              <div
                key={t.id}
                className={`toast toast-${t.type}`}
                style={
                  t.dismissing
                    ? { opacity: 0, transform: "translateY(-10px) scale(0.95)", transition: "all 0.2s ease" }
                    : {}
                }
              >
                <div className="toast-content">
                  {t.title && <div className="toast-title">{t.title}</div>}
                  {t.description && <div className="toast-description">{t.description}</div>}
                </div>
                <button
                  className="toast-close"
                  aria-label="Dismiss"
                  onClick={() => dismissToast(t.id)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
}
